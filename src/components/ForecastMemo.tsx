import type { ForecastMemoSnapshot } from '../lib/types';
import { usd } from '../lib/format';
import { Brand } from './ui';
export default function ForecastMemo({
  snapshot,
  onBack,
  onRefresh,
}: {
  snapshot: ForecastMemoSnapshot;
  onBack: () => void;
  onRefresh: () => void;
}) {
  const { forecast: f, shipment: s } = snapshot;
  function download() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' }),
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = `cost-current-${s.id}-forecast-memo.json`;
    link.click();
    URL.revokeObjectURL(url);
  }
  return (
    <>
      <div className="memo-controls button-row">
        <button className="button secondary" onClick={onBack}>
          Back
        </button>
        <button className="button primary" onClick={() => window.print()}>
          Print / Save PDF
        </button>
        <button className="button secondary" onClick={download}>
          Download assumptions
        </button>
        <button className="button secondary" onClick={onRefresh}>
          Refresh snapshot
        </button>
      </div>
      <article className="memo-paper forecast-memo" data-testid="decision-memo">
        <header className="memo-header">
          <Brand small />
          <div>
            <span>FORECAST EVIDENCE MEMO</span>
            <small>{f.status.toUpperCase()} · NOT A TRAINED FORECAST</small>
          </div>
        </header>
        <div className="memo-title">
          <div>
            <h1>{s.name}</h1>
            <p>
              {snapshot.route.origin} → {snapshot.route.destination} · {s.originCountry} origin
            </p>
          </div>
        </div>
        <p>
          Entered base landed cost: <strong>{usd(snapshot.baseCents)}</strong>. This includes
          supplied duty assumptions; legal applicability is unverified.
        </p>
        <p>
          Freight baseline:{' '}
          <strong>
            {f.rateCentsPerFeu === null ? 'Unavailable' : usd(f.rateCentsPerFeu) + ' / FEU'}
          </strong>{' '}
          · {f.provenance}.
        </p>
        <p>
          Source: {f.source ?? 'No observations'}. Basis: {f.quoteBasis ?? 'Unknown'}.
        </p>
        <p>
          Target: ocean freight USD/FEU on {f.laneId}. Horizon: {f.horizonStart} → {f.horizonEnd}.
          Method: {f.modelId} v{f.modelVersion}.
        </p>
        <p>
          Observed: {f.observedAt ?? 'Unknown'}. Retrieved: {f.retrievedAt ?? 'Unknown'}. As of:{' '}
          {f.asOf}. Generated: {f.generatedAt}.
        </p>
        <p>
          Source IDs: {f.featureSourceIds.join(', ') || 'None'}. Rights declaration:{' '}
          {f.rightsReference ?? 'Unknown'}. The JSON preserves the eligible input history.
        </p>
        <p>{f.uncertaintyNote}</p>
        <p>
          Automatic tariff probability: unavailable. Automatic freight-event probability:
          unavailable. No automatic action recommendation. Manual shipment probabilities in the JSON
          are stored What if? inputs and did not generate this baseline.
        </p>
        <p>
          Rate sensitivity inputs are exploratory and are not part of this frozen forecast memo.
        </p>
        <footer className="memo-footer">
          <p>
            Captured {snapshot.timestamp}. Illustrative observations, when selected, are fictional.
            No ML accuracy, uncertainty coverage, live quote or complete duty claim.
          </p>
        </footer>
      </article>
    </>
  );
}
