#!/usr/bin/env bash
set -euo pipefail

pnpm --filter mobile typecheck
