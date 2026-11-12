FROM node:22-bookworm-slim
RUN corepack enable && corepack prepare pnpm@10.28.2 --activate
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile --ignore-scripts
ENV API_BASE_URL=http://api:4100
RUN pnpm --filter @brofit/web build
EXPOSE 3001
CMD ["pnpm", "--filter", "@brofit/web", "exec", "next", "start", "--hostname", "0.0.0.0", "--port", "3001"]
