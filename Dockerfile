# build
FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

# prod
FROM node:24-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV DATABASE_URL=file:/app/data/app.db

COPY package*.json ./

RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

COPY docker-entrypoint.sh ./docker-entrypoint.sh
COPY drizzle.config.ts ./drizzle.config.ts
COPY drizzle ./drizzle

RUN chmod +x ./docker-entrypoint.sh \
    && mkdir -p /app/data

EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]