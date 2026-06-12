import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The page reads committed JSON from disk at request time (force-dynamic).
  // Vercel's function bundler traces imports, not fs reads — trace the data
  // dirs in explicitly so the deployed function can see them.
  outputFileTracingIncludes: {
    "/": ["./data/demo/**/*.json", "./data/measurements/**/*.json"],
  },
};

export default nextConfig;
