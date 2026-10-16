import atlas from 'world-atlas/countries-110m.json';
import { feature } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
const topology = atlas as unknown as Topology<{ countries: GeometryCollection }>;
export const countries = feature(topology, topology.objects.countries).features;
