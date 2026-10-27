/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output is for the Docker image; Vercel builds Next.js its own way
  output: process.env.VERCEL ? undefined : "standalone",
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
