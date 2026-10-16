import { countries } from '../lib/geography';
import type { Route } from '../lib/types';
const point = (lng: number, lat: number) => [(lng + 180) * 2, (90 - lat) * 2];
export default function MapFallback({
  routes,
  selected,
  onSelect,
}: {
  routes: Route[];
  selected: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flat-map" data-testid="map-fallback">
      <svg
        viewBox="0 0 720 360"
        aria-label="Selectable map of illustrative shipment routes"
        role="img"
      >
        <defs>
          <pattern id="map-grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#294043" strokeWidth=".5" />
          </pattern>
        </defs>
        <rect width="720" height="360" fill="url(#map-grid)" />
        {countries.map((f, i) => {
          const polygons =
            f.geometry.type === 'Polygon'
              ? [f.geometry.coordinates]
              : f.geometry.type === 'MultiPolygon'
                ? f.geometry.coordinates
                : [];
          return (
            <path
              key={i}
              d={polygons
                .map((p) =>
                  p
                    .map(
                      (r) =>
                        r
                          .map((c, j) => `${j ? 'L' : 'M'}${point(c[0], c[1]).join(',')}`)
                          .join(' ') + 'Z',
                    )
                    .join(' '),
                )
                .join(' ')}
              fill="#233e40"
              stroke="#385557"
              strokeWidth=".45"
            />
          );
        })}
        {routes.map((r) => {
          const [sx, sy] = point(r.startLng, r.startLat);
          const [rawEx, ey] = point(r.endLng, r.endLat);
          let ex = rawEx;
          if (Math.abs(ex - sx) > 360) ex += ex < sx ? 720 : -720;
          const path = `M${sx},${sy}Q${(sx + ex) / 2},${Math.min(sy, ey) - 70} ${ex},${ey}`;
          return (
            <g
              key={r.id}
              fill="none"
              stroke={r.id === selected ? '#bbf889' : '#7eafb1'}
              strokeWidth={r.id === selected ? 2.5 : 1.2}
            >
              {[-720, 0, 720].map((offset) => (
                <path
                  key={offset}
                  d={path}
                  transform={`translate(${offset},0)`}
                  className="map-route"
                  role="button"
                  tabIndex={0}
                  aria-label={`Select ${r.origin} to ${r.destination}`}
                  onClick={() => onSelect(r.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelect(r.id);
                    }
                  }}
                />
              ))}
              <circle cx={sx} cy={sy} r="3" fill="currentColor" />
              <circle cx={(ex + 720) % 720} cy={ey} r="3" fill="currentColor" />
            </g>
          );
        })}
      </svg>
      <span className="map-caption">2D route view · Illustrative commercial lanes</span>
    </div>
  );
}
