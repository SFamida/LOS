/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ["@los/ui", "@los/types"]
};

module.exports = nextConfig;
