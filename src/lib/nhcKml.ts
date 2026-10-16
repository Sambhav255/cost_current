import { unzipSync } from 'fflate';
import { XMLParser } from 'fast-xml-parser';

export type LonLat = [number, number];
export interface ConeGeometry {
  outer: LonLat[];
  holes: LonLat[][];
  advisoryNumber: string;
  stormId: string;
  forecastHours: number;
}
const parser = new XMLParser({
  ignoreAttributes: false,
  removeNSPrefix: true,
  parseTagValue: false,
});
function list(value: unknown): unknown[] {
  return value === undefined ? [] : Array.isArray(value) ? value : [value];
}
function rec(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}
function ring(value: unknown): LonLat[] | null {
  if (typeof value !== 'string') return null;
  const tokens = value.trim().split(/\s+/);
  if (tokens.length < 4 || tokens.length > 5000) return null;
  const points: LonLat[] = [];
  for (const token of tokens) {
    const parts = token.split(',');
    const lon = Number(parts[0]),
      lat = Number(parts[1]);
    if (!Number.isFinite(lon) || Math.abs(lon) > 180 || !Number.isFinite(lat) || Math.abs(lat) > 90)
      return null;
    points.push([lon, lat]);
  }
  if (points[0][0] !== points.at(-1)?.[0] || points[0][1] !== points.at(-1)?.[1]) return null;
  return points;
}
function dataField(extended: Record<string, unknown> | null, name: string): string | null {
  for (const item of list(extended?.Data)) {
    const field = rec(item);
    if (field?.['@_name'] === name && typeof field.value === 'string') return field.value;
  }
  return null;
}
export function parseConeKml(
  xml: string,
  expectedStormId: string,
  expectedAdvisory: string,
): ConeGeometry | null {
  if (xml.length > 300_000 || xml.includes('<!DOCTYPE') || xml.includes('<!ENTITY')) return null;
  try {
    const doc = rec(rec(parser.parse(xml))?.kml)?.Document;
    const document = rec(doc);
    for (const item of list(document?.Placemark)) {
      const place = rec(item),
        polygon = rec(place?.Polygon);
      if (!polygon) continue;
      const extended = rec(place?.ExtendedData);
      const stormId = dataField(extended, 'atcfid')?.toLowerCase();
      const advisoryNumber = dataField(extended, 'advisoryNum');
      const forecastHours = Number(dataField(extended, 'fcstpd'));
      if (
        stormId !== expectedStormId.toLowerCase() ||
        Number(advisoryNumber) !== Number(expectedAdvisory) ||
        !Number.isInteger(forecastHours) ||
        forecastHours < 12 ||
        forecastHours > 168
      )
        continue;
      const outer = ring(rec(rec(polygon.outerBoundaryIs)?.LinearRing)?.coordinates);
      if (!outer) return null;
      const holes = list(polygon.innerBoundaryIs).map((boundary) =>
        ring(rec(rec(boundary)?.LinearRing)?.coordinates),
      );
      if (holes.some((hole) => !hole)) return null;
      return {
        outer,
        holes: holes as LonLat[][],
        stormId,
        advisoryNumber: expectedAdvisory,
        forecastHours,
      };
    }
  } catch {
    return null;
  }
  return null;
}
export function parseConeKmz(
  bytes: Uint8Array,
  stormId: string,
  advisory: string,
): ConeGeometry | null {
  if (bytes.byteLength > 200_000) return null;
  try {
    const files = unzipSync(bytes, {
      filter: (file) => file.name.toLowerCase().endsWith('.kml') && file.originalSize <= 300_000,
    });
    const kml = Object.entries(files).find(([name]) => name.toLowerCase().endsWith('.kml'))?.[1];
    return kml ? parseConeKml(new TextDecoder().decode(kml), stormId, advisory) : null;
  } catch {
    return null;
  }
}

function inRing(point: LonLat, polygon: LonLat[]): boolean {
  const [lon, lat] = point;
  const unwrapped: number[] = [polygon[0][0]];
  for (let index = 1; index < polygon.length; index++) {
    const prior = unwrapped[index - 1];
    unwrapped.push(prior + (((polygon[index][0] - prior + 540) % 360) - 180));
  }
  const pointLon = unwrapped[0] + (((lon - unwrapped[0] + 540) % 360) - 180);
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const ax = unwrapped[i];
    const bx = unwrapped[j];
    const ay = polygon[i][1],
      by = polygon[j][1];
    if (ay > lat !== by > lat && pointLon < ((bx - ax) * (lat - ay)) / (by - ay) + ax)
      inside = !inside;
  }
  return inside;
}
export function pointInCone(point: LonLat, cone: ConeGeometry): boolean {
  return inRing(point, cone.outer) && !cone.holes.some((hole) => inRing(point, hole));
}
