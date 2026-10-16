import { useState } from 'react';
import type { Shipment } from '../lib/types';
import { conditionalDelayCost, quakeExposure, type DelayScenario } from '../lib/quakeExposure';
import type { ObservedEarthquake } from '../lib/usgs';
import { usd } from '../lib/format';

export default function EarthquakePanel({
  event,
  shipments,
  onReview,
}: {
  event: ObservedEarthquake;
  shipments: Shipment[];
  onReview: (shipmentId: string, event: ObservedEarthquake, scenario: DelayScenario) => void;
}) {
  const [days, setDays] = useState('');
  const [daily, setDaily] = useState('');
  const [handling, setHandling] = useState('');
  const [shipmentId, setShipmentId] = useState(
    () =>
      shipments.find((s) => quakeExposure(event, s).state === 'possible')?.id ??
      shipments[0]?.id ??
      '',
  );
  const parsedDays = days === '' ? null : Number(days);
  const parsedDaily = daily === '' ? null : Math.round(Number(daily) * 100);
  const parsedHandling = handling === '' ? null : Math.round(Number(handling) * 100);
  const cost = conditionalDelayCost(parsedDays, parsedDaily, parsedHandling);
  const exposures = shipments.map((shipment) => ({
    shipment,
    match: quakeExposure(event, shipment),
  }));
  const selectedMatch = exposures.find((row) => row.shipment.id === shipmentId)?.match;
  return (
    <div className="event-body" data-testid="earthquake-detail">
      <h2>{event.title}</h2>
      <p className="quiet-caption">
        {event.sourceMode === 'observed'
          ? 'Observed report · U.S. Geological Survey (USGS)'
          : 'Fictional USGS-like test event · never part of the official feed'}
      </p>
      <dl className="event-facts">
        <div>
          <dt>Magnitude / depth</dt>
          <dd>
            {event.magnitude === null ? 'Magnitude unavailable' : `M${event.magnitude.toFixed(1)}`}{' '}
            · {event.depthKm === null ? 'depth unavailable' : `${event.depthKm} km deep`}
          </dd>
        </div>
        <div>
          <dt>Origin time</dt>
          <dd>{event.eventTime}</dd>
        </div>
        <div>
          <dt>USGS update</dt>
          <dd>{event.updatedAt}</dd>
        </div>
        <div>
          <dt>Retrieved</dt>
          <dd>{event.retrievedAt}</dd>
        </div>
        <div>
          <dt>Point</dt>
          <dd>
            {event.latitude.toFixed(3)}, {event.longitude.toFixed(3)} · reported epicenter, not
            damage extent
          </dd>
        </div>
      </dl>
      {event.sourceUrl && (
        <p>
          <a href={event.sourceUrl} target="_blank" rel="noreferrer">
            Open USGS event record
          </a>
        </p>
      )}
      <p>
        Reports may be revised. Nearby coordinates indicate possible relevance only; physical
        damage, port operations, customer vessel and delay remain unverified.
      </p>
      <h3>Known shipment locations</h3>
      <ul className="exposure-list">
        {exposures.map(({ shipment, match }) => (
          <li
            className="exposure-row"
            key={shipment.id}
            data-testid={`quake-exposure-${shipment.id}`}
          >
            <strong>{shipment.name}</strong>
            <span className="relationship-tag">
              {match.state === 'possible'
                ? 'Possible — confirm operations'
                : match.state === 'unknown'
                  ? 'No verified location'
                  : 'Outside screening radius'}
            </span>
            <p>{match.reason}</p>
          </li>
        ))}
      </ul>
      <h3>Conditional impact</h3>
      <p>
        Enter your own operational assumption to see incremental dollars. This does not change the
        existing tariff/freight odds or predict an earthquake loss.
      </p>
      <div className="form-grid">
        <label>
          Shipment
          <select
            aria-label="Impact shipment"
            value={shipmentId}
            onChange={(e) => setShipmentId(e.target.value)}
          >
            {shipments.map((shipment) => (
              <option key={shipment.id} value={shipment.id}>
                {shipment.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Additional delay days
          <input
            aria-label="Additional delay days"
            type="number"
            min={0}
            max={365}
            step={1}
            value={days}
            onChange={(e) => setDays(e.target.value)}
            placeholder="Enter days"
          />
        </label>
        <label>
          Inventory or stockout cost per day ($)
          <input
            aria-label="Delay cost per day"
            type="number"
            min={0}
            step="0.01"
            value={daily}
            onChange={(e) => setDaily(e.target.value)}
            placeholder="Enter cost"
          />
        </label>
        <label>
          Additional handling or expediting ($)
          <input
            aria-label="Additional handling cost"
            type="number"
            min={0}
            step="0.01"
            value={handling}
            onChange={(e) => setHandling(e.target.value)}
            placeholder="Enter cost"
          />
        </label>
      </div>
      <p data-testid="conditional-delay-cost">
        Conditional incremental cost:{' '}
        <strong>{cost === null ? 'Needs your assumptions' : usd(cost)}</strong>
        {cost !== null && (
          <span>
            {' '}
            = {days} days × {usd(parsedDaily!)} per day + {usd(parsedHandling!)} handling
          </span>
        )}
      </p>
      <button
        type="button"
        className="button primary"
        disabled={cost === null || !selectedMatch || selectedMatch.state !== 'possible'}
        onClick={() =>
          cost !== null &&
          onReview(shipmentId, event, {
            assumedDelayDays: parsedDays!,
            dailyCostCents: parsedDaily!,
            handlingCents: parsedHandling!,
            impactCents: cost,
          })
        }
      >
        Review shipment decisions
      </button>
      {selectedMatch?.state !== 'possible' && (
        <p className="quiet-caption">
          Confirm a known location within the screening radius before linking this event to a
          shipment decision.
        </p>
      )}
    </div>
  );
}
