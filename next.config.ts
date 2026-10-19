import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
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
