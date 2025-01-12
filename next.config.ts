import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  output: 'export',
  distDir: 'docs',
  basePath: isProduction ? '/apesonape-web' : '',
  assetPrefix: isProduction ? '/apesonape-web' : '',
  images: {
    unoptimized: true,
  },
  // This ensures index.html is generated at the root
  trailingSlash: true,
};

export default nextConfig;
