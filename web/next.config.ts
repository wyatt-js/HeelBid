/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "egdhitfrkzfupdabtjsi.supabase.co",
        pathname: "/storage/v1/object/public/auction-images//**",
      },
    ],
  },
};

export default nextConfig;
