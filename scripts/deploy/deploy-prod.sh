#!/usr/bin/env bash
set -euo pipefail

if [ "${GITHUB_ACTIONS:-}" != "true" ]; then
  echo "Production deploys should run through GitHub Actions only"
  exit 1
fi

bash scripts/deploy/deploy-supabase.sh production
