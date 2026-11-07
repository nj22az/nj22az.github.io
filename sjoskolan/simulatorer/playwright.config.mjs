import { defineConfig } from '@playwright/test';

const sizes = [
  ['phone', { width: 390, height: 844 }, true],
  ['tablet', { width: 820, height: 1180 }, true],
  ['compact-desktop', { width: 1024, height: 768 }, false],
  ['desktop', { width: 1440, height: 1000 }, false],
];

export default defineConfig({
  testDir: './browser-tests',
  timeout: 120000,
  expect: { timeout: 15000 },
  fullyParallel: true,
  workers: process.env.CI ? 2 : undefined,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL: 'http://127.0.0.1:8000', screenshot: 'only-on-failure', trace: 'retain-on-failure' },
  webServer: {
    command: 'python3 -m http.server 8000 --bind 127.0.0.1 --directory ../..',
    url: 'http://127.0.0.1:8000/sjoskolan/simulatorer/',
    reuseExistingServer: !process.env.CI,
  },
  projects: ['chromium'].flatMap(browserName => sizes.map(([name, viewport, hasTouch]) => ({
    name: `${browserName}-${name}`,
    use: { browserName, viewport, hasTouch, isMobile: hasTouch, deviceScaleFactor: 1 },
  }))),
});
