'use client';
export const dynamic = 'force-dynamic';

import React, { useCallback, useMemo, useRef, useState } from 'react';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import { Download, Circle, Square, Wand2 } from 'lucide-react';
import SafeImage from '@/app/components/SafeImage';
import { useToolTracking } from '@/app/hooks/useToolTracking';

type Shape = 'square' | 'circle' | 'rounded';

function drawEmote(
	canvas: HTMLCanvasElement,
	img: HTMLImageElement | null,
	opts: { size: number; shape: Shape; radius: number; outline: number; outlineColor: string; padding: number }
) {
	const ctx = canvas.getContext('2d');
	if (!ctx) return;
	const { size, shape, radius, outline, outlineColor, padding } = opts;
	canvas.width = size;
	canvas.height = size;

	ctx.clearRect(0, 0, size, size);

	// Mask
	const inner = Math.max(0, size - padding * 2);
	const x = padding;
	const y = padding;
	ctx.save();
	ctx.beginPath();
	if (shape === 'circle') {
		ctx.arc(size / 2, size / 2, inner / 2, 0, Math.PI * 2);
	} else if (shape === 'rounded') {
		const r = Math.max(0, Math.min(radius, inner / 2));
		ctx.moveTo(x + r, y);
		ctx.lineTo(x + inner - r, y);
		ctx.quadraticCurveTo(x + inner, y, x + inner, y + r);
		ctx.lineTo(x + inner, y + inner - r);
		ctx.quadraticCurveTo(x + inner, y + inner, x + inner - r, y + inner);
		ctx.lineTo(x + r, y + inner);
		ctx.quadraticCurveTo(x, y + inner, x, y + inner - r);
		ctx.lineTo(x, y + r);
		ctx.quadraticCurveTo(x, y, x + r, y);
	} else {
		// square
		ctx.rect(x, y, inner, inner);
	}
	ctx.closePath();
	ctx.clip();

	// Image cover
	if (img) {
		const scale = Math.max(inner / img.width, inner / img.height);
		const w = Math.floor(img.width * scale);
		const h = Math.floor(img.height * scale);
		const dx = x + Math.floor((inner - w) / 2);
		const dy = y + Math.floor((inner - h) / 2);
		ctx.drawImage(img as unknown as CanvasImageSource, dx, dy, w, h);
	}

	ctx.restore();

	// Outline (stroke outside)
	if (outline > 0) {
		ctx.strokeStyle = outlineColor;
		ctx.lineWidth = outline;
		ctx.beginPath();
		if (shape === 'circle') {
			ctx.arc(size / 2, size / 2, inner / 2 + outline / 2 - 0.5, 0, Math.PI * 2);
		} else if (shape === 'rounded') {
			const r = Math.max(0, Math.min(radius, inner / 2));
			const ox = x - outline / 2 + 0.5;
			const oy = y - outline / 2 + 0.5;
			const ow = inner + outline - 1;
			const oh = inner + outline - 1;
			ctx.moveTo(ox + r, oy);
			ctx.lineTo(ox + ow - r, oy);
			ctx.quadraticCurveTo(ox + ow, oy, ox + ow, oy + r);
			ctx.lineTo(ox + ow, oy + oh - r);
			ctx.quadraticCurveTo(ox + ow, oy + oh, ox + ow - r, oy + oh);
			ctx.lineTo(ox + r, oy + oh);
			ctx.quadraticCurveTo(ox, oy + oh, ox, oy + oh - r);
			ctx.lineTo(ox, oy + r);
			ctx.quadraticCurveTo(ox, oy, ox + r, oy);
		} else {
			ctx.rect(x - outline / 2 + 0.5, y - outline / 2 + 0.5, inner + outline - 1, inner + outline - 1);
		}
		ctx.stroke();
	}
}

export default function EmotesPage() {
	// Track tool usage for gamification
	useToolTracking('emote');

	const [image, setImage] = useState<HTMLImageElement | null>(null);
	const [size, setSize] = useState(128);
	const [shape, setShape] = useState<Shape>('circle');
	const [radius, setRadius] = useState(24);
	const [outline, setOutline] = useState(2);
	const [outlineColor, setOutlineColor] = useState('#000000');
	const [padding, setPadding] = useState(0);

	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const preview = useMemo(() => {
		const canvas = canvasRef.current;
		if (!canvas) return '';
		drawEmote(canvas, image, { size, shape, radius, outline, outlineColor, padding });
		return canvas.toDataURL('image/png');
	}, [image, size, shape, radius, outline, outlineColor, padding]);

	const onFile = useCallback((file: File | null) => {
		if (!file) { setImage(null); return; }
		const reader = new FileReader();
		reader.onload = () => {
			const img = new Image();
			img.onload = () => setImage(img);
			img.src = String(reader.result || '');
		};
		reader.readAsDataURL(file);
	}, []);

	const handleDownload = useCallback(() => {
		if (!preview) return;
		const a = document.createElement('a');
		a.href = preview;
		a.download = `aoa-emote-${size}.png`;
		a.click();
	}, [preview, size]);

	return (
		<div className="min-h-screen relative">
			<Nav />
			<div className="pointer-events-none absolute inset-0 -z-10">
				<div className="absolute -top-24 -left-24 w-96 h-96 rounded-full blur-3xl" style={{ background: 'radial-gradient(closest-side, rgba(34,211,238,0.18), transparent)' }} />
				<div className="absolute top-1/3 -right-16 w-[28rem] h-[28rem] rounded-full blur-3xl" style={{ background: 'radial-gradient(closest-side, rgba(16,185,129,0.16), transparent)' }} />
			</div>
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-28">
				<h1 className="text-4xl md:text-5xl font-bold mb-6 text-hero-blue">Emote / Emoji Maker</h1>
				<p className="text-off-white/80 max-w-3xl mb-6">Upload an image, choose size/shape, add outline, and export small emotes.</p>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					<div className="lg:col-span-1 space-y-6 lg:sticky lg:top-28 self-start">
						<div className="glass-dark rounded-xl p-5 space-y-4">
							<div>
								<div className="text-xs uppercase tracking-wide text-off-white/60 mb-2">Image</div>
								<input type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0] || null)} className="w-full text-sm"/>
							</div>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								<label className="text-xs text-off-white/70">Size
									<select value={size} onChange={(e) => setSize(parseInt(e.target.value))} className="theme-select mt-2 w-full px-2 py-1.5 text-sm">
										<option value={32}>32</option>
										<option value={48}>48</option>
										<option value={64}>64</option>
										<option value={72}>72</option>
										<option value={96}>96</option>
										<option value={128}>128</option>
										<option value={256}>256</option>
									</select>
								</label>
								<label className="text-xs text-off-white/70">Shape
									<div className="mt-2 flex gap-2">
										<button onClick={() => setShape('circle')} className={`px-3 py-2 rounded-lg border ${shape === 'circle' ? 'border-hero-blue bg-hero-blue/20' : 'border-white/10 hover:bg-white/5'}`}><Circle className="w-4 h-4"/></button>
										<button onClick={() => setShape('square')} className={`px-3 py-2 rounded-lg border ${shape === 'square' ? 'border-hero-blue bg-hero-blue/20' : 'border-white/10 hover:bg-white/5'}`}><Square className="w-4 h-4"/></button>
										<button onClick={() => setShape('rounded')} className={`px-3 py-2 rounded-lg border ${shape === 'rounded' ? 'border-hero-blue bg-hero-blue/20' : 'border-white/10 hover:bg-white/5'}`}><Wand2 className="w-4 h-4"/></button>
									</div>
								</label>
								{shape === 'rounded' && (
									<label className="text-xs text-off-white/70">Corner Radius
										<input type="range" min={0} max={64} value={radius} onChange={(e) => setRadius(parseInt(e.target.value))} className="mt-2 w-full"/>
									</label>
								)}
								<label className="text-xs text-off-white/70">Padding
									<input type="range" min={0} max={24} value={padding} onChange={(e) => setPadding(parseInt(e.target.value))} className="mt-2 w-full"/>
								</label>
								<label className="text-xs text-off-white/70">Outline
									<input type="range" min={0} max={16} value={outline} onChange={(e) => setOutline(parseInt(e.target.value))} className="mt-2 w-full"/>
								</label>
								<label className="text-xs text-off-white/70">Outline Color
									<input type="color" value={outlineColor} onChange={(e) => setOutlineColor(e.target.value)} className="mt-2 h-8 w-full bg-transparent border border-white/10 rounded"/>
								</label>
							</div>
						</div>
					</div>

					<div className="lg:col-span-2">
						<div className="glass-dark rounded-xl p-5">
							<div className="flex items-center justify-between mb-3">
								<h2 className="font-semibold text-off-white/90">Preview</h2>
								<button onClick={handleDownload} disabled={!preview} className="px-3 py-1.5 rounded-lg bg-hero-blue/20 border border-hero-blue/40 hover:bg-hero-blue/30 disabled:opacity-50 flex items-center gap-2">
									<Download className="w-4 h-4"/>
									Download PNG
								</button>
							</div>
							<div className="relative w-full overflow-hidden rounded-lg glass-dark p-6 flex items-center justify-center">
								<canvas ref={canvasRef} className="hidden"/>
								{preview ? (
									<SafeImage src={preview} alt="Preview" className="w-40 h-40 rounded-lg border border-white/10 object-contain bg-black/20" width={160} height={160} unoptimized />
								) : (
									<div className="aspect-square w-40 flex items-center justify-center text-off-white/60 text-sm bg-[linear-gradient(45deg,rgba(255,255,255,0.04)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.04)_50%,rgba(255,255,255,0.04)_75%,transparent_75%,transparent)] bg-[length:20px_20px] rounded">
										Upload an image to start.
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
			<Footer />
		</div>
	);
}


