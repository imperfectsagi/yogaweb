import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.r2.dev",
      },
      {
        protocol: "https",
        hostname: "**.cloudflare.com",
      },
      {
        protocol: "https",
        hostname: "yogafitwithmeenu.online",
      },
      {
        protocol: "https",
        hostname: "media.yogafitwithmeenu.online",
      },
    ],
    // AVIF/WebP keep the banner + gallery images small automatically.
    formats: ["image/avif", "image/webp"],
  },
  eslint: {
    // Linting is run separately in CI / npm run lint; don't block prod builds.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;

// Enables `getCloudflareContext()` (D1 / R2 / KV bindings + env vars) inside
// `next dev`, so local development behaves like the deployed Worker.
// This must be the last thing that runs in this file.
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
