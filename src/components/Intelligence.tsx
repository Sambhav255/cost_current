import { Radar } from 'lucide-react';
import { routes } from '../lib/data';
import { listDemoEvents, probabilityFor, zonesForEvent } from '../lib/riskEvents';
import { dateLabel, percent } from '../lib/format';
import { exposuresForEvent } from '../lib/riskExposure';
import type { Shipment } from '../lib/types';
import RouteGlobe from './RouteGlobe';
import { Eyebrow, SectionHeading } from './ui';
import IntelligencePanel from './IntelligencePanel';

function likelihoodShort(eventId: string): string {
  const signal = probabilityFor(eventId);
  if (!signal || signal.probabilityBps === null) return 'Odds: Not available';
  return `Assumption ${percent(signal.probabilityBps / 10000)}`;
}

export default function Intelligence({
  shipments,
  selectedEventId,
  onSelectEvent,
  onSelectShipment,
  onOpenDecisions,
  onOpenExposure,
}: {
  shipments: Shipment[];
  selectedEventId: string;
  onSelectEvent: (id: string) => void;
  onSelectShipment: (id: string) => void;
  onOpenDecisions: (shipmentId: string, eventId: string) => void;
  onOpenExposure: () => void;
}) {
  const events = listDemoEvents();
  const event = events.find((e) => e.id === selectedEventId) ?? events[0];
  const zones = event ? zonesForEvent(event) : [];
  const focusShipment = event
    ? exposuresForEvent(event, shipments).find((link) =>
        ['confirmed', 'reviewed'].includes(link.relationship),
      )
    : undefined;
  const focusRoute = shipments.find((s) => s.id === focusShipment?.shipmentId)?.routeId ?? '';

  return (
    <>
      <div className="page-heading">
        <div>
          <Eyebrow>
            <Radar size={14} /> PREDICTIVE INTELLIGENCE · DEMO
          </Eyebrow>
          <h1>Supply-chain risks worth watching</h1>
          <p>
            What could change, who is exposed, and how it might matter — before you open a
            spreadsheet.
          </p>
        </div>
        <div className="button-row">
          <button type="button" className="button secondary" onClick={onOpenExposure}>
            My exposure
          </button>
        </div>
      </div>
      <div className="intelligence-grid">
        <aside className="intelligence-events">
          <SectionHeading
            title="Watchlist"
            description="Curated illustrative disruptions. None are live feeds."
          />
          <ul className="event-list">
            {events.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={item.id === selectedEventId ? 'event-card active' : 'event-card'}
                  data-testid={`event-card-${item.id}`}
                  onClick={() => onSelectEvent(item.id)}
                >
                  <span className="event-card-kind">{item.kind.replace(/_/g, ' ')}</span>
                  <strong>{item.name}</strong>
                  <span className="event-card-meta">
                    {dateLabel(item.horizonStart)} – {dateLabel(item.horizonEnd)}
                  </span>
                  <span className="event-card-odds">{likelihoodShort(item.id)}</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>
        <div className="intelligence-detail">
          <IntelligencePanel
            shipments={shipments}
            selectedEventId={selectedEventId}
            onSelectShipment={onSelectShipment}
            onOpenDecisions={onOpenDecisions}
          />
        </div>
        <div className="intelligence-map">
          <SectionHeading
            title="Geographic context"
            description="Schematic lanes and illustrative watch locations — not vessel tracks or hazard boundaries."
          />
          <RouteGlobe
            routes={routes}
            selected={focusRoute}
            onSelect={(routeId) => {
              const match = shipments.find((s) => s.routeId === routeId);
              if (match) onSelectShipment(match.id);
            }}
            compact
            eventZones={zones}
          />
        </div>
      </div>
    </>
  );
}
