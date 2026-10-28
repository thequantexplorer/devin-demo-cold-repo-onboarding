# acme-ledger-service

Double-entry ledger behind Acme Wallet. Postgres holds accounts/transfers/postings; Redis caches idempotency keys.

## Quick start

Needs Node 20-22, corepack (pnpm 9.15), and Docker.

```sh
pnpm bootstrap   # install, create .env, start Postgres + Redis, migrate, test
```

Re-runnable. `SKIP_TESTS=1 pnpm bootstrap` stops after migrations; `SEED=1` also seeds demo accounts.

Afterwards, load `.env` before running things by hand:

```sh
set -a; . ./.env; set +a
pnpm test | pnpm dev | pnpm db:migrate | pnpm db:seed
```

Reset the database: `docker compose down -v && pnpm bootstrap`.

## Config

Env vars, validated on import in `src/config.js` (template: `.env.example`):

| Var | Purpose |
| --- | --- |
| `DATABASE_URL` | Postgres, `localhost:5433` from docker-compose |
| `REDIS_URL` | Redis, `localhost:6380` from docker-compose |
| `LEDGER_SIGNING_KEY` | HMAC key for transfer signatures; any non-empty value locally |

See [AGENTS.md](AGENTS.md) for migration and ledger rules.

Ask in #ledger-eng if you get stuck.

---

This repo is a starter for a Devin demo. See [DEVIN_DEMO.md](DEVIN_DEMO.md) for setup and the prompt.
