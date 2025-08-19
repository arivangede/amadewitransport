import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "svvbafvdcppzxndukdlw.supabase.co",
        port: "",
        pathname: "/**",
      },
    ],
  },
  allowedDevOrigins: ["https://cfc7b1b4d40d.ngrok-free.app"],
};

export default nextConfig;
