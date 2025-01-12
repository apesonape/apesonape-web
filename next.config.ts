import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  distDir: 'docs',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  reactStrictMode: true,
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
};

export default nextConfig;
