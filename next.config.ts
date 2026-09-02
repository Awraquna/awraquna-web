import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "5200", pathname: "/uploads/**" },
      { protocol: "https", hostname: "**" },
    ],
    unoptimized: true,
  },
};

export default nextConfig;
