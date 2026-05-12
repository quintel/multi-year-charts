import * as Sentry from '@sentry/nextjs';

const enabledEnvs = ['production', 'staging'];

if (process.env.NEXT_PUBLIC_SENTRY_DSN && enabledEnvs.includes(process.env.NEXT_PUBLIC_APP_ENV || '')) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
    environment: process.env.NEXT_PUBLIC_APP_ENV,
    // Percentage of transactions to capture for tracing
    tracesSampleRate: parseFloat(process.env.NEXT_PUBLIC_SENTRY_TRACES || '0.1'),
  });
}
