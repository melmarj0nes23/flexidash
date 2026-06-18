import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // empty standard config
  experimental: {
    allowedDevOrigins: ['192.168.1.109', 'localhost']
  }
};

export default nextConfig;
