import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  async rewrites() {
    if (process.env.USE_EXPRESS_BACKEND === "1") {
      const backendOrigin = process.env.EXPRESS_BACKEND_ORIGIN || "http://localhost:4000";
      return [
        {
          source: "/api/:path*",
          destination: `${backendOrigin}/api/:path*`,
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
