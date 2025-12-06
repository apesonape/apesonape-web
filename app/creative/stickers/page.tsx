'use client';
export const dynamic = 'force-dynamic';

import React, { useCallback, useMemo, useRef, useState } from 'react';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import { Download } from 'lucide-react';
import SafeImage from '@/app/components/SafeImage';
import { useToolTracking } from '@/app/hooks/useToolTracking';

function drawSticker(canvas: HTMLCanvasElement, img: HTMLImageElement, opts: { size: number; padding: number; shadow: boolean; background: 'transparent' | 'white' }) {
	const ctx = canvas.getContext('2d');
	if (!ctx) return;
	const { size, padding, shadow, background } = opts;
	canvas.width = size;
	canvas.height = size;
	ctx.clearRect(0, 0, size, size);

	if (background === 'white') {
		ctx.fillStyle = '#ffffff';
		ctx.fillRect(0, 0, size, size);
	}

	const inner = Math.max(0, size - padding * 2);
	const scale = Math.min(inner / img.width, inner / img.height);
	const w = Math.floor(img.width * scale);
	const h = Math.floor(img.height * scale);
	const dx = padding + Math.floor((inner - w) / 2);
	const dy = padding + Math.floor((inner - h) / 2);

	if (shadow) {
		ctx.save();
		ctx.shadowColor = 'rgba(0,0,0,0.35)';
		ctx.shadowBlur = 24;
		ctx.shadowOffsetX = 0;
		ctx.shadowOffsetY = 8;
		ctx.drawImage(img as unknown as CanvasImageSource, dx, dy, w, h);
		ctx.restore();
	} else {
		ctx.drawImage(img as unknown as CanvasImageSource, dx, dy, w, h);
	}
}

export default function StickersPage() {
	// Track tool usage for gamification
	useToolTracking('sticker');

	const [files, setFiles] = useState<File[]>([]);
	const [images, setImages] = useState<HTMLImageElement[]>([]);
	const [size, setSize] = useState(512);
	const [padding, setPadding] = useState(32);
	const [shadow, setShadow] = useState(true);
	const [background, setBackground] = useState<'transparent' | 'white'>('transparent');

	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const previews = useMemo(() => {
		const canvas = canvasRef.current;
		if (!canvas) return [];
		return images.slice(0, 24).map((img) => {
			drawSticker(canvas, img, { size, padding, shadow, background });
			return canvas.toDataURL('image/png');
		});
	}, [images, size, padding, shadow, background]);

	const onFiles = useCallback((list: FileList | null) => {
		const arr = Array.from(list || []);
		setFiles(arr);
		Promise.all(
			arr.map(
				(file) =>
					new Promise<HTMLImageElement>((resolve) => {
						const reader = new FileReader();
						reader.onload = () => {
							const img = new Image();
							img.onload = () => resolve(img);
							img.src = String(reader.result || '');
						};
						reader.readAsDataURL(file);
					})
			)
		).then(setImages);
	}, []);

	const downloadAll = useCallback(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		images.forEach((img, idx) => {
			drawSticker(canvas, img, { size, padding, shadow, background });
			const url = canvas.toDataURL('image/png');
			const a = document.createElement('a');
			const original = files[idx]?.name?.replace(/\.[a-z0-9]+$/i, '') || `sticker-${idx + 1}`;
			a.href = url;
			a.download = `${original}-aoa-sticker-${size}.png`;
			a.click();
		});
	}, [images, files, size, padding, shadow, background]);

	return (
		<div className="min-h-screen relative">
			<Nav />
			<div className="pointer-events-none absolute inset-0 -z-10">
				<div className="absolute -top-24 -left-24 w-96 h-96 rounded-full blur-3xl" style={{ background: 'radial-gradient(closest-side, rgba(34,211,238,0.18), transparent)' }} />
				<div className="absolute top-1/3 -right-16 w-[28rem] h-[28rem] rounded-full blur-3xl" style={{ background: 'radial-gradient(closest-side, rgba(16,185,129,0.16), transparent)' }} />
			</div>
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-28">
				<h1 className="text-4xl md:text-5xl font-bold mb-6 text-hero-blue">Sticker Pack Builder</h1>
				<p className="text-off-white/80 max-w-3xl mb-6">Upload multiple PNGs, set size/padding/shadow, and download all as sticker PNGs.</p>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					<div className="lg:col-span-1 space-y-6 lg:sticky lg:top-28 self-start">
						<div className="glass-dark rounded-xl p-5 space-y-4">
							<div>
								<div className="text-xs uppercase tracking-wide text-off-white/60 mb-2">Images</div>
								<input type="file" accept="image/*" multiple onChange={(e) => onFiles(e.target.files)} className="w-full text-sm"/>
								{files.length > 0 && <div className="text-xs text-off-white/60 mt-2">{files.length} selected</div>}
							</div>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								<label className="text-xs text-off-white/70">Size
									<select value={size} onChange={(e) => setSize(parseInt(e.target.value))} className="theme-select mt-2 w-full px-2 py-1.5 text-sm">
										<option value={256}>256</option>
										<option value={384}>384</option>
										<option value={512}>512</option>
										<option value={1024}>1024</option>
									</select>
								</label>
								<label className="text-xs text-off-white/70">Padding
									<input type="range" min={0} max={128} value={padding} onChange={(e) => setPadding(parseInt(e.target.value))} className="mt-2 w-full"/>
								</label>
								<label className="flex items-center gap-2 text-xs text-off-white/80">
									<input type="checkbox" checked={shadow} onChange={(e) => setShadow(e.target.checked)} className="accent-neon-cyan"/>
									Drop Shadow
								</label>
								<label className="text-xs text-off-white/70">Background
									<select value={background} onChange={(e) => setBackground(e.target.value as 'transparent' | 'white')} className="theme-select mt-2 w-full px-2 py-1.5 text-sm">
										<option value="transparent">Transparent</option>
										<option value="white">White</option>
									</select>
								</label>
							</div>
						</div>
					</div>

					<div className="lg:col-span-2">
						<div className="glass-dark rounded-xl p-5">
							<div className="flex items-center justify-between mb-3">
								<h2 className="font-semibold text-off-white/90">Previews</h2>
								<button onClick={downloadAll} disabled={images.length === 0} className="px-3 py-1.5 rounded-lg bg-hero-blue/20 border border-hero-blue/40 hover:bg-hero-blue/30 disabled:opacity-50 flex items-center gap-2">
									<Download className="w-4 h-4"/>
									Download All
								</button>
							</div>
							<canvas ref={canvasRef} className="hidden"/>
							{images.length === 0 ? (
								<div className="aspect-video w-full flex items-center justify-center text-off-white/60 text-sm bg-[linear-gradient(45deg,rgba(255,255,255,0.04)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.04)_50%,rgba(255,255,255,0.04)_75%,transparent_75%,transparent)] bg-[length:20px_20px] rounded">
									Add images to see previews.
								</div>
							) : (
								<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
									{previews.map((src, i) => (
										<div key={i} className="rounded-lg overflow-hidden border border-white/10 bg-black/30 p-2 flex items-center justify-center">
											<SafeImage src={src} alt={`sticker-${i+1}`} className="w-full h-auto object-contain" width={512} height={512} unoptimized priority />
										</div>
									))}
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
			<Footer />
		</div>
	);
}


