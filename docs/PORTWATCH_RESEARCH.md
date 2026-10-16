# PortWatch transit-count research gate

The public ArcGIS layer identifies daily `n_container` counts at Suez (`portid=chokepoint1`), but the project has **not** downloaded a historical series or obtained a definitive PortWatch permission determination. Automated bulk historical retrieval and potential commercial reuse need provider authorization under the [IMF usage terms](https://www.imf.org/en/About/copyright-and-terms.). The layer has no public release/revision timestamp. No current anomaly or real-world forecast accuracy is claimed.

The [source register](DATA_SOURCE_REGISTER.md) records the field and rights review. The implemented parser handles one supplied ArcGIS page at a time and leaves `availableAt` null. It does not perform network requests. For authorized research, capture each permitted page at a dated retrieval time, retain original response metadata, paginate within provider limits, record the first time each value/version was available, and resolve revisions before constructing a series. Never turn an old final-value download into an ex-ante backtest by assigning it an earlier release date.

The reproducible mechanics check is:

```sh
npm run research:portwatch -- --synthetic
```

Its generated counts are **fictional**. To evaluate a permitted local file, pass its JSON path instead. It must contain `provenance: "licensed_snapshot"`, a nonempty `rightsReference`, and observations with `date`, `portId: "chokepoint1"`, `portName`, `metric: "n_container"`, integer `vesselsPerDay`, integer `objectId`, UTC `availableAt`, and UTC `retrievedAt`. Both timestamps are required for predictors to be known at a historical origin. Missing release times suppress the study.

The target is the **next seven calendar days' mean daily container-vessel crossings at Suez**, in vessels/day. Each origin requires 28 consecutive prior days available and retrieved by that origin and seven subsequent observed outcomes. Baselines are last observed daily count, previous-week seasonal mean, and previous-28-day rolling mean. Walk-forward folds begin in the later 40% of unique observation dates; the script reports MAE and signed bias, origin range, fold count and provenance. Fewer than eight eligible origins suppress scores. Daily adjacent folds overlap, so their errors are not independent confidence intervals. A licensed study still needs publication-lag/revision analysis and uncertainty assessment before any product forecast. The anomaly rule compares the latest seven-day mean with the median of four preceding weekly means and requires 35 consecutive known days and a recent last observation; a drop of at least 20% is a descriptive flag, not a closure probability.

The reviewed fictional Nordic route can establish **corridor relevance only**. Aggregate Suez traffic cannot prove a specific customer's vessel, container or delay, and there is no validated mapping from vessel counts to USD.
