'use client';

import React, { useEffect, useState } from 'react';
import SafeImage from '@/app/components/SafeImage';

type UGCItem = {
	id: number;
	created_at: string;
	author: string | null;
	title: string;
	image_url: string | null;
	category: string | null;
	status: string;
};

export default function GalleryModeratePage() {
	const [items, setItems] = useState<UGCItem[]>([]);
	const [token, setToken] = useState<string>('');
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		// Prefer new key, fallback to legacy
		const stored = localStorage.getItem('gallery_admin_token')
			|| localStorage.getItem('ugc_admin_token')
			|| '';
		setToken(stored);
	}, []);

	useEffect(() => {
		let cancelled = false;
		const load = async () => {
			// Require admin token before attempting to load pending items
			if (!token) {
				if (!cancelled) {
					setLoading(false);
					setItems([]);
					setError(null);
				}
				return;
			}
			try {
				setLoading(true);
				setError(null);
				const res = await fetch('/api/gallery/list/?status=pending&limit=100&sort=created_at:asc', {
					cache: 'no-store',
					headers: token ? ({ 'x-admin-token': token } as HeadersInit) : undefined,
				});
				const contentType = res.headers.get('content-type') || '';
				if (!res.ok) {
					const text = await res.text().catch(() => '');
					throw new Error(`List failed ${res.status}: ${text.slice(0, 200)}`);
				}
				if (!contentType.includes('application/json')) {
					const text = await res.text().catch(() => '');
					throw new Error(`Unexpected response (not JSON): ${text.slice(0, 200)}`);
				}
				const json = await res.json();
				if (!cancelled) setItems(json.items || []);
			} catch (e: unknown) {
				if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load pending items');
			} finally {
				if (!cancelled) setLoading(false);
			}
		};
		load();
		return () => { cancelled = true; };
	}, [token]);

	const saveToken = () => {
		localStorage.setItem('gallery_admin_token', token);
		// Clean up legacy key if present
		if (localStorage.getItem('ugc_admin_token')) {
			localStorage.removeItem('ugc_admin_token');
		}
		// Trigger reload via token-dependent effect
		setToken(t => t);
	};

	const act = async (id: number, status: 'approved' | 'rejected') => {
		const res = await fetch('/api/gallery/moderate/', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-admin-token': token || '',
			},
			body: JSON.stringify({ id, status }),
		});
		if (res.ok) {
			setItems(prev => prev.filter(it => it.id !== id));
		}
	};

	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
			<h1 className="text-2xl font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Gallery Moderation</h1>
			<div className="rounded-xl border border-white/20 bg-black/60 p-4 mb-6 shadow-2xl">
				<label className="block text-sm mb-1">Admin Token</label>
				<div className="flex gap-2">
					<input value={token} onChange={e => setToken(e.target.value)} className="flex-1 rounded-md bg-black/40 border border-white/10 p-2" />
					<button onClick={saveToken} className="btn-secondary">Save</button>
				</div>
				<p className="text-xs text-off-white/60 mt-2">Set server env UGC_ADMIN_TOKEN and paste here.</p>
			</div>
			{loading && <p className="text-off-white/80">Loading...</p>}
			{error && <p className="text-red-400">{error}</p>}
			<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
				{items.map(item => (
					<div key={item.id} className="rounded-xl border border-white/20 bg-black/50 p-3 shadow-lg">
						<div className="rounded-md overflow-hidden mb-3">
							{item.image_url ? (
								<SafeImage src={item.image_url} alt={item.title} className="w-full h-52 object-cover" width={400} height={208} unoptimized />
							) : (
								<div className="w-full h-52 bg-white/5 flex items-center justify-center text-off-white/60">No media</div>
							)}
						</div>
						<h3 className="font-semibold" style={{ color: 'var(--foreground)' }}>{item.title}</h3>
						<p className="text-sm text-off-white/70 mb-3">{item.author || 'Anonymous'} — {item.category || 'fan_art'}</p>
						<div className="flex gap-2">
							<button className="btn-primary" onClick={() => act(item.id, 'approved')}>Approve</button>
							<button className="btn-secondary" onClick={() => act(item.id, 'rejected')}>Reject</button>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}


