import { test, expect } from '@playwright/test';

// The app boots into the config screen (idle state machine). `baseURL` already
// points at `/pomo/`, so `'./'` resolves to the app root.
test.beforeEach(async ({ page }) => {
  await page.goto('./');
});

test('shows the config screen on load', async ({ page }) => {
  await expect(page.getByText('Completed work sessions: 0')).toBeVisible();
  await expect(page.getByLabel('Work Session Duration (minutes):')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Go!' })).toBeVisible();
  await expect(page.getByText(/^v\d+\.\d+\.\d+/)).toBeVisible();
});

test('starting a session shows the countdown, cancelling returns to config', async ({ page }) => {
  const duration = page.getByLabel('Work Session Duration (minutes):');
  await duration.fill('1');
  await page.getByRole('button', { name: 'Go!' }).click();

  // formatTime renders `M:SS`, so a 1-minute session starts at 1:00 and
  // immediately ticks down into the 0:5x range.
  const countdown = page.locator('.timer-display-countdown');
  await expect(countdown).toBeVisible();
  await expect(countdown).toContainText(/1:00|0:5\d/);

  // Config controls are gone while a timer exists.
  await expect(page.getByRole('button', { name: 'Go!' })).toBeHidden();

  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.getByRole('button', { name: 'Go!' })).toBeVisible();
  await expect(page.locator('.timer-display')).toBeHidden();
});

test('pause and resume toggle the button label', async ({ page }) => {
  await page.getByLabel('Work Session Duration (minutes):').fill('5');
  await page.getByRole('button', { name: 'Go!' }).click();

  const pause = page.getByRole('button', { name: 'Pause' });
  await expect(pause).toBeVisible();
  await pause.click();

  const resume = page.getByRole('button', { name: 'Resume' });
  await expect(resume).toBeVisible();
  // While paused the projected end time is masked.
  await expect(page.locator('.timer-display-end-time')).toHaveText('--:--:-- --');

  await resume.click();
  await expect(page.getByRole('button', { name: 'Pause' })).toBeVisible();
});

test('theme toggle flips the body theme attribute', async ({ page }) => {
  const body = page.locator('body');
  const initialTheme = await body.getAttribute('data-theme');

  await page.locator('.theme-toggle-btn').click();

  await expect(body).not.toHaveAttribute('data-theme', initialTheme ?? '');
});
