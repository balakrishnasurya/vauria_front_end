/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Disable LightningCSS (use PostCSS instead)
    optimizeCss: false,
  },
};

module.exports = nextConfig;
