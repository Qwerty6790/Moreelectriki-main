import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: process.env.NODE_ENV === "production",

  turbopack: {}, // 👈 ВАЖНО

  serverExternalPackages: [],

  experimental: {
    optimizePackageImports: ["lucide-react", "react-icons"],
  },

  async rewrites() {
    return [
      { source: "/catalog", destination: "/osveheny" },
      { source: "/catalog/:slug*", destination: "/osveheny/:slug*" },
    ];
  },

  async redirects() {
    return [
      { source: "/osveheny", destination: "/catalog", permanent: false },
      { source: "/osveheny/:slug*", destination: "/catalog/:slug*", permanent: false },
    ];
  },

  compress: true,
  poweredByHeader: false,
  generateEtags: false,
};

export default nextConfig;