'use client';
export const dynamic = 'force-dynamic';

import React, { useCallback, useMemo, useRef, useState } from 'react';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import { Download } from 'lucide-react';
import { useToolTracking } from '@/app/hooks/useToolTracking';
import SafeImage from '@/app/components/SafeImage';

type Align = 'center' | 'left' | 'right';

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
	const words = text.split(/\s+/);
	const lines: string[] = [];
	let current = '';
	for (const w of words) {
		const test = current ? `${current} ${w}` : w;
		if (ctx.measureText(test).width <= maxWidth) {
			current = test;
		} else {
			if (current) lines.push(current);
			current = w;
		}
	}
	if (current) lines.push(current);
	return lines;
}

function drawMeme(
	canvas: HTMLCanvasElement,
	img: HTMLImageElement | null,
	opts: {
		top: string;
		bottom: string;
		fontFamily: string;
		fontSize: number;
		padding: number;
		color: string;
		strokeColor: string;
		strokeWidth: number;
		align: Align;
		exportWidth: number;
	}
) {
	const ctx = canvas.getContext('2d');
	if (!ctx) return;
	const { top, bottom, fontFamily, fontSize, padding, color, strokeColor, strokeWidth, align, exportWidth } = opts;

	// Base size
	const width = Math.max(512, Math.min(4096, exportWidth || 1024));
	const height = img
		? Math.max(512, Math.min(4096, Math.round(width * (img.height / img.width))))
		: width; // square if no image
	canvas.width = width;
	canvas.height = height;

	// Image cover
	ctx.clearRect(0, 0, width, height);
	if (img) {
		const scale = Math.max(width / img.width, height / img.height);
		const w = Math.floor(img.width * scale);
		const h = Math.floor(img.height * scale);
		const dx = Math.floor((width - w) / 2);
		const dy = Math.floor((height - h) / 2);
		ctx.drawImage(img as unknown as CanvasImageSource, dx, dy, w, h);
	} else {
		ctx.fillStyle = '#0b1220';
		ctx.fillRect(0, 0, width, height);
	}

	// Text
	ctx.textBaseline = 'top';
	ctx.lineJoin = 'round';
	ctx.lineWidth = strokeWidth;
	ctx.strokeStyle = strokeColor;
	ctx.fillStyle = color;
	ctx.font = `900 ${fontSize}px ${fontFamily}, Impact, Arial, sans-serif`;

	const maxTextWidth = width - padding * 2;

	function drawBlock(c: CanvasRenderingContext2D, lines: string[], y: number) {
		for (const line of lines) {
			let x: number;
			if (align === 'left') x = padding;
			else if (align === 'right') x = width - padding - c.measureText(line).width;
			else x = (width - c.measureText(line).width) / 2;
			if (strokeWidth > 0) c.strokeText(line, x, y);
			c.fillText(line, x, y);
			y += fontSize + 6;
		}
	}

	if (top.trim()) {
		const lines = wrapText(ctx, top.toUpperCase(), maxTextWidth);
		drawBlock(ctx, lines, padding);
	}

	if (bottom.trim()) {
		const lines = wrapText(ctx, bottom.toUpperCase(), maxTextWidth);
		const blockH = lines.length * (fontSize + 6);
		drawBlock(ctx, lines, height - padding - blockH);
	}
}

export default function MemeMakerPage() {
	// Track tool usage for gamification
	useToolTracking('meme');

	const [image, setImage] = useState<HTMLImageElement | null>(null);
	const [top, setTop] = useState('');
	const [bottom, setBottom] = useState('');
	const [fontFamily, setFontFamily] = useState('system-ui, Segoe UI');
	const [fontSize, setFontSize] = useState(64);
	const [padding, setPadding] = useState(32);
	const [color, setColor] = useState('#ffffff');
	const [strokeColor, setStrokeColor] = useState('#000000');
	const [strokeWidth, setStrokeWidth] = useState(6);
	const [align, setAlign] = useState<Align>('center');
	const [exportWidth, setExportWidth] = useState(2048);

	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const preview = useMemo(() => {
		const canvas = canvasRef.current;
		if (!canvas) return '';
		drawMeme(canvas, image, { top, bottom, fontFamily, fontSize, padding, color, strokeColor, strokeWidth, align, exportWidth });
		return canvas.toDataURL('image/png');
	}, [image, top, bottom, fontFamily, fontSize, padding, color, strokeColor, strokeWidth, align, exportWidth]);

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
		a.download = 'aoa-meme.png';
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
				<h1 className="text-4xl md:text-5xl font-bold mb-6 text-hero-blue">Meme/Text on Image</h1>
				<p className="text-off-white/80 max-w-3xl mb-6">Add classic meme text (with outline) to any image and export.</p>

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

							<div className="space-y-3">
								<label className="text-xs text-off-white/70">Top Text
									<input value={top} onChange={(e) => setTop(e.target.value)}
										placeholder="TOP TEXT"
										className="mt-2 w-full bg-transparent border border-white/10 rounded px-3 py-2"/>
								</label>
								<label className="text-xs text-off-white/70">Bottom Text
									<input value={bottom} onChange={(e) => setBottom(e.target.value)}
										placeholder="BOTTOM TEXT"
										className="mt-2 w-full bg-transparent border border-white/10 rounded px-3 py-2"/>
								</label>
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								<label className="text-xs text-off-white/70">Export Width
									<select value={exportWidth} onChange={(e) => setExportWidth(parseInt(e.target.value))} className="mt-2 theme-select w-full px-2 py-1.5 text-sm">
										<option value={1024}>1024</option>
										<option value={2048}>2048</option>
										<option value={4096}>4096</option>
									</select>
								</label>
								<label className="text-xs text-off-white/70">Font
									<select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} className="mt-2 theme-select w-full px-2 py-1.5 text-sm">
										<option value="Impact, Arial Black">Impact</option>
										<option value="system-ui, Segoe UI">System</option>
										<option value="Arial, Helvetica">Arial</option>
									</select>
								</label>
								<label className="text-xs text-off-white/70">Font Size
									<input type="range" min={24} max={400} value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))}
										className="mt-2 w-full"/>
								</label>
								<label className="text-xs text-off-white/70">Padding
									<input type="range" min={0} max={100} value={padding} onChange={(e) => setPadding(parseInt(e.target.value))}
										className="mt-2 w-full"/>
								</label>
								<label className="text-xs text-off-white/70">Align
									<select value={align} onChange={(e) => setAlign(e.target.value as Align)} className="mt-2 theme-select w-full px-2 py-1.5 text-sm">
										<option value="center">Center</option>
										<option value="left">Left</option>
										<option value="right">Right</option>
									</select>
								</label>
								<label className="text-xs text-off-white/70">Fill Color
									<input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="mt-2 h-8 w-full bg-transparent border border-white/10 rounded"/>
								</label>
								<label className="text-xs text-off-white/70">Outline Color
									<input type="color" value={strokeColor} onChange={(e) => setStrokeColor(e.target.value)} className="mt-2 h-8 w-full bg-transparent border border-white/10 rounded"/>
								</label>
								<label className="text-xs text-off-white/70">Outline Width
									<input type="range" min={0} max={16} value={strokeWidth} onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
										className="mt-2 w-full"/>
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
									<SafeImage src={preview} alt="Preview" className="w-full h-auto rounded-lg border border-white/10 object-contain bg-black/20" width={800} height={800} unoptimized />
								) : (
									<div className="aspect-video w-full flex items-center justify-center text-off-white/60 text-sm bg-[linear-gradient(45deg,rgba(255,255,255,0.04)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.04)_50%,rgba(255,255,255,0.04)_75%,transparent_75%,transparent)] bg-[length:20px_20px] rounded">
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


