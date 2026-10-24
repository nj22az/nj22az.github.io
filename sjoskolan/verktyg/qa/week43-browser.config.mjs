import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const require = createRequire(new URL('../../multimetersimulator/package.json', import.meta.url));
const {defineConfig, devices} = require('@playwright/test');
export default defineConfig({
  testDir: './week43-browser', testMatch: '*.spec.mjs', timeout: 90000,
  outputDir: './week43-results', reporter: [['list'], ['html', {outputFolder: './week43-report', open: 'never'}]],
  use: {baseURL: process.env.WEEK43_BASE_URL || 'http://127.0.0.1:4173', timezoneId: 'Europe/Stockholm', trace: 'retain-on-failure', screenshot: 'only-on-failure'},
  projects: [
    {name: 'desktop-chromium', use: {...devices['Desktop Chrome'], viewport: {width: 1440, height: 1000}}},
    {name: 'phone-chromium', use: {...devices['Pixel 7']}},
    {name: 'tablet-webkit', use: {...devices['iPad Mini']}}
  ],
  webServer: process.env.WEEK43_BASE_URL ? undefined : {
    command: 'python3 -m http.server 4173 --bind 127.0.0.1',
    cwd: fileURLToPath(new URL('../../../', import.meta.url)),
    url: 'http://127.0.0.1:4173/sjoskolan/vecka-43/aktuell/', reuseExistingServer: !process.env.CI
  }
});
