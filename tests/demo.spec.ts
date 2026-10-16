import { expect, test, type Page } from '@playwright/test';

async function openAnalysis(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Try an example shipment' }).click();
  await page.getByRole('button', { name: 'Analyze this shipment' }).click();
  await page.getByRole('button', { name: 'What if?', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Northstar Home Goods', exact: true }),
  ).toBeVisible();
}

async function navigate(page: Page, name: string) {
  const menu = page.getByRole('button', { name: 'Open navigation' });
  if (await menu.isVisible()) await menu.click();
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('button', { name, exact: true })
    .click();
}

test('default costs, keyboard sensitivity, persistence, and memo stay consistent', async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await openAnalysis(page);
  await expect(page.getByTestId('decision-wait')).toContainText('$123,600');
  await expect(page.getByTestId('decision-early')).toContainText('$121,100');
  await expect(page.getByTestId('decision-early')).toContainText('$2,500 less than wait');
  if (testInfo.project.name === 'desktop') {
    await page.screenshot({ path: 'output/preview/cost-current-analysis.png', fullPage: true });
  }
  const probability = page.getByRole('slider', { name: 'Tariff event probability' });
  await probability.focus();
  await probability.press('Home');
  for (let i = 0; i < 10; i++) await probability.press('ArrowRight');
  await expect(probability).toHaveValue('1000');
  await expect(page.getByTestId('decision-wait')).toContainText('$119,100');
  await expect(page.getByTestId('decision-early')).toContainText('$2,000 more than wait');
  await expect(page.getByRole('heading', { name: 'The numbers favor waiting.' })).toBeVisible();

  await page.reload();
  await page.getByRole('button', { name: 'Try an example shipment' }).click();
  await page.getByRole('button', { name: 'Analyze this shipment' }).click();
  await page.getByRole('button', { name: 'What if?', exact: true }).click();
  await expect(page.getByRole('slider', { name: 'Tariff event probability' })).toHaveValue('1000');
  await page.getByRole('button', { name: 'Create decision memo' }).click();
  await expect(page.getByTestId('decision-memo')).toContainText('$119,100');
  await expect(page.getByTestId('decision-memo')).toContainText(
    'Wait has the lowest modeled expected cost.',
  );
  await expect(page.getByRole('button', { name: 'Print / Save PDF' })).toBeVisible();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download assumptions' }).click();
  expect((await download).suggestedFilename()).toMatch(/memo\.json$/);
  if (testInfo.project.name === 'desktop') {
    await page.pdf({
      path: 'output/pdf/cost-current-decision-memo.pdf',
      preferCSSPageSize: true,
      printBackground: true,
    });
    await page.emulateMedia({ media: 'print' });
    await expect(page.locator('.sidebar')).not.toBeVisible();
    await expect(page.getByTestId('decision-memo')).toBeVisible();
  }
  expect(errors).toEqual([]);
});

test('unknown tariff avoidance and bundled quotes pause unsupported recommendations', async ({
  page,
}) => {
  await openAnalysis(page);
  await page.getByRole('tab', { name: 'Shipment & assumptions' }).click();
  await page.getByLabel('Does early entry avoid the tariff?').selectOption('unknown');
  await page.getByRole('button', { name: 'Review cost & decisions' }).click();
  await expect(page.getByTestId('decision-early')).toContainText('Needs inputs');
  await expect(page.getByTestId('decision-early')).toContainText('Not ranked');
  await page.getByRole('tab', { name: 'Shipment & assumptions' }).click();
  await page.getByLabel('Quote cost basis').selectOption('bundled');
  await expect(page.getByRole('alert')).toContainText(
    'Separate goods, freight, duty, and other costs',
  );
  await expect(
    page.locator('#main-content').getByRole('button', { name: 'Decision memo', exact: true }),
  ).toBeDisabled();
});

test('route selection, 2D fallback, methods, and responsive shell work', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Try an example shipment' }).click();
  const switchTo2D = page.getByRole('button', { name: 'Switch to 2D map' });
  if (await switchTo2D.isVisible()) await switchTo2D.click();
  await expect(page.getByTestId('map-fallback')).toBeVisible();
  await page
    .getByRole('button', {
      name: 'Fieldwork Outdoor Woven outdoor chairs · Spring collection',
      exact: true,
    })
    .click();
  await expect(
    page.locator('.selected-company').getByRole('heading', { name: 'Fieldwork Outdoor' }),
  ).toBeVisible();
  await navigate(page, 'Methods & evidence');
  await expect(
    page.getByRole('heading', { name: /methods|understand|model|clarity/i }).first(),
  ).toBeVisible();
  await expect(page.getByText(/not trained|not yet trained|planned/i).first()).toBeVisible();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1,
  );
  expect(overflow).toBe(false);
});

test('a complete route alternative stays ranked when early entry is unknown', async ({ page }) => {
  await openAnalysis(page);
  await page.getByRole('tab', { name: 'Shipment & assumptions' }).click();
  await page.getByLabel('Does early entry avoid the tariff?').selectOption('unknown');
  await page.getByRole('button', { name: 'Review cost & decisions' }).click();
  await page.getByText('Configure a different route', { exact: true }).click();
  await page.getByLabel('Alternative route freight', { exact: true }).fill('4000');
  await page.getByLabel('Include this route in the comparison under these assumptions').check();
  await expect(page.getByTestId('decision-route')).toContainText('$120,700');
  await expect(page.getByTestId('decision-route')).toHaveClass(/best-card/);
  await expect(
    page.getByRole('heading', { name: 'Different route has the lowest expected cost.' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Create decision memo' }).click();
  await expect(page.getByTestId('decision-memo')).toContainText(
    'Different route has the lowest modeled expected cost.',
  );
  await expect(page.getByTestId('decision-memo')).toContainText('Early purchase is excluded:');
});
