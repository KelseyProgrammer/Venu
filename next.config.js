/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Configure images to allow localhost
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/api/**',
      },
    ],
    // Optimize images
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
  // Remove turbopack for more stable builds
  // turbopack: {
  //   root: path.join(__dirname, ".."),
  // },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:3001/api/:path*", // Fixed port to match backend
      },
    ];
  },
  // Add build optimizations
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
    optimizeCss: true,
  },
  // Add webpack optimizations
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Optimize bundle size
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
          radix: {
            test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
            name: 'radix',
            chunks: 'all',
            priority: 20,
          },
          lucide: {
            test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
            name: 'lucide',
            chunks: 'all',
            priority: 20,
          },
        },
      };
    }
    return config;
  },
  // Enable compression
  compress: true,
  // Optimize fonts
  optimizeFonts: true,
};

module.exports = nextConfig; 