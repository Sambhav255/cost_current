import { readFileSync } from 'node:fs';
import {
  evaluatePortWatch,
  parsePortWatchSeries,
  portWatchAnomaly,
  SUEZ_PORT_ID,
} from '../src/lib/portwatch';

const DAY = 86_400_000;
const date = (start: string, offset: number) =>
  new Date(Date.parse(`${start}T00:00:00.000Z`) + offset * DAY).toISOString().slice(0, 10);

function syntheticFixture() {
  const start = '2026-01-01';
  return {
    provenance: 'synthetic_fixture',
    rightsReference: 'Generated locally by scripts/portwatch-research.ts; no IMF observations.',
    observations: Array.from({ length: 70 }, (_, i) => ({
      date: date(start, i),
      portId: SUEZ_PORT_ID,
      portName: 'Fictional Suez research fixture',
      metric: 'n_container',
      vesselsPerDay: 10 + (i % 7) + (i >= 56 ? 2 : 0),
      objectId: i + 1,
      availableAt: `${date(start, i + 1)}T12:00:00.000Z`,
      retrievedAt: `${date(start, i + 1)}T12:00:00.000Z`,
    })),
  };
}

const path = process.argv[2];
if (!path) {
  process.stderr.write(
    'Usage: npm run research:portwatch -- --synthetic | /path/to/permissioned-vintages.json\n',
  );
  process.exitCode = 1;
} else {
  try {
    const raw =
      path === '--synthetic' ? syntheticFixture() : JSON.parse(readFileSync(path, 'utf8'));
    const series = parsePortWatchSeries(raw);
    const dates = series.observations.map((o) => o.date).sort();
    const asOf = dates.at(-1) ? date(dates.at(-1)!, 1) : null;
    process.stdout.write(
      `${JSON.stringify(
        {
          targetUnit: 'container vessels/day',
          provenance: series.provenance,
          rightsReference: series.rightsReference,
          records: series.observations.length,
          observedWindow: dates.length ? [dates[0], dates.at(-1)] : null,
          anomaly: asOf ? portWatchAnomaly(series, asOf) : { status: 'insufficient_coverage' },
          backtest: evaluatePortWatch(series),
        },
        null,
        2,
      )}\n`,
    );
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : 'Invalid research input.'}\n`);
    process.exitCode = 1;
  }
}
