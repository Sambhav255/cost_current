# Cost Current — recovered context

Historical recovery record. Read [README](README.md), [current progress](docs/PROGRESS.md), and [implementation plan](docs/IMPLEMENTATION_PLAN.md) for the maintained project reference.

Recovered October 15, 2026 from the prior task, “Review file and plan execution.”

## Confirmed scope

Build a local browser-only mentor demonstration for October 16. No credentials, paid feeds, login, or deployment are needed. The product and data principles are in `COST_CURRENT_CODEX_BRIEF.md`. React, Vite, TypeScript, react-globe.gl, Vitest, and Playwright are already installed.

## Calculation acceptance targets

For the Northstar sample: customs value $100,000, duty 10%, freight $7,000, additional duty 15 percentage points with 40% assumed probability, freight surcharge $3,000 with 20% assumed probability, and early purchase cost $3,500.

- Base landed cost: $117,000.
- Expected added tariff exposure: $6,000.
- Expected added freight exposure: $600.
- Wait expected total: $123,600.
- Order early expected total: $121,100, only if it avoids the hypothetical additional duty and leaves freight exposure unchanged.
- Expected early advantage versus waiting: $2,500.
- Break-even tariff event probability: 23.3333%.
- At 10% tariff probability, waiting costs $119,100 and is cheaper than early by $2,000.

An earlier purchase date by itself does not establish tariff avoidance. Make the exposure timing assumption editable and visible. Scenario probabilities are illustrative user assumptions, never live or trained forecasts.

## Recovery baseline

The scaffold contains package metadata, TypeScript/Vite configuration, HTML, favicon, and installed dependencies. At recovery, `src/lib`, `src/components`, and `tests` were empty. No build or test had passed yet. The prior task was still marked active; check for concurrent work before overwriting files.

## Remaining delivery

Working overview and selectable interactive globe with a usable 2D fallback; editable shipment and assumptions; reproducible scenario distribution; early/wait and eligible route/supplier comparisons; methods and evidence page; printable decision memo; calculation and browser verification; run instructions and demo script.

## Independent verification during recovery

Added `src/lib/engine.recovery.test.ts`: eight acceptance tests cover the canonical example, the 10% recommendation flip, normalized event probabilities and expectation, unknown tariff eligibility, unchanged origin duties on a route change, supplier comparability, and alternative arrival dates crossing the event date.

Two failing date-boundary cases were corrected in `src/lib/engine.ts`: route tariff exposure now uses the alternative route arrival, and supplier tariff exposure now uses the supplier arrival. The route explanation now states that arrival timing can affect exposure while origin and duty assumptions stay unchanged. `npm run test` passed all eight recovery tests after the fixes.

Further review added a ninth passing case: ordering early must not acquire tariff exposure when the baseline arrival already precedes the hypothetical event. The corresponding engine logic and explanation were corrected. A TypeScript check also found an implicit callback parameter in the globe color accessor; that parameter is now explicitly typed. Full typechecking still awaited the main App module at this point.
