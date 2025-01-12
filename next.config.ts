import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  output: 'export',
  distDir: 'docs',
  basePath: isProduction ? '/apesonape-web' : '',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
