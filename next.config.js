/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Disable LightningCSS (this forces PostCSS fallback)
    optimizeCss: false,
    optimizeFonts: false
  },
  swcMinify: false, // Optional: sometimes SWC minifier triggers LightningCSS
};

module.exports = nextConfig;
