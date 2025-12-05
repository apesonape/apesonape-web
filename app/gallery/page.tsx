'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Heart, Share2, Check } from 'lucide-react';

type UGCItem = {
	id: number;
	created_at: string;
	author: string | null;
	wallet: string | null;
	title: string;
	image_url: string | null; // can be image or video URL
	art_url: string | null;
	twitter_url: string | null;
	status: 'pending' | 'approved' | 'rejected';
	category?: string | null;
	votes_count?: number | null;
};

function isVideoUrl(url: string | null | undefined): boolean {
	if (!url) return false;
	const lower = url.toLowerCase();
	return lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.endsWith('.mov') || lower.endsWith('.m4v');
}

export default function GalleryPage() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const initialCategory = (searchParams.get('category') as 'fan_art' | 'spotlight' | 'all') || 'all';
	const [items, setItems] = useState<UGCItem[]>([]);
	const [votedIds, setVotedIds] = useState<Set<number>>(new Set());
	const [voteSnapshot, setVoteSnapshot] = useState<Record<number, number>>({});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [category, setCategory] = useState<'fan_art' | 'spotlight' | 'all'>(initialCategory);
	const [sort, setSort] = useState<'top' | 'new'>('top');

	// Load voted ids from localStorage
	useEffect(() => {
		try {
			const raw = localStorage.getItem('gallery_voted_ids') || '[]';
			const arr = JSON.parse(raw) as number[];
			setVotedIds(new Set(arr));

			const snapRaw = localStorage.getItem('gallery_vote_snapshot') || '{}';
			const snapObj = JSON.parse(snapRaw) as Record<number, number>;
			setVoteSnapshot(snapObj || {});
		} catch {
			setVotedIds(new Set());
			setVoteSnapshot({});
		}
	}, []);

	useEffect(() => {
		let cancelled = false;
		(async () => {
			try {
				setLoading(true);
				const qs = new URLSearchParams({
					status: 'approved',
					sort: sort === 'top' ? 'votes_count:desc' : 'created_at:desc',
					limit: '60',
				});
				if (category !== 'all') qs.set('category', category);
				const res = await fetch(`/api/gallery/list/?${qs.toString()}`, { cache: 'no-store' });
				const json = await res.json();
				if (!cancelled) {
					const adjusted = (json.items || []).map((it: UGCItem) => {
						const serverCount = it.votes_count ?? 0;
						const snap = voteSnapshot[it.id];
						// Ensure at least +1 relative to the server count at vote time
						const minCount = snap !== undefined ? snap + 1 : serverCount;
						return { ...it, votes_count: Math.max(serverCount, minCount) };
					});
					setItems(adjusted);
				}
			} catch (e: unknown) {
				if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load');
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();
		return () => { cancelled = true; };
	}, [category, sort, voteSnapshot]);

	useEffect(() => {
		const qs = new URLSearchParams();
		if (category !== 'all') qs.set('category', category);
		router.replace(`/gallery${qs.toString() ? `?${qs.toString()}` : ''}`);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [category]);

	const onVote = async (id: number) => {
		if (votedIds.has(id)) return;
		// Capture current server-sourced count snapshot (best-effort)
		const current = items.find(i => i.id === id)?.votes_count ?? 0;
		try {
			const res = await fetch('/api/gallery/vote/', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ submission_id: id }),
			});
			if (!res.ok) return;
			let serverCount: number | null = null;
			try {
				const data: unknown = await res.json();
				if (data && typeof data === 'object' && data !== null && 'count' in data) {
					const c = (data as Record<string, unknown>).count;
					if (typeof c === 'number') serverCount = c;
				}
			} catch {
				// ignore JSON parse
			}

			setItems(prev => prev.map(it => {
				if (it.id !== id) return it;
				const nextCount = serverCount !== null ? serverCount : (it.votes_count || 0) + 1;
				return { ...it, votes_count: nextCount };
			}));
			// Persist voted id locally to prevent multiple votes from same browser
			setVotedIds(prev => {
				const next = new Set(prev);
				next.add(id);
				try {
					localStorage.setItem('gallery_voted_ids', JSON.stringify(Array.from(next)));
				} catch {}
				return next;
			});
			// Store snapshot so after refresh we show at least +1 relative to snapshot
			setVoteSnapshot(prev => {
				const next = { ...prev };
				if (next[id] === undefined) next[id] = current;
				try {
					localStorage.setItem('gallery_vote_snapshot', JSON.stringify(next));
				} catch {}
				return next;
			});
		} catch {
			// ignore
		}
	};

	const onShare = (item: UGCItem) => {
		const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/gallery/${item.id}`;
		const text = `Community art: ${item.title || 'Check this out!'} #ApesOnApe`;
		const intent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=ApesOnApe`;
		window.open(intent, '_blank', 'noopener,noreferrer');
	};

	const onCopy = async (item: UGCItem) => {
		try {
			const url = `${window.location.origin}/gallery/${item.id}`;
			await navigator.clipboard.writeText(url);
		} catch {
			// no-op
		}
	};

	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
			<div className="flex items-center justify-between mb-6">
				<div className="flex items-center gap-3">
					<h1 className="text-2xl md:text-3xl font-semibold" style={{ color: 'var(--foreground)' }}>Community Gallery</h1>
					<div className="hidden md:flex items-center gap-2 ml-2">
						<button
							className={`px-3 py-1.5 rounded-full text-sm border ${category === 'all' ? 'bg-hero-blue/20 border-hero-blue/40 text-hero-blue' : 'border-white/15 text-off-white/80'}`}
							onClick={() => setCategory('all')}
						>All</button>
						<button
							className={`px-3 py-1.5 rounded-full text-sm border ${category === 'fan_art' ? 'bg-hero-blue/20 border-hero-blue/40 text-hero-blue' : 'border-white/15 text-off-white/80'}`}
							onClick={() => setCategory('fan_art')}
						>Fan Art</button>
						<button
							className={`px-3 py-1.5 rounded-full text-sm border ${category === 'spotlight' ? 'bg-hero-blue/20 border-hero-blue/40 text-hero-blue' : 'border-white/15 text-off-white/80'}`}
							onClick={() => setCategory('spotlight')}
						>Spotlight</button>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<select value={sort} onChange={e => setSort(e.target.value as 'top' | 'new')} className="rounded-md bg-black/40 border border-white/10 p-2 text-sm">
						<option value="top">Top (votes)</option>
						<option value="new">New</option>
					</select>
					<Link href="/gallery/submit" className="btn-primary">Submit</Link>
				</div>
			</div>

			{/* Mobile category pills */}
			<div className="flex md:hidden items-center gap-2 mb-4">
				<button className={`px-3 py-1.5 rounded-full text-sm border ${category === 'all' ? 'bg-hero-blue/20 border-hero-blue/40 text-hero-blue' : 'border-white/15 text-off-white/80'}`} onClick={() => setCategory('all')}>All</button>
				<button className={`px-3 py-1.5 rounded-full text-sm border ${category === 'fan_art' ? 'bg-hero-blue/20 border-hero-blue/40 text-hero-blue' : 'border-white/15 text-off-white/80'}`} onClick={() => setCategory('fan_art')}>Fan Art</button>
				<button className={`px-3 py-1.5 rounded-full text-sm border ${category === 'spotlight' ? 'bg-hero-blue/20 border-hero-blue/40 text-hero-blue' : 'border-white/15 text-off-white/80'}`} onClick={() => setCategory('spotlight')}>Spotlight</button>
			</div>

			{loading && <p className="text-off-white/80">Loading...</p>}
			{error && <p className="text-red-400">{error}</p>}

			{!loading && !error && items.length === 0 && (
				<div className="rounded-xl border border-white/10 bg-black/30 p-6 text-off-white/80">
					No submissions yet. Be the first to <Link className="text-hero-blue underline" href="/gallery/submit">submit your art</Link>.
				</div>
			)}

			{!loading && !error && items.length > 0 && (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5">
					{items.map(item => {
						const video = isVideoUrl(item.image_url || undefined);
						return (
							<div key={item.id} className="group rounded-xl border border-white/20 bg-black/50 hover:bg-black/60 transition-colors overflow-hidden flex flex-col shadow-xl shadow-black/40">
								<Link href={`/gallery/${item.id}`} className="block relative">
									<div className="aspect-[4/3] w-full overflow-hidden">
										{video ? (
											<video className="w-full h-full object-cover" muted playsInline preload="metadata">
												<source src={item.image_url || ''} />
											</video>
										) : item.image_url ? (
											<img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
										) : (
											<div className="w-full h-full bg-white/5 flex items-center justify-center text-off-white/60">No media</div>
										)}
									</div>
									<div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
										<div className="text-sm text-off-white/80">{item.author || 'Anonymous'}</div>
										<div className="font-semibold" style={{ color: 'var(--foreground)' }}>{item.title}</div>
									</div>
								</Link>
								<div className="p-3 flex items-center gap-2 mt-auto flex-wrap">
									<button
										onClick={() => onVote(item.id)}
										disabled={votedIds.has(item.id)}
										className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all duration-200 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed
											${votedIds.has(item.id) ? 'border-rose-400/60 bg-rose-500/10 text-rose-300' : 'border-hero-blue/40 hover:border-hero-blue hover:bg-hero-blue/10'}`}
										aria-pressed={votedIds.has(item.id)}
									>
										<Heart className={`w-4 h-4 ${votedIds.has(item.id) ? 'fill-rose-400 text-rose-400' : 'text-hero-blue'}`} />
										<span>{votedIds.has(item.id) ? 'Liked' : 'Like'}</span>
										<span className="opacity-80">({item.votes_count ?? 0})</span>
									</button>
									<button
										onClick={() => onShare(item)}
										className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-hero-blue/40 hover:border-hero-blue hover:bg-hero-blue/10 transition-colors"
									>
										<Share2 className="w-4 h-4 text-hero-blue" />
										<span>Share</span>
									</button>
									<button
										onClick={() => onCopy(item)}
										className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 hover:bg-white/5 transition-colors text-sm"
										title="Copy link"
									>
										<Check className="w-4 h-4 opacity-70" />
										<span>Copy</span>
									</button>
								</div>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}


