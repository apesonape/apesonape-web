import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: 'docs',
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'gateway.pinata.cloud',
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
    NEXT_PUBLIC_GOOGLE_DRIVE_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_DRIVE_API_KEY || 'AIzaSyAYWncPK-IUIG9nyBE4X7gcgVboCAg3olg',
    NEXT_PUBLIC_GOOGLE_DRIVE_FOLDER_ID: process.env.NEXT_PUBLIC_GOOGLE_DRIVE_FOLDER_ID || '1nxjA9Wt_HKQBukh5xc61VOUdLHE6DRvK',
  },
};

export default nextConfig;
