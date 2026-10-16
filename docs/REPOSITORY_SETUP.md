# New repository setup

The project is prepared for a **new, separate Cost Current repository**. No remote URL or visibility has been chosen, and no push has been performed. This session attempted `git init -b main`, but the environment denied writes to `.git` with `Operation not permitted`; no local Git repository or commit was created. Source and documentation preparation does not depend on that restriction.

## What belongs in the initial commit

Track source, tests, public assets, package metadata and lockfile, configurations, CI, README, agent instructions, both original planning briefs and maintained documentation. `.gitignore` excludes dependencies, builds, browser downloads/profiles, local test/PDF/screenshot artifacts, caches, logs, editor state and environment files. No application credentials or environment file are needed to run this project.

No source license has been chosen. Do not add an open-source license on the owner's behalf. A new private repository is a reasonable starting point while visibility, licensing and contributed data rights are decided.

## Initialize and inspect locally

Run these commands in a regular terminal with write access to this folder:

```sh
cd /Users/sambhav/cost_current
git init -b main
git add .
git status --short
git diff --cached --stat
git diff --cached --check
```

Review the staged file list before committing. Generated directories such as `node_modules`, `dist`, `.playwright`, `test-results` and `output` should not appear. Commit identity was not configured in this session. If Git asks for an identity, set the real author's name and email for this repository using `git config user.name` and `git config user.email` before continuing; avoid inventing an identity or changing global settings unnecessarily.

```sh
npm run check
npm run test:e2e
git commit -m "Initialize Cost Current prototype and intake foundation"
```

The optional test browser must be installed as described in [README](../README.md).

## Push to a new remote

Create an **empty** repository on your chosen Git host. Leave remote README, license and ignore templates unchecked because these files already exist locally. Then replace the example URL below with the actual new repository URL:

```sh
git remote add origin https://github.com/YOUR_ACCOUNT/cost-current.git
git push -u origin main
```

GitHub Actions is already configured for formatting, documentation links, lint, TypeScript, unit tests, production build and browser tests. Hosted CI results will only exist after the repository is pushed. Do not treat a workflow file as evidence of a passing hosted run.

## Before later commits

Run checks appropriate to the change, update [Progress](PROGRESS.md), inspect `git diff`, and keep commits focused. Keep real importer files, quotes, secrets and generated browser artifacts out of version control. The CSV sample bundled in the app is explicitly fictional.
