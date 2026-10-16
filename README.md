# Cost Current

**Know the cost. See the risk. Make the move.**

Cost Current helps US importers compare shipment costs and feasible actions under explicit tariff and freight scenarios. It runs locally in the browser with no credentials, backend, paid feed or model API.

The **mentor prototype is complete**, and the first post-demo engineering milestone is implemented: CSV intake, an itemized cost ledger, source references and dated memo snapshots. This is an assumption-driven decision tool. Customer validation, reviewed duty coverage, live data and trained forecasting remain future work.

## Project references

| Document                                               | Purpose                                                                     |
| ------------------------------------------------------ | --------------------------------------------------------------------------- |
| [Master build plan](COST_CURRENT_MASTER_BUILD_PLAN.md) | Product requirements, complete vision, staged releases and completion gates |
| [Progress](docs/PROGRESS.md)                           | Current verified state, limitations and checkpoint history                  |
| [Execution plan](docs/MASTER_EXECUTION_PLAN.md)        | Prototype audit, delivered milestone, next work and Vigil inspection        |
| [Engineering guide](docs/IMPLEMENTATION_PLAN.md)       | Architecture, calculation boundaries and acceptance discipline              |
| [CSV contract](docs/CSV_INTAKE.md)                     | Supported columns, validation, cost inclusion and evidence handling         |
| [Repository setup](docs/REPOSITORY_SETUP.md)           | Current repository state and commands to commit/push                        |
| [Agent instructions](AGENTS.md)                        | Read order and working conventions                                          |
| [Original founder brief](COST_CURRENT_CODEX_BRIEF.md)  | Original vision and assumptions; see maintained docs for current status     |
| [Session recovery](SESSION_HANDOFF.md)                 | Historical context only                                                     |

## Run locally

Use **Node 22.12+ within the Node 22 line** and npm 10+. `.nvmrc` pins the locally verified Node 22.13.1. With nvm installed, run `nvm use` first.

```sh
npm ci
npm run dev
```

Open the URL printed by Vite, normally `http://127.0.0.1:5173`. No environment variables are required. Browser storage belongs to this browser and origin; it is not synchronized across devices.

## Checks

```sh
npm run check          # Formatting, doc links, lint, types, 50 unit tests, production build
npm run test:e2e       # 16 browser cases across desktop and narrow touch layouts
npm run format        # Apply the shared formatting rules
npm run preview       # Serve dist/ after a successful build
```

Individual checks are available as `format:check`, `check:docs`, `lint`, `typecheck`, `test` and `build`. Install the optional test browser before the first browser run:

```sh
PLAYWRIGHT_BROWSERS_PATH=.playwright npx playwright install chromium
```

On Linux CI, use `npx playwright install --with-deps chromium` with the same environment variable. On macOS, the config can use an already installed Brave browser if bundled Chromium is unavailable. `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` can select another compatible Chromium executable. Local verification used Brave after the browser-download host could not resolve. The narrow project is a 390 × 844 Chromium touch viewport, not a physical iOS/Android device.

[GitHub Actions](.github/workflows/ci.yml) is configured to run these checks on pushes and pull requests. Its hosted execution has not been verified in this session.

## What works

- Three fictional shipments and schematic trade lanes; selectable 3D globe and usable 2D fallback.
- Editable costs, arrival/decision dates, event assumptions and action constraints; invalid inputs suppress estimates.
- Exact four-state scenario math, expected costs, early-versus-wait comparison, eligible same-date route/supplier comparisons and a break-even threshold.
- Strict local CSV preview/import with row errors, duplicate detection, capacity limits and all-or-none commit. See the [CSV contract](docs/CSV_INTAKE.md).
- Cost scope for insurance, brokerage, port and inland charges, including explicit treatment of charges already in goods or freight.
- Customer-supplied references and dates, with evidence invalidation after value or quote-context edits. A supplied reference is not independent verification.
- Browser-local persistence, frozen memo snapshots with calculator version, JSON download and a printable one-page memo.

Money inputs are **USD cents**; rates and probabilities are **basis points** (`4000` means 40%). Customs value is the duty calculation basis and is not added again as an acquisition cost. Incoterms provide context; they do not automatically unbundle quotes. Optional cost lines add to the total only when marked separately incurred.

## Five-minute mentor walkthrough

1. Open the app, choose **Try an example shipment**, then Northstar on Shanghai → Los Angeles. Reset demo data first if the samples were edited; reset preserves added/imported shipments.
2. Confirm base cost **$117,000**, expected tariff exposure **$6,000** and expected freight exposure **$600**.
3. Compare waiting at **$123,600** with ordering early at **$121,100**: an expected **$2,500** early advantage.
4. Change tariff event probability from **40% to 10%**. Waiting becomes **$119,100**, cheaper than early by **$2,000**.
5. Explain the **23.33%** break-even probability and the assumption that early entry avoids only the hypothetical tariff increase. Set avoidance to unknown to exclude that action from recommendations.
6. Open methods, then generate and print a decision memo.
7. Show **Import CSV → Use fictional sample**, preview the data and cost-scope acknowledgement, then import. Inspect the ledger and its source labels. These remain fictional assumptions.
8. Switch to the 2D map and check a narrow viewport if needed.

Earlier purchasing alone does not establish tariff avoidance. Rerouting alone does not change country of origin. Scenario probabilities and sample quotes are illustrative; they are not calibrated forecasts or live observations.

## Source map

| Location                           | Responsibility                                                  |
| ---------------------------------- | --------------------------------------------------------------- |
| `src/lib/types.ts`, `data.ts`      | Shared contracts and fictional seeds                            |
| `src/lib/engine.ts`                | Deterministic validation, costs, scenarios and action ranking   |
| `src/lib/csv.ts`                   | Strict parsing, preview and atomic import                       |
| `src/lib/evidence.ts`, `ledger.ts` | Evidence states, source invalidation and cost inclusion         |
| `src/lib/storage.ts`               | Bounded, backward-compatible local persistence                  |
| `src/lib/*.test.ts`                | Arithmetic, date, intake, evidence and storage regressions      |
| `src/components/`                  | Screens, editors, ledger, memo, globe and fallback              |
| `src/App.tsx`, `src/styles.css`    | State, navigation, persistence and responsive/print layout      |
| `tests/`, `playwright.config.ts`   | Desktop/narrow browser acceptance and generated print artifacts |

## Limits and next work

The next engineering milestone is a **prospective decision journal**: preserve dated input/evidence snapshots, a selected action and later actual outcomes without rewriting history. In parallel, the founder needs importer/broker interviews and a rights-reviewed lane dataset before research or paid-product claims. The [execution plan](docs/MASTER_EXECUTION_PLAN.md) defines the gates.

There is no automatic HTS classification, legally complete duty engine, independently verified quote feed, trained model, server database, account system, cross-device sync, payment schedule optimization or commercial production readiness. The workspace is bounded to 25 shipments. Route arcs are illustrative connections, not vessel tracks.

Generated PDFs, screenshots, browser profiles, build assets and dependencies are ignored by Git. Browser tests regenerate examples under `output/`; they are local verification artifacts rather than checked-in product evidence. No license grant has been selected for this source; repository visibility and third-party data rights remain separate decisions.
