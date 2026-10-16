# Working on Cost Current

## Read before changing code

1. `README.md` — product summary, local commands, and demo walkthrough.
2. `docs/PROGRESS.md` — **canonical** implemented / tested / next status.
3. `docs/PREDICTIVE_INTELLIGENCE_PLAN.md` — **active** stage plan after the predictive-intelligence realignment.
4. `COST_CURRENT_PREDICTIVE_INTELLIGENCE_REALIGNMENT_CODEX.md` — product-direction brief (primary over older roadmaps where they conflict).
5. `docs/IMPLEMENTATION_PLAN.md` — architecture and calculation invariants.
6. `docs/FORECASTS.md` / `docs/CSV_INTAKE.md` — contracts for freight baseline and CSV intake.

**Reference only (not higher priority than the items above):** `COST_CURRENT_MASTER_BUILD_PLAN.md`, `docs/MASTER_EXECUTION_PLAN.md`, `COST_CURRENT_CODEX_BRIEF.md`, `docs/PROGRESS_ARCHIVE.md`, `SESSION_HANDOFF.md`.

## Preserve the authorized scope

The local mentor prototype, CSV/ledger/evidence foundation, Forecast/What if? separation, and the **illustrative** Intelligence vertical slice are in the working product path. Continue the next bounded milestone from [PROGRESS](docs/PROGRESS.md) and [PREDICTIVE_INTELLIGENCE_PLAN](docs/PREDICTIVE_INTELLIGENCE_PLAN.md) (real signal path, then one rights-reviewed forecast study—not unfinished historical checklists as blockers).

No credentials, paid feeds, model APIs, login, or public deployment are required for the free local demo. Fictional samples and editable assumptions drive the demo. Quantitative models are future work, not trained or validated capabilities.

Keep cost calculations deterministic and separate from UI, persistence, and future inference. Money is USD cents; rates/probabilities are basis points. Keep customs value separate from goods acquisition cost. Preserve the canonical Northstar example and the date-boundary regression tests.

An earlier purchase alone does not establish tariff avoidance. Rerouting alone does not change country of origin. Do not turn example assumptions into regulatory claims, live prices, calibrated forecasts, customer traction, or model accuracy statistics.

## Verification and handoff

Run checks appropriate to changes. For meaningful batches, verify `npm run check` (formatting, documentation links, lint, types, unit tests, build) and `npm run test:e2e` when user flows change. Browser setup uses a workspace-local Playwright browser, an installed macOS Brave fallback, or `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`; see README / engineering guide before changing it.

After each meaningful work batch, update `docs/PROGRESS.md` with the change, actual verification result, limitations, and next action. Update README when run instructions or readiness change; update the predictive plan when stage order changes. Distinguish implemented source from integrated behavior and passing checks. Do not overwrite prior history with an unsupported “complete” status—move superseded narrative to `docs/PROGRESS_ARCHIVE.md` instead.
