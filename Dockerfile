FROM node:22-alpine AS build

WORKDIR /app

# Install build tools for native modules (better-sqlite3)
RUN apk add --no-cache python3 make g++ sqlite-dev

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build

# Build a clean production node_modules
RUN npm ci --omit=dev && npx prisma generate

FROM node:22-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV DATABASE_URL="file:/app/data/family-day.db"
ENV PORT=3000

RUN apk add --no-cache sqlite-libs

COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/scripts ./scripts

RUN mkdir -p /app/data

RUN chmod +x scripts/docker-entrypoint.sh

EXPOSE 3000

CMD ["sh", "scripts/docker-entrypoint.sh"]