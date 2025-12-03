'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import { Plus, Trash2, Download, Layers, Shirt, Upload, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

type Layer = {
  id: string;
  src: string;
  x: number;
  y: number;
  scale: number;
  z: number;
  naturalWidth: number;
  naturalHeight: number;
  locked?: boolean;
};

export default function WardrobePage() {
  const [baseSrc, setBaseSrc] = useState<string>('');
  const [layers, setLayers] = useState<Layer[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const dragRef = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [stageSize, setStageSize] = useState<{ w: number; h: number }>({ w: 512, h: 512 });
  const [displayScale, setDisplayScale] = useState<number>(1);

  // Helpers to add holiday sticker overlays (SVG -> data URL)
  function svgToDataUrl(svg: string) {
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }

  function loadImageSize(url: string): Promise<{ w: number; h: number }> {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => resolve({ w: img.naturalWidth || img.width, h: img.naturalHeight || img.height });
      img.onerror = () => resolve({ w: 0, h: 0 });
      img.src = url;
    });
  }

  async function addLayerFromSvg(svg: string, x: number, y: number, scale: number) {
    const url = svgToDataUrl(svg);
    const { w, h } = await loadImageSize(url);
    const id = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const maxZ = layers.reduce((m, l) => Math.max(m, l.z), 0);
    setLayers((prev) => [
      ...prev,
      { id, src: url, x, y, scale, z: maxZ + 1, naturalWidth: w, naturalHeight: h, locked: false },
    ]);
    setActiveId(id);
  }

  // removed unused addLayerFromImage

  function makeLightsFrameSVG(size = 1024) {
    const s = size;
    return `
<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
  <defs>
    <filter id="glow"><feGaussianBlur stdDeviation="2" result="glow"/><feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <rect x="6" y="6" width="${s-12}" height="${s-12}" rx="24" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="6"/>
  ${[...Array(24)].map((_,i)=>{
      const p = i/24;
      const x = 12 + (s-24)*p;
      const yTop = 12 + 8*Math.sin(p*6.283);
      const colors = ['#E53935','#FFD700','#00C853','#0054F9'];
      const c = colors[i%4];
      return `<circle cx="${x}" cy="${yTop}" r="8" fill="${c}" filter="url(#glow)"/>`;
    }).join('')}
  ${[...Array(24)].map((_,i)=>{
      const p = i/24;
      const x = 12 + (s-24)*p;
      const yBot = (s - 12) - 8*Math.sin(p*6.283);
      const colors = ['#E53935','#FFD700','#00C853','#0054F9'];
      const c = colors[(i+2)%4];
      return `<circle cx="${x}" cy="${yBot}" r="8" fill="${c}" filter="url(#glow)"/>`;
    }).join('')}
  ${[...Array(20)].map((_,i)=>{
      const p = i/20;
      const y = 12 + (s-24)*p;
      const xLeft = 12 + 6*Math.sin(p*6.283);
      const colors = ['#E53935','#FFD700','#00C853','#0054F9'];
      const c = colors[(i+1)%4];
      return `<circle cx="${xLeft}" cy="${y}" r="8" fill="${c}" filter="url(#glow)"/>`;
    }).join('')}
  ${[...Array(20)].map((_,i)=>{
      const p = i/20;
      const y = 12 + (s-24)*p;
      const xRight = (s - 12) - 6*Math.sin(p*6.283);
      const colors = ['#E53935','#FFD700','#00C853','#0054F9'];
      const c = colors[(i+3)%4];
      return `<circle cx="${xRight}" cy="${y}" r="8" fill="${c}" filter="url(#glow)"/>`;
    }).join('')}
</svg>`;
  }

  function makeGiftsGroupSVG() {
    return `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="256" viewBox="0 0 512 256">
  <rect x="20" y="120" width="160" height="110" rx="14" fill="#E53935"/>
  <rect x="90" y="120" width="20" height="110" fill="#FFD700"/>
  <rect x="30" y="90" width="140" height="40" rx="10" fill="#C62828"/>
  <rect x="98" y="90" width="4" height="40" fill="#FFD700"/>
  <path d="M100 90c-10 20-30 30-50 30 20 0 40 10 50 30 10-20 30-30 50-30-20 0-40-10-50-30z" fill="#FFD700"/>

  <rect x="220" y="140" width="120" height="90" rx="12" fill="#1DB954"/>
  <rect x="270" y="140" width="20" height="90" fill="#0054F9"/>
  <rect x="230" y="120" width="100" height="30" rx="8" fill="#128D45"/>
  <rect x="278" y="120" width="4" height="30" fill="#0054F9"/>
  <path d="M280 120c-8 16-24 24-40 24 16 0 32 8 40 24 8-16 24-24 40-24-16 0-32-8-40-24z" fill="#0054F9"/>
</svg>`;
  }

  function makeSnowflakesSVG(size = 1024) {
    const s = size;
    return `
<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
  ${[...Array(40)].map(()=>{
      const x = Math.random()*s;
      const y = Math.random()*s;
      const r = 1.5 + Math.random()*2.5;
      return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="rgba(255,255,255,0.8)"/>`;
    }).join('')}
</svg>`;
  }

  useEffect(() => {
    function onMove(e: PointerEvent) {
      if (!dragRef.current) return;
      const { id, offsetX, offsetY } = dragRef.current;
      const stage = stageRef.current;
      if (!stage) return;
      const rect = stage.getBoundingClientRect();
      const x = (e.clientX - rect.left) / displayScale - offsetX;
      const y = (e.clientY - rect.top) / displayScale - offsetY;
      setLayers((prev) =>
        prev.map((l) => (l.id === id ? { ...l, x, y } : l))
      );
    }
    function onUp() {
      dragRef.current = null;
    }
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [displayScale]);

  // Recalculate display scale on mount/resize or when stage size changes
  useEffect(() => {
    function recalc() {
      const stage = stageRef.current;
      if (!stage) return;
      const rect = stage.getBoundingClientRect();
      if (stageSize.w > 0) {
        setDisplayScale(rect.width / stageSize.w);
      }
    }
    recalc();
    window.addEventListener('resize', recalc);
    return () => window.removeEventListener('resize', recalc);
  }, [stageSize.w]);

  function handlePickBase(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setBaseSrc(url);
    // Read image size using helper to avoid global Image name collision
    loadImageSize(url).then(({ w, h }) => {
      const width = w || 512;
      const height = h || 512;
      setStageSize({ w: width, h: height });
      setTimeout(() => {
        const stage = stageRef.current;
        if (!stage) return;
        const rect = stage.getBoundingClientRect();
        if (width > 0) setDisplayScale(rect.width / width);
      }, 0);
    });
  }

  function handleAddLayer(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    (async () => {
      const { w, h } = await loadImageSize(url);
      const id = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const maxZ = layers.reduce((m, l) => Math.max(m, l.z), 0);
      setLayers((prev) => [
        ...prev,
        { id, src: url, x: stageSize.w * 0.25, y: stageSize.h * 0.25, scale: 1, z: maxZ + 1, naturalWidth: w, naturalHeight: h },
      ]);
      setActiveId(id);
    })();
  }

  function beginDrag(id: string, e: React.PointerEvent<HTMLDivElement>) {
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    dragRef.current = {
      id,
      offsetX: (e.clientX - rect.left) / displayScale,
      offsetY: (e.clientY - rect.top) / displayScale,
    };
    setActiveId(id);
  }

  function adjustScale(id: string, delta: number) {
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, scale: Math.max(0.2, Math.min(4, l.scale + delta)) } : l))
    );
  }

  function bringToFront(id: string) {
    const maxZ = layers.reduce((m, l) => Math.max(m, l.z), 0);
    setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, z: maxZ + 1 } : l)));
  }

  function removeLayer(id: string) {
    setLayers((prev) => prev.filter((l) => l.id !== id));
    if (activeId === id) setActiveId(null);
  }

  async function handleDownload() {
    if (!baseSrc && layers.length === 0) return;
    const canvas = document.createElement('canvas');
    canvas.width = stageSize.w;
    canvas.height = stageSize.h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    function load(url: string) {
      return new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
      });
    }

    if (baseSrc) {
      const baseImg = await load(baseSrc);
      const bw = (baseImg.naturalWidth || baseImg.width);
      const bh = (baseImg.naturalHeight || baseImg.height);
      // Draw base scaled to the exact stage size to match preview
      ctx.drawImage(baseImg, 0, 0, bw, bh, 0, 0, stageSize.w, stageSize.h);
    } else {
      // Background fill just in case
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, stageSize.w, stageSize.h);
    }

    const ordered = [...layers].sort((a, b) => a.z - b.z);
    for (const l of ordered) {
      // Prefer stored natural sizes to avoid re-measuring at export time
      const nw = l.naturalWidth, nh = l.naturalHeight;
      let w = nw * l.scale;
      let h = nh * l.scale;
      // Fallback if sizes were not stored
      let img: HTMLImageElement | null = null;
      if (!nw || !nh) {
        img = await load(l.src);
        const rawW = (img.naturalWidth || img.width);
        const rawH = (img.naturalHeight || img.height);
        w = rawW * l.scale;
        h = rawH * l.scale;
      }
      // Draw using stage coordinates (x,y) so it matches preview mapping
      if (img) {
        ctx.drawImage(img, 0, 0, (img.naturalWidth || img.width), (img.naturalHeight || img.height), l.x, l.y, w, h);
      } else {
        const tmp = await load(l.src);
        ctx.drawImage(tmp, 0, 0, (tmp.naturalWidth || tmp.width), (tmp.naturalHeight || tmp.height), l.x, l.y, w, h);
      }
    }

    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = 'aoa-wardrobe.png';
    a.click();
  }

  return (
    <div className="min-h-screen relative">
      <Nav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-hero-blue/10 border border-hero-blue/30 mb-3">
            <Shirt className="w-4 h-4 text-hero-blue" />
            <span className="text-xs text-hero-blue">Wardrobe (Beta)</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold" style={{ color: 'var(--foreground)' }}>
            Customize your Ape
          </h1>
          <p className="text-off-white/80 mt-2 max-w-2xl">
            Upload your Ape image and overlay clothing layers (transparent PNGs). Drag to position, scale with controls, then download.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="glass-dark rounded-xl p-4 border border-white/10 space-y-4">
            <div>
              <label className="block text-sm mb-2" style={{ color: 'var(--foreground)' }}>Ape image</label>
              <label className="btn-secondary inline-flex items-center gap-2 cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>Upload Ape</span>
                <input type="file" accept="image/*" className="hidden" onChange={handlePickBase} />
              </label>
            </div>
            <div>
              <label className="block text-sm mb-2" style={{ color: 'var(--foreground)' }}>Add clothing layer</label>
              <label className="btn-secondary inline-flex items-center gap-2 cursor-pointer">
                <Plus className="w-4 h-4" />
                <span>Add layer</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleAddLayer} />
              </label>
            </div>

            {/* Holiday Sticker Library */}
            <div className="border-t border-white/10 pt-3">
              <div className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-hero-blue/10 border border-hero-blue/30 text-hero-blue text-xs w-fit mb-3">
                <span>Holiday Stickers</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  className="px-3 py-2 rounded-lg border border-white/10 hover:bg-white/10 transition-colors text-sm"
                  onClick={() => {
                    const svg = makeLightsFrameSVG();
                    const scale = stageSize.w / 1024;
                    addLayerFromSvg(svg, 0, 0, scale);
                  }}
                  title="Add string lights frame"
                >
                  ✨ String Lights
                </button>
                <button
                  className="px-3 py-2 rounded-lg border border-white/10 hover:bg-white/10 transition-colors text-sm"
                  onClick={() => {
                    const svg = makeGiftsGroupSVG();
                    const baseScale = stageSize.w / 1024;
                    const scale = baseScale * 1.0;
                    const x = 16;
                    const y = stageSize.h - 220;
                    addLayerFromSvg(svg, x, y, scale);
                  }}
                  title="Add gifts (left)"
                >
                  🎁 Gifts Left
                </button>
                <button
                  className="px-3 py-2 rounded-lg border border-white/10 hover:bg-white/10 transition-colors text-sm"
                  onClick={() => {
                    const svg = makeGiftsGroupSVG();
                    const baseScale = stageSize.w / 1024;
                    const scale = baseScale * 1.0;
                    const x = Math.max(0, stageSize.w - 512*scale - 16);
                    const y = stageSize.h - 220;
                    addLayerFromSvg(svg, x, y, scale);
                  }}
                  title="Add gifts (right)"
                >
                  🎁 Gifts Right
                </button>
                {/* Santa hat option removed per request */}
                <button
                  className="px-3 py-2 rounded-lg border border-white/10 hover:bg-white/10 transition-colors text-sm col-span-2"
                  onClick={() => {
                    const svg = makeSnowflakesSVG();
                    const scale = stageSize.w / 1024;
                    addLayerFromSvg(svg, 0, 0, scale);
                  }}
                  title="Add snowflakes overlay"
                >
                  ❄️ Snowflakes Overlay
                </button>
              </div>
            </div>

            <div className="border-t border-white/10 pt-3">
              <div className="flex items-center justify-between mb-2">
                <div className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-white/5 border border-white/10 text-xs">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Layers</span>
                </div>
                <button
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 hover:bg-white/10 transition-colors text-sm"
                  onClick={() => { setLayers([]); setActiveId(null); }}
                >
                  <RotateCcw className="w-4 h-4" /> Reset
                </button>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {layers.length === 0 && (
                  <div className="text-sm text-off-white/60">No layers yet.</div>
                )}
                {layers
                  .slice()
                  .sort((a, b) => b.z - a.z)
                  .map((l) => (
                  <div
                    key={l.id}
                    className={`flex items-center justify-between px-2 py-1.5 rounded-md border ${activeId === l.id ? 'border-hero-blue/50 bg-hero-blue/10' : 'border-white/10'}`}
                  >
                    <button
                      className="text-left text-sm truncate mr-2"
                      onClick={() => { setActiveId(l.id); if (!l.locked) bringToFront(l.id); }}
                      title={l.src}
                      style={{ color: 'var(--foreground)' }}
                    >
                      {l.locked ? 'Santa Hat (locked)' : `Layer #${l.id.slice(-5)}`}
                    </button>
                    <div className="flex items-center gap-2">
                      <button className="p-1 rounded-md bg-white/10 hover:bg-white/20 disabled:opacity-50" onClick={() => adjustScale(l.id, 0.1)} title="Zoom in" disabled={!!l.locked}>
                        <ZoomIn className="w-4 h-4" />
                      </button>
                      <button className="p-1 rounded-md bg-white/10 hover:bg-white/20 disabled:opacity-50" onClick={() => adjustScale(l.id, -0.1)} title="Zoom out" disabled={!!l.locked}>
                        <ZoomOut className="w-4 h-4" />
                      </button>
                      <button className="p-1 rounded-md bg-white/10 hover:bg-white/20 disabled:opacity-50" onClick={() => bringToFront(l.id)} title="Bring to front" disabled={!!l.locked}>
                        <Layers className="w-4 h-4" />
                      </button>
                      <button className="p-1 rounded-md bg-white/10 hover:bg-white/20" onClick={() => removeLayer(l.id)} title="Remove layer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button className="btn-primary w-full inline-flex items-center justify-center gap-2" onClick={handleDownload}>
              <Download className="w-5 h-5" /> Download PNG
            </button>
          </div>

          {/* Stage */}
          <div className="lg:col-span-2">
            <div
              ref={stageRef}
              className="relative rounded-xl border border-white/10 bg-black/40 overflow-hidden"
              style={{ width: '100%', maxWidth: stageSize.w, aspectRatio: `${stageSize.w} / ${stageSize.h}` }}
            >
              {/* Base image */}
              {baseSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={baseSrc} alt="Base Ape" className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-off-white/60 text-sm p-4">
                  Upload your Ape image to start.
                </div>
              )}

              {/* Layers */}
              {layers.map((l) => (
                <div
                  key={l.id}
                  onPointerDown={(e) => { if (!l.locked) beginDrag(l.id, e); }}
                  className={`absolute ${l.locked ? 'cursor-default' : 'cursor-move'}`}
                  style={{ left: l.x * displayScale, top: l.y * displayScale, zIndex: l.z }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={l.src}
                    alt="Layer"
                    style={{ width: `${Math.max(1, (l.naturalWidth || 0) * l.scale * displayScale)}px`, height: `${Math.max(1, (l.naturalHeight || 0) * l.scale * displayScale)}px` }}
                    draggable={false}
                  />
                </div>
              ))}
            </div>
            <div className="text-xs text-off-white/60 mt-2">
              Tip: Drag layers to position. Use the scale buttons in the list. Download merges everything into a single PNG.
            </div>
          </div>
        </div>

        <div className="mt-8">
          <Link href="/creative" className="btn-secondary">Back to Creative Hub</Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}


