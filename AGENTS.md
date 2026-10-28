# AGENTS.md: acme-ledger-service

Notes for engineers and coding agents. Keep this in sync with the code.

## Setup / tests
- One command from a fresh clone: `pnpm bootstrap` (`scripts/bootstrap.sh`). It installs deps, creates `.env` from `.env.example` with a random local `LEDGER_SIGNING_KEY`, starts Postgres (:5433) and Redis (:6380) with `docker compose up -d --wait`, runs `pnpm db:migrate`, then `pnpm test`. Idempotent. `SKIP_TESTS=1` stops after migrating; `SEED=1` also seeds demo accounts.
- Nothing loads `.env` automatically. Before running `pnpm test`, `pnpm dev`, or `pnpm db:*` by hand: `set -a; . ./.env; set +a`.
- Tests are integration tests against real Postgres + Redis (no mocks), run serially (`--test-concurrency=1`), and do not clean up. Reset with `docker compose down -v && pnpm bootstrap`.
- Node >=20 <23; pnpm 9.15 via corepack (`packageManager` in package.json).

## Config
- All config is env vars, read and validated at import time in `src/config.js`: `DATABASE_URL`, `REDIS_URL`, `LEDGER_SIGNING_KEY`. All are required; one missing throws on import, so every test file fails before any test runs.
- `LEDGER_SIGNING_KEY` is the HMAC-SHA256 key for `transfers.signature`. Any non-empty value works locally. Never commit a real key; `.env` is gitignored.
- Ports in `.env.example` (5433, 6380) match `docker-compose.yml`, not the Postgres/Redis defaults.

## Migrations
- `pnpm db:migrate` (`scripts/migrate.js`) runs every `migrations/*.sql` in filename order on every run. There is no tracking table.
- So every migration must be idempotent (`CREATE ... IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS`, guarded backfills). Add a new `NNN_name.sql`; never edit one that has been applied.

## Ledger rules
- Money is integer minor units (`amount_minor bigint`, e.g. cents). Never use floats.
- Balance = `SUM(postings.amount_minor)` for the account. There is no stored balance column.
- Double entry: a transfer writes postings that sum to zero (`-amount` on `from`, `+amount` on `to`), in one Postgres transaction with its `transfers` row.
- `POST /transfers` requires an `Idempotency-Key` header. Results are cached in Redis as `idem:<key>` for 24h; `transfers.idempotency_key` is UNIQUE in Postgres.
- Overdrafts return 409 `insufficient funds`.

## Known gaps (don't rely on them; fix in dedicated PRs)
- `deposit()` writes a single-leg posting, so deposits do not sum to zero (no funding/equity account). Exclude `signature = 'deposit'` when auditing balance.
- `transfer()` does not validate `amountMinor > 0` or matching currencies.
- The overdraft check is not concurrency-safe (no row lock / SERIALIZABLE).
- If the Redis idempotency entry is missing, a retry hits the UNIQUE constraint and returns 500 instead of replaying.
