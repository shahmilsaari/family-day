FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:22-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV DATABASE_URL="file:/app/data/family-day.db"
ENV PORT=3000

# Install sqlite for the init script
RUN apk add --no-cache sqlite

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=build /app/node_modules/better-sqlite3 ./node_modules/better-sqlite3
COPY --from=build /app/scripts ./scripts

RUN mkdir -p /app/data

RUN chmod +x scripts/docker-entrypoint.sh

EXPOSE 3000

CMD ["sh", "scripts/docker-entrypoint.sh"]