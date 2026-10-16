/**
 * Capture comprehensive desktop screenshots of each Cost Current page.
 * Usage: node scripts/capture-screenshots.mjs
 * Requires: npm run dev on http://127.0.0.1:5173
 */
import { chromium, devices } from '@playwright/test';
import { existsSync, mkdirSync, readdirSync, unlinkSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

process.env.PLAYWRIGHT_BROWSERS_PATH ??= fileURLToPath(
  new URL('../.playwright', import.meta.url),
);

const root = fileURLToPath(new URL('..', import.meta.url));
const outDir = path.join(root, 'screenshots');
const baseURL = 'http://127.0.0.1:5173';
const bravePath = '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser';
const executablePath =
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ??
  (!existsSync(chromium.executablePath()) && existsSync(bravePath) ? bravePath : undefined);

mkdirSync(outDir, { recursive: true });
for (const name of readdirSync(outDir)) {
  if (/\.(png|jpe?g|webp)$/i.test(name)) unlinkSync(path.join(outDir, name));
}

async function navigate(page, name) {
  const menu = page.getByRole('button', { name: 'Open navigation' });
  if (await menu.isVisible()) await menu.click();
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('button', { name, exact: true })
    .click();
}

async function shot(page, name, fullPage = true) {
  const file = path.join(outDir, `${name}.png`);
  await page.waitForTimeout(400);
  await page.screenshot({ path: file, fullPage });
  console.log(`wrote ${name}.png`);
}

const browser = await chromium.launch({
  headless: true,
  executablePath,
});
const context = await browser.newContext({
  ...devices['Desktop Chrome'],
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 1,
});
const page = await context.newPage();

try {
  // 01 Welcome
  await page.goto(baseURL, { waitUntil: 'networkidle' });
  await shot(page, '01-welcome');

  // 02 Intelligence (default after explore)
  await page.getByRole('button', { name: 'Explore supply-chain risks' }).click();
  await page.waitForTimeout(600);
  await shot(page, '02-intelligence');

  // Open a tariff event if present for a second intelligence angle
  const eventButton = page
    .getByRole('button')
    .filter({ hasText: /tariff|China|home.?goods|Suez|corridor/i })
    .first();
  if (await eventButton.isVisible().catch(() => false)) {
    await eventButton.click();
    await page.waitForTimeout(500);
    await shot(page, '02b-intelligence-event-detail');
  }

  // 03 My Exposure
  await navigate(page, 'My Exposure');
  await page.waitForTimeout(800);
  await shot(page, '03-my-exposure');

  const switchTo2D = page.getByRole('button', { name: 'Switch to 2D map' });
  if (await switchTo2D.isVisible().catch(() => false)) {
    await switchTo2D.click();
    await page.waitForTimeout(400);
    await shot(page, '03b-my-exposure-2d-map');
  }

  // 04 Decisions — What if?
  await page.getByRole('button', { name: 'Analyze this shipment' }).click();
  await page.getByRole('button', { name: 'What if?', exact: true }).click();
  await page.waitForTimeout(500);
  await shot(page, '04-decisions-what-if');

  // Assumptions tab on same page
  const assumptions = page.getByRole('tab', { name: 'Shipment & assumptions' });
  if (await assumptions.isVisible().catch(() => false)) {
    await assumptions.click();
    await page.waitForTimeout(400);
    await shot(page, '04b-decisions-assumptions');
    await page.getByRole('tab', { name: 'Cost & decisions' }).click();
    await page.waitForTimeout(300);
  }

  // 05 Decisions — Forecast (unavailable / empty first)
  await page.getByRole('button', { name: 'Forecast', exact: true }).click();
  await page.waitForTimeout(500);
  await shot(page, '05-decisions-forecast');

  // Load fictional baseline if available
  const loadBaseline = page.getByRole('button', { name: 'Load fictional observations', exact: true });
  const openImportObs = page.getByText(
    'Import observations or preview a fictional baseline',
    { exact: true },
  );
  if (await openImportObs.isVisible().catch(() => false)) {
    await openImportObs.click();
    await page.waitForTimeout(300);
  }
  if (await loadBaseline.isVisible().catch(() => false)) {
    await loadBaseline.click();
    await page.waitForTimeout(600);
    await shot(page, '05b-decisions-forecast-baseline');

    const evidence = page.getByText('Forecast evidence & diagnostics', { exact: true });
    if (await evidence.isVisible().catch(() => false)) {
      await evidence.click();
      await page.waitForTimeout(400);
      await shot(page, '05c-decisions-forecast-evidence');
    }
  }

  // Back to What if for a clean memo with demo defaults
  await page.getByRole('button', { name: 'What if?', exact: true }).click();
  await page.waitForTimeout(300);

  // 06 Decision memo
  await navigate(page, 'Decision memo');
  // If nav disabled, use in-page button
  if (!(await page.getByTestId('decision-memo').isVisible().catch(() => false))) {
    await navigate(page, 'Decisions');
    await page.getByRole('button', { name: 'What if?', exact: true }).click();
    await page.getByRole('button', { name: 'Create decision memo' }).click();
  }
  await page.waitForTimeout(500);
  await shot(page, '06-decision-memo');

  // 07 Import
  await navigate(page, 'Import');
  await page.waitForTimeout(400);
  await shot(page, '07-import');

  const preview = page.getByRole('button', { name: 'Preview shipments', exact: true });
  if (await preview.isVisible().catch(() => false)) {
    await preview.click();
    await page.waitForTimeout(500);
    await shot(page, '07b-import-preview');
  }

  // 08 Methods
  await navigate(page, 'Methods & evidence');
  await page.waitForTimeout(400);
  await shot(page, '08-methods');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
  await page.waitForTimeout(300);
  await shot(page, '08b-methods-mid');

  // Mobile welcome + intelligence for responsive reference
  await context.close();
  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    deviceScaleFactor: 2,
  });
  const m = await mobile.newPage();
  await m.goto(baseURL, { waitUntil: 'networkidle' });
  await shot(m, '09-mobile-welcome');
  await m.getByRole('button', { name: 'Explore supply-chain risks' }).click();
  await m.waitForTimeout(600);
  await shot(m, '09b-mobile-intelligence');
  await mobile.close();

  console.log('\nDone. Files in screenshots/:');
  for (const name of readdirSync(outDir).sort()) {
    if (name.endsWith('.png')) console.log(`  ${name}`);
  }
} finally {
  await browser.close();
}
