import { useMemo, useState } from 'react';
import type { ForecastSnapshot, FreightSeries } from '../lib/forecast';
import { evaluateBaseline, exampleSeries, mapFreightExposure, parseSeries } from '../lib/forecast';
import type { Shipment, ValidAnalysis } from '../lib/types';
import { usd } from '../lib/format';
import { CostLedger } from './CostLedger';
import { Field, NumberInput, SectionHeading } from './ui';

export default function Forecast({
  s,
  a,
  forecast: f,
  series,
  onSeries,
  onRefresh,
  onHorizon,
  onManual,
  onMemo,
  notice,
}: {
  s: Shipment;
  a: ValidAnalysis;
  forecast: ForecastSnapshot;
  series: FreightSeries | null;
  onSeries: (series: FreightSeries | null) => void;
  onRefresh: () => void;
  onHorizon: (days: 28 | 56) => void;
  onManual: () => void;
  onMemo: () => void;
  notice: string;
}) {
  const [error, setError] = useState('');
  const [containers, setContainers] = useState(NaN);
  const [reference, setReference] = useState(NaN);
  const [spotBps, setSpotBps] = useState(10000);
  const [confirmed, setConfirmed] = useState(false);
  const delta =
    confirmed && f.rateCentsPerFeu !== null
      ? mapFreightExposure(f.rateCentsPerFeu, reference, containers, spotBps)
      : null;
  const evaluation = useMemo(
    () =>
      series && series.laneId === s.routeId
        ? evaluateBaseline(series, f.asOf, f.horizonDays)
        : null,
    [series, s.routeId, f.asOf, f.horizonDays],
  );
  async function readFile(file?: File) {
    if (!file) return;
    try {
      if (file.size > 500_000) throw new Error('Series must be at most 500 KB.');
      onSeries(parseSeries(await file.text()));
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Signal import failed.');
    }
  }
  return (
    <>
      <section className="panel form-panel forecast-panel" aria-label="Automatic forecast">
        <SectionHeading
          title="Freight baseline & evidence"
          description="System output from a dated local series. No live data service is connected."
        />
        <div className="button-row">
          <button className="button secondary" onClick={onRefresh}>
            Refresh signals
          </button>
          <Field label="Forecast horizon">
            <select
              value={f.horizonDays}
              onChange={(e) => onHorizon(Number(e.target.value) as 28 | 56)}
            >
              <option value="28">4 weeks</option>
              <option value="56">8 weeks</option>
            </select>
          </Field>
        </div>
        <p role="status" aria-label="Signal refresh status">
          {notice}
        </p>
        {error && <p role="alert">{error}</p>}
        <dl className="shipment-facts forecast-facts">
          <div>
            <dt>Status</dt>
            <dd>{f.status}</dd>
          </div>
          <div>
            <dt>Target</dt>
            <dd>Ocean freight · USD per FEU · {f.laneId}</dd>
          </div>
          <div>
            <dt>Baseline estimate</dt>
            <dd>
              {f.rateCentsPerFeu === null ? 'Unavailable' : usd(f.rateCentsPerFeu) + ' / FEU'}
            </dd>
          </div>
          <div>
            <dt>Horizon</dt>
            <dd>
              {f.horizonStart} → {f.horizonEnd}
            </dd>
          </div>
          <div>
            <dt>Source</dt>
            <dd>{f.source ?? 'No relevant observations'}</dd>
          </div>
          <div>
            <dt>Source state</dt>
            <dd>{f.provenance}</dd>
          </div>
          <div>
            <dt>Observed / retrieved</dt>
            <dd>
              {f.observedAt ?? 'Unknown'} / {f.retrievedAt ?? 'Unknown'}
            </dd>
          </div>
          <div>
            <dt>As of / generated</dt>
            <dd>
              {f.asOf} / {f.generatedAt}
            </dd>
          </div>
          <div>
            <dt>Method</dt>
            <dd>
              {f.modelId} v{f.modelVersion} · not trained
            </dd>
          </div>
          <div>
            <dt>Quote basis</dt>
            <dd>{f.quoteBasis ?? 'Unknown'}</dd>
          </div>
          <div>
            <dt>Feature source IDs</dt>
            <dd>{f.featureSourceIds.join(', ') || 'None'}</dd>
          </div>
        </dl>
        {f.rateCentsPerFeu === null && (
          <p>No defensible automatic estimate available for this lane/event.</p>
        )}
        <p>{f.uncertaintyNote}</p>
        {f.provenance === 'illustrative' && (
          <p className="notice">
            Illustrative automated baseline · fictional observations · not trained or validated.
          </p>
        )}
        <div className="form-grid">
          <Field label="Tariff probability output">
            <output>Unavailable — {f.tariff.targetDefinition}</output>
          </Field>
          <Field label="Freight event probability output">
            <output>Unavailable — {f.freight.targetDefinition}</output>
          </Field>
        </div>
        <p>
          {f.tariff.uncertaintyNote} No automatic action ranking is available. Lane context is not
          assigned to alternative suppliers or routes.
        </p>
        <p>
          Market relevance: no mapped contract. Related trade headlines cannot set shipment duty
          risk.
        </p>
        <div className="button-row">
          <button className="button primary" onClick={onManual}>
            Use What if?
          </button>
          <button className="button secondary" onClick={onMemo}>
            Create forecast memo
          </button>
        </div>
        <details className="alternative-panel">
          <summary>Import observations or preview a fictional baseline</summary>
          <p>
            JSON only, up to 520 observations / 500 KB. Eight weekly usable observations spanning at
            least 42 days are required; gaps over 10 days block output. Display permission is your
            declaration, not independent rights verification. Processing stays in this browser.
          </p>
          <Field label="Freight observations JSON">
            <input
              type="file"
              accept=".json,application/json"
              onChange={(e) => {
                void readFile(e.target.files?.[0]);
                e.target.value = '';
              }}
            />
          </Field>
          <div className="button-row">
            <button className="button secondary" onClick={() => onSeries(exampleSeries())}>
              Load fictional observations
            </button>
            <button
              className="button secondary"
              onClick={() => {
                const url = URL.createObjectURL(
                  new Blob([JSON.stringify(exampleSeries(), null, 2)], {
                    type: 'application/json',
                  }),
                );
                const link = document.createElement('a');
                link.href = url;
                link.download = 'fictional-freight-observations.json';
                link.click();
                URL.revokeObjectURL(url);
              }}
            >
              Download JSON template
            </button>
            <button className="button secondary" onClick={() => onSeries(null)}>
              Clear observations
            </button>
          </div>
          {series && (
            <p>
              Rights reference: {series.rightsReference}. Imported observations are stored
              separately from editable shipment assumptions.
            </p>
          )}
        </details>
      </section>
      <section className="panel form-panel">
        <SectionHeading
          title="Rate sensitivity, separate from event odds"
          description="This calculation does not change the scenario engine or rank actions."
        />
        <div className="form-grid">
          <Field label="Forty-foot containers">
            <NumberInput
              label="Forty-foot containers"
              value={containers}
              onChange={setContainers}
              min={1}
              max={10000}
            />
          </Field>
          <Field label="Comparable reference rate per FEU">
            <NumberInput
              label="Comparable reference rate per FEU"
              value={reference / 100}
              onChange={(v) => setReference(Math.round(v * 100))}
              prefix="$"
              step={0.01}
            />
          </Field>
          <Field label="Spot exposed share">
            <NumberInput
              label="Spot exposed share"
              value={spotBps / 100}
              onChange={(v) => setSpotBps(Math.round(v * 100))}
              suffix="%"
              max={100}
            />
          </Field>
        </div>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
          />
          I confirm the container count, rate inclusions and contractual spot exposure are
          comparable.
        </label>
        <p>
          Incremental freight sensitivity:{' '}
          <strong>
            {delta === null ? 'Needs rate and comparable contract inputs' : usd(delta)}
          </strong>
          . Confirmed fixed contracts (0% spot exposure) have zero direct sensitivity. This is a
          user-assumed pass-through calculation, not a booked invoice or landed-cost forecast.
        </p>
        <p>
          Time-ordered last-observation evaluation:{' '}
          {evaluation?.count
            ? `${evaluation.count} held-out targets; MAE ${usd(evaluation.maeCentsPerFeu!)} / FEU. ${series?.provenance === 'illustrative' ? 'Fictional data only.' : 'Supplied data, not independently verified.'}`
            : 'Not evaluated — insufficient eligible held-out targets.'}{' '}
          No ML comparison or interval coverage is claimed.
        </p>
      </section>
      <CostLedger analysis={a} />
    </>
  );
}
