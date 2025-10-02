/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizeCss: false, // disables LightningCSS
    optimizeFonts: false
  },
  swcMinify: false, // prevents SWC from trying LightningCSS
};

module.exports = nextConfig;
