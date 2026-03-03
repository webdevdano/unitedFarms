import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  // Expose the Google Maps key to the browser code
  env: {
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
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
