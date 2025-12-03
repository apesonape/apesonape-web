#!/usr/bin/env node
/**
 * Build and upload 512px WebP thumbnails for the collection images.
 *
 * Sources images from:
 * - tokens.json (if provided via --tokensPath), using the "image" field, OR
 * - IPFS metadata by CID (via --cid, --count), fetching <cid>/<id>.json and reading image/image_url.
 *
 * Uploads to Supabase Storage:
 *   bucket: --bucket (default: collection)
 *   path:   <prefix>/<id>.webp  where prefix defaults to "collection-thumbs"
 *
 * Auth (environment variables):
 *   SUPABASE_URL=https://<project>.supabase.co
 *   SERVICE_ROLE_KEY=<service role key>   (do NOT commit this)
 *
 * Usage examples:
 *   node scripts/build-collection-thumbs.mjs --tokensPath ./collection-index/tokens.json
 *   node scripts/build-collection-thumbs.mjs --cid bafy... --count 10000
 *
 * Optional flags:
 *   --bucket collection
 *   --prefix collection-thumbs
 *   --width 512
 *   --concurrency 8
 *   --overwrite true
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';

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
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SERVICE_ROLE_KEY = process.env.SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SERVICE_ROLE_KEY in environment.');
  process.exit(1);
}

const bucket = String(args.bucket || 'collection');
const prefix = String(args.prefix || 'collection-thumbs').replace(/^\/+|\/+$/g, '');
const width = Number(args.width || 512);
const concurrency = Number(args.concurrency || Math.max(4, Math.min(16, os.cpus().length)));
const overwrite = String(args.overwrite || 'false').toLowerCase() === 'true';

const tokensPath = args.tokensPath ? path.resolve(process.cwd(), String(args.tokensPath)) : '';
const imagesDir = args.imagesDir ? path.resolve(process.cwd(), String(args.imagesDir)) : '';
const CID = String(args.cid || process.env.CID || '').trim();
const COUNT = Number(args.count || process.env.COUNT || (tokensPath ? 0 : 10000));

const IPFS_GATEWAYS = [
  process.env.NEXT_PUBLIC_PINATA_SUBDOMAIN_GATEWAY || 'https://moccasin-brilliant-silkworm-382.mypinata.cloud/ipfs',
  'https://gateway.pinata.cloud/ipfs',
  'https://cloudflare-ipfs.com/ipfs',
  'https://ipfs.io/ipfs',
  'https://nftstorage.link/ipfs',
  'https://dweb.link/ipfs',
];

function toIpfsPathCandidates(input) {
  if (!input) return [];
  try {
    // Local file path
    if (!/^https?:\/\//i.test(input) && !input.startsWith('ipfs://') && !/^(Qm|bafy)/.test(input)) {
      return [input];
    }
    if (/^https?:\/\//i.test(input)) {
      const idx = input.indexOf('/ipfs/');
      if (idx !== -1) {
        const suffix = input.slice(idx + '/ipfs/'.length);
        return IPFS_GATEWAYS.map(g => `${g}/${suffix}`);
      }
      return [input];
    }
    if (input.startsWith('ipfs://')) {
      const suffix = input.replace('ipfs://', '');
      return IPFS_GATEWAYS.map(g => `${g}/${suffix}`);
    }
    if (/^(Qm[A-Za-z0-9]+|bafy[A-Za-z0-9]+)(\/.*)?$/.test(input)) {
      return IPFS_GATEWAYS.map(g => `${g}/${input}`);
    }
    return [input];
  } catch {
    return [input];
  }
}

async function fetchWithFallback(urls) {
  let lastErr;
  for (const u of urls) {
    try {
      // Local file path
      if (!/^https?:\/\//i.test(u)) {
        const buf = fs.readFileSync(u);
        return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
      }
      const res = await fetch(u, { cache: 'no-store' });
      if (res.ok) return await res.arrayBuffer();
      lastErr = new Error(`HTTP ${res.status} ${res.statusText} for ${u}`);
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error('All sources failed');
}

async function fetchMetaById(id) {
  if (!CID) throw new Error('CID required to fetch metadata');
  const urls = IPFS_GATEWAYS.map(g => `${g}/${CID}/${id}.json`);
  const ab = await fetchWithFallback(urls);
  const text = Buffer.from(ab).toString('utf-8');
  return JSON.parse(text);
}

async function readTokensList() {
  // Prefer local images directory if provided
  if (imagesDir && fs.existsSync(imagesDir)) {
    const files = fs.readdirSync(imagesDir);
    const items = [];
    for (const f of files) {
      const ext = path.extname(f).toLowerCase();
      if (!['.png', '.jpg', '.jpeg', '.webp'].includes(ext)) continue;
      const base = path.basename(f, ext);
      const id = Number.parseInt(base, 10);
      if (Number.isNaN(id)) continue;
      items.push({ id, image: path.join(imagesDir, f) });
    }
    items.sort((a, b) => a.id - b.id);
    console.log(`Using local imagesDir: ${imagesDir} (${items.length} files matched)`);
    if (items.length === 0) {
      console.warn('No images found in imagesDir. Ensure files are named like 0.png, 1.jpg, ...');
    }
    return items;
  }
  if (tokensPath && fs.existsSync(tokensPath)) {
    const raw = fs.readFileSync(tokensPath, 'utf-8');
    const arr = JSON.parse(raw);
    return arr.map(t => ({ id: Number(t.id), image: String(t.image || '').trim() }));
  }
  if (!CID) throw new Error('Provide --tokensPath or --cid');
  const items = [];
  for (let i = 0; i < COUNT; i++) {
    items.push({ id: i, image: '' });
  }
  return items;
}

async function ensureImageUrlFor(token) {
  if (token.image) return token.image;
  const meta = await fetchMetaById(token.id);
  return String(meta?.image || meta?.image_url || '').trim();
}

async function toWebpThumb(buffer, widthPx) {
  return await sharp(buffer).resize({ width: widthPx, withoutEnlargement: true }).webp({ quality: 80 }).toBuffer();
}

async function main() {
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const tokens = await readTokensList();
  const total = tokens.length || COUNT;
  let processed = 0;

  async function processOne(token) {
    const id = token.id;
    try {
      const imageUrl = await ensureImageUrlFor(token);
      const candidates = toIpfsPathCandidates(imageUrl);
      if (candidates.length === 0) throw new Error('No image url');
      const ab = await fetchWithFallback(candidates);
      const srcBuf = Buffer.from(ab);
      const webp = await toWebpThumb(srcBuf, width);

      const objectPath = `${prefix}/${id}.webp`;
      const uploadOpts = {
        cacheControl: '31536000',
        contentType: 'image/webp',
        upsert: overwrite,
      };
      // Check if exists when not overwriting
      if (!overwrite) {
        const { data: existsData } = await supabase.storage.from(bucket).list(prefix, { search: `${id}.webp` });
        if (Array.isArray(existsData) && existsData.some(e => e.name === `${id}.webp`)) {
          processed++;
          if (processed % 100 === 0) console.log(`... ${processed}/${total}`);
          return;
        }
      }
      const { error } = await supabase.storage.from(bucket).upload(objectPath, webp, uploadOpts);
      if (error && !String(error.message || '').toLowerCase().includes('exists')) {
        throw error;
      }
      processed++;
      if (processed % 50 === 0) console.log(`... ${processed}/${total}`);
    } catch (e) {
      processed++;
      console.warn(`Token ${id} failed: ${e?.message || e}`);
    }
  }

  // Concurrency
  let index = 0;
  await Promise.all(
    Array.from({ length: concurrency }).map(async () => {
      while (index < tokens.length) {
        const current = tokens[index++];
        // If tokensPath not provided and image empty, fetch meta lazily
        await processOne(current);
      }
    })
  );

  console.log(`Done. Uploaded thumbnails to ${bucket}/${prefix}/`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});


