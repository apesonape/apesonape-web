'use client';
export const dynamic = 'force-dynamic';

import React, { useCallback, useMemo, useRef, useState } from 'react';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import { Download } from 'lucide-react';
import SafeImage from '@/app/components/SafeImage';
import { useToolTracking } from '@/app/hooks/useToolTracking';

type Layout = '2x2' | '3x3' | '3x2' | '4x3';

function gridDims(layout: Layout): { rows: number; cols: number; aspect: number } {
	switch (layout) {
		case '2x2': return { rows: 2, cols: 2, aspect: 1 };
		case '3x3': return { rows: 3, cols: 3, aspect: 1 };
		case '3x2': return { rows: 2, cols: 3, aspect: 3 / 2 };
		case '4x3': return { rows: 3, cols: 4, aspect: 4 / 3 };
		default: return { rows: 2, cols: 2, aspect: 1 };
	}
}

function drawCollage(
	canvas: HTMLCanvasElement,
	images: HTMLImageElement[],
	opts: { layout: Layout; spacing: number; bgColor: string; outSize: number }
) {
	const ctx = canvas.getContext('2d');
	if (!ctx) return;
	const { layout, spacing, bgColor, outSize } = opts;
	const { rows, cols, aspect } = gridDims(layout);

	// Canvas size
	const width = outSize;
	const height = Math.round(outSize / aspect);
	canvas.width = width;
	canvas.height = height;

	ctx.clearRect(0, 0, width, height);
	ctx.fillStyle = bgColor;
	ctx.fillRect(0, 0, width, height);

	const totalSpacingX = spacing * (cols + 1);
	const totalSpacingY = spacing * (rows + 1);
	const cellW = Math.floor((width - totalSpacingX) / cols);
	const cellH = Math.floor((height - totalSpacingY) / rows);

	for (let r = 0; r < rows; r++) {
		for (let c = 0; c < cols; c++) {
			const idx = r * cols + c;
			const x = spacing + c * (cellW + spacing);
			const y = spacing + r * (cellH + spacing);
			const img = images[idx];
			if (!img) {
				// empty slot
				ctx.fillStyle = 'rgba(255,255,255,0.05)';
				ctx.fillRect(x, y, cellW, cellH);
				continue;
			}
			// cover fit
			const scale = Math.max(cellW / img.width, cellH / img.height);
			const w = Math.floor(img.width * scale);
			const h = Math.floor(img.height * scale);
			const dx = x + Math.floor((cellW - w) / 2);
			const dy = y + Math.floor((cellH - h) / 2);
			ctx.drawImage(img as unknown as CanvasImageSource, dx, dy, w, h);
		}
	}
}

export default function CollagePage() {
	// Track tool usage for gamification
	useToolTracking('collage');

	const [files, setFiles] = useState<File[]>([]);
	const [images, setImages] = useState<HTMLImageElement[]>([]);
	const [layout, setLayout] = useState<Layout>('3x3');
	const [spacing, setSpacing] = useState(8);
	const [bgColor, setBgColor] = useState('#030712');
	const [outSize, setOutSize] = useState(2048);

	const canvasRef = useRef<HTMLCanvasElement | null>(null);

	const preview = useMemo(() => {
		const canvas = canvasRef.current;
		if (!canvas) return '';
		drawCollage(canvas, images, { layout, spacing, bgColor, outSize });
		return canvas.toDataURL('image/png');
	}, [images, layout, spacing, bgColor, outSize]);

	const onFiles = useCallback((list: FileList | null) => {
		const arr = Array.from(list || []).slice(0, 36);
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

	const handleDownload = useCallback(() => {
		const url = preview;
		if (!url) return;
		const a = document.createElement('a');
		a.href = url;
		a.download = `aoa-collage-${layout}.png`;
		a.click();
	}, [preview, layout]);

	return (
		<div className="min-h-screen relative">
			<Nav />
			<div className="pointer-events-none absolute inset-0 -z-10">
				<div className="absolute -top-24 -left-24 w-96 h-96 rounded-full blur-3xl" style={{ background: 'radial-gradient(closest-side, rgba(34,211,238,0.18), transparent)' }} />
				<div className="absolute top-1/3 -right-16 w-[28rem] h-[28rem] rounded-full blur-3xl" style={{ background: 'radial-gradient(closest-side, rgba(16,185,129,0.16), transparent)' }} />
			</div>
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-28">
				<h1 className="text-4xl md:text-5xl font-bold mb-6 text-hero-blue">Collage / Moodboard</h1>
				<p className="text-off-white/80 max-w-3xl mb-6">Drop multiple images, pick a grid, spacing, and background, then export.</p>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					<div className="lg:col-span-1 space-y-6 lg:sticky lg:top-28 self-start">
						<div className="glass-dark rounded-xl p-5 space-y-4">
							<div>
								<div className="text-xs uppercase tracking-wide text-off-white/60 mb-2">Images</div>
								<label className="block">
									<input
										type="file"
										accept="image/*"
										multiple
										onChange={(e) => onFiles(e.target.files)}
										className="w-full text-sm"
									/>
								</label>
								{files.length > 0 && (
									<div className="text-xs text-off-white/60 mt-2">{files.length} selected</div>
								)}
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								<label className="text-xs text-off-white/70">Layout
									<select value={layout} onChange={(e) => setLayout(e.target.value as Layout)} className="mt-2 theme-select w-full px-2 py-1.5 text-sm">
										<option value="2x2">2 x 2</option>
										<option value="3x3">3 x 3</option>
										<option value="3x2">3 x 2</option>
										<option value="4x3">4 x 3</option>
									</select>
								</label>
								<label className="text-xs text-off-white/70">Spacing
									<input type="range" min={0} max={48} value={spacing} onChange={(e) => setSpacing(parseInt(e.target.value))}
										className="mt-2 w-full"/>
								</label>
								<label className="text-xs text-off-white/70">Background
									<input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)}
										className="mt-2 h-8 w-full bg-transparent border border-white/10 rounded"/>
								</label>
								<label className="text-xs text-off-white/70">Export Size (width)
									<select value={outSize} onChange={(e) => setOutSize(parseInt(e.target.value))} className="mt-2 theme-select w-full px-2 py-1.5 text-sm">
										<option value={1024}>1024</option>
										<option value={1536}>1536</option>
										<option value={2048}>2048</option>
										<option value={3072}>3072</option>
										<option value={4096}>4096</option>
									</select>
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
									<SafeImage src={preview} alt="Preview" className="w-full h-auto rounded-lg border border-white/10 object-contain bg-black/20" width={800} height={600} unoptimized />
								) : (
									<div className="aspect-video w-full flex items-center justify-center text-off-white/60 text-sm bg-[linear-gradient(45deg,rgba(255,255,255,0.04)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.04)_50%,rgba(255,255,255,0.04)_75%,transparent_75%,transparent)] bg-[length:20px_20px] rounded">
										Add multiple images to start.
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


