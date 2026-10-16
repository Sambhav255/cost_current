import { useState } from 'react';
import type { Shipment } from '../lib/types';

export default function KnownAssetEditor({
  shipment,
  onSave,
}: {
  shipment: Shipment;
  onSave: (asset: Shipment['knownAsset']) => void;
}) {
  const [type, setType] = useState<'port' | 'supplier_site'>(shipment.knownAsset?.type ?? 'port');
  const [name, setName] = useState(shipment.knownAsset?.name ?? '');
  const [latitude, setLatitude] = useState(shipment.knownAsset?.latitude?.toString() ?? '');
  const [longitude, setLongitude] = useState(shipment.knownAsset?.longitude?.toString() ?? '');
  const lat = Number(latitude),
    lng = Number(longitude);
  const valid =
    name.trim().length > 0 &&
    latitude.trim() !== '' &&
    longitude.trim() !== '' &&
    Number.isFinite(lat) &&
    Math.abs(lat) <= 90 &&
    Number.isFinite(lng) &&
    Math.abs(lng) <= 180;
  return (
    <div className="known-asset-editor">
      <h3>Known port or supplier site</h3>
      <p>
        Enter coordinates you have confirmed. A nearby earthquake is only a screening match. No
        location is inferred from a company name.
      </p>
      {shipment.knownAsset?.source === 'reviewed_demo' && (
        <p className="quiet-caption">Current location is a fictional test asset.</p>
      )}
      <div className="form-grid">
        <label>
          Asset type
          <select
            value={type}
            onChange={(e) => setType(e.target.value as 'port' | 'supplier_site')}
          >
            <option value="port">Port</option>
            <option value="supplier_site">Supplier site</option>
          </select>
        </label>
        <label>
          Asset name
          <input
            aria-label="Known asset name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label>
          Latitude
          <input
            aria-label="Known asset latitude"
            type="number"
            min={-90}
            max={90}
            step="any"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
          />
        </label>
        <label>
          Longitude
          <input
            aria-label="Known asset longitude"
            type="number"
            min={-180}
            max={180}
            step="any"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
          />
        </label>
      </div>
      <div className="button-row">
        <button
          type="button"
          className="button secondary"
          disabled={!valid}
          onClick={() =>
            onSave({
              type,
              name: name.trim(),
              latitude: lat,
              longitude: lng,
              source: 'customer_confirmed',
            })
          }
        >
          Confirm location
        </button>
        {shipment.knownAsset && (
          <button type="button" className="text-button" onClick={() => onSave(undefined)}>
            Remove location
          </button>
        )}
      </div>
    </div>
  );
}
