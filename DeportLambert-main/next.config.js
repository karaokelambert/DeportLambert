/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow images from any origin for team logos
  images: {
    domains: ['picsum.photos'],
  },
};

module.exports = nextConfig;
