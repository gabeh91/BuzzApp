#!/usr/bin/env bash
set -euo pipefail

supabase gen types typescript --local > packages/shared-types/src/database.ts
