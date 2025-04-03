const withTM = require('next-transpile-modules')(['echarts', 'echarts-for-react', 'zrender']);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

module.exports = withTM(nextConfig);
