#!/usr/bin/env node
/**
 * Build collection indices from an IPFS metadata CID.
 * Outputs:
 * - tokens.json: [{ id, image, attributes }]
 * - traits.json: { types, valuesByType, counts }
 * - traitIndex.json: { [type]: { [value]: [tokenIds...] } }
 * - pages/{k}.json: arrays of tokenIds (page-sized)
 *
 * Usage:
 *   node scripts/build-collection-index.mjs --cid <CID> [--count 10000] [--pageSize 200] [--out ./collection-index]
 *
 * Optional env:
 *   NEXT_PUBLIC_PINATA_SUBDOMAIN_GATEWAY
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

// Simple args parser
function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (!next || next.startsWith('--')) {
        args[key] = true;
      } else {
        args[key] = next;
        i++;
      }
    }
  }
  return args;
}

const args = parseArgs(process.argv);
// Accept CID from CLI flag or environment variable
const CID = String(args.cid || process.env.CID || process.env.NEXT_PUBLIC_DEFAULT_METADATA_CID || '').trim();
const TOTAL = Number(args.count || process.env.COUNT || 10000);
const PAGE_SIZE = Number(args.pageSize || process.env.PAGE_SIZE || 200);
const OUT_DIR = String(args.out || process.env.OUT_DIR || path.join(process.cwd(), 'collection-index'));
if (!CID) {
  console.error('Missing --cid <CID>');
  process.exit(1);
}

const IPFS_GATEWAYS = [
  process.env.NEXT_PUBLIC_PINATA_SUBDOMAIN_GATEWAY || 'https://moccasin-brilliant-silkworm-382.mypinata.cloud/ipfs',
  'https://gateway.pinata.cloud/ipfs',
  'https://cloudflare-ipfs.com/ipfs',
  'https://ipfs.io/ipfs',
  'https://nftstorage.link/ipfs',
  'https://dweb.link/ipfs',
];

async function fetchWithGateways(pathSuffix, options = {}) {
  let lastErr;
  for (const base of IPFS_GATEWAYS) {
    const url = `${base}/${pathSuffix}`;
    try {
      const res = await fetch(url, { cache: 'no-store', ...options });
      if (res.ok) return res;
      lastErr = new Error(`HTTP ${res.status} ${res.statusText} for ${url}`);
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error('All gateways failed');
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// Concurrency-limited mapper
async function mapLimit(items, limit, mapper) {
  const results = new Array(items.length);
  let index = 0;
  let active = 0;
  let rejectFn;
  const errorPromise = new Promise((_, reject) => (rejectFn = reject));

  return await Promise.race([
    (async () => {
      return await new Promise((resolve) => {
        const next = () => {
          while (active < limit && index < items.length) {
            const i = index++;
            active++;
            Promise.resolve(mapper(items[i], i))
              .then((val) => {
                results[i] = val;
                active--;
                if (index === items.length && active === 0) {
                  resolve(results);
                } else {
                  next();
                }
              })
              .catch((err) => {
                rejectFn(err);
              });
          }
        };
        next();
      });
    })(),
    errorPromise
  ]);
}

async function main() {
  const t0 = Date.now();
  console.log(`Building indices for CID ${CID} (count=${TOTAL}, pageSize=${PAGE_SIZE})`);
  ensureDir(OUT_DIR);
  ensureDir(path.join(OUT_DIR, 'pages'));

  const ids = Array.from({ length: TOTAL }, (_, i) => i);
  const concurrency = Math.max(2, Math.min(16, os.cpus().length));

  const tokens = [];
  const traitIndex = {}; // { [type]: { [value]: Set(tokenIds) } }
  const valuesByType = {}; // { [type]: Set(values) }
  const counts = {}; // { [type]: { [value]: number } }

  function addTrait(tokenId, type, value) {
    if (!type || !value) return;
    if (!traitIndex[type]) traitIndex[type] = {};
    if (!traitIndex[type][value]) traitIndex[type][value] = new Set();
    traitIndex[type][value].add(tokenId);
    if (!valuesByType[type]) valuesByType[type] = new Set();
    valuesByType[type].add(value);
    if (!counts[type]) counts[type] = {};
    counts[type][value] = (counts[type][value] || 0) + 1;
  }

  // Fetch metadata with retries/backoff per token
  async function fetchTokenMeta(id) {
    const pathSuffix = `${CID}/${id}.json`;
    const maxAttempts = 4;
    let delay = 300;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const res = await fetchWithGateways(pathSuffix);
        const json = await res.json();
        return json;
      } catch (e) {
        if (attempt === maxAttempts) throw e;
        await sleep(delay);
        delay *= 2;
      }
    }
  }

  await mapLimit(ids, concurrency, async (id, i) => {
    if (i % 100 === 0) {
      console.log(`... ${i}/${TOTAL}`);
    }
    try {
      const meta = await fetchTokenMeta(id);
      const image = String(meta?.image || meta?.image_url || '').trim();
      const attributes = Array.isArray(meta?.attributes) ? meta.attributes : [];
      tokens.push({ id, image, attributes });
      // Record traits
      for (const a of attributes) {
        const type = String(a?.trait_type ?? a?.type ?? a?.name ?? '').trim();
        const value = String(a?.value ?? a?.trait_value ?? '').trim();
        if (type && value) addTrait(id, type, value);
      }
    } catch (e) {
      console.warn(`Token ${id} failed: ${e?.message || e}`);
      tokens.push({ id, image: '', attributes: [] });
    }
  });

  // Emit tokens.json
  const tokensPath = path.join(OUT_DIR, 'tokens.json');
  fs.writeFileSync(tokensPath, JSON.stringify(tokens, null, 2));

  // Emit traits.json
  const types = Object.keys(valuesByType).sort();
  const traitsOut = {
    types,
    valuesByType: Object.fromEntries(types.map(t => [t, Array.from(valuesByType[t]).sort()])),
    counts,
  };
  const traitsPath = path.join(OUT_DIR, 'traits.json');
  fs.writeFileSync(traitsPath, JSON.stringify(traitsOut, null, 2));

  // Emit traitIndex.json (convert Sets to arrays)
  const traitIndexOut = {};
  for (const t of Object.keys(traitIndex)) {
    traitIndexOut[t] = {};
    for (const v of Object.keys(traitIndex[t])) {
      traitIndexOut[t][v] = Array.from(traitIndex[t][v]).sort((a, b) => a - b);
    }
  }
  const traitIndexPath = path.join(OUT_DIR, 'traitIndex.json');
  fs.writeFileSync(traitIndexPath, JSON.stringify(traitIndexOut, null, 2));

  // Emit pages/*.json
  const totalPages = Math.max(1, Math.ceil(TOTAL / PAGE_SIZE));
  for (let p = 0; p < totalPages; p++) {
    const start = p * PAGE_SIZE;
    const end = Math.min(start + PAGE_SIZE, TOTAL);
    const pageIds = [];
    for (let id = start; id < end; id++) pageIds.push(id);
    const pagePath = path.join(OUT_DIR, 'pages', `${p + 1}.json`);
    fs.writeFileSync(pagePath, JSON.stringify(pageIds, null, 2));
  }

  const dt = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`Done. Wrote:
- ${tokensPath}
- ${traitsPath}
- ${traitIndexPath}
- ${path.join(OUT_DIR, 'pages')}/* (${Math.ceil(TOTAL / PAGE_SIZE)} files)
Time: ${dt}s`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


