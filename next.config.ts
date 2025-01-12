import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  output: 'export',
  distDir: 'docs',
  basePath: isProduction ? '/apesonape-web' : '',
  assetPrefix: isProduction ? '/apesonape-web/' : '',
  images: {
    unoptimized: true,
  },
  // Ensure proper static export
  trailingSlash: true,
  // Disable static optimization
  reactStrictMode: true,
  // Ensure error pages are included
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
};

export default nextConfig;
