/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  output: 'standalone',
  experimental: {
    // Enable static exports for better deployment options
    outputFileTracingRoot: undefined,
  },
  // Optional: Add image optimization settings for production
  images: {
    unoptimized: false,
  },
};

export default nextConfig;
