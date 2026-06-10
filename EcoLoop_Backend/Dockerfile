# Stage 1: Builder
FROM node:22-alpine AS builder
RUN apk add --no-cache openssl
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
# Solo genera el cliente Prisma y compila TypeScript (sin migrate)
RUN npx prisma generate && npx tsc

# Stage 2: Runner
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache openssl curl

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/entrypoint.sh ./entrypoint.sh

EXPOSE 3001
ENTRYPOINT ["sh", "entrypoint.sh"]

