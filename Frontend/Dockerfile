# ---- 1. Install dependencies ----
  FROM node:22-alpine AS deps
  WORKDIR /app
  COPY package.json package-lock.json ./
  RUN npm ci

  # ---- 2. Build ----
  FROM node:22-alpine AS builder
  WORKDIR /app
  COPY --from=deps /app/node_modules ./node_modules
  COPY . .

  # NEXT_PUBLIC_* values are written into the JavaScript bundle at BUILD time,
  # so the API URL must be a build argument, not a runtime variable.
  ARG NEXT_PUBLIC_API_URL=http://localhost:8000/api
  ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

  # Git doesn't track empty folders; make sure public/ exists for the COPY below
  RUN mkdir -p public && npm run build

  # ---- 3. Run ----
  FROM node:22-alpine AS runner
  WORKDIR /app
  ENV NODE_ENV=production \
      PORT=3000 \
      HOSTNAME=0.0.0.0

  RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

  COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
  COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
  COPY --from=builder --chown=nextjs:nodejs /app/public ./public

  USER nextjs
  EXPOSE 3000
  CMD ["node", "server.js"]