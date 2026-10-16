import { describe, expect, it } from 'vitest';
import { freshSamples } from './data';
import { getEvent, probabilityFor, zonesForEvent } from './riskEvents';
import { conditionalImpact, matchExposure } from './riskExposure';

describe('event exposure matching', () => {
  const samples = freshSamples();
  const northstar = samples.find((s) => s.id === 'northstar')!;
  const nordic = samples.find((s) => s.id === 'nordic-home')!;
  const fieldwork = samples.find((s) => s.id === 'fieldwork')!;
  const tariff = getEvent('demo-tariff-china-home')!;
  const suez = getEvent('demo-suez-red-sea')!;

  it('maps the China tariff demo to Northstar and not to Vietnam origin', () => {
    expect(matchExposure(tariff, northstar).relationship).toBe('reviewed');
    expect(matchExposure(tariff, fieldwork).relationship).toBe('not_applicable');
  });

  it('does not expose Shanghai → Los Angeles to a Red Sea corridor event', () => {
    const link = matchExposure(suez, northstar);
    expect(link.relationship).toBe('not_applicable');
    expect(link.rationale).toMatch(/no declared suez-red-sea corridor/i);
  });

  it('exposes only the declared Suez corridor shipment', () => {
    expect(matchExposure(suez, nordic).relationship).toBe('reviewed');
    expect(matchExposure(suez, fieldwork).relationship).toBe('not_applicable');
  });

  it('keeps automatic probability unavailable for the corridor event', () => {
    const signal = probabilityFor('demo-suez-red-sea')!;
    expect(signal.probabilityBps).toBeNull();
    expect(signal.status).toBe('unavailable');
  });

  it('labels tariff demo odds as an uncalibrated assumption, not a model forecast', () => {
    const signal = probabilityFor('demo-tariff-china-home')!;
    expect(signal.sourceType).toBe('user_assumption');
    expect(signal.isCalibrated).toBe(false);
    expect(signal.probabilityBps).toBe(4000);
    expect(signal.status).toBe('illustrative');
  });

  it('reports conditional tariff dollars without inventing occurrence odds', () => {
    const link = matchExposure(tariff, northstar);
    const impact = conditionalImpact(tariff, northstar, link);
    expect(impact.estimatedExtraCostCents).toBe(1_500_000);
    expect(impact.estimateStatus).toBe('illustrative');
  });

  it('keeps nordic-home tariff exposure reviewed but conditional dollars unavailable when no duty assumption', () => {
    const link = matchExposure(tariff, nordic);
    expect(link.relationship).toBe('reviewed');
    const impact = conditionalImpact(tariff, nordic, link);
    expect(impact.estimatedExtraCostCents).toBeNull();
    expect(impact.estimateStatus).toBe('unavailable');
    expect(impact.unitsAndBasis).toMatch(/no additional duty assumption entered/i);
  });

  it('refuses quantified corridor impact when no surcharge is entered', () => {
    const bare = { ...nordic, surchargeCents: 0 };
    const link = matchExposure(suez, bare);
    const impact = conditionalImpact(suez, bare, link);
    expect(impact.estimatedExtraCostCents).toBeNull();
    expect(impact.estimateStatus).toBe('unavailable');
  });

  it('attaches a geographic watch zone only to corridor events', () => {
    expect(zonesForEvent(tariff)).toEqual([]);
    expect(zonesForEvent(suez).map((z) => z.id)).toEqual(['suez-red-sea']);
  });
});
