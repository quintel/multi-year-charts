
const withTM = require('next-transpile-modules')(['echarts', 'echarts-for-react', 'zrender']);
const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Document-Policy',
            value: 'js-profiling',
          },
        ],
      },
    ];
  },
};

let config = nextConfig;
config = withTM(config);
config = withSentryConfig(config);

module.exports = config;
