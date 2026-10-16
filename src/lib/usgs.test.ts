import { describe, expect, it, vi } from 'vitest';
import { fetchUSGSFeed, fictionalEarthquakeFixture, parseUSGSFeed, USGS_FEED_URL } from './usgs';
import { conditionalDelayCost, distanceKm, quakeExposure } from './quakeExposure';
import { freshSamples } from './data';

const now = '2026-10-16T12:00:00.000Z';
const time = Date.parse(now);
function feature(id = 'test123', updated = time - 20_000) {
  return {
    type: 'Feature',
    id,
    properties: { type: 'earthquake', title: 'M 5.1 test', mag: 5.1, time: time - 60_000, updated },
    geometry: { type: 'Point', coordinates: [-118.3, 33.8, 12] },
  };
}
function payload(features: unknown[] = [feature()], generated = time - 10_000) {
  return { type: 'FeatureCollection', metadata: { generated }, features };
}
function response(body: unknown, status = 200): Response {
  return new Response(typeof body === 'string' ? body : JSON.stringify(body), { status });
}

describe('USGS observed feed', () => {
  it('preserves stable identity and four distinct times', () => {
    const result = parseUSGSFeed(payload(), now);
    expect(result.status).toBe('fresh');
    expect(result.generatedAt).toBe(new Date(time - 10_000).toISOString());
    expect(result.events[0]).toMatchObject({
      id: 'usgs:test123',
      sourceMode: 'observed',
      magnitude: 5.1,
      latitude: 33.8,
      longitude: -118.3,
      retrievedAt: now,
    });
    expect(result.events[0].eventTime).not.toBe(result.events[0].updatedAt);
    expect(result.events[0].sourceUrl).toBe(
      'https://earthquake.usgs.gov/earthquakes/eventpage/test123',
    );
  });
  it('distinguishes empty, stale, invalid, incomplete and revised records', () => {
    expect(parseUSGSFeed(payload([]), now)).toMatchObject({ status: 'fresh', events: [] });
    expect(parseUSGSFeed(payload([], time - 3 * 3_600_000), now).status).toBe('stale');
    expect(parseUSGSFeed({ bad: true }, now).status).toBe('invalid');
    const missing = feature();
    missing.geometry.coordinates = [300, 33.8, 12];
    expect(parseUSGSFeed(payload([missing]), now).events).toHaveLength(0);
    const future = feature('future', time + 600_000);
    expect(parseUSGSFeed(payload([future]), now).events).toHaveLength(0);
    const revised = feature('test123', time - 1_000);
    expect(parseUSGSFeed(payload([feature(), revised]), now).events).toHaveLength(1);
    expect(parseUSGSFeed(payload([feature(), revised]), now).events[0].updatedAt).toBe(
      new Date(time - 1_000).toISOString(),
    );
  });
  it('uses only the fixed provider URL and reports HTTP and payload failures', async () => {
    const clock = () => new Date(now);
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(response(payload()));
    expect((await fetchUSGSFeed(fetcher, clock)).status).toBe('fresh');
    expect(fetcher.mock.calls[0][0]).toBe(USGS_FEED_URL);
    for (const code of [429, 503])
      expect(
        (
          await fetchUSGSFeed(
            vi.fn<typeof fetch>().mockResolvedValue(response('failure', code)),
            clock,
          )
        ).status,
      ).toBe('unavailable');
    expect(
      (await fetchUSGSFeed(vi.fn<typeof fetch>().mockResolvedValue(response('{oops')), clock))
        .status,
    ).toBe('invalid');
    expect(
      (
        await fetchUSGSFeed(
          vi.fn<typeof fetch>().mockResolvedValue(response('x'.repeat(1_000_001))),
          clock,
        )
      ).status,
    ).toBe('invalid');
    expect(
      (
        await fetchUSGSFeed(
          vi.fn<typeof fetch>().mockRejectedValue(new DOMException('aborted', 'AbortError')),
          clock,
        )
      ).detail,
    ).toMatch(/timed out/);
  });
});

describe('earthquake proximity and conditional cost', () => {
  it('screens only an explicit point and handles the distance boundary and dateline', () => {
    const event = fictionalEarthquakeFixture(now);
    const northstar = freshSamples()[0];
    const match = quakeExposure(event, northstar);
    expect(match.state).toBe('possible');
    expect(quakeExposure(event, northstar, match.distanceKm! - 0.01).state).toBe('outside_screen');
    expect(quakeExposure(event, { ...northstar, knownAsset: undefined }).state).toBe('unknown');
    expect(
      distanceKm({ latitude: 0, longitude: 179.9 }, { latitude: 0, longitude: -179.9 }),
    ).toBeLessThan(23);
  });
  it('keeps dollars absent until every user input is entered', () => {
    expect(conditionalDelayCost(null, 10000, 0)).toBeNull();
    expect(conditionalDelayCost(3, null, 0)).toBeNull();
    expect(conditionalDelayCost(3, 10000, 2500)).toBe(32500);
    expect(conditionalDelayCost(-1, 10000, 0)).toBeNull();
  });
});
