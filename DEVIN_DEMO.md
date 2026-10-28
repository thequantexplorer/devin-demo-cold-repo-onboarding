# Devin demo: Onboarding a cold repo: blueprint plus memory

**What it shows:** "Onboarding an engineer in 10 minutes." The repo fails cold and its README says almost nothing. Devin works out the services and env it needs, writes a repo environment blueprint and Knowledge notes, and proves a fresh session gets to green tests with one command.

**Needs:** GitHub. Devin will ask you to approve the environment (blueprint) and org Knowledge changes.

More demos: [devin-advanced-demos](https://github.com/thequantexplorer/devin-advanced-demos)

## Set it up

1. Click **Use this template → Create a new repository** (or fork it) into your own GitHub account or org.
2. In Devin, open **Settings → Integrations → GitHub** and make sure Devin can access the new repository.

## Prompt

Start a new Devin session and paste this. Replace `<you>` with your GitHub user or org.

```text
Onboard yourself to https://github.com/<you>/devin-demo-cold-repo-onboarding like a new engineer on day one.

First, try to run the tests cold and show me exactly what fails. Then figure out what this repo really needs (Postgres, Redis, migrations, seed data, required env vars like DATABASE_URL / REDIS_URL / LEDGER_SIGNING_KEY) and make it reproducible: write a repo-level environment blueprint so future sessions boot with services running and deps installed, and add Knowledge/Memory notes for the non-obvious rules of this codebase (how postings must balance, how to run migrations, where config lives). Finish by proving a fresh setup goes from clone to green tests with one command, and list everything you saved so the next engineer (or Devin) starts productive in seconds.
```
