# Master plan execution: prototype audit → first product milestone

Prepared October 15, 2026 against master plan v1.0; updated alongside [v1.1](../COST_CURRENT_MASTER_BUILD_PLAN.md). The initial plan was written before Part II product changes. The user authorized the staged master plan; preserve the free local demo.

**Current state:** prototype audit closed and the first intake/ledger engineering milestone delivered. **Next engineering milestone:** a prospective decision journal. Interviews, data rights, expert review and commercial validation remain open; see [Progress](PROGRESS.md) for actual verification.

## Product to build toward

The first commercial product should be a **quote-backed shipment decision memo for one repeat importing lane**, with a repeatable workspace around it. The initial research wedge is home/consumer goods moving China → Los Angeles; that is a candidate to test with interviews, not a validated segment. The buyer supplies invoice/customs-value inputs, dated freight quotes, duty assumptions/review, and the actions they can actually take. The product reconciles the cost scope, compares feasible actions, exposes sensitivities, and preserves the evidence and decision as known at that time.

The eventual platform adds reviewed, limited tariff coverage; licensed lane observations; calibrated model outputs; saved decisions and observed outcomes; relevant alerts; secure team workspaces; and integrations. Its value is a defensible purchasing decision with an audit trail, rather than a global threat score. Do not describe the full commercial product as finished when only an engineering milestone is complete.

## Prototype audit against Part I

| Requirement                                                  | Evidence / current finding                                                                                                      |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| Local, credential-free setup and visible illustrative labels | Implemented; Vite app, local geography/system fonts, no API required                                                            |
| Connected 3D globe, route selection and fallback             | Implemented; previous connected-browser rotation check and automated route/2D tests                                             |
| Canonical cost example and 40% → 10% flip                    | Canonical regression checks retained in the expanded 50-test unit suite; demo flows included in 16 desktop/narrow browser cases |
| Scenario distribution and threshold                          | Exact four states; independent-event assumption visible; 23.33% threshold                                                       |
| Memo matches current inputs                                  | Frozen snapshot, JSON download and browser print; one-page PDF previously rendered and reviewed                                 |
| Honest methods and source boundaries                         | Implemented; no active trained model, live feed or legal classification claim                                                   |
| README, limitations and handoff                              | Implemented and maintained                                                                                                      |
| Explicit zero-impact/zero-cost/invalid-input edge checks     | Explicit zero-impact, zero-cost, invalid-value and timing cases added and passing                                               |
| Lint command                                                 | Real ESLint configuration and passing lint command added                                                                        |
| CSV intake                                                   | Delivered as the first post-demo engineering capability; strict local preview and atomic commit                                 |

**Conclusion:** the mentor prototype and audit are complete. The Stage 1 intake foundation is delivered; Stage 1 business/research gates remain open.

## Delivered — quote-backed intake and cost scope

Deliver one complete path: **download template → select/paste CSV → preview and repair errors → commit valid shipments → inspect source-backed cost ledger → compare actions → print the same values**.

- Strict, bounded USD CSV template; exact numeric/date parsing; documented supported lanes; optional syntactically checked HTS reference; no inferred classification or automatic rates.
- Preview all rows and errors; reject duplicate IDs, invalid dates/rates/amounts, unknown headers/lanes/currencies, malformed quoting, and capacity overflow. Commit all rows or none; revalidate duplicates at commit. Keep file processing local.
- Distinguish fictional sample assumptions from customer-supplied cost evidence. A quoted number is a customer claim with a reference/as-of date, not an independently verified vendor quote or official duty rate. Imported scenario probabilities remain scenario assumptions.
- Typed evidence contracts cover the master plan's six data states; this milestone creates only assumptions/customer-supplied/unknown records. Verified official/licensed/model states require their own evidence before future use.
- An itemized ledger adds insurance, brokerage, port and inland costs only when separately incurred. Explicit inclusion in goods/freight prevents double counting. Preserve legacy `otherCents` and all canonical sample totals.
- Show source reference/date and inclusion scope beside costs and in the memo. An edit invalidates attached source evidence for the changed value until a user attaches updated evidence.
- Support an explicit scenario decision date rather than silently treating every imported shipment as the fixed demo date.
- Preserve existing local data through additive schema handling. Keep the default demo badge and no-network setup. Bound additions/imports consistently with storage capacity.
- Verify pure intake/ledger logic, storage compatibility, existing demo regressions, browser import/error/duplicate flows, source edits, memo consistency, narrow viewport, lint, typecheck and build.

**Done gate met locally:** a fictional CSV fixture exercises the entire path with reproducible totals, no partial imports or false provenance. The aggregate `npm run check` (formatting, doc links, lint, types, 50 unit tests and build) and all 16 browser cases pass. The quote-backed memo was exported and visually reviewed as one page. This gate does not establish customer willingness to pay, legally correct duties, licensed data rights, or trained forecasts.

## Next — prospective decisions and customer validation

1. Founder conducts 5–10 importer/broker interviews using one actual upcoming decision per participant; record authority to act, available data, money at stake, current workflow and a defined pilot/payment response. No outreach is sent by this implementation task.
2. Add a prospective decision journal: immutable input/evidence/calculator-version snapshots, as-of date and horizon, selected action and user override, then separately timestamp actual invoices/outcomes. Never overwrite a past forecast after learning the result.
3. Choose one lane/target with demonstrable lawful data availability. Create a data-rights register with vendor permission, allowed training/display/redistribution, retention, observation/retrieval/revision timestamps and quote basis.
4. Build one historical case study only after those gates. Proposed first target: weekly ocean freight cost on one documented Asia–US lane around a dated disruption, if suitable data exist. Freeze a decision-time cutoff, compare last observation/seasonal naive to SARIMAX, use time-ordered holdouts, disclose missingness and index-vs-invoice differences. A Red Sea episode can be a separate control-sensitive study if compatible data are obtainable. If rights/history are unavailable, publish the method and a prospective record, not invented backtest results.
5. Reconcile one narrowly scoped historical tariff example using applicable official revisions and broker review; keep legal duty arithmetic separate from economic pass-through estimates.

**Milestones:** interview records from five relevant decision owners; documented evidence of feasible alternatives; an actual pilot/payment test; one rights-reviewed lane dataset or a recorded negative feasibility finding; a reproducible case-study report with baselines and failures; dated prospective snapshots. These require real evidence and are not automatically checked off by building UI.

## Later — credible MVP and platform

| Stage                 | What ships                                                                                                                  | Gate                                                                                                                            |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Limited MVP           | Private customer workspace, typed cost/evidence ledger, reviewed duty scope, real quote scenarios, versioned memos/outcomes | Customer decision value; retention/access/export/deletion requirements established                                              |
| Quantitative research | Model A shock impact, Model B freight/transit targets, Model C event likelihood plus explicit decision costs                | Dataset rights, target/horizon definitions, time-ordered baseline evaluations and coverage limits                               |
| Market context        | Read-only curated Kalshi/Polymarket browser and event-to-exposure mappings                                                  | Exact YES/outcome IDs, resolution criteria, bid/ask/depth/freshness, timing and usage rights; unmatched/stale means unavailable |
| Portfolio and alerts  | Correlated scenarios, meaningful monitored thresholds and feasible constrained actions                                      | Valid dependence assumptions and observed user utility; no duplicated shock channels                                            |
| Commercial SaaS       | Tenant isolation, teams, permissions, billing, integrations, backups and operations                                         | Repeated paid use, data/security/legal review and operational economics                                                         |

## Quantitative contracts and evaluation

- **Model A:** conditional lane cost/delay effect and persistence, units, study window, controls, uncertainty and sample. Compare no-shock/seasonal/last-observation baselines; report sensitivity and avoid unsupported causality.
- **Model B:** separate freight-price and transit-time targets; exact lane/quote basis, horizon/as-of time, quantiles, model/data versions. Walk-forward MAE/WAPE, pinball loss, interval coverage/width and shock-period errors. Retain simple baselines when data are weak.
- **Model C:** precisely resolved event likelihood, horizon and mapping confidence; evaluate base rates, Brier/log score and calibration only with adequate independent events. Enumerate small joint scenarios; simulate richer correlated distributions only when justified. Evaluate decision costs/regret against feasible contemporaneous baselines, not an omniscient hindsight action.
- **Shared rule:** deterministic accounting and action constraints remain usable when every forecast/market provider is unavailable. No LLM computes authoritative money or duty treatment.

## Vigil inspection and reuse decision

Read-only review of the current default `main` branch through the GitHub connector on October 15, 2026. No Vigil files were edited or copied into Cost Current. Repository metadata returned no declared license; check ownership/dependency rights before copying implementation code.

| Inspected file                                                                                         | Finding and reuse decision                                                                                                                                                                                                                                                                                            |
| ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [kalshi.ts](https://github.com/Sambhav255/Vigil/blob/main/vigil-app/lib/data/kalshi.ts)                | AbortController timeout and timer cleanup are useful patterns. Macro title/Jaccard matching, last-price probability, and mixed volume/liquidity fallbacks are insufficient for shipment exposure. Require explicit contract/outcome IDs and qualified event mapping. Blob `dc6c01b74660a7d0ef3949ac2d94b4f8ed7e3931`. |
| [polymarket.ts](https://github.com/Sambhav255/Vigil/blob/main/vigil-app/lib/data/polymarket.ts)        | Requests five events and may choose the maximum outcome price. Reuse only fetch/error-handling ideas; replace discovery and parsing with verified YES-token mapping and settlement metadata. Blob `349528775c756958103c6c28a190b5a4868e8474`.                                                                         |
| [gpr.ts](https://github.com/Sambhav255/Vigil/blob/main/vigil-app/lib/data/gpr.ts)                      | `.xls` response is treated as text and failure returns 120. Validate actual source format independently; never carry that fallback into a measured/live field. Blob `6eacd5524169ea3fdcc0dda7aac7e3bbff29fbb4`.                                                                                                       |
| [sources.ts](https://github.com/Sambhav255/Vigil/blob/main/vigil-app/lib/data/sources.ts)              | Parallel source collection is useful. Seed merging and unconditional healthy/fresh statuses must be redesigned with per-field evidence and unavailable states. Blob `c7eea11528c4e572dfec5d1b2f05537f23f71282`.                                                                                                       |
| [dashboard route](https://github.com/Sambhav255/Vigil/blob/main/vigil-app/app/api/dashboard/route.ts)  | Single-flight refresh, cache age and ETag patterns are candidates for a future server. The seeded initial cache must never masquerade as external observations. Blob `deafe72533afae66418c45cda3362f16ec49e9fe`.                                                                                                      |
| [backtest harness](https://github.com/Sambhav255/Vigil/blob/main/vigil-app/lib/backtesting/harness.ts) | Neutral records count as directional hits. Replace with importer-specific cost/calibration/regret evaluation; do not inherit an accuracy claim. Blob `ff38d4e1d1f34fcfaf6f38c3f5b6c4decf17c059`.                                                                                                                      |

A current read-only source inspection is not an API schema or licensing verification. Future adapters must be checked against official provider documentation when implemented. Do not merge codebases, start exchange integrations, add paid services, or publish customer data as a shortcut to this milestone.

## Commercial evidence still missing

No interviews, paying customers, validated prices, licensed lane dataset, reviewed duty engine, forecast backtest, production tenant security or measured decision savings have been established by this work. The first product is specified; its viability remains an experiment. Record negative findings and decisions to narrow or stop as carefully as positive outcomes.
