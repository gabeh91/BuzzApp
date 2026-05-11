#!/usr/bin/env bash
set -euo pipefail

supabase db reset
bash scripts/db/seed-demo.sh
