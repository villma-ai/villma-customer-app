import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Disable static optimization for pages that need runtime env vars
  experimental: {
    // This allows runtime environment variable access
  },

  // Ensure environment variables are read at runtime
  env: {
    // Don't embed any environment variables at build time
    // They will be read at runtime instead
  },

  // Disable image optimization for Docker containers
  images: {
    unoptimized: true
  },

  // External packages for server components
  serverExternalPackages: []
};

export default nextConfig;
