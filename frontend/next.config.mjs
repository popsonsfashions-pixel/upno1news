/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 60, // Cache images for 60 seconds
  },
  // Compression
  compress: true,
  // Performance optimizations
  poweredByHeader: false,
  reactStrictMode: true,
  // SWC minification for faster builds
  swcMinify: true,
  // Optimize font loading
  optimizeFonts: true,
  // Production optimizations
  productionBrowserSourceMaps: false,
  // Reduce memory usage
  experimental: {
    optimizePackageImports: ['lucide-react', 'date-fns'],
  },
  // Output standalone for better deployment
  output: 'standalone',
}

  ;

export default nextConfig;

