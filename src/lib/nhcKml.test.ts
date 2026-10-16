import { describe, expect, it } from 'vitest';
import { zipSync, strToU8 } from 'fflate';
import { parseConeKml, parseConeKmz, pointInCone } from './nhcKml';

const kml = (coordinates: string, advisory = '12') =>
  `<kml><Document><Placemark><Polygon><outerBoundaryIs><LinearRing><coordinates>${coordinates}</coordinates></LinearRing></outerBoundaryIs></Polygon><ExtendedData><Data name="atcfid"><value>EP212026</value></Data><Data name="advisoryNum"><value>${advisory}</value></Data><Data name="fcstpd"><value>120</value></Data></ExtendedData></Placemark></Document></kml>`;
const square = '179,0,0 -179,0,0 -179,2,0 179,2,0 179,0,0';

describe('official NHC cone geometry', () => {
  it('parses bounded KMZ and rejects mismatched advisory, storm and malformed polygon', () => {
    const archive = zipSync({ 'cone.kml': strToU8(kml(square)) });
    const cone = parseConeKmz(archive, 'ep212026', '012');
    expect(cone?.forecastHours).toBe(120);
    expect(parseConeKmz(archive, 'ep212026', '013')).toBeNull();
    expect(parseConeKmz(archive, 'al212026', '012')).toBeNull();
    expect(parseConeKml(kml('0,0 1,0 1,1 0,1'), 'ep212026', '012')).toBeNull();
  });
  it('checks dateline wrap and polygon holes without treating a cone as wind extent', () => {
    const cone = parseConeKml(kml(square), 'ep212026', '012')!;
    expect(pointInCone([179.5, 1], cone)).toBe(true);
    expect(pointInCone([-179.5, 1], cone)).toBe(true);
    expect(pointInCone([0, 1], cone)).toBe(false);
    cone.holes = [
      [
        [179.4, 0.4],
        [-179.4, 0.4],
        [-179.4, 1.6],
        [179.4, 1.6],
        [179.4, 0.4],
      ],
    ];
    expect(pointInCone([179.5, 1], cone)).toBe(false);
  });
});
