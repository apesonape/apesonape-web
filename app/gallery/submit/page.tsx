'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { getSupabaseBrowserClient } from '@/lib/supabase';

function isVideo(file: File | null) {
	return !!file && file.type.startsWith('video/');
}

export default function GallerySubmitPage() {
	const [title, setTitle] = useState('');
	const [author, setAuthor] = useState('');
	const [wallet, setWallet] = useState('');
	const [file, setFile] = useState<File | null>(null);
	const [preview, setPreview] = useState<string | null>(null);
	const [artUrl, setArtUrl] = useState('');
	const [twitterUrl, setTwitterUrl] = useState('');
	const [category, setCategory] = useState<'fan_art' | 'spotlight'>('fan_art');
	const [busy, setBusy] = useState(false);
	const [doneId, setDoneId] = useState<number | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [uploadStatus, setUploadStatus] = useState<string | null>(null);

	const onFileChange = (f: File | null) => {
		setFile(f);
		setError(null);
		setUploadStatus(null);
		if (f) {
			const url = URL.createObjectURL(f);
			setPreview(url);
		} else {
			setPreview(null);
		}
	};

	const sanitizeName = (name: string) => name.replace(/[^a-zA-Z0-9._-]/g, '_');
	const randomId = (len = 8) => Math.random().toString(36).slice(2, 2 + len);

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setBusy(true);
		setDoneId(null);
		try {
			let uploadedUrl = '';
			if (file) {
				const isMediaOk = file.type.startsWith('image/') || file.type.startsWith('video/');
				if (!isMediaOk) throw new Error('Please upload an image or video file.');
				if (file.size > 50 * 1024 * 1024) throw new Error('File too large. Max 50MB.');
				setUploadStatus('Uploading file...');
				const supabase = getSupabaseBrowserClient();
				const bucket = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || 'gallery';
				const ext = file.name.split('.').pop() || (file.type.startsWith('video/') ? 'mp4' : 'png');
				const path = `submissions/${Date.now()}-${randomId()}.${sanitizeName(ext)}`;
				const { error: upErr } = await supabase.storage.from(bucket).upload(path, file, {
					cacheControl: '3600',
					upsert: false,
					contentType: file.type,
				});
				if (upErr) {
					const msg = `${upErr.message || ''}`;
					if (msg.toLowerCase().includes('bucket not found')) {
						throw new Error(`Storage bucket "${bucket}" not found. Create a public bucket named "${bucket}" in Supabase Storage or set NEXT_PUBLIC_SUPABASE_BUCKET to your bucket name.`);
					}
					throw new Error(msg || 'Upload failed');
				}
				const { data } = supabase.storage.from(bucket).getPublicUrl(path);
				uploadedUrl = data.publicUrl;
				setUploadStatus('');
			}

			const res = await fetch('/api/gallery/submit/', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					title,
					author,
					wallet,
					image_url: uploadedUrl,
					art_url: artUrl,
					twitter_url: twitterUrl,
					category,
				}),
			});
			const json = await res.json();
			if (!res.ok) throw new Error(json?.error || 'Failed to submit');
			setDoneId(json.id ?? null);
			setTitle('');
			setAuthor('');
			setWallet('');
			onFileChange(null);
			setArtUrl('');
			setTwitterUrl('');
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : 'Failed to submit');
		} finally {
			setBusy(false);
		}
	};

	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
			<div className="mb-6 flex items-center justify-between">
				<h1 className="text-2xl font-semibold" style={{ color: 'var(--foreground)' }}>Submit to Gallery</h1>
				<Link href="/gallery" className="btn-secondary">Back to Gallery</Link>
			</div>
			<form onSubmit={onSubmit} className="max-w-3xl mx-auto rounded-xl border border-white/20 bg-black/60 p-5 space-y-5 shadow-2xl">
				<p className="text-off-white/80 text-sm">Upload image or video (up to 50MB). PNG/JPG/MP4/WebM recommended.</p>
				<div>
					<label className="block text-sm mb-1">Title</label>
					<input value={title} onChange={e => setTitle(e.target.value)} required className="w-full rounded-md bg-black/40 border border-white/10 p-2" />
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
					<div>
						<label className="block text-sm mb-1">Author</label>
						<input value={author} onChange={e => setAuthor(e.target.value)} className="w-full rounded-md bg-black/40 border border-white/10 p-2" />
					</div>
					<div>
						<label className="block text-sm mb-1">Wallet (required)</label>
						<input value={wallet} onChange={e => setWallet(e.target.value)} required placeholder="0x..." className="w-full rounded-md bg-black/40 border border-white/10 p-2" />
						<p className="text-xs text-off-white/60 mt-1">Must own an NFT from the collection to submit. We verify ownership on-chain.</p>
					</div>
				</div>

				{/* Media Upload */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label className="block text-sm mb-2">Upload Media</label>
						<label className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-white/15 bg-black/40 hover:bg-black/30 transition-colors p-6 cursor-pointer">
							<input
								type="file"
								accept="image/*,video/*"
								className="hidden"
								onChange={e => onFileChange(e.target.files?.[0] || null)}
							/>
							<div className="text-center">
								<div className="text-off-white/80 text-sm">Drag & drop or click to upload</div>
								<div className="text-off-white/50 text-xs mt-1">PNG, JPG, MP4, WebM — Max 50MB</div>
							</div>
						</label>
						{uploadStatus && <p className="text-xs text-off-white/70 mt-2">{uploadStatus}</p>}
						{file && <p className="text-xs text-off-white/70 mt-2">Selected: {file.name}</p>}
					</div>
					<div>
						<label className="block text-sm mb-2">Preview</label>
						<div className="rounded-lg border border-white/20 bg-black/50 overflow-hidden h-56 flex items-center justify-center">
							{preview ? (
								isVideo(file) ? (
									<video className="max-h-56 w-auto" src={preview} controls playsInline />
								) : (
									<img src={preview} alt="preview" className="max-h-56 w-auto object-contain" />
								)
							) : (
								<div className="text-off-white/50 text-sm">No media selected</div>
							)}
						</div>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
					<div>
						<label className="block text-sm mb-1">Artwork Link (optional)</label>
						<input value={artUrl} onChange={e => setArtUrl(e.target.value)} className="w-full rounded-md bg-black/40 border border-white/10 p-2" />
					</div>
					<div>
						<label className="block text-sm mb-1">X/Twitter URL (optional)</label>
						<input value={twitterUrl} onChange={e => setTwitterUrl(e.target.value)} className="w-full rounded-md bg-black/40 border border-white/10 p-2" />
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
					<div>
						<label className="block text-sm mb-1">Category</label>
						<select value={category} onChange={e => setCategory(e.target.value as 'fan_art' | 'spotlight')} className="w-full rounded-md bg-black/40 border border-white/10 p-2">
							<option value="fan_art">Fan Art</option>
							<option value="spotlight">Spotlight</option>
						</select>
					</div>
					<div className="text-xs text-off-white/60 self-end">You confirm rights to share and allow featuring on site/socials.</div>
				</div>
				<div className="pt-2">
					<button type="submit" disabled={busy || !file} className="btn-primary">{busy ? 'Submitting...' : 'Submit'}</button>
				</div>
				{doneId && <p className="text-green-400">Submitted! Pending review. ID: {doneId}</p>}
				{error && <p className="text-red-400">{error}</p>}
			</form>
		</div>
	);
}


