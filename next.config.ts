import type { NextConfig } from "next";

function getAllowedDevOrigins() {
  if (!process.env.APP_URL) return [];

  try {
    return [new URL(process.env.APP_URL).host];
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  allowedDevOrigins: getAllowedDevOrigins(),
};

export default nextConfig;
