import { freshSamples, routes } from './data';
import { analyzeShipment, decisionDate, validateShipment } from './engine';
import { costEvidenceFields, evidenceScope, isIsoDate, type InputEvidence } from './evidence';
import { costCategories, type CostCategory } from './ledger';
import type { Shipment } from './types';

export const MAX_SHIPMENTS = 25;
export const MAX_CSV_BYTES = 1_000_000;
export const CSV_COLUMNS = [
  'shipment_id',
  'shipment_name',
  'product',
  'supplier',
  'country_of_origin',
  'hts_code',
  'route_id',
  'currency',
  'incoterm',
  'decision_date',
  'arrival_date',
  'early_arrival_date',
  'tariff_event_date',
  'lead_days',
  'goods_usd',
  'customs_value_usd',
  'freight_usd',
  'other_usd',
  'insurance_usd',
  'brokerage_usd',
  'port_usd',
  'inland_usd',
  'units',
  'duty_rate_pct',
  'tariff_probability_pct',
  'tariff_increase_pp',
  'freight_probability_pct',
  'freight_surcharge_usd',
  'early_cost_usd',
  'tariff_avoidance',
  'early_feasible',
  'source_type',
  'source_reference',
  'source_as_of',
] as const;
type Column = (typeof CSV_COLUMNS)[number];
const optional = new Set<Column>([
  'product',
  'supplier',
  'hts_code',
  'insurance_usd',
  'brokerage_usd',
  'port_usd',
  'inland_usd',
]);
const aliases: Record<string, Column> = {
  name: 'shipment_name',
  origin_country: 'country_of_origin',
  customs_value: 'customs_value_usd',
  freight_cost_usd: 'freight_usd',
};
export interface ImportRow {
  line: number;
  shipment: Shipment | null;
  errors: string[];
}
export interface CsvPreview {
  rows: ImportRow[];
  errors: string[];
  capturedAt: string;
  fileName: string;
}

// A bounded RFC-4180-style reader. Quoted newlines and doubled quotes are supported.
export function parseCsv(text: string): { cells: string[][]; lines: number[]; error?: string } {
  if (new TextEncoder().encode(text).length > MAX_CSV_BYTES)
    return { cells: [], lines: [], error: 'CSV must be no larger than 1 MB.' };
  text = text.replace(/^\uFEFF/, '');
  const cells: string[][] = [],
    lines: number[] = [];
  let row: string[] = [],
    value = '',
    quoted = false,
    closed = false,
    line = 1,
    rowLine = 1;
  const field = () => {
    row.push(value);
    value = '';
    closed = false;
  };
  const finish = () => {
    field();
    if (row.some((v) => v.trim() !== '')) {
      cells.push(row);
      lines.push(rowLine);
    }
    row = [];
    rowLine = line + 1;
  };
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          value += '"';
          i++;
        } else {
          quoted = false;
          closed = true;
        }
      } else {
        value += c;
        if (c === '\n') line++;
      }
      if (value.length > 4000)
        return {
          cells: [],
          lines: [],
          error: 'A CSV field exceeds the 4,000-character parsing limit.',
        };
      continue;
    }
    if (c === '"') {
      if (value.length || closed)
        return {
          cells: [],
          lines: [],
          error: `Line ${line}: quote must begin at the start of a field.`,
        };
      quoted = true;
    } else if (c === ',') {
      if (row.length >= 63)
        return { cells: [], lines: [], error: 'CSV supports at most 64 columns.' };
      field();
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      finish();
      line++;
      rowLine = line;
    } else if (closed)
      return { cells: [], lines: [], error: `Line ${line}: unexpected text after closing quote.` };
    else value += c;
    if (value.length > 4000)
      return {
        cells: [],
        lines: [],
        error: 'A CSV field exceeds the 4,000-character parsing limit.',
      };
    if (cells.length > MAX_SHIPMENTS + 1)
      return { cells: [], lines: [], error: 'CSV contains too many shipment rows.' };
  }
  if (quoted)
    return { cells: [], lines: [], error: `Line ${rowLine}: quoted field is not closed.` };
  if (value.length || row.length || closed) finish();
  return { cells, lines };
}

function numberValue(
  value: string,
  column: string,
  scale: number,
  max: number,
  integer = false,
): number {
  if (!(integer ? /^(?:0|[1-9]\d*)$/ : /^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/).test(value))
    throw new Error(
      `${column}: enter a nonnegative plain number${integer ? ' with no decimal places' : ' with at most two decimal places'} (no $ or thousands separators).`,
    );
  const n = Math.round(Number(value) * scale);
  if (!Number.isSafeInteger(n) || n > max)
    throw new Error(`${column}: value exceeds the supported range.`);
  return n;
}
function escaped(value: string | number): string {
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function sampleCsv(): string {
  const s = freshSamples()[0];
  const sample: Record<Column, string | number> = {
    shipment_id: 'csv-northstar-example',
    shipment_name: 'Northstar CSV Example',
    product: s.product,
    supplier: s.supplier,
    country_of_origin: s.originCountry,
    hts_code: '',
    route_id: s.routeId,
    currency: 'USD',
    incoterm: s.incoterm,
    decision_date: decisionDate(s),
    arrival_date: s.arrivalDate,
    early_arrival_date: s.earlyArrivalDate,
    tariff_event_date: s.eventDate,
    lead_days: s.leadDays,
    goods_usd: s.goodsCents / 100,
    customs_value_usd: s.customsCents / 100,
    freight_usd: s.freightCents / 100,
    other_usd: 0,
    insurance_usd: 0,
    brokerage_usd: 0,
    port_usd: 0,
    inland_usd: 0,
    units: s.units,
    duty_rate_pct: s.dutyRateBps / 100,
    tariff_probability_pct: 40,
    tariff_increase_pp: 15,
    freight_probability_pct: 20,
    freight_surcharge_usd: 3000,
    early_cost_usd: 3500,
    tariff_avoidance: 'assumed',
    early_feasible: 'true',
    source_type: 'scenario_assumption',
    source_reference: 'Fictional template; replace with your own reference',
    source_as_of: decisionDate(s),
  };
  return `${CSV_COLUMNS.join(',')}\r\n${CSV_COLUMNS.map((c) => escaped(sample[c])).join(',')}\r\n`;
}

export function previewCsv(
  text: string,
  existing: Shipment[],
  context: { fileName: string; capturedAt: string },
): CsvPreview {
  const result: CsvPreview = { rows: [], errors: [], ...context };
  const parsed = parseCsv(text);
  if (parsed.error) return { ...result, errors: [parsed.error] };
  if (parsed.cells.length < 2)
    return { ...result, errors: ['Include a header and at least one shipment row.'] };
  if (parsed.cells.length > MAX_SHIPMENTS + 1)
    return { ...result, errors: [`Import at most ${MAX_SHIPMENTS} shipments at a time.`] };
  const names = parsed.cells[0]
    .map((h) => h.trim().toLowerCase().replaceAll(' ', '_'))
    .map((h) => aliases[h] ?? h);
  if (new Set(names).size !== names.length)
    result.errors.push('Column names must be unique, including aliases.');
  for (const name of names)
    if (!(CSV_COLUMNS as readonly string[]).includes(name))
      result.errors.push(`Unknown column: ${name || '(blank)'}. Use the downloadable template.`);
  for (const name of CSV_COLUMNS)
    if (!optional.has(name) && !names.includes(name))
      result.errors.push(`Missing required column: ${name}.`);
  if (result.errors.length) return result;
  const seen = new Set(existing.map((s) => s.id));
  if (existing.length + parsed.cells.length - 1 > MAX_SHIPMENTS)
    result.errors.push(
      `The workspace supports ${MAX_SHIPMENTS} shipments. This file exceeds the remaining capacity.`,
    );
  for (let i = 1; i < parsed.cells.length; i++) {
    const errors: string[] = [],
      cells = parsed.cells[i];
    const values = Object.fromEntries(
      names.map((name, j) => [name, cells[j]?.trim() ?? '']),
    ) as Record<Column, string>;
    const s = freshSamples()[0];
    delete s.routeEvidence;
    delete s.knownAsset;
    delete s.assumedDisruptionDelayDays;
    s.alternativeRoute.enabled = false;
    s.alternativeSupplier.enabled = false;
    s.costLines = [];
    if (cells.length !== names.length)
      errors.push(`Expected ${names.length} columns; received ${cells.length}.`);
    for (const name of CSV_COLUMNS)
      if (!optional.has(name) && !values[name])
        errors.push(`${name}: value is required; enter 0 explicitly where appropriate.`);
    s.id = values.shipment_id;
    if (!/^[A-Za-z0-9][A-Za-z0-9_-]{0,79}$/.test(s.id))
      errors.push('shipment_id: use 1–80 letters, digits, hyphens or underscores.');
    if (seen.has(s.id))
      errors.push(`Duplicate shipment_id: ${s.id}. Existing shipments are never overwritten.`);
    seen.add(s.id);
    s.name = values.shipment_name;
    s.product = values.product ?? '';
    s.supplier = values.supplier ?? '';
    s.originCountry = values.country_of_origin;
    s.htsCode = (values.hts_code ?? '').replaceAll('.', '');
    s.routeId = values.route_id;
    s.incoterm = values.incoterm;
    for (const [name, value] of [
      ['shipment_name', s.name],
      ['product', s.product],
      ['supplier', s.supplier],
      ['country_of_origin', s.originCountry],
    ] as const)
      if (value.length > 200) errors.push(`${name}: limit text to 200 characters.`);
    if (!routes.some((r) => r.id === s.routeId))
      errors.push(
        'route_id: use sha-lax, hph-sav, ham-ewr, or sha-rtm. Other lanes are not configured yet.',
      );
    if (values.currency !== 'USD')
      errors.push('currency: only explicit USD is supported; no currency conversion is performed.');
    if (!['EXW', 'FCA', 'FOB', 'CFR', 'CIF', 'DAP', 'DDP', 'Other / unknown'].includes(s.incoterm))
      errors.push(
        'incoterm: use a supported template value. Cost inclusions still require itemization.',
      );
    s.decisionDate = values.decision_date;
    s.arrivalDate = values.arrival_date;
    s.earlyArrivalDate = values.early_arrival_date;
    s.eventDate = values.tariff_event_date;
    const numeric: [Column, keyof Shipment, number, number, boolean?][] = [
      ['goods_usd', 'goodsCents', 100, 1e12],
      ['customs_value_usd', 'customsCents', 100, 1e12],
      ['freight_usd', 'freightCents', 100, 1e12],
      ['other_usd', 'otherCents', 100, 1e12],
      ['units', 'units', 1, 1e9, true],
      ['lead_days', 'leadDays', 1, 3650, true],
      ['duty_rate_pct', 'dutyRateBps', 100, 100000],
      ['tariff_probability_pct', 'tariffProbabilityBps', 100, 10000],
      ['tariff_increase_pp', 'tariffIncreaseBps', 100, 100000],
      ['freight_probability_pct', 'freightProbabilityBps', 100, 10000],
      ['freight_surcharge_usd', 'surchargeCents', 100, 1e12],
      ['early_cost_usd', 'earlyCostCents', 100, 1e12],
    ];
    for (const [column, field, scale, max, integer] of numeric) {
      try {
        Object.assign(s, { [field]: numberValue(values[column], column, scale, max, integer) });
      } catch (e) {
        errors.push((e as Error).message);
      }
    }
    if (!['assumed', 'unknown', 'not-avoided'].includes(values.tariff_avoidance))
      errors.push('tariff_avoidance: use assumed, unknown, or not-avoided.');
    else s.tariffAvoidance = values.tariff_avoidance as Shipment['tariffAvoidance'];
    if (!['true', 'false'].includes(values.early_feasible))
      errors.push('early_feasible: enter true or false.');
    s.earlyFeasible = values.early_feasible === 'true';
    s.carryingMode = 'fixed';
    s.costBasis = 'itemized';
    if (!['scenario_assumption', 'customer_supplied'].includes(values.source_type))
      errors.push(
        'source_type: use scenario_assumption or customer_supplied; imported records cannot claim independent verification.',
      );
    if (!values.source_reference || values.source_reference.length > 500)
      errors.push('source_reference: enter a reference of 1–500 characters.');
    if (!isIsoDate(values.source_as_of) || values.source_as_of > s.decisionDate)
      errors.push('source_as_of: use a valid date on or before the scenario decision date.');
    const sourceType =
      values.source_type === 'customer_supplied' ? 'customer_supplied' : 'scenario_assumption';
    const evidence: InputEvidence =
      sourceType === 'customer_supplied'
        ? {
            state: sourceType,
            reference: values.source_reference,
            observedOn: values.source_as_of,
            capturedAt: context.capturedAt,
            scope: evidenceScope(s),
          }
        : {
            state: sourceType,
            reference: values.source_reference,
            capturedAt: context.capturedAt,
            asOfDate: values.source_as_of,
          };
    s.evidence = Object.fromEntries(costEvidenceFields.map((field) => [field, { ...evidence }]));
    for (const category of Object.keys(costCategories) as CostCategory[]) {
      const column = `${category}_usd` as Column;
      if (!values[column]) continue; // Optional absent charges are outside scope, never asserted as measured zero.
      try {
        s.costLines.push({
          category,
          amountCents: numberValue(values[column], column, 100, 1e12),
          inclusion: 'separate',
          evidence: { ...evidence },
        });
      } catch (e) {
        errors.push((e as Error).message);
      }
    }
    s.intake = {
      method: 'csv',
      sourceType,
      reference: context.fileName,
      capturedAt: context.capturedAt,
    };
    s.edited = [...numeric.map(([, field]) => field), 'name', 'routeId', 'originCountry'];
    s.alternativeRoute.arrivalDate = s.arrivalDate;
    s.alternativeSupplier.arrivalDate = s.arrivalDate;
    errors.push(...validateShipment(s));
    result.rows.push({
      line: parsed.lines[i],
      shipment: errors.length ? null : s,
      errors: [...new Set(errors)],
    });
  }
  return result;
}

export function commitImport(
  preview: CsvPreview,
  current: Shipment[],
): { shipments: Shipment[]; error?: string } {
  if (
    preview.errors.length ||
    !preview.rows.length ||
    preview.rows.some((r) => r.errors.length || !r.shipment)
  )
    return {
      shipments: current,
      error: 'Fix every preview error before importing. No rows were added.',
    };
  if (current.length + preview.rows.length > MAX_SHIPMENTS)
    return {
      shipments: current,
      error: `Workspace capacity is ${MAX_SHIPMENTS} shipments. No rows were added.`,
    };
  const seen = new Set(current.map((s) => s.id));
  for (const row of preview.rows) {
    const s = row.shipment!;
    if (seen.has(s.id) || !analyzeShipment(s).valid)
      return {
        shipments: current,
        error: `Shipment ${s.id} is duplicated or no longer valid. Preview again; no rows were added.`,
      };
    seen.add(s.id);
  }
  return { shipments: [...current, ...preview.rows.map((r) => structuredClone(r.shipment!))] };
}
