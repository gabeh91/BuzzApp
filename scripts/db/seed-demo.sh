#!/usr/bin/env bash
set -euo pipefail

docker exec -i supabase_db_buzz psql -U postgres -d postgres -v ON_ERROR_STOP=1 < supabase/seed.demo.sql
