export const USGS_FEED_URL =
  'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson';
const MAX_BYTES = 1_000_000;
const MAX_ROWS = 500;
const MAX_AGE_MS = 2 * 60 * 60 * 1000;

export type FeedStatus = 'fresh' | 'stale' | 'unavailable' | 'invalid';
export interface ObservedEarthquake {
  id: string;
  providerId: string;
  sourceMode: 'observed' | 'fictional_fixture';
  title: string;
  magnitude: number | null;
  latitude: number;
  longitude: number;
  depthKm: number | null;
  eventTime: string;
  updatedAt: string;
  retrievedAt: string;
  sourceUrl: string | null;
}
export interface EarthquakeFeed {
  status: FeedStatus;
  events: ObservedEarthquake[];
  generatedAt: string | null;
  retrievedAt: string;
  detail: string;
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function time(value: unknown, now: number): string | null {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 && value <= now + 300_000
    ? new Date(value).toISOString()
    : null;
}
function normalize(feature: unknown, now: number, retrievedAt: string): ObservedEarthquake | null {
  if (
    !record(feature) ||
    typeof feature.id !== 'string' ||
    !/^[A-Za-z0-9_-]{1,80}$/.test(feature.id)
  )
    return null;
  const properties = feature.properties;
  const geometry = feature.geometry;
  if (
    !record(properties) ||
    !record(geometry) ||
    properties.type !== 'earthquake' ||
    geometry.type !== 'Point' ||
    !Array.isArray(geometry.coordinates)
  )
    return null;
  const [longitude, latitude, depth] = geometry.coordinates;
  if (
    typeof longitude !== 'number' ||
    !Number.isFinite(longitude) ||
    Math.abs(longitude) > 180 ||
    typeof latitude !== 'number' ||
    !Number.isFinite(latitude) ||
    Math.abs(latitude) > 90
  )
    return null;
  const eventTime = time(properties.time, now);
  const updatedAt = time(properties.updated, now);
  if (!eventTime || !updatedAt || updatedAt < eventTime) return null;
  const magnitude =
    typeof properties.mag === 'number' &&
    Number.isFinite(properties.mag) &&
    properties.mag >= -2 &&
    properties.mag <= 10
      ? properties.mag
      : null;
  return {
    id: `usgs:${feature.id}`,
    providerId: feature.id,
    sourceMode: 'observed',
    title:
      typeof properties.title === 'string' && properties.title.length <= 240
        ? properties.title
        : `USGS earthquake ${feature.id}`,
    magnitude,
    latitude,
    longitude,
    depthKm:
      typeof depth === 'number' && Number.isFinite(depth) && depth >= -20 && depth <= 800
        ? depth
        : null,
    eventTime,
    updatedAt,
    retrievedAt,
    sourceUrl: `https://earthquake.usgs.gov/earthquakes/eventpage/${encodeURIComponent(feature.id)}`,
  };
}

export function parseUSGSFeed(payload: unknown, retrievedAt: string): EarthquakeFeed {
  const now = Date.parse(retrievedAt);
  const invalid = (detail: string): EarthquakeFeed => ({
    status: 'invalid',
    events: [],
    generatedAt: null,
    retrievedAt,
    detail,
  });
  if (
    !record(payload) ||
    payload.type !== 'FeatureCollection' ||
    !record(payload.metadata) ||
    !Array.isArray(payload.features) ||
    payload.features.length > MAX_ROWS
  )
    return invalid('USGS response shape or row limit is invalid.');
  const generatedAt = time(payload.metadata.generated, now);
  if (!generatedAt) return invalid('USGS feed generation time is missing or invalid.');
  const byId = new Map<string, ObservedEarthquake>();
  let skipped = 0;
  for (const feature of payload.features) {
    const event = normalize(feature, now, retrievedAt);
    if (!event) {
      skipped++;
      continue;
    }
    const prior = byId.get(event.id);
    if (!prior || prior.updatedAt < event.updatedAt) byId.set(event.id, event);
  }
  const events = [...byId.values()].sort((a, b) => b.eventTime.localeCompare(a.eventTime));
  const stale = now - Date.parse(generatedAt) > MAX_AGE_MS;
  return {
    status: stale ? 'stale' : 'fresh',
    events,
    generatedAt,
    retrievedAt,
    detail: `${events.length} reported earthquakes; ${skipped} unsupported or incomplete records skipped. ${stale ? 'Feed generation is older than two hours.' : 'Reports may be revised by USGS.'}`,
  };
}

export async function fetchUSGSFeed(
  fetcher: typeof fetch = fetch,
  now: () => Date = () => new Date(),
): Promise<EarthquakeFeed> {
  const retrievedAt = now().toISOString();
  const unavailable = (detail: string): EarthquakeFeed => ({
    status: 'unavailable',
    events: [],
    generatedAt: null,
    retrievedAt,
    detail,
  });
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);
  try {
    const response = await fetcher(USGS_FEED_URL, {
      method: 'GET',
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) return unavailable(`USGS returned HTTP ${response.status}.`);
    const size = Number(response.headers.get('content-length'));
    if (Number.isFinite(size) && size > MAX_BYTES)
      return { ...unavailable('USGS response exceeds size limit.'), status: 'invalid' };
    const text = await response.text();
    if (text.length > MAX_BYTES)
      return { ...unavailable('USGS response exceeds size limit.'), status: 'invalid' };
    try {
      return parseUSGSFeed(JSON.parse(text), retrievedAt);
    } catch {
      return { ...unavailable('USGS returned invalid JSON.'), status: 'invalid' };
    }
  } catch (error) {
    return unavailable(
      error instanceof Error && error.name === 'AbortError'
        ? 'USGS request timed out.'
        : 'USGS feed could not be reached.',
    );
  } finally {
    clearTimeout(timer);
  }
}

export function fictionalEarthquakeFixture(now = '2026-10-16T12:00:00.000Z'): ObservedEarthquake {
  return {
    id: 'fictional_usgs_like:harbor-test',
    providerId: 'harbor-test',
    sourceMode: 'fictional_fixture',
    title: 'Fictional M5.1 test event near a fictional Los Angeles port asset',
    magnitude: 5.1,
    latitude: 33.8,
    longitude: -118.3,
    depthKm: 12,
    eventTime: now,
    updatedAt: now,
    retrievedAt: now,
    sourceUrl: null,
  };
}
