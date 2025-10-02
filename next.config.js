/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizeCss: false, // fallback to PostCSS
  },
  swcMinify: false, // optional: disables SWC minifier
  fontLoaders: [], // disables next/font auto loaders
  experimental: {
    optimizeCss: false,
    optimizeFonts: false // disable automatic font optimization
  }
};

module.exports = nextConfig;
