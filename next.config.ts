import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: 'docs',
  experimental: {
    turbo: {
      resolveAlias: {
        '@react-native-async-storage/async-storage': './shims/empty.ts',
        '@solana-program/system': './shims/solana-system.ts',
        // Allow Privy modules (required by GlyphPrivyProvider)
      },
    },
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'gateway.pinata.cloud',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'moccasin-brilliant-silkworm-382.mypinata.cloud',
      },
      {
        protocol: 'https',
        hostname: 'cloudflare-ipfs.com',
      },
      {
        protocol: 'https',
        hostname: 'ipfs.io',
      },
      {
        protocol: 'https',
        hostname: 'nftstorage.link',
      },
      {
        protocol: 'https',
        hostname: 'dweb.link',
      },
      {
        protocol: 'https',
        hostname: '**.magiceden.dev',
      },
      {
        protocol: 'https',
        hostname: '**.magiceden.us',
      },
      {
        protocol: 'https',
        hostname: '**.sndcdn.com',
      },
      {
        protocol: 'https',
        hostname: 'drive.google.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
      },
    ],
  },
  trailingSlash: true,
  reactStrictMode: true,
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  // Environment variables that are safe to expose to the browser
  env: {
    NEXT_PUBLIC_ME_COLLECTION: process.env.NEXT_PUBLIC_ME_COLLECTION || '0xa6bAbE18F2318D2880DD7dA3126C19536048F8B0',
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://apesonape.io',
    NEXT_PUBLIC_APECHAIN_RPC: process.env.NEXT_PUBLIC_APECHAIN_RPC || 'https://rpc.apechain.com/http',
    NEXT_PUBLIC_GLYPH_PRIVY_APP_ID: process.env.NEXT_PUBLIC_GLYPH_PRIVY_APP_ID || 'clxt9p8e601al6tgmsyhu7j3t',
    NEXT_PUBLIC_APECHAIN_CHAIN_ID: process.env.NEXT_PUBLIC_APECHAIN_CHAIN_ID || '',
  },
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@react-native-async-storage/async-storage': require.resolve('./shims/empty.ts'),
      '@solana-program/system': require.resolve('./shims/solana-system.ts'),
      // Allow Privy packages for GlyphPrivyProvider
    };
    return config;
  },
};

export default nextConfig;
