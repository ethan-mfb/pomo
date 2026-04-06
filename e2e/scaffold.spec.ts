import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:4173/pomo/';

test('renders the setup view on initial load', async ({ page }) => {
  await page.goto(BASE);
  await expect(page.locator('.app')).toBeVisible();
  await expect(page.locator('.app__setup')).toBeVisible();
  await expect(page.locator('.app__running')).not.toBeVisible();
});

test('transitions to running view when start is triggered', async ({ page }) => {
  await page.goto(BASE);
  // The setup view must contain a start button
  await page.locator('[data-testid="start-btn"]').click();
  await expect(page.locator('.app__running')).toBeVisible();
  await expect(page.locator('.app__setup')).not.toBeVisible();
});

test('transitions back to setup view when cancel is triggered', async ({ page }) => {
  await page.goto(BASE);
  await page.locator('[data-testid="start-btn"]').click();
  await page.locator('[data-testid="cancel-btn"]').click();
  await expect(page.locator('.app__setup')).toBeVisible();
  await expect(page.locator('.app__running')).not.toBeVisible();
});
