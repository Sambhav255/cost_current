import { describe, expect, it } from 'vitest';
import { freshSamples } from './data';
import { analyzeShipment } from './engine';
import type { Shipment, ValidAnalysis } from './types';

function analysis(change?: (s: Shipment) => void): ValidAnalysis {
  const shipment = freshSamples()[0];
  change?.(shipment);
  const result = analyzeShipment(shipment);
  if (!result.valid) throw new Error(result.errors.join('\n'));
  return result;
}

describe('recovered mentor demonstration acceptance targets', () => {
  it('reproduces the brief without combining early action cost and scenario exposure', () => {
    const result = analysis();
    expect(result.baseCents).toBe(11_700_000);
    expect(result.tariffExposureCents).toBe(600_000);
    expect(result.freightExposureCents).toBe(60_000);
    expect(result.expectedCents).toBe(12_360_000);
    expect(result.actions.find(a => a.id === 'early')?.expectedCents).toBe(12_110_000);
    expect(result.best.id).toBe('early');
    expect(result.best.savingsCents).toBe(250_000);
    expect(result.breakEven).toBeCloseTo(3500 / 15000, 10);
  });

  it('changes the preferred decision at 10% tariff probability', () => {
    const result = analysis(s => { s.tariffProbabilityBps = 1000; });
    expect(result.expectedCents).toBe(11_910_000);
    expect(result.best.id).toBe('wait');
    expect(result.actions.find(a => a.id === 'early')?.savingsCents).toBe(-200_000);
  });

  it('uses a normalized scenario distribution that reproduces the displayed expectation', () => {
    for (const tariff of [0, 1000, 4000, 10000]) {
      for (const freight of [0, 2000, 10000]) {
        const result = analysis(s => { s.tariffProbabilityBps = tariff; s.freightProbabilityBps = freight; });
        expect(result.outcomes.reduce((sum, o) => sum + o.probability, 0)).toBeCloseTo(1, 12);
        expect(result.outcomes.reduce((sum, o) => sum + o.probability * o.costCents, 0)).toBeCloseTo(result.expectedCents, 6);
      }
    }
  });

  it('keeps early purchase out of the ranking when tariff applicability is unknown', () => {
    const result = analysis(s => { s.tariffAvoidance = 'unknown'; });
    expect(result.actions.find(a => a.id === 'early')?.eligible).toBe(false);
    expect(result.best.id).toBe('wait');
  });

  it('does not allow a route change alone to erase origin-based tariff exposure', () => {
    const result = analysis(s => { s.alternativeRoute.enabled = true; });
    expect(result.actions.find(a => a.id === 'route')?.tariffExposureCents).toBe(result.tariffExposureCents);
  });

  it('requires supplier comparability before quoting supplier savings', () => {
    const result = analysis(s => { s.alternativeSupplier.enabled = true; s.alternativeSupplier.comparable = false; });
    expect(result.actions.find(a => a.id === 'supplier')?.expectedCents).toBeNull();
  });
});

describe('alternative arrival dates and tariff applicability', () => {
  it('does not introduce tariff exposure for an early option when the baseline already precedes the event', () => {
    const result = analysis(s => {
      s.arrivalDate = '2026-11-25';
      s.tariffAvoidance = 'not-avoided';
    });
    expect(result.tariffExposureCents).toBe(0);
    expect(result.actions.find(a => a.id === 'early')?.tariffExposureCents).toBe(0);
    expect(result.actions.find(a => a.id === 'early')?.savingsCents).toBe(-350_000);
  });

  it('applies the tariff scenario when a later alternative route crosses the event date', () => {
    const result = analysis(s => {
      s.arrivalDate = '2026-11-25';
      s.alternativeRoute.enabled = true;
      s.alternativeRoute.arrivalDate = '2026-12-20';
    });
    expect(result.tariffExposureCents).toBe(0);
    expect(result.actions.find(a => a.id === 'route')?.tariffExposureCents).toBe(600_000);
  });

  it('applies the entered supplier duty scenario at the supplier arrival date', () => {
    const result = analysis(s => {
      s.arrivalDate = '2026-11-25';
      s.alternativeSupplier.enabled = true;
      s.alternativeSupplier.comparable = true;
      s.alternativeSupplier.arrivalDate = '2026-12-20';
    });
    expect(result.tariffExposureCents).toBe(0);
    expect(result.actions.find(a => a.id === 'supplier')?.tariffExposureCents).toBe(630_000);
  });
});
