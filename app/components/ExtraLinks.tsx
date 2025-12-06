'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useGlyph, useGlyphTokenGate } from '@use-glyph/sdk-react';

export default function ExtraLinks() {
	// Client-only add-ons for nav: show Tools + Arcade for holders/signed-in
	const glyph = (useGlyph() as unknown) as {
		user?: unknown;
		address?: string;
		isAuthenticated?: boolean;
	};
	const isSignedIn = !!(
		glyph &&
		((glyph.user) ||
			(glyph.address) ||
			(glyph.isAuthenticated))
	);

	const { checkTokenGate } = useGlyphTokenGate();
	const [hasAccess, setHasAccess] = useState(false);

	useEffect(() => {
		let cancelled = false;
		(async () => {
			if (!isSignedIn) { setHasAccess(false); return; }
			// Hardcoded per request (was env NEXT_PUBLIC_APECHAIN_CHAIN_ID)
			const chainId = 33139;
			const res = await checkTokenGate({
				contractAddress: '0xa6babe18f2318d2880dd7da3126c19536048f8b0',
				includeDelegates: true,
				...(chainId ? { chainId } : {}),
			});
			if (!cancelled) setHasAccess(!!res?.result);
		})();
		return () => { cancelled = true; };
	}, [isSignedIn, checkTokenGate]);

	if (!isSignedIn || !hasAccess) return null;
	return (
		<>
			<Link href="/creative" className="transition-colors duration-300 font-medium hover:text-hero-blue" style={{ color: 'var(--foreground)' }}>
				Tools
			</Link>
			<a
				href="https://arcade.apesonape.io"
				target="_blank"
				rel="noopener noreferrer"
				className="transition-colors duration-300 font-medium hover:text-hero-blue"
				style={{ color: 'var(--foreground)' }}
			>
				Arcade
			</a>
		</>
	);
}
