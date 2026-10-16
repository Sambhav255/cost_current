import { CostScopeEditor } from './CostLedger';
import { ArrowRight, Info, Package, Plus, Check } from 'lucide-react';
import type { Shipment } from '../lib/types';
import { routes } from '../lib/data';
import { dateLabel, usd } from '../lib/format';
import { holdingCost, decisionDate } from '../lib/engine';
import { Field, NumberInput, SectionHeading } from './ui';
export type UpdateShipment = <K extends keyof Shipment>(field: K, value: Shipment[K]) => void;
export default function ShipmentForm({
  s,
  update,
  onAnalyze,
}: {
  s: Shipment;
  update: UpdateShipment;
  onAnalyze: () => void;
}) {
  const dollars = (
    field:
      | 'goodsCents'
      | 'customsCents'
      | 'freightCents'
      | 'otherCents'
      | 'earlyCostCents'
      | 'executionCents',
    label: string,
  ) => (
    <NumberInput
      label={label}
      value={s[field] / 100}
      onChange={(v) => update(field, Math.round(v * 100))}
      prefix="$"
      step={0.01}
    />
  );
  return (
    <div className="shipment-form">
      <section className="panel form-panel">
        <SectionHeading
          number="01"
          title="The shipment"
          description="Your inputs stay in this browser. Use fictional information for this demo."
        />
        <div className="form-grid">
          <Field label="Shipment name">
            <input value={s.name} onChange={(e) => update('name', e.target.value)} />
          </Field>
          <Field label="Product / collection">
            <input value={s.product} onChange={(e) => update('product', e.target.value)} />
          </Field>
          <Field label="Supplier">
            <input value={s.supplier} onChange={(e) => update('supplier', e.target.value)} />
          </Field>
          <Field label="Commercial lane">
            <select value={s.routeId} onChange={(e) => update('routeId', e.target.value)}>
              {routes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.origin} → {r.destination}
                </option>
              ))}
            </select>
          </Field>
          <Field
            label="Country of origin"
            hint="Origin determines applicable duty assumptions; routing does not change it."
          >
            <input
              value={s.originCountry}
              onChange={(e) => update('originCountry', e.target.value)}
            />
          </Field>
          <Field
            label="HTS code (optional)"
            hint="For reference only. No automatic classification or duty lookup."
          >
            <input
              placeholder="Enter if known"
              value={s.htsCode}
              onChange={(e) => update('htsCode', e.target.value)}
            />
          </Field>
        </div>
      </section>
      <section className="panel form-panel">
        <SectionHeading
          number="02"
          title="The starting cost"
          description="Itemize the same shipment in USD. Customs value is a duty basis, not an additional purchase cost."
        />
        <div className="form-grid">
          <Field
            label="Goods acquisition cost"
            hint="Goods only; exclude separately entered freight and duties."
          >
            {dollars('goodsCents', 'Goods acquisition cost')}
          </Field>
          <Field label="Customs value" hint="May differ from the acquisition price.">
            {dollars('customsCents', 'Customs value')}
          </Field>
          <Field label="Freight estimate">{dollars('freightCents', 'Freight estimate')}</Field>
          <Field label="Current assumed duty rate">
            <NumberInput
              label="Current assumed duty rate"
              value={s.dutyRateBps / 100}
              onChange={(v) => update('dutyRateBps', Math.round(v * 100))}
              suffix="%"
              max={1000}
              step={0.01}
            />
          </Field>
          <Field label="Units">
            <NumberInput
              label="Units"
              value={s.units}
              onChange={(v) => update('units', v)}
              min={1}
            />
          </Field>
          <Field
            label="Other itemized costs"
            hint="Other charges not entered in the categories below."
          >
            {dollars('otherCents', 'Other itemized costs')}
          </Field>
          <Field
            label="Incoterm"
            hint="Recorded for context; does not automatically change cost inclusions."
          >
            <select value={s.incoterm} onChange={(e) => update('incoterm', e.target.value)}>
              {['EXW', 'FCA', 'FOB', 'CFR', 'CIF', 'DAP', 'DDP', 'Other / unknown'].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field
            label="Quote cost basis"
            hint="Bundled quotes need a separate breakdown before analysis."
          >
            <select
              value={s.costBasis}
              onChange={(e) => update('costBasis', e.target.value as Shipment['costBasis'])}
            >
              <option value="itemized">Goods, freight, and duty separately itemized</option>
              <option value="bundled">Bundled quote — breakdown not confirmed</option>
            </select>
          </Field>
        </div>
        <div className="info-note">
          <Info size={16} />
          <span>
            The modeled total includes only the costs entered here. Unentered fees, taxes,
            stockouts, and sales effects are excluded. Do not add freight or duties that are already
            included in the goods figure.
          </span>
        </div>
      </section>
      <CostScopeEditor s={s} update={update} />
      <section className="panel form-panel">
        <SectionHeading
          number="03"
          title="Timing & the early purchase"
          description={`Dates are scenario inputs. Decision date: ${dateLabel(decisionDate(s))}.`}
        />
        <div className="form-grid">
          <Field
            label="Scenario decision date"
            hint="Lead-time feasibility and source dates are assessed from this date."
          >
            <input
              type="date"
              value={decisionDate(s)}
              onChange={(e) => update('decisionDate', e.target.value)}
            />
          </Field>
          <Field label="Planned arrival / baseline">
            <input
              type="date"
              value={s.arrivalDate}
              min={decisionDate(s)}
              onChange={(e) => update('arrivalDate', e.target.value)}
            />
          </Field>
          <Field label="Earlier arrival">
            <input
              type="date"
              value={s.earlyArrivalDate}
              min={decisionDate(s)}
              onChange={(e) => update('earlyArrivalDate', e.target.value)}
            />
          </Field>
          <Field label="Assumed tariff effective date">
            <input
              type="date"
              value={s.eventDate}
              min={decisionDate(s)}
              onChange={(e) => update('eventDate', e.target.value)}
            />
          </Field>
          <Field label="Minimum lead time">
            <NumberInput
              label="Minimum lead time"
              value={s.leadDays}
              onChange={(v) => update('leadDays', v)}
              suffix="days"
              max={3650}
            />
          </Field>
          <Field
            label="Does early entry avoid the tariff?"
            hint="This assumption needs verification; purchasing earlier alone is insufficient."
          >
            <select
              value={s.tariffAvoidance}
              onChange={(e) =>
                update('tariffAvoidance', e.target.value as Shipment['tariffAvoidance'])
              }
            >
              <option value="assumed">Assume full avoidance for this scenario</option>
              <option value="unknown">Unknown — needs confirmation</option>
              <option value="not-avoided">No — tariff remains applicable</option>
            </select>
          </Field>
          <Field label="Is early shipment operationally feasible?">
            <select
              value={s.earlyFeasible ? 'yes' : 'no'}
              onChange={(e) => update('earlyFeasible', e.target.value === 'yes')}
            >
              <option value="yes">Assume feasible</option>
              <option value="no">Not feasible</option>
            </select>
          </Field>
        </div>
        <div className="cost-mode">
          <div>
            <h3>Carrying & execution cost</h3>
            <p>Choose one method. The two are never added together.</p>
          </div>
          <div className="segmented" aria-label="Carrying cost method">
            <button
              className={s.carryingMode === 'fixed' ? 'active' : ''}
              onClick={() => update('carryingMode', 'fixed')}
            >
              Enter a total
            </button>
            <button
              className={s.carryingMode === 'derived' ? 'active' : ''}
              onClick={() => update('carryingMode', 'derived')}
            >
              Calculate it
            </button>
          </div>
        </div>
        <div className="form-grid">
          {s.carryingMode === 'fixed' ? (
            <Field
              label="Total early purchase cost"
              hint="Incremental financing, storage, and execution cost; exclude the goods purchase itself."
            >
              {dollars('earlyCostCents', 'Total early purchase cost')}
            </Field>
          ) : (
            <>
              <Field label="Annual holding cost rate">
                <NumberInput
                  label="Annual holding cost rate"
                  value={s.annualHoldingBps / 100}
                  onChange={(v) => update('annualHoldingBps', Math.round(v * 100))}
                  suffix="%"
                  max={100}
                  step={0.1}
                />
              </Field>
              <Field label="Days held earlier">
                <NumberInput
                  label="Days held earlier"
                  value={s.holdingDays}
                  onChange={(v) => update('holdingDays', v)}
                  suffix="days"
                  max={3650}
                />
              </Field>
              <Field label="Additional execution cost">
                {dollars('executionCents', 'Additional execution cost')}
              </Field>
              <div className="derived-total">
                <span>Calculated incremental cost</span>
                <strong>{usd(holdingCost(s), 2)}</strong>
                <small>Goods cost × annual rate × days ÷ 365 + execution</small>
              </div>
            </>
          )}
        </div>
        <div className="info-note">
          <Package size={16} />
          <span>
            Ordering early advances the purchase commitment of {usd(s.goodsCents)}. Supplier deposit
            and payment dates are unspecified; upfront cash needs and present value are not modeled.
          </span>
        </div>
      </section>
      <section className="panel form-panel">
        <SectionHeading
          number="04"
          title="Hypothetical events"
          description="Explicit assumptions, not live odds or model predictions."
        />
        <div className="form-grid">
          <Field label="Tariff event probability">
            <NumberInput
              label="Tariff event probability"
              value={s.tariffProbabilityBps / 100}
              onChange={(v) => update('tariffProbabilityBps', Math.round(v * 100))}
              suffix="%"
              max={100}
            />
          </Field>
          <Field label="Hypothetical tariff increase">
            <NumberInput
              label="Hypothetical tariff increase"
              value={s.tariffIncreaseBps / 100}
              onChange={(v) => update('tariffIncreaseBps', Math.round(v * 100))}
              suffix="pp"
              max={1000}
            />
          </Field>
          <Field label="Freight event probability">
            <NumberInput
              label="Freight event probability"
              value={s.freightProbabilityBps / 100}
              onChange={(v) => update('freightProbabilityBps', Math.round(v * 100))}
              suffix="%"
              max={100}
            />
          </Field>
          <Field label="Hypothetical freight surcharge">
            <NumberInput
              label="Hypothetical freight surcharge"
              value={s.surchargeCents / 100}
              onChange={(v) => update('surchargeCents', Math.round(v * 100))}
              prefix="$"
            />
          </Field>
        </div>
      </section>
      <button className="button primary" onClick={onAnalyze}>
        Review cost & decisions <ArrowRight size={16} />
      </button>
    </div>
  );
}
export function AlternativeForms({ s, update }: { s: Shipment; update: UpdateShipment }) {
  const route = s.alternativeRoute,
    supplier = s.alternativeSupplier;
  const setRoute = <K extends keyof typeof route>(key: K, value: (typeof route)[K]) =>
    update('alternativeRoute', { ...route, [key]: value });
  const setSupplier = <K extends keyof typeof supplier>(key: K, value: (typeof supplier)[K]) =>
    update('alternativeSupplier', { ...supplier, [key]: value });
  return (
    <div className="alternative-forms">
      <details className="panel alternative-panel">
        <summary>
          <span>
            <Plus size={17} /> Configure a different route
          </span>
          <span className="subtle-pill">{route.enabled ? 'EDIT INPUTS' : 'NEEDS QUOTE'}</span>
        </summary>
        <div className="details-content">
          <p className="muted">
            Same goods, origin, and duty assumptions. Supply a quote for the baseline arrival date.
            Geographic rerouting does not change origin-based duties.
          </p>
          <div className="form-grid">
            <Field label="Alternative route freight">
              <NumberInput
                label="Alternative route freight"
                value={route.freightCents / 100}
                onChange={(v) => setRoute('freightCents', Math.round(v * 100))}
                prefix="$"
              />
            </Field>
            <Field label="Route switching cost">
              <NumberInput
                label="Route switching cost"
                value={route.switchingCents / 100}
                onChange={(v) => setRoute('switchingCents', Math.round(v * 100))}
                prefix="$"
              />
            </Field>
            <Field label="Route arrival">
              <input
                type="date"
                value={route.arrivalDate}
                onChange={(e) => setRoute('arrivalDate', e.target.value)}
              />
            </Field>
            <Field label="Route freight disruption probability">
              <NumberInput
                label="Route freight disruption probability"
                value={route.freightProbabilityBps / 100}
                onChange={(v) => setRoute('freightProbabilityBps', Math.round(v * 100))}
                suffix="%"
                max={100}
              />
            </Field>
            <Field label="Route disruption surcharge">
              <NumberInput
                label="Route disruption surcharge"
                value={route.surchargeCents / 100}
                onChange={(v) => setRoute('surchargeCents', Math.round(v * 100))}
                prefix="$"
              />
            </Field>
          </div>
          <p className="field-hint">
            Prefilled figures are illustrative starting inputs, not a freight quote.
          </p>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={route.enabled}
              onChange={(e) => setRoute('enabled', e.target.checked)}
            />
            Include this route in the comparison under these assumptions
          </label>
        </div>
      </details>
      <details className="panel alternative-panel">
        <summary>
          <span>
            <Plus size={17} /> Configure a different supplier
          </span>
          <span className="subtle-pill">{supplier.enabled ? 'EDIT INPUTS' : 'NEEDS QUOTE'}</span>
        </summary>
        <div className="details-content">
          <p className="muted">
            Enter a comparable quote for the same quantity. A supplier country change needs its own
            duty assumptions; no origin rule or trade preference is inferred.
          </p>
          <div className="form-grid">
            <Field label="Alternative supplier country">
              <input
                value={supplier.originCountry}
                onChange={(e) => setSupplier('originCountry', e.target.value)}
              />
            </Field>
            <Field label="Supplier goods cost">
              <NumberInput
                label="Supplier goods cost"
                value={supplier.goodsCents / 100}
                onChange={(v) => setSupplier('goodsCents', Math.round(v * 100))}
                prefix="$"
              />
            </Field>
            <Field label="Supplier customs value">
              <NumberInput
                label="Supplier customs value"
                value={supplier.customsCents / 100}
                onChange={(v) => setSupplier('customsCents', Math.round(v * 100))}
                prefix="$"
              />
            </Field>
            <Field label="Supplier freight">
              <NumberInput
                label="Supplier freight"
                value={supplier.freightCents / 100}
                onChange={(v) => setSupplier('freightCents', Math.round(v * 100))}
                prefix="$"
              />
            </Field>
            <Field label="Supplier assumed duty rate">
              <NumberInput
                label="Supplier assumed duty rate"
                value={supplier.dutyRateBps / 100}
                onChange={(v) => setSupplier('dutyRateBps', Math.round(v * 100))}
                suffix="%"
                max={1000}
              />
            </Field>
            <Field label="Supplier hypothetical tariff increase">
              <NumberInput
                label="Supplier hypothetical tariff increase"
                value={supplier.tariffIncreaseBps / 100}
                onChange={(v) => setSupplier('tariffIncreaseBps', Math.round(v * 100))}
                suffix="pp"
                max={1000}
              />
            </Field>
            <Field label="Supplier switching cost">
              <NumberInput
                label="Supplier switching cost"
                value={supplier.switchingCents / 100}
                onChange={(v) => setSupplier('switchingCents', Math.round(v * 100))}
                prefix="$"
              />
            </Field>
            <Field label="Supplier arrival">
              <input
                type="date"
                value={supplier.arrivalDate}
                onChange={(e) => setSupplier('arrivalDate', e.target.value)}
              />
            </Field>
          </div>
          <p className="field-hint">
            Illustrative starting figures. Uses the baseline event probabilities and freight
            surcharge unless this comparison is excluded.
          </p>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={supplier.comparable}
              onChange={(e) => setSupplier('comparable', e.target.checked)}
            />
            Assume equivalent quantity, quality, and operational qualification
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={supplier.enabled}
              onChange={(e) => setSupplier('enabled', e.target.checked)}
            />
            Include this supplier in the comparison under these assumptions
          </label>
          <p className="quiet-caption">
            <Check size={13} /> Only complete, comparable options can become the suggested action.
          </p>
        </div>
      </details>
    </div>
  );
}
