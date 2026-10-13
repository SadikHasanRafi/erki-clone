import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image uploads are capped at 5 MB in the route handler; leave headroom for multipart overhead.
  experimental: {
    proxyClientMaxBodySize: "6mb",
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
