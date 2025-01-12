import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  distDir: 'docs',
  basePath: '/apesonape-web',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
