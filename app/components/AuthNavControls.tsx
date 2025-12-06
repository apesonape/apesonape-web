'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useGlyph, useGlyphTokenGate } from '@use-glyph/sdk-react';
import { usePrivy } from '@privy-io/react-auth';
import SafeImage from './SafeImage';

type GlyphUser = { id?: string };
type PrivyTwitter = { name?: string; username?: string; profilePictureUrl?: string };
type PrivyUser = { id?: string; twitter?: PrivyTwitter };

export default function AuthNavControls() {
	const { login, logout, user, isAuthenticated } = (useGlyph() as unknown) as {
		login: () => Promise<void>;
		logout: () => Promise<void>;
		user?: GlyphUser;
		isAuthenticated?: boolean;
	};

	const privy = (usePrivy() as unknown) as { user?: PrivyUser };
	const privyUser = privy.user;

	const { checkTokenGate, isTokenGateLoading } = useGlyphTokenGate();
	const [checkingGate, setCheckingGate] = useState(false);

	const attemptGate = useCallback(async () => {
		setCheckingGate(true);
		try {
			const chainIdRaw = process.env.NEXT_PUBLIC_APECHAIN_CHAIN_ID || '';
			const parsed = Number(chainIdRaw);
			const chainId = Number.isFinite(parsed) ? parsed : undefined;

			let allowed = false;
			for (let i = 0; i < 8; i++) {
				const res = await checkTokenGate({
					contractAddress: '0xa6babe18f2318d2880dd7da3126c19536048f8b0',
					includeDelegates: true,
					...(chainId ? { chainId } : {}),
				});
				if (res?.result) { allowed = true; break; }
				await new Promise((r) => setTimeout(r, 750));
			}
			return allowed;
		} finally {
			setCheckingGate(false);
		}
	}, [checkTokenGate]);

	const handleLogin = async () => {
		try {
			await login?.();
			// After social login, verify access via linked wallets (delegations allowed)
			const allowed = await attemptGate();
			if (!allowed) {
				// silently sign out if not a holder
				await logout?.();
			}
		} catch {
			// ignore
		}
	};

	const signedIn = !!user || !!isAuthenticated;

	// Initialize user profile on first sign-in
	useEffect(() => {
		if (!signedIn || !privyUser) return;

		const initUser = async () => {
			try {
				const userId = privyUser.id;
				const twitter = privyUser.twitter;
				
				if (!userId) return;

				// Call init-user API to create profile and award first_sign_in achievement
				await fetch('/api/auth/init-user', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						userId,
						displayName: twitter?.name || null,
						xUsername: twitter?.username || null,
						avatarUrl: twitter?.profilePictureUrl || null
					})
				});

				// If X account is linked, no additional gamification calls (removed)
			} catch (err) {
				console.error('Error initializing user:', err);
			}
		};

		initUser();
	}, [signedIn, privyUser]);

	// Fetch avatar from Supabase first, then fall back to Privy
	const [supabaseAvatar, setSupabaseAvatar] = useState<string | null>(null);
	
	useEffect(() => {
		if (!signedIn || !privyUser) return;

		const fetchAvatar = async () => {
			try {
				const userId = privyUser.id;
				if (!userId) return;

				const res = await fetch(`/api/profile/summary?userId=${encodeURIComponent(userId)}`);
				if (res.ok) {
					const json = await res.json();
					if (json?.profile?.avatar_url) {
						setSupabaseAvatar(json.profile.avatar_url);
					}
				}
			} catch (err) {
				console.error('Error fetching avatar:', err);
			}
		};

		fetchAvatar();
	}, [signedIn, privyUser]);

	const avatarUrl: string | null = useMemo(() => {
		// Priority: Supabase custom avatar > Privy Twitter avatar
		if (supabaseAvatar) return supabaseAvatar;
		
		// Fallback to Privy user.twitter (populated by the automatic sessions request)
		const tw = privyUser?.twitter || null;
		return tw?.profilePictureUrl || null;
	}, [supabaseAvatar, privyUser]);

	if (signedIn) {
		return (
			<Link href="/profile" className="inline-flex items-center justify-center">
				{avatarUrl ? (
					<SafeImage
						src={avatarUrl}
						alt="Profile"
						width={64}
						height={64}
						className="w-8 h-8 rounded-full border border-white/20 object-cover"
					/>
				) : (
					<div className="w-8 h-8 rounded-full border border-white/20 bg-black/30" />
				)}
			</Link>
		);
	}

	return (
		<button
			onClick={() => { void handleLogin(); }}
			className="btn-primary px-3 py-1.5 text-sm"
			disabled={isTokenGateLoading || checkingGate}
		>
			Sign in
		</button>
	);
}



