# Cost Current

## Business concept and prototype brief for Codex

**Status:** Working product concept and founder demonstration, not a deployed forecasting service

**Prepared:** October 15, 2026

**Immediate goal:** A convincing, interactive prototype for a mentor demonstration by October 16, 2026

**Longer goal:** Validate the business and technical thesis ahead of the October 26 Fowler Business Concept Challenge deadline

**Working tagline:** **Know the cost. See the risk. Make the move.**

> **Instructions to Codex:** Treat this as the product vision and UX brief, not as an implementation specification. You should plan the architecture, design system, technical stack, implementation sequence, and tests yourself. Prioritize a polished and genuinely interactive demonstration by tomorrow. Use transparent, reproducible example assumptions wherever verified live data or trained models do not yet exist. Do not fabricate model performance, customers, pricing validation, regulatory coverage, live feeds, or historical backtests.

---

## 1. What the business is

**Cost Current** helps small and midsize US importers understand how changing tariffs, shipping costs, transit delays, and geopolitical events could affect the _landed cost_ of the goods they import. More importantly, it compares the financial consequences of concrete decisions such as buying inventory earlier, waiting, using another freight route, or exploring a different supplier.

The central question it answers is:

> **"Given my shipment and the risks ahead, what are my likely extra costs, what choices do I have, and which action makes the most financial sense?"**

This should feel like a financial decision tool for importers, not merely a news feed, map, or generic analytics dashboard. A customer who does not understand machine learning should still understand the recommendation and the dollar amounts.

### Target users

Initially: US importing businesses with approximately $2 million to $50 million in annual revenue, especially owners, purchasing managers, finance leads, and operations managers. Candidate verticals include ecommerce brands, apparel, furniture, and automotive aftermarket components. The first prototype can use a fictional ecommerce importer as its demonstration customer. These are hypotheses about who will buy, not validated segments.

### Business model hypothesis

A paid subscription, perhaps starting around **$99 per month**, with higher tiers for multiuser businesses and later offerings for customs brokers or freight forwarders. These are **pricing hypotheses**, not proven willingness to pay. A paid shipment risk memo may be an earlier validation product than SaaS.

### Positioning

Traditional tools may tell an importer what an HTS duty rate is, which shipments are delayed, or which route has a quoted rate. Cost Current aspires to connect **exposure + probability + estimated financial impact + decision alternatives + evidence** in one understandable workflow. Existing vendors already offer individual and overlapping capabilities, including advanced tariff simulation. Do **not** pitch common features as unique, or claim that no competitor does this without fresh evidence.

---

## 2. What tomorrow's prototype should look like

The prototype should be a **beautiful, polished, responsive web application** with a realistic business feel. It should be compelling enough to show a mentor, but should not pretend to be production ready.

### Design direction

- Premium financial analytics interface, more like a serious trading or business intelligence terminal than a logistics company's brochure.
- Clean typography, restrained color palette, strong spacing, crisp cards, informative charts, and excellent readability.
- A striking **interactive 3D globe** as the visual centerpiece, especially on the overview screen. Route arcs connect origin ports to US destinations. Users can rotate and zoom, select a route, and see its related cost and disruption story. It must remain reasonably fast, have a low motion or 2D fallback, and must not block the essential workflow.
- Distinct treatments for **real data**, **illustrative assumptions**, **user entered data**, and **future capabilities**. A small persistent **Demo Mode** label helps set expectations.
- Desktop first for a mentor presentation, but workable on smaller screens.
- Use clear US dollar amounts, short explanations, dates, and accessible contrast rather than cluttered widgets.

### The main screens

**A. Landing / welcome**

A clear explanation of the service, a subtle globe preview, and a prominent **Try an example shipment** action. No login should be required for the demo.

**B. Overview / global exposure**

The interactive globe, several sample routes, a summary of modeled exposure across demo shipments, and 2 or 3 risk stories or scenarios. Clicking any route opens a contextual panel with origin, destination, product, customs value, freight assumptions, scenario probabilities, and the main next action. Risks shown on the globe should be linked to actual sample scenarios, not random red dots or invented real time threat scores.

**C. Add or import a shipment**

A simple guided form, plus optional upload of a small CSV. Ask for:

- Shipment or product name, supplier, country of origin, and optional HTS code.
- Origin port and US destination, route or lane.
- Shipment customs value and currency (initially USD), freight estimate, units, and planned arrival date.
- Lead time; known or assumed duty rate; annual holding cost; optional expedited delivery cost and alternative supplier or route.
- Trade terms such as Incoterms if relevant. Explain that costs included in the landed total depend on the terms, and avoid double counting.

Provide at least one fully populated sample. Let users edit the assumptions and immediately see a recomputation. If CSV is too time consuming, implement sample CSV support with useful errors, but never sacrifice the main workflow for it.

**D. Shipment risk / cost analysis (the most important screen)**

Show the estimated base landed cost and potential extra cost in dollars. Split exposure into **tariff**, **freight**, and optionally **delay / inventory** components. Include a range such as median and high cost scenario; however, do not present P50 or P90 as a calibrated forecast unless the distribution is grounded in a stated and reproducible scenario method. Give the period and applicable shipment clearly. Show the assumptions directly next to the estimate, with a button to edit them.

**E. Decision comparison**

Compare **Order now**, **Wait**, **Consider a different freight route**, and **Explore a different supplier** whenever enough inputs exist. Present:

- Estimated expected total cost under each option.
- Upfront cash, carrying or expediting costs, timing implications, and important operational constraints.
- Potential expected savings **relative to a named baseline**, not a vague number.
- Best current option _under the stated assumptions_, with plain English reasons.
- A simple sensitivity control: change tariff event probability, possible tariff increase, freight shock, holding cost, or target date and watch the preferred decision change.

Do not claim that rerouting goods through a third country legally changes their country of origin or avoids duties. Supplier country changes are different from a shipment route change. Avoid presenting futures, event contracts, or hedging trades as execution recommendations in this prototype.

**F. One page decision memo**

A professional printable page with shipment details, assumptions, scenario table, decision comparison, caveats, and timestamp. Offer print or save as PDF through the browser. This is valuable for showing prospective customers and for business validation.

**G. Methods and evidence**

A short, approachable page that explains where the estimates come from, what is a demo assumption, what remains unvalidated, and what the three planned modeling components will do. Include links to official tariff sources and future historical case studies. Do not fill it with fake accuracy statistics.

---

## 3. The three modeling approaches planned for the backend

The long term technical ambition is **not** just to call an LLM and ask it to guess tomorrow's freight rates. The core should be quantitative, measurable, and understandable. The following three components are complementary. They can be described to a mentor now, but **none should be represented as trained, validated, or active until they actually are**.

### Model 1: Econometric shock impact model

**Proposed methods:** Event studies, distributed lag regressions, and a SARIMAX time series benchmark with external variables.

**Question:** _When a tariff announcement or shipping disruption occurs, how much did freight costs and delays change, for how long, and on which lanes?_

**Potential inputs:** Historical freight benchmarks where legally available, past shipment rate histories, dated disruption events, route information, and trade policy timelines. Candidate historical episode: the Red Sea disruption beginning in late 2023.

**Output:** Estimated magnitude and duration of a shock on a route, with uncertainty and visible caveats. For a tariff change, the direct statutory scenario should come from verified rules or explicit user inputs; a regression is not a substitute for correct duty treatment.

**Why economics matters:** It gives the model an interpretable account of how policy and disruptions are associated with cost movements. Event studies require suitable comparison groups and careful control of confounding factors. The results are not automatically causal.

**Validation:** Compare against simple before and after rules and no shock baselines. Check whether results change under alternative event windows or comparison lanes. Do not claim a causal effect based on one historical crisis.

### Model 2: Machine learning cost forecasting model

**Proposed methods:** Gradient boosted decision trees such as LightGBM or CatBoost, with **quantile regression** to estimate a range rather than only a single number. Compare to seasonal naive forecasting and SARIMAX baselines.

**Question:** _What could freight price or transit time look like for this lane over the next few weeks, given the history and known context?_

**Potential inputs:** Historical lane level freight quotes or indexes with permitted use rights, origin and destination, calendar effects, lagged costs, seasonality, and available shipping context. Train separate targets or models for freight prices and lead times if appropriate.

**Output:** Median projected costs and upper range outcomes where data support them. These estimates feed the cost comparison rather than appearing as impressive but unexplained predictions.

**Why ML matters:** It may identify nonlinear patterns and interactions missed by simple time series regressions. But a powerful model with sparse or poor route level data can perform worse than a basic baseline.

**Validation:** Strict time ordered out of sample evaluation, with no future data leakage. Compare MAE or RMSE to naive forecasts, evaluate quantile pinball loss and observed coverage of prediction intervals, and report results by lane and period. Training is a later phase if sufficiently useful historical data can be obtained.

### Model 3: Event probability, scenario simulation, and decision optimization

**Proposed methods:** An interpretable calibrated logistic model or Bayesian probability update for specific, well defined events; Monte Carlo simulation for cost distributions; and explicit expected value / cash flow decision rules. Prediction market odds may be a signal **only when an event's resolution criteria align with the business risk and the market is sufficiently liquid**.

**Question:** _Given uncertain events and the importer’s actual exposure, which option minimizes expected cost, and how bad could the downside be?_

**Potential inputs:** User entered scenarios at first. Later: dated policy announcements, historical event frequencies, relevant public information, qualified market probabilities, and estimated shock size distributions from Models 1 and 2.

**Output:** Expected extra landed cost, modeled downside range, break even probability for ordering early, and a ranked comparison of available actions. All outputs should be reproducible from the shown assumptions.

**Why economics matters:** This converts forecasts into decisions. A predicted risk is useful only if the expected benefits of changing an action exceed financing, storage, shipping, and execution costs. Accounting for uncertainty and different cash flow dates matters.

**Validation:** Backtest event probability calibration with Brier score when enough observations exist. Evaluate decision rules against realistic passive baselines using _information that was known at each historical decision date_, rather than perfect hindsight. If events are too rare, publish illustrative case studies and build a prospective track record rather than inventing statistical precision.

**Important distinction:** Monte Carlo is a simulation method, not itself a trained machine learning model. The probability component is predictive; the simulation and decision calculation consume predictions and user assumptions.

### How the three fit together

1. **Econometrics:** Estimate how costs respond to an event.
2. **Machine learning:** Forecast underlying freight cost or transit time under available conditions.
3. **Probability and decision layer:** Combine event likelihood with cost impact and compare concrete business choices.

A transparent **rule based cost calculator** underlies all three. Correct arithmetic and provenance come before sophistication. If the available data cannot support a trained model, say so and use explicit scenario assumptions.

---

## 4. The sample mentor demonstration

Use an explicitly fictional company such as **Northstar Home Goods** importing goods from China to Los Angeles. The following values are **illustrative inputs, not observed market prices or forecast probabilities**:

| Input                                              |      Demo assumption |
| -------------------------------------------------- | -------------------: |
| Shipment customs value                             |             $100,000 |
| Current assumed duty rate                          |                  10% |
| Current estimated freight                          |               $7,000 |
| Hypothetical additional duty if event occurs       | 15 percentage points |
| User assumed chance of this tariff event           |                  40% |
| Hypothetical freight disruption surcharge          |               $3,000 |
| User assumed chance of freight disruption          |                  20% |
| Total earlier purchase carrying and execution cost |               $3,500 |

For demonstration purposes only, assume both events are independent and the direct cost changes apply in full to this shipment if it is exposed at the relevant time.

- Additional duty if event happens: **$15,000**.
- Probability weighted tariff exposure: **$6,000**.
- Probability weighted freight surcharge: **$600**.
- Expected added cost from these two scenarios if waiting remains exposed to both: **$6,600**.
- If an earlier purchase would legally and operationally avoid **only** the hypothetical tariff increase, then its expected avoided tariff expense is **$6,000** before the **$3,500** early purchase cost. Its modeled expected net advantage is **$2,500**, assuming the freight risk is unchanged.

The product should clearly distinguish **base landed cost**, **extra scenario exposure**, and **incremental action cost**. If the user edits the probability or carrying costs, the recommended choice should update. Ask users to verify which date determines tariff applicability, what the Incoterms include, inventory constraints, and whether an earlier shipment really avoids the duty.

Suggested demo path:

1. Open the globe and select China to Los Angeles.
2. Review Northstar's sample shipment and explain the baseline landed cost.
3. Click **Analyze risk** to see potential costs and the two illustrative events.
4. Click **Compare decisions** to compare ordering early with waiting.
5. Move tariff probability from 40% down to 10% and show the recommendation change if other assumptions stay fixed.
6. Open **Methods** to show the econometrics + ML + probability/decision roadmap.
7. Generate a shareable or printable one page decision memo.

**Success:** A mentor can understand the business, identify the technical moat being attempted, and see one fully functioning decision comparison in less than five minutes.

---

## 5. Data principles and legal / financial boundaries

- **Tariffs:** Use the United States International Trade Commission HTS and Customs and Border Protection guidance as primary references. The live duty calculation can be complicated by country of origin, special measures, exclusions, product descriptions, trade remedies, and dates. A basic HTS lookup alone does not establish an importer’s final legally payable duties. For tomorrow, rely on clearly labeled user entered rates or a tightly sourced sample case.
- **Freight:** Some market indexes and historical freight datasets have licensing, redistribution, or paid access limits. Do not scrape paid sites or imply permission. The demo can use clearly marked example freight estimates.
- **Prediction markets:** No invented live odds, volumes, spreads, or contracts. Only use a specific market probability in the future after mapping its settlement question to a relevant business event and checking liquidity, availability, and legal constraints.
- **Forecasts:** Never relabel hand entered probabilities or seeded examples as machine learning predictions. Label uncertainty and data freshness.
- **Compliance:** Provide decision support, not definitive customs rulings, financial trading advice, or automatic hedge execution. This is a prototype, not professional customs or financial advice.
- **Data privacy:** Importers' supplier prices, purchase history, and trade partners are sensitive. Avoid uploading real customer datasets to public demos, logs, or untrusted third party services. Sample data are preferable for the presentation.
- **Geography:** Globe routes depict sample commercial lanes; they are not live vessel tracks. Geographic rerouting does not automatically change origin based duties.

### Credible starting references

1. USITC Harmonized Tariff Information and current revisions: https://www.usitc.gov/harmonized_tariff_information
2. USITC Tariff Database, including the official caution about classification and complete duty rules: https://dataweb.usitc.gov/tariff/database/841989
3. Historical HTS revisions for historical comparisons: https://www.usitc.gov/harmonized_tariff_information/hts/archive/list
4. US Census preliminary 2024 exporter and importer profile: https://www.census.gov/foreign-trade/Press-Release/edb/2024prelimprofile.pdf
5. SARIMAX as an econometric / time series candidate: https://www.statsmodels.org/stable/generated/statsmodels.tsa.statespace.sarimax.SARIMAX.html
6. Quantile gradient boosted regression implementation: https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.HistGradientBoostingRegressor.html

These references support the _technical feasibility of methods or data sources_, not claims that Cost Current has tested or deployed them.

---

## 6. Scope choices: demo now, serious product later

### Build for tomorrow

1. Polished landing screen and a working interactive globe with realistic sample routes.
2. Editable sample shipment and optional simple CSV upload.
3. Clear base landed cost calculation from the explicit inputs.
4. Scenario inputs for a hypothetical tariff change and freight surcharge, with transparent arithmetic.
5. A real, responsive **order early vs wait** comparison with break even and expected cost calculations.
6. Display of two or more other potential actions when sufficient inputs exist; otherwise explain what information is missing instead of showing fake savings.
7. Methods page describing all three planned models accurately.
8. Print friendly decision memo; no sign in required.
9. Demo badges, clear assumptions, and polished loading / error / empty states.

### Consider shortly after the mentor demo

- Better bulk import and saved shipment portfolios.
- Selective integration of current public regulatory information with source timestamps.
- Actual econometric backtest of one lane around a dated disruption, including comparison to a naive baseline.
- A simple model evaluation notebook with reproducible data and results.
- Alerts for a user monitored exposure and an evidence log showing why a recommendation changed.
- Supplier country comparison when origin rules and applicable rates are properly handled.
- Customer interviews and paid pilot risk memos.

### Future only, after validation and licensing

- Production freight forecasts and trained calibrated models.
- Broad tariff stacking engine with expert review.
- Long range probabilistic portfolio models and action simulations.
- Prediction market feeds where lawful and genuinely informative.
- Multiuser accounts, customer permissions, billing, broker tools, and integrations.
- Automated hedge recommendations or brokerage integrations only after specialist compliance review.

The mentor prototype should **show the product's trajectory** without hiding which layers are not built yet. A few reliable interactions are far more convincing than twenty fake buttons.

---

## 7. What the founder needs to learn

This project is still a business hypothesis. A prototype is a conversation starter, not evidence of product market fit. As soon as possible, interview at least five relevant importers or customs brokers. Ask them how they currently decide whether to buy ahead, which numbers they already have, what risk they failed to anticipate, and whether a concrete one page memo would change a real purchase decision. Test an actual request to pay, rather than only asking whether the idea is interesting.

**Three potential reasons the idea fails:**

1. **Missing or unaffordable lane data:** Cost Current cannot forecast reliably at the level that matters to individual importers.
2. **No demonstrated action value:** The recommendations are too obvious, too late, or economically insignificant compared with broker advice.
3. **Duty complexity and trust:** The business cannot safely estimate real exposure without frequent regulatory updates, expert involvement, or high liability.

Each should be tested rather than explained away with attractive UI or increasingly complicated AI.

---

## 8. Direction to Codex

**First, plan; then build.** Make reasonable product and engineering decisions without repeatedly requesting trivial clarification.

Your deliverables:

- A concise implementation plan that fits the one day mentor demo, with a prioritized list of screens and interactions.
- A functioning website, not a static mockup, containing the interactive globe, editable sample shipment, cost scenario calculation, action comparison, and one page memo.
- A sensible plan for integrating the three modeling approaches later, separating demo calculators and assumptions from future model inference so a trained system can replace the demo inputs cleanly.
- A brief **README** that explains how to run the demo locally, what is genuine and calculated, what is sample data, what is planned, and how to repeat the scripted mentor demonstration.
- Basic tests of calculation accuracy, particularly expected costs, thresholds, and the way recommendations change when inputs are edited.

**Nonnegotiable quality conditions:**

- Start locally with straightforward commands and no paid services required for the demo.
- Don't require model APIs, commercial shipping data, or credentials for the default experience.
- No broken buttons or charts that display random values unrelated to inputs.
- The globe must be truly interactive, but the app must remain usable without advanced graphics.
- The recommendation calculation must be transparent and consistent with the inputs.
- Use clear labels such as **Illustrative scenario**, **User assumption**, **Not a live forecast**, and **Planned modeling approach** wherever applicable.
- Show references for any genuine external regulatory claims or data.
- Do not claim the three models are trained or backtested unless actual reproducible model work has been done.

**Build philosophy:** Create the smallest honest product experience that makes Cost Current’s promise understandable, then preserve room for the advanced economics and machine learning to become its substance instead of its marketing.
