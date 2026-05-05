import type { GeneratedFile } from "./types.js";

export function generateRailwayFiles(): GeneratedFile[] {
  const deployScript = (serviceKey: string, serviceVar: string) => `#!/usr/bin/env bash
set -euo pipefail

ENVIRONMENT="\${1:-development}"

if ! command -v railway >/dev/null 2>&1; then
  echo "Railway CLI is not installed"
  exit 1
fi

if [ -z "\${RAILWAY_TOKEN:-}" ]; then
  echo "Missing RAILWAY_TOKEN"
  exit 1
fi

if [ -z "\${RAILWAY_PROJECT_ID:-}" ]; then
  echo "Missing RAILWAY_PROJECT_ID"
  exit 1
fi

if [ -z "\${${serviceVar}:-}" ]; then
  echo "Missing ${serviceVar}"
  exit 1
fi

echo "Deploying ${serviceKey} to Railway environment: $ENVIRONMENT"

railway link --project "$RAILWAY_PROJECT_ID" --environment "$ENVIRONMENT" --service "$${serviceVar}"
railway up --detach --service "$${serviceVar}"
`;

  return [
    {
      path: "railway.json",
      contents: `{
  "$schema": "https://railway.com/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
`
    },
    {
      path: "scripts/railway/deploy-admin.sh",
      contents: deployScript("admin", "RAILWAY_SERVICE_ADMIN"),
      executable: true
    },
    {
      path: "scripts/railway/deploy-api.sh",
      contents: deployScript("api", "RAILWAY_SERVICE_API"),
      executable: true
    },
    {
      path: "scripts/railway/deploy-worker.sh",
      contents: deployScript("worker", "RAILWAY_SERVICE_WORKER"),
      executable: true
    }
  ];
}
