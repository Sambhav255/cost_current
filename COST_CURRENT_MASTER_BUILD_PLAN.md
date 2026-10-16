# Cost Current — master build plan

Mentor prototype requirements and staged product blueprint.

**Version:** 1.1 | **Prepared / updated:** October 15, 2026

**Immediate deadline:** Mentor demonstration on October 16, 2026

**Next milestone:** Fowler Business Concept Challenge, October 26, 2026

**Product status:** Local mentor prototype complete; first post-demo engineering milestone (CSV intake, cost ledger, source evidence) implemented. Commercial viability, live forecast quality, and willingness to pay remain unvalidated.

**Working positioning:** **Cost Current helps importers understand what trade disruption could cost them and which decisions are worth making.**

**Tagline option:** **Know the cost. See the risk. Make the move.**

## How to use this plan

This is the product requirements and long-term vision document. Read [current progress](docs/PROGRESS.md) for verified implementation status, then [the execution plan](docs/MASTER_EXECUTION_PLAN.md) for the next bounded milestone. [README](README.md) covers setup, commands and the demo script; [the engineering guide](docs/IMPLEMENTATION_PLAN.md) explains architecture and acceptance rules.

**Current position:** Part I is complete. The first engineering slice from Part II is also implemented: local CSV intake, source-aware itemized costs and reproducible memos. Stage 1 remains open because interviews, data rights, a historical case study and broker review have not been completed. The final commercial product is a quote-backed decision workspace for one repeat importing lane, expanded only after evidence of customer value.

Preserve the working, free local demo. Continue Part II in bounded milestones; do not restart the prototype or treat the entire vision as the next release. Competitor, regulatory, historical and product statements in the original blueprint remain research leads unless separately verified. No trained forecasts or live feeds are active.

## Contents

- [Part I — mentor prototype](#part-i-mentor-prototype-by-october-16-2026): sections 1–7 cover the user, visual design, scope, exact calculations, demo script and implementation acceptance.
- [Part II — product blueprint](#part-ii-product-vision-and-long-term-blueprint)
  - [Product vision](#8-one-sentence-product-vision), [business assumptions](#9-fundamental-business-assumptions-to-test), [feature map](#10-complete-product-map-sorted-by-value-and-dependencies).
  - [Data contracts](#11-data-model-and-input-quality-more-important-than-the-algorithm), [sources and rights](#12-data-sources-access-and-licensing-plan), [prediction markets](#13-prediction-markets-useful-feature-not-the-business-model).
  - [Three quantitative systems](#14-the-three-main-quantitative-modeling-systems-and-how-they-connect), [cost economics](#15-exact-economics-to-preserve-in-the-full-version), [evaluation](#16-evaluation-backtesting-and-research-credibility).
  - [Architecture](#17-architecture-and-technology-direction-for-codex-to-refine), [Vigil reuse](#18-how-to-reuse-vigil-based-on-the-github-repository-inspected-on-october-15), [trust and risk](#19-compliance-trust-and-business-risk).
  - [Customer validation](#20-market-validation-and-go-or-no-go-tests), [distribution](#20a-first-customers-market-sizing-and-distribution-plan), [release stages](#21-release-roadmap-and-what-comes-next-after-the-demo).
  - [Priorities](#22-how-to-decide-what-gets-built-first-after-the-demo), [research checklist](#23-research-and-source-credibility-checklist), [agent prompts and completion gates](#24-agent-prompts-and-completion-gates).
- [Appendix A — evidence categories](#appendix-a-facts-observations-proposed-choices-and-open-questions)
- [Appendix B — glossary](#appendix-b-terms-in-plain-english)

## Revision record

| Version | Date             | Change                                                                                                                                                                                                      |
| ------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0     | October 15, 2026 | Original mentor assignment and long-term product blueprint.                                                                                                                                                 |
| 1.1     | October 15, 2026 | Added navigation and current-state guidance; reconciled completion gates with verification; normalized heading structure and dated roadmap labels. Original product scope and future requirements retained. |

---

## Part I. Mentor prototype by October 16, 2026

### 1. Mission and scope

Create a convincing **interactive website** that shows the business concept in under five minutes. It is a **functional prototype**, not a customs compliance engine, a trained machine learning platform, or a ready to launch SaaS company. Its core differentiator in the presentation is that it translates an uncertain trade or shipping event into a **specific dollar exposure and an explainable decision**.

The mentor should see the answer to five questions:

1. **Who has this problem?** Smaller US businesses that import products and cannot afford large enterprise tools or in house trade risk analysts.
2. **What goes wrong?** Unexpected tariff changes, freight price increases, and delays disrupt landed costs and purchase decisions.
3. **What information does Cost Current use?** A shipment description, clear costs, user entered scenarios, and ultimately verified data and prediction market signals.
4. **What comes out?** A breakdown of potential extra costs and a comparison of what happens if the importer acts or waits.
5. **Why might this be a real technical business?** Three complementary econometric, machine learning, and decision modeling systems are planned, with falsifiable backtests and documented model uncertainty.

**Success is one complete and reliable workflow, not maximum feature count.** The next version may contain many of the features competitors already have. Being comprehensive is fine, but there must be a credible reason for someone to choose and pay for this product.

### 2. The exact target user and demo story

**Provisional ideal customer:** An owner, purchasing manager, operations lead, or finance manager at a US importer making repeat overseas purchases, with enough inventory and cash exposure that a few thousand dollars could change a real decision. Initial candidate segments are consumer goods and ecommerce brands, furniture, apparel, and aftermarket components. These are customer hypotheses, not confirmed target markets.

**Demo customer:** _Northstar Home Goods_, an explicitly **fictional** US importer buying goods from a supplier in China and receiving them in Los Angeles.

**Narrative:** The company is planning a $100,000 shipment. Management fears a hypothetical additional 15 percentage point tariff and a possible $3,000 freight surcharge. Should it move its shipment earlier or wait? What is the break even probability? What is the cost of being wrong?

The most important interaction: **change one assumption and visibly flip the recommended decision**.

### 3. What the site should look and feel like

#### Visual identity

Use the brand name **Cost Current**. Aim for the clarity and trust of a serious financial planning tool with the visual excitement of global trade. It should not resemble a cryptocurrency casino, generic AI chat window, or freight company brochure. Restrained dark navy or charcoal, teal or ocean blue for routes, amber for uncertain threats, and accessible neutrals are reasonable directions. Strong typography, legible chart labels, real whitespace, and thoughtful motion are more important than flashy effects.

The app should be **desktop ready for a screen shared demo**, with usable tablet and mobile layouts. Include a visible **Demo Mode: Illustrative assumptions** indicator in every quantitative screen. Dates and units must be unambiguous. Avoid unexplained scores such as 'risk 82/100' unless there is a defined calculation behind them.

#### The interactive globe is a signature element

Show an attractive, responsive **3D globe** with at least three fictional example shipment lanes. Start with an active route from a China origin port to Los Angeles; optional routes can include Southeast Asia to the US West Coast and Europe to the US East Coast. Every arc maps to a shipment or scenario in the app, not a random threat or invented real time route.

The globe must allow a user to rotate, zoom, click a route or endpoint, and open the corresponding scenario. Show origin, destination, product, exposed customs value, and a short risk explanation in a side panel. Keep globe animation gentle. Ensure manual rotation does not fight auto rotation. Include a performance and accessibility fallback, such as a simple 2D map and a route list. Render on the client to avoid server side WebGL problems. A great circle visual is **not** a literal navigable ocean shipping route; label it 'route connection' rather than a precise vessel track. Do not let globe work consume the entire development window.

#### Seven simple views, arranged to reuse the same data

| View               | What a mentor sees                                                         | What actually works tomorrow                                    | What can wait                                          |
| ------------------ | -------------------------------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------ |
| 1. Welcome         | Cost Current promise and 'Try a sample shipment'                           | CTA opens the demo                                              | SEO, CMS, waitlist automation                          |
| 2. Global view     | Interactive globe, selectable lanes, three top exposure cards              | Route click selects the sample shipment and updates its details | Live vessel tracking, real routing optimization        |
| 3. Shipment input  | Editable shipment assumptions in a clean form                              | Values validate and recalculate; a preset restores the example  | Full shipping document parser, enterprise integrations |
| 4. Cost analysis   | Base cost, tariff and freight scenario costs, a compact distribution       | Deterministic arithmetic and a transparent scenario table       | Trained risk distributions, authenticated HTS engine   |
| 5. Decision studio | Wait versus move shipment earlier, expected total cost for each, threshold | Recommendation changes when assumptions change                  | Full portfolio stochastic optimization                 |
| 6. Decision memo   | A printable one page summary                                               | Browser print or PDF, built from current values                 | Automated email, branded enterprise reports            |
| 7. How it works    | Human explanation of planned economics and models                          | Honest methods text and source links                            | Real published model performance before training       |

A separate full dashboard is **not needed**. The global view can serve as the initial dashboard.

### 4. One day priorities and cut line

#### P0: Must be functioning

1. App runs locally with one documented command and **no account or paid API key**.
2. Sample shipment loads with clear example assumptions and a Demo Mode label.
3. Cost engine correctly computes base costs, scenario exposure, expected cost, and decision comparisons.
4. User can change event probabilities and costs; all related numbers and recommendation text update without refresh.
5. Clear business explanation, methods panel, and a printable one page memo.
6. Attractive interface with no broken links or fake buttons.

#### P1: Very desirable

7. Truly interactive globe connected to the sample data, with simple 2D fallback.
8. One or two extra sample lanes and route selection.
9. Basic CSV upload of correctly formatted sample shipment inputs with validation, if time remains.
10. A simple discrete probability distribution visualization with properly labeled assumptions.

#### P2: Only after P0 and P1 are complete

11. Light and dark modes, motion polish, extra map interactions.
12. A read only live prediction market feed in a separate **experimental** panel with source timestamps and no automatic effect on the calculation unless an explicitly supported matching event is configured.
13. Saved session state in the browser, and a downloadable sample CSV.

**Explicitly exclude tomorrow:** Sign in, payments, databases unless already necessary, real tariff legal classification, real freight forecasts, real stochastic training, hedge execution, daily geopolitical predictions, real supplier recommendations, automated quote requests, and claims of validated savings. A modest working globe and mathematically correct decision calculation beat a full application with broken logic.

### 5. Sample data and every calculation the demo must support

#### Sample inputs, all fictional or illustrative

| Field                                    |          Example value | Explanation                                                  |
| ---------------------------------------- | ---------------------: | ------------------------------------------------------------ |
| Importing business                       |   Northstar Home Goods | Fictional company                                            |
| Product                                  |             Home goods | Illustrative                                                 |
| Country of origin                        |                  China | Illustrative; no classification claim                        |
| Destination                              |        Los Angeles, US | Example                                                      |
| Customs value                            |               $100,000 | Assumed value on the affected shipment                       |
| Existing duty rate                       |                    10% | **User assumption, not a legal rate quote**                  |
| Freight baseline                         |                 $7,000 | Assumed amount paid by this importer                         |
| Additional tariff if scenario occurs     |   15 percentage points | Hypothetical policy event                                    |
| Probability of additional tariff         |                    40% | User entered scenario probability, **not** a market forecast |
| Additional freight cost if event occurs  |                 $3,000 | Hypothetical surcharge                                       |
| Probability of freight event             |                    20% | User entered assumption                                      |
| Extra cost to bring the shipment forward |                 $3,500 | All inclusive assumed incremental cost                       |
| Early shipment avoids                    | Additional tariff only | Explicit hypothetical feasibility assumption                 |
| Early shipment does not avoid            |      Freight surcharge | Hold same freight risk for both options                      |

#### Transparent base cost and expected exposure

**Only for this limited example**, assume base landed cost comprises exactly goods + existing duty + freight, and excludes all unspecified costs such as insurance, broker fees, port charges, inland transport, taxes, and financing.

- Existing duty = $100,000 × 10% = **$10,000**.
- **Base modeled cost** = $100,000 + $10,000 + $7,000 = **$117,000**.
- Additional tariff cost if it occurs = $100,000 × 15% = **$15,000**.
- Probability weighted tariff exposure = 40% × $15,000 = **$6,000**.
- Probability weighted freight exposure = 20% × $3,000 = **$600**.
- **Expected incremental exposure from waiting** = **$6,600**.
- **Expected total modeled cost if waiting** = $117,000 + $6,600 = **$123,600**.
- **Expected total modeled cost if brought forward** = $117,000 + $3,500 + $600 = **$121,100**, _only if the early shipment actually clears before the hypothetical duty becomes effective and does not change freight exposure_.
- **Expected advantage of bringing forward** = $123,600 − $121,100 = **$2,500**.
- **Tariff event break even probability** = $3,500 / $15,000 = **23.33%**, under those restrictive assumptions. Below that probability, waiting costs less in expectation; above it, bringing forward does.
- At **10%** tariff probability: waiting = $117,000 + $1,500 + $600 = **$119,100**; bringing forward remains **$121,100**; waiting now saves **$2,000**.

**Important accounting:** The $3,500 is assumed to be _the entire incremental early action expense_, not an added carrying expense on top of a separate holding cost. Do not double count any fee. Also, **ordering earlier does not necessarily reduce duty**; the legally relevant entry and effective dates must be satisfied. Phrase the action as 'move eligible arrival or customs entry earlier' when necessary, and require users to confirm real feasibility.

#### Four exact states, if the two event scenarios are independent

| Scenario      | Probability | Total cost when waiting |
| ------------- | ----------: | ----------------------: |
| Neither event |         48% |                $117,000 |
| Freight only  |         12% |                $120,000 |
| Tariff only   |         32% |                $132,000 |
| Both events   |          8% |                $135,000 |

The probabilities sum to 100% and the expected value equals **$123,600**. Under the simple discrete model, the lower 50th percentile is **$120,000**, the lower 90th percentile is **$132,000**, and the 95th percentile is **$135,000**. These are **illustrative scenario percentiles**, not learned or calibrated forecasts. If displaying P50 or P90, show a small tooltip saying how they were computed. Scenario event **independence is a convenience assumption**, not a realistic universal property; the full product must model dependencies.

#### Controls that change the outputs

- Tariff event probability: 0% to 100%, initial 40%.
- Additional tariff rate: 0 to an explicitly bounded illustrative range, initial 15 percentage points.
- Freight event probability: 0% to 100%, initial 20%.
- Extra freight cost: $0 and above, initial $3,000.
- Early action cost: $0 and above, initial $3,500.
- Customs value and duty rate: editable in the shipment form.
- Reset demo to original inputs.

Clearly reject negative costs, invalid rates, missing required quantities, nonsensical numeric inputs, and overflow. Never silently replace invalid user data with zero.

#### Additional action cards

A **different route** card and a **different supplier** card may appear but must say **'Needs a feasible quote and timing'** unless the user provides enough numeric inputs to compare. A route detour does not change country of origin; a new supplier may change country of origin, product quality, lead time, compliance obligations, and rates. Don't invent alternative quotes or 'savings'.

### 6. Mentor demonstration script, 4 to 5 minutes

1. **20 seconds:** 'Small importers know a tariff or shipping disruption could hurt them, but not necessarily whether changing a purchase today saves money.' Show the welcome screen.
2. **40 seconds:** Rotate the globe and click the example China to Los Angeles route. Explain that routes map to the importer’s real exposures eventually, but the example is fictional.
3. **60 seconds:** Open shipment analysis. Point to **$117,000 base modeled cost** and **$6,600 expected extra exposure** under the stated assumptions. Show what contributes to the number.
4. **75 seconds:** Open decision comparison. Show **$2,500 modeled expected advantage** from earlier customs entry in the specific hypothetical situation; emphasize it does not mean every early order avoids duties.
5. **45 seconds:** Slide the tariff event probability down from 40% to 10%. The result flips from 'consider moving entry earlier' to 'wait', a genuine computed output, not an animation.
6. **30 seconds:** Show the memo export and explain the future three modeling components: policy/shock econometrics, freight ML forecasting, and calibrated event probability combined with business decision simulation.
7. **20 seconds:** Close: 'The next step is using real permitted data, assessing out of sample accuracy, and checking if importers would pay for decisions like this.'

#### Likely questions from the mentor, with responsible answers

**Is this genuinely predictive already?** Not yet. Today's cost calculations are real arithmetic based on hypothetical inputs. The predictive models are a development hypothesis until trained and assessed.

**Is a 40% probability a real Kalshi quote?** No. It is a visibly user entered scenario probability in the demo. Market data will only become a weighted input after contract and event matching, liquidity review, and backtesting.

**What stops a broker from doing the same thing?** Nothing technically prevents it. The business has to prove a useful combined workflow, lower cost, reliable decision quality, and repeat use. A broker is both a competitor and a possible channel partner.

**Why is the globe important?** It makes exposure geographically understandable and engaging, but the business value comes from the cost and action model. The model still works without the globe.

**Is ordering early always best?** No. It depends on total incremental cost, probabilities, stock demand, timing, cash constraints, legal entry dates, and what the action can actually avoid.

**How is this different from freight and tariff calculators?** Those categories overlap substantially. The proposed integration of probability, cost, decision alternatives, uncertainty, and public evaluation is the intended positioning, **not an asserted monopoly or proven novelty**.

### 7. Suggested implementation approach, while leaving architecture decisions to Codex

The fastest route is a compact client driven application with one reliable calculation module. **Next.js, TypeScript, React, basic charting, and a dedicated globe component** are compatible with the founder's existing Vigil skills. Codex can select the most dependable permitted packages and should avoid overengineering.

Conceptual modules:

- `sampleShipments`: documented example input data and optional routes.
- `costEngine`: small pure calculation functions, with unit tests.
- `scenarioEngine`: enumerates the four demonstration states and weighted expected values.
- `decisionEngine`: compares wait and eligible early entry, handles ties and constraints, returns explanation.
- `globeView`: renders routes and emits a selected shipment identifier; no economics buried inside graphics.
- `memoView`: formats the **same current inputs and calculation results** for printing.
- `methodsView`: honest text about what is simulated versus trained versus future research.

Codex should **write a plan before coding**, then complete one P0 feature at a time. A working sample without a live backend is acceptable; fake live results are not.

#### Suggested order if time is limited

| Block | Priority | Goal                                                               |
| ----- | -------- | ------------------------------------------------------------------ |
| 1     | P0       | Project boots; sample data model; pure cost and decision functions |
| 2     | P0       | Editable shipment and clear live recalculation                     |
| 3     | P0       | Decision comparison and scenario chart, with correct labels        |
| 4     | P0       | Memo, methods, README, tests                                       |
| 5     | P1       | Globe connected to route selection; fallback route list            |
| 6     | P1       | Responsive polish, second example, CSV if time                     |
| 7     | P2       | Experimental data preview or optional browser persistence          |

The globe is important to the founder's presentation. If build time permits, prioritize it after the calculation workflow rather than leaving it until the last five minutes.

#### Nonnegotiable acceptance tests

- All provided sample calculations match the numbers above to the cent where appropriate.
- Edit 40% to 10% and the recommendation flips with the $2,000 difference shown correctly.
- Set the tariff probability to zero and expected tariff exposure becomes zero.
- Set the early cost to zero and the threshold is handled without a divide by zero failure.
- Set the possible tariff rate increase to zero and show a clear 'no tariff benefit' state instead of infinite or NaN break even probability.
- Set freight probability to 100% and the scenario table is still valid.
- Negative costs and probabilities above 100% are rejected.
- Probabilities over scenario outcomes total 1, within floating point tolerance.
- Memo values match the active simulation and are labeled illustrative.
- Route click updates shipment selection without changing unrelated assumptions.
- Globe error or WebGL unavailability does not make the tool unusable.
- Page refresh is acceptable to reset user data, but must never break the default example.
- `npm run lint`, tests, and a production build pass, or Codex explicitly documents what failed.

#### What the demo is NOT allowed to claim

No deployed quantitative model, validated backtest, legal tariff determination, inferred HTS code, real customer, trading recommendation, live freight tracking, paid traction, or objective 'risk score' based on sample inputs. No invented wins, model accuracy, dataset sizes, source timestamps, exchange liquidity, or savings.

---

## Part II. Product vision and long-term blueprint

### 8. One sentence product vision

**Cost Current is an importer decision intelligence platform that connects shipment exposure, tariff policy, freight prices, geopolitical event probabilities, and financial constraints to rank feasible import decisions by modeled expected cost and downside risk, with the evidence behind every estimate.**

The future product can contain overlapping features found in incumbent services. Its success would depend on making the combined process accurate, easy to act on, affordable, and worth repeating. Do not optimize for feature count as a substitute for finding an actual paying user.

### 9. Fundamental business assumptions to test

#### Jobs that customers might hire Cost Current to do

- Understand the **all in landed cost** of a real shipment for a known product and date.
- Model the financial effect of a specific tariff change on an HTS classified import and booked or expected inbound inventory.
- See whether disruptions to a route translate into extra freight expense, delay, stockout risk, or additional working capital.
- Decide whether to move customs entry earlier, delay, increase safety stock, book alternate transport, qualify a new supplier, change product mix, or hold steady.
- Receive an understandable decision memo to justify a purchasing decision to management, lender, supplier, or broker.
- Track whether a prior recommendation would actually have saved money, accounting for the information available at the time.

#### Ideal customer characteristics

Prioritize **repeat importers with meaningful discretionary decisions** over a broad 'all SMBs' label. An importer has more value from this tool if it knows its invoice values, controls or negotiates the freight decision, can modify purchase timing, has inventory data, and loses material margin when conditions change. Under some Incoterms the supplier controls freight, even if the importer ultimately bears embedded costs. An importer locked into a retail price and committed PO cannot exploit all recommendations. Validate control, not just exposure.

Potential wedges to test rather than assume: small furniture and home goods importers with repeated containers; consumer product brands with long supplier lead times; aftermarket component distributors; small customs broker or forwarder shops preparing scenarios for multiple clients. An Amazon FBA seller might have the right pain but limited freight lane and margin data; investigate rather than automatically selecting that segment.

**Initial commercial recommendation:** test **shipment tariff and freight decision memos for one repeat lane** before attempting a continuously updating global system. A useful, paid memo is a better validation signal than a praised prototype.

#### Direct and indirect competition

Review current features, pricing, customers, and adoption of **Flexport tariff scenario tools, Interos iTariffs, Resilinc AI tariff offerings, Chainomics, Descartes, CargoWise or WiseTech ecosystem products, freight forwarder portals, customs brokers, compliance software, and internal spreadsheets**. Some tools already simulate tariff costs. Do not claim 'no other product' or a particular startup has no traction based solely on an empty website. Compare products by **customer segment, decision supported, input burden, scenario quality, auditability, integration, pricing, and proven use**.

Competition includes **doing nothing** and asking a customs broker. The unique product hypothesis is an integrated workflow and evidence quality, not sole ownership of a tariff calculator or prediction market feed.

#### Business model hypotheses

- Early **one off memo** or assisted pilot, possibly **$99** as a _test offer_, with tailored shipment assumptions and optional broker review.
- Potential SMB subscription starting near **$99 per month**, requiring validation of recurring usage and value.
- Higher tiers based on supplier count, shipment volume, number of routes, analytics refresh cadence, multiuser access, and audit/reporting needs.
- Later broker or forwarder subscription, reseller, or branded report offering only if distribution economics support it.
- Usage fees for costly quotes or premium data only after measuring vendor cost and license rights.

A customer paying $99 for one urgent memo is **not evidence** they will pay $99 every month. No price point, conversion rate, customer count, or margin is validated at the time of writing.

### 10. Complete product map, sorted by value and dependencies

#### A. Core customer and shipment workspace

**Features:** Workspace and importer profile; company and multiuser settings; permissions and audit history; supplier directory; product and SKU catalog; countries of actual origin; validated 8 or 10 digit HTS codes and classification confidence; purchase orders; invoices; container or shipment list; origin/destination ports; alternative lanes; transport mode; planned shipping and entry dates; lead times; transit variability; Incoterms; customs value; currencies and exchange assumptions; brokers; carrier/forwarder; landed cost allocation by unit and shipment; demand and stock levels; editable carrying costs; optional margins, retail prices, and operating constraints.

**Decision value:** The platform learns _what can be affected_ and _what the importer is actually allowed and able to change_. If confidence in HTS, supplier origin, tariffs, or Incoterms is insufficient, flag it before calculating false precision.

**Release priority:** Early after demo, because every model depends on good inputs.

#### B. Duty and tariff intelligence

**Features:** Search and display current and past official HTS revisions; effective dates; user confirmed classification; country and product specific rate logic; ad valorem, specific and compound duties; Section 301 or 232 measures where applicable; special program treatment; relevant executive measures or other additional duties where in force; exclusions; quotas and tariff rate quotas; anti dumping and countervailing duty case identifiers, scope and cash deposits; material content distinctions where required; effective dates, entries, origin evidence, exclusions and sunset dates; de minimis rules and current eligibility; bond, user fees, and broker charges as separately modeled categories; change alerts and source revision diffs.

**Critical issue:** **Tariff 'stacking' is not always a simple sum of percentages.** Applicability, exceptions, bases, effective dates, product content, headings, classifications, and administrative guidance matter. AD/CVD exposure can depend on a case and producer/exporter, and deposit rates can change. Rates may be assessed on different bases. Calculations must come from a maintainable rules engine plus official, time stamped sources and, where appropriate, licensed broker or counsel review. The model should return **unknown / needs broker review** rather than fabricate a legal duty. A trade route does not by itself alter country of origin or legally eliminate a tariff.

**Practical rollout:** First require an imported, user confirmed duty rate; second provide official HTS lookup and scenario delta calculators; third expand carefully to a limited and reviewed set of tariff programs and HTS categories; only then contemplate broad applicability and automation.

#### C. Freight and logistics intelligence

**Features:** Lane historical cost and forecasts; container type and load; FCL/LCL distinction; index rate versus importer actual quoted rate; fuel, congestion, port handling, drayage, transload, insurance and accessorials; estimated transit time distributions; seasonal route pressure; port disruption; schedule reliability; available alternative routes and carriers; cost of delay; storage/demurrage where data permit; booking window; supplier readiness; lead time constraints and service levels.

**Critical issue:** A market index is not the same as an executable quote or a delivered landed cost. A model that predicts an index reasonably well may be useless for a particular importer whose forwarder invoice is very different. The user should ideally upload their own invoices or a quote with date and route. Keep quote lineage and compare predictions to realized invoice prices.

#### D. Scenario explorer

**Features:** A user selects a change: additional duty, removal of exclusion, freight surge, transit delay, port outage, major weather closure, supplier interruption, FX rate move, demand drop, or a compound event. Enter severity, onset, duration, probability and eligible shipment dates. View baseline, expected cost, downside quantiles, margin impact, inventory effect, and cash flow impact. Expose what is **known, assumed, inferred, or missing**.

**Critical issue:** Events can be correlated. A Red Sea disruption and an oil/fuel surcharge may be linked; separately multiplying and adding risks may overcount one underlying shock. Include a dependency graph or joint scenario structure, not naive independent sampling across all threats.

#### E. Decision studio and optimization

Compare actual feasible actions, not generic tips:

| Action                               | Requires                                                            | Main tradeoffs / gating condition                                                                   |
| ------------------------------------ | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Wait / current plan                  | Current plan                                                        | Baseline and reference for comparisons                                                              |
| Move eligible entry earlier          | Ability to alter schedule, supplier readiness, legal effective date | Financing, storage, cancellation, demand, inventory, whether customs entry actually precedes change |
| Bring forward purchase but not entry | Purchase cash date and shipping timetable                           | May not avoid tariff at all, can increase inventory carrying expense                                |
| Build safety stock                   | Demand distribution, holding and stockout economics                 | Obsolescence and working capital                                                                    |
| Reroute freight                      | Available genuine routing quotes and carrier slots                  | More freight, transshipment, insurance, legal, lead time, no automatic change in origin duty        |
| Change transport mode                | Available capacity and quotes                                       | Air versus ocean cost, carbon effect, time to destination                                           |
| Qualify alternative supplier         | Product equivalence, compliance, qualification time, origin, quote  | Switching costs, quality, credit terms, tooling, origin documentation                               |
| Renegotiate terms / pricing          | Contract flexibility, target margin, supplier constraints           | Who bears tariffs, freight and timing costs                                                         |
| Delay or cancel procurement          | Inventory availability, penalties, demand                           | Stockouts, customer churn, fulfillment                                                              |
| Investigate risk transfer or hedge   | Underlying exposure, legal analysis, suitable contract              | Basis risk, fees, market access, product suitability, CTA/IB concerns                               |

For each option provide **expected incremental cost versus current plan**, expected cash outlay and timing, worst reasonable modeled loss, constraints, reason for recommendation, sensitivity, and 'what information could reverse this answer'. Do not imply an action is executable if inventory, permits, quotes or counterparties are missing.

#### F. Interactive geographic view

The globe grows from visual storytelling to a geographic exposure explorer. Add location, corridor and country filters; route categories; supplier concentration; risk event overlays with confidence and freshness; alternative feasible paths; port access disruptions; weather; exposure by dollar amount; saved views; click to explain model impact. Distinguish actual vessel positions, scheduled route networks, and schematic globe arcs. Performance budgets and accessibility matter. Users who cannot run WebGL should retain a fully functional route table and 2D map.

#### G. Alerts, auditability, and memos

Policy change alerts scoped to watched HTS and origin country; prediction market event changes where truly relevant; freight cost threshold alerts; shipment deadline alerts; watchlists; alert tuning; snooze and mute; triage of false positives; evidence of why a number changed; versions of a decision and user overrides; weekly exposure report; CSV/PDF/Excel exports; broker facing memo with source and assumptions; procurement team task assignments; actual outcome followup.

Avoid spamming users for events that cannot affect their shipments. **Alert quality** should be measured by relevant action, not notification volume.

#### H. Scenario and model track record

A dedicated **Methods and Track Record** section shows current data versions, model versions, forecast horizons, source status, errors and baselines by lane, calibration and coverage when measurable, loss in high risk periods, and decision regret against a realistically available alternative. Display both wins and misses, sample sizes and dates. Never publish a global '80% accurate' claim without defining target, horizon, sampling and evaluation.

#### I. AI assistant, with strict boundaries

An LLM can help explain reports, suggest missing inputs, classify documents for human verification, extract purchase order fields, summarize official announcements with citations, draft broker questions, and let an importer ask 'Why did this change?'. It must **not invent tariff law, costs, or market probabilities** or substitute narrative for the quantitative model. Use retrieval with verified timestamps and always keep final arithmetic in deterministic code.

#### J. Later B2B platform capabilities

API and webhooks for broker and ERP/TMS/WMS integrations; bulk portfolios; automated quote intake from forwarders with permission; role based access, SSO, multiple entities and currencies; fine grained source licenses; audit logs; configurable approval workflows; procurement ERP export; historical data storage, task queue, data health monitoring and regional access controls; customer owned data export; billing, plans, support tools and operational telemetry.

### 11. Data model and input quality: more important than the algorithm

#### Minimum shipment data contract

Every analyzed record should carry at least:

`shipment_id`, `company_id`, `product_name`, `sku`, `supplier_id`, `origin_country`, `country_of_origin_evidence`, `hts_code`, `hts_validation_status`, `origin_port`, `destination_port`, `mode`, `incoterm`, `customs_value_usd`, `freight_cost_usd`, `freight_cost_scope`, `other_costs_usd`, `units`, `booked_departure_date`, `estimated_entry_date`, `lead_time_days`, `user_can_change_booking`, `user_can_change_supplier`, `importer_of_record`, `cost_owner`, `source_timestamp`, `source_type`, and `currency_fx_date` where needed.

Some are optional initially, but a missing field must have a documented consequence. Never interpret annual import spend as the value of a **single affected shipment**. Do not show an imported HTS rate as authoritative merely because a code was supplied.

#### Separate six data states

1. **Verified official source** with URL, effective date and revision.
2. **Verified licensed commercial source** with valid usage rights and vendor timestamp.
3. **Customer supplied** with customer provided date, import scope and edit history.
4. **Model estimated** with model version, horizon, training scope and error metrics.
5. **Scenario assumption / simulated** with originator and input controls.
6. **Unknown / stale / unavailable** with clearly expressed restrictions.

Every number needs provenance. A date stamped **live input** and a model estimated probability are fundamentally different things; they should never share the same badge. Seeded default values must never silently replace unavailable external data in a screen that says 'live'.

#### CSV and document ingestion

Start with a strict template and preview, mapping common user column names, field validation, duplicate detection and error explanation, and sample file download. Progress to Excel and shipping document extraction only when customers prove the pain and data quality is manageable. Do not silently accept negative quantities, ambiguous currencies, invalid ports or malformed HTS codes. For sensitive documents, use secure processing and explicit retention controls.

#### Recommended persistent entities for future planning

`Company`, `User`, `Supplier`, `Product`, `HTSClassification`, `Shipment`, `Route`, `ShipmentCostLine`, `DutyRule`, `PolicyChange`, `RiskEvent`, `EventContract`, `EventToExposureLink`, `FreightObservation`, `Prediction`, `ModelVersion`, `Scenario`, `Action`, `DecisionRun`, `ActualOutcome`, `SourceSnapshot`, `Memo`, `Alert`, `AuditEvent`, and `UserOverride`.

Preserve historical snapshots so that a cost forecast issued on a particular date can be reproduced. Record data as known **at the time**, not only its latest revised state.

### 12. Data sources, access and licensing plan

| Source / category                                   | Potential role                                                         | Practical status and due diligence                                                                                                                       |
| --------------------------------------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| USITC HTS current and archive                       | Official tariff classifications, general and historical schedule rates | Public official documents and machine readable revisions; verify which revision applies; not a complete legal import duty determination                  |
| CBP CSMS and official CBP guidance                  | Operational enforcement guidance and policy implementation             | Watch relevant notices; regulatory applicability requires review                                                                                         |
| Federal Register / official policy                  | Effective tariff changes, announcements, exclusions, program status    | Store original text, publication/effective times, version and legal scope                                                                                |
| Commerce / ITA and USITC trade remedy information   | AD/CVD case and rate context                                           | Case/producer specific, complex and not safely generalized                                                                                               |
| Census import trade statistics                      | Market context and research                                            | Aggregate statistics do not substitute for customer level demand                                                                                         |
| Importer freight invoices and provider quotes       | Actual executable cost and realized outcomes                           | Best target for accuracy; customer permission, cleaning and privacy required                                                                             |
| Freightos FBX, Drewry WCI, Xeneta                   | Benchmarks and historical freight regime data                          | **Check licenses before model training, redistribution, derived indexes or commercial use.** Do not assume public charts confer model development rights |
| FRED                                                | Macro variables such as fuel/credit indicators where appropriate       | Check series publication lag and revisions                                                                                                               |
| Caldara and Iacoviello GPR                          | Broad geopolitical risk context                                        | Context feature, not direct lane closure probability; verify file format and use rights                                                                  |
| GDELT, authoritative news, port authority bulletins | Dated detection and corroboration of disruptions                       | Noise, duplicates, publication timestamps, region entity mapping and relevance filters                                                                   |
| Kalshi public market data                           | Probability signal for a precisely matched event                       | Contract question, outcome, depth, bid/ask, fees, settlement date, market status and permission checks                                                   |
| Polymarket public market data                       | Same, for a matching event                                             | Correct yes token/outcome mapping, depth and jurisdiction; trading access is distinct from read access                                                   |
| Weather and transport authorities                   | Storm / hazard or port disruptions                                     | Weather forecast is not automatically a shipment delay forecast                                                                                          |
| Importer inventory and sales records                | Demand, stockout cost, inventory financing                             | Optional integration later; high privacy sensitivity                                                                                                     |

#### Official and product references worth starting from

- USITC HTS and revisions: https://www.usitc.gov/harmonized_tariff_information
- USITC historical editions: https://www.usitc.gov/harmonized_tariff_information/hts/archive/list
- CBP trade guidance and messaging: https://www.cbp.gov/trade
- Federal Register: https://www.federalregister.gov/
- Freightos developer portal: https://developers.freightos.com/get-started
- Freightos data terms (updated May 19, 2026): https://www.freightos.com/freightos-data-terms-conditions/
- Kalshi API developer information: https://help.kalshi.com/en/articles/13823854-kalshi-api
- Polymarket API reference: https://gamma-api.polymarket.com/docs
- CFTC intermediaries definitions and regulatory context: https://www.cftc.gov/IndustryOversight/Intermediaries/index.htm
- Statsmodels SARIMAX API: https://www.statsmodels.org/stable/generated/statsmodels.tsa.statespace.sarimax.SARIMAX.html
- Scikit learn gradient boosting and quantile loss: https://scikit-learn.org/stable/modules/ensemble.html

These are sources and implementation leads. They do not imply a legal conclusion, available free commercial data, or a completed integration.

### 13. Prediction markets: useful feature, not the business model

#### Intended customer value

For a **specific event that could influence the importer’s cost**, a prediction market can contribute a quickly updating external signal. Cost Current could show 'Market indicates an implied probability for event X', combine it with a verified impact map, and explain why it does or does not affect a planned entry or route.

#### Mandatory event mapping

An event contract must map to a semantic record with:

- Provider, contract ticker or slug, contract URL, market ID, token/outcome ID.
- Exact question, resolution source, resolution criteria, close and settlement dates, any ambiguity.
- Contract outcome side (the exact **YES** or relevant outcome, not arbitrary largest token price).
- Current best bid and ask and depth or liquidity, last trade timestamp and price, open interest or volume where provided, fees and reliability of data.
- Exact business event mapped: e.g., tariff legislation/presidential action taking effect for a named origin and eligible HTS group before a relevant entry date, versus announcement alone.
- Valid mapping to affected shipment(s), direction of effect, event timing, conditional cost amount, and mapping confidence.
- Market and API availability, permitted commercial use and applicable jurisdiction restrictions.

**An announcement market is not necessarily a payable duty market.** A maritime closure is not identical to a freight surcharge. The model must map the _resolution event_ to an intermediate operational and economic channel before affecting importer cost.

#### Source quality and treatment

Use market price as a **noisy** probability proxy, not a mathematically guaranteed accurate event probability. Thin order books, bid/ask spread, fees, stale quotes, manipulation risk and market disagreement all matter. Historical trading volume alone cannot establish current depth. No fixed liquidity threshold is defensible as universal across contract sizes; start with configurable gates and calibrate against realized forecasts and market conditions.

**Never silently invent live market prices**; stale or unmatched contracts are displayed as 'not linked' or 'unavailable'. Keep optional read only market intelligence separate from paid hedge referrals. Lawful public market data access does not imply a user is permitted to trade that contract.

#### Test whether prediction markets add value

Compare outcome and decision metrics for the **same time stamped sample** with and without market features. Incremental value may be zero. Market odds should not be allowed to override official applicable tariff law; those are different data classes. Evaluate event probability forecasts by horizon and category, not in one pooled uninformative hit rate.

### 14. The three main quantitative modeling systems and how they connect

#### The principle

Do not begin with three impressive model names and then find tasks for them. Every model must predict a particular **quantity with units, horizon, target definition, validation data and business use**. The economic decision tool remains functional when a model is unavailable.

#### Model A: Econometric policy and disruption transmission model

**Goal:** Estimate the historical magnitude, persistence and distribution of changes in freight rate, delay, demand, or cost after identifiable trade and logistics shocks, controlling for preexisting trends when possible.

**Candidate methods:** Interrupted time series and event studies with dated shocks; distributed lag regressions and local projections; SARIMAX with exogenous variables as a predictive baseline; difference in differences or synthetic control **only if credible comparison groups and identifying assumptions can be supported**; hierarchical Bayesian partial pooling if lane samples are sparse. Evaluate stationarity, seasonality, autocorrelation, model misspecification and structural breaks. For tariffs, legal rate change is known from primary sources; economic **pass through to purchase prices, volumes or supplier prices** is a separate econometric question.

**Data requirements:** As of decision date, lane observations, comparison series, holidays and seasonality, fuel inputs, macro controls, event timestamps, physical capacity conditions, and an observed target. For historic Red Sea risk in 2023 and 2024, do not treat precrisis differences as causal proof without controls for simultaneous shipping and demand developments.

**Outputs:** Conditional effect size per lane/period, confidence or uncertainty interval, estimated lag and decay where supported, sensitivity across specifications, and an evidence card showing sample, dates and caveats.

**Baselines:** Pre event seasonal rate, last observed rate, no event counterfactual and a simple regression without shock features.

**Validation:** Time ordered historical holdouts, sensitivity to event windows/control groups, stability and error metrics for forecasts; careful causal interpretation for studies. Avoid publishing causal effect certainty from a single episode.

#### Model B: Statistical / machine learning freight and transit forecasting model

**Goal:** Predict future lane **freight costs** and **transit times** (separate targets), preferably at weekly horizons with uncertainty.

**Candidates:** Seasonal naive and SARIMAX baselines first; LightGBM or CatBoost gradient boosted trees for nonlinear interactions; quantile regression for 10th, 50th and 90th percentile outcomes; optional conformal intervals **only with carefully constructed temporal calibration**. Consider a hierarchical model across related lanes; avoid exotic sequence models, transformers or reinforcement learning unless data size, performance and deployment economics justify them.

**Features:** Lagged observed quotes and index series, route identifiers, origins/destinations, lane type, calendar/holiday/seasonality, fuel, observed congestion, freight volume indicators, event regime summaries, delays and accessible contemporaneous market context. Use data **available before the prediction timestamp**, and track revision lags. Never use the eventual shock date or actual future rate in features.

**Outputs:** Cost distribution for a specified lane and shipment/quote basis, forward horizon, likely future transit time and interval, all with model version and freshness. Benchmark quotes should not be mislabeled as expected invoice prices.

**Validation:** Walk forward and rolling window evaluation, MAE/MAPE or sMAPE where appropriate, WAPE by dollar importance, pinball loss for quantiles, empirical interval coverage and width, performance under shocks, performance versus seasonal naive, and lane level coverage. For sparse lanes, flag insufficient data and fall back to explainable scenarios. Guard against data leakage from overlapping windows and vendor revised series.

#### Model C: Event probability and economic decision model

**Goal:** Translate a precisely defined event likelihood and the conditional cost impact into **the most economically attractive feasible decision** under explicit uncertainty and operating constraints.

**Candidate statistical component:** Calibrated logistic regression or Bayesian hierarchical event models for events with enough labeled comparable instances, plus a simple base rate baseline. Consider survival/hazard approaches for timing questions (will disruption occur before customs entry?) only with an appropriate time to event dataset. For very rare and novel geopolitics, present informed scenarios or qualified market prices rather than claiming calibrated frequencies. Calibration tools can include Platt scaling/isotonic regression if sample and leakage controls permit.

**Simulation layer:** Enumerated scenarios for discrete small cases; Monte Carlo for richer joint distributions, linked causal channels and correlated shocks; Bayesian scenario weights if justified by data. Explicitly log random seeds, assumptions, distribution families and sensitivity. **Monte Carlo is not a trained ML model.** It processes probabilistic inputs.

**Decision layer:** Compute expected total cost, NPV of actions, financing and holding cost, inventory service constraints, stockout penalties and lower tail/tail loss. Where reasonable show **risk neutral** expected cost as primary and optional downside sensitive alternatives with the user’s documented risk preferences. Mathematical optimization can use constrained linear/mixed integer programming for discrete sourcing and freight allocations, robust optimization for fragile assumptions, and dynamic programming for rolling inventories later. Do not use black box reinforcement learning to recommend real import orders without safe offline evaluation and extensive safeguards.

**Outputs:** Ranked eligible actions; expected incremental cost relative to status quo; downside distribution; necessary inputs; threshold at which decision flips; limitations, confidence and provenance.

**Validation:** Forecast probability Brier/log loss and calibration **only with adequate independent events**; cost forecast error; model versus baseline **realized decision regret** and counterfactual policy evaluation avoiding hindsight. Include cases where doing nothing was best.

#### Four important corrections to make as the model matures

1. **Probability of an event ≠ conditional severity of its economic effect.** Forecast them separately, then connect by a documented causal mechanism.
2. **Tariff law and cost pass through differ.** Published duty rates define a regulatory scenario. They should not be predicted by freight regression or LLM narration.
3. **Risk factors interact.** A closure, fuel spike and rate surcharge may share one cause. Model a conditional dependency rather than add three fully independent costs.
4. **A lower forecast error does not guarantee better importer decisions.** Evaluate economic utility and regret, along with monetary downside, not only RMSE.

#### End to end intended flow

```text
Importer shipment / PO / cost inputs
                +
Official tariff rules + dated freight/quote observations
                +
Verified news / event candidates + qualified market contracts
                |
                v
       Provenance and data validation
                |
      +---------+----------+
      |                    |
 Econometric shock     Freight and transit
 impact model          forecast model
      |                    |
      +---------+----------+
                |
       Event probability model
                |
       Joint scenario generation
                |
          Cost accounting
                |
       Feasible action constraints
                |
       Economic decision engine
                |
  Dollar impact + alternatives + memo
                |
     Saved forecast / actual outcome
                |
     Walk forward evaluation / retrain
```

This is the **future research and product architecture**, not a statement of models already trained or APIs already integrated.

### 15. Exact economics to preserve in the full version

#### Landed cost and the correct cost basis

At its simplest, a selected scope of landed cost = purchase/customs value + **applicable legally computed duties** + freight borne by the importer + insurance + customs/broker charges + port/terminal/handling + inland transfer + other documented charges. The components and whether they are included in the declared value **depend on valuation rules and trade terms**. Invoice value is not universally equal to customs value. Taxes and duties can require different assessment bases. Implement an explicit cost component ledger with source and inclusion flags rather than one giant formula that risks double counting.

For scenarios, show **incremental** consequences compared with current plan, including time value of money and only changes actually induced by the contemplated action. Define cash timing for each component and discount on a consistent date if necessary.

#### Break even rule: why a simplistic formula can be wrong

In the limited demo, expected avoided cost = event probability × additional duty, and move earlier if that exceeds incremental early cost and entry is truly eligible. **Break even probability = early incremental cost / fully avoidable incremental duty**. In reality, adjust for whether a supplier can ship early, clearance occurs before relevant law, inventory and stockout outcomes, demand uncertainty, product obsolescence, quota/exception treatment, penalties, freight changes, discounting and financing. Sometimes the cost of acting early is highly uncertain too.

**Alternative supplier:** Compare total delivered cost, quality risk, qualifying time, compliance, actual country of origin and new tariff treatment; not just national rates.

**Alternative route:** Compare transport and delays, not a supposed change in customs origin.

**Hedge:** Only a market instrument whose payoff is correlated with the importer’s actual loss can offer useful risk reduction; basis risk, liquidity, fees, margin and applicable US laws require analysis. This project should not offer personalized trade execution by default.

#### Uncertainty outputs

Report clear definitions for expected value, P10/P50/P90, worst 5% scenario or CVaR if used, forecast interval versus uncertainty around mean estimate, and actual historical accuracy. Show the horizon and the specific target. Scenario percentiles computed from user assumptions are **not empirically calibrated probabilities**.

### 16. Evaluation, backtesting and research credibility

#### Why conventional backtesting is hard

Large geopolitically driven ocean lane disruptions and major tariff changes are relatively rare, frequently noncomparable, and often accompanied by other shocks. A system that looks brilliant on one hand picked Red Sea episode may fail in different conditions. A claimed 'public backtest' is meaningful only if the data, as of date, train/test split, baseline and assumptions are honest.

#### Proposed historical workstream

**Experiment 1: A Red Sea disruption cost impact case study.** Choose one clearly defined lane and target metric, establish data rights, freeze a pre event training cutoff, estimate the naïve expected rate and alternative econometric forecasts, then compare with later observations. Use unaffected or differently affected lanes as possible controls, examine seasonality/fuel/demand, and explicitly identify confounders. If you cannot obtain lawful historical lane quotes or benchmark data with sufficient quality, publish a _methodology prototype_ rather than a fabricated historical result.

**Experiment 2: A dated tariff scenario case.** Recreate a historical duty schedule as understood at the decision date and show how a fictional sample importer’s costs change under legally applicable rules. Separate duty arithmetic from price pass through and do not assume any particular importer could have cleared goods early.

**Experiment 3: Prospective saved forecast track record.** Beginning after the prototype, timestamp each event forecast, inputs and recommendation, then observe actual outcome after a predeclared horizon. This prevents backfilling success. Small sample statements should say 'case study' rather than broad accuracy claims.

#### Evaluation table to implement over time

| Question                       | Metric                                                        | Baseline or control                         | Primary risk                              |
| ------------------------------ | ------------------------------------------------------------- | ------------------------------------------- | ----------------------------------------- |
| Is the cost forecast useful?   | MAE, WAPE, pinball loss                                       | Last observation, seasonal naive, no change | Benchmark vs invoice mismatch             |
| Is the probability useful?     | Brier/log score, calibration, count                           | Base event frequency or qualified market    | Rare events, contract resolution mismatch |
| Is the interval credible?      | Coverage, interval width                                      | Historical rolling quantile                 | Too narrow when regime shifts             |
| Does action advice save money? | Realized incremental cost, regret, avoided loss               | Current procurement practice                | Hindsight, unobserved counterfactual      |
| Can a user act?                | Feasible action rate, time to decision                        | Broker or spreadsheet                       | Wrong timing, missing quotes              |
| Can a user trust it?           | Correct explanation, completeness, accuracy of sources        | Manual review                               | Regulatory errors                         |
| Is the business viable?        | Paid conversion, retention, revenue per account, support cost | Existing workflow                           | Too few recurring decisions               |

Historical validation must use time ordered splits, source publication lags, known at time snapshots, no train/test leakage, no easy cherry picked examples, documented failed cases, and reproducible versions of code and outputs. The backtest should never pretend to prove an entire service is accurate from a handful of major shocks.

### 17. Architecture and technology direction for Codex to refine

#### Guiding design

Separate **UI**, **policy and deterministic finance calculations**, **data ingestion**, **forecast services**, and **decision optimization**. Keep every number reproducible without invoking an LLM. Let the mentor demo remain a stable, dependency light local path even when APIs fail.

#### Suggested stack, not a mandate

**Web:** React / Next.js / TypeScript with tested input validation, a plotting library, dedicated client only WebGL globe where supported and a route table fallback. Optimize for good typography, accessibility and load speed rather than visual effects alone.

**Service and models:** Python for pandas, scikit learn, statsmodels, gradient boosted models, calibration and backtesting; a small FastAPI service or scheduled batch inference later; TypeScript can keep the current small deterministic financial calculation in the demo. Keep service and web boundaries well defined; do not require a full Python deployment for day one.

**Storage:** Begin with local example data; later use a relational database (e.g., Postgres) for shipments, policies, event contracts, decisions, source snapshots and model versions, plus object storage for user files or trained models. Convex is a possible choice for collaboration/auth given Vigil experience, but examine relational historical querying requirements before choosing. Avoid adopting a database merely to display two example shipments.

**Background operations:** Source fetch scheduler and queues, caching, idempotent backfill and retries, event and source deduplication, data validity alarms and full provenance. No synchronous page render should depend on half a dozen slow third party APIs.

**Model lifecycle:** Dataset registry with rights metadata, experiment tracker, feature definitions, model versioning, as of date backtest runner, forecast archive, drift alerts, gated deployment and safe fallback to explicit scenario planning. Train only after target definitions and data licenses are settled.

**Security:** Secrets on servers, strong tenant isolation, least privilege, encryption, retention policy, deletion/export support, access logs, backup/restore and incident response for customer invoice or supplier data. Review any analytics, LLM provider and observability vendor that receives customer commercial data. No API tokens in source code or public demo bundles.

**Operational disciplines:** CI tests, reproducible setup, typed schemas, fixture tests, source health monitoring, rate limits, logging with sensitive data redacted, graceful degradation, accessibility, cost controls, rollback and feature flags. Add relevant error alerts, but be careful not to track personally identifying shipment data unnecessarily.

#### Future service contracts to plan for

**Shipment cost service:** `computeBaseCost(shipment, costs, effectiveRules) -> componentLedger, total, warnings, coverage`.

**Scenario cost service:** `applyScenario(base, event, severity, eventDate) -> additionalCosts, eligibility, affectedLines, caveats`.

**Market event service:** `getQualifiedEventSignals(contracts, shipmentContext) -> linkedEvents, unmappedEvents, sourceMeta`.

**Model inference service:** `predictFreight(lane, horizon, asOfDate) -> quantiles, modelVersion, dataStatus, limitations`.

**Decision service:** `compareActions(shipment, scenarios, constraints, policy) -> rankedFeasibleActions, incrementalCosts, breakEvenThresholds, warnings`.

**Report service:** `createMemo(decisionSnapshot) -> HTML/printable PDF with inputs, provenance, limitations and timestamp`.

These are **conceptual responsibilities**, not prescribed code signatures. Codex should formalize types, units, date conventions, rounding and authorization when it builds them.

### 18. How to reuse Vigil, based on the GitHub repository inspected on October 15

**Repo:** https://github.com/Sambhav255/Vigil

**Observed default branch:** `main` (inspection snapshot; recheck if it changes).

**App:** `vigil-app/` with Next.js 16, React 19, TypeScript, Vitest, CSS modules/Tailwind, optional Convex, and a geopolitical intelligence dashboard. This is an actual repo review, **not merely an assumption from the previous chat**.

#### Actual code components worth examining

| Vigil path                             | What it does today                                                            | Reuse idea                                                     | Caveat                                                                                                                                         |
| -------------------------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `vigil-app/lib/data/kalshi.ts`         | Fetches markets and matches some macro titles against existing seeded threats | General fetch and parsing patterns, timeout/error handling     | Current filter targets macro topics, not importer event semantics; no full discovery or contract resolution checks                             |
| `vigil-app/lib/data/polymarket.ts`     | Fetches Gamma events and maps titles to seeded threats                        | API client skeleton, HTTP and parsing patterns                 | Currently requests a small `events?limit=5` sample; fallback picks max outcome price rather than provably the YES contract in ambiguous shapes |
| `vigil-app/lib/data/gpr.ts`            | Fetches a GPR `.xls` path and attempts text parsing with hardcoded fallback   | Candidate geopolitical context integration                     | Verify response encoding and source format; it may be a binary spreadsheet; **fallback of 120 must not appear as a measured live GPR index**   |
| `vigil-app/lib/data/gdelt.ts`          | Contextual news volume/threat updates                                         | Source client ideas                                            | News volume is not policy probability or actual cost; requires geographic/HTS relevance and deduplication                                      |
| `vigil-app/lib/data/sources.ts`        | Combines seed threats with multiple optional feeds                            | Graceful degradation patterns                                  | Seed threats are not known live facts; source status and precedence need redesign                                                              |
| `vigil-app/lib/pipeline.ts`            | Composite threat scoring, title deduplication, probability corrections        | Reusable code layout, pipeline ergonomics and monitoring ideas | Equity sector sensitivity scores and arbitrary blending are not a sound importer exposure model                                                |
| `vigil-app/app/api/dashboard/route.ts` | Serves a cached dashboard snapshot                                            | Server data caching pattern                                    | It initializes from seeded values and does background refresh; do not conflate seed with real external data                                    |
| `vigil-app/lib/backtesting/harness.ts` | Computes directional hit rates for alerts                                     | Test harness structure as inspiration                          | Neutral outcomes are counted as hits; **not a freight or importer cost backtest**; must be replaced for this use                               |
| `vigil-app/tests/`                     | Vitest coverage of scoring and pipeline logic                                 | Test layout and CI discipline                                  | Cost Current requires economics and import specific tests                                                                                      |
| `vigil-app/components/`                | Dark terminal design, charts and panels                                       | Design patterns if useful                                      | Do not copy a financial threat dashboard wholesale; prioritize import actions                                                                  |

Relevant links:

- https://github.com/Sambhav255/Vigil/blob/main/vigil-app/lib/data/kalshi.ts
- https://github.com/Sambhav255/Vigil/blob/main/vigil-app/lib/data/polymarket.ts
- https://github.com/Sambhav255/Vigil/blob/main/vigil-app/lib/data/gpr.ts
- https://github.com/Sambhav255/Vigil/blob/main/vigil-app/lib/pipeline.ts
- https://github.com/Sambhav255/Vigil/blob/main/vigil-app/lib/backtesting/harness.ts
- https://github.com/Sambhav255/Vigil/blob/main/vigil-app/README.md

#### Integration recommendation

**For tomorrow:** Build Cost Current as a separate project with no necessary Vigil API dependency. If helpful, borrow **visual inspiration and isolated reusable utility patterns** only. Do not block the mentor demo on exchange APIs, existing auth, Convex, or model pipelines.

**Later, after the intake milestone and source-rights checks:** Make a small **read only market data adapter** in Cost Current that wraps vetted/revised Vigil connectors. Rework event discovery and parsing against official API schema and tests. Create a curated contract matching pipeline to route or tariff events. Record market timestamps, exact outcome ID and spread/depth; never use arbitrary keyword similarity as sufficient to apply an event probability to shipment cost. Add source statuses with 'unavailable' when feeds fail, instead of silently using demo data. Independently assess GPR parsing and any hardcoded score heuristics. Do not merge two codebases until compatibility, licensing, privacy, test quality and maintenance benefits are understood.

**After real samples:** Test whether market event signals actually outperform a simple base rate or a user scenario. Only then feed them to the quantitative engine automatically.

### 19. Compliance, trust and business risk

#### Customs and trade regulation

The product should support decisions, not represent itself as providing binding CBP tariff classification, legal origin determinations or customs brokerage services. Any paid classification/duty advising and acting on behalf of importers may trigger professional, customs broker and liability issues that need specialist US customs counsel. Identify where a licensed customs broker must review or the user must confirm. A disclaimer alone does not eliminate legal obligations or economic harm.

#### Financial/event contract regulation

Displaying market observations and placing or recommending trades are different activities. Specific advice, solicitations, compensated referrals, order routing or hedge execution may raise **CFTC CTA, introducing broker, exchange, consumer protection or state legal** questions. Obtain qualified legal analysis before offering personalized hedge recommendations, automatic trading or paid referrals. Treat lawfulness and US access of specific prediction market products as date and contract dependent, not a universal rule. The early product should have **no trade execution**.

#### Security, insurance and reliability

Confidential supplier terms and import invoices make this a serious B2B data security product. Keep tenant data segregated, limit sharing, have deletion/retention rules, keep immutable decision and source audit trails, and seek appropriate professional liability, cyber insurance and contractual limitations before paid consequential advice. Show 'insufficient data' rather than confident invented guidance. Where inaccurate duty data could trigger material loss, add an explicit human review gate.

#### Data licensing

Reading a benchmark publicly does not authorize commercial redisplay, redistribution, training, benchmarking derivatives or automated access. Freightos terms, for example, restrict some derived and commercial uses unless specifically licensed; check every vendor agreement before a real commercial integration. If suitable historic data are too expensive, the concept may need a narrower product scope centered on users' own quotes and explicit scenarios.

### 20. Market validation and go or no go tests

#### Three potential company killing assumptions

| Risk                                         | Fastest meaningful test                                                                                                                                         | Evidence to continue                                                                                             | Signal to pause or pivot                                                                               |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| **Customers do not act or pay**              | Show a real decision memo to 5 to 10 owners/operators with actual upcoming imports; ask them to compare against current workflow and make a real pilot purchase | At least some provide a real shipment and pay or commit to a defined paid pilot; they can name decisions changed | All agree 'interesting' but cannot name a budget, time sensitive choice or owner                       |
| **No legal / affordable data at lane level** | Build one complete lane dataset from lawfully usable rates or customer invoices, with date, quote basis and missingness; benchmark a naive forecast             | Enough observations and rights to train/evaluate; lane level errors small relative to economics of actions       | Only paywalled indexes, misaligned lanes or inaccessible historical data                               |
| **Recommendations unsafe or unreliable**     | Recreate 3 to 5 concrete tariff and supply chain cases with broker review and observable feasible actions                                                       | Key exposures reconcile and the decision changes rationally under sensitivity tests                              | Incorrect duty stacking, false claims of early clearance, decisions depend on unavailable alternatives |

Do not define a business victory as a mentor liking the UI. Track actual usage and dollars at stake.

#### Ten interview prompts, without leading the customer

1. Walk me through the last decision you made about the timing of an import purchase.
2. What data did you have, where did it come from, and who made the final decision?
3. What went wrong with the last tariff or freight change that affected you?
4. How much time or money was involved, and how did you estimate it?
5. How often can you actually move an entry date or change the forwarder?
6. Which part of landed cost is hardest to know in time?
7. How do you use your customs broker, forwarder, spreadsheets or ERP today?
8. If a report said an alternative saves $3,000 in expectation, what evidence would you need before acting?
9. Would you let us calculate a risk memo from one upcoming shipment under a confidentiality agreement?
10. Would you pay $99 for this exact one time report, or take part in a clearly defined paid trial? If not, why not?

**Don't turn this into survey vanity metrics.** Record answers and willingness to share an actual decision, not simply sentiment.

#### One page paid pilot memo format

Header: customer and shipment anonymized ID, as of date and decision date.

Inputs: product/origin/HTS status, customs value, current quote, Incoterms, constraints, event definitions and where assumptions came from.

Analysis: base costs, each added risk, probability sources, total expected costs and downside cases.

Actions: status quo, only feasible alternatives, total and incremental dollars, timing and conditions.

Bottom line: preferred action **under stated assumptions**, flip threshold, what would change the view.

Limitations: duty verification needed, no legal/financial advice, no guaranteed savings.

Sources: links, rule dates, quote timestamps, preparer and method version.

### 20A. First customers, market sizing and distribution plan

#### Specific ways to reach real importers

Prioritize **direct interviews with importers who own procurement decisions**, not a large interest form. Routes include independent customs brokers and freight forwarders who serve smaller firms; local import/export business associations and chambers of commerce; ecommerce or Amazon seller operator communities; LinkedIn outreach to owners and supply chain managers of repeat importing brands; small wholesale distributors; and introductions through entrepreneurship and university networks. These are **candidate channels**, not evidence of a confirmed distribution partnership.

Build a prospect log with company, product segment, likely origin, approximate import frequency if public, decision maker, outreach date, response, current tools, monetary pain and next action. Never misrepresent a company's shipment records or claim access to its private import declarations.

Start outreach with the specific job: 'When a tariff or freight rate changes, how do you decide whether to move an upcoming order?' Offer to work through **one actual shipment with the user** and explain how the expected cost changes. Ask for a defined pilot payment if the report is useful. If a broker partner is interested, check whether they would pay for their own workflow, distribute a memo to clients, or merely send introductions. These are three different business models.

#### Bottom up market sizing framework

Do not equate **all US importers** with customers. Build the funnel using verifiable public business population counts and direct customer research:

`TAM candidate importers = US importer population × share with recurring relevant shipments × share with meaningful adjustable decisions × share with accessible data.`

Then define a narrower `SAM = eligible candidate accounts in the first 1 to 2 sectors and geographies reachable with the intended channels.` Define `SOM = paying accounts plausibly acquired in a specified 24 to 36 month period` based on outreach throughput, response, demo, pilot, closing and retention rates. Multiply by an observed or **explicitly assumed** average annual revenue per paying account. Present both account counts and dollar spend potential; do not multiply unsupported importer totals by an optimistic enterprise contract price.

Possible analysis inputs: current Census importer profile by employment band and value where available; SIC/NAICS or commercial importer directories with legally permissible use; verified software price pages; interview willingness to pay; clearly stated selection and duplicate removal. Segment prospective customers by actual annual import spend, **frequency of decisions**, number of purchase orders, ability to reroute or change entry timing, available shipment data and dollar value at risk. Repeat importer count and '$1 million plus importer' thresholds from earlier chat should remain unverified until matched to the source's definition.

#### Pricing and unit economics to investigate

Estimate gross profit per customer as subscription and pilot revenue less commercial freight data license allocation, tariff/compliance review cost, model compute, document processing, storage, customer support, onboarding and report preparation. Track software only versus human reviewed costs separately. A low entry price is unattractive if verifying a complicated tariff schedule costs hours of licensed expert time. For a $99 single memo, measure time to prepare, source acquisition cost, whether a qualified specialist must review it and the customer's actual value. For recurring subscriptions, measure **number of consequential decisions per month**, retention and net expansion rather than visits to a beautiful globe.

Useful metrics: interviews completed, percentage willing to share a real shipment, share with feasible alternatives, ratio of forecast error to economics of decision, fraction of recommendations acted upon, time saved against broker/spreadsheet, paid pilot conversion, repeat memo requests, gross margin by tier, CAC when distribution is paid, churn, data coverage and top reasons for mistrust. Do not set a sales goal without a sample and a feasible acquisition channel.

#### Partnership and distribution model tests

- **Direct SMB:** Lower contract value, straightforward product feedback but potentially high support and acquisition effort.
- **Customs broker workflow:** The broker already has shipment documents and trust, but legal ownership of advice and software integration demands more care.
- **Freight forwarder workflow:** Strong quote and route context, but possible conflicts if recommendations direct freight purchases away from the forwarder.
- **ERP or procurement integrations:** Potential distribution once product data contracts and use are stable; too early for tomorrow.

Test which channel provides **accurate inputs, authority to act, and a budget**. A partner who likes the concept but cannot supply any of those is not a validated sales channel.

#### Company and brand administration, only after concept validation

**Cost Current** is a working name, not a cleared brand. Before a domain purchase, launch, or formal business registration, check trademarks, business registries, product names, relevant domains and possible confusingly similar offerings. Do not assume domain availability or trademark freedom. Protect customer data, determine who owns contributed data and model outputs, review open source package licenses, and keep provenance and legal review records for any third party components reused from Vigil. Establish professional advice for entity formation, business insurance, liability terms and trade/financial regulation when pilots become commercial.

---

### 21. Release roadmap and what comes next after the demo

**Status:** Stage 0 engineering is complete. Stage 1 CSV/cost-evidence work is delivered; the customer, research and expert-review gates remain open. Stage 2–5 entries are future requirements. The current next milestone is in [the execution plan](docs/MASTER_EXECUTION_PLAN.md). Dates below are original targets, not evidence that an external event or submission has occurred.

#### Stage 0: Mentor prototype — October 16, 2026

**Deliverables:** Working globe and scenario editor; deterministic demo cost engine; real action threshold; printed memo; clear model roadmap; clean demo README and tests. No APIs or trained ML required. Practice the five minute story.

#### Stage 1: Validation — through October 26, 2026

- Get **five to ten real importer/broker interviews** and record what their current decision process looks like.
- Choose **one lane and one product segment** that demonstrates meaningful exposure and action control.
- Build one research quality historical **case study** with clear source rights and a naive baseline, even if the conclusion is negative or uncertain.
- Introduce a simple import CSV and realistic cost categories if the demo has not already done so.
- Reconcile one legally limited tariff case with published official sources and, ideally, broker feedback.
- Turn the demo into a concise mentor and judge narrative with evidence; treat unsourced market size and subscription price estimates as hypotheses.
- Keep the founder's Fowler entry within the published format and AI disclosure requirements after independently rechecking contest rules.

#### Stage 2: First credible MVP (roughly following weeks, effort dependent)

- Robust shipment intake and cost ledger with importer specific invoices and lead time.
- Tariff scenario tool with explicit confirmed code/origin and official time stamped rates, restricted coverage.
- Quote based one or two lane freight scenarios.
- Importer usable decision memo and tracked feedback.
- First source health and version log.
- Read only Kalshi/Polymarket contract browser from revised Vigil adapters, clearly separate from forecast.
- Prospective track record with frozen decision timestamps.
- Secure storage only when processing real company data, with appropriate controls.

#### Stage 3: Trained modeling and portfolio intelligence

- Data licensing and target definitions complete; time series history at necessary resolution.
- Econometric shock studies with controls; baseline SARIMAX.
- Quantile boosted forecasts of rates/transit times with walk forward evaluation.
- Calibrated event layer only for sufficiently observed event categories.
- Conditional scenarios, portfolio exposures, sensitivity and feasible action optimization.
- Track errors, decision regret, model drift and source provenance by customer segment.
- Repeat usage, monitoring and alerts only after demonstrated action value.

#### Stage 4: Commercial SaaS scale

- Reliable multi tenant system, paid subscriptions, user and organization controls.
- Integrations with forwarders, purchase order systems and brokers with permissions.
- Review process and specialist legal/compliance input for broader duty applicability.
- Scalable data operations, on call/runbooks, security review, customer support, billing and cancellation.
- Advanced quote matching, supplier alternatives, buyer collaboration, and tailored decision rules.
- Explore risk transfer partnerships **only after** legal review and product demand.

#### Stage 5: Research extensions worth keeping on the ideas list, not building now

- Multi echelon inventory stochastic optimization with service levels and purchase budgets.
- Bayesian regime switching and hierarchical sparse lane uncertainty estimation.
- Supplier network risk graph with credible source verification.
- Causal effect estimation and dynamic treatment effects for historic policy shock analysis.
- Joint simulations of freight, financing, supplier and FX shocks; stress testing tail dependence.
- Conformal and distribution shift uncertainty work with honest temporal coverage validation.
- Off policy decision evaluation and constrained learning from verified customer action outcomes.
- True multi period robust procurement optimization or reinforcement learning **only if** data, safety and offline evidence justify it.

More sophistication is not automatically greater predictive validity. Add research only when it can improve a particular importer decision with measurable evidence.

### 22. How to decide what gets built first after the demo

Use this decision rule: **Would this feature help a real importer make a better documented decision on an actual shipment with information and quotes that can legally be obtained?** If yes, prioritize it. If it adds attractive visualization without changing the decision or trust, defer it.

Suggested relative importance:

- Highest: Cost correctness, official tariff provenance, feasible action comparison, actual freight quotes, user data quality, report clarity.
- High: Historical or forward evaluation, simple shock model, repeat scenario workflow, alerts for specific affected shipments.
- Medium: Prediction market feed, portfolio aggregation, extra map layers, integrated news summarization, broker branding.
- Low until validated: Huge globe effects, generic AI chatbot, crypto price widgets, exotic reinforcement learning, financial hedging/trade execution.

The product vision can be comprehensive while shipping in a deliberately narrow order.

### 23. Research and source credibility checklist

Before presenting any external claim in Fowler, a marketing page, or a real paid report:

- Is the underlying source primary and dated?
- Is it describing a product feature or actual customer adoption?
- Has a claimed company been independently verified as operational and serving this customer?
- Are cost, customer count, funding, 2026 importer population, prices and conversion statistics **actually sourced** rather than repeated from Grok?
- Is the definition of 'active importer', shipment, user, customer segment and recurring user clear?
- Is the model numerical output observed, trained/validated, or a hypothetical scenario?
- Is tariff status current **for the product and entry date**?
- Is freight input a vendor quote, an index value, a stale reference or a user estimate?
- If market probability is shown, does the settlement question match the cost exposure event?
- Do all third party data uses comply with the license?
- Can someone reproduce the result from the inputs and a timestamped method version?

**Unverified assumptions from the initial idea discussion must not be presented as established facts.** These include a particular number of US $1M+ recurring importers, the presumed $210M segment size, any competitor's complete market coverage, or specific prediction market liquidity. Validate with contemporaneous evidence.

### 24. Agent prompts and completion gates

#### Prompt A: Original prototype assignment — completed

> You are my product designer, quantitative engineering partner and implementation lead for **Cost Current**. Read **PART I of `COST_CURRENT_MASTER_BUILD_PLAN.md`** completely and understand PART II as context only. Produce a concise, prioritized plan for a **working mentor demo by October 16, 2026** and immediately execute it. Start by inspecting the existing repository and project environment. Work in a separate Cost Current project, not by overwriting Vigil. Do not ask me to choose trivial libraries unless a genuine blocker exists. Make the interactive globe, editable fictional shipment, correct deterministic cost engine, sensitivity and decision comparison, one page memo, and honest methods page. Build progressively, run lint and tests, and check the 40% versus 10% probability flip. A functioning demo with honest assumptions matters more than any fake live dashboard. Keep setup free and simple. When complete, give me run commands, what works, what is illustrative, known limitations, and a five minute mentor walkthrough. Do **not** pretend ML models are trained or backtested.

#### Prompt B: Post-demo assignment — plan written, first engineering slice delivered

> The mentor demo is now functional. Read **PART II of `COST_CURRENT_MASTER_BUILD_PLAN.md`**. Inspect the actual Cost Current code and the current `Sambhav255/Vigil` repository; identify reusable source client patterns, then propose a phased implementation plan for the real product. Provide feature priorities, a typed data and provenance plan, economic modeling and legal rule boundaries, how all three proposed quantitative modeling systems would be developed and tested, the Kalshi/Polymarket event mapping requirements, legal data licensing issues, a first lane backtest plan, and measurable milestones. Start with the **highest value immediate post demo milestone**, not every future feature at once. Do not modify code until you have written a plan that clearly distinguishes now, next, and later. Keep authentic data and trained model status explicit. Evaluate whether the next change improves real customer decisions before adding more UI.

#### Definition of demo complete

Verified locally on October 15, 2026; see [Progress](docs/PROGRESS.md) for commands, browser coverage and limitations. The external mentor presentation itself is not recorded as completed.

- [x] Works locally and is ready for a screen shared mentor presentation.
- [x] 3D globe is clickable with route selection, or a convincing interactive 2D fallback if WebGL unavailable.
- [x] Sample shipment values match the numbers in Section 5.
- [x] Edit controls trigger immediate and correct recalculation.
- [x] A clear decision winner and break even threshold appear and update.
- [x] Methods correctly distinguish future econometric/ML models from working scenario math.
- [x] Decision memo prints or exports consistently with what is shown on screen.
- [x] No false live data, fabricated accuracy or regulatory claims.
- [x] No paywall, login, paid API key or runtime service needed to demo (after installing dependencies).
- [x] README has commands, test results, demo script and limitations.

#### Definition of credible first commercial product, later

- [ ] At least one genuinely interviewed customer segment and several documented purchasing decisions.
- [ ] Real willingness to pay, not just verbal enthusiasm.
- [ ] Lawfully acquired, time stamped data and suitable source rights.
- [ ] Reliable importer cost ledger and human reviewed limited duty coverage.
- [ ] Feasible, auditable actions and observed decision utility.
- [ ] Reproducible backtests versus naive methods, with sample and error disclosure.
- [ ] Data protection, legal review and operational reliability appropriate to real buyers.

---

## Appendix A. Facts, observations, proposed choices, and open questions

These categories were carried forward from the original blueprint. Only the Cost Current implementation and the scoped Vigil inspection have been checked in this work session; recheck external source statements before relying on them.

| Type                                              | Statement                                                                                                                                                                                                         |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Confirmed from existing Cost Current conversation | Cost Current is the working brand, the immediate goal is a mentor prototype by October 16, and an interactive globe is important.                                                                                 |
| Confirmed from a GitHub repository inspection     | `Sambhav255/Vigil` contains separate Kalshi, Polymarket, GPR and GDELT modules, a Next.js application, caching and tests.                                                                                         |
| Verified from official or primary source pages    | USITC publishes historical HTS revisions, Kalshi publishes market data APIs, Polymarket publishes Gamma API documentation, Freightos posts restrictive data terms, and CFTC publishes intermediaries definitions. |
| Illustrative demo assumption                      | A $100,000 customs value with assumed tariff and freight scenarios generates the example numbers in Part I.                                                                                                       |
| Research hypothesis                               | Qualified market odds and past shipping shocks will measurably improve importer decisions over simple scenarios.                                                                                                  |
| Business hypothesis                               | SMB importers will pay for recurring decision support or one off risk memos.                                                                                                                                      |
| Unknown / needs validation                        | Access to affordable, legally usable lane history; exact buyer and pricing; operational controls that make suggested actions feasible; production tariff coverage and insurance costs.                            |

## Appendix B. Terms in plain English

**Landed cost:** The chosen accounting scope of what it costs to acquire and receive imported goods, with specific inclusions depending on shipment terms.

**HTS code:** US Harmonized Tariff Schedule classification used to determine applicable tariff categories and rates, among other information.

**Incoterms:** Standard trade terms that help allocate transport and other obligations between buyer and seller; they do not themselves decide every legal tax obligation.

**Freight lane:** A comparable origin to destination or corridor definition, with transport mode and rate basis.

**Event probability:** Estimated chance a _precisely defined event_ occurs in a specified time window.

**Shock impact:** Expected difference in cost or delay conditional on an event, requiring its own evidence.

**Quantile forecast:** Estimate of a point in a future outcome distribution, e.g. a forecasted 90th percentile cost.

**Calibration:** Whether events forecast at, say, 30% tend to occur about 30% of the time over an appropriate set of repeated, comparable forecasts.

**Backtest:** Historical evaluation using information available at that time, not future knowledge.

**Decision regret:** How much more a chosen action costs relative to the best feasible comparator, assessed appropriately and without fabricated hindsight.

**End of build plan.**
