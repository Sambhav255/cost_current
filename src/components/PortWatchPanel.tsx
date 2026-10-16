import { PORTWATCH_LAYER_URL, PORTWATCH_RIGHTS_STATUS, PORTWATCH_TARGET } from '../lib/portwatch';
import type { Shipment } from '../lib/types';
import { SectionHeading } from './ui';

export default function PortWatchPanel({ shipments }: { shipments: Shipment[] }) {
  const reviewed = shipments.filter(
    (shipment) =>
      shipment.routeEvidence?.corridorId === 'suez-red-sea' &&
      shipment.routeEvidence.state === 'known_traverses',
  );
  return (
    <div className="panel" data-testid="portwatch-status">
      <SectionHeading
        title="Suez transit-count research"
        description="IMF PortWatch · container vessels per day"
      />
      <p>
        <strong>Data status: {PORTWATCH_RIGHTS_STATUS.replace('_', ' ')}.</strong> No PortWatch time
        series is ingested or displayed here.
      </p>
      <p>
        Proposed measurable target: {PORTWATCH_TARGET}. Actual backtest scores and current anomaly
        flags are unavailable until source rights and dated observation vintages are established.
      </p>
      <p>
        The public layer identifies daily counts but does not state when each value or revision
        became available. A current final series cannot establish what a model would have known on
        an earlier day.
      </p>
      <p>
        <a href={PORTWATCH_LAYER_URL} target="_blank" rel="noreferrer">
          Official ArcGIS layer metadata
        </a>{' '}
        ·{' '}
        <a
          href="https://www.imf.org/en/About/copyright-and-terms."
          target="_blank"
          rel="noreferrer"
        >
          IMF usage terms
        </a>
      </p>
      <h3>Route relevance</h3>
      {reviewed.length ? (
        <p>
          {reviewed.map((shipment) => shipment.name).join(', ')} has a reviewed Suez itinerary in
          this workspace. This only establishes corridor relevance; aggregate vessel counts do not
          identify a customer container or predict its delay.
        </p>
      ) : (
        <p>
          No saved shipment has a reviewed Suez itinerary. Other routes remain unknown until
          confirmed.
        </p>
      )}
    </div>
  );
}
