import { useState } from 'react';
import { FileCheck2, Info, Trash2 } from 'lucide-react';
import type { Shipment, ValidAnalysis } from '../lib/types';
import { decisionDate } from '../lib/engine';
import {
  costEvidenceFields,
  evidenceDate,
  evidenceDescription,
  evidenceLabels,
  evidenceScope,
  isIsoDate,
  type InputEvidence,
} from '../lib/evidence';
import {
  costCategories,
  inclusionLabels,
  type AdditionalCostLine,
  type CostCategory,
  type CostInclusion,
} from '../lib/ledger';
import { dateLabel, usd } from '../lib/format';
import { Field, NumberInput, SectionHeading } from './ui';
import type { UpdateShipment } from './ShipmentForm';

export function CostLedger({ analysis }: { analysis: ValidAnalysis }) {
  return (
    <section className="panel ledger-panel">
      <SectionHeading
        title="Cost breakdown"
        description="Only the added-cost column contributes to the base total. Included charges are never added twice."
      />
      <div className="ledger-scroll">
        <table className="ledger-table" aria-label="Landed cost ledger">
          <thead>
            <tr>
              <th>Component</th>
              <th>Entered amount</th>
              <th>Added to base</th>
              <th>Scope & source</th>
            </tr>
          </thead>
          <tbody>
            {analysis.ledger.map((line) => (
              <tr key={line.id}>
                <th scope="row">{line.label}</th>
                <td>{usd(line.amountCents, 2)}</td>
                <td>{usd(line.contributionCents, 2)}</td>
                <td>
                  <strong>{line.scope}</strong>
                  <span>
                    {evidenceLabels[line.evidence.state]} · {evidenceDescription(line.evidence)}
                  </span>
                  {evidenceDate(line.evidence) && (
                    <small>Source as of {dateLabel(evidenceDate(line.evidence)!)}</small>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row" colSpan={2}>
                Base modeled landed cost
              </th>
              <td>{usd(analysis.baseCents, 2)}</td>
              <td>Includes only the scope above</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <p className="quiet-caption">
        Customer-supplied evidence is recorded as provided. It is not independent quote verification
        or a determination of legally applicable duties. Customs value is a calculation basis, not a
        second goods expense.
      </p>
    </section>
  );
}

export function CostScopeEditor({ s, update }: { s: Shipment; update: UpdateShipment }) {
  const setLine = (category: CostCategory, change: Partial<AdditionalCostLine>) => {
    const existing = s.costLines?.find((line) => line.category === category);
    const line: AdditionalCostLine = {
      category,
      amountCents: existing?.amountCents ?? NaN,
      inclusion: existing?.inclusion ?? 'separate',
      ...change,
      evidence: {
        state: 'unknown',
        reason: 'Cost or inclusion edited; attach updated source evidence.',
      },
    };
    update('costLines', [
      ...(s.costLines ?? []).filter((line) => line.category !== category),
      line,
    ]);
  };
  return (
    <section className="panel form-panel">
      <SectionHeading
        title="What else is in the cost?"
        description="Add separately billed costs or record charges already included in goods/freight. Blank categories are outside this cost scope."
      />
      <div className="cost-scope-grid">
        {(Object.keys(costCategories) as CostCategory[]).map((category) => {
          const line = s.costLines?.find((line) => line.category === category);
          return (
            <div className="cost-scope-row" key={category}>
              <Field label={costCategories[category]}>
                <NumberInput
                  label={`${costCategories[category]} amount`}
                  value={line ? line.amountCents / 100 : NaN}
                  onChange={(v) => setLine(category, { amountCents: Math.round(v * 100) })}
                  prefix="$"
                  step={0.01}
                />
              </Field>
              <Field label={`${costCategories[category]} inclusion`}>
                <select
                  aria-label={costCategories[category] + ' inclusion'}
                  value={line?.inclusion ?? 'out_of_scope'}
                  onChange={(e) =>
                    setLine(category, { inclusion: e.target.value as CostInclusion })
                  }
                >
                  {Object.entries(inclusionLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </Field>
              <button
                className="icon-button"
                aria-label={`Clear ${costCategories[category]} cost`}
                disabled={!line}
                onClick={() =>
                  update(
                    'costLines',
                    (s.costLines ?? []).filter((line) => line.category !== category),
                  )
                }
              >
                <Trash2 size={16} />
              </button>
            </div>
          );
        })}
      </div>
      <div className="info-note">
        <Info size={16} />
        <span>
          Other itemized costs above must exclude the separately entered categories here. These
          inclusion choices describe your accounting scope; Incoterms do not fill them in
          automatically.
        </span>
      </div>
      <SourceEditor key={s.id} s={s} update={update} />
    </section>
  );
}

function SourceEditor({ s, update }: { s: Shipment; update: UpdateShipment }) {
  const attached = Object.values(s.evidence ?? {}).find((e) => e.state === 'customer_supplied');
  const [reference, setReference] = useState(
    attached && 'reference' in attached ? attached.reference : '',
  );
  const [asOf, setAsOf] = useState(
    attached && 'observedOn' in attached ? attached.observedOn : decisionDate(s),
  );
  const [notice, setNotice] = useState('');
  const attach = () => {
    if (
      !s.originCountry.trim() ||
      !Number.isInteger(s.units) ||
      s.units < 1 ||
      costEvidenceFields.some((field) => !Number.isFinite(s[field]) || s[field] < 0)
    ) {
      setNotice(
        'Complete valid base costs, country of origin, and units before attaching evidence.',
      );
      return;
    }
    if (!reference.trim() || reference.length > 500 || !isIsoDate(asOf) || asOf > decisionDate(s)) {
      setNotice(
        'Enter a source reference (up to 500 characters) and a valid source date on or before the decision date.',
      );
      return;
    }
    const evidence: InputEvidence = {
      state: 'customer_supplied',
      reference: reference.trim(),
      observedOn: asOf,
      capturedAt: new Date().toISOString(),
      scope: evidenceScope(s),
    };
    update('evidence', {
      ...s.evidence,
      ...Object.fromEntries(costEvidenceFields.map((field) => [field, { ...evidence }])),
    });
    if (s.costLines?.length)
      update(
        'costLines',
        s.costLines.map((line) => ({ ...line, evidence: { ...evidence } })),
      );
    setNotice(
      'Source attached to the current base costs. Scenario probabilities and future shocks remain assumptions.',
    );
  };
  return (
    <div className="source-editor">
      <h3>
        <FileCheck2 size={17} /> Attach cost evidence
      </h3>
      <p className="muted small">
        Record an invoice, quote, or broker-provided reference for the current cost inputs.
        Attaching it records your claim; it does not verify classification or rates.
      </p>
      <div className="form-grid">
        <Field label="Cost source reference">
          <input
            maxLength={500}
            value={reference}
            placeholder="Invoice or quote reference"
            onChange={(e) => setReference(e.target.value)}
          />
        </Field>
        <Field label="Cost source as of">
          <input
            type="date"
            value={asOf}
            max={decisionDate(s)}
            onChange={(e) => setAsOf(e.target.value)}
          />
        </Field>
      </div>
      <button className="button secondary" onClick={attach}>
        Attach source to base costs
      </button>
      {notice && (
        <p className="source-notice" role="status">
          {notice}
        </p>
      )}
    </div>
  );
}
