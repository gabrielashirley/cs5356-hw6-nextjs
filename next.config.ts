import type { NextConfig } from "next"

const nextConfig: NextConfig = {
    experimental: {
        nodeMiddleware: true,
    },
}

module.exports = {
    experimental: {
      turbo: {
        resolveAlias: {
          "@/lib/auth": "./lib/auth.ts",
        }
      }
    },
    transpilePackages: ["@better-auth/core"]
  };

export default nextConfig
