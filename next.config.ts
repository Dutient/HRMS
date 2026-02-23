import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "blcknmysmaxkoprusixt.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: false, // Catch all TypeScript errors during build
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "100mb", // Allow 50 resumes @ ~2MB each (increased from 50mb for safety)
      allowedOrigins: [
        "localhost:3000",
        "127.0.0.1:3000",
        "dutient-hrms.netlify.app",
        "*.netlify.app", // Allow all Netlify preview deployments
      ],
    },
  },
};

export default nextConfig;
