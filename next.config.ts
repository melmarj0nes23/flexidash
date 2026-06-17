import type { NextConfig } from "next";

if (process.env.NODE_ENV === "development") {
  import("@cloudflare/next-on-pages/next-dev").then(({ setupDevPlatform }) => {
    setupDevPlatform();
  });
}

const nextConfig: NextConfig = {
  webpack: (config, { nextRuntime }) => {
    if (nextRuntime === "edge") {
      config.resolve.alias = {
        ...config.resolve.alias,
        "async_hooks": false,
      };
    }
    return config;
  },
  turbopack: {},
};
export default nextConfig;
