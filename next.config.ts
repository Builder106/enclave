import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The dashboard and its API read committed measurement JSON from disk at
  // request time (force-dynamic). Vercel's function bundler traces imports,
  // not fs reads — without this the deployed functions can't see the data
  // and the page falls back to its empty state. Trace the files in explicitly.
  outputFileTracingIncludes: {
    "/": ["./data/measurements/**/*.json"],
    "/api/measurements": ["./data/measurements/**/*.json"],
  },
};

export default nextConfig;
