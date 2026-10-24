/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  output: "standalone", // a small self-contained server, ideal for Docker
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    instantInsights: {
      validationLevel: "manual-warning",
    },
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
