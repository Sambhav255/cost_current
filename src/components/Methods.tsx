import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Calculator,
  Check,
  Clock3,
  FlaskConical,
  GitBranch,
  Layers3,
  ShieldCheck,
} from 'lucide-react';
import { Eyebrow, SectionHeading } from './ui';
export default function Methods({ onBack }: { onBack: () => void }) {
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Methods and evidence</h1>
          <p>
            What Cost Current can calculate today, where assumptions come from, and what it cannot
            claim.
          </p>
        </div>
        <button className="button secondary" onClick={onBack}>
          Back to the example <ArrowRight size={15} />
        </button>
      </div>
      <div className="methods-intro panel">
        <span className="method-intro-icon">
          <Calculator size={28} />
        </span>
        <div>
          <span className="status-chip green">
            <Check size={12} /> ACTIVE TODAY
          </span>
          <h2>A transparent scenario calculator.</h2>
          <p>
            Cost Current calculates landed cost and compares actions using explicit shipment inputs
            and hypothetical events. Every result is reproducible from the displayed assumptions.
            CSV intake records supplied quote references and dates; the cost ledger separates
            additional charges from costs already included elsewhere. Customer-supplied inputs are
            not independently verified, and editing a value or quote context invalidates its
            attached evidence. Forecast mode adds a dated last-observation freight baseline from
            explicitly imported or fictional observations; it cannot infer tariff or freight-event
            odds. What if? keeps manual assumptions separate. No trained model, live freight feed,
            prediction-market feed, or automated tariff classification is active.
          </p>
        </div>
      </div>
      <section>
        <SectionHeading
          number="01"
          title="Follow the calculation"
          description="The same calculation powers the workspace, overview, and memo."
        />
        <div className="method-formulas">
          <article className="panel">
            <span>THE STARTING POINT</span>
            <h3>Base modeled landed cost</h3>
            <code>
              Goods + customs value × duty rate
              <br />+ itemized freight + other costs
            </code>
            <p>
              Customs value is used to calculate duty; it is not added a second time as a purchase
              cost.
            </p>
          </article>
          <article className="panel">
            <span>THE SCENARIO</span>
            <h3>Expected added cost</h3>
            <code>
              Tariff probability × tariff impact
              <br />+ freight probability × surcharge
            </code>
            <p>
              The sample assumes independent binary events and full shipment exposure at the
              relevant entry date.
            </p>
          </article>
          <article className="panel">
            <span>THE CHOICE</span>
            <h3>Expected action advantage</h3>
            <code>
              Expected total if waiting
              <br />− expected total under the action
            </code>
            <p>
              Only available, complete options are ranked. Operational feasibility remains an input,
              not a guarantee.
            </p>
          </article>
        </div>
      </section>
      <section className="method-roadmap">
        <SectionHeading
          number="02"
          title="Three components. One decision."
          description="Planned research, not capabilities currently running in the demo."
        />
        <div className="roadmap-grid">
          <article className="panel roadmap-card">
            <div>
              <span className="roadmap-icon">
                <GitBranch size={24} />
              </span>
              <span className="subtle-pill">
                <Clock3 size={11} /> PLANNED
              </span>
            </div>
            <Eyebrow>MODEL 01 / ECONOMETRICS</Eyebrow>
            <h3>Understand the shock.</h3>
            <p>
              Event studies, distributed lags, and SARIMAX benchmarks could estimate how costs
              respond to disruptions on particular lanes.
            </p>
            <div className="roadmap-validation">
              <FlaskConical size={15} />
              <span>
                Compare event windows and lanes. Account for confounders; association alone is not
                causality.
              </span>
            </div>
          </article>
          <article className="panel roadmap-card">
            <div>
              <span className="roadmap-icon">
                <Layers3 size={24} />
              </span>
              <span className="subtle-pill">
                <Clock3 size={11} /> PLANNED
              </span>
            </div>
            <Eyebrow>MODEL 02 / MACHINE LEARNING</Eyebrow>
            <h3>Estimate the range.</h3>
            <p>
              Gradient-boosted quantile models could forecast freight prices and transit times where
              sufficient licensed history exists.
            </p>
            <div className="roadmap-validation">
              <FlaskConical size={15} />
              <span>
                Time-ordered evaluation against naive baselines. Measure error, pinball loss, and
                interval coverage.
              </span>
            </div>
          </article>
          <article className="panel roadmap-card">
            <div>
              <span className="roadmap-icon">
                <Calculator size={24} />
              </span>
              <span className="subtle-pill">
                <Clock3 size={11} /> PLANNED
              </span>
            </div>
            <Eyebrow>MODEL 03 / PROBABILITY & DECISIONS</Eyebrow>
            <h3>Choose with context.</h3>
            <p>
              Calibrated event probabilities could feed richer simulations and comparisons that
              reflect financing, timing, and business constraints.
            </p>
            <div className="roadmap-validation">
              <FlaskConical size={15} />
              <span>
                Evaluate calibration and decisions using information available at the time. Monte
                Carlo itself is not a trained model.
              </span>
            </div>
          </article>
        </div>
      </section>
      <section className="evidence-section">
        <SectionHeading
          number="03"
          title="Sources, with boundaries"
          description="Official references support the research direction. They do not verify the demo's rates or probabilities."
        />
        <div className="panel evidence-list">
          {[
            [
              'USITC Harmonized Tariff Information',
              'Official HTS resources and current revisions. The example duty rates are not sourced from this page.',
              'https://www.usitc.gov/harmonized_tariff_information',
            ],
            [
              'CBP · Tips for New Importers and Exporters',
              'Importer guidance and professional resources. Confirm treatment for the actual goods and transaction.',
              'https://www.help.cbp.gov/s/article/Article-1894?language=en_US',
            ],
            [
              'USITC HTS Archive',
              'Historical revisions for date-specific research. No historical backtest has been completed here.',
              'https://www.usitc.gov/harmonized_tariff_information/hts/archive/list',
            ],
            [
              'Statsmodels · SARIMAX',
              'Documentation for a proposed time-series benchmark, not evidence of Cost Current model performance.',
              'https://www.statsmodels.org/stable/generated/statsmodels.tsa.statespace.sarimax.SARIMAX.html',
            ],
            [
              'Scikit-learn · Quantile gradient boosting',
              'A potential implementation approach, subject to data quality and baseline evaluation.',
              'https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.HistGradientBoostingRegressor.html',
            ],
          ].map(([title, description, url]) => (
            <a key={title} href={url} target="_blank" rel="noreferrer">
              <BookOpen size={18} />
              <div>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
              <ArrowUpRight size={18} />
            </a>
          ))}
        </div>
        <p className="quiet-caption">
          Reference list prepared October 15, 2026. No regulatory information is fetched or updated
          at runtime.
        </p>
      </section>
      <div className="method-boundaries panel">
        <ShieldCheck size={24} />
        <div>
          <h3>Built to make the assumptions visible.</h3>
          <p>
            All companies, quotes, event probabilities, and duty rates in the samples are fictional.
            No legal duty determination, calibrated forecast, model accuracy, customer outcome, or
            pricing validation is claimed. Routing goods through a different country does not
            automatically change their origin. No hedging or trading recommendation is provided.
          </p>
        </div>
      </div>
    </>
  );
}
