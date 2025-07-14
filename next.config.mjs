/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ["images.pexels.com", "images.unsplash.com", "trs-api.tekjuice.xyz", 'social-gems.s3.amazonaws.com'],
  },
  // output: 'export', // <-- DO NOT ENABLE THIS FOR APPS USING CLIENT COMPONENT HOOKS
};

export default nextConfig;
