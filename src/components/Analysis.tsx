import { CostLedger } from './CostLedger';
import { otherCosts } from '../lib/ledger';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CircleHelp,
  FileText,
  Info,
  Pencil,
  ShieldCheck,
  SlidersHorizontal,
  TrendingDown,
} from 'lucide-react';
import type { Shipment, ValidAnalysis } from '../lib/types';
import { analyzeShipment } from '../lib/engine';
import { dateLabel, percent, usd } from '../lib/format';
import { Eyebrow, Field, Metric, NumberInput, SectionHeading, SourceBadge } from './ui';
import { AlternativeForms, type UpdateShipment } from './ShipmentForm';
function SensitivityChart({ s, a }: { s: Shipment; a: ValidAnalysis }) {
  const values = Array.from({ length: 21 }, (_, i) => {
    const v = analyzeShipment({ ...s, tariffProbabilityBps: i * 500 });
    return v.valid ? { p: i / 20, wait: v.expectedCents, early: v.actions[1].expectedCents } : null;
  }).filter((v) => v !== null);
  const min = Math.min(...values.flatMap((v) => (v.early === null ? [v.wait] : [v.wait, v.early]))),
    max = Math.max(...values.flatMap((v) => (v.early === null ? [v.wait] : [v.wait, v.early])));
  const y = (v: number) => 145 - ((v - min) / Math.max(max - min, 100)) * 110,
    x = (v: number) => 55 + v * 530;
  const path = (which: 'wait' | 'early') =>
    values
      .filter((v) => v[which] !== null)
      .map((v, i) => `${i ? 'L' : 'M'}${x(v.p)},${y(v[which]!)}`)
      .join(' ');
  return (
    <div className="sensitivity-chart">
      <div className="chart-labels">
        <span>
          <i />
          Wait
        </span>
        <span>
          <i />
          Order early
        </span>
        <small>Expected total cost, USD</small>
      </div>
      <svg
        viewBox="0 0 640 195"
        role="img"
        aria-label={`Expected cost of waiting versus ordering early as tariff probability changes. ${a.breakEven !== null ? `Break-even at ${percent(a.breakEven)}.` : 'No applicable break-even.'}`}
      >
        <line x1="55" x2="585" y1="145" y2="145" stroke="#35413f" />
        <line x1="55" x2="585" y1="90" y2="90" stroke="#283330" strokeDasharray="3 4" />
        <text x="6" y="39">
          {usd(max)}
        </text>
        <text x="6" y="148">
          {usd(min)}
        </text>
        {[0, 0.25, 0.5, 0.75, 1].map((v) => (
          <text key={v} x={x(v)} y="173" textAnchor="middle">
            {percent(v)}
          </text>
        ))}
        <path d={path('wait')} stroke="#edbd78" fill="none" strokeWidth="2.5" />
        <path d={path('early')} stroke="#baf88b" fill="none" strokeWidth="2.5" />
        {a.breakEven !== null && a.breakEven <= 1 && (
          <>
            <line
              x1={x(a.breakEven)}
              x2={x(a.breakEven)}
              y1="22"
              y2="145"
              stroke="#7d9285"
              strokeDasharray="3 4"
            />
            <text x={x(a.breakEven) + 6} y="18">
              {percent(a.breakEven)} break-even
            </text>
          </>
        )}
        <circle
          cx={x(s.tariffProbabilityBps / 10000)}
          cy={y(a.expectedCents)}
          r="4"
          fill="#edbd78"
        />
        {a.actions[1].expectedCents !== null && (
          <circle
            cx={x(s.tariffProbabilityBps / 10000)}
            cy={y(a.actions[1].expectedCents)}
            r="4"
            fill="#baf88b"
          />
        )}
      </svg>
      <p className="quiet-caption">
        Tariff probability changes; every other entered assumption stays fixed.
      </p>
    </div>
  );
}
export default function Analysis({
  s,
  a,
  update,
  onEdit,
  onMemo,
}: {
  s: Shipment;
  a: ValidAnalysis;
  update: UpdateShipment;
  onEdit: () => void;
  onMemo: () => void;
}) {
  const early = a.actions[1];
  const bestSavings = a.best.savingsCents || 0;
  const incompleteEarly = !early.eligible;
  const awaitingEarly = incompleteEarly && a.best.id === 'wait';
  const waitExposed = s.arrivalDate >= s.eventDate;
  const recommendation = a.tied
    ? 'No expected cost advantage'
    : a.best.id === 'early'
      ? 'A little earlier. A lower expected cost.'
      : a.best.id === 'wait'
        ? 'The numbers favor waiting.'
        : `${a.best.name} has the lowest expected cost.`;
  return (
    <>
      <div className="metrics-grid analysis-metrics">
        <Metric
          label="Base modeled landed cost"
          value={usd(a.baseCents)}
          detail={`${usd(a.baseCents / s.units, 2)} per unit · ${s.units.toLocaleString()} units`}
        />
        <Metric
          label="Expected extra cost · wait"
          value={`+${usd(a.addedCents)}`}
          detail="Tariff + freight scenario exposure"
          accent
        />
        <Metric
          label="Expected total · wait"
          value={usd(a.expectedCents)}
          detail="Named comparison baseline"
        />
        <Metric
          label="Worst modeled outcome · wait"
          value={usd(
            Math.max(...a.outcomes.filter((o) => o.probability > 0).map((o) => o.costCents)),
          )}
          detail="Under these scenarios, not a forecast bound"
        />
      </div>
      <div className="analysis-main-grid">
        <section className="panel cost-panel">
          <SectionHeading
            number="01"
            title="Understand the exposure"
            description={`Baseline: wait for planned entry on ${dateLabel(s.arrivalDate)}.`}
            action={
              <button className="text-button" onClick={onEdit}>
                <Pencil size={13} /> Edit costs
              </button>
            }
          />
          <div className="cost-equation">
            <div>
              <span>Goods</span>
              <strong>{usd(s.goodsCents)}</strong>
            </div>
            <span>+</span>
            <div>
              <span>Current duty</span>
              <strong>{usd(a.dutyCents)}</strong>
            </div>
            <span>+</span>
            <div>
              <span>Freight & other</span>
              <strong>{usd(s.freightCents + otherCosts(s))}</strong>
            </div>
            <span>=</span>
            <div className="equation-total">
              <span>Base cost</span>
              <strong>{usd(a.baseCents)}</strong>
            </div>
          </div>
          <div className="exposure-components">
            <div>
              <div>
                <span className="component-dot amber" />
                <strong>Tariff exposure</strong>
                <span className="small muted">
                  {percent(s.tariffProbabilityBps / 10000)} × {usd(a.tariffImpactCents)}
                  {!waitExposed ? ' · not exposed' : ''}
                </span>
              </div>
              <strong>{usd(a.tariffExposureCents)}</strong>
            </div>
            <div>
              <div>
                <span className="component-dot teal" />
                <strong>Freight exposure</strong>
                <span className="small muted">
                  {percent(s.freightProbabilityBps / 10000)} × {usd(s.surchargeCents)}
                </span>
              </div>
              <strong>{usd(a.freightExposureCents)}</strong>
            </div>
          </div>
          <div className="expected-total">
            <span>Base + expected extra cost</span>
            <strong>{usd(a.expectedCents)}</strong>
          </div>
          <div className="info-note">
            <Info size={15} />
            <span>
              Expected cost is a probability-weighted average, not the amount you will necessarily
              pay. Only entered costs are included.
            </span>
          </div>
        </section>
        <aside className="panel assumptions-panel">
          <SectionHeading title="Your scenario controls" action={<SlidersHorizontal size={17} />} />
          <SourceBadge
            edited={s.edited.some((k) =>
              [
                'tariffProbabilityBps',
                'tariffIncreaseBps',
                'freightProbabilityBps',
                'surchargeCents',
              ].includes(k),
            )}
          />
          <div className="slider-field">
            <label htmlFor="tariff-probability">
              Tariff event probability <output>{percent(s.tariffProbabilityBps / 10000)}</output>
            </label>
            <input
              id="tariff-probability"
              aria-label="Tariff event probability"
              type="range"
              min="0"
              max="10000"
              step="100"
              value={s.tariffProbabilityBps}
              onChange={(e) => update('tariffProbabilityBps', Number(e.target.value))}
              style={{ '--range-fill': `${s.tariffProbabilityBps / 100}%` } as React.CSSProperties}
            />
            <div className="range-ticks">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>
          <Field
            label="Hypothetical tariff increase"
            hint="Percentage points added to the current duty rate."
          >
            <NumberInput
              label="Hypothetical tariff increase"
              value={s.tariffIncreaseBps / 100}
              onChange={(v) => update('tariffIncreaseBps', Math.round(v * 100))}
              suffix="pp"
              max={1000}
              step={0.5}
            />
          </Field>
          <div className="slider-field">
            <label htmlFor="freight-probability">
              Freight event probability <output>{percent(s.freightProbabilityBps / 10000)}</output>
            </label>
            <input
              id="freight-probability"
              aria-label="Freight event probability"
              type="range"
              min="0"
              max="10000"
              step="100"
              value={s.freightProbabilityBps}
              onChange={(e) => update('freightProbabilityBps', Number(e.target.value))}
              style={{ '--range-fill': `${s.freightProbabilityBps / 100}%` } as React.CSSProperties}
            />
            <div className="range-ticks">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>
          <Field label="Hypothetical freight surcharge">
            <NumberInput
              label="Hypothetical freight surcharge"
              value={s.surchargeCents / 100}
              onChange={(v) => update('surchargeCents', Math.round(v * 100))}
              prefix="$"
              step={100}
            />
          </Field>
          <div className="independence-note">
            <CircleHelp size={14} /> Two independent events, assumed for this example.
          </div>
        </aside>
      </div>
      <CostLedger analysis={a} />
      <section className="decision-section">
        <SectionHeading
          number="02"
          title="Make the comparison"
          description="Estimated total costs for the same shipment. Savings are relative to waiting."
        />
        <div className={`recommendation ${awaitingEarly ? 'conditional' : ''}`} aria-live="polite">
          <div className="recommendation-icon">
            {awaitingEarly ? <CircleHelp size={24} /> : <TrendingDown size={24} />}
          </div>
          <div className="recommendation-copy">
            <Eyebrow>
              {a.tied
                ? 'EQUAL EXPECTED COST'
                : awaitingEarly
                  ? 'COMPARISON NEEDS CONFIRMATION'
                  : incompleteEarly
                    ? 'LOWEST COST AMONG ELIGIBLE OPTIONS'
                    : 'BEST CURRENT OPTION · UNDER YOUR ASSUMPTIONS'}
            </Eyebrow>
            <h2>{awaitingEarly ? 'Review the unavailable early option.' : recommendation}</h2>
            <p>
              {awaitingEarly
                ? early.reason
                : a.best.id === 'early'
                  ? `Expected avoided tariff cost of ${usd(a.tariffExposureCents)} exceeds the ${usd(a.earlyCostCents)} early purchase cost. Freight risk is unchanged.`
                  : a.best.id === 'wait'
                    ? `Ordering early does not save enough to cover its incremental cost. Preserve the planned schedule under these assumptions.`
                    : a.best.reason}
            </p>
            {incompleteEarly && !awaitingEarly && <p>Early purchase is excluded: {early.reason}</p>}
            {awaitingEarly && s.earlyArrivalDate < s.eventDate && waitExposed && (
              <p>
                If early entry fully avoids the increase, its conditional expected total is{' '}
                <strong>{usd(a.baseCents + a.earlyCostCents + a.freightExposureCents)}</strong>.
                Operational feasibility still needs confirmation.
              </p>
            )}
          </div>
          {!awaitingEarly && (
            <div className="recommendation-saving">
              <span>{bestSavings > 0 ? 'Expected advantage vs. wait' : 'Baseline comparison'}</span>
              <strong>{bestSavings > 0 ? usd(bestSavings) : 'Wait'}</strong>
              <small>
                {a.tied
                  ? 'No meaningful cost difference'
                  : bestSavings > 0
                    ? 'For this shipment'
                    : 'No incremental action cost'}
              </small>
            </div>
          )}
        </div>
        <div className="decision-cards">
          {a.actions.map((action) => (
            <article
              key={action.id}
              className={`decision-card ${action.id === a.best.id && !a.tied && !awaitingEarly ? 'best-card' : ''}`}
              data-testid={`decision-${action.id}`}
            >
              <div className="decision-card-top">
                <span>
                  {action.id === 'wait'
                    ? 'BASELINE'
                    : action.eligible
                      ? 'MODELED OPTION'
                      : 'MORE INPUTS NEEDED'}
                </span>
                {action.id === a.best.id && !a.tied && !awaitingEarly && <Check size={15} />}
              </div>
              <h3>{action.name}</h3>
              <div className="decision-price">
                {action.expectedCents === null ? (
                  <span>Needs inputs</span>
                ) : (
                  usd(action.expectedCents)
                )}
              </div>
              <p className="decision-relative">
                {action.savingsCents === null
                  ? 'Not ranked'
                  : action.id === 'wait'
                    ? 'Named baseline'
                    : Math.abs(action.savingsCents) < 0.5
                      ? 'Equal to waiting'
                      : `${usd(Math.abs(action.savingsCents))} ${action.savingsCents > 0 ? 'less' : 'more'} than wait`}
              </p>
              {action.eligible && (
                <div className="decision-parts">
                  <div>
                    <span>Base cost</span>
                    <span>{usd(action.baseCents!)}</span>
                  </div>
                  <div>
                    <span>Action cost</span>
                    <span>+{usd(action.actionCents)}</span>
                  </div>
                  <div>
                    <span>Expected exposure</span>
                    <span>+{usd(action.tariffExposureCents + action.freightExposureCents)}</span>
                  </div>
                  <div>
                    <span>Arrival</span>
                    <span>{dateLabel(action.arrivalDate).replace(', 2026', '')}</span>
                  </div>
                </div>
              )}
              <p className="decision-reason">{action.reason}</p>
              {!action.eligible && action.id === 'early' && (
                <button className="text-button" onClick={onEdit}>
                  Review timing <ArrowRight size={13} />
                </button>
              )}
            </article>
          ))}
        </div>
        <AlternativeForms s={s} update={update} />
      </section>
      <div className="analysis-bottom-grid">
        <section className="panel sensitivity-panel">
          <SectionHeading
            number="03"
            title="Find the tipping point"
            description="How much tariff risk makes an early purchase worthwhile?"
          />
          <div className="break-even">
            <strong>
              {a.breakEven === null
                ? 'Not applicable'
                : a.breakEven > 1
                  ? 'Above 100%'
                  : percent(a.breakEven)}
            </strong>
            <div>
              <span>Break-even tariff probability</span>
              <p>
                {a.breakEven === null
                  ? 'Requires an eligible early option that avoids a nonzero tariff impact.'
                  : a.breakEven > 1
                    ? 'Early purchase cost exceeds the full possible tariff benefit.'
                    : `${usd(a.earlyCostCents)} early cost ÷ ${usd(a.tariffImpactCents)} tariff impact`}
              </p>
            </div>
          </div>
          <SensitivityChart s={s} a={a} />
        </section>
        <section className="panel outcome-panel">
          <SectionHeading
            title="Outcomes under your assumptions"
            description="Exact enumeration. No random simulation."
          />
          <table className="outcome-table">
            <thead>
              <tr>
                <th>IF THIS HAPPENS</th>
                <th>CHANCE</th>
                <th>WAIT TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {a.outcomes.map((o) => (
                <tr key={o.name}>
                  <td>{o.name}</td>
                  <td>{percent(o.probability)}</td>
                  <td>{usd(o.costCents)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="info-note">
            <ShieldCheck size={16} />
            <span>
              Not calibrated probabilities. Event timing, full shipment exposure, and independence
              are explicit scenario assumptions.
            </span>
          </div>
          <button className="button secondary full" onClick={onMemo}>
            <FileText size={16} /> Create decision memo <ArrowUpRight size={15} />
          </button>
        </section>
      </div>
      <div className="analysis-disclaimer">
        <Info size={15} />
        <p>
          Decision support, not a customs ruling. Verify tariff applicability, quote inclusions,
          entry dates, inventory capacity, and supplier payment terms before acting. Delay and
          lost-sales costs are not modeled.
        </p>
      </div>
    </>
  );
}
