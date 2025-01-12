import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  distDir: 'docs',
  basePath: '/apesonape-web',
  assetPrefix: '/apesonape-web/',
  images: {
    unoptimized: true,
  },
  // Ensure proper static export
  trailingSlash: true,
};

export default nextConfig;
