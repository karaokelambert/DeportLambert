/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/DeportLambert',
  assetPrefix: '/DeportLambert',
  trailingSlash: true,
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_SUPABASE_URL: 'https://nhurcieffcazroqfarrh.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5odXJjaWVmZmNhenJvcWZhcnJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxMDI2MTgsImV4cCI6MjEwMzY3ODYxOH0.EF6MjOtR4kqVXPRJtspq0v2mpF-Kq-IwH3zZ5jBNKNg',
  },
  images: {
    unoptimized: true,
    domains: ['picsum.photos'],
  },
};

module.exports = nextConfig;
