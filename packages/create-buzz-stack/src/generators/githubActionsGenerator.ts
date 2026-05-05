import type { GeneratedFile } from "./types.js";

export function generateGithubActionsFiles(): GeneratedFile[] {
  const header = `name: Buzz CI
`;

  return [
    {
      path: ".github/workflows/ci.yml",
      contents: `${header}
on:
  pull_request:
  push:
    branches: [main]

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 9.15.0
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: corepack enable
      - run: pnpm install --frozen-lockfile
      - run: pnpm typecheck
      - run: pnpm lint
      - run: pnpm test
      - run: bash scripts/ci/validate-migrations.sh
      - run: bash scripts/ci/mobile-checks.sh
      - run: bash scripts/ci/admin-build.sh
      - run: pnpm env:validate
`
    },
    {
      path: ".github/workflows/deploy-dev.yml",
      contents: `name: Deploy Development
on:
  workflow_dispatch:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: development
    steps:
      - uses: actions/checkout@v4
      - run: bash scripts/deploy/deploy-dev.sh
`
    },
    {
      path: ".github/workflows/deploy-staging.yml",
      contents: `name: Deploy Staging
on:
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v4
      - run: bash scripts/deploy/deploy-staging.sh
`
    },
    {
      path: ".github/workflows/deploy-prod.yml",
      contents: `name: Deploy Production
on:
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      - run: bash scripts/deploy/deploy-prod.sh
`
    },
    {
      path: ".github/workflows/mobile-build.yml",
      contents: `name: Mobile Build
on:
  workflow_dispatch:
    inputs:
      profile:
        required: true
        type: choice
        options: [development, staging, production]
      platform:
        required: true
        type: choice
        options: [ios, android, all]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: bash scripts/mobile/build-\${{ inputs.profile }}.sh
`
    },
    {
      path: ".github/pull_request_template.md",
      contents: `## Summary

Describe the change.

## Type of change

- [ ] Feature
- [ ] Bug fix
- [ ] Refactor
- [ ] Migration
- [ ] DevOps
- [ ] Documentation

## Testing

- [ ] Unit tests
- [ ] Typecheck
- [ ] Lint
- [ ] Manual test
- [ ] Migration tested locally
- [ ] RLS impact reviewed

## Screenshots

Add screenshots for UI changes.

## Deployment notes

Mention migrations, feature flags, secrets, or rollout concerns.

## Security/privacy notes

Mention any user data, location, auth, permissions, or secret changes.
`
    }
  ];
}
