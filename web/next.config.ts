import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  images: {
    domains: [
      "lh3.googleusercontent.com",
      "i.pravatar.cc",
      "ixi2mx3eecfmyfha.public.blob.vercel-storage.com",
    ],
  },
};

export default nextConfig;
