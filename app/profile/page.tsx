'use client';
export const dynamic = 'force-dynamic';

import React, { useMemo, useState } from 'react';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { usePrivy } from '@privy-io/react-auth';
import { useGlyph } from '@use-glyph/sdk-react';
import SafeImage from '../components/SafeImage';

type PrivyTwitter = { name?: string; username?: string; profilePictureUrl?: string };
type PrivyUser = { id?: string; twitter?: PrivyTwitter };
export default function ProfilePage() {
	const { user, linkTwitter } = (usePrivy() as unknown) as { user?: PrivyUser; linkTwitter?: () => Promise<void> };
	const glyph = (useGlyph() as unknown) as { logout?: () => Promise<void> };

	// Read from Privy user (populated by the automatic sessions call)
	const twitter = useMemo(() => user?.twitter || null, [user]);

	const name: string = twitter?.name || '';
	const username: string = twitter?.username || '';
	const twitterAvatarUrl: string | null = twitter?.profilePictureUrl || null;
	const displayName = name;
	const displayHandle = username;

	const [customAvatarUrl, setCustomAvatarUrl] = useState<string | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);

	const onPickAvatar = (file: File | null) => {
		if (!file) return;
		const reader = new FileReader();
		reader.onload = () => {
			setPreviewUrl(String(reader.result || ''));
		};
		reader.readAsDataURL(file);
	};

	const onSaveAvatar = async () => {
		try {
			const input = (document.getElementById('avatar-file-input') as HTMLInputElement | null);
			const file = input?.files?.[0];
			if (!file || !user?.id) return;
			const form = new FormData();
			form.append('file', file);
			form.append('userId', String(user.id));
			const res = await fetch('/api/profile/avatar', { method: 'POST', body: form });
			if (!res.ok) return;
			const json = await res.json();
			const url = json?.url as string | undefined;
			if (url) {
				setCustomAvatarUrl(url);
				setPreviewUrl(null);
				// Optionally remember locally for nav fallback
				try { localStorage.setItem('user_custom_avatar', url); } catch {}
			}
		} catch {}
	};

	return (
		<div className="min-h-screen relative">
			<Nav />
			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
				{/* PROFILE HEADER */}
				<div className="glass-dark rounded-xl p-6 border border-white/10 mb-6">
					<div className="flex flex-col items-center gap-4 text-center">
						{/* Avatar */}
						<div className="w-32 h-32 rounded-full overflow-hidden border-2 border-hero-blue/50 bg-black/40 flex items-center justify-center relative">
							{(previewUrl || customAvatarUrl || twitterAvatarUrl) ? (
								<SafeImage src={previewUrl || customAvatarUrl || twitterAvatarUrl || ''} alt="Avatar" className="w-full h-full object-cover" width={256} height={256} />
							) : (
								<div className="text-xs text-off-white/60 text-center p-2">No avatar</div>
							)}
						</div>
						<div className="flex items-center gap-2">
							<label className="btn-secondary cursor-pointer text-xs px-2 py-1">
								Change
								<input
									id="avatar-file-input"
									type="file"
									accept="image/*"
									className="hidden"
									onChange={(e) => onPickAvatar(e.target.files?.[0] || null)}
								/>
							</label>
							<button className="btn-primary px-2 py-1 text-xs" onClick={onSaveAvatar} disabled={!previewUrl || !user?.id}>
								Save
							</button>
						</div>

						{/* Name */}
						{displayName && (
							<div className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
								{displayName}
							</div>
						)}

						{/* Username */}
						{displayHandle && (
							<div className="text-lg text-off-white/80">
								@{displayHandle}
							</div>
						)}

						{/* X Account Link */}
						<div className="mt-2">
							{!twitter ? (
								<button
									className="btn-secondary px-3 py-1.5 text-sm"
									onClick={async () => { try { await linkTwitter?.(); } catch {} }}
								>
									🐦 Link X account
								</button>
							) : (
								<span className="inline-flex items-center px-3 py-1.5 text-sm rounded-md bg-green-600/20 text-green-400 border border-green-500/30">
									✓ X Account Linked
								</span>
							)}
						</div>
					</div>
				</div>

				{/* Gamification sections removed */}

				{/* Sign Out */}
				<div className="flex justify-center mt-8">
					<button
						className="btn-secondary px-4 py-2 text-sm"
						onClick={() => { void glyph.logout?.(); }}
					>
						Sign out
					</button>
				</div>
			</main>
			<Footer />
		</div>
	);
}
