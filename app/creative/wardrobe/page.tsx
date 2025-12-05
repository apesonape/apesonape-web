'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import { Download, Shirt, Upload } from 'lucide-react';
import { magicEdenAPI } from '@/lib/magic-eden';

type ClothingItem = {
  id: string;
  name: string;
  src: string; // 4096x4096 transparent PNG aligned to base
  category: 'Hats' | 'Tops' | 'Accessories';
};

const CLOTHES: ClothingItem[] = [
  // Hats
  { id: 'santa-hat', name: 'Santa Hat', src: '/wardrobe/santa-hat.png', category: 'Hats' },
  // Accessories
  { id: 'gm-arm', name: 'GM Arm + Mug', src: '/file.svg', category: 'Accessories' },
  // Tops (reflect current files in public/wardrobe/tops)
  { id: 'bandolier', name: 'Bandolier', src: '/wardrobe/tops/bandolier.png', category: 'Tops' },
  { id: 'bone-necklace', name: 'Bone Necklace', src: '/wardrobe/tops/bone-necklace.png', category: 'Tops' },
];

const CATEGORIES: Array<ClothingItem['category']> = ['Hats', 'Tops', 'Accessories'];

const OUTPUT_SIZE = 4096;

export default function WardrobePage() {
  const [tokenId, setTokenId] = useState<string>('');
  const [loadingNft, setLoadingNft] = useState(false);
  const [baseSrc, setBaseSrc] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<ClothingItem['category']>('Hats');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [note, setNote] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [includeGmArm, setIncludeGmArm] = useState<boolean>(true);
  const FUR_COLORS = [
    'Black','Blue','Brown','Cheetah','Cream','Dark Brown','Death Bot','Dmt','Golden Brown','Gray','Noise','Pink','Red','Robot','Solid Gold','Tan','Trippy','White','Zombie'
  ] as const;
  type FurColor = typeof FUR_COLORS[number];
  const [furColor, setFurColor] = useState<FurColor>('Brown');

  const toggleSelect = useCallback((id: string) => {
    if (id === 'gm-arm') {
      setIncludeGmArm((prev) => !prev);
      return;
    }
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handlePickBase = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setBaseSrc(url);
    setNote(null);
    setPreviewUrl(null);
    // Best-effort hint if not 4096x4096
    const img = new window.Image();
    img.onload = () => {
      if ((img.naturalWidth !== OUTPUT_SIZE) || (img.naturalHeight !== OUTPUT_SIZE)) {
        setNote('Tip: For best results, use a 4096×4096 image.');
      }
    };
    img.src = url;
  }, []);

  const handleLoadById = useCallback(async () => {
    if (!tokenId.trim() || loadingNft) return;
    setLoadingNft(true);
    setNote(null);
    try {
      if (!/^\d+$/.test(tokenId.trim())) {
        setNote('Please enter a numeric token ID (e.g., 1234).');
        return;
      }
      const nft = await magicEdenAPI.getNFTByTokenId(tokenId.trim());
      if (!nft) {
        setNote('Token not found. Check the ID and try again.');
        return;
      }
      setBaseSrc(nft.image);
      setPreviewUrl(null);
      const furTrait = nft.traits.find((t) => t.name.toLowerCase() === 'fur');
      if (furTrait && FUR_COLORS.includes(furTrait.value as FurColor)) {
        setFurColor(furTrait.value as FurColor);
      }
    } catch (err) {
      console.error('Load NFT error:', err);
      setNote('Failed to load NFT. Try again.');
    } finally {
      setLoadingNft(false);
    }
  }, [tokenId, loadingNft]);

  // Attempt to prime audio on first interaction to avoid autoplay restrictions
  useEffect(() => {
    function prime() {
      if (!audioRef.current) return;
      audioRef.current.muted = true;
      audioRef.current.play().catch(() => {});
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.muted = false;
      window.removeEventListener('pointerdown', prime);
      window.removeEventListener('keydown', prime);
    }
    window.addEventListener('pointerdown', prime);
    window.addEventListener('keydown', prime);
    return () => {
      window.removeEventListener('pointerdown', prime);
      window.removeEventListener('keydown', prime);
    };
  }, []);

  // Build GM arm asset path (PNG overlays to be added later by fur color)
  const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const getGmArmPath = (fur: FurColor) => `/wardrobe/gm-arm/${slugify(fur)}.png`;
  const [gmArmPreviewOk, setGmArmPreviewOk] = useState(false);
  useEffect(() => {
    if (!includeGmArm) { setGmArmPreviewOk(false); return; }
    const url = getGmArmPath(furColor);
    const img = new window.Image();
    img.onload = () => setGmArmPreviewOk(true);
    img.onerror = () => setGmArmPreviewOk(false);
    img.src = url;
  }, [includeGmArm, furColor]);

  const compose = useCallback(async (): Promise<string | null> => {
    if (!baseSrc) return null;
    const canvas = document.createElement('canvas');
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const load = (url: string) =>
      new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
      });

    const base = await load(baseSrc);
    ctx.drawImage(base, 0, 0, base.naturalWidth || base.width, base.naturalHeight || base.height, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

    const selected = CLOTHES.filter((c) => selectedIds.has(c.id));
    for (const item of selected) {
      if (item.id === 'gm-arm') continue;
      const overlay = await load(item.src);
      ctx.drawImage(overlay, 0, 0, overlay.naturalWidth || overlay.width, overlay.naturalHeight || overlay.height, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
    }
    if (includeGmArm) {
      try {
        const gm = await load(getGmArmPath(furColor));
        ctx.drawImage(gm, 0, 0, gm.naturalWidth || gm.width, gm.naturalHeight || gm.height, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
      } catch {
        // If asset not present yet, skip gracefully
      }
    }
    return canvas.toDataURL('image/png');
  }, [baseSrc, selectedIds, includeGmArm, furColor]);

  const handleGeneratePreview = useCallback(async () => {
    if (!baseSrc || isGenerating) return;
    setIsGenerating(true);
    setFlashOn(false);
    try {
      if (audioRef.current) {
        try {
          audioRef.current.currentTime = 0;
          await audioRef.current.play();
        } catch {}
      }
      // Compose while "mechanic" runs
      const url = await compose();
      // small delay to let the sound breathe
      await new Promise((r) => setTimeout(r, 350));
      setPreviewUrl(url);
      setFlashOn(true);
      setTimeout(() => setFlashOn(false), 300);
    } finally {
      setIsGenerating(false);
      if (audioRef.current) {
        try {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        } catch {}
      }
    }
  }, [baseSrc, compose, isGenerating]);

  const handleDownload = useCallback(async () => {
    if (!baseSrc) return;
    const url = previewUrl || (await compose());
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ape-wardrobe.png';
    a.click();
  }, [baseSrc, previewUrl, compose]);

  const filtered = CLOTHES.filter((c) => c.category === activeCategory);

  return (
    <div className="min-h-screen relative">
      {/* Lab ambient background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(1200px 600px at 20% 10%, rgba(0,255,200,0.08), transparent 60%), radial-gradient(1000px 500px at 80% 20%, rgba(0,200,255,0.06), transparent 60%), linear-gradient(180deg, #02060B 0%, #070B12 50%, #0B0F17 100%)'
        }}
      />
      {/* Subtle moving smoke layers */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -inset-x-1/4 top-0 h-1/2 opacity-30 blur-2xl" style={{ animation: 'smokeDrift 22s linear infinite' , background: 'radial-gradient(60% 60% at 50% 50%, rgba(180,200,210,0.12), transparent 70%)' }} />
        <div className="absolute -inset-x-1/4 bottom-0 h-1/2 opacity-25 blur-2xl" style={{ animation: 'smokeDrift 28s linear infinite reverse' , background: 'radial-gradient(60% 60% at 50% 50%, rgba(200,220,230,0.10), transparent 70%)' }} />
      </div>
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
            <span className="text-xs text-hero-blue">Wardrobe</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold" style={{ color: 'var(--foreground)' }}>
            Mad Lab Wardrobe
          </h1>
          <p className="text-off-white/80 mt-2 max-w-2xl">
            Step into the scientist’s workshop. Upload a 4096×4096 Ape, select overlays, then generate with a flash of chaotic genius.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="glass-dark rounded-xl p-4 border border-white/10 space-y-4">
            <div>
              <label className="block text-sm mb-2" style={{ color: 'var(--foreground)' }}>Ape Token ID</label>
              <div className="flex gap-2">
                <input
                  value={tokenId}
                  onChange={(e) => setTokenId(e.target.value)}
                  placeholder="e.g. 1234"
                  className="flex-1 rounded-md bg-black/30 border border-white/10 px-3 py-2 text-sm outline-none focus:ring-2 ring-hero-blue/40"
                />
                <button className="btn-secondary whitespace-nowrap" onClick={handleLoadById} disabled={!tokenId.trim() || loadingNft}>
                  {loadingNft ? 'Loading…' : 'Load NFT'}
                </button>
              </div>
              <div className="text-xs text-off-white/60 mt-2">Loads image and traits from IPFS via tokenURI.</div>
              {note && <div className="text-xs text-red-400 mt-2">{note}</div>}
            </div>

            {/* Upload alternative */}
            <div className="border-t border-white/10 pt-3">
              <label className="block text-sm mb-2" style={{ color: 'var(--foreground)' }}>Or upload 4096×4096 image</label>
              <label className="btn-secondary inline-flex items-center gap-2 cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>Upload Ape</span>
                <input type="file" accept="image/*" className="hidden" onChange={handlePickBase} />
              </label>
              <div className="text-xs text-off-white/60 mt-2">Recommended: 4096×4096 PNG with transparency.</div>
              {note && <div className="text-xs text-off-white/60 mt-2">{note}</div>}
            </div>

            {/* GM Arm configuration removed; use Accessories tile to toggle */}

            <div className="border-t border-white/10 pt-3">
              <div className="flex items-center gap-2 mb-3">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    className={`px-3 py-1.5 rounded-md text-sm border ${activeCategory === cat ? 'border-hero-blue/50 bg-hero-blue/10' : 'border-white/10 hover:bg-white/10'}`}
                    onClick={() => setActiveCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {filtered.length === 0 && (
                  <div className="text-sm text-off-white/60 col-span-2">No items yet.</div>
                )}
                {filtered.map((item) => {
                  const isOn = item.id === 'gm-arm' ? includeGmArm : selectedIds.has(item.id);
                  return (
                    <button
                      key={item.id}
                      className={`relative rounded-lg border p-2 text-left transition-colors ${isOn ? 'border-hero-blue/60 bg-hero-blue/10' : 'border-white/10 hover:bg-white/10'}`}
                      onClick={() => toggleSelect(item.id)}
                      title={item.name}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.src} alt={item.name} className="w-full aspect-square object-contain rounded-md bg-black/30" />
                      <div className="mt-2 text-xs" style={{ color: 'var(--foreground)' }}>{item.name}</div>
                      {isOn && <div className="absolute top-2 right-2 text-hero-blue text-xs">Selected</div>}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                className="btn-secondary flex-1 inline-flex items-center justify-center gap-2 disabled:opacity-50"
                onClick={handleGeneratePreview}
                disabled={!baseSrc || isGenerating}
              >
                {isGenerating ? 'Generating...' : 'Generate Preview'}
              </button>
              <button
                className="btn-primary flex-1 inline-flex items-center justify-center gap-2 disabled:opacity-50"
                onClick={handleDownload}
                disabled={!baseSrc}
              >
                <Download className="w-5 h-5" /> Download PNG
              </button>
            </div>

            <button
              className="w-full inline-flex items-center justify-center gap-2 text-xs opacity-60 hover:opacity-100 transition"
              onClick={() => setPreviewUrl(null)}
              disabled={!previewUrl}
            >
              Reset preview
            </button>
          </div>

          <div className="lg:col-span-2">
            <div
              className="relative rounded-xl border border-white/10 overflow-hidden"
              style={{ width: '100%', aspectRatio: '1 / 1' }}
            >
              {/* Lab backdrop inside the stage */}
              <div
                aria-hidden="true"
                className="absolute inset-0"
                style={{
                  background:
                    'radial-gradient(65% 65% at 50% 40%, rgba(10,30,45,0.9), rgba(6,12,20,0.95) 60%, rgba(2,6,11,1) 100%)'
                }}
              />
              <div className="absolute inset-0 pointer-events-none">
                {/* subtle grid */}
                <div
                  className="absolute inset-0 opacity-[0.05]"
                  style={{
                    backgroundImage:
                      'linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)',
                    backgroundSize: '32px 32px'
                  }}
                />
                {/* neon frame */}
                <div className="absolute inset-2 rounded-xl" style={{ boxShadow: 'inset 0 0 80px rgba(0,255,220,0.08), 0 0 40px rgba(0,200,255,0.06)' }} />
                {/* smoke wisps over stage */}
                <div className="absolute -inset-x-1/3 -top-4 h-1/2 opacity-25 blur-2xl" style={{ animation: 'smokeDrift 18s linear infinite', background: 'radial-gradient(50% 50% at 50% 50%, rgba(210,230,240,0.10), transparent 70%)' }} />
                <div className="absolute -inset-x-1/3 -bottom-4 h-1/2 opacity-2 blur-2xl" style={{ animation: 'smokeDrift 26s linear infinite reverse', background: 'radial-gradient(50% 50% at 50% 50%, rgba(210,230,240,0.08), transparent 70%)' }} />
              </div>

              {/* Preview or live composition */}
              {baseSrc ? (
                <>
                  {previewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={previewUrl} alt="Generated Preview" className="absolute inset-0 w-full h-full object-contain" />
                  ) : (
                    <>
                      {/* Live layered preview before generation */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={baseSrc} alt="Base Ape" className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none" />
                      {CLOTHES.filter((c) => selectedIds.has(c.id)).map((item) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          key={item.id}
                          src={item.src}
                          alt={item.name}
                          className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
                        />
                      ))}
                      {includeGmArm && gmArmPreviewOk && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={getGmArmPath(furColor)}
                          alt="GM Arm"
                          className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
                        />
                      )}
                    </>
                  )}
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-off-white/60 text-sm p-4">
                  Enter a token ID or upload your Ape image to start.
                </div>
              )}

              {/* Loading overlay */}
              {isGenerating && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                  <div className="px-4 py-2 rounded-md border border-white/10 bg-black/60 text-off-white/90 text-sm">
                    Assembling in the workshop...
                  </div>
                </div>
              )}

              {/* Flash effect */}
              {flashOn && (
                <div className="absolute inset-0 pointer-events-none" style={{ background: 'rgba(255,255,255,0.95)', animation: 'flashPop 300ms ease-out forwards' }} />
              )}
            </div>
            <div className="text-xs text-off-white/60 mt-2">
              The lab composes selected clothes as full-size overlays aligned to the base image.
            </div>
          </div>
        </div>

        <div className="mt-8">
          <Link href="/creative" className="btn-secondary">Back to Creative Hub</Link>
        </div>
      </div>
      <Footer />
      {/* Hidden audio element for mechanic workshop sound; place a file at /public/mechanic-workshop.mp3 */}
      <audio ref={audioRef} src="/mechanic-workshop.mp3" preload="auto" />
      {/* Local keyframes for smoke and flash */}
      <style jsx>{`
        @keyframes smokeDrift {
          0% { transform: translateX(-10%) translateY(0%); }
          50% { transform: translateX(10%) translateY(-2%); }
          100% { transform: translateX(-10%) translateY(0%); }
        }
        @keyframes flashPop {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
