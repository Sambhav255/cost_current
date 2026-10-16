export type SignalStatus =
  | 'observed_official'
  | 'observed_market_quote'
  | 'model_estimate'
  | 'illustrative'
  | 'stale'
  | 'unavailable';

export type ExposureRelationship =
  'confirmed' | 'reviewed' | 'possible' | 'not_applicable' | 'unknown';

export type RiskEventKind = 'trade_policy' | 'chokepoint' | 'port' | 'weather' | 'freight';

export interface RiskEvent {
  id: string;
  name: string;
  kind: RiskEventKind;
  definition: string;
  horizonStart: string;
  horizonEnd: string;
  observedAsOf: string;
  locations: string[];
  legalOrOperatingStatus: string;
  evidenceSummary: string[];
  isDemoScenario: boolean;
  corridorId: string | null;
  originCountries: string[];
  productHint: string;
}

export interface ProbabilitySignal {
  eventId: string;
  sourceType: 'market_quote' | 'statistical_model' | 'user_assumption';
  probabilityBps: number | null;
  generatedOrQuotedAt: string;
  modelOrContractId: string | null;
  resolutionReference: string | null;
  isCalibrated: boolean;
  status: SignalStatus;
  limitations: string[];
}

export interface ExposureLink {
  eventId: string;
  shipmentId: string;
  relationship: ExposureRelationship;
  rationale: string;
  corridorOrProductRuleRef: string;
  affectedCostCategories: string[];
}

export interface ConditionalImpact {
  eventId: string;
  shipmentId: string;
  estimatedExtraCostCents: number | null;
  estimatedDelayDays: number | null;
  estimateStatus: SignalStatus;
  unitsAndBasis: string;
  modelVersion: string | null;
  assumptions: string[];
}

export interface EventZone {
  id: string;
  label: string;
  points: { lat: number; lng: number }[];
}

export const DEMO_EVENTS: RiskEvent[] = [
  {
    id: 'demo-tariff-china-home',
    name: 'Additional duty on selected China-origin home goods',
    kind: 'trade_policy',
    definition:
      'Illustrative scenario: a stated additional 15 percentage-point duty becomes effective for defined China-origin ceramic tableware before U.S. entry within the horizon. Not an enacted rule.',
    horizonStart: '2026-10-16',
    horizonEnd: '2026-12-15',
    observedAsOf: '2026-10-16',
    locations: ['China', 'United States'],
    legalOrOperatingStatus: 'illustrative_demo — not proposed or enacted law',
    evidenceSummary: [
      'No official notice or determination is attached in this local demo.',
      'Conditional dollars use the existing Northstar shipment assumptions.',
    ],
    isDemoScenario: true,
    corridorId: null,
    originCountries: ['China'],
    productHint: 'home goods / ceramic tableware',
  },
  {
    id: 'demo-suez-red-sea',
    name: 'Red Sea / Suez corridor inaccessible for ocean routing',
    kind: 'chokepoint',
    definition:
      'Illustrative operational outcome: the declared Suez/Red Sea corridor is unavailable for at least 14 consecutive days inside a 30-day window, forcing diversion or delay for shipments that declare that corridor.',
    horizonStart: '2026-10-16',
    horizonEnd: '2026-11-30',
    observedAsOf: '2026-10-16',
    locations: ['Bab el-Mandeb', 'Suez Canal', 'Red Sea'],
    legalOrOperatingStatus: 'illustrative_demo — fictional disruption case',
    evidenceSummary: [
      'No live vessel, port notice, or market contract is attached.',
      'Exposure requires a shipment with an explicitly declared Suez/Red Sea corridor.',
      'Shanghai to Los Angeles does not declare that corridor and is not auto-exposed.',
    ],
    isDemoScenario: true,
    corridorId: 'suez-red-sea',
    originCountries: [],
    productHint: '',
  },
];

export const DEMO_PROBABILITY_SIGNALS: ProbabilitySignal[] = [
  {
    eventId: 'demo-tariff-china-home',
    sourceType: 'user_assumption',
    probabilityBps: 4000,
    generatedOrQuotedAt: '2026-10-16T12:00:00.000Z',
    modelOrContractId: null,
    resolutionReference: null,
    isCalibrated: false,
    status: 'illustrative',
    limitations: [
      'This 40% figure is a demo scenario assumption, not an AI or market forecast.',
      'Automatic policy likelihood is unavailable.',
    ],
  },
  {
    eventId: 'demo-suez-red-sea',
    sourceType: 'statistical_model',
    probabilityBps: null,
    generatedOrQuotedAt: '2026-10-16T12:00:00.000Z',
    modelOrContractId: null,
    resolutionReference: null,
    isCalibrated: false,
    status: 'unavailable',
    limitations: [
      'No calibrated occurrence model or qualified prediction-market contract is wired.',
      'Conditional impact may still be explored under manual assumptions.',
    ],
  },
];

export const DEMO_EVENT_ZONES: EventZone[] = [
  {
    id: 'suez-red-sea',
    label: 'Illustrative Red Sea / Suez watch zone',
    points: [
      { lat: 29.9, lng: 32.5 },
      { lat: 27.5, lng: 34.0 },
      { lat: 21.5, lng: 38.5 },
      { lat: 12.6, lng: 43.3 },
    ],
  },
];

export function listDemoEvents(): RiskEvent[] {
  return DEMO_EVENTS;
}

export function getEvent(eventId: string): RiskEvent | undefined {
  return DEMO_EVENTS.find((e) => e.id === eventId);
}

export function probabilityFor(eventId: string): ProbabilitySignal | undefined {
  return DEMO_PROBABILITY_SIGNALS.find((s) => s.eventId === eventId);
}

export function zonesForEvent(event: RiskEvent): EventZone[] {
  if (!event.corridorId) return [];
  return DEMO_EVENT_ZONES.filter((z) => z.id === event.corridorId);
}
