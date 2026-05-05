import type { GeneratedFile } from "./types.js";

export function generateDockerFiles(): GeneratedFile[] {
  return [
    {
      path: "docker/admin.Dockerfile",
      contents: `FROM node:22-alpine
WORKDIR /app
COPY . .
RUN corepack enable
CMD ["pnpm", "--filter", "admin", "start"]
`
    },
    {
      path: "docker/api.Dockerfile",
      contents: `FROM node:22-alpine
WORKDIR /app
COPY . .
RUN corepack enable
CMD ["pnpm", "--filter", "api", "start"]
`
    },
    {
      path: "docker/worker.Dockerfile",
      contents: `FROM node:22-alpine
WORKDIR /app
COPY . .
RUN corepack enable
CMD ["pnpm", "--filter", "worker", "start"]
`
    },
    {
      path: "docker/README.md",
      contents: "# Docker\n\nDockerfiles are provided for admin, API, and worker parity across local development, CI, and future Railway builds.\n"
    }
  ];
}
