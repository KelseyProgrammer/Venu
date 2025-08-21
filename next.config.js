/** @type {import('next').NextConfig} */
const nextConfig = {
  // appDir is enabled by default in Next.js 13+
  images: {
    unoptimized: false, // Enable image optimization even in development
    domains: [], // No external domains needed for local images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
}

module.exports = nextConfig 