/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.com",
        port: "",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "**.net",
        port: "",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "**.xyz",
        port: "",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "**.seadn.io",
        port: "",
        pathname: "**",
      },
    ],
  },
};

export default nextConfig;
