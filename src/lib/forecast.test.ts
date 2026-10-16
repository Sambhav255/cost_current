import { describe, expect, it } from 'vitest';
import {
  baselineForecast,
  parseSeries,
  exampleSeries,
  evaluateBaseline,
  mapFreightExposure,
} from './forecast';

describe('isolated freight baseline', () => {
  const asOf = '2026-10-16';
  const series = exampleSeries();
  it('never substitutes sample event odds when observations are absent', () => {
    const f = baselineForecast(null, 'sha-lax', asOf, 28, '2026-10-16T12:00:00Z');
    expect(f.status).toBe('unavailable');
    expect(f.rateCentsPerFeu).toBeNull();
    expect(f.tariff.probabilityBps).toBeNull();
    expect(f.freight.probabilityBps).toBeNull();
  });
  it('automatically reproduces the last eligible observation and discloses the example', () => {
    const f = baselineForecast(series, 'sha-lax', asOf, 28);
    expect(f.status).toBe('illustrative');
    expect(f.rateCentsPerFeu).toBe(series.observations.at(-1)!.valueCents);
    expect(f.featureSourceIds).toEqual([series.observations.at(-1)!.id]);
    expect(f.horizonEnd).toBe('2026-11-13');
  });
  it('excludes observations retrieved or revised after the decision cutoff', () => {
    const changed = structuredClone(series);
    changed.observations.at(-1)!.revisedAt = '2026-10-17T00:00:00Z';
    changed.observations.at(-2)!.retrievedAt = '2026-10-17T00:00:00Z';
    expect(baselineForecast(changed, 'sha-lax', asOf, 28).status).toBe('unavailable');
  });
  it('invalidates different lanes and insufficient, stale, or gapped history', () => {
    expect(baselineForecast(series, 'ham-ewr', asOf, 28).status).toBe('unavailable');
    expect(baselineForecast(series, 'sha-lax', '2026-11-10', 28).status).toBe('stale');
    expect(
      baselineForecast(
        { ...series, observations: series.observations.slice(1) },
        'sha-lax',
        asOf,
        28,
      ).status,
    ).toBe('unavailable');
    const gap = structuredClone(series);
    gap.observations[3].observedAt = '2026-08-01T00:00:00Z';
    expect(() => parseSeries(JSON.stringify(gap))).toThrow();
  });
  it('requires explicit rights, exact units, bounded values, IDs and valid timestamps', () => {
    for (const patch of [{ displayRights: 'unknown' }, { unit: 'USD' }, { laneId: 'unknown' }]) {
      expect(() => parseSeries(JSON.stringify({ ...series, ...patch }))).toThrow();
    }
    for (const patch of [
      { valueCents: -1 },
      { valueCents: 1.5 },
      { observedAt: 'yesterday' },
      { retrievedAt: '2026-08-01T00:00:00Z' },
    ]) {
      const bad = structuredClone(series);
      Object.assign(bad.observations[0], patch);
      expect(() => parseSeries(JSON.stringify(bad))).toThrow();
    }
    expect(() => parseSeries('{')).toThrow();
    expect(() =>
      parseSeries(
        JSON.stringify({
          ...series,
          observations: [series.observations[0], series.observations[0]],
        }),
      ),
    ).toThrow();
  });
  it('rejects market-shaped payloads and never promotes related market odds', () => {
    expect(() =>
      parseSeries(JSON.stringify({ question: 'Tariff order signed?', yesPrice: 0.25 })),
    ).toThrow();
    const f = baselineForecast(
      { ...series, probabilityBps: 2500 } as typeof series,
      'sha-lax',
      asOf,
      28,
    );
    expect(f.tariff.probabilityBps).toBeNull();
    expect(f.freight.probabilityBps).toBeNull();
  });
  it('snapshots evidence without sharing mutable series objects', () => {
    const input = structuredClone(series);
    const f = baselineForecast(input, 'sha-lax', asOf, 28);
    input.observations.at(-1)!.valueCents = 1;
    expect(f.history.at(-1)!.valueCents).toBe(470_000);
    expect(f.rightsReference).toContain('fictional');
  });
  it('labels importer data as supplied, without promoting it to verified live data', () => {
    const f = baselineForecast({ ...series, provenance: 'importer_supplied' }, 'sha-lax', asOf, 28);
    expect(f.status).toBe('historical_estimate');
    expect(f.tariff.probabilityBps).toBeNull();
  });
  it('maps rate sensitivity separately, including confirmed fixed contracts', () => {
    expect(mapFreightExposure(500_000, 400_000, 2, 10000)).toBe(200_000);
    expect(mapFreightExposure(500_000, 400_000, 2, 0)).toBe(0);
    expect(mapFreightExposure(300_000, 400_000, 2, 5000)).toBe(-100_000);
    expect(mapFreightExposure(500_000, 400_000, NaN, 10000)).toBeNull();
    expect(mapFreightExposure(1e12, 0, 10000, 10000)).toBeNull();
  });
  it('does not claim evaluation metrics without held-out observations', () => {
    expect(evaluateBaseline(series, asOf, 28).count).toBe(0);
    const history = structuredClone(series);
    history.observations = Array.from({ length: 16 }, (_, i) => {
      const date = new Date(Date.UTC(2026, 5, 26 + i * 7)).toISOString();
      return {
        id: 'h' + i,
        valueCents: 100_000 + i * 1000,
        observedAt: date,
        retrievedAt: date,
        quality: 'usable' as const,
      };
    });
    const result = evaluateBaseline(history, asOf, 28);
    expect(result.count).toBe(5);
    expect(result.maeCentsPerFeu).toBe(4000);
    history.observations.forEach((o) => (o.retrievedAt = '2026-10-17T00:00:00Z'));
    expect(evaluateBaseline(history, asOf, 28).count).toBe(0);
  });
});
