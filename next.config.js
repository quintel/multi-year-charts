
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
config = withSentryConfig(config, {
  org: 'quintel',
  project: 'collections',
  authToken: process.env.SENTRY_AUTH_TOKEN,
  release: {
    name: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
  },
  sourcemaps: {
    urlPrefix: '~/_next',
  },
});

module.exports = config;
