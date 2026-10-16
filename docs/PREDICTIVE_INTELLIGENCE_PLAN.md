# Predictive intelligence plan

**Status:** active product direction as of October 16, 2026  
**Primary brief:** [COST_CURRENT_PREDICTIVE_INTELLIGENCE_REALIGNMENT_CODEX.md](../COST_CURRENT_PREDICTIVE_INTELLIGENCE_REALIGNMENT_CODEX.md)  
**Live verification:** [PROGRESS.md](PROGRESS.md)  
**External-intelligence execution order:** [unified integration plan](../COST_CURRENT_UNIFIED_INTELLIGENCE_INTEGRATION_CODEX.md). Its P0 → P0.5 → P1 → P2 → P3 gates supersede the older stage labels below.  
**Older plans** ([master build](../COST_CURRENT_MASTER_BUILD_PLAN.md), [master execution](MASTER_EXECUTION_PLAN.md), [forecasts](FORECASTS.md)) remain references for preserved engines, intake, and calculation invariants — not higher-priority product instructions.

## Positioning

Cost Current is an event-led supply-chain risk intelligence workspace: **see a disruption → know your exposure → choose a response**. The existing landed-cost calculator is the downstream decision engine, not the front door.

## Vertical slice — delivered (illustrative)

Honest curated events → exposure match → conditional dollars via existing engine → feasible actions. No invented live odds or ML accuracy.

| Piece                              | Status                                                               |
| ---------------------------------- | -------------------------------------------------------------------- |
| Event registry (`riskEvents.ts`)   | **Done** — demo tariff + Suez/Red Sea events                         |
| Exposure rules (`riskExposure.ts`) | **Done** — declared corridor; origin/product policy rules            |
| Intelligence UI                    | **Done** — default after welcome; Explore options → What if?         |
| Scenario A (Northstar tariff)      | **Done** — illustrative assumption odds; conditional $15k            |
| Scenario B (`sha-rtm` / Nordic)    | **Done** — Suez does not match SHA→LAX                               |
| 2D event zones                     | **Done** — 3D globe parity still open                                |
| Probability honesty                | **Done** — null stays unavailable; no auto ranking from missing odds |

Preserve: `engine.ts` Northstar arithmetic, CSV intake, ledger/evidence, Forecast/What if? separation, memos, local persistence.

## Current sequence and later stages

The unified plan's P1 USGS observed-event and P2 NHC forecast-cone slices are implemented; see [Progress](PROGRESS.md) for exact verification. P3 has a typed PortWatch research boundary, but actual history, anomalies and backtest scores are blocked by unresolved data rights and unavailable release vintages. The [research note](PORTWATCH_RESEARCH.md) defines the vessel-count target and reproducible fixture script. This target remains separate from the USD/FEU freight baseline.

1. **P3 external gate** — Permissioned daily Suez vintages, then genuine chronological baseline evaluation and only supported descriptive signals.
2. **P4** — Selective additions when source rights and customer need justify them; decision journal and customer interviews.
3. **P5** — Calibrated models and commercial platform after data, validation and governance gates.

**Out of current scope:** Python ML training on fictional data, paid feeds without rights, full Vigil scoring shortcuts, UI-only redesign sprints.

## Risks and rules

- Corridor match is rule-based on declared `viaCorridor`, not inferred itineraries.
- Prediction-market connector deferred until a specific contract and lawful access are confirmed.
- LocalStorage demos: `nordic-home` is merged in when missing from older saved workspaces.
