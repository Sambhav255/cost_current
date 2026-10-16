import { expect, test, type Page } from '@playwright/test';
import { CSV_COLUMNS, parseCsv, sampleCsv } from '../src/lib/csv';

function csv(changes: Record<string, string> = {}) {
  const parsed = parseCsv(sampleCsv());
  const data = Object.fromEntries(parsed.cells[0].map((name, i) => [name, parsed.cells[1][i]]));
  Object.assign(data, changes);
  const quote = (s: string) => (/[",\r\n]/.test(s) ? '"' + s.replaceAll('"', '""') + '"' : s);
  return (
    CSV_COLUMNS.join(',') + '\r\n' + CSV_COLUMNS.map((name) => quote(data[name])).join(',') + '\r\n'
  );
}
async function openImport(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Try an example shipment' }).click();
  await page.getByRole('button', { name: 'Import CSV', exact: true }).click();
}
async function preview(page: Page, text: string) {
  await page.getByLabel('CSV contents', { exact: true }).fill(text);
  await page.getByRole('button', { name: 'Preview shipments', exact: true }).click();
}

test('quote CSV → preview → ledger → source edits → memo → persistence', async ({
  page,
}, testInfo) => {
  await openImport(page);
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download sample CSV', exact: true }).click();
  expect((await download).suggestedFilename()).toBe('cost-current-shipment-template.csv');
  const data = csv({
    shipment_id: 'pilot-a',
    shipment_name: 'Importer pilot A',
    source_type: 'customer_supplied',
    source_reference: 'Fictional test quote A-001',
    source_as_of: '2026-10-14',
    insurance_usd: '125',
  });
  await page
    .getByLabel('Shipment CSV file', { exact: true })
    .setInputFiles({ name: 'pilot.csv', mimeType: 'text/csv', buffer: Buffer.from(data) });
  await expect(page.getByLabel('CSV contents', { exact: true })).toHaveValue(
    data.replace(/\r\n/g, '\n'),
  );
  await page.getByRole('button', { name: 'Preview shipments', exact: true }).click();
  await expect(page.getByTestId('import-preview')).toContainText('$117,125.00');
  await expect(page.getByTestId('import-preview')).toContainText(
    'Customer supplied · not independently verified',
  );
  await expect(page.getByRole('button', { name: 'Import 1 shipment', exact: true })).toBeDisabled();
  if (testInfo.project.name === 'desktop')
    await page.screenshot({ path: 'output/preview/quote-backed-intake.png', fullPage: true });
  await page.getByLabel('I have itemized goods, duty and freight.').check();
  await page.getByRole('button', { name: 'Import 1 shipment', exact: true }).click();
  await expect(page.locator('.selected-company')).toContainText('Importer pilot A');
  await page.getByRole('button', { name: 'Analyze this shipment' }).click();
  await page.getByRole('button', { name: 'What if?', exact: true }).click();
  const ledger = page.getByRole('table', { name: 'Landed cost ledger' });
  await expect(ledger).toContainText('Fictional test quote A-001');
  await expect(ledger).toContainText('Oct 14, 2026');
  await expect(
    ledger
      .getByRole('row')
      .filter({ has: page.getByRole('rowheader', { name: 'Insurance', exact: true }) }),
  ).toContainText('$125.00');

  await page.getByRole('tab', { name: 'Shipment & assumptions' }).click();
  await page
    .getByRole('combobox', { name: 'Insurance inclusion', exact: true })
    .selectOption('goods');
  await page.getByRole('spinbutton', { name: 'Freight estimate', exact: true }).fill('8000');
  await page.getByRole('button', { name: 'What if?', exact: true }).click();
  await page.getByRole('button', { name: 'Review cost & decisions' }).click();
  await expect(page.getByTestId('decision-wait')).toContainText('$124,600');
  await expect(
    ledger
      .getByRole('row')
      .filter({ has: page.getByRole('rowheader', { name: 'Freight', exact: true }) }),
  ).toContainText('Input edited; attach updated source evidence.');
  await expect(
    ledger
      .getByRole('row')
      .filter({ has: page.getByRole('rowheader', { name: 'Insurance', exact: true }) }),
  ).toContainText('Already in goods');
  await page.getByRole('button', { name: 'Create decision memo' }).click();
  await expect(page.getByTestId('decision-memo')).toContainText('$124,600');
  await expect(page.getByTestId('decision-memo')).toContainText('Fictional test quote A-001');
  await expect(page.getByTestId('decision-memo')).toContainText(
    'Insurance $125 (Already in goods)',
  );
  if (testInfo.project.name === 'desktop')
    await page.pdf({
      path: 'output/pdf/quote-backed-decision-memo.pdf',
      preferCSSPageSize: true,
      printBackground: true,
    });

  await page.reload();
  await page.getByRole('button', { name: 'Try an example shipment' }).click();
  await expect(
    page.getByRole('button', {
      name: 'Importer pilot A Ceramic tableware · Holiday collection',
      exact: true,
    }),
  ).toBeVisible();
  const menu = page.getByRole('button', { name: 'Open navigation' });
  if (await menu.isVisible()) await menu.click();
  await page.getByRole('button', { name: 'Reset demo data', exact: true }).click();
  await expect(
    page.getByRole('button', {
      name: 'Importer pilot A Ceramic tableware · Holiday collection',
      exact: true,
    }),
  ).toBeVisible();
});

test('invalid and duplicate CSV rows never partially import', async ({ page }) => {
  await openImport(page);
  const good = sampleCsv(),
    badRow = csv({ shipment_id: 'bad-extra', freight_usd: '-10' }).trimEnd().split('\r\n')[1];
  await preview(page, good + badRow + '\r\n');
  await expect(page.getByTestId('import-preview')).toContainText(
    'enter a nonnegative plain number',
  );
  await expect(
    page.getByRole('button', { name: 'Import 2 shipments', exact: true }),
  ).toBeDisabled();
  await preview(page, csv({ shipment_id: 'northstar' }));
  await expect(page.getByTestId('import-preview')).toContainText(
    'Duplicate shipment_id: northstar',
  );
  await expect(page.getByRole('button', { name: 'Import 1 shipment', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Back to overview', exact: true }).click();
  await expect(page.locator('.shipment-table tbody tr')).toHaveCount(3);
});

test('WebGL unavailability leaves the default cost workflow usable', async ({ page }) => {
  await page.addInitScript(() =>
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', { value: () => null }),
  );
  await page.goto('/');
  await expect(page.getByTestId('map-fallback')).toBeVisible();
  await page.getByRole('button', { name: 'Try an example shipment' }).click();
  await page.getByRole('button', { name: 'Analyze this shipment' }).click();
  await page.getByRole('button', { name: 'What if?', exact: true }).click();
  await expect(page.getByTestId('decision-wait')).toContainText('$123,600');
});

test('manual intake requires real inputs and route edits preserve goods origin', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Try an example shipment' }).click();
  await page.getByRole('button', { name: 'Add shipment', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Enter the country of origin.');
  await expect(
    page.getByRole('spinbutton', { name: 'Goods acquisition cost', exact: true }),
  ).toHaveValue('');
  await page.getByLabel('Country of origin').fill('China');
  await page.getByRole('spinbutton', { name: 'Goods acquisition cost', exact: true }).fill('1000');
  await page.getByRole('spinbutton', { name: 'Customs value', exact: true }).fill('1000');
  await page.getByRole('spinbutton', { name: 'Freight estimate', exact: true }).fill('100');
  await page.getByRole('spinbutton', { name: 'Current assumed duty rate', exact: true }).fill('10');
  await page.getByRole('spinbutton', { name: 'Units', exact: true }).fill('100');
  await expect(page.getByRole('alert')).toHaveCount(0);
  await page
    .getByLabel('Cost source reference', { exact: true })
    .fill('Fictional manual invoice B-001');
  await page.getByLabel('Cost source as of', { exact: true }).fill('2026-10-14');
  await page.getByRole('button', { name: 'Attach source to base costs', exact: true }).click();
  await page.getByRole('button', { name: 'What if?', exact: true }).click();
  await page.getByRole('button', { name: 'Review cost & decisions' }).click();
  await expect(page.getByTestId('decision-wait')).toContainText('$1,200');
  await expect(page.getByRole('table', { name: 'Landed cost ledger' })).toContainText(
    'Customer supplied',
  );
  await page.getByRole('tab', { name: 'Shipment & assumptions' }).click();
  await page
    .getByRole('combobox', { name: 'Commercial lane', exact: true })
    .selectOption('ham-ewr');
  await expect(page.getByLabel('Country of origin')).toHaveValue('China');
  await page.getByRole('button', { name: 'What if?', exact: true }).click();
  await page.getByRole('button', { name: 'Review cost & decisions' }).click();
  await expect(page.getByRole('table', { name: 'Landed cost ledger' })).toContainText(
    'Input edited; attach updated source evidence.',
  );
  await expect(page.getByRole('table', { name: 'Landed cost ledger' })).toContainText(
    'Previous source: Fictional manual invoice B-001',
  );
});
