# Engineering guide and future implementation

[Progress](PROGRESS.md) is the source of truth for completed and verified work. The [master build plan](../COST_CURRENT_MASTER_BUILD_PLAN.md) defines the product vision and release stages; the [execution plan](MASTER_EXECUTION_PLAN.md) selects now, next and later. This guide records implementation boundaries rather than a second competing roadmap.

## Current architecture

React 19 + TypeScript + Vite, react-globe.gl/Three.js, local world-atlas geography, Vitest and Playwright. The runtime is browser-only; no network provider or model inference is required.

| Layer                         | Responsibility                                                                                                                         |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `src/lib/types.ts`, `data.ts` | Shared shipment/action/memo contracts; fictional seed data and default demo date                                                       |
| `src/lib/engine.ts`           | Pure validation, deterministic accounting, scenario outcomes and eligible action ranking                                               |
| `src/lib/csv.ts`              | Bounded strict USD intake; preview errors before atomic commit                                                                         |
| `src/lib/evidence.ts`         | Six evidence-state contracts, source dates/scope and invalidation on edits                                                             |
| `src/lib/ledger.ts`           | Itemization and additional-versus-included cost treatment                                                                              |
| `src/lib/storage.ts`          | Versioned localStorage, schema validation, 25-shipment capacity and additive compatibility                                             |
| `src/components/`             | Accessible controls, intake, evidence ledger, comparisons, memo and graphics fallback                                                  |
| `src/App.tsx`                 | Navigation, controlled state, memo snapshots and persistence integration                                                               |
| `src/lib/forecast.ts`         | Separate local registry, strict observation intake, dated last-observation baseline and time-order evaluation; no event-odds inference |

The existing `cost-current-demo-v1` storage key is retained. Evidence, cost lines and decision dates are optional additions so legacy samples remain readable. A memo freezes inputs/results and calculator version; it is not yet a durable journal of decisions and outcomes.

## Calculation rules to preserve

- Money inputs use USD cents; rates/probabilities use basis points. Currency conversion is outside the current scope.
- Base cost = goods acquisition + rounded assumed duty on customs value + separate freight + other costs + separately incurred category lines. Customs value itself contributes zero as a separate purchase line.
- Included-in-goods, included-in-freight and out-of-scope category lines add zero. Preserve their entered values and inclusion labels for auditability.
- Current duty and hypothetical tariff-event charges round to the nearest cent. Probability-weighted expectations may contain fractional cents until display. This is a calculator convention, not a legal customs rounding rule.
- Two independent binary events give four explicit outcomes. Independence and probabilities are assumptions; enumeration is not a trained model.
- Early ordering affects only explicitly avoided exposure and incremental action costs. Unknown avoidance excludes that option. Purchasing earlier alone establishes no legal exemption.
- Use each alternative's own arrival date for exposure. Current ranking restricts route/supplier alternatives to the baseline arrival date to avoid comparing different service levels as equal.
- Rerouting preserves actual country of origin and entered duty assumptions. Route selection must never overwrite goods origin.
- Derived carrying cost = goods cost × annual holding rate × days / 365 + execution cost. Do not also add a fixed carrying-cost input.
- Rank only complete, feasible, comparable actions. Show missing evidence, invalid inputs and ties rather than inventing savings or substituting zero.
- Lead-time feasibility uses the shipment's explicit decision date; legacy samples fall back to October 16, 2026. Active source dates after that decision date block analysis.
- Payment dates, present value, stockouts, revenue losses and unentered fees remain unmodeled. Quantiles describe the entered scenario distribution, not calibrated coverage.

Preserve the canonical Northstar totals and timing regression tests in [Progress](PROGRESS.md).

## Delivered engineering milestones

1. **Mentor prototype:** complete local flow from welcome/globe through editable scenarios, comparisons, methods and printable memo.
2. **Quote-backed intake foundation:** strict CSV contract, all-or-none import, typed evidence, cost inclusion, source invalidation, explicit decision dates and backward-compatible storage. Customer-supplied references are claims; they do not establish independent verification.

The [CSV contract](CSV_INTAKE.md) documents the implemented schema. Do not redesign it casually or silently change its inclusion defaults.

## Current audit milestone: forecast foundation

The [code audit](../COST_CURRENT_CODE_AUDIT_NEXT_STEPS.md) changes the engineering priority to provenance and an automatic evidenced baseline before the journal. The [forecast contract](FORECASTS.md) describes the implemented local registry, conservative unavailable states, manual-mode separation, frozen exports, known-at-time filtering and outstanding real-data gate. Source observation history is separate from shipment form state; scenario override records preserve the original forecast context. Money remains cents and probabilities basis points. No baseline rate is promoted to event odds or automatically ranked action costs.

## Following milestone: prospective decision journal

Write a bounded design before implementation. Define a versioned record containing decision ID, immutable input/evidence snapshot, calculator version, as-of date, horizon, selected action, user override and separately timestamped outcomes. Export and reload must preserve prior versions. Handle absent invoices, unknown outcomes, duplicate records and storage limits explicitly.

Begin locally without adding accounts or paid services. Establish privacy, retention and access requirements before accepting actual sensitive company documents or moving to a shared backend. Do not claim the journal exists until the full save/reload/outcome flow is verified.

## Future data and model boundaries

Every external observation needs provider/source, permitted use, units and quote basis, lane/product scope, observation/retrieval/effective times, revisions and coverage. Official, licensed, customer-supplied, model-estimated, scenario and unknown states must remain distinguishable. Provider failure produces unavailable/stale status with visible scope, rather than silently serving fictional seed data.

The master plan specifies three research systems: **A**, economic shock transmission; **B**, lane freight/transit forecasts; **C**, event likelihood plus decision economics. Their development is gated on lawful data, defined targets/horizons and time-ordered evaluation against simple baselines. Future providers resolve evidence-backed assumptions; the deterministic calculator retains control of accounting. An LLM must not become the source of monetary totals or legal duty treatment.

Market adapters require exact contract/outcome IDs, resolution criteria, event-to-exposure mappings, freshness, bid/ask/depth and usage rights. The [Vigil review](MASTER_EXECUTION_PLAN.md#vigil-inspection-and-reuse-decision) identifies patterns and problems; no code was copied. Check current official provider schemas at implementation time.

A production backend, tenant isolation, reviewed tariff coverage, integrations, alerts and billing depend on documented recurring customer value and operational requirements. They are later work, not prerequisites for the free local demo.

## Verification and handoff

Run `npm run check` for formatting, local documentation links, lint, types, unit tests and build. Run `npm run test:e2e` for changed user flows; desktop and narrow touch projects exercise the demo and intake. Recheck the generated PDF visually after changes to memo layout. Browser viewport tests do not establish physical-device compatibility.

After each meaningful batch, update Progress with changes, commands actually run, failures/limitations and next action. Update README for run-command or readiness changes, and update the execution plan when priorities change. Preserve historical checkpoints. A file or interface alone does not establish an integrated capability.
