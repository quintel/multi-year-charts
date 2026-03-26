const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['echarts', 'echarts-for-react', 'zrender'],
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
config = withSentryConfig(config, {
  org: 'quintel',
  project: 'collections',
  authToken: process.env.SENTRY_AUTH_TOKEN,
  release: {
    name: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
  },
  sourcemaps: {
    urlPrefix: '~/_next/static/chunks',
  },
});

module.exports = config;
