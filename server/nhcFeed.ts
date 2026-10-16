import { parseConeKmz } from '../src/lib/nhcKml.ts';

const NHC_URL = 'https://www.nhc.noaa.gov/CurrentStorms.json';
const MAX_SUMMARY_BYTES = 100_000;
const MAX_CONE_BYTES = 200_000;
const conePattern =
  /^https:\/\/www\.nhc\.noaa\.gov\/storm_graphics\/api\/([A-Z]{2}\d{6})_(\d{1,4}[A-Z]?)adv_CONE\.kmz$/i;
function record(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

export async function loadNHCWithCones(fetcher: typeof fetch = fetch): Promise<unknown> {
  const summaryResponse = await fetcher(NHC_URL, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(10_000),
  });
  if (!summaryResponse.ok) throw new Error(`NHC returned HTTP ${summaryResponse.status}`);
  const size = Number(summaryResponse.headers.get('content-length'));
  if (Number.isFinite(size) && size > MAX_SUMMARY_BYTES)
    throw new Error('NHC summary exceeds size limit');
  const body = await summaryResponse.text();
  if (body.length > MAX_SUMMARY_BYTES) throw new Error('NHC summary exceeds size limit');
  const summary: unknown = JSON.parse(body);
  if (!record(summary) || !Array.isArray(summary.activeStorms) || summary.activeStorms.length > 30)
    throw new Error('NHC summary shape invalid');
  const storms = await Promise.all(
    summary.activeStorms.map(async (item, index) => {
      if (!record(item)) return item;
      const storm: Record<string, unknown> = { ...item, costCurrentCone: null };
      if (
        index >= 5 ||
        typeof item.id !== 'string' ||
        !record(item.trackCone) ||
        !record(item.forecastAdvisory)
      )
        return storm;
      const url = item.trackCone.kmzFile;
      const match = typeof url === 'string' ? conePattern.exec(url) : null;
      if (
        !match ||
        match[1].toLowerCase() !== item.id.toLowerCase() ||
        String(Number(match[2])) !== String(Number(item.forecastAdvisory.advNum))
      )
        return storm;
      try {
        const response = await fetcher(url as string, {
          method: 'GET',
          signal: AbortSignal.timeout(10_000),
        });
        if (!response.ok || Number(response.headers.get('content-length')) > MAX_CONE_BYTES)
          return storm;
        const bytes = new Uint8Array(await response.arrayBuffer());
        if (bytes.byteLength > MAX_CONE_BYTES) return storm;
        storm.costCurrentCone = parseConeKmz(bytes, item.id, String(item.forecastAdvisory.advNum));
      } catch {
        /* Advisory summary remains visible if a GIS file fails. */
      }
      return storm;
    }),
  );
  return { ...summary, activeStorms: storms };
}
