import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  compress: true,
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async redirects() {
    return [
      {
        source: "/editor",
        destination: "/edit",
        permanent: true,
      },
      {
        source: "/editor/:slug*",
        destination: "/edit/:slug*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
