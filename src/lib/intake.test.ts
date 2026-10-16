import { describe, expect, it, vi } from 'vitest';
import { freshSamples } from './data';
import { commitImport, CSV_COLUMNS, parseCsv, previewCsv, sampleCsv } from './csv';
import { analyzeShipment } from './engine';
import { evidenceLabels, invalidateEvidenceForEdit, validEvidence } from './evidence';
import { otherCosts } from './ledger';
import { loadShipments, saveShipments } from './storage';
import type { Shipment, ValidAnalysis } from './types';

const context = { fileName: 'fictional-test.csv', capturedAt: '2026-10-15T23:00:00.000Z' };
function fixture(changes: Record<string, string> = {}) {
  const { cells } = parseCsv(sampleCsv());
  const values = Object.fromEntries(cells[0].map((c, i) => [c, cells[1][i]]));
  Object.assign(values, changes);
  const quote = (s: string) => (/[",\r\n]/.test(s) ? '"' + s.replaceAll('"', '""') + '"' : s);
  return (
    CSV_COLUMNS.join(',') + '\r\n' + CSV_COLUMNS.map((c) => quote(values[c])).join(',') + '\r\n'
  );
}
function calculate(s: Shipment): ValidAnalysis {
  const a = analyzeShipment(s);
  if (!a.valid) throw new Error(a.errors.join('; '));
  return a;
}
function imported(changes: Record<string, string> = {}) {
  const preview = previewCsv(fixture(changes), freshSamples(), context);
  expect(preview.errors).toEqual([]);
  expect(preview.rows[0].errors).toEqual([]);
  return preview.rows[0].shipment!;
}

describe('strict local CSV intake', () => {
  it('reproduces the canonical sample without promoting fiction into customer evidence', () => {
    const s = imported();
    const a = calculate(s);
    expect(a.baseCents).toBe(11_700_000);
    expect(a.expectedCents).toBe(12_360_000);
    expect(s.evidence?.freightCents.state).toBe('scenario_assumption');
    expect(s.intake?.sourceType).toBe('scenario_assumption');
    expect(s.routeEvidence).toBeUndefined();
  });
  it('records quote reference, claimed source date, capture time and customer provenance', () => {
    const s = imported({
      source_type: 'customer_supplied',
      source_reference: 'Quote ACME-001',
      source_as_of: '2026-10-14',
    });
    expect(s.evidence?.freightCents).toEqual({
      state: 'customer_supplied',
      reference: 'Quote ACME-001',
      observedOn: '2026-10-14',
      capturedAt: context.capturedAt,
      scope: { routeId: 'sha-lax', originCountry: 'China', units: 5000, currency: 'USD' },
    });
    expect(s.evidence?.tariffProbabilityBps).toBeUndefined();
    expect(s.tariffProbabilityBps).toBe(4000);
  });
  it('handles BOM, CRLF, commas, doubled quotes and quoted newlines', () => {
    const result = parseCsv('\uFEFFname,note\r\n"A, B","two ""quotes""\nand a newline"\r\n');
    expect(result.error).toBeUndefined();
    expect(result.cells[1]).toEqual(['A, B', 'two "quotes"\nand a newline']);
  });
  it('bounds header width and individual fields before creating a large error preview', () => {
    expect(parseCsv(Array(1000).fill('x').join(',') + '\n').error).toMatch(/64 columns/);
    expect(parseCsv('id,name\n1,' + 'x'.repeat(4001)).error).toMatch(/parsing limit/);
  });
  it('rejects malformed quoting without accepting partial data', () => {
    expect(parseCsv('id,name\n1,"unfinished').error).toMatch(/not closed/);
    expect(parseCsv('id,name\n1,"closed"junk').error).toMatch(/unexpected text/);
    expect(parseCsv('id,name\n1,ba"d').error).toMatch(/quote must begin/);
  });
  it.each([
    ['negative amount', { freight_usd: '-1' }],
    ['ambiguous numeric text', { freight_usd: '7000abc' }],
    ['extra precision', { freight_usd: '7000.001' }],
    ['unsupported currency', { currency: 'EUR' }],
    ['invalid probability', { tariff_probability_pct: '100.01' }],
    ['missing required zero', { other_usd: '' }],
    ['unknown lane', { route_id: 'unknown' }],
    ['invalid date', { arrival_date: '2026-02-30' }],
    ['invalid HTS shape', { hts_code: '123' }],
    ['future source data', { source_as_of: '2026-10-17' }],
    ['false official verification', { source_type: 'verified_official' }],
    ['fractional units', { units: '1.5' }],
    ['oversized cost', { customs_value_usd: '999999999999999999999' }],
  ])('blocks %s and commits nothing', (_name, changes) => {
    const current = freshSamples();
    const preview = previewCsv(fixture(changes), current, context);
    expect(preview.rows[0].errors.length).toBeGreaterThan(0);
    const result = commitImport(preview, current);
    expect(result.error).toBeTruthy();
    expect(result.shipments).toBe(current);
  });
  it('blocks existing and within-file duplicate IDs', () => {
    expect(
      previewCsv(
        fixture({ shipment_id: 'northstar' }),
        freshSamples(),
        context,
      ).rows[0].errors.join(' '),
    ).toMatch(/Duplicate/);
    const csv = sampleCsv(),
      row = csv.trimEnd().split('\r\n')[1];
    const preview = previewCsv(csv + row + '\r\n', freshSamples(), context);
    expect(preview.rows[1].errors.join(' ')).toMatch(/Duplicate/);
  });
  it('rechecks duplicates at commit and deep-clones accepted records', () => {
    const current = freshSamples(),
      preview = previewCsv(sampleCsv(), current, context);
    const result = commitImport(preview, current);
    expect(result.shipments).toHaveLength(5);
    expect(commitImport(preview, result.shipments).error).toMatch(/duplicated/);
    preview.rows[0].shipment!.name = 'Mutated preview';
    expect(result.shipments[4].name).toBe('Northstar CSV Example');
  });
  it('rejects a whole batch when one row fails', () => {
    const good = sampleCsv(),
      badRow = fixture({ shipment_id: 'bad-2', goods_usd: '-1' }).trimEnd().split('\r\n')[1];
    const current = freshSamples(),
      preview = previewCsv(good + badRow + '\r\n', current, context);
    expect(preview.rows[0].errors).toEqual([]);
    expect(preview.rows[1].errors.length).toBeGreaterThan(0);
    expect(commitImport(preview, current).shipments).toBe(current);
  });
  it('rejects unknown or duplicate normalized headers and enforces capacity/size', () => {
    expect(
      previewCsv(sampleCsv().replace('shipment_name', 'surprise'), [], context).errors.join(),
    ).toMatch(/Unknown column/);
    expect(
      previewCsv(sampleCsv().replace('product,', 'shipment_name,'), [], context).errors.join(),
    ).toMatch(/unique/);
    const existing = Array.from({ length: 25 }, (_, i) => ({
      ...freshSamples()[0],
      id: 'existing-' + i,
    }));
    expect(previewCsv(sampleCsv(), existing, context).errors.join()).toMatch(/capacity/);
    expect(parseCsv('x'.repeat(1_000_001)).error).toMatch(/1 MB/);
  });
});

describe('itemized cost ledger and timing', () => {
  it('adds only separately incurred costs and never adds customs value twice', () => {
    const s = freshSamples()[0];
    s.costLines = [
      { category: 'insurance', amountCents: 10_000, inclusion: 'separate' },
      { category: 'brokerage', amountCents: 20_000, inclusion: 'goods' },
      { category: 'port', amountCents: 30_000, inclusion: 'freight' },
      { category: 'inland', amountCents: 40_000, inclusion: 'out_of_scope' },
    ];
    const a = calculate(s);
    expect(a.baseCents).toBe(11_710_000);
    expect(otherCosts(s)).toBe(10_000);
    expect(a.ledger.reduce((sum, line) => sum + line.contributionCents, 0)).toBe(a.baseCents);
    expect(a.ledger.find((line) => line.id === 'customs_basis')?.contributionCents).toBe(0);
  });
  it('includes optional additional CSV charges and preserves them in supplier comparisons', () => {
    const s = imported({
      insurance_usd: '100',
      brokerage_usd: '200',
      port_usd: '300',
      inland_usd: '400',
    });
    const a = calculate(s);
    expect(a.baseCents).toBe(11_800_000);
    s.alternativeSupplier.enabled = true;
    s.alternativeSupplier.comparable = true;
    expect(calculate(s).actions[3].baseCents).toBe(12_050_000);
  });
  it('uses the explicit decision date for lead-time eligibility', () => {
    const s = freshSamples()[0];
    s.decisionDate = '2026-11-01';
    expect(calculate(s).actions[1].eligible).toBe(false);
  });
  it('blocks future quote evidence when the decision date is moved earlier', () => {
    const s = imported({ source_type: 'customer_supplied', source_as_of: '2026-10-16' });
    s.decisionDate = '2026-10-15';
    expect(analyzeShipment(s).valid).toBe(false);
  });
  it('invalidates evidence when a value or quote context changes', () => {
    const s = imported({ source_type: 'customer_supplied' });
    const priceEdit = {
      ...s,
      ...invalidateEvidenceForEdit(s, 'freightCents'),
      freightCents: 800000,
    };
    expect(priceEdit.evidence?.freightCents.state).toBe('unknown');
    expect(priceEdit.evidence?.goodsCents.state).toBe('customer_supplied');
    const routeEdit = { ...s, ...invalidateEvidenceForEdit(s, 'routeId'), routeId: 'ham-ewr' };
    expect(routeEdit.originCountry).toBe('China');
    expect(Object.values(routeEdit.evidence ?? {}).every((e) => e.state === 'unknown')).toBe(true);
    expect(routeEdit.evidence?.freightCents.scope?.routeId).toBe('sha-lax');
  });
  it('rejects malformed source records without throwing during validation', () => {
    const s = freshSamples()[0];
    s.evidence = JSON.parse('{"goodsCents":"malformed"}');
    expect(() => analyzeShipment(s)).not.toThrow();
    expect(analyzeShipment(s).valid).toBe(false);
  });
  it('rejects duplicate cost categories and malformed evidence', () => {
    const s = freshSamples()[0];
    s.costLines = [
      { category: 'insurance', amountCents: 0, inclusion: 'separate' },
      { category: 'insurance', amountCents: 0, inclusion: 'goods' },
    ];
    expect(analyzeShipment(s).valid).toBe(false);
    expect(
      validEvidence({
        state: 'customer_supplied',
        reference: 'Quote',
        observedOn: 'invalid',
        capturedAt: context.capturedAt,
      }),
    ).toBe(false);
    expect(Object.keys(evidenceLabels)).toHaveLength(6);
  });
});

describe('additive local storage compatibility', () => {
  it('loads legacy samples and round-trips new cost/source fields', () => {
    const memory = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => memory.get(k) ?? null,
      setItem: (k: string, v: string) => memory.set(k, v),
      removeItem: (k: string) => memory.delete(k),
    });
    try {
      expect(saveShipments(freshSamples())).toBe(true);
      expect(loadShipments()[0].id).toBe('northstar');
      const legacy = freshSamples();
      for (const shipment of legacy) delete shipment.routeEvidence;
      memory.set('cost-current-demo-v1', JSON.stringify({ version: 1, shipments: legacy }));
      expect(loadShipments()[0].routeEvidence).toBeUndefined();
      const s = imported({ source_type: 'customer_supplied', insurance_usd: '100' });
      expect(saveShipments([s])).toBe(true);
      expect(loadShipments()[0]).toEqual(s);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
