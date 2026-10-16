import { routes } from './data';
import { isIsoDate } from './evidence';

export type ForecastStatus =
  'live' | 'historical_estimate' | 'illustrative' | 'stale' | 'unavailable';
export interface Observation {
  id: string;
  observedAt: string;
  retrievedAt: string;
  revisedAt?: string;
  valueCents: number;
  quality: 'usable' | 'stale' | 'missing' | 'ambiguous';
}
export interface FreightSeries {
  version: 1;
  source: string;
  laneId: string;
  unit: 'USD_cents_per_FEU';
  quoteBasis: string;
  displayRights: 'allowed';
  rightsReference: string;
  provenance: 'importer_supplied' | 'illustrative';
  observations: Observation[];
}
export interface ProbabilityForecast {
  targetDefinition: string;
  probabilityBps: number | null;
  status: ForecastStatus;
  uncertaintyNote: string;
}
export interface ForecastSnapshot {
  modelId: 'last-observation';
  modelVersion: '1.0.0';
  laneId: string;
  horizonStart: string;
  horizonEnd: string;
  horizonDays: 28 | 56;
  asOf: string;
  generatedAt: string;
  observedAt: string | null;
  retrievedAt: string | null;
  status: ForecastStatus;
  rateCentsPerFeu: number | null;
  source: string | null;
  quoteBasis: string | null;
  provenance: FreightSeries['provenance'] | 'unavailable';
  featureSourceIds: string[];
  rightsReference: string | null;
  history: Observation[];
  uncertaintyNote: string;
  tariff: ProbabilityForecast;
  freight: ProbabilityForecast;
}
const DAY = 86_400_000;
const timestamp = (s: unknown): s is string =>
  typeof s === 'string' &&
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(s) &&
  isIsoDate(s.slice(0, 10)) &&
  Number.isFinite(Date.parse(s));
const text = (s: unknown): s is string =>
  typeof s === 'string' && s.trim().length > 0 && s.length <= 500;
const cents = (n: unknown): n is number =>
  typeof n === 'number' && Number.isSafeInteger(n) && n >= 0 && n <= 1e12;
const cutoff = (asOf: string) => Date.parse(asOf + 'T23:59:59.999Z');
function knownAt(o: Observation, asOf: string) {
  const end = cutoff(asOf);
  return (
    o.quality === 'usable' &&
    [o.observedAt, o.retrievedAt, o.revisedAt ?? o.retrievedAt].every((v) => Date.parse(v) <= end)
  );
}
export function parseSeries(raw: string): FreightSeries {
  if (raw.length > 500_000) throw new Error('Series must be at most 500 KB.');
  const s = JSON.parse(raw) as FreightSeries;
  if (
    !s ||
    s.version !== 1 ||
    !routes.some((r) => r.id === s.laneId) ||
    s.unit !== 'USD_cents_per_FEU' ||
    !text(s.source) ||
    !text(s.quoteBasis) ||
    s.displayRights !== 'allowed' ||
    !text(s.rightsReference) ||
    !['importer_supplied', 'illustrative'].includes(s.provenance) ||
    !Array.isArray(s.observations) ||
    s.observations.length === 0 ||
    s.observations.length > 520
  )
    throw new Error(
      'Invalid series: require a supported lane, USD cents/FEU, quote basis, source and explicit display rights.',
    );
  const ids = new Set<string>();
  let previous = -Infinity;
  for (const o of s.observations) {
    if (
      !o ||
      !text(o.id) ||
      ids.has(o.id) ||
      !timestamp(o.observedAt) ||
      !timestamp(o.retrievedAt) ||
      (o.revisedAt !== undefined && !timestamp(o.revisedAt)) ||
      !cents(o.valueCents) ||
      !['usable', 'stale', 'missing', 'ambiguous'].includes(o.quality) ||
      Date.parse(o.retrievedAt) < Date.parse(o.observedAt) ||
      (o.revisedAt !== undefined && Date.parse(o.revisedAt) < Date.parse(o.observedAt)) ||
      Date.parse(o.observedAt) <= previous
    )
      throw new Error(
        'Observations need unique IDs, increasing UTC dates, valid retrieval/revision dates and nonnegative integer cents.',
      );
    ids.add(o.id);
    previous = Date.parse(o.observedAt);
  }
  return s;
}
export function baselineForecast(
  series: FreightSeries | null,
  laneId: string,
  asOf: string,
  horizonDays: 28 | 56,
  generatedAt = new Date().toISOString(),
): ForecastSnapshot {
  const horizonEnd = isIsoDate(asOf)
    ? new Date(Date.parse(asOf) + horizonDays * DAY).toISOString().slice(0, 10)
    : asOf;
  const unknown = (targetDefinition: string): ProbabilityForecast => ({
    targetDefinition,
    probabilityBps: null,
    status: 'unavailable',
    uncertaintyNote:
      'No applicable event labels or qualified market mapping. A rate baseline does not estimate event odds.',
  });
  const result: ForecastSnapshot = {
    modelId: 'last-observation',
    modelVersion: '1.0.0',
    laneId,
    horizonStart: asOf,
    horizonEnd,
    horizonDays,
    asOf,
    generatedAt,
    observedAt: null,
    retrievedAt: null,
    status: 'unavailable',
    rateCentsPerFeu: null,
    source: null,
    quoteBasis: null,
    provenance: 'unavailable',
    featureSourceIds: [],
    rightsReference: null,
    history: [],
    uncertaintyNote:
      'Import at least eight usable weekly observations with display rights. No scenario probabilities are substituted.',
    tariff: unknown('Additional applicable duty on this shipment origin/product before entry'),
    freight: unknown(
      'Entered freight surcharge affecting this shipment within the decision horizon',
    ),
  };
  if (!series || series.laneId !== laneId || !isIsoDate(asOf)) return result;
  // Revalidate at the provider boundary as well as at intake/storage boundaries.
  try {
    parseSeries(JSON.stringify(series));
  } catch {
    return result;
  }
  const eligible = series.observations.filter((o) => knownAt(o, asOf));
  const history = eligible.slice(-8);
  if (
    history.length < 8 ||
    history.some(
      (o, i) =>
        i > 0 && (Date.parse(o.observedAt) - Date.parse(history[i - 1].observedAt)) / DAY > 10,
    ) ||
    (Date.parse(history.at(-1)!.observedAt) - Date.parse(history[0].observedAt)) / DAY < 42
  )
    return result;
  const latest = history.at(-1)!;
  const stale = (cutoff(asOf) - Date.parse(latest.observedAt)) / DAY > 14;
  return {
    ...result,
    source: series.source,
    quoteBasis: series.quoteBasis,
    provenance: series.provenance,
    observedAt: latest.observedAt,
    retrievedAt: latest.retrievedAt,
    featureSourceIds: [latest.id],
    rightsReference: series.rightsReference,
    history: structuredClone(history),
    status: stale
      ? 'stale'
      : series.provenance === 'illustrative'
        ? 'illustrative'
        : 'historical_estimate',
    rateCentsPerFeu: stale ? null : latest.valueCents,
    uncertaintyNote: stale
      ? 'Latest eligible observation is over 14 days old. Rate output withheld; import newer observations.'
      : 'Last-observation baseline, not ML. No fitted uncertainty interval or event probabilities. Spot/index values are not booked invoices; importer data are supplied, not independently verified.',
  };
}
export function mapFreightExposure(
  rate: number,
  reference: number,
  containers: number,
  spotBps: number,
): number | null {
  if (
    !cents(rate) ||
    !cents(reference) ||
    !Number.isInteger(containers) ||
    containers < 1 ||
    containers > 10000 ||
    !Number.isInteger(spotBps) ||
    spotBps < 0 ||
    spotBps > 10000
  )
    return null;
  const delta = Math.round((rate - reference) * containers * (spotBps / 10000));
  return Number.isSafeInteger(delta) ? delta : null;
}
export function evaluateBaseline(series: FreightSeries, asOf: string, horizonDays: 28 | 56) {
  const errors: number[] = [];
  // A target must itself be known by the report cutoff. Features are independently
  // filtered at each earlier prediction date, including retrieval/revision dates.
  for (const target of series.observations.filter((o) => knownAt(o, asOf))) {
    const origin = new Date(Date.parse(target.observedAt) - horizonDays * DAY)
      .toISOString()
      .slice(0, 10);
    const f = baselineForecast(series, series.laneId, origin, horizonDays);
    if (f.rateCentsPerFeu !== null) errors.push(Math.abs(f.rateCentsPerFeu - target.valueCents));
  }
  return {
    count: errors.length,
    maeCentsPerFeu: errors.length ? errors.reduce((a, b) => a + b, 0) / errors.length : null,
  };
}
export function exampleSeries(): FreightSeries {
  return {
    version: 1,
    source: 'Fictional weekly Shanghai–Los Angeles example',
    laneId: 'sha-lax',
    unit: 'USD_cents_per_FEU',
    quoteBasis:
      'Fictional spot ocean linehaul per 40-foot container; excludes duties and inland charges',
    displayRights: 'allowed',
    rightsReference: 'Cost Current authored fictional values; not market observations',
    provenance: 'illustrative',
    observations: Array.from({ length: 8 }, (_, i) => {
      const date = new Date(Date.UTC(2026, 7, 28 + i * 7)).toISOString();
      return {
        id: 'fictional-week-' + i,
        observedAt: date,
        retrievedAt: date,
        valueCents: 400_000 + i * 10_000,
        quality: 'usable',
      };
    }),
  };
}
export const FORECAST_STORAGE_KEY = 'cost-current-freight-series-v1';
export function loadSeries(): { series: FreightSeries | null; error: string } {
  try {
    const raw = localStorage.getItem(FORECAST_STORAGE_KEY);
    return { series: raw ? parseSeries(raw) : null, error: '' };
  } catch {
    return { series: null, error: 'Saved signals could not be read. No sample fallback was used.' };
  }
}
export function saveSeries(series: FreightSeries | null): boolean {
  try {
    if (series)
      localStorage.setItem(
        FORECAST_STORAGE_KEY,
        JSON.stringify(parseSeries(JSON.stringify(series))),
      );
    else localStorage.removeItem(FORECAST_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}
