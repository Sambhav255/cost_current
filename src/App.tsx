import Forecast from './components/Forecast';
import { baselineForecast, loadSeries, saveSeries, type FreightSeries } from './lib/forecast';
import { MAX_SHIPMENTS } from './lib/csv';
import { hasCustomerEvidence, invalidateEvidenceForEdit } from './lib/evidence';
import ImportShipments from './components/ImportShipments';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CircleHelp,
  FileText,
  FileUp,
  Globe2,
  HardDrive,
  LayoutDashboard,
  Menu,
  Package,
  Radar,
  RotateCcw,
  X,
} from 'lucide-react';
import { freshSamples, routes } from './lib/data';
import { analyzeShipment, decisionDate, validateShipment } from './lib/engine';
import { clearShipments, loadShipments, saveShipments } from './lib/storage';
import { dateLabel } from './lib/format';
import type { MemoSnapshot, ForecastMemoSnapshot, Shipment } from './lib/types';
import { Brand, SourceBadge } from './components/ui';
import Welcome from './components/Welcome';
import Overview from './components/Overview';
import ShipmentForm, { type UpdateShipment } from './components/ShipmentForm';
import Analysis from './components/Analysis';
import Methods from './components/Methods';
import Memo from './components/Memo';
import Intelligence from './components/Intelligence';
import { getEvent, probabilityFor } from './lib/riskEvents';
import type { ObservedEarthquake } from './lib/usgs';
import type { DelayScenario } from './lib/quakeExposure';
import type { NHCSummary } from './lib/nhc';
type View = 'welcome' | 'intelligence' | 'overview' | 'shipment' | 'methods' | 'memo' | 'import';
export default function App() {
  const [shipments, setShipments] = useState(loadShipments),
    [selectedId, setSelectedId] = useState(() => shipments[0].id);
  const [view, setView] = useState<View>('welcome'),
    [tab, setTab] = useState<'analysis' | 'details'>('analysis');
  const [selectedEventId, setSelectedEventId] = useState('demo-tariff-china-home');
  const [decisionContext, setDecisionContext] = useState<MemoSnapshot['eventContext'] | null>(null);
  const [observedContext, setObservedContext] = useState<MemoSnapshot['observedContext'] | null>(
    null,
  );
  const [forecastContext, setForecastContext] = useState<MemoSnapshot['forecastContext'] | null>(
    null,
  );
  const [mode, setMode] = useState<'forecast' | 'what-if'>('forecast');
  const [signals, setSignals] = useState(loadSeries);
  const [horizon, setHorizon] = useState<28 | 56>(28);
  const [generatedAt, setGeneratedAt] = useState(() => new Date().toISOString());
  const [signalNotice, setSignalNotice] = useState(
    'Local registry only. Refresh re-reads saved observations; it does not fetch a live feed.',
  );
  const [snapshot, setSnapshot] = useState<MemoSnapshot | ForecastMemoSnapshot | null>(null),
    [mobileMenu, setMobileMenu] = useState(false),
    [saveState, setSaveState] = useState('Saved in this browser'),
    [message, setMessage] = useState('');
  const contentRef = useRef<HTMLElement>(null);
  const selected = shipments.find((s) => s.id === selectedId) || shipments[0],
    analysis = analyzeShipment(selected),
    route = routes.find((r) => r.id === selected.routeId) || routes[0];
  const forecastAsOf = decisionDate(selected);
  const forecast = useMemo(
    () => baselineForecast(signals.series, selected.routeId, forecastAsOf, horizon),
    [signals.series, selected.routeId, forecastAsOf, horizon, generatedAt],
  );
  const changeSeries = (series: FreightSeries | null) => {
    const saved = saveSeries(series);
    setSignals({ series, error: '' });
    setGeneratedAt(new Date().toISOString());
    setSignalNotice(
      saved
        ? series
          ? 'Signals updated from local observations. No live feed was queried.'
          : 'Observations cleared. Automatic estimates are unavailable.'
        : 'Session only: signals could not be saved. Refresh will read the last persisted registry.',
    );
  };
  const refreshSignals = () => {
    const next = loadSeries();
    setSignals(next);
    setGeneratedAt(new Date().toISOString());
    setSignalNotice(
      next.error ||
        (next.series
          ? 'Refreshed from saved local observations. Freshness and cutoff checks were reapplied.'
          : 'Refresh completed: no saved observations. No sample fallback was used.'),
    );
  };
  useEffect(() => {
    if (shipments.some((s) => validateShipment(s).length)) {
      setSaveState('Complete inputs to save');
      return;
    }
    setSaveState(
      saveShipments(shipments) ? 'Saved in this browser' : 'Session only · storage unavailable',
    );
  }, [shipments]);
  useEffect(() => {
    window.scrollTo(0, 0);
    setMobileMenu(false);
  }, [view, selectedId]);
  useEffect(() => {
    document.title = `${view === 'welcome' ? 'Supply-chain risk intelligence' : view === 'intelligence' ? 'Intelligence' : view === 'overview' ? 'My exposure' : view === 'shipment' ? `Decisions · ${selected.name}` : view === 'memo' ? 'Decision memo' : view === 'import' ? 'Import shipments' : 'Methods & evidence'} · Cost Current`;
  }, [view, selected.name]);
  const update: UpdateShipment = (field, value) =>
    setShipments((all) =>
      all.map((s) =>
        s.id === selected.id
          ? {
              ...s,
              ...invalidateEvidenceForEdit(s, field),
              [field]: value,
              ...(field === 'routeId' ? { routeEvidence: undefined, knownAsset: undefined } : {}),
              ...(['tariffProbabilityBps', 'freightProbabilityBps'].includes(field) &&
              !s.scenarioOverride
                ? {
                    scenarioOverride: {
                      originalTariffBps: s.tariffProbabilityBps,
                      originalFreightBps: s.freightProbabilityBps,
                      originalForecast: structuredClone(forecast),
                      capturedAt: new Date().toISOString(),
                    },
                  }
                : {}),
              edited: [...new Set([...s.edited, field])],
            }
          : s,
      ),
    );
  const restoreOdds = () =>
    setShipments((all) =>
      all.map((s) =>
        s.id === selected.id && s.scenarioOverride
          ? {
              ...s,
              tariffProbabilityBps: s.scenarioOverride.originalTariffBps,
              freightProbabilityBps: s.scenarioOverride.originalFreightBps,
              scenarioOverride: undefined,
            }
          : s,
      ),
    );
  const navigate = (next: View) => {
    setView(next);
    setMobileMenu(false);
  };
  const start = () => {
    setSelectedId(shipments[0].id);
    setSelectedEventId('demo-tariff-china-home');
    navigate('intelligence');
  };
  const openDecisionsFromEvent = (shipmentId: string, eventId: string) => {
    const event = getEvent(eventId);
    if (!event) return;
    setSelectedId(shipmentId);
    setDecisionContext(
      structuredClone({
        shipmentId,
        event,
        signal: probabilityFor(eventId) ?? null,
        capturedAt: new Date().toISOString(),
      }),
    );
    setObservedContext(null);
    setForecastContext(null);
    setMode('what-if');
    setTab('analysis');
    navigate('shipment');
  };
  const openDecisionsFromObserved = (
    shipmentId: string,
    event: ObservedEarthquake,
    scenario: DelayScenario,
  ) => {
    setSelectedId(shipmentId);
    setDecisionContext(null);
    setForecastContext(null);
    setObservedContext(
      structuredClone({ shipmentId, event, scenario, capturedAt: new Date().toISOString() }),
    );
    setMode('what-if');
    setTab('analysis');
    navigate('shipment');
  };
  const openDecisionsFromForecast = (
    shipmentId: string,
    storm: NHCSummary,
    scenario: DelayScenario,
  ) => {
    setSelectedId(shipmentId);
    setDecisionContext(null);
    setObservedContext(null);
    setForecastContext(
      structuredClone({ shipmentId, storm, scenario, capturedAt: new Date().toISOString() }),
    );
    setMode('what-if');
    setTab('analysis');
    navigate('shipment');
  };
  const analyze = () => {
    setTab('analysis');
    navigate('shipment');
  };
  const openMemo = () => {
    if (!analysis.valid) return;
    if (mode === 'forecast') {
      setSnapshot(
        structuredClone({
          mode: 'forecast',
          shipment: selected,
          route,
          forecast,
          baseCents: analysis.baseCents,
          ledger: analysis.ledger,
          timestamp: new Date().toISOString(),
          calculatorVersion: '2.0.0-ledger',
        }),
      );
      navigate('memo');
      return;
    }
    setSnapshot(
      structuredClone({
        mode: 'what-if' as const,
        forecast,
        shipment: selected,
        route,
        analysis,
        eventContext: decisionContext?.shipmentId === selected.id ? decisionContext : undefined,
        observedContext: observedContext?.shipmentId === selected.id ? observedContext : undefined,
        forecastContext: forecastContext?.shipmentId === selected.id ? forecastContext : undefined,
        timestamp: new Date().toISOString(),
        calculatorVersion: '2.0.0-ledger',
      }),
    );
    navigate('memo');
  };
  const reset = () => {
    clearShipments();
    const sampleIds = new Set(freshSamples().map((s) => s.id));
    setShipments([...freshSamples(), ...shipments.filter((s) => !sampleIds.has(s.id))]);
    setSelectedId('northstar');
    setSnapshot(null);
    setMessage('Sample shipments restored. Imported and manually added shipments were kept.');
    navigate('overview');
  };
  const add = () => {
    if (shipments.length >= MAX_SHIPMENTS) {
      setMessage('This local workspace supports ' + MAX_SHIPMENTS + ' shipments.');
      return;
    }
    const next = structuredClone(freshSamples()[0]);
    Object.assign(next, {
      id: crypto.randomUUID(),
      name: 'New shipment',
      product: '',
      supplier: '',
      originCountry: '',
      goodsCents: NaN,
      customsCents: NaN,
      freightCents: NaN,
      units: NaN,
      dutyRateBps: NaN,
      tariffProbabilityBps: 0,
      tariffIncreaseBps: 0,
      freightProbabilityBps: 0,
      surchargeCents: 0,
      earlyCostCents: 0,
      tariffAvoidance: 'unknown',
      edited: ['name'],
      routeEvidence: undefined,
      knownAsset: undefined,
      assumedDisruptionDelayDays: undefined,
    });
    setShipments((s) => [...s, next]);
    setSelectedId(next.id);
    setTab('details');
    navigate('shipment');
  };
  const imported = (next: Shipment[], ids: string[]) => {
    setShipments(next);
    setSelectedId(ids[0]);
    setMessage(
      String(ids.length) +
        ' shipment(s) imported locally. Cost evidence is recorded as supplied, not independently verified.',
    );
    navigate('overview');
  };
  if (view === 'welcome')
    return (
      <Welcome
        onStart={start}
        onMethods={() => navigate('methods')}
        onImport={() => navigate('import')}
      />
    );
  const contextEvent =
    decisionContext?.shipmentId === selected.id ? decisionContext.event : undefined;
  const contextSignal =
    decisionContext?.shipmentId === selected.id ? decisionContext.signal : undefined;
  const pageName =
    view === 'intelligence'
      ? 'Intelligence'
      : view === 'overview'
        ? 'My exposure'
        : view === 'shipment'
          ? 'Decisions'
          : view === 'memo'
            ? 'Decision memo'
            : view === 'import'
              ? 'Import'
              : 'Methods & evidence';
  const nav = [
    { id: 'intelligence' as View, label: 'Intelligence', icon: Radar },
    { id: 'overview' as View, label: 'My Exposure', icon: LayoutDashboard },
    { id: 'shipment' as View, label: 'Decisions', icon: Package },
    { id: 'methods' as View, label: 'Methods & evidence', icon: BookOpen },
    { id: 'import' as View, label: 'Import', icon: FileUp },
    { id: 'memo' as View, label: 'Decision memo', icon: FileText },
  ];
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      {mobileMenu && (
        <button
          className="sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() => setMobileMenu(false)}
        />
      )}
      <aside className={`sidebar ${mobileMenu ? 'sidebar-open' : ''}`}>
        <button
          className="brand-button"
          aria-label="Cost Current welcome"
          onClick={() => navigate('welcome')}
        >
          <Brand />
        </button>
        <nav aria-label="Main navigation">
          {nav.map((item) => (
            <button
              key={item.id}
              className={view === item.id ? 'active' : ''}
              aria-current={view === item.id ? 'page' : undefined}
              disabled={item.id === 'memo' && !analysis.valid}
              onClick={() => (item.id === 'memo' ? openMemo() : navigate(item.id))}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
              {view === item.id && <span className="nav-active-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <p className="sidebar-status">
            {shipments.length === 1
              ? '1 shipment saved in this browser'
              : `${shipments.length} shipments saved in this browser`}
          </p>
          <button className="reset-button" onClick={reset}>
            <RotateCcw size={15} /> Reset demo data
          </button>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="mobile-menu-button icon-button"
              aria-label="Open navigation"
              onClick={() => setMobileMenu(true)}
            >
              <Menu size={20} />
            </button>
            <strong>{pageName}</strong>
          </div>
          <label className="shipment-select">
            <span>Shipment</span>
            <select
              aria-label="Selected shipment"
              value={selected.id}
              onChange={(event) => {
                setSelectedId(event.target.value);
                setDecisionContext(null);
                setObservedContext(null);
                setForecastContext(null);
              }}
            >
              {shipments.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <div className="topbar-meta">
            <span className="demo-pill">
              <span />
              Illustrative
            </span>
            <span className="topbar-date">As of {dateLabel(decisionDate(selected))}</span>
          </div>
        </header>
        <main id="main-content" ref={contentRef} className="main-content">
          {message && (
            <div className="toast" role="status">
              {message}
              <button
                aria-label="Dismiss notice"
                className="icon-button"
                onClick={() => setMessage('')}
              >
                <X size={15} />
              </button>
            </div>
          )}
          {view === 'intelligence' && (
            <Intelligence
              shipments={shipments}
              selectedEventId={selectedEventId}
              onSelectEvent={setSelectedEventId}
              onSelectShipment={setSelectedId}
              onOpenDecisions={openDecisionsFromEvent}
              onOpenObservedDecisions={openDecisionsFromObserved}
              onOpenForecastDecisions={openDecisionsFromForecast}
              onOpenExposure={() => navigate('overview')}
            />
          )}
          {view === 'overview' && (
            <Overview
              shipments={shipments}
              selected={selected}
              onSelect={setSelectedId}
              onAnalyze={analyze}
              onAdd={add}
              onImport={() => navigate('import')}
            />
          )}
          {view === 'shipment' && (
            <>
              <div className="page-heading shipment-page-heading">
                <div>
                  <button className="back-link" onClick={() => navigate('overview')}>
                    <ArrowLeft size={13} /> My exposure
                  </button>
                  <h1>{selected.name}</h1>
                  <p>
                    {selected.product || 'Add product details'}
                    <span className="separator-dot">·</span>
                    {route.origin} <ArrowRight size={14} /> {route.destination}
                    <span className="separator-dot">·</span>
                    Arrival {dateLabel(selected.arrivalDate)}
                    <span className="separator-dot">·</span>
                    {mode === 'forecast' ? 'Forecast' : 'Your assumptions'}
                  </p>
                </div>
                <div className="button-row">
                  <SourceBadge
                    edited={selected.edited.length > 0}
                    customer={hasCustomerEvidence(selected)}
                  />
                  <button
                    className="button secondary"
                    onClick={openMemo}
                    disabled={!analysis.valid}
                  >
                    <FileText size={15} /> Decision memo
                  </button>
                </div>
              </div>
              <div className="workspace-tabs" role="tablist" aria-label="Shipment workspace">
                <button
                  role="tab"
                  aria-selected={tab === 'analysis'}
                  className={tab === 'analysis' ? 'active' : ''}
                  onClick={() => setTab('analysis')}
                >
                  <Globe2 size={15} /> Cost & decisions
                </button>
                <button
                  role="tab"
                  aria-selected={tab === 'details'}
                  className={tab === 'details' ? 'active' : ''}
                  onClick={() => setTab('details')}
                >
                  <Package size={15} /> Shipment & assumptions
                </button>
                <span>
                  <HardDrive size={12} />
                  {saveState}
                </span>
              </div>
              {contextEvent && (
                <div className="notice event-context-banner" data-testid="event-context-banner">
                  Opened from illustrative event <strong>{contextEvent.name}</strong> (
                  {contextEvent.id}, as of {contextEvent.observedAsOf}). Occurrence odds are{' '}
                  {contextSignal?.probabilityBps === null ||
                  contextSignal?.probabilityBps === undefined
                    ? 'unavailable'
                    : 'a scenario assumption only'}
                  — not a live forecast.{' '}
                  <button
                    type="button"
                    className="text-button"
                    onClick={() => setDecisionContext(null)}
                  >
                    Dismiss
                  </button>
                </div>
              )}
              {observedContext?.shipmentId === selected.id && (
                <div className="notice event-context-banner" data-testid="observed-context-banner">
                  {observedContext.event.sourceMode === 'observed'
                    ? 'USGS observed earthquake'
                    : 'Fictional earthquake fixture'}
                  : <strong>{observedContext.event.title}</strong> ({observedContext.event.id},
                  updated {observedContext.event.updatedAt}). User scenario:{' '}
                  {observedContext.scenario.assumedDelayDays} additional days ×{' '}
                  {observedContext.scenario.dailyCostCents / 100} USD/day +{' '}
                  {observedContext.scenario.handlingCents / 100} USD handling ={' '}
                  {observedContext.scenario.impactCents / 100} USD conditional cost. Earthquake
                  occurrence odds and operational disruption are not estimated. The tariff/freight
                  What if? comparison below uses its separate assumptions.
                  <button
                    type="button"
                    className="text-button"
                    onClick={() => setObservedContext(null)}
                  >
                    Dismiss
                  </button>
                </div>
              )}
              {forecastContext?.shipmentId === selected.id && (
                <div className="notice event-context-banner" data-testid="forecast-context-banner">
                  NHC official forecast: <strong>{forecastContext.storm.name}</strong> advisory{' '}
                  {forecastContext.storm.advisoryNumber}, issued {forecastContext.storm.issuedAt}.
                  User scenario: {forecastContext.scenario.assumedDelayDays} additional days ×{' '}
                  {forecastContext.scenario.dailyCostCents / 100} USD/day +{' '}
                  {forecastContext.scenario.handlingCents / 100} USD handling ={' '}
                  {forecastContext.scenario.impactCents / 100} USD conditional cost. The cone does
                  not estimate port closure, delay or loss odds. The tariff/freight What if?
                  comparison below uses separate assumptions.
                  <button
                    type="button"
                    className="text-button"
                    onClick={() => setForecastContext(null)}
                  >
                    Dismiss
                  </button>
                </div>
              )}
              <div className="mode-switch" role="group" aria-label="Estimate mode">
                <button
                  className={mode === 'forecast' ? 'active' : ''}
                  aria-label="Forecast"
                  aria-pressed={mode === 'forecast'}
                  onClick={() => setMode('forecast')}
                >
                  Forecast
                  <small>Automatic, when data exists</small>
                </button>
                <button
                  className={mode === 'what-if' ? 'active' : ''}
                  aria-label="What if?"
                  aria-pressed={mode === 'what-if'}
                  onClick={() => setMode('what-if')}
                >
                  What if?
                  <small>Your assumptions</small>
                </button>
              </div>
              {mode === 'what-if' && (
                <p className="notice">
                  What if? uses your assumptions. Results are conditional, not automatic
                  predictions.
                  {selected.scenarioOverride && (
                    <>
                      {' '}
                      Override saved; original automatic tariff/freight odds: unavailable /
                      unavailable.{' '}
                      <button className="text-button" onClick={restoreOdds}>
                        Restore original scenario odds
                      </button>
                    </>
                  )}
                </p>
              )}
              {!analysis.valid && (
                <div className="validation-panel" role="alert">
                  <CircleHelp size={22} />
                  <div>
                    <h2>Complete the inputs to calculate a comparison.</h2>
                    <ul>
                      {analysis.errors.map((e) => (
                        <li key={e}>{e}</li>
                      ))}
                    </ul>
                    <p>Estimates and recommendations are paused until these inputs are complete.</p>
                  </div>
                </div>
              )}
              {tab === 'details' || !analysis.valid ? (
                <ShipmentForm
                  s={selected}
                  manualMode={mode === 'what-if'}
                  update={update}
                  onAnalyze={() => {
                    setTab('analysis');
                    window.scrollTo(0, 0);
                  }}
                />
              ) : mode === 'forecast' ? (
                <Forecast
                  key={`${selected.id}:${selected.routeId}:${selected.originCountry}:${selected.supplier}`}
                  s={selected}
                  a={analysis}
                  forecast={forecast}
                  series={signals.series}
                  onSeries={changeSeries}
                  onRefresh={refreshSignals}
                  onHorizon={setHorizon}
                  onManual={() => setMode('what-if')}
                  onMemo={openMemo}
                  notice={signals.error || signalNotice}
                />
              ) : (
                <Analysis
                  s={selected}
                  a={analysis}
                  update={update}
                  eventContext={
                    contextEvent
                      ? {
                          name: contextEvent.name,
                          oddsUnavailable: !contextSignal || contextSignal.probabilityBps === null,
                        }
                      : observedContext?.shipmentId === selected.id
                        ? { name: observedContext.event.title, oddsUnavailable: true }
                        : forecastContext?.shipmentId === selected.id
                          ? {
                              name: `${forecastContext.storm.name} advisory ${forecastContext.storm.advisoryNumber}`,
                              oddsUnavailable: true,
                            }
                          : undefined
                  }
                  onEdit={() => {
                    setTab('details');
                    window.scrollTo(0, 0);
                  }}
                  onMemo={openMemo}
                />
              )}
            </>
          )}
          {view === 'import' && (
            <ImportShipments
              shipments={shipments}
              onCommit={imported}
              onBack={() => navigate('overview')}
            />
          )}
          {view === 'methods' && <Methods onBack={analyze} />}
          {view === 'memo' && snapshot && (
            <Memo snapshot={snapshot} onBack={analyze} onRefresh={openMemo} />
          )}
          <footer className="app-footer">
            <span>
              <span className="footer-symbol">≈</span> Know the cost. See the risk. Make the move.
            </span>
            <span>
              Illustrative scenarios · Not a live forecast{' '}
              <button aria-label="Read methods and limitations" onClick={() => navigate('methods')}>
                <CircleHelp size={13} />
              </button>
            </span>
          </footer>
        </main>
      </div>
    </div>
  );
}
