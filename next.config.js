const withTM = require('next-transpile-modules')(['echarts', 'echarts-for-react', 'zrender']);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Self-contained server build (.next/standalone) for the Docker runtime image.
  output: 'standalone',
  reactStrictMode: true,
};

module.exports = withTM(nextConfig);
