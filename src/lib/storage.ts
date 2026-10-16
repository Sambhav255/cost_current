import { validateCostDetails } from './ledger';
import { isIsoDate } from './evidence';
import { freshSamples } from './data';
import type { Shipment } from './types';
const KEY = 'cost-current-demo-v1';
function compatible(value: unknown): value is Shipment[] {
  if (!Array.isArray(value) || value.length === 0 || value.length > 25) return false;
  const sample = freshSamples()[0];
  return (
    new Set(value.map((s) => s?.id)).size === value.length &&
    value.every(
      (s) =>
        s &&
        Object.entries(sample).every(
          ([k, v]) =>
            ((k === 'routeEvidence' || k === 'knownAsset') && s[k] === undefined) ||
            (typeof s[k] === typeof v && (typeof v !== 'number' || Number.isFinite(s[k]))),
        ) &&
        (s.scenarioOverride === undefined ||
          (s.scenarioOverride &&
            [s.scenarioOverride.originalTariffBps, s.scenarioOverride.originalFreightBps].every(
              (n: unknown) => typeof n === 'number' && Number.isInteger(n) && n >= 0 && n <= 10000,
            ) &&
            typeof s.scenarioOverride.capturedAt === 'string' &&
            s.scenarioOverride.originalForecast?.modelId === 'last-observation')) &&
        (s.routeEvidence === undefined ||
          (typeof s.routeEvidence.corridorId === 'string' &&
            ['known_traverses', 'known_avoids', 'unknown'].includes(s.routeEvidence.state) &&
            ['reviewed_demo', 'customer_confirmed'].includes(s.routeEvidence.source))) &&
        (s.assumedDisruptionDelayDays === undefined ||
          s.assumedDisruptionDelayDays === null ||
          (Number.isInteger(s.assumedDisruptionDelayDays) &&
            s.assumedDisruptionDelayDays >= 0 &&
            s.assumedDisruptionDelayDays <= 365)) &&
        (s.knownAsset === undefined ||
          (['port', 'supplier_site'].includes(s.knownAsset.type) &&
            typeof s.knownAsset.name === 'string' &&
            s.knownAsset.name.trim().length > 0 &&
            Number.isFinite(s.knownAsset.latitude) &&
            Math.abs(s.knownAsset.latitude) <= 90 &&
            Number.isFinite(s.knownAsset.longitude) &&
            Math.abs(s.knownAsset.longitude) <= 180 &&
            ['reviewed_demo', 'customer_confirmed'].includes(s.knownAsset.source))) &&
        Array.isArray(s.edited) &&
        s.edited.every((v: unknown) => typeof v === 'string') &&
        ['assumed', 'unknown', 'not-avoided'].includes(s.tariffAvoidance) &&
        ['fixed', 'derived'].includes(s.carryingMode) &&
        ['itemized', 'bundled'].includes(s.costBasis) &&
        (s.decisionDate === undefined ||
          (typeof s.decisionDate === 'string' && isIsoDate(s.decisionDate))) &&
        validateCostDetails(s).length === 0 &&
        ['alternativeRoute', 'alternativeSupplier'].every(
          (k) =>
            s[k] &&
            Object.entries(sample[k as keyof Shipment] as object).every(
              ([f, v]) => typeof s[k][f] === typeof v,
            ),
        ),
    )
  );
}
function withMissingDemoSamples(shipments: Shipment[]): Shipment[] {
  const ids = new Set(shipments.map((s) => s.id));
  const missing = freshSamples().filter((s) => s.id === 'nordic-home' && !ids.has(s.id));
  return missing.length ? [...shipments, ...missing] : shipments;
}

export function loadShipments(): Shipment[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return freshSamples();
    const saved = JSON.parse(raw);
    return saved.version === 1 && compatible(saved.shipments)
      ? withMissingDemoSamples(saved.shipments)
      : freshSamples();
  } catch {
    return freshSamples();
  }
}
export function saveShipments(shipments: Shipment[]): boolean {
  try {
    if (!compatible(shipments)) return false;
    localStorage.setItem(
      KEY,
      JSON.stringify({ version: 1, shipments }, (_key, value) => {
        if (typeof value === 'number' && !Number.isFinite(value))
          throw new Error('Incomplete numeric input');
        return value;
      }),
    );
    return true;
  } catch {
    return false;
  }
}
export function clearShipments(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* Browser storage is optional. */
  }
}
