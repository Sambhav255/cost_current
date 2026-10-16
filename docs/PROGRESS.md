# Progress and handoff

**Updated:** October 16, 2026  
**Canonical status record.** Prefer this file over dated handoffs, session recovery notes, or older execution-plan “next” sections.

**Primary integration direction:** [Unified external-intelligence plan](../COST_CURRENT_UNIFIED_INTELLIGENCE_INTEGRATION_CODEX.md). The [predictive intelligence plan](PREDICTIVE_INTELLIGENCE_PLAN.md) and older plans remain references for the preserved product and engine.

**Historical detail** (dated checkpoints, superseded handoffs): [PROGRESS_ARCHIVE.md](PROGRESS_ARCHIVE.md).

## Unified integration milestone P0 — local baseline

The [unified external-intelligence plan](../COST_CURRENT_UNIFIED_INTELLIGENCE_INTEGRATION_CODEX.md) now sets the integration sequence. Local `main` at `eb5e549` is one commit ahead of `origin/main` (`95d6563`); the unified plan file is untracked and was preserved. The four files named in the older hosted formatting failure are already formatted in this newer local commit, so no formatting-only source edit was needed.

**Verified locally:** `npm run check` passed (format, 17-document link check, lint, types, 69 unit tests, production build); `npm run test:e2e` passed (26 desktop/narrow cases). The existing demo event → exposure → decisions flow, Northstar arithmetic, CSV atomicity, Forecast/What if? separation, persistence and memo flows remain covered by those tests. [Hosted CI for `e66d545`](https://github.com/Sambhav255/cost_current/actions/runs/38876547607) passed, replacing the older red `95d6563` check. This milestone makes no new provider or prediction claim.

**Next:** P0.5 semantic corrections: unknown corridor state, separate delay assumption, demo-only policy matching, geographic evidence and immutable event context. Then rerun the gates before P1.

## Unified integration milestone P0.5 — semantic corrections

Shipment itinerary evidence now explicitly says `known_traverses`, `known_avoids`, or `unknown`. Northstar's fictional reviewed route avoids Suez and Nordic's fictional reviewed route traverses it; imported, manually added and older saved shipments lack that evidence and remain unknown until the user confirms an itinerary. Changing the selected route clears its prior itinerary and asset evidence. The form exposes the confirmation state. Non-demo policy events do not reuse the demo product-word rule. The optional `assumedDisruptionDelayDays` field is separate from early-order `holdingDays`; missing delay stays null. A selected event is frozen with its ID, source date, signal and linked shipment when opening Decisions, and the event context is included in What if? memo snapshots. Map focus follows the selected event's supported exposure rather than a hard-coded shipment; corridor dots are described as illustrative watch locations.

**Verified locally:** `npm run check` passed with 71 unit tests and build; the full 26-case desktop/narrow Playwright suite passed, then the modified Intelligence spec passed 6/6 on both viewports. A legacy v1 storage fixture without itinerary evidence loads, and imported shipments do not inherit demo route evidence. The existing Northstar calculation remains unchanged. [Hosted CI for `0daaae3`](https://github.com/Sambhav255/cost_current/actions/runs/38877134156) passed. Known asset fields have a validated additive storage shape, but the user-entry and observed-event matching flow belongs to P1. No event odds, delay days or official tariff applicability are inferred.

**Next:** P1 USGS source registry, bounded adapter, honest feed status and known-asset proximity → user-entered conditional cost flow.

## Unified integration milestone P1 — USGS observed earthquakes

The official-observations filter fetches the fixed USGS past-day GeoJSON URL directly in the browser. The adapter bounds response size and row count, times out after 10 seconds, validates point/ID/time/magnitude fields, deduplicates revisions by ID and update time, and separates origin, update, feed-generation and retrieval times. It reports fresh, stale, invalid, unavailable and valid-empty states without falling back to fiction. A separate **Fictional test** control hosts an explicitly synthetic event. The [source register](DATA_SOURCE_REGISTER.md) records endpoint, attribution, prototype rights basis, commercial review status and failure behavior.

Shipments can save a customer-confirmed port or supplier-site coordinate; Northstar has a clearly fictional test asset. Great-circle distance within a stated 100 km screening radius yields only a **possible** match. A user must supply additional delay days, per-day inventory/stockout cost and handling cost before incremental dollars appear. The observed event and exact user assumptions follow the shipment to Decisions and a frozen What if? memo; the existing tariff/freight scenario totals remain separate. The 2D map plots the reported epicenter as a point, not a damage polygon.

**Verified locally:** `npm run check` passed with 76 unit tests, lint, types, docs and build; the repeat full Playwright suite passed **30/30 desktop/narrow cases**. The first full browser run had 29 passes and one desktop click failure: the three source buttons overflowed their narrow column and the detail panel intercepted the third button. The controls now wrap; the affected Intelligence suite passed 10/10 before the clean full rerun. A real browser GET returned a fresh USGS feed (158 normalized events, one incomplete record skipped; generated 2026-10-16T09:04:29Z, retrieved 09:04:39Z), and 30 cards rendered. This is a one-time observed snapshot, not a prediction or ongoing monitoring guarantee. [Hosted CI for `42c4c3f`](https://github.com/Sambhav255/cost_current/actions/runs/38878332222) passed.

**Incomplete:** No observed earthquake implies actual damage or delay. The current feed covers only its rolling past-day window; no historical archive, automatic odds, carrier route, live alert service or calibrated impact model exists. Commercial reuse, retention and model-training rights remain pending source-specific review. The map's 3D view does not yet show the earthquake point.

**Next:** inspect official NOAA/NHC GIS advisory formats for P2. If reliable active geometry cannot be consumed within a bounded adapter, show an honest limited/unavailable state and document the technical gate.

## Unified integration milestone P2 — NHC cyclone forecasts

The **Official forecasts** Intelligence filter reads NHC's current-storm summary through a fixed same-origin endpoint and fetches only linked official cone KMZs. The endpoint bounds time, bytes, storm count and extracted geometry; KML is checked against the storm and advisory version. The client keeps issuance time, retrieval time, basin and source link, and reports fresh, stale, invalid, unavailable and valid-empty states. Missing or mismatched geometry leaves a readable advisory with unknown geographic exposure. Stale cones are suppressed. The 2D map shows a documented official forecast cone and known-asset overlap; a cone describes potential storm-center location, not wind extent or port closure. The user supplies delay/cost assumptions before conditional dollars appear, and the advisory context is frozen into the What if? memo.

**Verified locally:** `npm run check` passed (format, docs, lint, types, **83 unit tests**, production build). The full Playwright desktop/narrow suite passed **34/34**; targeted Intelligence tests passed 14/14. Unit cases cover empty/outage/malformed/stale responses, ambiguous basin, advisory mismatch, polygon holes and antimeridian crossing. A read-only local GET of the same-origin endpoint returned two active NHC advisories with version-matched cone geometry on October 16; the browser rendered them and classified Northstar's fictional test asset outside the selected cone. This is a dated source check, not a forecast of shipment outcome. **Hosted deployment/function behavior remains unverified.**

**Incomplete:** NHC coverage is limited to supported Atlantic/Eastern/Central Pacific summary items. The app does not ingest forecast point time steps, wind/rain/surge extents, operational closures, international cyclones, or closure probabilities; the 3D globe does not render cone geometry. Source rights for commercial redistribution, retention and model training need separate review. Static hosting without the same-origin endpoint reports unavailable.

**Next:** P3 PortWatch rights and field review, then only permissioned historical ingestion/backtesting. If permission is unavailable, implement a typed research boundary and honest unavailable evidence panel with no claimed model metrics.

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
