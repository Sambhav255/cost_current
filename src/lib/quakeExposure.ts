import type { Shipment } from './types';
import type { ObservedEarthquake } from './usgs';

export interface DelayScenario {
  assumedDelayDays: number;
  dailyCostCents: number;
  handlingCents: number;
  impactCents: number;
}

const radians = (degrees: number) => (degrees * Math.PI) / 180;
export function distanceKm(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
): number {
  const lat = radians(b.latitude - a.latitude);
  const lng = radians(((b.longitude - a.longitude + 540) % 360) - 180);
  const h =
    Math.sin(lat / 2) ** 2 +
    Math.cos(radians(a.latitude)) * Math.cos(radians(b.latitude)) * Math.sin(lng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.min(1, Math.sqrt(h)));
}
export interface QuakeExposure {
  shipmentId: string;
  state: 'possible' | 'outside_screen' | 'unknown';
  distanceKm: number | null;
  reason: string;
}
export function quakeExposure(
  event: ObservedEarthquake,
  shipment: Shipment,
  radiusKm = 100,
): QuakeExposure {
  const asset = shipment.knownAsset;
  if (!asset)
    return {
      shipmentId: shipment.id,
      state: 'unknown',
      distanceKm: null,
      reason: 'No user-confirmed or explicitly fictional test port/site coordinates.',
    };
  const distance = distanceKm(event, asset);
  return {
    shipmentId: shipment.id,
    state: distance <= radiusKm ? 'possible' : 'outside_screen',
    distanceKm: distance,
    reason: `${asset.name} (${asset.type === 'port' ? 'port' : 'supplier site'}, ${asset.source === 'reviewed_demo' ? 'fictional test asset' : 'customer-confirmed coordinates'}) is ${distance.toFixed(1)} km from the reported epicenter. A ${radiusKm} km screening radius does not establish damage, port closure, shipment delay or actual itinerary.`,
  };
}
export function conditionalDelayCost(
  days: number | null,
  dailyCents: number | null,
  handlingCents: number | null,
): number | null {
  if (
    days === null ||
    dailyCents === null ||
    handlingCents === null ||
    !Number.isInteger(days) ||
    days < 0 ||
    days > 365 ||
    !Number.isSafeInteger(dailyCents) ||
    dailyCents < 0 ||
    !Number.isSafeInteger(handlingCents) ||
    handlingCents < 0
  )
    return null;
  const total = days * dailyCents + handlingCents;
  return Number.isSafeInteger(total) ? total : null;
}
