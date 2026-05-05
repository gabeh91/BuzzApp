FROM node:22-alpine
WORKDIR /app
COPY . .
RUN corepack enable
CMD ["pnpm", "--filter", "worker", "start"]
