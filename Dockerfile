# syntax=docker/dockerfile:1
FROM node:22-alpine AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM dependencies AS builder
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1 \
    AUTH_PROVIDER=keycloak \
    AUTH_ISSUER=https://build.invalid/realms/rmovie \
    AUTH_CLIENT_ID=build \
    AUTH_CLIENT_SECRET=build \
    AUTH_SECRET=build-only-secret-build-only-secret \
    GOOGLE_SHEETS_SPREADSHEET_ID=build
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
