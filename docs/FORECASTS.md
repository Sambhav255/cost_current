# Forecast foundation and data gate

Implemented October 16, 2026 in response to the [code audit](../COST_CURRENT_CODE_AUDIT_NEXT_STEPS.md). This milestone implements P0/P1 and a local baseline path toward P2. It does not establish a live provider, licensed market dataset, trained model or complete prediction product.

## Product flow

Shipment analysis opens in **Forecast** mode. Tariff and freight-event probabilities are read-only unavailable outputs. No manual odds enter an automatic recommendation. Switch to **What if?** to use the existing independent-event calculator. Probability edits save the original scenario odds and original forecast context; **Restore original scenario odds** reverses those edits. Both the scenario and override persist with the shipment. Forecast mode is the default again after reload.

**Refresh signals** re-reads the separately saved local observation registry and recomputes cutoff/freshness checks. This is a local refresh, not an exchange or freight API request. Empty, corrupt or inaccessible storage gives an explicit unavailable/error result and never a fictional fallback. An invalid import keeps the previously accepted registry. Storage write failures are visibly session-only. One series is held at a time; a new valid import replaces it. Clear observations removes only that registry.

A fictional dataset can be explicitly loaded or downloaded as a JSON template. It produces an **illustrative automated baseline**, never a live or trained forecast. Every numeric forecast screen and forecast memo labels this provenance. The overview remains an explicitly labeled manual scenario summary.

## Local observation contract

Download the JSON template under **Import observations or preview a fictional baseline**. Replace the fictional content with a series you have permission to display, and set `provenance` to `importer_supplied`. No source permissions are independently verified by this app.

- `version`: `1`; `laneId`: `sha-lax`, `hph-sav` or `ham-ewr`.
- `source`, `quoteBasis`, `rightsReference`: nonempty text, at most 500 characters each. State the vendor/customer reference, inclusions/exclusions, index versus quote basis and display permission. Keep measurement basis consistent across rows.
- `unit`: exactly `USD_cents_per_FEU`. Values represent ocean freight per forty-foot-equivalent unit, not shipment totals, TEU prices, booked invoices or duty-inclusive landed costs.
- `displayRights`: exactly `allowed`, based on the importer's declaration. Unknown/restricted rights block import. This field does not grant training or redistribution rights.
- `provenance`: `importer_supplied` or `illustrative`. Neither is independently verified live data.
- `observations`: 1–520 rows, entire JSON at most 500 KB. Each row needs a unique `id`, increasing UTC `observedAt`, UTC `retrievedAt`, optional UTC `revisedAt`, integer nonnegative `valueCents` up to 1 trillion, and `quality` (`usable`, `stale`, `missing`, `ambiguous`). Unknown values can be marked missing with a numeric placeholder; excluded qualities never enter a baseline.
- Timestamps use ISO UTC seconds, optionally milliseconds. Retrieval/revision cannot precede observation. A revised value is usable only after its revision timestamp; earlier versions are not reconstructed.

Store revisions as distinct source snapshots outside the app when evaluating real data. A series imported today with today's retrieval times cannot substantiate historical availability merely by backdating observation dates.

## Method and boundaries

`last-observation` version `1.0.0` carries the latest eligible value forward for **28 or 56 days**. At least eight usable observations spanning 42 days are required. A gap over ten days among these eight blocks output; a latest value older than fourteen days as of the decision cutoff is **stale**, with its numeric output withheld. Every observation, retrieval and revision time must be no later than the end of the shipment's explicit decision date (UTC). The snapshot records source IDs, the eligible eight-row history, rights declaration, quote basis, observation/retrieval dates, as-of date and generation time. It is copied into frozen memo exports separately from editable inputs.

Changing lane recomputes scope and makes a mismatched series unavailable. Shipment changes recompute the forecast; no forecast explanation cache exists. A lane index remains context only: it is never inherited as an alternative supplier's event risk. The deterministic engine is unchanged and receives manual event inputs only in What if? mode. A freight-rate estimate cannot supply missing tariff odds, conditional shock magnitude, event correlation or duty applicability, so automatic action ranking remains unavailable.

The optional sensitivity calculation requires a comparable reference rate, forty-foot container count, spot-exposed share and an explicit confirmation of quote inclusions/contract comparability. It computes `(baseline rate − reference rate) × containers × spot share`. A confirmed 0% spot share gives zero direct sensitivity. This remains a user-assumed calculation; it neither changes landed-cost accounting nor ranks actions. Sensitivity inputs are exploratory and intentionally excluded from the forecast memo, which says so.

The lightweight evaluation repeats the baseline at earlier as-of cutoffs for targets exactly 28/56 days later, retaining only observations known by each cutoff and targets known by the report cutoff. It reports eligible target count and MAE per FEU; no intervals, calibration, ML comparison or performance advantage is claimed. The eight-row fictional example has no eligible held-out targets. Synthetic tests verify evaluation mechanics only.

## Evidence still required for research

No rights-reviewed real historical lane series was supplied with the audit or found in this repository. The built-in series is authored fiction. Consequently there is no real-data backtest, seasonal model, SARIMAX/LightGBM training, artifact, inference endpoint, event model or empirical accuracy/coverage claim. Do not enable those claims until lawful data, precise quote basis and a time-ordered baseline comparison exist.

Next: obtain one authorized repeated lane series, document display/training/retention/redistribution rights and known-at-time revisions, run the baseline evaluation, and only then compare seasonal naive and statistical models. Keep adverse results. The prospective decision journal follows this evidence milestone; a frozen downloadable memo is not a durable outcomes journal.

## Vigil integration assessment

Re-read the current public source on October 16, 2026 before deciding against copying an adapter:

- [Kalshi adapter](https://github.com/Sambhav255/Vigil/blob/main/vigil-app/lib/data/kalshi.ts): timeout/cleanup patterns are reasonable transport concepts. Macro title filtering and text similarity are not exact importer contract mapping. Price and volume fields do not establish applicable-duty probabilities or confidence.
- [Polymarket adapter](https://github.com/Sambhav255/Vigil/blob/main/vigil-app/lib/data/polymarket.ts): retrieves a small event sample and can select the maximum outcome price when YES is unresolved. Reject that fallback and title similarity for shipment decisions.
- [GPR adapter](https://github.com/Sambhav255/Vigil/blob/main/vigil-app/lib/data/gpr.ts): text parsing of the spreadsheet URL plus a hardcoded 120 fallback cannot establish a current observed measurement.

No Vigil code, exchange integration or market odds are incorporated. The current import/provider boundary accepts freight-series data only and always leaves event odds null, including market-shaped or extraneous probability fields. Before a future adapter, require exact contract and YES/NO identifiers, settlement rules, bid/ask/depth, freshness, source rights and a dated jurisdiction/origin/product/lane/horizon mapping. Undefined outcomes, missing settlement, stale/empty/malformed data and unjustified applicability must remain related context or unavailable. Official provider schemas must be checked at that future implementation point.
