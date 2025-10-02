/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // recommended
  swcMinify: true,       // keep SWC minifier
  experimental: {
    appDir: true,         // enable app directory (Next 13+)
  },
  images: {
    domains: ['example.com'], // replace with your domains for <Image>
  },
  eslint: {
    ignoreDuringBuilds: true, // optional: skip eslint during build
  },
};

module.exports = nextConfig;
