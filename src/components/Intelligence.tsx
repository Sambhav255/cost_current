import { Radar } from 'lucide-react';
import { useEffect, useState } from 'react';
import { routes } from '../lib/data';
import { listDemoEvents, probabilityFor, zonesForEvent } from '../lib/riskEvents';
import { dateLabel, percent } from '../lib/format';
import { exposuresForEvent } from '../lib/riskExposure';
import type { Shipment } from '../lib/types';
import RouteGlobe from './RouteGlobe';
import { Eyebrow, SectionHeading } from './ui';
import IntelligencePanel from './IntelligencePanel';
import EarthquakePanel from './EarthquakePanel';
import {
  fetchUSGSFeed,
  fictionalEarthquakeFixture,
  type EarthquakeFeed,
  type ObservedEarthquake,
} from '../lib/usgs';
import { quakeExposure, type DelayScenario } from '../lib/quakeExposure';
import { fetchNHC, nhcExposure, type NHCFeed, type NHCSummary } from '../lib/nhc';
import NHCPanel from './NHCPanel';

function likelihoodShort(eventId: string): string {
  const signal = probabilityFor(eventId);
  if (!signal || signal.probabilityBps === null) return 'Odds: Not available';
  return `Assumption ${percent(signal.probabilityBps / 10000)}`;
}

export default function Intelligence({
  shipments,
  selectedEventId,
  onSelectEvent,
  onSelectShipment,
  onOpenDecisions,
  onOpenExposure,
  onOpenObservedDecisions,
  onOpenForecastDecisions,
}: {
  shipments: Shipment[];
  selectedEventId: string;
  onSelectEvent: (id: string) => void;
  onSelectShipment: (id: string) => void;
  onOpenDecisions: (shipmentId: string, eventId: string) => void;
  onOpenExposure: () => void;
  onOpenObservedDecisions: (
    shipmentId: string,
    event: ObservedEarthquake,
    scenario: DelayScenario,
  ) => void;
  onOpenForecastDecisions: (shipmentId: string, storm: NHCSummary, scenario: DelayScenario) => void;
}) {
  const [sourceMode, setSourceMode] = useState<'demo' | 'official' | 'fixture' | 'weather'>('demo');
  const [feed, setFeed] = useState<EarthquakeFeed | null>(null);
  const [nhcFeed, setNhcFeed] = useState<NHCFeed | null>(null);
  const [selectedStormId, setSelectedStormId] = useState('');
  const [selectedQuakeId, setSelectedQuakeId] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [relevantOnly, setRelevantOnly] = useState(false);
  useEffect(() => {
    if (sourceMode !== 'official') return;
    let active = true;
    fetchUSGSFeed().then((result) => {
      if (active) setFeed(result);
    });
    return () => {
      active = false;
    };
  }, [sourceMode, refreshKey]);
  useEffect(() => {
    if (sourceMode !== 'weather') return;
    let active = true;
    fetchNHC().then((result) => {
      if (active) setNhcFeed(result);
    });
    return () => {
      active = false;
    };
  }, [sourceMode, refreshKey]);
  const events = listDemoEvents();
  const event = events.find((e) => e.id === selectedEventId) ?? events[0];
  const fixture = fictionalEarthquakeFixture();
  const quakes = sourceMode === 'fixture' ? [fixture] : (feed?.events ?? []);
  const visibleQuakes = relevantOnly
    ? quakes.filter((quake) => shipments.some((s) => quakeExposure(quake, s).state === 'possible'))
    : quakes;
  const quake = visibleQuakes.find((item) => item.id === selectedQuakeId) ?? visibleQuakes[0];
  const storm = nhcFeed?.storms.find((item) => item.id === selectedStormId) ?? nhcFeed?.storms[0];
  const stormMatch = storm && shipments.find((s) => nhcExposure(storm, s).state === 'possible');
  const zones =
    sourceMode === 'demo'
      ? event
        ? zonesForEvent(event)
        : []
      : sourceMode !== 'weather' && quake
        ? [
            {
              id: quake.id,
              label:
                quake.sourceMode === 'observed'
                  ? 'USGS reported epicenter'
                  : 'Fictional test epicenter',
              points: [{ lat: quake.latitude, lng: quake.longitude }],
            },
          ]
        : [];
  const focusShipment = event
    ? exposuresForEvent(event, shipments).find((link) =>
        ['confirmed', 'reviewed'].includes(link.relationship),
      )
    : undefined;
  const quakeMatch = quake && shipments.find((s) => quakeExposure(quake, s).state === 'possible');
  const focusRoute =
    sourceMode === 'demo'
      ? (shipments.find((s) => s.id === focusShipment?.shipmentId)?.routeId ?? '')
      : sourceMode === 'weather'
        ? (stormMatch?.routeId ?? '')
        : (quakeMatch?.routeId ?? '');

  return (
    <>
      <div className="page-heading">
        <div>
          <Eyebrow>
            <Radar size={14} /> RISK INTELLIGENCE
          </Eyebrow>
          <h1>Supply-chain risks worth watching</h1>
          <p>
            What could change, who is exposed, and how it might matter — before you open a
            spreadsheet.
          </p>
        </div>
        <div className="button-row">
          <button type="button" className="button secondary" onClick={onOpenExposure}>
            My exposure
          </button>
        </div>
      </div>
      <div className="intelligence-grid">
        <aside className="intelligence-events">
          <SectionHeading
            title="Watchlist"
            description={
              sourceMode === 'demo'
                ? 'Curated fictional scenarios.'
                : sourceMode === 'fixture'
                  ? 'Explicit fictional test fixture.'
                  : sourceMode === 'weather'
                    ? 'NHC official advisory summaries; forecast geometry unavailable.'
                    : 'USGS past-day observed earthquake reports.'
            }
          />
          <div className="button-row" role="group" aria-label="Intelligence source">
            <button
              type="button"
              className="button secondary"
              aria-pressed={sourceMode === 'demo'}
              onClick={() => setSourceMode('demo')}
            >
              Illustrative
            </button>
            <button
              type="button"
              className="button secondary"
              aria-pressed={sourceMode === 'official'}
              onClick={() => setSourceMode('official')}
            >
              Official observations
            </button>
            <button
              type="button"
              className="button secondary"
              aria-pressed={sourceMode === 'fixture'}
              onClick={() => setSourceMode('fixture')}
            >
              Fictional test
            </button>
            <button
              type="button"
              className="button secondary"
              aria-pressed={sourceMode === 'weather'}
              onClick={() => setSourceMode('weather')}
            >
              Official forecasts
            </button>
          </div>
          {sourceMode === 'official' && (
            <div className="notice" data-testid="usgs-feed-status">
              {feed
                ? `USGS feed: ${feed.status}. Generated ${feed.generatedAt ?? 'unknown'}; retrieved ${feed.retrievedAt}. ${feed.detail}`
                : 'Loading USGS feed…'}{' '}
              <button
                type="button"
                className="text-button"
                onClick={() => {
                  setFeed(null);
                  setRefreshKey((x) => x + 1);
                }}
              >
                Refresh
              </button>
            </div>
          )}
          {sourceMode === 'weather' && (
            <div className="notice" data-testid="nhc-feed-status">
              {nhcFeed
                ? `NHC advisory feed: ${nhcFeed.status}. Retrieved ${nhcFeed.retrievedAt}. ${nhcFeed.detail}`
                : 'Loading NHC advisory summaries…'}{' '}
              <button
                type="button"
                className="text-button"
                onClick={() => {
                  setNhcFeed(null);
                  setRefreshKey((x) => x + 1);
                }}
              >
                Refresh
              </button>
            </div>
          )}
          {(sourceMode === 'official' || sourceMode === 'fixture') && (
            <label className="quiet-caption">
              <input
                type="checkbox"
                checked={relevantOnly}
                onChange={(e) => setRelevantOnly(e.target.checked)}
              />{' '}
              Relevant to known locations only
            </label>
          )}
          <ul className="event-list">
            {sourceMode === 'demo'
              ? events.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      className={item.id === selectedEventId ? 'event-card active' : 'event-card'}
                      data-testid={`event-card-${item.id}`}
                      onClick={() => onSelectEvent(item.id)}
                    >
                      <span className="event-card-kind">{item.kind.replace(/_/g, ' ')}</span>
                      <strong>{item.name}</strong>
                      <span className="event-card-meta">
                        {dateLabel(item.horizonStart)} – {dateLabel(item.horizonEnd)}
                      </span>
                      <span className="event-card-odds">{likelihoodShort(item.id)}</span>
                    </button>
                  </li>
                ))
              : sourceMode === 'weather'
                ? nhcFeed?.storms.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        className={item.id === storm?.id ? 'event-card active' : 'event-card'}
                        onClick={() => setSelectedStormId(item.id)}
                      >
                        <span className="event-card-kind">NHC official forecast</span>
                        <strong>
                          {item.name} · advisory {item.advisoryNumber}
                        </strong>
                        <span className="event-card-meta">Issued {item.issuedAt}</span>
                        <span className="event-card-odds">
                          {shipments.some((s) => nhcExposure(item, s).state === 'possible')
                            ? 'Possible known-site overlap'
                            : 'No verified cone overlap'}
                        </span>
                      </button>
                    </li>
                  ))
                : visibleQuakes.slice(0, 30).map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        className={item.id === quake?.id ? 'event-card active' : 'event-card'}
                        data-testid={`quake-card-${item.id}`}
                        onClick={() => setSelectedQuakeId(item.id)}
                      >
                        <span className="event-card-kind">
                          {item.sourceMode === 'observed'
                            ? 'USGS observed report'
                            : 'Fictional test'}
                        </span>
                        <strong>{item.title}</strong>
                        <span className="event-card-meta">{item.eventTime}</span>
                        <span className="event-card-odds">Odds: Not available</span>
                      </button>
                    </li>
                  ))}
          </ul>
          {(sourceMode === 'official' || sourceMode === 'fixture') &&
            !visibleQuakes.length &&
            feed && (
              <p className="notice">
                {relevantOnly
                  ? 'No reported earthquakes matched a known location in the current feed window.'
                  : feed.status === 'fresh'
                    ? 'USGS returned no reported earthquakes in this feed window.'
                    : 'No usable earthquake reports are available from this feed.'}
              </p>
            )}
          {sourceMode === 'weather' && nhcFeed && !nhcFeed.storms.length && (
            <p className="notice">
              {nhcFeed.status === 'fresh'
                ? 'NHC lists no active storms in this summary. This is not an all-clear for other weather hazards.'
                : 'NHC advisory summaries are unavailable or invalid.'}
            </p>
          )}
        </aside>
        <div className="intelligence-detail">
          {sourceMode === 'demo' ? (
            <IntelligencePanel
              shipments={shipments}
              selectedEventId={selectedEventId}
              onSelectShipment={onSelectShipment}
              onOpenDecisions={onOpenDecisions}
            />
          ) : sourceMode === 'weather' ? (
            storm ? (
              <NHCPanel
                key={storm.id}
                storm={storm}
                shipments={shipments}
                onReview={onOpenForecastDecisions}
              />
            ) : (
              <p className="notice">No active NHC advisory selected.</p>
            )
          ) : quake ? (
            <EarthquakePanel
              key={quake.id}
              event={quake}
              shipments={shipments}
              onReview={onOpenObservedDecisions}
            />
          ) : (
            <p className="notice">
              Select an available observed event or enter a known location to evaluate proximity.
            </p>
          )}
        </div>
        <div className="intelligence-map">
          <SectionHeading
            title="Geographic context"
            description={
              sourceMode === 'demo'
                ? 'Schematic lanes and illustrative watch locations — not vessel tracks or hazard boundaries.'
                : sourceMode === 'weather'
                  ? 'Official NHC forecast cone if validated; shipment lanes remain schematic. The cone is not storm impact extent.'
                  : 'Reported epicenter point and schematic customer lanes; point is not damage extent.'
            }
          />
          <RouteGlobe
            key={sourceMode}
            routes={routes}
            selected={focusRoute}
            onSelect={(routeId) => {
              const match = shipments.find((s) => s.routeId === routeId);
              if (match) onSelectShipment(match.id);
            }}
            compact
            eventZones={zones}
            eventPolygons={
              sourceMode === 'weather' && storm?.cone
                ? [
                    {
                      id: storm.id,
                      label: `NHC advisory ${storm.advisoryNumber} cone`,
                      outer: storm.cone.outer,
                      holes: storm.cone.holes,
                    },
                  ]
                : []
            }
            initialFlat={sourceMode !== 'demo'}
          />
        </div>
      </div>
    </>
  );
}
