import { describe, expect, it } from 'vitest';
import {
  evaluatePortWatch,
  parsePortWatchPage,
  parsePortWatchSeries,
  portWatchAnomaly,
  SUEZ_PORT_ID,
} from './portwatch';

const DAY = 86_400_000;
const date = (offset: number) =>
  new Date(Date.parse('2026-01-01T00:00:00.000Z') + offset * DAY).toISOString().slice(0, 10);
function fixture(count = 70, retrievedOffset = 1) {
  return parsePortWatchSeries({
    provenance: 'synthetic_fixture',
    rightsReference: 'Locally generated test data',
    observations: Array.from({ length: count }, (_, i) => ({
      date: date(i),
      portId: SUEZ_PORT_ID,
      portName: 'Fictional Suez',
      metric: 'n_container',
      vesselsPerDay: i >= 63 ? 3 : 12 + (i % 7),
      objectId: i + 1,
      availableAt: `${date(i + 1)}T12:00:00.000Z`,
      retrievedAt: `${date(i + retrievedOffset)}T12:00:00.000Z`,
    })),
  });
}
describe('PortWatch permissioned research boundary', () => {
  it('parses one bounded ArcGIS page without inventing release time', () => {
    const page = parsePortWatchPage(
      {
        features: [
          {
            attributes: {
              ObjectId: 17,
              date: '2026-01-01',
              portid: SUEZ_PORT_ID,
              portname: 'Suez Canal',
              n_container: 4,
            },
          },
        ],
        exceededTransferLimit: true,
      },
      '2026-01-03T00:00:00.000Z',
    );
    expect(page).toMatchObject({
      hasMore: true,
      observations: [{ vesselsPerDay: 4, availableAt: null }],
    });
    expect(() =>
      parsePortWatchPage(
        {
          features: [
            {
              attributes: {
                ObjectId: 1,
                date: '2026-01-01',
                portid: 'other',
                portname: 'Other',
                n_container: 4,
              },
            },
          ],
        },
        '2026-01-03T00:00:00.000Z',
      ),
    ).toThrow();
    expect(() =>
      parsePortWatchPage(
        {
          features: [
            {
              attributes: {
                ObjectId: 1,
                date: '2026-01-01',
                portid: SUEZ_PORT_ID,
                portname: 'Suez',
                n_container: -1,
              },
            },
          ],
        },
        '2026-01-03T00:00:00.000Z',
      ),
    ).toThrow();
  });
  it('rejects missing vintages, duplicate rows and final snapshots as backtest evidence', () => {
    const s = fixture(70);
    expect(() =>
      parsePortWatchSeries({ ...s, observations: [...s.observations, s.observations[0]] }),
    ).toThrow();
    expect(() =>
      parsePortWatchSeries({
        ...s,
        observations: [...s.observations, { ...s.observations[0], objectId: 999 }],
      }),
    ).toThrow();
    expect(() =>
      parsePortWatchSeries({
        ...s,
        observations: [{ ...s.observations[0], availableAt: 'unknown' }],
      }),
    ).toThrow();
    const finalOnly = {
      ...s,
      observations: s.observations.map((o) => ({ ...o, retrievedAt: '2026-04-01T12:00:00.000Z' })),
    };
    expect(evaluatePortWatch(finalOnly).status).toBe('insufficient_history');
  });
  it('flags a descriptive drop only with 35 known consecutive days', () => {
    const s = fixture();
    expect(portWatchAnomaly(s, date(70))).toMatchObject({
      status: 'observed_abnormal_drop',
      windowStart: date(63),
      windowEnd: date(69),
    });
    expect(
      portWatchAnomaly(
        { ...s, observations: s.observations.filter((o) => o.date !== date(50)) },
        date(70),
      ).status,
    ).toBe('insufficient_coverage');
  });
  it('walks forward with known-at-origin observations and labels synthetic scores', () => {
    const result = evaluatePortWatch(fixture());
    expect(result.status).toBe('evaluated');
    expect(result.folds).toBeGreaterThan(8);
    expect(result.maeVesselsPerDay?.last).toBeGreaterThanOrEqual(0);
    expect(result.note).toContain('Synthetic fixture');
    expect(evaluatePortWatch(fixture(25)).status).toBe('insufficient_history');
  });
});
