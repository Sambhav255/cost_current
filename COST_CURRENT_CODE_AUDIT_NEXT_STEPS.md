# Cost Current: code audit and prediction-first development plan

**Review date:** October 16, 2026  
**Repository:** https://github.com/Sambhav255/cost_current  
**Inspected commit:** `c665839c5dce07e8761dbfb5d803bb42b2f1c6f7` (`main`)  
**Review scope:** Read repository tree, README, delivery/progress documentation, Typescript calculation and UI modules, sample data, tests, package setup and remote GitHub Actions logs. **This was a static repository review.** The reviewer could not download the GitHub repository into a local runtime or independently run the app; statements about completed local test runs come from project documentation. CI failure was independently verified from GitHub Actions logs.

## Executive verdict

**Keep the prototype. Refocus the next sprint.** It is a credible interactive _scenario cost and action comparison_ demo, but it currently contains **no learned forecasts, no live prediction market feed, and no independent automatically calculated event probabilities**. The displayed probabilities are editable user or fictional sample assumptions. The current strongest asset is the deterministic, tested cost and decision calculation layer. It should remain intact while a new, separate forecast and evidence layer is added. Avoid another round of UI polishing until there is at least one reproducible, automatic, time-stamped estimate.

Use this distinction with your mentor:

1. **Built:** Data intake, sample shipment portfolios, landed-cost ledger, manual four-state tariff/freight scenarios, early purchase and same-arrival alternative comparisons, globe, report export, provenance labels.
2. **Partly built:** Input evidence schema and forecast data interfaces exist, but most provider/evaluation states are contracts rather than running integrations.
3. **Not built:** Model training/inference, live trade-policy or freight observations, curated Kalshi/Polymarket contract mapping, real calibration, actual backtests, automatic probability estimation, verified duty stacking, observed decision outcomes, recurring alerts.

The next big milestone is **automatic estimates with correct provenance**, not more sliders, dashboards or generic AI summaries.

## A. Findings directly traceable to the repository

| Component               | Status                                        | Finding and code                                                                                                                                                                                                                                                           |
| ----------------------- | --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Web experience          | Implemented                                   | React + TypeScript + Vite; interactive three-dimensional globe and two-dimensional fallback; `src/components/GlobeView.tsx`, `RouteGlobe.tsx`, `src/App.tsx`. Route arcs are schematic, not live shipping tracks.                                                          |
| Import workflow         | Implemented                                   | Local CSV validation and atomic import, capped workspace; `src/lib/csv.ts`, `src/components/ImportShipments.tsx`.                                                                                                                                                          |
| Landed-cost ledger      | Implemented as entered-input calculator       | Base costs include goods acquisition, assumed duty applied to customs value, freight and nonduplicative costs; `src/lib/engine.ts`, `ledger.ts`. Not a customs classification or tariff validation engine.                                                                 |
| Binary scenario maths   | Implemented                                   | For tariff probability `p`, freight probability `q`, tariff effect `T`, freight surcharge `F`, expected extra cost is `p*T + q*F`, assuming independence. Four scenarios have probabilities `(1-p)(1-q), (1-p)q, p(1-q), pq`; `src/lib/engine.ts` lines 86-98 and 222-251. |
| Action comparison       | Implemented under assumptions                 | Expected costs for wait, order early, alternative route, alternative supplier; explicit eligibility checks. Limited payment timing, stockout, supplier qualification, freight procurement, and cash costs.                                                                 |
| Manual odds             | Implemented; **not a forecast**               | Two editable probability sliders in `src/components/Analysis.tsx` around lines 224-295, plus manual fields in `ShipmentForm.tsx` around lines 304-340.                                                                                                                     |
| Forecast provider       | **Interface only**                            | `ForecastProvider`/`ForecastEvidence` types declared in `src/lib/types.ts`; no trained model or active adapter.                                                                                                                                                            |
| Three proposed models   | **Future concept only**                       | Methods screen discusses econometric event study, gradient-boosted quantile forecast and calibrated probabilities; `src/components/Methods.tsx`.                                                                                                                           |
| Prediction markets      | **Absent from running app**                   | `package.json` and application code have no Kalshi/Polymarket clients. Vigil (`Sambhav255/Vigil`) contains separate prototype collectors, but they have not been integrated here.                                                                                          |
| Evidence and report     | Implemented within scope                      | User supplied vs scenario vs unknown source states, invalidation on edits, printable frozen memo. No independent fact checking of customer entries.                                                                                                                        |
| Unit/browser test suite | **Reported locally**, not independently rerun | `README.md` and `docs/PROGRESS.md` report 50 unit cases and 16 Playwright cases. These test input handling and arithmetic, not model accuracy.                                                                                                                             |
| Continuous integration  | **Failing on GitHub**                         | Most recent GitHub Actions run `38853607438` fails `npm run format:check`: Prettier rejects `.agents/skills/frontend-design/SKILL.md`. Earlier run `38852634904` fails formatting on many files. Later lint/tests/build never executed in those runs.                      |

References:

- https://github.com/Sambhav255/cost_current/blob/main/src/lib/engine.ts
- https://github.com/Sambhav255/cost_current/blob/main/src/components/Analysis.tsx
- https://github.com/Sambhav255/cost_current/blob/main/src/lib/types.ts
- https://github.com/Sambhav255/cost_current/blob/main/docs/PROGRESS.md
- https://github.com/Sambhav255/cost_current/actions/runs/38853607438

### Reproducible demonstration arithmetic

Fictional Northstar has goods acquisition value $100,000, existing assumed duty 10%, freight $7,000, prospective 15 percentage point tariff increase at user-assumed probability 40%, prospective $3,000 freight surcharge at user-assumed probability 20%, early purchase cost $3,500. Thus:

- Base = $100,000 + $10,000 + $7,000 = **$117,000**.
- Expected tariff extra = `0.40 × $15,000` = **$6,000**.
- Expected freight extra = `0.20 × $3,000` = **$600**.
- Expected wait cost = **$123,600**.
- Expected early cost = `$117,000 + $3,500 + $600` = **$121,100**, _only when the scenario assumes earlier entry lawfully avoids the tariff increase while freight exposure remains unchanged_.
- Expected early advantage = **$2,500**. Break-even tariff probability = `$3,500 / $15,000` = **23.33%**.

The arithmetic is coherent _conditional on the assumptions_. The numerical inputs are not evidence that an actual tariff increase has a 40% chance of occurring.

### Important research and model risks

**1. The predicted object is not yet defined.** A prediction-market contract might resolve to “an executive order is signed,” while the importer needs `P(additional applicable duty on this origin/product before customs entry)`. These are not interchangeable. A generic tariff-market YES price must not automatically overwrite a shipment's tariff probability.

**2. The shock size is entered manually.** Even a perfect event probability would not establish the size of the cost impact. A conditional freight surge estimate and verified applicable duty increments must be modeled independently.

**3. Events are assumed independent.** Tariff policy, geopolitical disruptions, congestion, rerouting and freight rates can interact. Keep the current four-state engine as a baseline, not the final joint cost distribution.

**4. Actions are not fully comparable.** The current engine restricts alternate routes and suppliers to the same arrival date, which avoids one comparison error, but leaves out quality, procurement terms, production capacity, stockout loss, forward bookings, payment terms, cash constraints and exchange rates. The supplier alternative reuses the baseline freight-shock exposure; a different sourcing lane may need its own freight model. Preserve “not eligible / unknown” states instead of displaying unjustified savings.

**5. Duty calculations are illustrative.** Typed HTS strings are not classified, official tariff schedules do not automatically cover all Chapter 99 measures, exceptions, AD/CVD, origin rules, bond/fees or legal treatment. Never suggest that the existing rate input is an automatic or legally verified duty estimate.

**6. The globe is an interface for exposure, not a data source.** Static arcs and colors should never imply live vessel trajectories or measured danger. Do not spend the next sprint adding visual polish before model evidence.

**7. The claimed CI quality gate is currently red.** Fix and re-run remote CI before adding a backend.

## B. What the product should do instead

A procurement lead should be able to upload a shipment and receive, without touching an odds slider:

1. **Current cost basis:** Entered/verified goods value, customs value, freight quote and relevant extra charges.
2. **Automatic forecast, where possible:** A specifically defined forecast target, horizon, numerical estimate, source, snapshot time and model/baseline identification.
3. **Probability and impact separately:** Probability that an applicable event occurs within a defined interval; distribution of financial consequences _conditional on occurrence_; data quality and uncertainty.
4. **Decision comparison:** Same shipment, baseline wait versus feasible earlier booking, alternative routing or supplier, with expected savings and conservative downside.
5. **Evidence and auditability:** What is observed, inferred, customer supplied, modeled or unknown; whether a current quote or model can actually support the recommendation.
6. **Manual scenario laboratory:** Preserve today’s editable sliders as a separate, explicitly labeled user override and stress test. They should not be the primary default “forecast.”

### Minimum user flow

Choose shipment → select **Forecast** or **What if?** → view sourced baseline and scenario uncertainty → see recommended action and downside → click to inspect why → save decision and print memo.

When the system lacks appropriate data, show **“No defensible automatic estimate available for this lane/event”** and offer a clearly marked manual scenario. It is better than displaying an invented 63% risk score.

## C. Immediate priority: build one defensible automatic estimate

### Step 0: resolve reliability blockers

- Check `.prettierignore` and either exclude `.agents/skills/frontend-design/SKILL.md` from formatting or fix formatting consistently. Do not change third-party skill text unnecessarily.
- Commit the fix and make GitHub Actions `npm run check` green on the pushed commit. Confirm browser tests run instead of being skipped.
- Preserve every existing calculation regression, including canonical Northstar values.
- Record a clean release tag or commit before integrating another repo.

### Step 1: add explicit `Forecast` and `What if?` modes

- **Forecast mode:** probability fields become read-only _outputs_ returned by a typed forecast provider. They show forecast target, horizon, source, observation time, generation time, confidence/uncertainty and status (`live`, `historical_estimate`, `illustrative`, `stale`, `unavailable`). The underlying cost engine takes these values, not sliders.
- **What if? mode:** retains existing sliders. If the user overrides an automated forecast, record both original model estimate and modified assumption; never relabel the override as a model prediction.
- Build one visible action `Refresh signals` that actually refreshes data, reports failures, and does not silently switch to fictional sample probabilities.
- Distinguish sample/preview forecasts from real ones in every summary and exported memo.

### Step 2: implement a tiny observation and forecast registry

Suggested conceptual contracts; Codex can plan the exact types:

```ts
type Observation = {
  id: string;
  source: string;
  observedAt: string;
  retrievedAt: string;
  unit: string;
  value: number;
  scope: { laneId?: string; country?: string; hts?: string };
  citationUrl?: string;
  licenseStatus: 'allowed' | 'unknown' | 'restricted';
  quality: 'usable' | 'stale' | 'missing' | 'ambiguous';
};

type ProbabilityForecast = {
  targetDefinition: string; // E.g. exact policy applicability or rate threshold
  horizonStart: string;
  horizonEnd: string;
  probability: number | null;
  provenance: 'measured_market' | 'statistical_estimate' | 'illustrative' | 'unavailable';
  modelId?: string;
  modelVersion?: string;
  asOf: string;
  featureSourceIds: string[];
  evaluationId?: string;
  uncertaintyNote: string;
};

type CostForecast = {
  target: 'ocean_freight_usd_per_feu' | 'importer_incremental_landed_cost_usd';
  laneId: string;
  horizonDays: number;
  p10?: number;
  p50?: number;
  p90?: number;
  asOf: string;
  modelId: string;
  modelVersion: string;
  trainingCutoff?: string;
  evaluationReference?: string;
  status: 'live' | 'historical_estimate' | 'illustrative' | 'unavailable';
};
```

Store forecast snapshots independently of editable shipment form state. Preserve cost/math types currently in cents and rates in basis points; do not silently mix percent, probability fractions and basis points.

### Step 3: automatic estimate via honestly named baseline, then model

The highest-value initial automatic estimate may be **freight cost over the next 4–8 weeks**, not a major tariff announcement probability. A freight-rate time series has repeated observations; major tariff changes are rare and structurally discontinuous.

- Choose **one specific route, unit and measurement basis**, for example a published China–US West Coast ocean freight rate series in USD per forty-foot-equivalent unit (FEU), if available for lawful reproducible use. Do not treat a spot index as an actual customer quote.
- Locate an authorized historical public/licensed or importer-provided series, with at least a stated minimum observation history and explicit gaps. Record redistribution and display rights.
- Produce an automatic historical-last-observation or seasonal naive estimate as **baseline estimate**, with staleness and a visible source date. This is automated, but not ML.
- Then implement one honest statistical model, e.g. SARIMAX or gradient-boosted regression _only after training data exist_. Compare out-of-sample to naive forecasts. Publish model version and error/coverage metrics.
- Map rate forecast to importer incremental cost using **shipment capacity, container count, booked contract/spot exposure and separately quoted inclusions**. For some customers there is no pass-through because their rate is fixed; show zero direct sensitivity where verified.

A first substantive automatic forecast is more persuasive than three untrained models drawn as decorative cards.

### Step 4: integrate only relevant prediction-market observations

Existing Vigil repo: https://github.com/Sambhav255/Vigil

Read its actual adapters before reuse:

- `vigil-app/lib/data/kalshi.ts` calls a Kalshi public market endpoint, reads last-price-like fields and filters **macro-style** titles; this is not an importer tariff discovery pipeline.
- `vigil-app/lib/data/polymarket.ts` fetches just a small event sample and uses a heuristic selecting the maximum price when outcomes cannot be identified; **never reuse this odds heuristic for shipment decisions**.
- `vigil-app/lib/data/gpr.ts` fetches a geopolitical risk series but contains a hardcoded fallback and assumes a text-like format from an `.xls` URL; do not pass that fallback off as a live measurement.
- Vigil's threat score maps to **financial sectors**, not shipment origin, HTS applicability or shipping lanes.

Reuse only useful transport concepts such as timeouts, source health, caching and typed adapters. Write clean domain-specific contract selection and mapping:

1. Discover exact tariff/port/strait/freight contracts with appropriate market identifiers.
2. Resolve exact YES and NO outcome tokens; check market status and precise settlement question/rules.
3. Fetch bid, ask, last update, volume/open interest/depth where available; quantify spreads and staleness. No arbitrary “volume = confidence” shortcut.
4. Map resolution event to a shipment exposure target: jurisdiction, product code, origin, transport lane, date/horizon, possible carve-outs and actual costs.
5. If mapping cannot be justified, display as **related market context**, not automatically as the importer’s tariff probability.
6. Compare market signal with a baseline, and measure improvement. Exclude market contracts published after the historical decision date in any backtest.
7. Read-only market context first. No automatic hedge execution or claims of regulated advisory status.

Market data can be useful without being eligible to drive an economic decision. Add a card that says “Market relevant? Yes / related only / no / stale” rather than forcing an odds value.

## D. Three research/model systems for the actual product

### Model A: Econometric transmission of freight/policy shocks

**Job:** estimate the conditional magnitude and duration of **cost or delay impacts** after a defined shock, with lane-specific comparisons. Methods: event study, distributed lag regression, ARIMAX/SARIMAX, panel regression or synthetic-control sensitivity analysis. Keep policy/duty rule calculations separate from estimated economic pass-through. Sample effects must not be described as universal causation. Outputs: estimated incremental freight cost per FEU or delay-days, horizon, standard errors / scenario bands, feature assumptions. Baselines: no-change, same-season previous year and route control series. Initial research episode might be the late-2023/2024 Red Sea shocks if accessible history supports a defensible study.

### Model B: Observational forecasting of freight rate and arrival time

**Job:** predict **a measurable repeated outcome**, not an ambiguous “risk index.” Inputs may include lagged lane freight rates, seasonality, vessel capacity, port congestion, bookings, indexed bunker fuel, holiday/calendar effects and macro controls, subject to rights. Baseline seasonal naive. Then SARIMAX vs **LightGBM or CatBoost quantile** models, with temporal splits and no information after prediction as-of time. Separate 30/60/90-day horizons and lane granularity, evaluate MAE, WAPE when appropriate, pinball loss and interval coverage. Do not call static quantile scenarios learned percentiles.

### Model C: Event probabilities and decision economics

**Job:** estimate a clearly defined probability of a route-relevant event (e.g. a rate threshold being crossed within 30 days) and then translate the result into a purchase/shipping decision. Candidate methods: penalized logistic regression and Bayesian priors with calibration (isotonic/Platt when enough data), supplemented by contract-specific prediction-market signals that survive mapping, liquidity and resolution checks. Treat rare tariff events as discrete scenarios if statistical identification is impossible. Use scenario trees or Monte Carlo **only after** distributions and dependencies are sourced; Monte Carlo is not a prediction model itself.

Economic optimization then minimizes expected landed cost or a risk-sensitive objective under realistic constraints: lead times, service levels, minimum order quantities, cash financing, stockout costs, inventory decay, contract freight rates and supplier switching feasibility. Quantify expected value vs doing nothing plus downside/regret; expose model uncertainty separately from user-defined risk tolerance.

**Evaluation rule:** compare three things independently: (1) event calibration/discrimination, (2) rate and cost forecast error, (3) action performance/cost regret. A model predicting odds more accurately does not automatically produce a better procurement decision.

## E. The crucial tomorrow-demo compromise

For the mentor demo, **do not pretend a trained model exists**. If a meaningful live market signal can be retrieved and accurately matched by deadline, show it as an _external market quote with exact terms_ and keep its effect on shipment costs opt-in/conditional. If not, offer a clearly marked “Illustrative automated baseline” that is a coded, reproducible rule based on a dated, disclosed example dataset and says _not trained, not validated_. Place the model pipeline roadmap beside it.

Demo path:

1. Pick Northstar sample, show entered shipping costs.
2. Enter **Forecast** tab. Show which values are automatic, how recent they are, and what cannot be estimated. An unavailable automatic tariff probability must remain unknown rather than secretly falling back to 40%.
3. Switch to **What if?** tab to demonstrate how a hypothetical 40% to 10% tariff probability flip changes the decision. Explicitly call this stress testing, not model prediction.
4. Display ranked actions and the math explaining the break-even threshold.
5. Show saved one-page memo and forecast provenance.
6. Explain 3-model R&D: econometric shock impact, observed freight forecasting and calibrated event probabilities with economic decision optimization.

If time only allows one change: create Forecast/What-if separation and show source provenance, rather than adding a simulated confidence gauge.

## F. Practical implementation order

**P0, immediate (first 1–2 hours):** Fix CI formatting failure, run complete checks, confirm demo is stable, save baseline commit. Do not rush auto models into the existing sliders and break the cost engine.

**P1, next development session:** Design forecast contracts, two-mode interface, immutable forecast snapshot, observed/derived/assumed labels, no-data state, and basic unit tests. Ensure every memo states the forecast origin and as-of date.

**P2, first real data milestone:** Select one lane and secure lawful historical rate data; ingest with unit, quote basis, as-of timestamps, provenance and missingness. Add automatic seasonal-naive freight estimate and one historical time-order evaluation. Do not claim calibrated probabilities without event labels.

**P3, prediction market adapter:** Port/adapt Vigil fetch concepts and implement curated exact-contract matching. Show relevant quotes with bid/ask/settlement description. Keep mapping read-only unless applicability is defensible. Test stale, empty, multi-outcome, zero-liquidity, malformed, unauthenticated/unavailable cases.

**P4, evaluated ML:** Add reproducible Python research workflow for forecasting, trained model artifacts with version and cutoff, backtest vs baseline, prediction intervals, inference endpoint/bridge to React UI. Start with SARIMAX vs LightGBM quantiles; prefer baseline if ML fails to beat it. Later event calibration where samples allow.

**P5, decision journal:** Save forecast snapshots (inputs known at time), recommendation and human override; later append real invoices/events and costs for prospective accuracy and regret analysis. Preserve original observations and revisions. This is already scoped in repository docs and is essential for an honest live track record.

**P6, reviewed importer pilot:** Five to ten decision-owner interviews, one or two real supplier and forwarder quotes, at least one documented actionable decision, date-aware tariff review and willingness-to-pay test. Test whether better forecasts actually change outcomes.

**P7, platform:** Full duty/HTS rule reconciliation, rights-reviewed freight contracts, multi-lane dependencies, security/auth, multi-tenant persistence, alerts, billed accounts, rights and regulatory reviews before hedging referrals. Explicitly reject unsupported features.

## G. Acceptance tests Codex must add

1. With no relevant observations, automatic forecast is `unavailable`, not the sample's 40%/20% values.
2. Real manual odds can be entered **only** in What-if mode; overrides are labeled, saved and reversible.
3. A market labeled “25% chance a tariff order is signed” never becomes 25% duty risk for arbitrary HTS codes.
4. A market with undefined YES outcome, missing settlement rules or stale quote cannot drive a forecast.
5. Data measured or revised after the as-of date cannot enter a historical backtest.
6. Swapping a different supplier or lane invalidates lane-specific forecasts rather than carrying over baseline freight risk.
7. Changing an observed quote or a forecast snapshot invalidates associated cached action explanations as necessary.
8. Forecast units and origins are unambiguous; spot indexes are not presented as booked freight invoices.
9. All canonical Northstar existing math and input validation tests remain passing.
10. Show baseline vs ML errors and interval coverage from **real time-separated held-out observations** before enabling a “trained forecast” claim.
11. GitHub Actions passes formatting, docs checks, lint, types, all tests, build and Playwright E2E on a pushed commit.

## H. Copy/paste instructions for Codex

> Review this audit, `README.md`, `docs/PROGRESS.md`, `docs/MASTER_EXECUTION_PLAN.md`, `src/lib/engine.ts`, `src/lib/types.ts`, `src/components/Analysis.tsx`, and the existing tests. **Do not start by redesigning the interface.** Verify GitHub Actions failure and fix it first. Inspect the actual current source because this audit is pinned to commit `c665839` and files may have changed.
>
> Preserve the deterministic landed-cost calculations and existing samples. Plan and implement a **separate automatic forecast layer** with clear observed/model/assumed/unavailable states, a forecast as-of time, target definition, time horizon, source IDs and model version. Add `Forecast` and `What if?` modes: user probability sliders only belong in What if; forecast odds must be system-produced from attributable data or visibly unavailable. Build tests before integrating data. Keep demo mode fully functional offline.
>
> Then inspect https://github.com/Sambhav255/Vigil and selectively reuse reliable fetching/source-health patterns. Do not copy its Polymarket max-price fallback, broad text similarity as contract identity, unverified GPR fallback or sector threat scores into importer odds. Produce an integration assessment first. Allow only exact, dated contract mappings with settlement and liquidity checks. Do not invent a Kalshi/Polymarket tariff market or silently imply that trade-related contracts directly apply to a given HTS code.
>
> For the first trained model, prioritize a reproducible **lane-level freight-rate target** with a lawful time series, temporal evaluation and seasonal-naive benchmark. Implement SARIMAX and/or LightGBM only if appropriate observations exist. If none exist, document the data gap and maintain an honest baseline/unavailable state. Separate event-probability modeling, shock-cost econometrics and decision optimization. Version artifacts, record training cutoff and publish comparison metrics, not fabricated performance.
>
> Provide a short written plan before editing and work in ordered commits: (1) CI reliability, (2) provenance and forecast UI contract, (3) one automatic evidenced signal, (4) rigorous tests, (5) research-model evaluation. Run `npm run check` and `npm run test:e2e`, inspect browser usability, and report what is observed/live, modeled, merely illustrative or not implemented. Never call a mathematical scenario calculator an ML prediction engine.

## I. Business judgment

- **Good mentor demo?** Yes, provided it is presented as an interactive proof of the decision problem, not a completed intelligent forecast.
- **Good technical product yet?** No. A defensible data source, operationally applicable event mapping, time-order baseline forecast and measured action value are still missing.
- **Worth rebuilding from scratch?** No. The cost engine, CSV and source/evidence scaffolding are reusable. The prediction layer is the missing differentiator.
- **Biggest unresolved buyer hypothesis:** will a real importer actually change inventory or routing based on a probabilistic dollar estimate, given contractual control, timing, trust and access to a broker? Test this with customers while technical research proceeds.
