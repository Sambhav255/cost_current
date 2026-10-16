import { expect, test, type Page } from '@playwright/test';

async function openIntelligence(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Explore supply-chain risks' }).click();
  await expect(
    page.getByRole('heading', { name: 'Supply-chain risks worth watching' }),
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

test('intelligence links tariff exposure to Northstar decisions', async ({ page }) => {
  await openIntelligence(page);
  await page.getByTestId('event-card-demo-tariff-china-home').click();
  const northstarRow = page.getByTestId('exposure-row-northstar');
  await expect(northstarRow).toContainText('$15,000');
  await expect(northstarRow.getByTestId('exposure-status-northstar')).toContainText(
    'Reviewed demo match',
  );
  await page.getByTestId('explore-options-northstar').click();
  await expect(page.getByTestId('event-context-banner')).toBeVisible();
  await expect(page.getByRole('button', { name: 'What if?', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.getByTestId('decision-wait')).toContainText('$123,600');
  await expect(page.getByTestId('decision-early')).toContainText('$121,100');
});

test('Suez corridor event exposes Nordic Home only', async ({ page }) => {
  await openIntelligence(page);
  await page.getByTestId('event-card-demo-suez-red-sea').click();
  await expect(page.getByTestId('exposure-status-northstar')).toContainText('Not applicable');
  await expect(page.getByTestId('exposure-status-nordic-home')).toContainText(
    'Reviewed demo match',
  );
  await expect(page.getByTestId('event-detail')).toContainText('Not available');
  const switchTo2D = page.getByRole('button', { name: 'Switch to 2D map' });
  if (await switchTo2D.isVisible()) await switchTo2D.click();
  await expect(page.getByTestId('event-zone-suez-red-sea')).toBeVisible();
});

test('welcome routes to intelligence and My Exposure opens analysis', async ({ page }) => {
  await openIntelligence(page);
  await navigate(page, 'My Exposure');
  await expect(page.getByRole('heading', { name: 'My exposure' })).toBeVisible();
  await page.getByRole('button', { name: 'Analyze this shipment' }).click();
  await expect(page.getByRole('button', { name: 'Forecast', exact: true })).toBeVisible();
});
