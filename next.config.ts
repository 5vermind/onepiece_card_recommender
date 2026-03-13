import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "en.onepiece-cardgame.com",
        pathname: "/images/cardlist/card/**",
      },
    ],
  },
};

export default nextConfig;
