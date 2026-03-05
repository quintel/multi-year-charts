import * as Sentry from '@sentry/nextjs';

const enabledEnvs = ['production', 'staging'];

if (process.env.NEXT_PUBLIC_SENTRY_DSN && enabledEnvs.includes(process.env.NODE_ENV)) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
    environment: process.env.NODE_ENV,
    integrations: [Sentry.browserProfilingIntegration()],

    // Percentage of transactions to capture for tracing
    tracesSampleRate: parseFloat(process.env.NEXT_PUBLIC_SENTRY_TRACES || '0.1'),

    // Percentage of sampled transactions to profile
    profileSessionSampleRate: parseFloat(process.env.NEXT_PUBLIC_SENTRY_PROFILES || '0.1'),

    // Automatically start/stop profiler based on tracing spans
    profileLifecycle: 'trace',
  });
}
