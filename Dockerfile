# Production image for multi-year-charts (Collections). Multi-stage Next.js
# standalone build. See ETLauncher/compose.collections-prod.yaml for the local mirror.
#
# IMPORTANT: NEXT_PUBLIC_* values are inlined into the client bundle at `next build`
# time, so they are passed as build args here — NOT at runtime. A different target
# environment (staging/prod) needs a rebuild with different args. Server-only secrets
# (NEXTAUTH_SECRET, AUTH_CLIENT_SECRET, ...) are read at request time and stay runtime env.

# --- deps: install node_modules from a clean lockfile -------------------------
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# --- builder: compile the standalone server -----------------------------------
FROM node:20-alpine AS builder
WORKDIR /app

# Public URLs baked into the client bundle. Defaults are placeholders; real values
# come from --build-arg (compose passes them from .env).
ARG NEXT_PUBLIC_ETENGINE_URL
ARG NEXT_PUBLIC_ETMODEL_URL
ARG NEXT_PUBLIC_MYETM_URL
ARG NEXT_PUBLIC_SENTRY_RELEASE
ARG NEXT_PUBLIC_APP_ENV
ARG NEXT_PUBLIC_SENTRY_DSN
ENV NEXT_PUBLIC_ETENGINE_URL=$NEXT_PUBLIC_ETENGINE_URL \
    NEXT_PUBLIC_ETMODEL_URL=$NEXT_PUBLIC_ETMODEL_URL \
    NEXT_PUBLIC_MYETM_URL=$NEXT_PUBLIC_MYETM_URL \
    NEXT_PUBLIC_SENTRY_RELEASE=$NEXT_PUBLIC_SENTRY_RELEASE \
    NEXT_PUBLIC_APP_ENV=$NEXT_PUBLIC_APP_ENV \
    NEXT_PUBLIC_SENTRY_DSN=$NEXT_PUBLIC_SENTRY_DSN \
    NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Sourcemap upload happens inside `next build` (withSentryConfig in next.config.js reads
# SENTRY_AUTH_TOKEN). The token comes in as a BuildKit secret — never an ARG/ENV, so it
# is not persisted in any image layer. Without the secret (local builds) the plugin
# skips the upload:
#   docker build --secret id=sentry_auth_token,env=SENTRY_AUTH_TOKEN ...
RUN --mount=type=secret,id=sentry_auth_token,env=SENTRY_AUTH_TOKEN yarn build

# --- runner: minimal runtime -------------------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3005 \
    HOSTNAME=0.0.0.0

# Run as a non-root user.
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

# Standalone output bundles a trimmed node_modules + server.js; static assets and
# public/ are copied alongside (Next does not include them in standalone).
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3005
CMD ["node", "server.js"]
