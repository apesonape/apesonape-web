import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  distDir: 'docs',
  basePath: '/apesonape-web',
  assetPrefix: '/apesonape-web/',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
