# Repository setup and push guide

Cost Current now has a separate repository at **[Sambhav255/cost_current](https://github.com/Sambhav255/cost_current)**. The local branch is `main`, tracking `origin/main`; the configured remote is `https://github.com/Sambhav255/cost_current.git`.

## Current Git state

During preparation, `git init -b main` was denied by this session's `.git` write restriction. A separate workflow then initialized and linked the repository while file cleanup was in progress. Read-only inspection found initial commit `144526d` and merge `624e728` incorporating the remote placeholder. The latest documentation/formatting changes remain local and uncommitted at this checkpoint.

Do not reinitialize the repository or add a second `origin`. Run the following from a regular terminal with `.git` write access after reviewing the changes:

```sh
cd /Users/sambhav/cost_current
git status --short --branch
git diff --stat
git diff --check
npm run check
npm run test:e2e
git add .
git diff --cached --stat
git diff --cached --check
git commit -m "Organize build plan, handoff docs and repository checks"
git push origin main
```

Commit identity was absent from the configuration inspected by this session. If Git asks, set the real author's name and email locally with `git config user.name` and `git config user.email`; avoid inventing an identity or changing global settings unnecessarily. See [README](../README.md) for the optional browser installation required by `test:e2e`.

## Files that belong in Git

Track source, tests, public assets, package metadata and lockfile, configurations, CI, README, agent instructions, both planning briefs and maintained documentation. `.gitignore` excludes dependencies, builds, browser downloads/profiles, local test/PDF/screenshot artifacts, caches, logs, editor state and environment files. No application credentials or environment file are required to run the project.

No source license has been chosen. Do not add a license on the owner's behalf. Repository visibility and rights to third-party data are separate decisions; verify the chosen remote's visibility before adding real company information.

## After pushing

GitHub Actions is configured for formatting, local documentation links, lint, TypeScript, unit tests, production build and browser tests. Its hosted execution has not been verified in this session. Check the actual run after pushing; a workflow file alone is not a passing hosted run.

For later changes, run appropriate checks, update [Progress](PROGRESS.md), inspect the diff and keep commits focused. Keep actual importer files, private quotes, secrets and generated browser artifacts out of version control. The CSV sample bundled in the app is fictional.
