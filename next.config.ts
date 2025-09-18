import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  poweredByHeader: false,
  reactStrictMode: true,
  compress: true,
  // Add CORS headers to allow PDF files to be served
  async headers() {
    return [
      {
        source: "/(.*).pdf",
        headers: [
          {
            key: "Content-Type",
            value: "application/pdf",
          },
          {
            key: "Content-Disposition",
            value: "inline",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
