import { expect, test, type Page } from '@playwright/test';
import { exampleSeries } from '../src/lib/forecast';

async function openForecastWorkspace(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Explore supply-chain risks' }).click();
  const menu = page.getByRole('button', { name: 'Open navigation' });
  if (await menu.isVisible()) await menu.click();
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('button', { name: 'My Exposure', exact: true })
    .click();
  await page.getByRole('button', { name: 'Analyze this shipment' }).click();
}

test('no-data forecast, explicit fictional baseline, refresh, local persistence and frozen memo', async ({
  page,
}, testInfo) => {
  test.setTimeout(90_000);
  await openForecastWorkspace(page);
  await expect(page.getByRole('button', { name: 'Forecast', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.getByRole('slider')).toHaveCount(0);
  await expect(
    page.getByText('No defensible automatic estimate available for this lane/event.', {
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.getByTestId('decision-wait')).toHaveCount(0);
  await page.getByText('Forecast evidence & diagnostics', { exact: true }).click();
  const asOfLabel = page.getByText('As of / generated', { exact: true });
  await expect(asOfLabel).toBeVisible();
  const generation = asOfLabel.locator('..').locator('dd');
  const beforeHorizonChange = await generation.innerText();
  await page.getByRole('combobox', { name: 'Forecast horizon' }).selectOption('56');
  await expect(generation).not.toHaveText(beforeHorizonChange);
  await page.getByRole('combobox', { name: 'Forecast horizon' }).selectOption('28');
  await page.getByRole('button', { name: 'Refresh signals', exact: true }).click();
  await expect(page.getByRole('status', { name: 'Signal refresh status' })).toContainText(
    'No sample fallback',
  );
  await page.getByRole('tab', { name: 'Shipment & assumptions' }).click();
  await expect(
    page.getByRole('spinbutton', { name: 'Tariff event probability', exact: true }),
  ).toHaveCount(0);
  await page.getByRole('tab', { name: 'Cost & decisions' }).click();
  await page
    .getByText('Import observations or preview a fictional baseline', { exact: true })
    .click();
  await page.getByRole('button', { name: 'Load fictional observations', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Automatic forecast' })).toContainText(
    '$4,700 / FEU',
  );
  await expect(page.getByText('Illustrative automated baseline', { exact: false })).toBeVisible();
  await page.getByLabel('Forty-foot containers', { exact: true }).fill('2');
  await page.getByLabel('Comparable reference rate per FEU', { exact: true }).fill('4000');
  await page.getByLabel('I confirm the container count', { exact: false }).check();
  await expect(page.getByText('Incremental freight sensitivity:', { exact: false })).toContainText(
    '$1,400',
  );
  if (testInfo.project.name === 'desktop')
    await page.screenshot({ path: 'output/preview/forecast-baseline.png', fullPage: true });
  await page.getByRole('button', { name: 'Create forecast memo' }).click();
  await expect(page.getByTestId('decision-memo')).toContainText('ILLUSTRATIVE');
  await expect(page.getByTestId('decision-memo')).toContainText(
    'No automatic action recommendation',
  );
  if (testInfo.project.name === 'desktop')
    await page.pdf({
      path: 'output/pdf/forecast-evidence-memo.pdf',
      preferCSSPageSize: true,
      printBackground: true,
    });
  await page.reload();
  await openForecastWorkspace(page);
  await expect(page.getByRole('region', { name: 'Automatic forecast' })).toContainText(
    '$4,700 / FEU',
  );
  await page.getByRole('button', { name: 'What if?', exact: true }).click();
  const slider = page.getByRole('slider', { name: 'Tariff event probability' });
  await slider.focus();
  await slider.press('Home');
  await slider.press('ArrowRight');
  await expect(page.getByText('Override saved;', { exact: false })).toBeVisible();
  await page.reload();
  await openForecastWorkspace(page);
  await page.getByRole('button', { name: 'What if?', exact: true }).click();
  await expect(slider).toHaveValue('100');
  await page.getByRole('button', { name: 'Restore original scenario odds' }).click();
  await expect(slider).toHaveValue('4000');
  await page.getByRole('button', { name: 'Forecast', exact: true }).click();
  await expect(page.getByRole('slider')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)).toBe(
    false,
  );
});

test('invalid signal import is atomic; refresh failures and lane changes do not substitute sample odds', async ({
  page,
}) => {
  await openForecastWorkspace(page);
  await page
    .getByText('Import observations or preview a fictional baseline', { exact: true })
    .click();
  await page
    .getByLabel('Freight observations JSON')
    .setInputFiles({ name: 'bad.json', mimeType: 'application/json', buffer: Buffer.from('{}') });
  await expect(page.getByRole('alert')).toContainText('Invalid series');
  await page.getByLabel('Freight observations JSON').setInputFiles({
    name: 'series.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(exampleSeries())),
  });
  await expect(page.getByRole('region', { name: 'Automatic forecast' })).toContainText(
    '$4,700 / FEU',
  );
  await page.getByRole('tab', { name: 'Shipment & assumptions' }).click();
  const lane = page.getByRole('combobox', { name: 'Commercial lane', exact: true });
  await expect(lane).toBeVisible();
  await lane.scrollIntoViewIfNeeded();
  await lane.selectOption({ label: 'Hamburg → Newark' });
  await page.getByRole('tab', { name: 'Cost & decisions' }).click();
  await expect(page.getByRole('region', { name: 'Automatic forecast' })).not.toContainText(
    '$4,700 / FEU',
  );
  await page.evaluate(() => localStorage.setItem('cost-current-freight-series-v1', '{'));
  await page.getByRole('button', { name: 'Refresh signals', exact: true }).click();
  await expect(page.getByRole('status', { name: 'Signal refresh status' })).toContainText(
    'could not be read',
  );
  await expect(page.getByRole('slider')).toHaveCount(0);
});
