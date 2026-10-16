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
          ([k, v]) => typeof s[k] === typeof v && (typeof v !== 'number' || Number.isFinite(s[k])),
        ) &&
        (s.scenarioOverride === undefined ||
          (s.scenarioOverride &&
            [s.scenarioOverride.originalTariffBps, s.scenarioOverride.originalFreightBps].every(
              (n: unknown) => typeof n === 'number' && Number.isInteger(n) && n >= 0 && n <= 10000,
            ) &&
            typeof s.scenarioOverride.capturedAt === 'string' &&
            s.scenarioOverride.originalForecast?.modelId === 'last-observation')) &&
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
export function loadShipments(): Shipment[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return freshSamples();
    const saved = JSON.parse(raw);
    return saved.version === 1 && compatible(saved.shipments) ? saved.shipments : freshSamples();
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
