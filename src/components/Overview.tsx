import { hasCustomerEvidence } from '../lib/evidence';
import { ArrowDownRight, ArrowRight, ChevronRight, Package, FileUp } from 'lucide-react';
import { analyzeShipment } from '../lib/engine';
import { routes } from '../lib/data';
import { dateLabel, percent, usd } from '../lib/format';
import type { Shipment } from '../lib/types';
import { Metric, SectionHeading, SourceBadge } from './ui';
import RouteGlobe from './RouteGlobe';
export default function Overview({
  shipments,
  selected,
  onSelect,
  onAnalyze,
  onAdd,
  onImport,
}: {
  shipments: Shipment[];
  selected: Shipment;
  onSelect: (id: string) => void;
  onAnalyze: () => void;
  onAdd: () => void;
  onImport: () => void;
}) {
  const analyses = shipments.map((s) => analyzeShipment(s));
  const valid = analyses.filter((a) => a.valid);
  const totalBase = valid.reduce((sum, a) => sum + a.baseCents, 0),
    totalExposure = valid.reduce((sum, a) => sum + a.addedCents, 0);
  const a = analyzeShipment(selected),
    r = routes.find((r) => r.id === selected.routeId) || routes[0];
  const savings = a.valid ? a.actions.find((x) => x.id === 'early')?.savingsCents : null;
  const activeRoutes = routes.filter((r) => shipments.some((s) => s.routeId === r.id));
  const selectRoute = (id: string) => {
    if (selected.routeId === id) return;
    const s = shipments.find((s) => s.routeId === id);
    if (s) onSelect(s.id);
  };
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Import exposure</h1>
          <p>Modeled cost, extra exposure, and the shipment to inspect next.</p>
        </div>
        <div className="button-row">
          <button className="button secondary" onClick={onImport}>
            <FileUp size={16} /> Import CSV
          </button>
          <button className="button primary" onClick={onAdd}>
            <Package size={16} /> Add shipment
          </button>
        </div>
      </div>
      <div className="metrics-grid">
        <Metric
          label="Modeled base cost"
          value={usd(totalBase)}
          detail={`${valid.length} itemized shipments · USD`}
        />
        <Metric
          label="Expected extra cost"
          value={usd(totalExposure)}
          detail="Probability-weighted scenario exposure"
          accent
        />
        <Metric
          label="Active demo lanes"
          value={String(activeRoutes.length).padStart(2, '0')}
          detail="Illustrative routes, not vessel tracks"
        />
        <Metric
          label="Conditional early advantage"
          value={savings !== null && savings !== undefined ? usd(savings) : 'Needs inputs'}
          detail="Only if early entry is eligible. Not a realized saving."
        >
          <ArrowDownRight size={16} />
        </Metric>
      </div>
      {valid.length !== shipments.length && (
        <div className="notice">
          Portfolio totals exclude {shipments.length - valid.length} shipment(s) with incomplete
          inputs.
        </div>
      )}
      <div className="overview-grid">
        <section className="panel world-panel">
          <SectionHeading
            title="Route context"
            description="Select a lane to choose its shipment."
            action={<span className="subtle-pill">{activeRoutes.length} ROUTES</span>}
          />
          <RouteGlobe compact routes={activeRoutes} selected={r.id} onSelect={selectRoute} />
          <div className="world-footnote">
            <span className="live-dot" /> Schematic route connections, not vessel tracks. Colors
            indicate selection.
          </div>
        </section>
        <aside className="panel shipment-panel">
          <div className="selected-heading">
            <h2 className="selected-kicker">Selected shipment</h2>
            <SourceBadge
              edited={selected.edited.length > 0}
              customer={hasCustomerEvidence(selected)}
            />
          </div>
          <div className="route-heading">
            <span>{r.origin}</span>
            <ArrowDownRight size={24} />
            <span>{r.destination}</span>
          </div>
          <div className="route-codes">
            {r.originCode} <span>→</span> {r.destinationCode}
          </div>
          <div className="selected-company">
            <div className="company-icon">
              <Package size={20} />
            </div>
            <div>
              <h3>{selected.name}</h3>
              <p>{selected.product}</p>
            </div>
          </div>
          <dl className="shipment-facts">
            <div>
              <dt>Customs value</dt>
              <dd>{usd(selected.customsCents)}</dd>
            </div>
            <div>
              <dt>Planned arrival</dt>
              <dd>{dateLabel(selected.arrivalDate)}</dd>
            </div>
            <div>
              <dt>Assumed current duty</dt>
              <dd>{percent(selected.dutyRateBps / 10000)}</dd>
            </div>
            <div>
              <dt>Freight estimate</dt>
              <dd>{usd(selected.freightCents)}</dd>
            </div>
          </dl>
          <div className="selected-exposure">
            <span>Expected additional cost</span>
            <strong>{a.valid ? usd(a.addedCents) : 'Check inputs'}</strong>
            <p>From two hypothetical events if exposed</p>
            {a.valid && (
              <div className="exposure-track">
                <i
                  style={{
                    width: `${a.addedCents ? (a.tariffExposureCents / a.addedCents) * 100 : 0}%`,
                  }}
                />
                <i style={{ flex: 1 }} />
              </div>
            )}
            <div className="track-legend">
              <span>
                <i />
                Tariff
              </span>
              <span>
                <i />
                Freight
              </span>
            </div>
          </div>
          <button className="button primary full" onClick={onAnalyze}>
            Analyze this shipment <ArrowRight size={16} />
          </button>
          <div className="quiet-caption">Illustrative inputs. Reproducible calculations.</div>
        </aside>
      </div>
      <section className="shipments-section">
        <SectionHeading
          number="01"
          title="Shipment watchlist"
          description="Select a shipment to explore the assumptions behind it."
          action={<span className="muted small">{shipments.length} demo shipments</span>}
        />
        <div className="table-scroll">
          <table className="shipment-table">
            <thead>
              <tr>
                <th>SHIPMENT / PRODUCT</th>
                <th>TRADE LANE</th>
                <th>BASE COST</th>
                <th>EXTRA EXPOSURE</th>
                <th>STATUS</th>
                <th>
                  <span className="sr-only">Select</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {shipments.map((s) => {
                const analysis = analyzeShipment(s),
                  route = routes.find((r) => r.id === s.routeId) || routes[0];
                return (
                  <tr key={s.id} className={s.id === selected.id ? 'selected-row' : ''}>
                    <td>
                      <button className="shipment-link" onClick={() => onSelect(s.id)}>
                        <span className="table-icon">
                          <Package size={17} />
                        </span>
                        <span>
                          <strong>{s.name}</strong>
                          <small>{s.product || 'Product details needed'}</small>
                        </span>
                      </button>
                    </td>
                    <td>
                      {route.origin}
                      <span className="lane-arrow">→</span>
                      {route.destination}
                    </td>
                    <td>{analysis.valid ? usd(analysis.baseCents) : '—'}</td>
                    <td className="amber-text">
                      {analysis.valid ? `+${usd(analysis.addedCents)}` : 'Check inputs'}
                    </td>
                    <td>
                      <span className="status-chip">
                        {hasCustomerEvidence(s)
                          ? 'Customer inputs'
                          : s.intake
                            ? 'Imported assumptions'
                            : s.edited.length
                              ? 'Edited locally'
                              : 'Illustrative'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="icon-button"
                        aria-label={`Analyze ${s.name}`}
                        onClick={() => {
                          onSelect(s.id);
                          onAnalyze();
                        }}
                      >
                        <ChevronRight size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
