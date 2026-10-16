import { inputEvidence, validEvidence, type InputEvidence } from './evidence';
import type { Shipment } from './types';

export const costCategories = {
  insurance: 'Insurance',
  brokerage: 'Brokerage',
  port: 'Port / terminal',
  inland: 'Inland transport',
} as const;
export type CostCategory = keyof typeof costCategories;
export type CostInclusion = 'separate' | 'goods' | 'freight' | 'out_of_scope';
export interface AdditionalCostLine {
  category: CostCategory;
  amountCents: number;
  inclusion: CostInclusion;
  evidence?: InputEvidence;
}
export interface LedgerLine {
  id: string;
  label: string;
  amountCents: number;
  contributionCents: number;
  scope: string;
  evidence: InputEvidence;
}
export const inclusionLabels: Record<CostInclusion, string> = {
  separate: 'Added separately',
  goods: 'Already in goods',
  freight: 'Already in freight',
  out_of_scope: 'Outside this cost scope',
};
export const additionalCosts = (s: Shipment): number =>
  (s.costLines ?? []).reduce(
    (sum, line) => sum + (line.inclusion === 'separate' ? line.amountCents : 0),
    0,
  );
export const otherCosts = (s: Shipment): number => s.otherCents + additionalCosts(s);

export function validateCostDetails(s: Shipment): string[] {
  const errors: string[] = [];
  if (s.costLines !== undefined) {
    if (!Array.isArray(s.costLines) || s.costLines.length > 4)
      return ['Use at most one cost line for each supported cost category.'];
    const seen = new Set<string>();
    for (const line of s.costLines) {
      if (!line || !Object.hasOwn(costCategories, line.category) || seen.has(line.category)) {
        errors.push('Cost categories must be known and unique.');
        continue;
      }
      seen.add(line.category);
      if (
        !Number.isSafeInteger(line.amountCents) ||
        line.amountCents < 0 ||
        line.amountCents > 1_000_000_000_000
      )
        errors.push(
          `${costCategories[line.category]} must be a nonnegative amount in whole cents below $10 billion.`,
        );
      if (!Object.hasOwn(inclusionLabels, line.inclusion))
        errors.push(`Choose how ${costCategories[line.category]} is included in the total.`);
      if (line.evidence && !validEvidence(line.evidence))
        errors.push(`Check the source evidence for ${costCategories[line.category]}.`);
    }
  }
  if (s.evidence !== undefined) {
    if (
      !s.evidence ||
      typeof s.evidence !== 'object' ||
      Array.isArray(s.evidence) ||
      Object.keys(s.evidence).length > 50 ||
      !Object.values(s.evidence).every(validEvidence)
    )
      errors.push('Check the attached input evidence.');
  }
  return errors;
}

export function buildCostLedger(s: Shipment, dutyCents: number): LedgerLine[] {
  const dutyEvidence = inputEvidence(s, 'dutyRateBps');
  const lines: LedgerLine[] = [
    {
      id: 'goods',
      label: 'Goods acquisition',
      amountCents: s.goodsCents,
      contributionCents: s.goodsCents,
      scope: 'Goods only',
      evidence: inputEvidence(s, 'goodsCents'),
    },
    {
      id: 'customs_basis',
      label: 'Customs value (basis only)',
      amountCents: s.customsCents,
      contributionCents: 0,
      scope: 'Duty basis only; not a second goods expense',
      evidence: inputEvidence(s, 'customsCents'),
    },
    {
      id: 'duty',
      label: 'Assumed current duty',
      amountCents: dutyCents,
      contributionCents: dutyCents,
      scope: 'Customs value × entered rate; not a duty ruling',
      evidence: dutyEvidence,
    },
    {
      id: 'freight',
      label: 'Freight',
      amountCents: s.freightCents,
      contributionCents: s.freightCents,
      scope: 'Itemized freight estimate',
      evidence: inputEvidence(s, 'freightCents'),
    },
    {
      id: 'other',
      label: 'Other entered costs',
      amountCents: s.otherCents,
      contributionCents: s.otherCents,
      scope: 'Separately entered; exclude categories below',
      evidence: inputEvidence(s, 'otherCents'),
    },
  ];
  for (const line of s.costLines ?? [])
    lines.push({
      id: line.category,
      label: costCategories[line.category],
      amountCents: line.amountCents,
      contributionCents: line.inclusion === 'separate' ? line.amountCents : 0,
      scope: inclusionLabels[line.inclusion],
      evidence: line.evidence ?? {
        state: 'scenario_assumption',
        reference: 'User-entered cost assumption; no attached source.',
      },
    });
  return lines;
}
