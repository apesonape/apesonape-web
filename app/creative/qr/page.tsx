'use client';
export const dynamic = 'force-dynamic';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import { Download, Type } from 'lucide-react';
import SafeImage from '@/app/components/SafeImage';
import { useToolTracking } from '@/app/hooks/useToolTracking';

async function loadQrImage(data: string, size: number, color: string, bgColor: string, margin: number): Promise<HTMLImageElement> {
	const hex = (s: string) => s.replace('#', '');
	const url = new URL('https://api.qrserver.com/v1/create-qr-code/');
	url.searchParams.set('size', `${size}x${size}`);
	url.searchParams.set('data', data);
	url.searchParams.set('margin', String(margin));
	url.searchParams.set('color', hex(color));
	url.searchParams.set('bgcolor', hex(bgColor));

	return new Promise((resolve, reject) => {
		const img = new Image();
		img.crossOrigin = 'anonymous';
		img.onload = () => resolve(img);
		img.onerror = reject;
		img.src = url.toString();
	});
}

function drawQrBadge(
	canvas: HTMLCanvasElement,
	qrImg: HTMLImageElement | null,
	opts: { size: number; padding: number; caption: string; captionColor: string; captionBgAlpha: number; rounded: boolean }
) {
	const ctx = canvas.getContext('2d');
	if (!ctx) return;
	const { size, padding, caption, captionColor, captionBgAlpha, rounded } = opts;
	const captionH = caption.trim() ? 56 : 0;
	const width = size;
	const height = size + captionH;
	canvas.width = width;
	canvas.height = height;

	// Background
	ctx.clearRect(0, 0, width, height);

	// QR
	if (qrImg) {
		if (rounded) {
			const r = 16;
			ctx.save();
			ctx.beginPath();
			ctx.moveTo(padding + r, padding);
			ctx.lineTo(width - padding - r, padding);
			ctx.quadraticCurveTo(width - padding, padding, width - padding, padding + r);
			ctx.lineTo(width - padding, width - padding - r);
			ctx.quadraticCurveTo(width - padding, width - padding, width - padding - r, width - padding);
			ctx.lineTo(padding + r, width - padding);
			ctx.quadraticCurveTo(padding, width - padding, padding, width - padding - r);
			ctx.lineTo(padding, padding + r);
			ctx.quadraticCurveTo(padding, padding, padding + r, padding);
			ctx.closePath();
			ctx.clip();
			ctx.drawImage(qrImg as unknown as CanvasImageSource, padding, padding, width - padding * 2, width - padding * 2);
			ctx.restore();
		} else {
			ctx.drawImage(qrImg as unknown as CanvasImageSource, padding, padding, width - padding * 2, width - padding * 2);
		}
	}

	// Caption
	if (captionH > 0) {
		ctx.fillStyle = `rgba(0,0,0,${Math.max(0, Math.min(1, captionBgAlpha))})`;
		ctx.fillRect(0, width, width, captionH);
		ctx.font = '700 20px system-ui, Segoe UI, Arial';
		ctx.fillStyle = captionColor;
		ctx.textBaseline = 'middle';
		const text = caption;
		const tw = ctx.measureText(text).width;
		ctx.fillText(text, Math.max(16, (width - tw) / 2), width + captionH / 2);
	}
}

export default function QrBadgePage() {
	// Track tool usage for gamification
	useToolTracking('qr');

	const [text, setText] = useState('https://apesonape.io');
	const [size, setSize] = useState(1024);
	const [fg, setFg] = useState('#000000');
	const [bg, setBg] = useState('#ffffff');
	const [padding, setPadding] = useState(16);
	const [margin, setMargin] = useState(0);
	const [caption, setCaption] = useState('@ApesOnApe');
	const [captionColor, setCaptionColor] = useState('#ffffff');
	const [captionBgAlpha, setCaptionBgAlpha] = useState(0.5);
	const [rounded, setRounded] = useState(true);

	const [qrImg, setQrImg] = useState<HTMLImageElement | null>(null);
	const canvasRef = useRef<HTMLCanvasElement | null>(null);

	useEffect(() => {
		let active = true;
		(async () => {
			try {
				const img = await loadQrImage(text, size, fg, bg, margin);
				if (active) setQrImg(img);
			} catch {
				if (active) setQrImg(null);
			}
		})();
		return () => { active = false; };
	}, [text, size, fg, bg, margin]);

	const preview = useMemo(() => {
		const canvas = canvasRef.current;
		if (!canvas) return '';
		drawQrBadge(canvas, qrImg, { size, padding, caption, captionColor, captionBgAlpha, rounded });
		return canvas.toDataURL('image/png');
	}, [qrImg, size, padding, caption, captionColor, captionBgAlpha, rounded]);

	const handleDownload = useCallback(() => {
		if (!preview) return;
		const a = document.createElement('a');
		a.href = preview;
		a.download = 'aoa-qr.png';
		a.click();
	}, [preview]);

	return (
		<div className="min-h-screen relative">
			<Nav />
			<div className="pointer-events-none absolute inset-0 -z-10">
				<div className="absolute -top-24 -left-24 w-96 h-96 rounded-full blur-3xl" style={{ background: 'radial-gradient(closest-side, rgba(34,211,238,0.18), transparent)' }} />
				<div className="absolute top-1/3 -right-16 w-[28rem] h-[28rem] rounded-full blur-3xl" style={{ background: 'radial-gradient(closest-side, rgba(16,185,129,0.16), transparent)' }} />
			</div>
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-28">
				<h1 className="text-4xl md:text-5xl font-bold mb-6 text-hero-blue">QR / Badge Maker</h1>
				<p className="text-off-white/80 max-w-3xl mb-6">Create a branded QR with caption and rounded frame. Exports PNG.</p>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					<div className="lg:col-span-1 space-y-6 lg:sticky lg:top-28 self-start">
						<div className="glass-dark rounded-xl p-5 space-y-4">
							<label className="text-xs text-off-white/70">Text / URL
								<input value={text} onChange={(e) => setText(e.target.value)} className="mt-2 w-full bg-transparent border border-white/10 rounded px-3 py-2" placeholder="https://..."/>
							</label>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								<label className="text-xs text-off-white/70">Size
									<select value={size} onChange={(e) => setSize(parseInt(e.target.value))} className="mt-2 theme-select w-full px-2 py-1.5 text-sm">
										<option value={512}>512</option>
										<option value={768}>768</option>
										<option value={1024}>1024</option>
										<option value={2048}>2048</option>
									</select>
								</label>
								<label className="text-xs text-off-white/70">Padding
									<input type="range" min={0} max={64} value={padding} onChange={(e) => setPadding(parseInt(e.target.value))} className="mt-2 w-full"/>
								</label>
								<label className="text-xs text-off-white/70">QR Margin
									<input type="range" min={0} max={16} value={margin} onChange={(e) => setMargin(parseInt(e.target.value))} className="mt-2 w-full"/>
								</label>
								<label className="text-xs text-off-white/70">Foreground
									<input type="color" value={fg} onChange={(e) => setFg(e.target.value)} className="mt-2 h-8 w-full bg-transparent border border-white/10 rounded"/>
								</label>
								<label className="text-xs text-off-white/70">Background
									<input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="mt-2 h-8 w-full bg-transparent border border-white/10 rounded"/>
								</label>
								<label className="flex items-center gap-2 text-xs text-off-white/80">
									<input type="checkbox" checked={rounded} onChange={(e) => setRounded(e.target.checked)} className="accent-neon-cyan"/>
									Rounded Frame
								</label>
							</div>
						</div>

						<div className="glass-dark rounded-xl p-5 space-y-3">
							<div className="font-semibold text-ape-gold flex items-center gap-2"><Type className="w-4 h-4"/> Caption</div>
							<input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="@handle or label" className="w-full bg-transparent border border-white/10 rounded px-3 py-2"/>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								<label className="text-xs text-off-white/70">Text Color
									<input type="color" value={captionColor} onChange={(e) => setCaptionColor(e.target.value)} className="mt-2 h-8 w-full bg-transparent border border-white/10 rounded"/>
								</label>
								<label className="text-xs text-off-white/70">BG Opacity
									<input type="range" min={0} max={1} step={0.05} value={captionBgAlpha} onChange={(e) => setCaptionBgAlpha(parseFloat(e.target.value))} className="mt-2 w-full"/>
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
									<SafeImage src={preview} alt="Preview" className="w-full h-auto rounded-lg border border-white/10 object-contain bg-black/20" width={600} height={600} unoptimized priority />
								) : (
									<div className="aspect-square w-full flex items-center justify-center text-off-white/60 text-sm bg-[linear-gradient(45deg,rgba(255,255,255,0.04)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.04)_50%,rgba(255,255,255,0.04)_75%,transparent_75%,transparent)] bg-[length:20px_20px] rounded">
										Generating QR...
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


