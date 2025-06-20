FROM node:22-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci && npm cache clean --force

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

# Add Firebase environment variables for build time
# These can be overridden at runtime
ENV NEXT_PUBLIC_FIREBASE_API_KEY="dummy-api-key"
ENV NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="dummy-project.firebaseapp.com"
ENV NEXT_PUBLIC_FIREBASE_PROJECT_ID="dummy-project"
ENV NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="dummy-project.appspot.com"
ENV NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="123456789"
ENV NEXT_PUBLIC_FIREBASE_APP_ID="1:123456789:web:abcdef"
ENV NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="G-XXXXXXXXXX"

RUN npm run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
