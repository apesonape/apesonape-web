#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const publicDir = path.join(projectRoot, 'public');
const outFile = path.join(publicDir, 'collection-manifest.json');

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_DRIVE_API_KEY || process.env.GOOGLE_DRIVE_API_KEY || '';
const FOLDER_ID = process.env.NEXT_PUBLIC_GOOGLE_DRIVE_FOLDER_ID || process.env.GOOGLE_DRIVE_FOLDER_ID || '';

if (!API_KEY || !FOLDER_ID) {
  console.error('Missing env: NEXT_PUBLIC_GOOGLE_DRIVE_API_KEY and NEXT_PUBLIC_GOOGLE_DRIVE_FOLDER_ID');
  process.exit(1);
}

async function listFolder() {
  const q = encodeURIComponent(`'${FOLDER_ID}' in parents and trashed=false`);
  const fields = encodeURIComponent('files(id,name,thumbnailLink)');
  const base = 'https://www.googleapis.com/drive/v3/files';
  const params = `q=${q}&fields=${fields}&orderBy=name_natural&pageSize=1000&supportsAllDrives=true&includeItemsFromAllDrives=true&key=${API_KEY}`;
  const url = `${base}?${params}`;

  const resp = await fetch(url);
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Drive list failed: ${text}`);
  }
  const data = await resp.json();
  return (data.files || []).filter(f => f && f.id && f.name);
}

function buildManifest(files) {
  const entries = [];
  for (const f of files) {
    const baseName = f.name.replace(/\.[^/.]+$/, '');
    if (!/^\d+$/.test(baseName)) continue; // only numeric filenames
    const tokenId = baseName;
    const thumb = f.thumbnailLink ? f.thumbnailLink.replace('=s220', '=s512') : `https://lh3.googleusercontent.com/d/${f.id}=s512`;
    const image = `https://lh3.googleusercontent.com/d/${f.id}=s1600`;
    entries.push({ tokenId, thumb, image });
  }
  entries.sort((a, b) => parseInt(a.tokenId, 10) - parseInt(b.tokenId, 10));
  return entries;
}

async function main() {
  try {
    const files = await listFolder();
    const manifest = buildManifest(files);
    if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
    fs.writeFileSync(outFile, JSON.stringify(manifest, null, 2));
    console.log(`Wrote ${manifest.length} entries to ${path.relative(projectRoot, outFile)}`);
  } catch (e) {
    console.error(e.message || e);
    process.exit(1);
  }
}

main();


