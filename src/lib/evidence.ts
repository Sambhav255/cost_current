import type { Shipment } from './types';

export type EvidenceState =
  | 'verified_official'
  | 'verified_licensed'
  | 'customer_supplied'
  | 'model_estimated'
  | 'scenario_assumption'
  | 'unknown';
export interface EvidenceScope {
  routeId: string;
  originCountry: string;
  units: number;
  currency: 'USD';
}
export type InputEvidence = (
  | { state: 'scenario_assumption'; reference: string; capturedAt?: string; asOfDate?: string }
  | { state: 'customer_supplied'; reference: string; observedOn: string; capturedAt: string }
  | {
      state: 'verified_official';
      reference: string;
      observedOn: string;
      capturedAt: string;
      url: string;
      revision: string;
      effectiveFrom: string;
      reviewedBy: string;
    }
  | {
      state: 'verified_licensed';
      reference: string;
      observedOn: string;
      capturedAt: string;
      licenseReference: string;
      permittedUse: string;
    }
  | {
      state: 'model_estimated';
      reference: string;
      observedOn: string;
      capturedAt: string;
      modelVersion: string;
      horizonDays: number;
      evaluationReference: string;
    }
  | { state: 'unknown'; reason: string }
) & { scope?: EvidenceScope };

export const evidenceLabels: Record<EvidenceState, string> = {
  verified_official: 'Reviewed official source',
  verified_licensed: 'Licensed source',
  customer_supplied: 'Customer supplied',
  model_estimated: 'Model estimate',
  scenario_assumption: 'Scenario assumption',
  unknown: 'Unknown / unavailable',
};
export const costEvidenceFields = [
  'goodsCents',
  'customsCents',
  'freightCents',
  'otherCents',
  'dutyRateBps',
] as const;
export type CostEvidenceField = (typeof costEvidenceFields)[number];
export const isIsoDate = (d: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(d) &&
  !Number.isNaN(Date.parse(d)) &&
  new Date(d).toISOString().slice(0, 10) === d;
const text = (x: unknown): x is string =>
  typeof x === 'string' && x.trim().length > 0 && x.length <= 1000;
const timestamp = (x: unknown): x is string =>
  typeof x === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(x) && !Number.isNaN(Date.parse(x));

export function validEvidence(value: unknown): value is InputEvidence {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  if (v.scope !== undefined) {
    if (!v.scope || typeof v.scope !== 'object') return false;
    const scope = v.scope as Record<string, unknown>;
    if (
      !text(scope.routeId) ||
      !text(scope.originCountry) ||
      !Number.isInteger(scope.units) ||
      Number(scope.units) < 1 ||
      scope.currency !== 'USD'
    )
      return false;
  }
  if (v.state === 'unknown') return text(v.reason);
  if (!text(v.reference)) return false;
  if (v.state === 'scenario_assumption')
    return (
      (v.capturedAt === undefined || timestamp(v.capturedAt)) &&
      (v.asOfDate === undefined || (typeof v.asOfDate === 'string' && isIsoDate(v.asOfDate)))
    );
  if (!text(v.observedOn) || !isIsoDate(v.observedOn) || !timestamp(v.capturedAt)) return false;
  if (v.state === 'customer_supplied') return true;
  if (v.state === 'verified_official')
    return (
      text(v.url) &&
      /^https:\/\//.test(v.url) &&
      text(v.revision) &&
      text(v.effectiveFrom) &&
      isIsoDate(v.effectiveFrom) &&
      text(v.reviewedBy)
    );
  if (v.state === 'verified_licensed') return text(v.licenseReference) && text(v.permittedUse);
  if (v.state === 'model_estimated')
    return (
      text(v.modelVersion) &&
      Number.isInteger(v.horizonDays) &&
      Number(v.horizonDays) > 0 &&
      text(v.evaluationReference)
    );
  return false;
}

export function inputEvidence(s: Shipment, field: string): InputEvidence {
  const supplied = s.evidence?.[field];
  if (supplied && validEvidence(supplied)) return supplied;
  return {
    state: 'scenario_assumption',
    reference: s.edited.includes(field)
      ? 'User-entered assumption; no attached source.'
      : 'Fictional demonstration assumption.',
  };
}
export function evidenceDescription(e: InputEvidence): string {
  return e.state === 'unknown' ? e.reason : e.reference;
}
export function evidenceDate(e: InputEvidence): string | null {
  return 'observedOn' in e
    ? e.observedOn
    : e.state === 'scenario_assumption'
      ? (e.asOfDate ?? null)
      : null;
}
export function hasCustomerEvidence(s: Shipment): boolean {
  return (
    Object.values(s.evidence ?? {}).some((e) => e.state === 'customer_supplied') ||
    (s.costLines ?? []).some((line) => line.evidence?.state === 'customer_supplied')
  );
}

export function evidenceScope(s: Shipment): EvidenceScope {
  return { routeId: s.routeId, originCountry: s.originCountry, units: s.units, currency: 'USD' };
}

// Quotes apply to a particular shipment context. An edit never silently retains their authority.
export function invalidateEvidenceForEdit(s: Shipment, field: keyof Shipment): Partial<Shipment> {
  const contextChanged = ['routeId', 'originCountry', 'units', 'incoterm', 'costBasis'].includes(
    field,
  );
  const unknown = (e: InputEvidence): InputEvidence => ({
    state: 'unknown',
    reason:
      'Input edited; attach updated source evidence.' +
      ('reference' in e ? ' Previous source: ' + e.reference : ''),
    ...(e.scope ? { scope: e.scope } : {}),
  });
  const evidence = s.evidence
    ? Object.fromEntries(
        Object.entries(s.evidence).map(([key, e]) => [
          key,
          contextChanged || key === field ? unknown(e) : e,
        ]),
      )
    : undefined;
  return {
    ...(evidence ? { evidence } : {}),
    ...(contextChanged && s.costLines
      ? {
          costLines: s.costLines.map((line) => ({
            ...line,
            evidence: line.evidence
              ? unknown(line.evidence)
              : {
                  state: 'unknown' as const,
                  reason: 'Shipment context changed; confirm this cost.',
                },
          })),
        }
      : {}),
  };
}
