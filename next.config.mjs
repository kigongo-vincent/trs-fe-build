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
  // output: 'export', // <-- DO NOT ENABLE THIS FOR APPS USING CLIENT COMPONENT HOOKS
};

export default nextConfig;
