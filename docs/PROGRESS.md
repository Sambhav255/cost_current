# Progress and handoff

**Updated:** October 16, 2026  
**Canonical status record.** Prefer this file over dated handoffs, session recovery notes, or older execution-plan “next” sections.

**Primary product direction:** [Predictive intelligence plan](PREDICTIVE_INTELLIGENCE_PLAN.md) and [realignment brief](../COST_CURRENT_PREDICTIVE_INTELLIGENCE_REALIGNMENT_CODEX.md). Older plans ([master build](../COST_CURRENT_MASTER_BUILD_PLAN.md), [master execution](MASTER_EXECUTION_PLAN.md), [forecast contract](FORECASTS.md)) remain references for preserved engines and gates—not higher-priority instructions.

**Historical detail** (dated checkpoints, superseded handoffs): [PROGRESS_ARCHIVE.md](PROGRESS_ARCHIVE.md).

## Unified integration milestone P0 — local baseline

The [unified external-intelligence plan](../COST_CURRENT_UNIFIED_INTELLIGENCE_INTEGRATION_CODEX.md) now sets the integration sequence. Local `main` at `eb5e549` is one commit ahead of `origin/main` (`95d6563`); the unified plan file is untracked and was preserved. The four files named in the older hosted formatting failure are already formatted in this newer local commit, so no formatting-only source edit was needed.

**Verified locally:** `npm run check` passed (format, 17-document link check, lint, types, 69 unit tests, production build); `npm run test:e2e` passed (26 desktop/narrow cases). The existing demo event → exposure → decisions flow, Northstar arithmetic, CSV atomicity, Forecast/What if? separation, persistence and memo flows remain covered by those tests. **Hosted CI for this checkpoint is not yet verified.** This milestone makes no new provider or prediction claim.

**Next:** P0.5 semantic corrections: unknown corridor state, separate delay assumption, demo-only policy matching, geographic evidence and immutable event context. Then rerun the gates before P1.

---

## Current state

Local prototype for smaller importers. Core story is **event → exposure → conditional dollars → decisions**, with the existing landed-cost calculator as the downstream engine.

| Layer                                       | Status                                                        |
| ------------------------------------------- | ------------------------------------------------------------- |
| Mentor demo + deterministic cost engine     | **Implemented and tested**                                    |
| CSV intake, ledger, evidence, memos         | **Implemented and tested**                                    |
| Forecast / What if? separation              | **Implemented and tested** (auto event odds stay unavailable) |
| Illustrative intelligence vertical slice    | **Implemented and tested locally** (curated demo events only) |
| Live market/official event odds             | **Not implemented**                                           |
| Trained ML / rights-reviewed lane backtests | **Not implemented**                                           |
| Decision journal, accounts, deployment      | **Not implemented**                                           |

---

## Implemented and working

### Intelligence (illustrative)

- Welcome CTA **Explore supply-chain risks** → default **Intelligence** view.
- Curated demo registry (`src/lib/riskEvents.ts`, `riskExposure.ts`): China-origin tariff scenario; Red Sea/Suez corridor scenario.
- Event detail: definition, horizon, as-of, likelihood status (`null` → **Not available**), limitations.
- Exposure matching: reviewed / possible / not applicable / unknown; SHA→LAX is **not** auto-exposed to Suez (declared `viaCorridor` required).
- Conditional impact only for **reviewed/confirmed** matches; zero duty assumption → unavailable dollars (e.g. Nordic on tariff without increase).
- **Explore options** → Decisions / What if? with event context banner; existing engine unchanged.
- Corridor watch zones on **2D** map fallback only.
- Demo lane/shipment: `sha-rtm` / `nordic-home` (merged into older localStorage demos when missing).

### Decisions and calculator

- Northstar canonical arithmetic preserved (see Acceptance numbers).
- What if?: manual assumptions, reversible overrides, early/wait/alternatives.
- Forecast: last-observation freight baseline from local registry; never invents event odds; abstains without eligible observations.
- Import CSV, cost ledger, evidence invalidation, printable/JSON memos, Methods & evidence.

### Navigation

**Intelligence | My Exposure | Decisions | Methods & evidence**, plus Import and Decision memo in the sidebar. My Exposure labels portfolio “expected extra cost” as scenario-assumption only.

---

## Tested and verified

| Check              | Status                                                                                      |
| ------------------ | ------------------------------------------------------------------------------------------- |
| `npm run check`    | **PASSED** — format, docs (16 Markdown docs), lint, types, 69 unit tests, production build. |
| `npm run test:e2e` | **PASSED** — 26/26 desktop+mobile (intelligence + hardened forecast specs).                 |

**Last pushed `main`:** `bc20e9c` — Hosted CI [38861182119](https://github.com/Sambhav255/cost_current/actions/runs/38861182119) **success** (pre-slice hosted baseline). Do not claim hosted CI for this commit until Actions runs after push.

**Intelligence honesty gates (unit tests, 69):** Suez does not tag Northstar; Suez odds unavailable; tariff demo odds are illustrative assumptions; Northstar wait/early **$123,600 / $121,100**.

---

## Incomplete, experimental, or illustrative only

| Item                                                       | Notes                                                              |
| ---------------------------------------------------------- | ------------------------------------------------------------------ |
| Event registry                                             | Curated fictional demos (`isDemoScenario`); not a live threat feed |
| Automatic event probabilities                              | Always unavailable unless labeled user assumption                  |
| 3D globe event zones                                       | Not wired; zone markers are 2D-only                                |
| Real prediction-market / official notice connectors        | Deferred (P2 in predictive plan)                                   |
| Rights-reviewed freight history + time-ordered model study | Deferred (P3); local last-observation baseline only                |
| Prospective decision / outcomes journal                    | Deferred (P4)                                                      |
| Customer interviews / paid pilots                          | Research outside this repo                                         |
| Accounts, multi-tenant SaaS, licensed feeds                | Deferred (P5)                                                      |

Do not describe illustrative cards, Forecast mode, or UI polish as calibrated prediction or legal duty determination.

---

## Known limitations

- Browser-only localStorage; no sync, auth, or server persistence.
- Costs reflect entered scope only; stockouts, financing, and unentered fees omitted.
- Independence of tariff/freight events is a demo assumption, not a global supply-chain model.
- CSV customer references are claims, not verified quotes or official duties.
- Route arcs and corridor zones are schematic, not vessel tracks.
- Viewport e2e is not physical-device certification.

---

## Next priorities (predictive intelligence order)

1. **P2 — Real signal path:** one lawful read-only source with exact IDs, timestamps, failure states; never silent demo fallback.
2. **P3 — One forecast study:** rights-reviewed lane series; naive baseline vs modest model only if sample size justifies; report failures.
3. **P4 — Journal + customer learning:** immutable known-at-time snapshots; importer/broker interviews.
4. **Engineering polish (non-blocking):** 3D zone parity; keep calculator regressions green.

Do not spend a sprint only on visual redesign. Do not invent live odds or ML accuracy to fill the Intelligence feed.

---

## Acceptance numbers to preserve

Illustrative Northstar defaults (not a calibrated forecast):

| Metric                            |            Expected |
| --------------------------------- | ------------------: |
| Goods / customs value             | $100,000 / $100,000 |
| Current duty / freight            |    $10,000 / $7,000 |
| Base landed cost                  |            $117,000 |
| Tariff event impact / probability |       $15,000 / 40% |
| Expected extra tariff / freight   |       $6,000 / $600 |
| Wait / early expected totals      | $123,600 / $121,100 |
| Early savings vs wait             |              $2,500 |
| Break-even tariff probability     |            23.3333% |
| Wait at 10% tariff probability    |            $119,100 |

Four waiting outcomes under independence: $117,000 (48%), $120,000 (12%), $132,000 (32%), $135,000 (8%).

---

## Document map

| Doc                                                             | Role                                                           |
| --------------------------------------------------------------- | -------------------------------------------------------------- |
| [README](../README.md)                                          | Product overview, setup, walkthrough                           |
| [PREDICTIVE_INTELLIGENCE_PLAN](PREDICTIVE_INTELLIGENCE_PLAN.md) | Active stage plan                                              |
| [FORECASTS](FORECASTS.md)                                       | Freight baseline contract and data gates                       |
| [CSV_INTAKE](CSV_INTAKE.md)                                     | Import schema                                                  |
| [IMPLEMENTATION_PLAN](IMPLEMENTATION_PLAN.md)                   | Architecture and calculation invariants                        |
| [MASTER_EXECUTION_PLAN](MASTER_EXECUTION_PLAN.md)               | Historical audit / execution notes (superseded priority order) |
| [PROGRESS_ARCHIVE](PROGRESS_ARCHIVE.md)                         | Dated handoffs and checkpoint history                          |
