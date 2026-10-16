/** Research-only PortWatch boundary. No automatic provider download is enabled. */
export const PORTWATCH_LAYER_URL =
  'https://services9.arcgis.com/weJ1QsnbMYJlCHdG/arcgis/rest/services/Daily_Chokepoints_Data/FeatureServer/0';
export const PORTWATCH_RIGHTS_STATUS = 'permission_required' as const;
export const PORTWATCH_TARGET =
  'Next 7-day mean daily container-vessel crossings at Suez (vessels/day)';
export const SUEZ_PORT_ID = 'chokepoint1';

export interface PortWatchObservation {
  date: string;
  portId: typeof SUEZ_PORT_ID;
  portName: string;
  metric: 'n_container';
  vesselsPerDay: number;
  objectId: number;
  retrievedAt: string;
  availableAt: string | null;
}
export interface PortWatchPage {
  observations: PortWatchObservation[];
  hasMore: boolean;
}
export interface PortWatchSeries {
  provenance: 'synthetic_fixture' | 'licensed_snapshot';
  rightsReference: string;
  observations: PortWatchObservation[];
}
export interface PortWatchBacktest {
  target: typeof PORTWATCH_TARGET;
  status: 'evaluated' | 'insufficient_history';
  provenance: PortWatchSeries['provenance'];
  folds: number;
  firstOrigin: string | null;
  lastOrigin: string | null;
  maeVesselsPerDay: { last: number; weeklySeasonal: number; rollingMean: number } | null;
  biasVesselsPerDay: { last: number; weeklySeasonal: number; rollingMean: number } | null;
  note: string;
}

const DAY = 86_400_000;
const validDate = (value: unknown): value is string =>
  typeof value === 'string' &&
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  Number.isFinite(Date.parse(`${value}T00:00:00.000Z`)) &&
  new Date(`${value}T00:00:00.000Z`).toISOString().slice(0, 10) === value;
const validTime = (value: unknown): value is string =>
  typeof value === 'string' &&
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value) &&
  Number.isFinite(Date.parse(value)) &&
  new Date(value).toISOString() === (value.includes('.') ? value : value.replace('Z', '.000Z'));
const record = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);
const addDays = (date: string, days: number) =>
  new Date(Date.parse(`${date}T00:00:00.000Z`) + days * DAY).toISOString().slice(0, 10);
const mean = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length;

/** Parse a single already-obtained ArcGIS page. The layer has no release timestamp. */
export function parsePortWatchPage(raw: unknown, retrievedAt: string): PortWatchPage {
  if (
    !validTime(retrievedAt) ||
    !record(raw) ||
    !Array.isArray(raw.features) ||
    raw.features.length > 1000
  )
    throw new Error('Invalid PortWatch page or retrieval time.');
  const observations: PortWatchObservation[] = [];
  const seen = new Set<string>();
  for (const feature of raw.features) {
    const a = record(feature) && feature.attributes;
    if (
      !record(a) ||
      a.portid !== SUEZ_PORT_ID ||
      !validDate(a.date) ||
      !Number.isSafeInteger(a.ObjectId) ||
      Number(a.ObjectId) < 1 ||
      typeof a.portname !== 'string' ||
      !a.portname.trim() ||
      a.portname.length > 100 ||
      !Number.isSafeInteger(a.n_container) ||
      Number(a.n_container) < 0
    )
      throw new Error('Invalid Suez identity, date or container-vessel count.');
    const id = a.date;
    if (seen.has(id)) throw new Error('Duplicate PortWatch row within page.');
    seen.add(id);
    observations.push({
      date: a.date,
      portId: SUEZ_PORT_ID,
      portName: a.portname,
      metric: 'n_container',
      vesselsPerDay: Number(a.n_container),
      objectId: Number(a.ObjectId),
      retrievedAt: new Date(retrievedAt).toISOString(),
      availableAt: null,
    });
  }
  return { observations, hasMore: raw.exceededTransferLimit === true };
}

/** Validate a supplied fixture or permissioned snapshot with explicit row availability. */
export function parsePortWatchSeries(raw: unknown): PortWatchSeries {
  if (
    !record(raw) ||
    !['synthetic_fixture', 'licensed_snapshot'].includes(String(raw.provenance)) ||
    typeof raw.rightsReference !== 'string' ||
    !raw.rightsReference.trim() ||
    raw.rightsReference.length > 500 ||
    !Array.isArray(raw.observations) ||
    raw.observations.length > 5000
  )
    throw new Error('Series requires provenance, rights reference and bounded observations.');
  const seen = new Set<string>();
  const observations = raw.observations.map((o: unknown): PortWatchObservation => {
    if (
      !record(o) ||
      !validDate(o.date) ||
      o.portId !== SUEZ_PORT_ID ||
      o.metric !== 'n_container' ||
      typeof o.portName !== 'string' ||
      !o.portName.trim() ||
      o.portName.length > 100 ||
      !Number.isSafeInteger(o.vesselsPerDay) ||
      Number(o.vesselsPerDay) < 0 ||
      !Number.isSafeInteger(o.objectId) ||
      Number(o.objectId) < 1 ||
      !validTime(o.retrievedAt) ||
      (o.availableAt !== null && !validTime(o.availableAt)) ||
      Date.parse(o.retrievedAt) < Date.parse(`${o.date}T00:00:00.000Z`) ||
      (o.availableAt !== null && Date.parse(o.availableAt) < Date.parse(`${o.date}T00:00:00.000Z`))
    )
      throw new Error('Invalid PortWatch observation or unavailable release vintage.');
    const key = `${o.date}:${o.availableAt ?? 'unknown'}`;
    if (seen.has(key)) throw new Error('Duplicate PortWatch observation vintage.');
    seen.add(key);
    return {
      ...o,
      retrievedAt: new Date(o.retrievedAt as string).toISOString(),
      availableAt: o.availableAt === null ? null : new Date(o.availableAt as string).toISOString(),
    } as PortWatchObservation;
  });
  return {
    provenance: raw.provenance as PortWatchSeries['provenance'],
    rightsReference: raw.rightsReference,
    observations,
  };
}

function indexSeries(series: PortWatchSeries): Map<string, PortWatchObservation[]> {
  const byDate = new Map<string, PortWatchObservation[]>();
  for (const observation of series.observations)
    byDate.set(observation.date, [...(byDate.get(observation.date) ?? []), observation]);
  for (const rows of byDate.values())
    rows.sort((a, b) => (b.availableAt ?? '').localeCompare(a.availableAt ?? ''));
  return byDate;
}

function vintageForDate(
  byDate: Map<string, PortWatchObservation[]>,
  date: string,
  origin: string,
): PortWatchObservation | null {
  const cutoff = `${origin}T23:59:59.999Z`;
  return (
    byDate
      .get(date)
      ?.find((o) => o.availableAt && o.availableAt <= cutoff && o.retrievedAt <= cutoff) ?? null
  );
}

export function portWatchAnomaly(series: PortWatchSeries, asOf: string) {
  if (!validDate(asOf)) return { status: 'insufficient_coverage' as const };
  const byDate = indexSeries(series);
  const eligible = series.observations.filter(
    (o) =>
      o.availableAt &&
      o.availableAt <= `${asOf}T23:59:59.999Z` &&
      o.retrievedAt <= `${asOf}T23:59:59.999Z`,
  );
  const lastDate = eligible
    .map((o) => o.date)
    .sort()
    .at(-1);
  if (!lastDate || Date.parse(`${asOf}T00:00:00Z`) - Date.parse(`${lastDate}T00:00:00Z`) > 7 * DAY)
    return { status: 'insufficient_coverage' as const };
  const days = Array.from({ length: 35 }, (_, i) => addDays(lastDate, i - 34));
  const values = days.map((date) => vintageForDate(byDate, date, asOf)?.vesselsPerDay);
  if (values.some((value) => value === undefined))
    return { status: 'insufficient_coverage' as const };
  const counts = values as number[];
  const priorWeeklyMeans = [0, 1, 2, 3].map((week) => mean(counts.slice(week * 7, week * 7 + 7)));
  const reference = [...priorWeeklyMeans].sort((a, b) => a - b);
  const baseline = (reference[1] + reference[2]) / 2;
  if (baseline <= 0) return { status: 'insufficient_coverage' as const };
  const current = mean(counts.slice(28));
  return {
    status:
      current <= baseline * 0.8
        ? ('observed_abnormal_drop' as const)
        : ('observed_within_reference' as const),
    currentMeanVesselsPerDay: current,
    referenceMedianWeeklyMean: baseline,
    changePercent: ((current - baseline) / baseline) * 100,
    windowStart: days[28],
    windowEnd: lastDate,
    referenceStart: days[0],
    referenceEnd: days[27],
  };
}

/** Chronological, seven-day target; predictors use only observations released by origin. */
export function evaluatePortWatch(series: PortWatchSeries): PortWatchBacktest {
  const byDate = indexSeries(series);
  const dates = [...byDate.keys()].sort();
  const holdoutStart = dates[Math.floor(dates.length * 0.6)];
  const folds: {
    origin: string;
    actual: number;
    last: number;
    weeklySeasonal: number;
    rollingMean: number;
  }[] = [];
  for (const origin of dates) {
    if (!holdoutStart || origin < holdoutStart) continue;
    const history = Array.from({ length: 28 }, (_, i) =>
      vintageForDate(byDate, addDays(origin, i - 28), origin),
    );
    if (history.some((o) => !o)) continue;
    const futureDates = Array.from({ length: 7 }, (_, i) => addDays(origin, i + 1));
    const outcomes = futureDates.map((date) =>
      [...(byDate.get(date) ?? [])].reverse().find((o) => o.availableAt),
    );
    if (outcomes.some((o) => !o || o.availableAt! <= `${origin}T23:59:59.999Z`)) continue;
    const h = history as PortWatchObservation[];
    folds.push({
      origin,
      actual: mean((outcomes as PortWatchObservation[]).map((o) => o.vesselsPerDay)),
      last: h[27].vesselsPerDay,
      weeklySeasonal: mean(h.slice(21).map((o) => o.vesselsPerDay)),
      rollingMean: mean(h.map((o) => o.vesselsPerDay)),
    });
  }
  const result: PortWatchBacktest = {
    target: PORTWATCH_TARGET,
    status: folds.length >= 8 ? 'evaluated' : 'insufficient_history',
    provenance: series.provenance,
    folds: folds.length,
    firstOrigin: folds[0]?.origin ?? null,
    lastOrigin: folds.at(-1)?.origin ?? null,
    maeVesselsPerDay: null,
    biasVesselsPerDay: null,
    note:
      series.provenance === 'synthetic_fixture'
        ? 'Synthetic fixture checks research mechanics only; scores are not real-world model performance.'
        : 'Supplied licensed vintages only; assess source revisions and rights before any product use.',
  };
  if (result.status !== 'evaluated') return result;
  const keys = ['last', 'weeklySeasonal', 'rollingMean'] as const;
  result.maeVesselsPerDay = Object.fromEntries(
    keys.map((key) => [key, mean(folds.map((fold) => Math.abs(fold[key] - fold.actual)))]),
  ) as NonNullable<PortWatchBacktest['maeVesselsPerDay']>;
  result.biasVesselsPerDay = Object.fromEntries(
    keys.map((key) => [key, mean(folds.map((fold) => fold[key] - fold.actual))]),
  ) as NonNullable<PortWatchBacktest['biasVesselsPerDay']>;
  return result;
}
