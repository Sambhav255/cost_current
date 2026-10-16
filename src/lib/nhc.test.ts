import { describe, expect, it, vi } from 'vitest';
import { fetchNHC, nhcExposure, NHC_PROXY_PATH, parseNHC } from './nhc';
import { freshSamples } from './data';
import { GET } from '../../api/nhc';

const now = '2026-10-16T12:00:00.000Z';
function storm(overrides: Record<string, unknown> = {}) {
  return {
    id: 'ep212026',
    name: 'Trudy',
    classification: 'HU',
    lastUpdate: '2026-10-16T09:00:00.000Z',
    forecastAdvisory: {
      advNum: '012',
      issuance: '2026-10-16T09:00:00.000Z',
      url: 'https://www.nhc.noaa.gov/text/MIATCMEP1.shtml',
    },
    forecastTrack: {
      kmzFile: 'https://www.nhc.noaa.gov/storm_graphics/api/EP212026_012adv_TRACK.kmz',
    },
    trackCone: { kmzFile: 'https://www.nhc.noaa.gov/storm_graphics/api/EP212026_012adv_CONE.kmz' },
    ...overrides,
  };
}
const response = (body: unknown, status = 200) =>
  new Response(typeof body === 'string' ? body : JSON.stringify(body), { status });

describe('NHC advisory-status boundary', () => {
  it('keeps forecast issuance distinct from current update and withholds geography', () => {
    const result = parseNHC({ activeStorms: [storm()] }, now);
    expect(result.status).toBe('fresh');
    expect(result.storms[0]).toMatchObject({
      basin: 'EP',
      advisoryNumber: '012',
      issuedAt: '2026-10-16T09:00:00.000Z',
      geometryStatus: 'unavailable',
    });
    expect(result.storms[0].coneKmzUrl).toMatch(/nhc.noaa.gov/);
  });
  it('handles valid empty, stale, malformed, ambiguous basin and nonofficial links', () => {
    expect(parseNHC({ activeStorms: [] }, now)).toMatchObject({ status: 'fresh', storms: [] });
    expect(parseNHC({ activeStorms: [storm()] }, '2026-10-17T00:00:00.000Z').status).toBe('stale');
    expect(parseNHC({ storms: [] }, now).status).toBe('invalid');
    expect(parseNHC({ activeStorms: [storm({ id: 'xx212026' })] }, now).storms).toHaveLength(0);
    expect(
      parseNHC(
        {
          activeStorms: [
            storm({
              forecastAdvisory: {
                advNum: '012',
                issuance: '2026-10-16T09:00:00.000Z',
                url: 'https://evil.example/advisory',
              },
            }),
          ],
        },
        now,
      ).storms,
    ).toHaveLength(0);
  });
  it('matches a known asset only against the exact-version official cone', () => {
    const geometry = {
      stormId: 'ep212026',
      advisoryNumber: '012',
      forecastHours: 120,
      outer: [
        [-119, 33],
        [-117, 33],
        [-117, 35],
        [-119, 35],
        [-119, 33],
      ],
      holes: [],
    };
    const enriched = parseNHC({ activeStorms: [storm({ costCurrentCone: geometry })] }, now)
      .storms[0];
    expect(enriched.geometryStatus).toBe('official_cone');
    expect(nhcExposure(enriched, freshSamples()[0]).state).toBe('possible');
    expect(nhcExposure(enriched, { ...freshSamples()[0], knownAsset: undefined }).state).toBe(
      'unknown',
    );
    const wrong = parseNHC(
      { activeStorms: [storm({ costCurrentCone: { ...geometry, advisoryNumber: '011' } })] },
      now,
    ).storms[0];
    expect(nhcExposure(wrong, freshSamples()[0]).state).toBe('unknown');
    const stale = parseNHC(
      { activeStorms: [storm({ costCurrentCone: geometry })] },
      '2026-10-17T00:00:00.000Z',
    ).storms[0];
    expect(nhcExposure(stale, freshSamples()[0]).state).toBe('unknown');
  });
  it('reports provider failure and uses the same-origin path only', async () => {
    const clock = () => new Date(now);
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(response({ activeStorms: [] }));
    expect((await fetchNHC(fetcher, clock)).status).toBe('fresh');
    expect(fetcher.mock.calls[0][0]).toBe(NHC_PROXY_PATH);
    expect(
      (await fetchNHC(vi.fn<typeof fetch>().mockResolvedValue(response('error', 503)), clock))
        .status,
    ).toBe('unavailable');
    expect(
      (await fetchNHC(vi.fn<typeof fetch>().mockResolvedValue(response('{oops')), clock)).status,
    ).toBe('invalid');
  });
  it('server function fetches only the allowlisted NHC URL', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(response({ activeStorms: [] }));
    vi.stubGlobal('fetch', fetcher);
    try {
      expect((await GET()).status).toBe(200);
      expect(fetcher.mock.calls[0][0]).toBe('https://www.nhc.noaa.gov/CurrentStorms.json');
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
