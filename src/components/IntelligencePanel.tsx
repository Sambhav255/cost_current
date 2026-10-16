import { ArrowRight } from 'lucide-react';
import { getEvent, probabilityFor } from '../lib/riskEvents';
import {
  conditionalImpact,
  exposuresForEvent,
  relationshipLabel,
  statusLabel,
} from '../lib/riskExposure';
import { dateLabel, percent, usd } from '../lib/format';
import type { Shipment } from '../lib/types';
import { Eyebrow, SectionHeading } from './ui';

function likelihoodLabel(eventId: string): { value: string; detail: string } {
  const signal = probabilityFor(eventId);
  if (!signal) return { value: 'Not available', detail: 'No probability signal attached.' };
  if (signal.probabilityBps === null) {
    return {
      value: 'Not available',
      detail: signal.limitations[0] ?? 'Automatic occurrence odds are not wired for this event.',
    };
  }
  return {
    value: percent(signal.probabilityBps / 10000),
    detail: `${signal.sourceType.replace(/_/g, ' ')} · ${signal.status.replace(/_/g, ' ')} · not a live forecast`,
  };
}

function signalStatusLabel(status: string): string {
  switch (status) {
    case 'illustrative':
      return 'Illustrative assumption';
    case 'unavailable':
      return 'Not available';
    case 'observed_official':
      return 'Official observation';
    case 'observed_market_quote':
      return 'Market quote';
    case 'model_estimate':
      return 'Model estimate';
    case 'stale':
      return 'Stale';
    default:
      return status;
  }
}

export default function IntelligencePanel({
  shipments,
  selectedEventId,
  onSelectShipment,
  onOpenDecisions,
}: {
  shipments: Shipment[];
  selectedEventId: string;
  onSelectShipment: (id: string) => void;
  onOpenDecisions: (shipmentId: string, eventId: string) => void;
}) {
  const event = getEvent(selectedEventId);
  if (!event) {
    return (
      <p className="notice" data-testid="event-detail">
        No event selected.
      </p>
    );
  }
  const likelihood = likelihoodLabel(event.id);
  const signal = probabilityFor(event.id);
  const exposures = exposuresForEvent(event, shipments);
  const ranked = [...exposures].sort((a, b) => {
    const order = { reviewed: 0, confirmed: 1, possible: 2, unknown: 3, not_applicable: 4 };
    return (order[a.relationship] ?? 5) - (order[b.relationship] ?? 5);
  });

  return (
    <div className="event-body" data-testid="event-detail">
      <SectionHeading
        title={event.name}
        description={`${event.kind.replace(/_/g, ' ')} · illustrative demo scenario`}
      />
      <dl className="event-facts">
        <div>
          <dt>Definition</dt>
          <dd>{event.definition}</dd>
        </div>
        <div>
          <dt>Horizon</dt>
          <dd>
            {dateLabel(event.horizonStart)} → {dateLabel(event.horizonEnd)}
          </dd>
        </div>
        <div>
          <dt>Observed as of</dt>
          <dd>{dateLabel(event.observedAsOf)}</dd>
        </div>
        <div>
          <dt>Likelihood status</dt>
          <dd>
            <strong>{likelihood.value}</strong>
            <span className="quiet-caption">{likelihood.detail}</span>
            {signal && <span className="source-tag">{signalStatusLabel(signal.status)}</span>}
          </dd>
        </div>
        <div>
          <dt>Legal / operating status</dt>
          <dd>{event.legalOrOperatingStatus}</dd>
        </div>
      </dl>
      {event.evidenceSummary.length > 0 && (
        <ul className="event-evidence">
          {event.evidenceSummary.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      )}
      <SectionHeading
        title="Your exposure"
        description="Match status is explicit. Conditional dollars assume the event occurs; they are not probability-weighted totals."
      />
      <ul className="exposure-list">
        {ranked.map((link) => {
          const shipment = shipments.find((s) => s.id === link.shipmentId)!;
          const impact = conditionalImpact(event, shipment, link);
          const exposed = link.relationship === 'reviewed' || link.relationship === 'confirmed';
          return (
            <li
              key={link.shipmentId}
              className={`exposure-row ${link.relationship}`}
              data-testid={`exposure-row-${link.shipmentId}`}
            >
              <div className="exposure-row-main">
                <button
                  type="button"
                  className="text-button exposure-name"
                  onClick={() => onSelectShipment(link.shipmentId)}
                >
                  {shipment.name}
                </button>
                <span
                  className="relationship-tag"
                  data-testid={`exposure-status-${link.shipmentId}`}
                >
                  {relationshipLabel(link.relationship)}
                </span>
              </div>
              <p className="exposure-rationale">{link.rationale}</p>
              <div className="exposure-impact">
                <span>
                  Conditional extra cost:{' '}
                  {impact.estimatedExtraCostCents !== null
                    ? usd(impact.estimatedExtraCostCents)
                    : 'Not available'}
                </span>
                <span className="quiet-caption">{statusLabel(impact.estimateStatus)}</span>
              </div>
              {exposed && (
                <button
                  type="button"
                  className="button secondary"
                  data-testid={`explore-options-${link.shipmentId}`}
                  onClick={() => onOpenDecisions(link.shipmentId, event.id)}
                >
                  Explore options <ArrowRight size={14} />
                </button>
              )}
            </li>
          );
        })}
      </ul>
      <div className="quiet-caption">
        <Eyebrow>ILLUSTRATIVE REGISTRY</Eyebrow> Events are curated demo scenarios. Unsupported odds
        stay unavailable; conditional impacts use your shipment inputs.
      </div>
    </div>
  );
}
