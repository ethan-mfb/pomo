import { defineConfig, devices } from '@playwright/test';

// The app is served under the `/pomo/` base (see `base` in vite.config.ts),
// so the baseURL includes it and specs navigate with relative paths (`./`).
// E2E runs against the production build via `vite preview` so the tests
// exercise what actually ships (service worker, hashed assets, the `/pomo/`
// base) rather than the dev server. `npm run test:e2e` builds first.
const PORT = 4173;
const BASE_URL = `http://localhost:${PORT}/pomo/`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'html',
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: `npm run preview -- --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
