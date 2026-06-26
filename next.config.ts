import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      // Allow any https host so admins can paste image URLs (hero, cities,
      // intent cards) from any source. Property photos are served from Supabase
      // storage (pattern above); these are admin-curated marketing images.
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
