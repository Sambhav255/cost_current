export const NHC_SOURCE_URL = 'https://www.nhc.noaa.gov/CurrentStorms.json';
export const NHC_PROXY_PATH = '/api/nhc';
import { pointInCone, type ConeGeometry } from './nhcKml';
import type { Shipment } from './types';
const MAX_BYTES = 500_000;
export interface NHCSummary {
  id: string;
  name: string;
  basin: 'AL' | 'EP' | 'CP';
  classification: string;
  advisoryNumber: string;
  issuedAt: string;
  lastUpdate: string;
  advisoryUrl: string;
  trackKmzUrl: string | null;
  coneKmzUrl: string | null;
  cone: ConeGeometry | null;
  geometryStatus: 'official_cone' | 'unavailable';
}
export interface NHCFeed {
  status: 'fresh' | 'stale' | 'unavailable' | 'invalid';
  storms: NHCSummary[];
  retrievedAt: string;
  detail: string;
}
function record(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}
function officialUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname === 'www.nhc.noaa.gov' ? url.toString() : null;
  } catch {
    return null;
  }
}
function date(value: unknown, now: number): string | null {
  if (typeof value !== 'string') return null;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) && parsed > 0 && parsed <= now + 300_000
    ? new Date(parsed).toISOString()
    : null;
}
function cone(value: unknown, stormId: string, advisory: string): ConeGeometry | null {
  if (
    !record(value) ||
    value.stormId !== stormId.toLowerCase() ||
    Number(value.advisoryNumber) !== Number(advisory) ||
    !Number.isInteger(value.forecastHours) ||
    Number(value.forecastHours) < 12 ||
    Number(value.forecastHours) > 168 ||
    !Array.isArray(value.outer) ||
    value.outer.length < 4 ||
    value.outer.length > 5000 ||
    !Array.isArray(value.holes) ||
    value.holes.length > 20
  )
    return null;
  const ring = (vertices: unknown): vertices is ConeGeometry['outer'] =>
    Array.isArray(vertices) &&
    vertices.length >= 4 &&
    vertices.length <= 5000 &&
    vertices.every(
      (point) =>
        Array.isArray(point) &&
        point.length === 2 &&
        typeof point[0] === 'number' &&
        Number.isFinite(point[0]) &&
        Math.abs(point[0]) <= 180 &&
        typeof point[1] === 'number' &&
        Number.isFinite(point[1]) &&
        Math.abs(point[1]) <= 90,
    );
  if (!ring(value.outer) || !value.holes.every(ring)) return null;
  return value as unknown as ConeGeometry;
}
export function parseNHC(payload: unknown, retrievedAt: string): NHCFeed {
  const invalid = (detail: string): NHCFeed => ({
    status: 'invalid',
    storms: [],
    retrievedAt,
    detail,
  });
  if (!record(payload) || !Array.isArray(payload.activeStorms) || payload.activeStorms.length > 30)
    return invalid('NHC summary shape or storm count is invalid.');
  const storms: NHCSummary[] = [];
  let skipped = 0;
  for (const raw of payload.activeStorms) {
    if (
      !record(raw) ||
      typeof raw.id !== 'string' ||
      !/^(al|ep|cp)\d{2}\d{4}$/i.test(raw.id) ||
      !record(raw.forecastAdvisory)
    ) {
      skipped++;
      continue;
    }
    const issuedAt = date(raw.forecastAdvisory.issuance, Date.parse(retrievedAt));
    const lastUpdate = date(raw.lastUpdate, Date.parse(retrievedAt));
    const advisoryUrl = officialUrl(raw.forecastAdvisory.url);
    const advisoryNumber = raw.forecastAdvisory.advNum;
    if (
      !issuedAt ||
      !lastUpdate ||
      !advisoryUrl ||
      typeof advisoryNumber !== 'string' ||
      !/^\d{1,4}[A-Z]?$/.test(advisoryNumber) ||
      typeof raw.name !== 'string' ||
      raw.name.length > 80
    ) {
      skipped++;
      continue;
    }
    const officialCone = cone(raw.costCurrentCone, raw.id, advisoryNumber);
    storms.push({
      id: `nhc:${raw.id.toLowerCase()}:${advisoryNumber}:${issuedAt}`,
      name: raw.name,
      basin: raw.id.slice(0, 2).toUpperCase() as NHCSummary['basin'],
      classification:
        typeof raw.classification === 'string' ? raw.classification.slice(0, 12) : 'unknown',
      advisoryNumber,
      issuedAt,
      lastUpdate,
      advisoryUrl,
      trackKmzUrl: record(raw.forecastTrack) ? officialUrl(raw.forecastTrack.kmzFile) : null,
      coneKmzUrl: record(raw.trackCone) ? officialUrl(raw.trackCone.kmzFile) : null,
      cone: officialCone,
      geometryStatus: officialCone ? 'official_cone' : 'unavailable',
    });
  }
  const latest = Math.max(0, ...storms.map((s) => Date.parse(s.issuedAt)));
  if (payload.activeStorms.length > 0 && storms.length === 0)
    return invalid('NHC listed storms but no valid advisory records were found.');
  const status =
    storms.length && Date.parse(retrievedAt) - latest > 6 * 3_600_000 ? 'stale' : 'fresh';
  if (status === 'stale')
    for (const storm of storms) {
      storm.cone = null;
      storm.geometryStatus = 'unavailable';
    }
  return {
    status,
    storms,
    retrievedAt,
    detail: `${storms.length} active NHC advisory summaries; ${skipped} incomplete records skipped. ${storms.filter((storm) => storm.cone).length} version-checked official cones available.`,
  };
}

export function nhcExposure(
  storm: NHCSummary,
  shipment: Shipment,
): { state: 'possible' | 'outside_cone' | 'unknown'; reason: string } {
  if (!shipment.knownAsset)
    return {
      state: 'unknown',
      reason: 'No confirmed port or supplier-site coordinates for this shipment.',
    };
  if (!storm.cone)
    return {
      state: 'unknown',
      reason: 'Official cone geometry is unavailable or failed advisory-version checks.',
    };
  const inside = pointInCone(
    [shipment.knownAsset.longitude, shipment.knownAsset.latitude],
    storm.cone,
  );
  return {
    state: inside ? 'possible' : 'outside_cone',
    reason: `${shipment.knownAsset.name} ${inside ? 'lies inside' : 'lies outside'} the NHC advisory ${storm.advisoryNumber} forecast cone. The cone describes uncertainty in the storm center track, not wind extent, port closure, route delay or impact probability.`,
  };
}
export async function fetchNHC(
  fetcher: typeof fetch = fetch,
  now: () => Date = () => new Date(),
): Promise<NHCFeed> {
  const retrievedAt = now().toISOString();
  const unavailable = (detail: string): NHCFeed => ({
    status: 'unavailable',
    storms: [],
    retrievedAt,
    detail,
  });
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);
  try {
    const response = await fetcher(NHC_PROXY_PATH, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) return unavailable(`NHC endpoint returned HTTP ${response.status}.`);
    const length = Number(response.headers.get('content-length'));
    if (Number.isFinite(length) && length > MAX_BYTES)
      return { ...unavailable('NHC response exceeds size limit.'), status: 'invalid' };
    const body = await response.text();
    if (body.length > MAX_BYTES)
      return { ...unavailable('NHC response exceeds size limit.'), status: 'invalid' };
    try {
      return parseNHC(JSON.parse(body), retrievedAt);
    } catch {
      return { ...unavailable('NHC returned invalid JSON.'), status: 'invalid' };
    }
  } catch (error) {
    return unavailable(
      error instanceof Error && error.name === 'AbortError'
        ? 'NHC request timed out.'
        : 'NHC endpoint unavailable.',
    );
  } finally {
    clearTimeout(timer);
  }
}
