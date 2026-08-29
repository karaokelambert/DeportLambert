/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/DeportLambert',
  assetPrefix: '/DeportLambert',
  trailingSlash: true,
  reactStrictMode: true,
  images: {
    unoptimized: true,
    domains: ['picsum.photos'],
  },
};

module.exports = nextConfig;
