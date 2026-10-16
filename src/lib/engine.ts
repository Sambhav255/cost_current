import { isIsoDate } from './evidence';
import { buildCostLedger, otherCosts, validateCostDetails } from './ledger';
import { DEMO_AS_OF } from './data';
import type { ActionResult, AnalysisResult, Shipment } from './types';
const finite = (n: number) => typeof n === 'number' && Number.isFinite(n);
const money = (n: number) => finite(n) && n >= 0 && n <= 1_000_000_000_000;
const rate = (n: number) => finite(n) && n >= 0 && n <= 10000;
export const validDate = isIsoDate;
export const decisionDate = (s: Shipment) => s.decisionDate ?? DEMO_AS_OF;
export const roundCents = (n: number) => Math.round(n + Number.EPSILON);
export const holdingCost = (s: Shipment) => s.carryingMode === 'fixed' ? s.earlyCostCents : s.goodsCents * s.annualHoldingBps / 10000 * s.holdingDays / 365 + s.executionCents;
export function validateShipment(s: Shipment): string[] {
  const errors: string[] = validateCostDetails(s);
  const asOf = decisionDate(s);
  if (!validDate(asOf)) errors.push('Enter a valid scenario decision date.');
  if (validDate(asOf)) {
    const sources = [...Object.values(s.evidence ?? {}), ...(Array.isArray(s.costLines) ? s.costLines.flatMap(line => line?.evidence ? [line.evidence] : []) : [])];
    if (sources.some(e => e && typeof e==='object' && 'observedOn' in e && typeof e.observedOn==='string' && e.observedOn > asOf)) errors.push('A cost source is dated after the scenario decision date; update the date or attach earlier evidence.');
  }
  if (s.htsCode && !/^(?:\d{8}|\d{10})$/.test(s.htsCode.replace(/\./g, ''))) errors.push('HTS reference must contain 8 or 10 digits; this does not verify classification.');
  if (!s.name.trim()) errors.push('Enter a shipment name.');
  if (!s.originCountry.trim()) errors.push('Enter the country of origin.');
  const amounts: [string,number][] = [['Goods acquisition cost',s.goodsCents],['Customs value',s.customsCents],['Freight estimate',s.freightCents],['Other itemized costs',s.otherCents],['Freight surcharge',s.surchargeCents]];
  for (const [name, value] of amounts) if (!money(value)) errors.push(`${name} must be a nonnegative amount below $10 billion.`);
  for (const [name,value] of [['Duty rate',s.dutyRateBps],['Tariff increase',s.tariffIncreaseBps]] as const) if (!finite(value) || value < 0 || value > 100000) errors.push(`${name} must be between 0% and 1,000%.`);
  for (const [name,value] of [['Tariff probability',s.tariffProbabilityBps],['Freight probability',s.freightProbabilityBps]] as const) if (!rate(value)) errors.push(`${name} must be between 0% and 100%.`);
  if (!finite(s.units) || !Number.isInteger(s.units) || s.units < 1 || s.units > 1e9) errors.push('Units must be a positive whole number below one billion.');
  if (!finite(s.leadDays) || !Number.isInteger(s.leadDays) || s.leadDays < 0 || s.leadDays > 3650) errors.push('Lead time must be between 0 and 3,650 whole days.');
  if (!validDate(s.arrivalDate) || !validDate(s.eventDate) || !validDate(s.earlyArrivalDate)) errors.push('Enter valid arrival and hypothetical tariff dates.');
  else if (s.arrivalDate < asOf || s.earlyArrivalDate < asOf || s.eventDate < asOf) errors.push(`Scenario dates must be on or after the scenario decision date, ${asOf}.`);
  if (s.costBasis !== 'itemized') errors.push('Separate goods, freight, duty, and other costs before comparing a bundled quote.');
  if (s.carryingMode === 'fixed') { if (!money(s.earlyCostCents)) errors.push('Early purchase cost must be a nonnegative amount.'); }
  else if (!rate(s.annualHoldingBps) || !finite(s.holdingDays) || s.holdingDays < 0 || s.holdingDays > 3650 || !money(s.executionCents)) errors.push('Check the annual holding rate, days held, and execution cost.');
  return errors;
}
export function analyzeShipment(s: Shipment): AnalysisResult {
  const errors = validateShipment(s);
  if (errors.length) return {valid:false,errors};
  const p = s.tariffProbabilityBps / 10000, q = s.freightProbabilityBps / 10000;
  const duty = roundCents(s.customsCents * s.dutyRateBps / 10000);
  const base = s.goodsCents + duty + s.freightCents + otherCosts(s);
  // The scenario uses entry dates as a stated assumption, never as a legal ruling.
  const waitExposed = s.arrivalDate >= s.eventDate;
  const impact = roundCents(s.customsCents * s.tariffIncreaseBps / 10000);
  const tariff = waitExposed ? p * impact : 0, freight = q * s.surchargeCents;
  const expected = base + tariff + freight, earlyCost = holdingCost(s);
  const earlyCanAvoid = s.tariffAvoidance === 'assumed' && s.earlyArrivalDate < s.eventDate;
  const earlyTariff = earlyCanAvoid || !waitExposed ? 0 : p * impact;
  const earliest = new Date(`${decisionDate(s)}T00:00:00Z`); earliest.setUTCDate(earliest.getUTCDate()+s.leadDays);
  const feasibleDate = s.earlyArrivalDate >= earliest.toISOString().slice(0,10) && s.earlyArrivalDate <= s.arrivalDate;
  const known = s.tariffAvoidance !== 'unknown';
  const earlyEligible = known && s.earlyFeasible && feasibleDate;
  const earlyReason = !known ? 'Confirm whether early entry would avoid the hypothetical tariff.' : !s.earlyFeasible ? 'Early shipment is marked operationally unavailable.' : !feasibleDate ? 'Early arrival conflicts with the lead time or planned arrival.' : !waitExposed ? 'Both arrival dates precede the hypothetical tariff event. There is no tariff exposure to avoid. Freight risk is unchanged.' : earlyCanAvoid ? 'Avoids only the tariff increase under the stated entry-date assumption. Freight risk is unchanged.' : 'Does not avoid the tariff increase. Freight risk is unchanged.';
  const action = (a: Omit<ActionResult,'savingsCents'>): ActionResult => ({...a,savingsCents:a.expectedCents === null ? null : expected-a.expectedCents});
  const actions: ActionResult[] = [
    action({id:'wait',name:'Wait',baseCents:base,expectedCents:expected,actionCents:0,tariffExposureCents:tariff,freightExposureCents:freight,eligible:true,reason:'Keep the planned shipment and remain exposed to applicable scenarios.',arrivalDate:s.arrivalDate}),
    action({id:'early',name:'Order early',baseCents:base,expectedCents:earlyEligible ? base+earlyCost+earlyTariff+freight : null,actionCents:earlyCost,tariffExposureCents:earlyTariff,freightExposureCents:freight,eligible:earlyEligible,reason:earlyReason,arrivalDate:s.earlyArrivalDate}),
  ];
  const r = s.alternativeRoute;
  const routeReady = r.enabled && money(r.freightCents) && money(r.switchingCents) && money(r.surchargeCents) && rate(r.freightProbabilityBps) && validDate(r.arrivalDate) && r.arrivalDate === s.arrivalDate;
  const rb = base-s.freightCents+r.freightCents;
  const routeTariff = r.arrivalDate >= s.eventDate ? p * impact : 0;
  actions.push(action({id:'route',name:'Different route',baseCents:routeReady?rb:null,expectedCents:routeReady?rb+r.switchingCents+routeTariff+r.freightProbabilityBps/10000*r.surchargeCents:null,actionCents:r.switchingCents,tariffExposureCents:routeTariff,freightExposureCents:r.freightProbabilityBps/10000*r.surchargeCents,eligible:routeReady,reason:!r.enabled?'Add a comparable freight quote and route assumptions.':!routeReady?'Check route costs and probability. Arrival must match the baseline date so timing and tariff exposure remain comparable.':'Origin and duty assumptions stay the same. The alternative arrival date determines tariff exposure; freight and switching assumptions also change.',arrivalDate:r.arrivalDate}));
  const a = s.alternativeSupplier;
  const supplierReady = a.enabled && a.comparable && a.originCountry.trim().length>0 && [a.goodsCents,a.customsCents,a.freightCents,a.switchingCents].every(money) && [a.dutyRateBps,a.tariffIncreaseBps].every(n=>finite(n)&&n>=0&&n<=100000) && validDate(a.arrivalDate) && a.arrivalDate===s.arrivalDate;
  const ab = a.goodsCents+roundCents(a.customsCents*a.dutyRateBps/10000)+a.freightCents+otherCosts(s);
  const at = a.arrivalDate >= s.eventDate ? p*roundCents(a.customsCents*a.tariffIncreaseBps/10000) : 0;
  actions.push(action({id:'supplier',name:'Different supplier',baseCents:supplierReady?ab:null,expectedCents:supplierReady?ab+a.switchingCents+at+freight:null,actionCents:a.switchingCents,tariffExposureCents:at,freightExposureCents:freight,eligible:supplierReady,reason:!a.enabled?'Add a supplier quote, duty assumptions, and qualification.':!supplierReady?'Confirm equivalent quantity and quality, valid costs, origin, and arrival matching the baseline date.':'Uses the entered origin and duty assumptions, with the same scenario probabilities. Confirm their applicability.',arrivalDate:a.arrivalDate}));
  const eligible = actions.filter(a=>a.eligible&&a.expectedCents!==null);
  const best = eligible.reduce((b,a)=>a.expectedCents!<b.expectedCents!-0.5?a:b);
  const tied = eligible.some(a=>a.id!==best.id&&Math.abs(a.expectedCents!-best.expectedCents!)<0.5);
  const outcomes = [
    {name:'Neither event',tariff:false,freight:false,probability:(1-p)*(1-q),costCents:base},
    {name:'Freight only',tariff:false,freight:true,probability:(1-p)*q,costCents:base+s.surchargeCents},
    {name:'Tariff only',tariff:true,freight:false,probability:p*(1-q),costCents:base+(waitExposed?impact:0)},
    {name:'Both events',tariff:true,freight:true,probability:p*q,costCents:base+(waitExposed?impact:0)+s.surchargeCents},
  ];
  return {valid:true,ledger:buildCostLedger(s,duty),baseCents:base,dutyCents:duty,tariffImpactCents:impact,tariffExposureCents:tariff,freightExposureCents:freight,addedCents:tariff+freight,expectedCents:expected,earlyCostCents:earlyCost,breakEven:earlyCanAvoid&&waitExposed&&impact>0&&earlyEligible?earlyCost/impact:null,outcomes,actions,best,tied};
}
