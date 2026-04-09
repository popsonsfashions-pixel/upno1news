/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image optimization
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 3600, // Cache images for 1 hour
  },
  // Compression
  compress: true,
  // Performance optimizations
  poweredByHeader: false,
  reactStrictMode: true,
  // Production optimizations
  productionBrowserSourceMaps: false,
  // Reduce memory usage and bundle size
  experimental: {
    optimizePackageImports: ['lucide-react', 'date-fns', 'firebase/firestore', 'firebase/auth'],
  },
  // Output standalone for better deployment
  output: 'standalone',
}

  ;

export default nextConfig;

