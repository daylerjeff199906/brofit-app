FROM node:22-bookworm-slim
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@10.28.2 --activate
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile --ignore-scripts
ENV DATABASE_URL=postgresql://brofit:build-only@127.0.0.1:5432/brofit
RUN pnpm --filter @brofit/api exec prisma generate
RUN pnpm --filter @brofit/api build
EXPOSE 4100
CMD ["sh", "-c", "pnpm db:migrate && pnpm db:seed && pnpm --filter @brofit/api start"]
