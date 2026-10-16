# Working on Cost Current

## Read before changing code

1. `README.md` — product summary, local commands, source map, and demo acceptance script.
2. `docs/PROGRESS.md` — canonical dated implementation/verification status and next actions.
3. `docs/IMPLEMENTATION_PLAN.md` — priorities, architecture, future models, and completion gates.
4. `COST_CURRENT_MASTER_BUILD_PLAN.md` — current prototype requirements and staged final-product blueprint.
5. `docs/MASTER_EXECUTION_PLAN.md` — current prototype audit, now/next/later execution plan, and Vigil review.
6. `COST_CURRENT_CODEX_BRIEF.md` — original founder vision and quality conditions.

`SESSION_HANDOFF.md` records recovered historical context. Prefer the current progress log for readiness. Inspect current source as well: another task was actively building this same folder during the initial handoff. Establish ownership before overwriting files.

## Preserve the authorized scope

The local mentor prototype is complete. The user has now authorized advancing through the master build plan. Start with the bounded milestone in `docs/MASTER_EXECUTION_PLAN.md` while preserving the free local demo. No credentials, paid feeds, model APIs, login, or public deployment are required. Fictional samples and editable assumptions drive the demo. The quantitative models are future work, not trained or validated capabilities.

Keep cost calculations deterministic and separate from UI, persistence, and future inference. Money is USD cents; rates/probabilities are basis points. Keep customs value separate from goods acquisition cost. Preserve the canonical Northstar example and the date-boundary regression tests.

An earlier purchase alone does not establish tariff avoidance. Rerouting alone does not change country of origin. Do not turn example assumptions into regulatory claims, live prices, calibrated forecasts, customer traction, or model accuracy statistics.

## Verification and handoff

Run checks appropriate to changes. For the completed demo, verify `npm run test`, `npm run typecheck`, and `npm run build`, plus the actual browser walkthrough. The `test:e2e` suite now has desktop and narrow touch projects. It uses a workspace-local Playwright browser, an installed macOS Brave fallback, or `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`; see README before changing its browser setup.

After each meaningful work batch, update `docs/PROGRESS.md` with the change, actual verification result, limitations, and next action. Update README when run instructions or readiness change; update the implementation plan when priorities or architecture change. Distinguish implemented source from integrated behavior and passing checks. Do not overwrite prior history with an unsupported “complete” status.
