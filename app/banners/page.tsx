'use client';

import React, { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { magicEdenAPI, type MagicEdenNFT } from '@/lib/magic-eden';
import { Download, ImagePlus, Loader2, Wand2, Plus, Minus, Palette } from 'lucide-react';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import NextImage from 'next/image';
import { useToolTracking } from '@/app/hooks/useToolTracking';

type GeneratedItem = {
  id: string;
  title: string;
  dataUrl: string;
  width: number;
  height: number;
  meta?: Record<string, unknown>;
};

const BANNER_WIDTH = 1500;
const BANNER_HEIGHT = 500;
// Prefer CDN thumbnails when available
const THUMBS_BASE = 'https://bqcrbcpmimfojnjdhvrz.supabase.co/storage/v1/object/public/collection/collection-thumbs';

type BannerStyle = 'neon' | 'mesh' | 'grid' | 'rings' | 'minimal' | 'diagonal' | 'halftone' | 'wave' | 'noise';
type BannerSettings = {
  style: BannerStyle;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  traitsTextColor?: string;
  traitsBgColor?: string;
  backgroundImageDataUrl?: string;
  socialTag?: string;
  glow: number; // 0-1
  stripeDensity: number; // 0-2
  cornerRadius: number; // 0-32
  showBrandCorner: boolean;
  showSubtitle: boolean;
  showTraits: boolean;
  frameBorder: number; // fixed default in code; control removed from UI
  showWebsite: boolean;
  websiteText: string;
  websiteColor: string;
  websiteOpacity: number; // 0-1
  websiteSize: number; // 12-24
};

function hashStringToSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 0xffffffff;
}

function createSeededRandom(seed: number) {
  let s = seed * 1_000_000 + 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    const t = (s >>> 0) / 0xffffffff;
    return t;
  };
}

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const bigint = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function drawBackground(ctx: CanvasRenderingContext2D, rng: () => number, s: BannerSettings) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  ctx.clearRect(0, 0, w, h);
  const primary = s.primaryColor;
  const secondary = s.secondaryColor;
  const accent = s.accentColor;
  const glow = Math.max(0, Math.min(1, s.glow));
  const base = s.backgroundColor;

  // If a background image is provided, paint it first
  if (s.backgroundImageDataUrl) {
    const img = new Image();
    img.src = s.backgroundImageDataUrl;
    // Synchronous usage warning: the caller should re-render after load via state change.
    // Here we draw only if cached; otherwise the subsequent generate call will capture it.
    if (img.complete) {
      ctx.drawImage(img, 0, 0, w, h);
    } else {
      img.onload = () => {
        ctx.drawImage(img, 0, 0, w, h);
      };
    }
  } else {
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, w, h);
  }

  if (s.style === 'neon') {
    const gradient = ctx.createLinearGradient(0, 0, w, h);
    gradient.addColorStop(0, hexToRgba(primary, 0.2));
    gradient.addColorStop(0.6, hexToRgba(secondary, 0.18));
    gradient.addColorStop(1, 'rgba(0,0,0,1)');
    if (!s.backgroundImageDataUrl) {
      ctx.fillStyle = base;
      ctx.fillRect(0, 0, w, h);
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
    // glows
    const count = 3 + Math.floor(rng() * 3);
    for (let i = 0; i < count; i++) {
      const gx = rng() * w;
      const gy = rng() * h;
      const gr = 200 + rng() * 400;
      const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr);
      g.addColorStop(0, hexToRgba(accent, 0.18 * glow));
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(gx, gy, gr, 0, Math.PI * 2);
      ctx.fill();
    }
    // stripes
    ctx.save();
    ctx.globalAlpha = 0.08 + 0.06 * glow;
    const stripes = Math.max(0, Math.floor(8 * (1 + s.stripeDensity)));
    for (let i = 0; i < stripes; i++) {
      const y = (i / (stripes || 1)) * h;
      ctx.fillStyle = i % 2 === 0 ? hexToRgba(primary, 0.5) : hexToRgba(secondary, 0.5);
      ctx.fillRect(0, y, w, 1);
    }
    ctx.restore();
    return;
  }

  if (s.style === 'mesh') {
    if (!s.backgroundImageDataUrl) {
      ctx.fillStyle = base;
      ctx.fillRect(0, 0, w, h);
    }
    const blobs = 6 + Math.floor(rng() * 6);
    for (let i = 0; i < blobs; i++) {
      const gx = rng() * w;
      const gy = rng() * h;
      const gr = 150 + rng() * 350;
      const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr);
      const col = i % 2 === 0 ? primary : secondary;
      g.addColorStop(0, hexToRgba(col, 0.18 * (0.5 + glow * 0.5)));
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(gx, gy, gr, 0, Math.PI * 2);
      ctx.fill();
    }
    return;
  }

  if (s.style === 'grid') {
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, w, h);
    const step = 24 - Math.floor(s.stripeDensity * 8);
    ctx.strokeStyle = hexToRgba(secondary, 0.12 + 0.1 * glow);
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= w; x += step) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
    }
    for (let y = 0; y <= h; y += step) {
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
    }
    ctx.stroke();
    // vignette
    const v = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) / 4, w / 2, h / 2, Math.max(w, h));
    v.addColorStop(0, 'rgba(0,0,0,0)');
    v.addColorStop(1, 'rgba(0,0,0,0.6)');
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, w, h);
    return;
  }

  if (s.style === 'rings') {
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = hexToRgba(primary, 0.18 + 0.12 * glow);
    ctx.lineWidth = 2;
    const cx = w * 0.7;
    const cy = h * 0.4;
    for (let r = 40; r < Math.max(w, h); r += 24 - s.stripeDensity * 6) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    // accent sweep
    const sweep = ctx.createLinearGradient(0, 0, w, h);
    sweep.addColorStop(0, hexToRgba(accent, 0.12));
    sweep.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = sweep;
    ctx.fillRect(0, 0, w, h);
    return;
  }

  // minimal
  const g2 = ctx.createLinearGradient(0, 0, w, h);
  g2.addColorStop(0, hexToRgba(primary, 0.12));
  g2.addColorStop(1, hexToRgba(secondary, 0.04));
  if (!s.backgroundImageDataUrl) {
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, w, h);
  }
  ctx.fillStyle = g2;
  ctx.fillRect(0, 0, w, h);

  if (s.style === 'diagonal') {
    const step = 28 - Math.floor(s.stripeDensity * 8);
    ctx.save();
    ctx.translate(0, h * 0.2);
    ctx.rotate((-15 * Math.PI) / 180);
    for (let i = -h; i < w + h; i += step) {
      ctx.fillStyle = i % (step * 2) === 0 ? hexToRgba(primary, 0.12 + 0.1 * s.glow) : hexToRgba(secondary, 0.08);
      ctx.fillRect(i, -h, 12, h * 3);
    }
    ctx.restore();
    return;
  }

  if (s.style === 'halftone') {
    if (!s.backgroundImageDataUrl) {
      ctx.fillStyle = base;
      ctx.fillRect(0, 0, w, h);
    }
    const spacing = 22 - Math.floor(s.stripeDensity * 6);
    for (let y = 0; y < h; y += spacing) {
      for (let x = 0; x < w; x += spacing) {
        const t = (x / w + y / h) / 2;
        const r = 3 + 5 * t * s.glow;
        ctx.beginPath();
        ctx.fillStyle = t < 0.5 ? hexToRgba(primary, 0.18) : hexToRgba(secondary, 0.14);
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    return;
  }

  if (s.style === 'wave') {
    if (!s.backgroundImageDataUrl) {
      ctx.fillStyle = base;
      ctx.fillRect(0, 0, w, h);
    }
    const lines = 8 + Math.floor(s.stripeDensity * 6);
    for (let i = 0; i < lines; i++) {
      const yBase = (i / (lines - 1)) * h;
      ctx.beginPath();
      ctx.strokeStyle = i % 2 === 0 ? hexToRgba(primary, 0.18) : hexToRgba(secondary, 0.14);
      ctx.lineWidth = 2;
      for (let x = 0; x <= w; x += 6) {
        const y = yBase + Math.sin((x / 80) + i) * (14 + s.glow * 20);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    return;
  }

  if (s.style === 'noise') {
    if (!s.backgroundImageDataUrl) {
      ctx.fillStyle = base;
      ctx.fillRect(0, 0, w, h);
    }
    const count = Math.floor(6000 * (0.4 + s.stripeDensity * 0.6));
    for (let i = 0; i < count; i++) {
      const x = rng() * w;
      const y = rng() * h;
      const a = 0.06 + rng() * 0.08 * s.glow;
      ctx.fillStyle = rng() > 0.5 ? hexToRgba(primary, a) : hexToRgba(secondary, a);
      ctx.fillRect(x, y, 1, 1);
    }
    return;
  }
}

type NormalizedTrait = { key: string; value: string; rarityPercent?: number };

function normalizeTraits(input: unknown): NormalizedTrait[] {
  if (!Array.isArray(input)) return [];
  const out: NormalizedTrait[] = [];
  for (const t of input as Array<Record<string, unknown>>) {
    const key = (t.trait_type as string) || (t.name as string) || '';
    const value = (t.value as string) || '';
    if (!key && !value) continue;
    // Filter trivial/empty values and anything containing "ape"
    const keyLower = String(key).toLowerCase();
    const valueLower = String(value).toLowerCase();
    if (String(value).trim().length === 0) continue;
    if (keyLower.includes('ape') || valueLower.includes('ape')) continue;

    // Try to extract a rarity percentage if present on the trait object
    let rarityPercent: number | undefined = undefined;
    const rawRarity = (t.rarity as number) ?? (t.rarityPercent as number) ?? (t.percent as number) ?? (t.percentage as number);
    if (typeof rawRarity === 'number' && isFinite(rawRarity)) {
      if (rawRarity > 0 && rawRarity <= 1) {
        rarityPercent = rawRarity * 100;
      } else if (rawRarity > 1 && rawRarity <= 100) {
        rarityPercent = rawRarity;
      }
    }

    out.push({ key: String(key), value: String(value), rarityPercent });
  }
  // De-duplicate by key+value
  const seen = new Set<string>();
  const unique: NormalizedTrait[] = [];
  for (const t of out) {
    const k = `${t.key}:${t.value}`.toLowerCase();
    if (!seen.has(k)) {
      seen.add(k);
      unique.push(t);
    }
  }
  return unique;
}

function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const radius = Math.min(r, h / 2, w / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawTraitChips(
  ctx: CanvasRenderingContext2D,
  rng: () => number,
  traits: NormalizedTrait[],
  startX: number,
  startY: number,
  maxWidth: number,
  override?: { text?: string; bg?: string }
) {
  if (traits.length === 0) return;
  const lineHeight = 38;
  let x = startX;
  let y = startY;

  ctx.font = '600 16px system-ui, Segoe UI, Arial';
  for (const t of traits) {
    const label = t.value || t.key;
    const percentText = typeof t.rarityPercent === 'number' ? `${Math.max(0, Math.min(100, t.rarityPercent)).toFixed(1)}%` : '';
    const labelWidth = ctx.measureText(label).width;
    const percentWidth = percentText ? ctx.measureText(percentText).width + 10 : 0; // small gap
    const paddingX = 14;
    const chipW = Math.min(maxWidth, Math.ceil(labelWidth + percentWidth) + paddingX * 2);
    if (x + chipW > startX + maxWidth) {
      // wrap
      x = startX;
      y += lineHeight + 8;
    }

    // Colors
    let hue: number;
    let borderAlpha = 0.5;
    let topAlpha = 0.22;
    let bottomAlpha = 0.12;
    if (typeof t.rarityPercent === 'number') {
      const p = t.rarityPercent;
      if (p <= 1) { // legendary
        hue = 48; // gold
      } else if (p <= 5) { // epic
        hue = 296; // fuchsia
      } else if (p <= 10) { // rare
        hue = 190; // cyan-ish
      } else if (p <= 20) { // uncommon
        hue = 150; // green-ish
      } else {
        hue = 210; // slate/blue-ish
        topAlpha = 0.12;
        bottomAlpha = 0.08;
        borderAlpha = 0.35;
      }
    } else {
      // Stable color based on label hash
      const seed = hashStringToSeed(label);
      hue = Math.floor(170 + seed * 40);
    }
    let bg: CanvasGradient | string;
    if (override?.bg) {
      bg = override.bg;
    } else {
      const g = ctx.createLinearGradient(x, y, x, y + lineHeight);
      g.addColorStop(0, `hsla(${hue}, 85%, 50%, ${topAlpha})`);
      g.addColorStop(1, `hsla(${hue}, 85%, 40%, ${bottomAlpha})`);
      bg = g;
    }

    // Shadow glow
    ctx.save();
    ctx.shadowColor = `hsla(${hue}, 85%, 60%, 0.35)`;
    ctx.shadowBlur = 10;
    ctx.fillStyle = bg;
    drawRoundedRect(ctx, x, y, chipW, lineHeight, 12);
    ctx.fill();
    ctx.restore();

    // Border
    ctx.strokeStyle = `hsla(${hue}, 85%, 60%, ${borderAlpha})`;
    ctx.lineWidth = 1;
    drawRoundedRect(ctx, x + 0.5, y + 0.5, chipW - 1, lineHeight - 1, 11);
    ctx.stroke();

    // Text
    ctx.fillStyle = override?.text || 'rgba(240, 249, 255, 0.95)';
    ctx.fillText(label, x + paddingX, y + lineHeight / 2 + 5);
    if (percentText) {
      ctx.font = '600 12px system-ui, Segoe UI, Arial';
      ctx.fillStyle = 'rgba(226, 232, 240, 0.85)';
      ctx.fillText(percentText, x + chipW - paddingX - ctx.measureText(percentText).width, y + lineHeight / 2 + 4);
      ctx.font = '600 16px system-ui, Segoe UI, Arial';
    }

    x += chipW + 10;
  }
}

function getIpfsCidPathFromUrl(input: string): string | null {
  if (!input) return null;
  if (input.startsWith('ipfs://')) return input.replace('ipfs://', '');
  const idx = input.indexOf('/ipfs/');
  if (idx !== -1) return input.substring(idx + 6);
  return null;
}

function proxyForCorsAbsolute(url: string, width: number = 900): string {
  try {
    const u = new URL(url);
    const proxied = new URL('https://images.weserv.nl/');
    // weserv expects host+path in url param without protocol
    proxied.searchParams.set('url', `${u.host}${u.pathname}${u.search}`.replace(/^\//, ''));
    proxied.searchParams.set('w', String(width));
    proxied.searchParams.set('n', '1');
    return proxied.toString();
  } catch {
    return url;
  }
}

function buildIpfsGatewayUrls(cidPath: string): string[] {
  const gateways = [
    'https://gateway.pinata.cloud/ipfs/',
    'https://cloudflare-ipfs.com/ipfs/',
    'https://ipfs.io/ipfs/',
    'https://dweb.link/ipfs/',
    'https://4everland.io/ipfs/',
    'https://ipfs.filebase.io/ipfs/',
  ];
  return gateways.map((g) => `${g}${cidPath}`);
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  const cidPath = getIpfsCidPathFromUrl(src);
  const candidates = cidPath ? buildIpfsGatewayUrls(cidPath) : [src];

  for (let i = 0; i < candidates.length; i++) {
    const attemptUrl = proxyForCorsAbsolute(candidates[i]);
    try {
      const el = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img as unknown as HTMLImageElement);
        img.onerror = reject;
        img.src = attemptUrl;
      });
      return el;
    } catch {
      // try next gateway
    }
  }
  // Final attempt without proxy
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img as unknown as HTMLImageElement);
    img.onerror = reject;
    img.src = src;
  });
}

async function loadImageWithFallbacks(sources: string[]): Promise<HTMLImageElement> {
  for (const s of sources) {
    try {
      const img = await loadImage(s);
      return img;
    } catch {
      // try next
    }
  }
  throw new Error('All sources failed');
}

async function renderBannerFromNFT(
  nft: MagicEdenNFT,
  opts?: { overlayText?: string; settings?: BannerSettings }
): Promise<GeneratedItem> {
  const canvas = document.createElement('canvas');
  canvas.width = BANNER_WIDTH;
  canvas.height = BANNER_HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  const rng = createSeededRandom(hashStringToSeed(nft.id));
  const settings: BannerSettings = opts?.settings || {
    style: 'neon',
    primaryColor: '#00caff',
    secondaryColor: '#00ffbf',
    accentColor: '#22d3ee',
    backgroundColor: '#030712',
    textColor: '#ffffff',
    traitsTextColor: undefined,
    traitsBgColor: undefined,
    glow: 0.8,
    stripeDensity: 1,
    cornerRadius: 18,
    showBrandCorner: true,
    showSubtitle: true,
    showTraits: true,
    frameBorder: 3,
    showWebsite: true,
    websiteText: 'apesonape.io',
    websiteColor: '#9CA3AF',
    websiteOpacity: 0.8,
    websiteSize: 18,
  };

  drawBackground(ctx, rng, settings);

  // NFT image frame
  try {
    const idStr = String(nft.id);
    const m = idStr.match(/:(\d+)$/);
    const tokenNumeric = m ? parseInt(m[1], 10) : (/^\d+$/.test(idStr) ? parseInt(idStr, 10) : NaN);
    const cdn = !isNaN(tokenNumeric) ? [`${THUMBS_BASE}/${tokenNumeric}.webp`] : [];
    const img = await loadImageWithFallbacks([nft.image, ...cdn]);
    const frameH = Math.min(480, img.height);
    const targetH = Math.min(BANNER_HEIGHT - 80, frameH);
    const targetW = Math.floor((img.width / img.height) * targetH);
    const x = 40;
    const y = Math.floor((BANNER_HEIGHT - targetH) / 2);

    // Glow behind NFT
    const glow = ctx.createRadialGradient(x + targetW / 2, y + targetH / 2, 20, x + targetW / 2, y + targetH / 2, targetW);
    glow.addColorStop(0, 'rgba(34, 211, 238, 0.35)');
    glow.addColorStop(1, 'rgba(34, 211, 238, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x + targetW / 2, y + targetH / 2, targetW, 0, Math.PI * 2);
    ctx.fill();

    // Frame
    const radius = Math.max(0, Math.min(32, settings.cornerRadius));
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + targetW - radius, y);
    ctx.quadraticCurveTo(x + targetW, y, x + targetW, y + radius);
    ctx.lineTo(x + targetW, y + targetH - radius);
    ctx.quadraticCurveTo(x + targetW, y + targetH, x + targetW - radius, y + targetH);
    ctx.lineTo(x + radius, y + targetH);
    ctx.quadraticCurveTo(x, y + targetH, x, y + targetH - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(img as unknown as CanvasImageSource, x, y, targetW, targetH);
    ctx.restore();

    // Border
    ctx.strokeStyle = hexToRgba(settings.accentColor, 0.6);
    ctx.lineWidth = Math.max(1, Math.min(8, settings.frameBorder));
    ctx.strokeRect(x + 1.5, y + 1.5, targetW - 3, targetH - 3);
  } catch {
    // Fallback text if image fails
    ctx.fillStyle = '#fca5a5';
    ctx.font = 'bold 22px system-ui, Segoe UI, Arial';
    ctx.fillText('Failed to load NFT image', 40, 60);
  }

  // Text block
  ctx.fillStyle = settings.textColor || 'rgba(255,255,255,0.95)';
  ctx.font = '700 64px system-ui, Segoe UI, Arial';
  ctx.textBaseline = 'middle';
  ctx.fillText(nft.name || 'Apes On Ape', 560, 210);
  if (settings.showSubtitle) {
    ctx.font = '500 24px system-ui, Segoe UI, Arial';
    ctx.fillStyle = settings.textColor ? hexToRgba(settings.textColor, 0.8) : 'rgba(203,213,225,0.95)';
    ctx.fillText('Apes On Ape — Apechain', 560, 260);
  }

  // Social Tag (optional)
  if ((opts?.settings?.socialTag || '').trim().length > 0) {
    const raw = opts?.settings?.socialTag as string;
    const tag = raw.startsWith('@') ? raw : `@${raw}`;
    ctx.font = '600 20px system-ui, Segoe UI, Arial';
    ctx.fillStyle = settings.textColor ? hexToRgba(settings.textColor, 0.85) : 'rgba(255,255,255,0.85)';
    ctx.fillText(tag, 560, 300);
  }

  if (opts?.overlayText) {
    ctx.font = '600 28px system-ui, Segoe UI, Arial';
    ctx.fillStyle = '#22d3ee';
    ctx.fillText(opts.overlayText, 560, 310);
  }

  // Traits chips
  const normalized = normalizeTraits((nft as unknown as { traits?: unknown }).traits);
  if (settings.showTraits && normalized.length > 0) {
    const display = normalized
      .filter((t) => t.value && t.value.toLowerCase() !== 'none');
    drawTraitChips(
      ctx,
      rng,
      display,
      560,
      350,
      BANNER_WIDTH - 600,
      {
        text: settings.traitsTextColor,
        bg: settings.traitsBgColor ? hexToRgba(settings.traitsBgColor, 0.22) : undefined,
      }
    );
  }

  // Brand corner
  if (settings.showBrandCorner) {
    ctx.fillStyle = hexToRgba(settings.accentColor, 0.2);
    ctx.beginPath();
    ctx.moveTo(BANNER_WIDTH - 200, 0);
    ctx.lineTo(BANNER_WIDTH, 0);
    ctx.lineTo(BANNER_WIDTH, 120);
    ctx.closePath();
    ctx.fill();
  }

  if (settings.showWebsite && settings.websiteText) {
    const label = settings.websiteText;
    ctx.font = `600 18px system-ui, Segoe UI, Arial`;
    const tw = ctx.measureText(label).width;
    const padding = 8;
    const bx = BANNER_WIDTH - tw - padding * 2 - 16;
    const by = BANNER_HEIGHT - 24;
    ctx.fillStyle = hexToRgba('#000000', 0.4);
    drawRoundedRect(ctx, bx, by - 16, tw + padding * 2, 26, 8);
    ctx.fill();
    ctx.fillStyle = settings.websiteColor;
    ctx.fillText(label, bx + padding, by);
  }

  const dataUrl = canvas.toDataURL('image/png');
  return {
    id: `nft-${nft.id}`,
    title: nft.name,
    dataUrl,
    width: BANNER_WIDTH,
    height: BANNER_HEIGHT,
    meta: { nftId: nft.id },
  };
}

async function renderBannerFromNFTGrid(
  nfts: MagicEdenNFT[],
  opts?: { settings?: BannerSettings; rows?: number; cols?: number }
): Promise<GeneratedItem> {
  const canvas = document.createElement('canvas');
  canvas.width = BANNER_WIDTH;
  canvas.height = BANNER_HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  const seedBase = nfts.map((n) => n.id).join('|') || 'grid';
  const rng = createSeededRandom(hashStringToSeed(seedBase));
  const settings: BannerSettings = opts?.settings || {
    style: 'neon',
    primaryColor: '#00caff',
    secondaryColor: '#00ffbf',
    accentColor: '#22d3ee',
    backgroundColor: '#030712',
    textColor: '#ffffff',
    glow: 0.8,
    stripeDensity: 1,
    cornerRadius: 18,
    showBrandCorner: true,
    showSubtitle: false,
    showTraits: false,
    frameBorder: 2,
    showWebsite: true,
    websiteText: 'apesonape.io',
    websiteColor: '#9CA3AF',
    websiteOpacity: 0.8,
    websiteSize: 18,
  };

  drawBackground(ctx, rng, settings);

  // Preload images concurrently (prefer CDN thumbs for speed)
  const images = await Promise.all(
    nfts.map(async (nft) => {
      try {
        const idStr = String(nft.id);
        const m = idStr.match(/:(\d+)$/);
        const tokenNumeric = m ? parseInt(m[1], 10) : (/^\d+$/.test(idStr) ? parseInt(idStr, 10) : NaN);
        const cdn = !isNaN(tokenNumeric) ? [`${THUMBS_BASE}/${tokenNumeric}.webp`] : [];
        // Prefer CDN first, then full image
        return await loadImageWithFallbacks([...cdn, nft.image]);
      } catch {
        return null;
      }
    })
  );

  // compute grid dims
  const count = nfts.length;
  const cols = Math.max(1, Math.floor(opts?.cols || 0)) || Math.min(5, Math.max(1, Math.ceil(Math.sqrt(count))));
  const rows = Math.max(1, Math.floor(opts?.rows || 0)) || Math.max(1, Math.ceil(count / cols));

  // Touching columns: zero inner padding, small outer margins
  const outerMarginX = 8;
  const outerMarginY = 8;
  const pad = 0;
  const areaX = outerMarginX;
  const areaY = outerMarginY;
  const areaW = BANNER_WIDTH - outerMarginX * 2;
  const areaH = BANNER_HEIGHT - outerMarginY * 2 - 56; // leave space for website label

  const cellW = Math.floor((areaW - (cols - 1) * pad) / cols);
  const cellH = Math.floor((areaH - (rows - 1) * pad) / rows);

  for (let i = 0; i < count; i++) {
    const r = Math.floor(i / cols);
    const c = i % cols;
    const x = areaX + c * (cellW + pad);
    const y = areaY + r * (cellH + pad);

    try {
      const img = images[i];
      if (!img) throw new Error('Image load failed');

      // fit image inside cell with aspect ratio
      const scale = Math.min(cellW / img.width, cellH / img.height);
      const w = Math.floor(img.width * scale);
      const h = Math.floor(img.height * scale);
      const dx = x + Math.floor((cellW - w) / 2);
      const dy = y + Math.floor((cellH - h) / 2);

      const radius = Math.max(0, Math.min(16, settings.cornerRadius));
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(dx + radius, dy);
      ctx.lineTo(dx + w - radius, dy);
      ctx.quadraticCurveTo(dx + w, dy, dx + w, dy + radius);
      ctx.lineTo(dx + w, dy + h - radius);
      ctx.quadraticCurveTo(dx + w, dy + h, dx + w - radius, dy + h);
      ctx.lineTo(dx + radius, dy + h);
      ctx.quadraticCurveTo(dx, dy + h, dx, dy + h - radius);
      ctx.lineTo(dx, dy + radius);
      ctx.quadraticCurveTo(dx, dy, dx + radius, dy);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img as unknown as CanvasImageSource, dx, dy, w, h);
      ctx.restore();

      // Border
      ctx.strokeStyle = hexToRgba(settings.accentColor, 0.5);
      ctx.lineWidth = Math.max(1, Math.min(4, settings.frameBorder));
      ctx.strokeRect(dx + 1, dy + 1, w - 2, h - 2);
    } catch {
      ctx.fillStyle = '#fca5a5';
      ctx.font = 'bold 16px system-ui, Segoe UI, Arial';
      ctx.fillText('Image failed', x + 8, y + 24);
    }
  }

  if (settings.showWebsite && settings.websiteText) {
    const label = settings.websiteText;
    ctx.font = `600 18px system-ui, Segoe UI, Arial`;
    const tw = ctx.measureText(label).width;
    const padding = 8;
    const bx = BANNER_WIDTH - tw - padding * 2 - 16;
    const by = BANNER_HEIGHT - 24;
    ctx.fillStyle = hexToRgba('#000000', 0.4);
    drawRoundedRect(ctx, bx, by - 16, tw + padding * 2, 26, 8);
    ctx.fill();
    ctx.fillStyle = settings.websiteColor;
    ctx.fillText(label, bx + padding, by);
  }

  const dataUrl = canvas.toDataURL('image/png');
  return {
    id: `nft-grid-${nfts.length}`,
    title: `AoA Banner (${nfts.length} NFTs)`,
    dataUrl,
    width: BANNER_WIDTH,
    height: BANNER_HEIGHT,
    meta: { count: nfts.length },
  };
}

export default function BannersPage() {
  // Track tool usage for gamification
  useToolTracking('banner');

  const [nftId, setNftId] = useState('');
  const [loading, setLoading] = useState<'nft' | null>(null);
  const [preview, setPreview] = useState<GeneratedItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [multiMode, setMultiMode] = useState(false);
  const [gridRows, setGridRows] = useState(1);
  const [gridCols, setGridCols] = useState(3);
  const [gridTokenIds, setGridTokenIds] = useState<string[]>([]);
  const [settings, setSettings] = useState<BannerSettings>({
    style: 'neon',
    primaryColor: '#00caff',
    secondaryColor: '#00ffbf',
    accentColor: '#22d3ee',
    backgroundColor: '#030712',
    textColor: '#ffffff',
    traitsTextColor: undefined,
    traitsBgColor: undefined,
    socialTag: '',
    glow: 0.8,
    stripeDensity: 1,
    cornerRadius: 18,
    showBrandCorner: true,
    showSubtitle: true,
    showTraits: true,
    frameBorder: 3,
    showWebsite: true,
    websiteText: 'apesonape.io',
    websiteColor: '#9CA3AF',
    websiteOpacity: 0.8,
    websiteSize: 18,
  });

  // No gallery persistence

  const handleGenerateFromNFT = useCallback(async () => {
    if (!nftId.trim()) return;
    setLoading('nft');
    setError(null);
    try {
      const nft = await magicEdenAPI.getNFTByTokenId(nftId.trim());
      if (!nft) { setError('Token ID not found for this collection.'); setLoading(null); return; }
      const gen = await renderBannerFromNFT(nft, { settings });
      setPreview(gen);
    } finally {
      setLoading(null);
    }
  }, [nftId, settings]);

  // prompt generation removed

  // Removed local gallery feature

  const handleDownload = useCallback(() => {
    if (!preview) return;
    const a = document.createElement('a');
    a.href = preview.dataUrl;
    a.download = `${(preview.title || 'aoa-banner').replace(/\s+/g, '-')}.png`;
    a.click();
  }, [preview]);

  const stepToken = useCallback((delta: number) => {
    setNftId((prev) => {
      const base = parseInt(prev || '0');
      const next = isNaN(base) ? 0 : Math.max(0, base + delta);
      return String(next);
    });
  }, []);

  const ensureGridSize = useCallback((rows: number, cols: number) => {
    const total = Math.max(1, rows) * Math.max(1, cols);
    setGridTokenIds((prev) => {
      const next = prev.slice(0, total);
      while (next.length < total) next.push('');
      return next;
    });
  }, []);

  const handleGenerateGrid = useCallback(async () => {
    const total = Math.max(1, gridRows) * Math.max(1, gridCols);
    ensureGridSize(gridRows, gridCols);
    const ids = (gridTokenIds.slice(0, total)).map((s) => s.trim()).filter((s) => /^\d+$/.test(s));
    if (ids.length === 0) { setError('Please enter at least one valid token ID.'); return; }
    setLoading('nft');
    setError(null);
    try {
      const nfts: MagicEdenNFT[] = [];
      for (const id of ids) {
        const nft = await magicEdenAPI.getNFTByTokenId(id);
        if (nft) nfts.push(nft);
      }
      if (nfts.length === 0) { setError('No valid tokens resolved for this collection.'); return; }
      const gen = await renderBannerFromNFTGrid(nfts, { settings, rows: gridRows, cols: gridCols });
      setPreview(gen);
    } finally {
      setLoading(null);
    }
  }, [gridRows, gridCols, gridTokenIds, settings, ensureGridSize]);

  return (
    <div className="min-h-screen relative">
      <Nav />
      {/* Decorative background glows */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full blur-3xl" style={{ background: 'radial-gradient(closest-side, rgba(34,211,238,0.18), transparent)' }} />
        <div className="absolute top-1/3 -right-16 w-[28rem] h-[28rem] rounded-full blur-3xl" style={{ background: 'radial-gradient(closest-side, rgba(16,185,129,0.16), transparent)' }} />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-28">
        <motion.h1
          className="text-4xl md:text-5xl font-bold mb-6 text-hero-blue"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          AoA Banner Generator
        </motion.h1>
        <p className="text-off-white/80 max-w-3xl mb-6">
          Create a customizable Social profile banner from your NFT token ID. Tune the background style, colors, glow, and layout, then download your banner.
        </p>

        

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Controls */}
          <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-28 self-start">
            {/* Style & Colors */}
            <div className="glass-dark rounded-xl p-5">
              <h2 className="font-semibold text-ape-gold mb-4 flex items-center gap-2"><Palette className="w-4 h-4"/> Style & Colors</h2>

              {/* Background */}
              <div className="mb-4">
                <div className="text-xs uppercase tracking-wide text-off-white/60 mb-2">Background</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="text-xs text-off-white/70">Style
                    <select
                      value={settings.style}
                      onChange={(e) => setSettings((s) => ({ ...s, style: e.target.value as BannerStyle }))}
                      className="theme-select mt-1 w-full px-2 py-1.5 text-sm"
                    >
                      <option value="neon">Neon</option>
                      <option value="mesh">Mesh Glow</option>
                      <option value="grid">Grid Stripes</option>
                      <option value="rings">Radial Rings</option>
                      <option value="minimal">Minimal</option>
                      <option value="diagonal">Diagonal Lines</option>
                      <option value="halftone">Halftone Dots</option>
                      <option value="wave">Wave Lines</option>
                      <option value="noise">Stars/Noise</option>
                    </select>
                  </label>
                  <label className="text-xs text-off-white/70">Color
                    <input type="color" value={settings.backgroundColor}
                      onChange={(e) => setSettings((s) => ({ ...s, backgroundColor: e.target.value }))}
                      className="mt-2 h-8 w-full bg-transparent border border-white/10 rounded" />
                  </label>
                  <label className="text-xs text-off-white/70">Custom Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = () => {
                          setSettings((s) => ({ ...s, backgroundImageDataUrl: String(reader.result || '') }));
                        };
                        reader.readAsDataURL(file);
                      }}
                      className="mt-2 w-full text-xs"
                    />
                  </label>
                </div>
              </div>

              <div className="border-t border-white/10 my-4" />

              {/* Text */}
              <div className="mb-4">
                <div className="text-xs uppercase tracking-wide text-off-white/60 mb-2">Text</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="text-xs text-off-white/70">Text Color
                    <input type="color" value={settings.textColor}
                      onChange={(e) => setSettings((s) => ({ ...s, textColor: e.target.value }))}
                      className="mt-2 h-8 w-full bg-transparent border border-white/10 rounded" />
                  </label>
                  <label className="text-xs text-off-white/70">Social Tag
                    <input
                      value={settings.socialTag || ''}
                      onChange={(e) => setSettings((s) => ({ ...s, socialTag: e.target.value }))}
                      placeholder="@yourhandle"
                      className="mt-2 w-full bg-transparent border border-white/10 rounded px-3 py-2"
                    />
                  </label>
                  <label className="flex items-center gap-2 text-xs text-off-white/80">
                    <input type="checkbox" checked={settings.showSubtitle}
                      onChange={(e) => setSettings((s) => ({ ...s, showSubtitle: e.target.checked }))}
                      className="accent-neon-cyan" />
                    Show subtitle
                  </label>
                </div>
              </div>

              <div className="border-t border-white/10 my-4" />

              {/* Accents */}
              <div className="mb-4">
                <div className="text-xs uppercase tracking-wide text-off-white/60 mb-2">Accents</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="text-xs text-off-white/70">Primary Accent
                    <input type="color" value={settings.primaryColor}
                      onChange={(e) => setSettings((s) => ({ ...s, primaryColor: e.target.value }))}
                      className="mt-2 h-8 w-full bg-transparent border border-white/10 rounded" />
                  </label>
                  <label className="text-xs text-off-white/70">Secondary Accent
                    <input type="color" value={settings.secondaryColor}
                      onChange={(e) => setSettings((s) => ({ ...s, secondaryColor: e.target.value }))}
                      className="mt-2 h-8 w-full bg-transparent border border-white/10 rounded" />
                  </label>
                  <label className="text-xs text-off-white/70">Accent
                    <input type="color" value={settings.accentColor}
                      onChange={(e) => setSettings((s) => ({ ...s, accentColor: e.target.value }))}
                      className="mt-2 h-8 w-full bg-transparent border border-white/10 rounded" />
                  </label>
                </div>
              </div>

              <div className="border-t border-white/10 my-4" />

              {/* Effects */}
              <div className="mb-4">
                <div className="text-xs uppercase tracking-wide text-off-white/60 mb-2">Effects</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="text-xs text-off-white/70">Glow
                    <input type="range" min={0} max={1} step={0.05} value={settings.glow}
                      onChange={(e) => setSettings((s) => ({ ...s, glow: parseFloat(e.target.value) }))}
                      className="mt-2 w-full" />
                  </label>
                  <label className="text-xs text-off-white/70">Stripe Density
                    <input type="range" min={0} max={2} step={0.1} value={settings.stripeDensity}
                      onChange={(e) => setSettings((s) => ({ ...s, stripeDensity: parseFloat(e.target.value) }))}
                      className="mt-2 w-full" />
                  </label>
                  <label className="text-xs text-off-white/70">Corner Radius
                    <input type="range" min={0} max={32} value={settings.cornerRadius}
                      onChange={(e) => setSettings((s) => ({ ...s, cornerRadius: parseInt(e.target.value) }))}
                      className="mt-2 w-full" />
                  </label>
                  <label className="flex items-center gap-2 text-xs text-off-white/80">
                    <input type="checkbox" checked={settings.showBrandCorner}
                      onChange={(e) => setSettings((s) => ({ ...s, showBrandCorner: e.target.checked }))}
                      className="accent-ape-gold" />
                    Show brand corner
                  </label>
                </div>
              </div>

              <div className="border-t border-white/10 my-4" />

              {/* Traits */}
              <div className="mb-4">
                <div className="text-xs uppercase tracking-wide text-off-white/60 mb-2">Traits</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center gap-2 text-xs text-off-white/80">
                    <input type="checkbox" checked={settings.showTraits}
                      onChange={(e) => setSettings((s) => ({ ...s, showTraits: e.target.checked }))}
                      className="accent-neon-green" />
                    Show traits
                  </label>
                  <label className="text-xs text-off-white/70">Traits Text
                    <input type="color" value={settings.traitsTextColor || '#f0f9ff'}
                      onChange={(e) => setSettings((s) => ({ ...s, traitsTextColor: e.target.value }))}
                      className="mt-2 h-8 w-full bg-transparent border border-white/10 rounded" />
                  </label>
                  <label className="text-xs text-off-white/70">Traits Background
                    <input type="color" value={settings.traitsBgColor || '#0ea5e9'}
                      onChange={(e) => setSettings((s) => ({ ...s, traitsBgColor: e.target.value }))}
                      className="mt-2 h-8 w-full bg-transparent border border-white/10 rounded" />
                  </label>
                </div>
              </div>

              <div className="border-t border-white/10 my-4" />

              {/* Website */}
              <div>
                <div className="text-xs uppercase tracking-wide text-off-white/60 mb-2">Website Label</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="text-xs text-off-white/70">Website Color
                    <input type="color" value={settings.websiteColor}
                      onChange={(e) => setSettings((s) => ({ ...s, websiteColor: e.target.value }))}
                      className="mt-2 h-8 w-full bg-transparent border border-white/10 rounded" />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="lg:col-span-2">
            {/* Token selector aligned above preview */}
            <div className="glass-dark rounded-xl p-4 mb-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="font-semibold text-neon-cyan flex items-center gap-2"><Wand2 className="w-4 h-4"/> Select Token</div>
                {!multiMode && (
                <div className="flex items-center gap-2 flex-1 sm:ml-2">
                  <button onClick={() => stepToken(-1)} className="px-3 py-2 rounded-lg border border-white/10 hover:bg-white/5" aria-label="Previous token"><Minus className="w-4 h-4"/></button>
                  <input
                    value={nftId}
                    onChange={(e) => {
                      const v = e.target.value.replace(/[^0-9]/g, '');
                      setNftId(v);
                    }}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="Token ID"
                    className="flex-1 bg-transparent border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-neon-cyan text-center"
                  />
                  <button onClick={() => stepToken(1)} className="px-3 py-2 rounded-lg border border-white/10 hover:bg-white/5" aria-label="Next token"><Plus className="w-4 h-4"/></button>
                </div>
                )}
                <button
                  onClick={multiMode ? handleGenerateGrid : handleGenerateFromNFT}
                  disabled={loading === 'nft' || (!multiMode && !nftId.trim())}
                  className="w-full sm:w-auto px-4 py-2 rounded-lg bg-neon-cyan/20 border border-neon-cyan/40 hover:bg-neon-cyan/30 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading === 'nft' ? <Loader2 className="w-4 h-4 animate-spin"/> : <ImagePlus className="w-4 h-4"/>}
                  {multiMode ? 'Generate Grid' : 'Generate'}
                </button>
              </div>

              {/* Multi-ape grid controls */}
              <div className="mt-4 border-t border-white/10 pt-4">
                <label className="flex items-center gap-2 text-sm text-off-white/80">
                  <input
                    type="checkbox"
                    checked={multiMode}
                    onChange={(e) => {
                      setMultiMode(e.target.checked);
                      if (e.target.checked) ensureGridSize(gridRows, gridCols);
                    }}
                    className="accent-neon-cyan"
                  />
                  Enable multi-ape grid
                </label>
                {multiMode && (
                  <div className="mt-3 space-y-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <label className="text-xs text-off-white/70">Preset
                        <select
                          className="ml-2 theme-select px-2 py-1.5 text-sm"
                          onChange={(e) => {
                            const val = e.target.value;
                            const presets: Record<string, [number, number]> = {
                              free: [gridRows, gridCols],
                              h1x3: [1, 3],
                              h1x5: [1, 5],
                              h2x4: [2, 4],
                              h2x6: [2, 6],
                              s2x2: [2, 2],
                              s3x3: [3, 3],
                            };
                            const [r, c] = presets[val] || [gridRows, gridCols];
                            setGridRows(r); setGridCols(c); ensureGridSize(r, c);
                          }}
                          defaultValue="free"
                        >
                          <option value="free">Free</option>
                          <option value="h1x3">Horizontal 1x3</option>
                          <option value="h1x5">Horizontal 1x5</option>
                          <option value="h2x4">Horizontal 2x4</option>
                          <option value="h2x6">Horizontal 2x6</option>
                          <option value="s2x2">Square 2x2</option>
                          <option value="s3x3">Square 3x3</option>
                        </select>
                      </label>
                      <label className="text-xs text-off-white/70">Rows
                        <input
                          type="number"
                          min={1}
                          max={5}
                          value={gridRows}
                          onChange={(e) => { const v = Math.min(5, Math.max(1, parseInt(e.target.value || '1'))); setGridRows(v); ensureGridSize(v, gridCols); }}
                          className="ml-2 w-20 bg-transparent border border-white/10 rounded px-2 py-1"
                        />
                      </label>
                      <label className="text-xs text-off-white/70">Cols
                        <input
                          type="number"
                          min={1}
                          max={6}
                          value={gridCols}
                          onChange={(e) => { const v = Math.min(6, Math.max(1, parseInt(e.target.value || '1'))); setGridCols(v); ensureGridSize(gridRows, v); }}
                          className="ml-2 w-20 bg-transparent border border-white/10 rounded px-2 py-1"
                        />
                      </label>
                      <div className="text-xs text-off-white/60">Slots: {Math.max(1, gridRows) * Math.max(1, gridCols)}</div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {gridTokenIds.map((val, idx) => (
                        <input
                          key={idx}
                          value={val}
                          onChange={(e) => {
                            const v = e.target.value.replace(/[^0-9]/g, '');
                            setGridTokenIds((prev) => {
                              const next = prev.slice();
                              next[idx] = v;
                              return next;
                            });
                          }}
                          inputMode="numeric"
                          pattern="[0-9]*"
                          placeholder={`Token ${idx + 1}`}
                          className="bg-transparent border border-white/10 rounded px-2 py-1 text-sm"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="glass-dark rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-off-white/90">Preview</h2>
                <div className="flex gap-2">
                  <button
                    onClick={handleDownload}
                    disabled={!preview}
                    className="px-3 py-1.5 rounded-lg bg-hero-blue/20 border border-hero-blue/40 hover:bg-hero-blue/30 disabled:opacity-50 flex items-center gap-2"
                  >
                    <Download className="w-4 h-4"/>
                    Download PNG
                  </button>
                </div>
              </div>

              <div className="relative w-full overflow-hidden rounded-lg glass-dark">
                {error && (
                  <div className="px-3 py-2 text-sm text-red-300 bg-red-900/20 border-b border-red-800/40">{error}</div>
                )}
                {/* Canvas preview rendered into an img for crisp scaling */}
                {preview ? (
                  <NextImage
                    src={preview.dataUrl}
                    alt={preview.title}
                    width={preview.width}
                    height={preview.height}
                    className="w-full h-auto"
                  />
                ) : (
                  <div className="aspect-[3/1] w-full flex items-center justify-center text-off-white/60 text-sm bg-[linear-gradient(45deg,rgba(255,255,255,0.04)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.04)_50%,rgba(255,255,255,0.04)_75%,transparent_75%,transparent)] bg-[length:20px_20px] rounded">
                    No banner yet. Generate from NFT to preview.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Gallery removed */}
      </div>
      <Footer />
    </div>
  );
}


