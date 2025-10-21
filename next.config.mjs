/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false, // Enable TypeScript checking in production
  },
  eslint: {
    ignoreDuringBuilds: false, // Enable ESLint checking in production
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "trs-api.tekjuice.xyz",
      },
      {
        protocol: "https",
        hostname: "social-gems.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "trs-v1.netlify.app",
      },
    ],
  },
  // output: 'export', // <-- DO NOT ENABLE THIS FOR APPS USING CLIENT COMPONENT HOOKS
  serverExternalPackages: ["html2pdf.js"],
};

export default nextConfig;
