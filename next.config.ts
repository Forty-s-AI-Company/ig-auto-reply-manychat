import type { NextConfig } from "next";

function getAllowedDevOrigins() {
  const urls = [
    process.env.APP_URL,
    process.env.NGROK_URL,
    "http://127.0.0.1:3041",
    "https://superman-undiluted-hastily.ngrok-free.dev",
  ].filter(Boolean);

  return [...new Set(
    urls.flatMap((url) => {
      try {
        const parsed = new URL(String(url));
        return [parsed.hostname, parsed.host, `${parsed.protocol}//${parsed.host}`];
      } catch {
        return [];
      }
    }),
  )];
}

const nextConfig: NextConfig = {
  allowedDevOrigins: getAllowedDevOrigins(),
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
      },
    ],
  },
  outputFileTracingExcludes: {
    "/*": ["./next.config.ts"],
  },
};

export default nextConfig;
