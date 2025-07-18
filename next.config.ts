import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    eslint: {
        // Disable ESLint during builds
        ignoreDuringBuilds: true,
    },
    typescript: {
        // Disable TypeScript errors during builds (optional)
        ignoreBuildErrors: true,
    },
    // Optimize build performance
    experimental: {
        // Enable faster builds
        turbo: {
            resolveAlias: {
                // Add any alias optimizations here if needed
            },
        },
    },
    // Disable source maps in production for faster builds (optional)
    productionBrowserSourceMaps: false,
};

export default nextConfig;
