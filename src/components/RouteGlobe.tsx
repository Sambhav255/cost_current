import { Component, lazy, Suspense, useState, useSyncExternalStore } from 'react';
import type { ReactNode } from 'react';
import { Globe2, Map, Minus, Plus, RotateCcw } from 'lucide-react';
import type { Route } from '../lib/types';
import MapFallback from './MapFallback';
const GlobeView = lazy(() => import('./GlobeView'));
const media =
  typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
const subscribe = (cb: () => void) => {
  media?.addEventListener('change', cb);
  return () => media?.removeEventListener('change', cb);
};
class GlobeBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}
export default function RouteGlobe({
  routes,
  selected,
  onSelect,
  compact = false,
  eventZones,
}: {
  routes: Route[];
  selected: string;
  onSelect: (id: string) => void;
  compact?: boolean;
  eventZones?: { id: string; label: string; points: { lat: number; lng: number }[] }[];
}) {
  const reduced = useSyncExternalStore(subscribe, () => media?.matches ?? false);
  const [flat, setFlat] = useState(() => !hasWebGL()),
    [reset, setReset] = useState(0),
    [zoom, setZoom] = useState(1);
  const fallback = (
    <MapFallback routes={routes} selected={selected} onSelect={onSelect} eventZones={eventZones} />
  );
  return (
    <div className={`route-globe ${compact ? 'compact-globe' : ''}`}>
      <div className="globe-grid" />
      <div className="globe-topline">
        <span>
          <span className="live-dot" />
          ILLUSTRATIVE ROUTE CONNECTIONS
        </span>
        <button
          className="map-switch"
          onClick={() => setFlat((v) => !v)}
          aria-label={flat ? 'Switch to 3D globe' : 'Switch to 2D map'}
        >
          {flat ? <Globe2 size={13} /> : <Map size={13} />} {flat ? '3D globe' : '2D view'}
        </button>
      </div>
      <div className="globe-stage" style={{ transform: `scale(${zoom})` }}>
        {flat ? (
          fallback
        ) : (
          <GlobeBoundary fallback={fallback}>
            <Suspense
              fallback={
                <div className="globe-loading">
                  Preparing your world view
                  <span />
                </div>
              }
            >
              <GlobeView
                key={reset}
                routes={routes}
                selected={selected}
                onSelect={onSelect}
                reduced={reduced}
              />
            </Suspense>
          </GlobeBoundary>
        )}
      </div>
      <div className="globe-bottomline">
        <span>{flat ? 'Select a route on the map' : 'Drag to rotate · Scroll to explore'}</span>
        <div className="globe-controls">
          <button
            aria-label="Zoom in"
            onClick={() => setZoom((z) => Math.min(1.35, z + 0.1))}
            disabled={zoom >= 1.35}
          >
            <Plus size={15} />
          </button>
          <button
            aria-label="Zoom out"
            onClick={() => setZoom((z) => Math.max(0.8, z - 0.1))}
            disabled={zoom <= 0.8}
          >
            <Minus size={15} />
          </button>
          <button
            aria-label="Reset globe view"
            onClick={() => {
              setZoom(1);
              setReset((x) => x + 1);
            }}
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>
      <div className="globe-legend">
        <span>
          <i />
          Selected shipment
        </span>
        <span>
          <i />
          Other demo routes
        </span>
      </div>
    </div>
  );
}
