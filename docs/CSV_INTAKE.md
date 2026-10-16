# Shipment CSV intake and cost evidence

Implemented as the first engineering milestone after the mentor prototype. Start in **Overview → Import CSV**, then download the sample or choose **Use fictional sample**. The sample has no verified prices, duty rates or probabilities.

## File rules

- UTF-8 CSV, optional BOM, comma delimiter, header row, up to 1 MB. Quoted commas, doubled quotation marks, quoted newlines and CRLF are supported.
- Maximum 25 shipments in this local workspace, including the three original examples. Existing IDs cannot be overwritten. Every row must pass before any row is imported; duplicate IDs and capacity are checked again at commit.
- Use plain nonnegative numbers, at most two decimal places. No dollar signs, thousands separators, exponential notation, percentage signs, or silent numeric coercion. Enter required zeroes explicitly.
- USD only. Other currencies and unconfigured lanes fail validation.
- Required column names are case-insensitive; spaces normalize to underscores. Supported aliases: `name` → `shipment_name`, `origin_country` → `country_of_origin`, `customs_value` → `customs_value_usd`, `freight_cost_usd` → `freight_usd`. Unknown or duplicate normalized headers fail.
- Source dates, decision dates and shipment dates use `YYYY-MM-DD`. Source as-of date cannot follow the scenario decision date. Arrival/event dates must be on or after that decision date.
- Imports do not upload the file to a server. Valid shipments persist in browser localStorage on this origin. This is not a production secure team workspace.

## Columns

| Columns                                                      | Meaning / limits                                                                                            |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| `shipment_id`                                                | Required; unique 1–80 letters/digits/hyphens/underscores, starting with a letter or digit                   |
| `shipment_name`                                              | Required; up to 200 characters                                                                              |
| `product`, `supplier`                                        | Optional text; up to 200 characters each                                                                    |
| `country_of_origin`                                          | Required country text; actual goods origin is separate from the chosen route                                |
| `hts_code`                                                   | Optional 8 or 10 digits; dots are removed. Syntactic validation is not classification or duty verification  |
| `route_id`                                                   | `sha-lax`, `hph-sav`, `ham-ewr`, or `sha-rtm`; these are the four configured schematic lanes                |
| `currency`                                                   | Required literal `USD`                                                                                      |
| `incoterm`                                                   | EXW, FCA, FOB, CFR, CIF, DAP, DDP, or `Other / unknown`. This does not automatically determine inclusions   |
| `decision_date`                                              | Explicit scenario as-of date; lead-time feasibility uses it                                                 |
| `arrival_date`, `early_arrival_date`, `tariff_event_date`    | Required scenario dates                                                                                     |
| `lead_days`                                                  | Whole days, 0–3650                                                                                          |
| `goods_usd`, `customs_value_usd`, `freight_usd`, `other_usd` | Required plain USD numbers; zero must be entered explicitly where appropriate                               |
| `insurance_usd`, `brokerage_usd`, `port_usd`, `inland_usd`   | Optional **additional** charges. Blank/omitted means outside this cost scope, not a measured zero           |
| `units`                                                      | Required positive whole number, at most one billion                                                         |
| `duty_rate_pct`, `tariff_increase_pp`                        | Percentage / additional percentage points; supported illustrative range 0–1000                              |
| `tariff_probability_pct`, `freight_probability_pct`          | Scenario probabilities 0–100; `40` means 40%                                                                |
| `freight_surcharge_usd`, `early_cost_usd`                    | Required hypothetical surcharge and total incremental early action cost                                     |
| `tariff_avoidance`                                           | `assumed`, `unknown`, or `not-avoided`; purchase date alone does not establish legal avoidance              |
| `early_feasible`                                             | Literal `true` or `false`                                                                                   |
| `source_type`                                                | `scenario_assumption` or `customer_supplied`; official/licensed/model verification cannot be claimed by CSV |
| `source_reference`                                           | Required 1–500 character quote/invoice/assumption reference                                                 |
| `source_as_of`                                               | Date supplied by the user for that source or assumption; must not follow the decision date                  |

Per monetary input, the supported cap is $10 billion. This is a validation bound, not a meaningful shipment-size recommendation.

## Avoiding double counting

The total includes goods acquisition once, calculated assumed duty on customs value, separately entered freight, other itemized costs, and only additional category lines. Customs value is a calculation basis and contributes zero as a separate purchase line.

In CSV, the optional charge columns are additional by contract. The preview requires an explicit itemization acknowledgement before import. For a charge already included elsewhere, omit its column and use **Shipment & assumptions → What else is in the cost?** to enter its amount and choose **Already in goods**, **Already in freight**, or **Outside this cost scope**. Such a line adds zero to the base.

The ledger shows entered amount and added amount separately. Current duty and tariff-event amounts are rounded to the nearest USD cent by the scenario calculator; expected values can contain fractional cents until display. This is an accounting convention for the calculator, not a legal duty rounding or applicability engine.

## Evidence and edits

Customer-supplied records store the reference, claimed source date, actual capture timestamp and quote context (configured route, country of origin, quantity and USD). These fields are claims supplied by the user, not confirmation from a vendor, broker or government.

The CSV source attaches to goods/customs/freight/other costs, the entered duty rate and additional category costs. Event probabilities, future cost shocks and action feasibility remain scenario assumptions. Fictional template imports retain their assumption label and source-as-of date.

Changing a sourced amount invalidates that field's evidence. Changing route, origin, quantity, trade term or quote cost basis invalidates associated cost evidence. Prior references remain identified as previous sources in the explanation. Changing the route never changes country of origin automatically.

Attach updated evidence in the cost editor only when the current values and quote context are supported. Active customer evidence dated after an edited decision date blocks analysis until corrected. The memo freezes the current inputs, cost scope, results, references and calculator version; full metadata accompanies its JSON download.

**Reset demo data** restores the original three examples while preserving imported and manually added shipments. Local storage has no cross-device synchronization. A draft with incomplete required costs is not saved as a zero-cost shipment.

## Next production requirements

A durable decision journal, historical revisions/outcomes, secure tenant storage, granular source documents and permissions, real quote validation, limited reviewed duty rules, and licensed historical/model inputs remain later milestones. This intake does not establish paid-pilot readiness or a trained forecasting service.
