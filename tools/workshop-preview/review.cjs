const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const { chromium } = require('playwright');

const root = 'http://127.0.0.1:8765';
const address = `${root}/temp/workshop/`;
const output = 'workshop-evidence';
const targets = ['quayside', 'door', 'workbench'];
const options = { args: ['--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader'] };

async function open(page) {
  const response = await page.goto(address);
  assert.ok(response.ok());
  await page.locator('#scene-frame[data-mode="live"]').waitFor({ timeout: 20000 });
  await page.evaluate(() => document.fonts.ready.then(() => true));
}

async function viewpoint(page, view, options = {}) {
  await page.locator(`[data-view-link="${view}"]`).click();
  await page.locator(`#scene-frame[data-view="${view}"]:not(.is-cut)`).waitFor();
  assert.equal(await page.locator(`[data-view-link="${view}"]`).getAttribute('aria-current'), 'true');
  if (options.motion) await page.waitForTimeout(900);
}

async function checkLayout(page) {
  const width = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
  assert.ok(width[0] <= width[1], `Horizontal overflow ${width}`);
}

async function captureStills(browser) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 990 }, reducedMotion: 'reduce' });
  await page.route('**/temp/workshop/assets/*.webp', route => route.fulfill({ path: 'assets/office-port/pier.webp' }));
  await open(page);
  await page.addStyleTag({ content: '.frame::after,.scene-link,.scene-caption { visibility: hidden !important; }' });
  await fs.mkdir(`${output}/stills`, { recursive: true });
  for (const view of targets) {
    await viewpoint(page, view);
    const still = await page.locator('#stage canvas').screenshot();
    await fs.writeFile(`${output}/stills/${view}.png`, still);
    await fs.writeFile(`temp/workshop/assets/${view}.png`, still);
  }
  await page.close();
}

async function exercise(browser, name, viewport, isMobile) {
  const page = await browser.newPage({ viewport, isMobile, hasTouch: isMobile, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => {
    if (response.status() >= 400 && !response.url().endsWith('/favicon.ico')) errors.push(`${response.status()} ${response.url()}`);
  });
  page.on('console', message => {
    if (message.type() === 'error' && !message.location().url.endsWith('/favicon.ico')) errors.push(message.text());
  });
  await page.route('**/temp/workshop/assets/*.webp', route => route.fulfill({
    path: `temp/workshop/assets/${route.request().url().split('/').pop().replace('.webp', '.png')}`,
    contentType: 'image/png',
  }));
  await open(page);
  const pictures = [];
  for (const view of targets) {
    await viewpoint(page, view, { motion: true });
    await checkLayout(page);
    pictures.push(await page.locator('#stage canvas').screenshot());
    await page.screenshot({ path: `${output}/${name}-${view}.png`, fullPage: true });
  }
  assert.ok(pictures.every((picture, index) => pictures.findIndex(p => p.equals(picture)) === index));
  const feedback = page.locator('#bench-feedback');
  for (const [id, result] of [['lamp', /lamp goes out/i], ['scope', /calibrator/i], ['drawer', /drawer runs out/i]]) {
    await page.locator(`[data-kit="${id}"]`).click();
    await page.waitForFunction(({ source }) => new RegExp(source, 'i').test(document.querySelector('#bench-feedback').textContent), { source: result.source });
  }
  assert.equal(await page.locator('iframe').count(), 0);
  const hrefs = await page.locator('a[href]').evaluateAll(links => links.map(link => link.getAttribute('href')));
  for (const href of ['/temp/', '/temp/#destinations', '/ferry/', '/motor-90l/workshop/', '/motor-90l/', '/elteknik/']) {
    assert.ok(hrefs.includes(href), `Missing ${href}`);
  }
  await page.getByRole('link', { name: 'Back to harbour' }).click();
  await page.waitForURL(`${root}/temp/`);
  const homeLinks = await page.locator('a[href]').evaluateAll(links => links.map(link => link.getAttribute('href')));
  for (const href of ['/#about', '/temp/workshop/', '/ferry/', '/johansson-world/', '/sjoskolan/']) assert.ok(homeLinks.includes(href));
  await page.locator('a[href="/temp/workshop/"]').click();
  await page.locator('#scene-frame[data-mode="live"]').waitFor();
  assert.deepEqual(errors, []);
  console.log(`PASS ${name}: three camera states, images, bench controls, no overflow, no asset errors and round-trip navigation`);
  await page.close();
}

async function fallback(browser) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  await page.addInitScript(() => {
    const get = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      return /^webgl/i.test(type) ? null : get.call(this, type, ...args);
    };
  });
  await page.route('**/temp/workshop/assets/*.webp', route => route.fulfill({
    path: `temp/workshop/assets/${route.request().url().split('/').pop().replace('.webp', '.png')}`,
    contentType: 'image/png',
  }));
  await page.goto(address);
  await page.locator('#scene-frame[data-mode="still"]').waitFor();
  for (const view of targets) {
    await viewpoint(page, view);
    await page.waitForFunction(() => document.querySelector('#scene-still').naturalWidth > 0);
    await checkLayout(page);
  }
  assert.equal(await page.locator('canvas').count(), 0);
  assert.equal(await page.locator('#bench-panel').isVisible(), false);
  console.log('PASS no WebGL: stills, viewpoint switching and navigation');
  await page.close();
}

(async () => {
  const browser = await chromium.launch(options);
  try {
    await captureStills(browser);
    await exercise(browser, 'desktop', { width: 1440, height: 990 }, false);
    await exercise(browser, 'mobile', { width: 390, height: 844 }, true);
    await fallback(browser);
    const page = await browser.newPage({ viewport: { width: 1440, height: 990 } });
    await page.goto('https://nj22az.github.io/motor-90l/workshop/');
    await page.getByRole('heading', { name: /Erik.s motor routine/i }).waitFor();
    await page.locator('body.ready canvas').waitFor({ timeout: 20000 });
    await page.getByRole('button', { name: /^Play$/ }).click();
    await page.getByRole('button', { name: /^Pause$/ }).waitFor();
    await page.screenshot({ path: `${output}/desktop-erik-motor-routine.png` });
    console.log('PASS published Erik motor routine: loads live model and plays');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
