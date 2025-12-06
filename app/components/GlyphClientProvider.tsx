'use client';

import React from 'react';
	import { GlyphPrivyProvider } from '@use-glyph/sdk-react';
	import { Chain } from 'viem';
	import { mainnet } from 'viem/chains';

export default function GlyphClientProvider({ children }: { children: React.ReactNode }) {
	const appId = process.env.NEXT_PUBLIC_GLYPH_PRIVY_APP_ID || process.env.NEXT_PUBLIC_PRIVY_APP_ID || '';
	const supportedChains: [Chain, ...Chain[]] = [mainnet];

	// Client-only provider wrapper per Glyph docs
	return (
		<GlyphPrivyProvider
			appId={appId}
			chains={supportedChains}
			config={{
				embeddedWallets: {
					ethereum: { createOnLogin: 'off' },
					solana: { createOnLogin: 'off' },
				},
				supportedChains,
				defaultChain: supportedChains[0],
			}}
		>
			{children}
		</GlyphPrivyProvider>
	);
}



