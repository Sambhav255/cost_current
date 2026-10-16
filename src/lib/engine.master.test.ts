import { describe, expect, it } from 'vitest';
import { freshSamples } from './data';
import { analyzeShipment, validateShipment } from './engine';
import type { Shipment, ValidAnalysis } from './types';

function compute(change: (s: Shipment) => void): ValidAnalysis {
  const s = freshSamples()[0]; change(s);
  const a = analyzeShipment(s);
  if (!a.valid) throw new Error(a.errors.join('; '));
  return a;
}

describe('master plan explicit prototype gates', () => {
  it('has zero tariff exposure at zero probability', () => {
    const a = compute(s => { s.tariffProbabilityBps = 0; });
    expect(a.tariffExposureCents).toBe(0);
    expect(a.expectedCents).toBe(11_760_000);
    expect(a.best.id).toBe('wait');
  });
  it('handles free early action with a zero break-even threshold', () => {
    const a = compute(s => { s.earlyCostCents = 0; });
    expect(a.breakEven).toBe(0);
    expect(a.best.id).toBe('early');
    expect(a.actions[1].expectedCents).toBe(11_760_000);
  });
  it('removes the threshold when there is no additional tariff impact', () => {
    const a = compute(s => { s.tariffIncreaseBps = 0; });
    expect(a.breakEven).toBeNull();
    expect(a.tariffExposureCents).toBe(0);
    expect(a.best.id).toBe('wait');
  });
  it('keeps four states normalized when freight probability is 100%', () => {
    const a = compute(s => { s.freightProbabilityBps = 10_000; });
    expect(a.expectedCents).toBe(12_600_000);
    expect(a.outcomes.reduce((n, o) => n + o.probability, 0)).toBeCloseTo(1);
    expect(a.outcomes.filter(o => !o.freight).every(o => o.probability === 0)).toBe(true);
  });
  it.each([
    ['negative goods', (s: Shipment) => { s.goodsCents = -1; }],
    ['probability above 100%', (s: Shipment) => { s.tariffProbabilityBps = 10_001; }],
    ['non-finite freight', (s: Shipment) => { s.freightCents = Infinity; }],
    ['missing quantity', (s: Shipment) => { s.units = NaN; }],
    ['amount overflow', (s: Shipment) => { s.customsCents = Number.MAX_SAFE_INTEGER; }],
    ['nonexistent date', (s: Shipment) => { s.arrivalDate = '2026-02-30'; }],
  ])('rejects %s', (_name, change) => {
    const s = freshSamples()[0]; change(s);
    expect(validateShipment(s).length).toBeGreaterThan(0);
    expect(analyzeShipment(s).valid).toBe(false);
  });
  it('rejects later alternatives until delivery-date costs can be compared', () => {
    const a = compute(s => { s.alternativeRoute.enabled = true; s.alternativeRoute.arrivalDate = '2026-12-21'; });
    expect(a.actions.find(x => x.id === 'route')?.expectedCents).toBeNull();
  });
});
