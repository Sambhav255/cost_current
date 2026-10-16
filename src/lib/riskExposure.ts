import { analyzeShipment } from './engine';
import { routes } from './data';
import type {
  ConditionalImpact,
  ExposureLink,
  ExposureRelationship,
  RiskEvent,
} from './riskEvents';
import type { Shipment } from './types';

function link(
  event: RiskEvent,
  shipment: Shipment,
  relationship: ExposureRelationship,
  rationale: string,
  rule: string,
  categories: string[],
): ExposureLink {
  return {
    eventId: event.id,
    shipmentId: shipment.id,
    relationship,
    rationale,
    corridorOrProductRuleRef: rule,
    affectedCostCategories: categories,
  };
}

export function matchExposure(event: RiskEvent, shipment: Shipment): ExposureLink {
  const route = routes.find((r) => r.id === shipment.routeId);
  if (event.kind === 'chokepoint') {
    if (!event.corridorId) {
      return link(event, shipment, 'unknown', 'Event has no corridor id.', 'missing-corridor-def', [
        'freight',
      ]);
    }
    const evidence = shipment.routeEvidence;
    if (!evidence || evidence.corridorId !== event.corridorId || evidence.state === 'unknown') {
      return link(
        event,
        shipment,
        'unknown',
        `${route?.origin ?? 'Origin'} → ${route?.destination ?? 'destination'} has no confirmed ${event.corridorId} itinerary. Check the carrier or forwarder.`,
        'itinerary-unknown',
        ['freight', 'delay'],
      );
    }
    if (evidence.state === 'known_avoids') {
      return link(
        event,
        shipment,
        'not_applicable',
        `${evidence.source === 'reviewed_demo' ? 'Reviewed fictional sample' : 'Customer-confirmed itinerary'} avoids ${event.corridorId}.`,
        'documented-corridor-avoidance',
        [],
      );
    }
    return link(
      event,
      shipment,
      evidence.source === 'reviewed_demo' ? 'reviewed' : 'confirmed',
      `${evidence.source === 'reviewed_demo' ? 'Reviewed fictional sample' : 'Customer-confirmed itinerary'} traverses ${event.corridorId}; map line remains schematic.`,
      'documented-corridor-traversal',
      ['freight', 'delay'],
    );
  }
  if (event.kind === 'trade_policy') {
    if (!event.isDemoScenario) {
      return link(
        event,
        shipment,
        'unknown',
        'Official product and effective-date scope requires reviewed source evidence and broker confirmation.',
        'official-policy-scope-unreviewed',
        ['duty'],
      );
    }
    if (!event.originCountries.length) {
      return link(
        event,
        shipment,
        'unknown',
        'Policy event has no origin scope.',
        'missing-origin',
        ['duty'],
      );
    }
    if (!shipment.originCountry) {
      return link(
        event,
        shipment,
        'unknown',
        'Shipment country of origin is missing.',
        'missing-shipment-origin',
        ['duty'],
      );
    }
    if (!event.originCountries.includes(shipment.originCountry)) {
      return link(
        event,
        shipment,
        'not_applicable',
        `Origin ${shipment.originCountry} is outside the event scope (${event.originCountries.join(', ')}).`,
        'origin-mismatch',
        [],
      );
    }
    const productOk =
      !event.productHint ||
      shipment.product.toLowerCase().includes('ceramic') ||
      shipment.product.toLowerCase().includes('tableware') ||
      shipment.product.toLowerCase().includes('home') ||
      shipment.id === 'northstar';
    if (!productOk) {
      return link(
        event,
        shipment,
        'possible',
        `Origin matches, but product scope (“${event.productHint}”) is not confirmed for this SKU. Review applicability before treating duty as certain.`,
        'origin-match-product-unconfirmed',
        ['duty'],
      );
    }
    return link(
      event,
      shipment,
      'reviewed',
      `China-origin home-goods demo match for ${shipment.name}. Applicability remains an assumption until official scope is reviewed.`,
      'demo-policy-origin-product',
      ['duty'],
    );
  }
  return link(
    event,
    shipment,
    'unknown',
    'No matching rule for this event kind yet.',
    'unsupported-kind',
    [],
  );
}

export function exposuresForEvent(event: RiskEvent, shipments: Shipment[]): ExposureLink[] {
  return shipments.map((s) => matchExposure(event, s));
}

export function conditionalImpact(
  event: RiskEvent,
  shipment: Shipment,
  exposure: ExposureLink,
): ConditionalImpact {
  if (
    exposure.relationship === 'not_applicable' ||
    exposure.relationship === 'possible' ||
    exposure.relationship === 'unknown'
  ) {
    return {
      eventId: event.id,
      shipmentId: shipment.id,
      estimatedExtraCostCents: null,
      estimatedDelayDays: null,
      estimateStatus: 'unavailable',
      unitsAndBasis:
        exposure.relationship === 'possible'
          ? 'Review exposure before treating conditional dollars as decision-ready'
          : 'n/a',
      modelVersion: null,
      assumptions: [exposure.rationale],
    };
  }
  if (event.kind === 'trade_policy') {
    const analysis = analyzeShipment(shipment);
    const dutyHit = analysis.valid
      ? Math.round((shipment.customsCents * shipment.tariffIncreaseBps) / 10000)
      : null;
    if (dutyHit == null || dutyHit === 0) {
      return {
        eventId: event.id,
        shipmentId: shipment.id,
        estimatedExtraCostCents: null,
        estimatedDelayDays: null,
        estimateStatus: 'unavailable',
        unitsAndBasis: 'No additional duty assumption entered for this shipment',
        modelVersion: null,
        assumptions: [exposure.rationale],
      };
    }
    return {
      eventId: event.id,
      shipmentId: shipment.id,
      estimatedExtraCostCents: dutyHit,
      estimatedDelayDays: null,
      estimateStatus: 'illustrative',
      unitsAndBasis: 'USD cents · additional duty on entered customs value if rate applies',
      modelVersion: 'engine-conditional-v1',
      assumptions: [
        'Uses shipment tariffIncreaseBps and customs value; not a legal duty determination.',
        'Event occurrence probability is separate and may be unavailable.',
      ],
    };
  }
  if (event.kind === 'chokepoint') {
    const surcharge =
      Number.isFinite(shipment.surchargeCents) && shipment.surchargeCents > 0
        ? shipment.surchargeCents
        : null;
    return {
      eventId: event.id,
      shipmentId: shipment.id,
      estimatedExtraCostCents: surcharge,
      estimatedDelayDays: shipment.assumedDisruptionDelayDays ?? null,
      estimateStatus: surcharge === null ? 'unavailable' : 'illustrative',
      unitsAndBasis:
        surcharge === null
          ? 'Needs an entered freight surcharge / delay cost; no carrier quote invented'
          : 'USD cents · entered freight surcharge assumption; disruption delay, if shown, is user-entered and separate from holding days',
      modelVersion: 'engine-conditional-v1',
      assumptions: [
        'Conditional on the corridor event occurring and the surcharge applying to this booking.',
        'Reroute savings appear only when a comparable alternative quote is entered and feasible.',
      ],
    };
  }
  return {
    eventId: event.id,
    shipmentId: shipment.id,
    estimatedExtraCostCents: null,
    estimatedDelayDays: null,
    estimateStatus: 'unavailable',
    unitsAndBasis: 'n/a',
    modelVersion: null,
    assumptions: ['No conditional impact model for this event kind.'],
  };
}

export function statusLabel(status: ConditionalImpact['estimateStatus']): string {
  switch (status) {
    case 'illustrative':
      return 'Illustrative scenario';
    case 'unavailable':
      return 'Not available';
    case 'stale':
      return 'Stale';
    case 'observed_official':
      return 'Official observation';
    case 'observed_market_quote':
      return 'Market quote';
    case 'model_estimate':
      return 'Model estimate';
  }
}

export function relationshipLabel(relationship: ExposureRelationship): string {
  switch (relationship) {
    case 'confirmed':
      return 'Confirmed';
    case 'reviewed':
      return 'Reviewed demo match';
    case 'possible':
      return 'Possible — review';
    case 'not_applicable':
      return 'Not applicable';
    case 'unknown':
      return 'Unknown';
  }
}
