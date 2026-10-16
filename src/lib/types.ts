import type { InputEvidence } from './evidence';
import type { AdditionalCostLine, LedgerLine } from './ledger';
export type SourceKind = 'Illustrative assumption' | 'User assumption';
export interface Route { id: string; origin: string; destination: string; originCode: string; destinationCode: string; originCountry: string; startLat: number; startLng: number; endLat: number; endLng: number; }
export interface AlternativeRoute { enabled: boolean; freightCents: number; switchingCents: number; arrivalDate: string; freightProbabilityBps: number; surchargeCents: number; }
export interface AlternativeSupplier { enabled: boolean; originCountry: string; goodsCents: number; customsCents: number; freightCents: number; dutyRateBps: number; tariffIncreaseBps: number; switchingCents: number; arrivalDate: string; comparable: boolean; }
export interface Shipment {
  id: string; name: string; product: string; supplier: string; routeId: string; originCountry: string; htsCode: string; incoterm: string;
  goodsCents: number; customsCents: number; freightCents: number; otherCents: number; units: number; dutyRateBps: number;
  arrivalDate: string; earlyArrivalDate: string; eventDate: string; leadDays: number; costBasis: 'itemized' | 'bundled';
  tariffProbabilityBps: number; tariffIncreaseBps: number; freightProbabilityBps: number; surchargeCents: number;
  tariffAvoidance: 'assumed' | 'unknown' | 'not-avoided'; earlyFeasible: boolean;
  carryingMode: 'fixed' | 'derived'; earlyCostCents: number; annualHoldingBps: number; holdingDays: number; executionCents: number;
  decisionDate?: string;
  evidence?: Record<string, InputEvidence>;
  costLines?: AdditionalCostLine[];
  intake?: { method: 'csv' | 'manual'; sourceType: 'scenario_assumption' | 'customer_supplied'; reference: string; capturedAt: string };
  alternativeRoute: AlternativeRoute; alternativeSupplier: AlternativeSupplier; edited: string[];
}
export interface Outcome { name: string; tariff: boolean; freight: boolean; probability: number; costCents: number; }
export interface ActionResult { id: 'wait' | 'early' | 'route' | 'supplier'; name: string; expectedCents: number | null; baseCents: number | null; actionCents: number; tariffExposureCents: number; freightExposureCents: number; savingsCents: number | null; eligible: boolean; reason: string; arrivalDate: string; }
export interface ValidAnalysis { valid: true; ledger: LedgerLine[]; baseCents: number; dutyCents: number; tariffImpactCents: number; tariffExposureCents: number; freightExposureCents: number; addedCents: number; expectedCents: number; earlyCostCents: number; breakEven: number | null; outcomes: Outcome[]; actions: ActionResult[]; best: ActionResult; tied: boolean; }
export interface InvalidAnalysis { valid: false; errors: string[]; }
export type AnalysisResult = ValidAnalysis | InvalidAnalysis;
export interface MemoSnapshot { calculatorVersion?: string; shipment: Shipment; route: Route; analysis: ValidAnalysis; timestamp: string; }
// Future model adapters must provide evidence as well as values; no adapter is active in the demo.
export interface ForecastEvidence { modelVersion: string; asOf: string; dataSource: string; evaluationReference: string; laneId: string; horizonDays: number; }
export interface ForecastProvider { forecast(laneId: string, horizonDays: number): Promise<{ medianFreightCents: number; upperFreightCents: number; evidence: ForecastEvidence }>; }
