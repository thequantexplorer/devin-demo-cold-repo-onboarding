#!/usr/bin/env bash
# One command from a fresh clone to green tests. Safe to re-run.
#   SKIP_TESTS=1  stop after migrations
#   SEED=1        also run scripts/seed.js (alice/bob demo accounts)
set -euo pipefail
cd "$(dirname "$0")/.."

corepack enable >/dev/null 2>&1 || true
pnpm install --frozen-lockfile

if [ ! -f .env ]; then
  cp .env.example .env
  key=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
  sed -i.bak "s/^LEDGER_SIGNING_KEY=.*/LEDGER_SIGNING_KEY=${key}/" .env && rm -f .env.bak
  echo "created .env with a random local LEDGER_SIGNING_KEY"
fi
set -a; . ./.env; set +a

# Docker Hub rate-limits anonymous pulls; fall back to the GCR mirror.
for img in postgres:16-alpine redis:7-alpine; do
  docker image inspect "$img" >/dev/null 2>&1 && continue
  docker pull -q "$img" >/dev/null 2>&1 || {
    docker pull -q "mirror.gcr.io/library/$img" && docker tag "mirror.gcr.io/library/$img" "$img"
  }
done
docker compose up -d --wait

pnpm db:migrate
[ "${SEED:-0}" = "1" ] && pnpm db:seed
[ "${SKIP_TESTS:-0}" = "1" ] && exit 0
pnpm test
