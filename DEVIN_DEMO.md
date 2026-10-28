# Devin demo: Onboarding a cold repo: blueprint plus skill

**What it shows:** The tests fail on a fresh clone and the README is nearly empty. Devin works out the services and env vars the repo needs, writes an environment blueprint and a repo skill, and shows a fresh session reaching green tests with one command.

**Needs:** GitHub. Devin will ask you to approve the environment blueprint change, and the skill arrives in its PR.

More demos: [devin-advanced-demos](https://github.com/thequantexplorer/devin-advanced-demos)

## Set it up

1. Click **Use this template → Create a new repository**, choose your GitHub account or org as the owner, and keep the name `devin-demo-cold-repo-onboarding`. The links and prompt below assume that name. Use the template rather than a fork: pull requests on a fork go to the original repo by default.
2. In Devin, open [**Settings → Connections → GitHub**](https://app.devin.ai/settings/connections/github) and make sure Devin can access the new repository.

## Prompt

Start a new Devin session and paste this. Replace `<you>` with your GitHub user or org.

```text
Onboard yourself to https://github.com/<you>/devin-demo-cold-repo-onboarding like a new engineer on day one.

First, try to run the tests cold and show me exactly what fails. Then figure out what this repo really needs (Postgres, Redis, migrations, seed data, required env vars like DATABASE_URL / REDIS_URL / LEDGER_SIGNING_KEY) and make it reproducible: write a repo-level environment blueprint so future sessions boot with services running and deps installed, and open a PR that adds a repo skill at .agents/skills/<name>/SKILL.md covering the non-obvious rules of this codebase (how postings must balance, how to run migrations, where config lives). Finish by proving a fresh setup goes from clone to green tests with one command, and list everything you saved so the next engineer (or Devin) starts productive in seconds.
```
