'use client';

import React from 'react';
import Link from 'next/link';
import { useGlyph } from '@use-glyph/sdk-react';

export default function GallerySubmitControl({ variant = 'header' }: { variant?: 'header' | 'empty' }) {
	try {
		const glyph = useGlyph() as unknown as Record<string, unknown>;
		const isSignedIn = !!(glyph && (('user' in glyph && glyph.user) || ('address' in glyph && glyph.address) || ('isAuthenticated' in glyph && glyph.isAuthenticated)));
		if (isSignedIn) {
			if (variant === 'header') return <Link href="/gallery/submit" className="btn-primary">Submit</Link>;
			return <Link href="/gallery/submit" className="text-hero-blue underline">submit your art</Link>;
		}
		// not signed in
		if (variant === 'header') return null;
		return <span>Sign in to submit.</span>;
	} catch {
		// Fallback if hook unavailable during hydration
		return variant === 'header' ? null : <span>Sign in to submit.</span>;
	}
}


