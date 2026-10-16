import { useState } from 'react';
import type { Shipment } from '../lib/types';
import { nhcExposure, type NHCSummary } from '../lib/nhc';
import { conditionalDelayCost, type DelayScenario } from '../lib/quakeExposure';
import { usd } from '../lib/format';

export default function NHCPanel({
  storm,
  shipments,
  onReview,
}: {
  storm: NHCSummary;
  shipments: Shipment[];
  onReview: (shipmentId: string, storm: NHCSummary, scenario: DelayScenario) => void;
}) {
  const [shipmentId, setShipmentId] = useState(
    () =>
      shipments.find((s) => nhcExposure(storm, s).state === 'possible')?.id ??
      shipments[0]?.id ??
      '',
  );
  const [days, setDays] = useState('');
  const [daily, setDaily] = useState('');
  const [handling, setHandling] = useState('');
  const parsedDays = days === '' ? null : Number(days);
  const parsedDaily = daily === '' ? null : Math.round(Number(daily) * 100);
  const parsedHandling = handling === '' ? null : Math.round(Number(handling) * 100);
  const cost = conditionalDelayCost(parsedDays, parsedDaily, parsedHandling);
  const selected = shipments.find((s) => s.id === shipmentId);
  const match = selected ? nhcExposure(storm, selected) : null;
  return (
    <div className="event-body" data-testid="nhc-detail">
      <h2>
        {storm.name} · NHC advisory {storm.advisoryNumber}
      </h2>
      <p>
        Official NOAA/National Hurricane Center forecast advisory issued {storm.issuedAt}. Current
        summary updated {storm.lastUpdate}. Basin: {storm.basin}; classification:{' '}
        {storm.classification}.{' '}
        {storm.cone
          ? `The version-checked official cone covers the storm center's ${storm.cone.forecastHours}-hour forecast uncertainty.`
          : 'Forecast cone geometry is unavailable or failed validation.'}
      </p>
      <p>
        <a href={storm.advisoryUrl} target="_blank" rel="noreferrer">
          Read NHC forecast advisory
        </a>
        {storm.coneKmzUrl && (
          <>
            {' '}
            ·{' '}
            <a href={storm.coneKmzUrl} target="_blank" rel="noreferrer">
              Official cone KMZ
            </a>
          </>
        )}
        {storm.trackKmzUrl && (
          <>
            {' '}
            ·{' '}
            <a href={storm.trackKmzUrl} target="_blank" rel="noreferrer">
              Official track KMZ
            </a>
          </>
        )}
      </p>
      <p>
        The cone represents uncertainty in the forecast storm-center track. It does not show full
        wind, rainfall or surge extent, port closure odds, or a customer's actual route. Always
        review official warnings and carrier status.
      </p>
      <h3>Known shipment locations</h3>
      <ul className="exposure-list">
        {shipments.map((shipment) => {
          const result = nhcExposure(storm, shipment);
          return (
            <li
              className="exposure-row"
              key={shipment.id}
              data-testid={`nhc-exposure-${shipment.id}`}
            >
              <strong>{shipment.name}</strong>
              <span className="relationship-tag">
                {result.state === 'possible'
                  ? 'Possible forecast-area overlap'
                  : result.state === 'outside_cone'
                    ? 'Outside cone only'
                    : 'Exposure unknown'}
              </span>
              <p>{result.reason}</p>
            </li>
          );
        })}
      </ul>
      <h3>Conditional impact</h3>
      <p>
        Enter your own operational delay and costs. This is a scenario, not an NHC estimate of port
        effects or event probability.
      </p>
      <div className="form-grid">
        <label>
          Shipment
          <select
            aria-label="Forecast impact shipment"
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
            aria-label="Forecast additional delay days"
            type="number"
            min={0}
            max={365}
            step={1}
            value={days}
            onChange={(e) => setDays(e.target.value)}
          />
        </label>
        <label>
          Inventory or stockout cost per day ($)
          <input
            aria-label="Forecast delay cost per day"
            type="number"
            min={0}
            step="0.01"
            value={daily}
            onChange={(e) => setDaily(e.target.value)}
          />
        </label>
        <label>
          Additional handling or expediting ($)
          <input
            aria-label="Forecast additional handling cost"
            type="number"
            min={0}
            step="0.01"
            value={handling}
            onChange={(e) => setHandling(e.target.value)}
          />
        </label>
      </div>
      <p data-testid="nhc-conditional-cost">
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
        disabled={cost === null || match?.state !== 'possible'}
        onClick={() =>
          cost !== null &&
          onReview(shipmentId, storm, {
            assumedDelayDays: parsedDays!,
            dailyCostCents: parsedDaily!,
            handlingCents: parsedHandling!,
            impactCents: cost,
          })
        }
      >
        Review shipment decisions
      </button>
      {match?.state !== 'possible' && (
        <p className="quiet-caption">
          A validated official cone and known asset overlap are required to link this advisory to a
          shipment. Outside the cone does not rule out other storm hazards.
        </p>
      )}
    </div>
  );
}
