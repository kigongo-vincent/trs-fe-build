/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ["images.pexels.com", "trs-api.tekjuice.xyz"],
  },
};

export default nextConfig;
