'use client';
export const dynamic = 'force-dynamic';

import React, { useCallback, useMemo, useRef, useState } from 'react';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import { Download, Circle, Square, Badge } from 'lucide-react';
import SafeImage from '@/app/components/SafeImage';
import { useToolTracking } from '@/app/hooks/useToolTracking';

type Shape = 'circle' | 'rounded';

function drawPfp(
	canvas: HTMLCanvasElement,
	img: HTMLImageElement | null,
	opts: {
		size: number;
		shape: Shape;
		radius: number;
		ringColor: string;
		ringWidth: number; // px
		bgColor: string;
		badgeText?: string;
		badgeBg?: string;
		badgeTextColor?: string;
		badgeFontPx?: number;
	}
) {
	const ctx = canvas.getContext('2d');
	if (!ctx) return;
	const { size, shape, radius, ringColor, ringWidth, bgColor, badgeText, badgeBg, badgeTextColor, badgeFontPx } = opts;
	canvas.width = size;
	canvas.height = size;

	// Background
	ctx.clearRect(0, 0, size, size);
	ctx.fillStyle = bgColor;
	ctx.fillRect(0, 0, size, size);

	// Mask
	ctx.save();
	ctx.beginPath();
	if (shape === 'circle') {
		ctx.arc(size / 2, size / 2, (size - ringWidth) / 2, 0, Math.PI * 2);
	} else {
		const r = Math.max(0, Math.min(radius, size / 2));
		const pad = ringWidth / 2;
		const x = pad, y = pad, w = size - ringWidth, h = size - ringWidth;
		ctx.moveTo(x + r, y);
		ctx.lineTo(x + w - r, y);
		ctx.quadraticCurveTo(x + w, y, x + w, y + r);
		ctx.lineTo(x + w, y + h - r);
		ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
		ctx.lineTo(x + r, y + h);
		ctx.quadraticCurveTo(x, y + h, x, y + h - r);
		ctx.lineTo(x, y + r);
		ctx.quadraticCurveTo(x, y, x + r, y);
	}
	ctx.closePath();
	ctx.clip();

	// Image
	if (img) {
		// Cover behavior
		const scale = Math.max(size / img.width, size / img.height);
		const w = Math.floor(img.width * scale);
		const h = Math.floor(img.height * scale);
		const dx = Math.floor((size - w) / 2);
		const dy = Math.floor((size - h) / 2);
		ctx.drawImage(img as unknown as CanvasImageSource, dx, dy, w, h);
	} else {
		ctx.fillStyle = '#0b1220';
		ctx.fillRect(0, 0, size, size);
	}
	ctx.restore();

	// Ring
	if (ringWidth > 0) {
		ctx.strokeStyle = ringColor;
		ctx.lineWidth = ringWidth;
		if (shape === 'circle') {
			ctx.beginPath();
			ctx.arc(size / 2, size / 2, (size - ringWidth) / 2 + ringWidth / 2, 0, Math.PI * 2);
			ctx.stroke();
		} else {
			// Outer rounded rect border
			const r = Math.max(0, Math.min(radius, size / 2));
			const x = ringWidth / 2, y = ringWidth / 2, w = size - ringWidth, h = size - ringWidth;
			ctx.beginPath();
			ctx.moveTo(x + r, y);
			ctx.lineTo(x + w - r, y);
			ctx.quadraticCurveTo(x + w, y, x + w, y + r);
			ctx.lineTo(x + w, y + h - r);
			ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
			ctx.lineTo(x + r, y + h);
			ctx.quadraticCurveTo(x, y + h, x, y + h - r);
			ctx.lineTo(x, y + r);
			ctx.quadraticCurveTo(x, y, x + r, y);
			ctx.closePath();
			ctx.stroke();
		}
	}

	// Badge
	if ((badgeText || '').trim()) {
		const padX = 14;
		const padY = 8;
		const computed = Math.round(size * 0.026);
		const fontPx = Math.min(128, Math.max(12, Math.round(badgeFontPx ?? computed)));
		ctx.font = `700 ${fontPx}px system-ui, Segoe UI, Arial`;
		ctx.textBaseline = 'middle';
		const label = String(badgeText);
		const tw = ctx.measureText(label).width;
		const bw = tw + padX * 2;
		const bh = fontPx + padY * 2;
		const bx = Math.floor((size - bw) / 2);
		const by = size - bh - 14;
		// bg
		ctx.fillStyle = badgeBg || 'rgba(0,0,0,0.6)';
		ctx.beginPath();
		const r2 = 8;
		ctx.moveTo(bx + r2, by);
		ctx.lineTo(bx + bw - r2, by);
		ctx.quadraticCurveTo(bx + bw, by, bx + bw, by + r2);
		ctx.lineTo(bx + bw, by + bh - r2);
		ctx.quadraticCurveTo(bx + bw, by + bh, bx + bw - r2, by + bh);
		ctx.lineTo(bx + r2, by + bh);
		ctx.quadraticCurveTo(bx, by + bh, bx, by + bh - r2);
		ctx.lineTo(bx, by + r2);
		ctx.quadraticCurveTo(bx, by, bx + r2, by);
		ctx.closePath();
		ctx.fill();
		// text
		ctx.fillStyle = badgeTextColor || '#ffffff';
		ctx.fillText(label, bx + padX, by + Math.floor(bh / 2));
	}
}

export default function PfpBorderPage() {
	// Track tool usage for gamification
	useToolTracking('pfp_border');

	const [image, setImage] = useState<HTMLImageElement | null>(null);
	const [size, setSize] = useState(1024);
	const [shape, setShape] = useState<Shape>('circle');
	const [radius, setRadius] = useState(120);
	const [ringColor, setRingColor] = useState('#22d3ee');
	const [ringWidth, setRingWidth] = useState(24);
	const [bgColor, setBgColor] = useState('#030712');
	const [badgeText, setBadgeText] = useState('');
	const [badgeBg, setBadgeBg] = useState('#111827');
	const [badgeTextColor, setBadgeTextColor] = useState('#ffffff');
	const [badgeFontPx, setBadgeFontPx] = useState<number>(28);

	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const preview = useMemo(() => {
		const canvas = canvasRef.current;
		if (!canvas) return '';
		drawPfp(canvas, image, { size, shape, radius, ringColor, ringWidth, bgColor, badgeText, badgeBg, badgeTextColor, badgeFontPx });
		return canvas.toDataURL('image/png');
	}, [image, size, shape, radius, ringColor, ringWidth, bgColor, badgeText, badgeBg, badgeTextColor, badgeFontPx]);

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
		const url = preview;
		if (!url) return;
		const a = document.createElement('a');
		a.href = url;
		a.download = `aoa-pfp-${shape}-${size}.png`;
		a.click();
	}, [preview, shape, size]);

	return (
		<div className="min-h-screen relative">
			<Nav />
			<div className="pointer-events-none absolute inset-0 -z-10">
				<div className="absolute -top-24 -left-24 w-96 h-96 rounded-full blur-3xl" style={{ background: 'radial-gradient(closest-side, rgba(34,211,238,0.18), transparent)' }} />
				<div className="absolute top-1/3 -right-16 w-[28rem] h-[28rem] rounded-full blur-3xl" style={{ background: 'radial-gradient(closest-side, rgba(16,185,129,0.16), transparent)' }} />
			</div>
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-28">
				<h1 className="text-4xl md:text-5xl font-bold mb-6 text-hero-blue">PFP Border Generator</h1>
				<p className="text-off-white/80 max-w-3xl mb-6">Upload your image, add a ring or rounded border, and export a square PFP.</p>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					<div className="lg:col-span-1 space-y-6 lg:sticky lg:top-28 self-start">
						<div className="glass-dark rounded-xl p-5 space-y-4">
							<div>
								<div className="text-xs uppercase tracking-wide text-off-white/60 mb-2">Image</div>
								<label className="block">
									<input
										type="file"
										accept="image/*"
										onChange={(e) => onFile(e.target.files?.[0] || null)}
										className="w-full text-sm"
									/>
								</label>
							</div>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								<label className="text-xs text-off-white/70">Size
									<select value={size} onChange={(e) => setSize(parseInt(e.target.value))}
										className="theme-select mt-2 w-full px-2 py-1.5 text-sm">
										<option value={512}>512 x 512</option>
										<option value={1024}>1024 x 1024</option>
										<option value={2048}>2048 x 2048</option>
										<option value={4096}>4096 x 4096</option>
									</select>
								</label>
								<label className="text-xs text-off-white/70">Background
									<input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)}
										className="mt-2 h-8 w-full bg-transparent border border-white/10 rounded"/>
								</label>
								<label className="text-xs text-off-white/70">Shape
									<div className="mt-2 flex gap-2">
										<button onClick={() => setShape('circle')}
											className={`px-3 py-2 rounded-lg border ${shape === 'circle' ? 'border-hero-blue bg-hero-blue/20' : 'border-white/10 hover:bg-white/5'}`}>
											<Circle className="w-4 h-4"/>
										</button>
										<button onClick={() => setShape('rounded')}
											className={`px-3 py-2 rounded-lg border ${shape === 'rounded' ? 'border-hero-blue bg-hero-blue/20' : 'border-white/10 hover:bg-white/5'}`}>
											<Square className="w-4 h-4"/>
										</button>
									</div>
								</label>
								{shape === 'rounded' && (
									<label className="text-xs text-off-white/70">Corner Radius
										<input type="range" min={0} max={200} value={radius} onChange={(e) => setRadius(parseInt(e.target.value))}
											className="mt-2 w-full"/>
									</label>
								)}
								<label className="text-xs text-off-white/70">Ring Color
									<input type="color" value={ringColor} onChange={(e) => setRingColor(e.target.value)}
										className="mt-2 h-8 w-full bg-transparent border border-white/10 rounded"/>
								</label>
								<label className="text-xs text-off-white/70">Ring Width
									<input type="range" min={0} max={80} value={ringWidth} onChange={(e) => setRingWidth(parseInt(e.target.value))}
										className="mt-2 w-full"/>
								</label>
							</div>
						</div>

						<div className="glass-dark rounded-xl p-5 space-y-3">
							<div className="font-semibold text-ape-gold flex items-center gap-2"><Badge className="w-4 h-4"/> Badge (optional)</div>
							<input
								placeholder="e.g. AOA"
								value={badgeText}
								onChange={(e) => setBadgeText(e.target.value)}
								className="w-full bg-transparent border border-white/10 rounded px-3 py-2"
							/>
							<div className="grid grid-cols-2 gap-3">
								<label className="text-xs text-off-white/70">Badge BG
									<input type="color" value={badgeBg} onChange={(e) => setBadgeBg(e.target.value)}
										className="mt-2 h-8 w-full bg-transparent border border-white/10 rounded"/>
								</label>
								<label className="text-xs text-off-white/70">Badge Text
									<input type="color" value={badgeTextColor} onChange={(e) => setBadgeTextColor(e.target.value)}
										className="mt-2 h-8 w-full bg-transparent border border-white/10 rounded"/>
								</label>
							</div>
							<div className="grid grid-cols-1 gap-3">
								<label className="text-xs text-off-white/70">Badge Font Size ({badgeFontPx}px)
									<input
										type="range"
										min={12}
										max={128}
										step={1}
										value={badgeFontPx}
										onChange={(e) => setBadgeFontPx(parseInt(e.target.value))}
										className="mt-2 w-full"
									/>
								</label>
							</div>
						</div>
					</div>

					<div className="lg:col-span-2">
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
							<div className="relative w-full overflow-hidden rounded-lg glass-dark p-6 flex items-center justify-center">
								<canvas ref={canvasRef} className="hidden" />
								{preview ? (
									<SafeImage src={preview} alt="Preview" className="w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-lg border border-white/10 object-contain bg-black/20" width={384} height={384} unoptimized />
								) : (
									<div className="aspect-square w-64 sm:w-80 md:w-96 flex items-center justify-center text-off-white/60 text-sm bg-[linear-gradient(45deg,rgba(255,255,255,0.04)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.04)_50%,rgba(255,255,255,0.04)_75%,transparent_75%,transparent)] bg-[length:20px_20px] rounded">
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

