#!/usr/bin/env bash
set -euo pipefail

TARGET_ENV="${1:-development}"
echo "Deploying Supabase assets to ${TARGET_ENV}"
