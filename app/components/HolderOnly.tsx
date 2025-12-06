'use client';

import React, { useEffect, useState } from 'react';
import { useGlyphTokenGate, LoginButton } from '@use-glyph/sdk-react';

const APE_COLLECTION = '0xa6babe18f2318d2880dd7da3126c19536048f8b0';

export default function HolderOnly({
	children,
	requiredQuantity = 1,
	includeDelegates = true,
}: {
	children: React.ReactNode;
	requiredQuantity?: number;
	includeDelegates?: boolean;
}) {
	const { checkTokenGate, isTokenGateLoading } = useGlyphTokenGate();
	const [allowed, setAllowed] = useState<boolean | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;
		(async () => {
			const res = await checkTokenGate({
				contractAddress: APE_COLLECTION,
				// Omit chainId to use the connected network (ApeChain recommended)
				quantity: requiredQuantity,
				includeDelegates,
			});
			if (cancelled) return;
			if (res.error) {
				setError(res.error);
				setAllowed(false);
			} else {
				setAllowed(res.result === true);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [checkTokenGate, requiredQuantity, includeDelegates]);

	if (allowed === null || isTokenGateLoading) {
		return <div className="px-4 py-6 text-sm text-off-white/80">Checking holder access…</div>;
	}
	if (!allowed) {
		return (
			<div className="px-4 py-6 border border-white/10 rounded-lg glass-dark">
				<div className="mb-2 text-off-white/90 font-semibold">Holders only</div>
				<p className="text-sm text-off-white/70 mb-3">
					Connect or sign in to continue. {error ? `(${error})` : ''}
				</p>
				<LoginButton />
			</div>
		);
	}
	return <>{children}</>;
}


