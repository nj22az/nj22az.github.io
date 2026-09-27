import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const route = '/sjoskolan/multimetersimulator/?ovning=loading';
const interactive = '#nodes, .probe-selects, .circuit-controls, .meter, .probe';
const explanation = 'Mätaren ligger parallellt med R2 och sänker spänningen mellan M och G.';

async function activate(page, selector, touch) {
  const control = page.locator(selector);
  if (touch) await control.tap();
  else await control.click();
}
async function locked(page, value) {
  expect(await page.locator(interactive).evaluateAll(els => els.every(el => el.inert))).toBe(value);
  if (!value) expect(await page.locator(interactive).evaluateAll(els => els.some(el => el.inert))).toBe(false);
  expect(await page.locator('#diagram').evaluate(el => !!el.closest('[inert]'))).toBe(false);
  if (value) {
    await page.locator('#dial-knob').evaluate(el => el.focus());
    expect(await page.evaluate(() => document.activeElement.id)).not.toBe('dial-knob');
  }
}
async function layout(page) {
  const result = await page.evaluate(() => {
    const width = document.documentElement.clientWidth;
    const clipped = [...document.querySelectorAll('.sim-app button, .sim-app select, #number-answer, #lesson-comment')]
      .filter(el => el.getClientRects().length && !el.closest('[inert]'))
      .filter(el => { const r = el.getBoundingClientRect(); return r.left < -1 || r.right > width + 1; })
      .map(el => el.id || el.textContent.trim());
    return { width, scrollWidth: document.documentElement.scrollWidth, clipped };
  });
  expect.soft(result.scrollWidth, 'No page-level horizontal scrolling').toBeLessThanOrEqual(result.width + 1);
  expect.soft(result.clipped, 'Visible controls fit in the viewport').toEqual([]);
}
async function picture(page, info, name, selector = '.sim-layout') {
  await page.locator(selector).screenshot({ path: info.outputPath(`${name}.png`) });
}
async function toMeasurement(page, touch) {
  await page.locator('#number-answer').fill('5,00');
  await activate(page, '#check', touch);
  await activate(page, '#next', touch);
  await activate(page, '[data-answer-choice="0"]', touch);
  await activate(page, '#check', touch);
  await activate(page, '#next', touch);
  await expect(page.locator('#task-heading')).toContainText('Steg 3 av 7');
}

test('seven-step lesson, polarity, protocol, CSV and responsive controls', async ({ page, isMobile }, info) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(route);
  await expect(page.locator('#task-heading')).toContainText('Steg 1 av 7');
  await locked(page, true);
  await layout(page);
  if (page.viewportSize().width <= 620) await expect.soft(page.locator('.meter')).toBeHidden();
  await picture(page, info, '01-prediction');
  await activate(page, '#check', isMobile);
  await expect(page.locator('#next')).toBeHidden();
  await page.locator('#number-answer').fill('10');
  await activate(page, '#check', isMobile);
  await expect(page.locator('#next')).toBeHidden();
  await toMeasurement(page, isMobile);
  await locked(page, false);
  await expect(page.locator('#input')).toBeDisabled();
  await activate(page, '#check-reading', isMobile);
  await expect(page.locator('#feedback-text')).toContainText('Välj V');
  await activate(page, '[data-mode="dc"]', isMobile);
  // Tap-to-place uses real browser input, including reversed polarity.
  await activate(page, '#probe-black', isMobile);
  await activate(page, '[data-node="M"]', isMobile);
  await activate(page, '#probe-red', isMobile);
  await activate(page, '[data-node="G"]', isMobile);
  await activate(page, '#power', isMobile);
  await expect(page.locator('#reading')).toHaveText('-4,76');
  await expect(page.locator('#wiring-checklist .complete')).toHaveCount(5);
  await expect(page.locator('.meter-branch')).toBeVisible();
  const labels = await page.locator('#diagram text').evaluateAll(els => els.map(el => ({
    text: el.textContent, font: parseFloat(getComputedStyle(el).fontSize) * el.getScreenCTM().a,
  })));
  expect.soft(labels.filter(label => label.font < 12), 'Circuit labels remain readable at display scale').toEqual([]);
  await layout(page);
  await picture(page, info, '03-measurement-10M');
  await activate(page, '#check-reading', isMobile);
  await expect(page.locator('#feedback-text')).toContainText('Minustecknet');
  await locked(page, true);
  await activate(page, '#next', isMobile);
  await locked(page, true);
  await activate(page, '[data-answer-choice="0"]', isMobile);
  await activate(page, '#check', isMobile);
  await activate(page, '#next', isMobile);
  await locked(page, false);
  await expect(page.locator('#input')).toBeEnabled();
  await activate(page, '#check-reading', isMobile);
  await expect(page.locator('#feedback-text')).toContainText('Välj 1 MΩ');
  await page.locator('#input').selectOption('1000000');
  await expect(page.locator('#reading')).toHaveText('-3,33');
  await layout(page);
  await picture(page, info, '05-measurement-1M');
  await activate(page, '#check-reading', isMobile);
  await activate(page, '#next', isMobile);
  await locked(page, true);
  await expect(page.locator('#loading-results')).toContainText('3,33 V');
  await page.locator('#number-answer').fill('3,33');
  await activate(page, '#check', isMobile);
  await expect(page.locator('#next')).toBeHidden();
  await page.locator('#number-answer').fill('6.67');
  await activate(page, '#check', isMobile);
  await activate(page, '#next', isMobile);
  await activate(page, '[data-answer-choice="0"]', isMobile);
  await activate(page, '#check', isMobile);
  await expect(page.locator('#next')).toBeHidden();
  await page.locator('#lesson-comment').fill(explanation);
  await activate(page, '#check', isMobile);
  await expect(page.locator('#next')).toBeVisible();
  await expect(page.locator('#progress')).toHaveText('1 av 9 klara');
  await layout(page);
  await picture(page, info, '07-explanation', '.lesson-panel');
  await activate(page, '#protocol-view summary', isMobile);
  await expect(page.locator('#protocol-rows tr')).toHaveCount(7);
  await expect(page.locator('#protocol-rows')).toContainText(explanation);
  await expect(page.locator('#protocol-rows')).toContainText('-4,76 V');
  await expect(page.locator('#protocol-rows')).toContainText('-3,33 V');
  await layout(page);
  await picture(page, info, '08-protocol', '#protocol-view');
  const downloadPromise = page.waitForEvent('download');
  await activate(page, '#download-log', isMobile);
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^Multimeter_matprotokoll_.*\.csv$/);
  const csv = await readFile(await download.path(), 'utf8');
  expect(csv).toContain(explanation);
  expect(csv).toContain('10000000');
  expect(csv).toContain('1000000');
  expect(csv).toContain('-4,76');
  expect(csv).toContain('-3,33');
  await page.reload();
  await expect(page.locator('#progress')).toHaveText('1 av 9 klara');
  await expect(page.locator('#protocol-rows tr')).toHaveCount(7);
  expect(errors).toEqual([]);
});

test('guided/free transitions clear locks, answers, diagram and measurement actions', async ({ page, isMobile }) => {
  await page.goto(route);
  for (const point of ['prediction', 'measurement', 'saved-measurement']) {
    if (point !== 'prediction') await toMeasurement(page, isMobile);
    if (point === 'saved-measurement') {
      await activate(page, '[data-mode="dc"]', isMobile);
      await page.locator('#red-node').selectOption('M');
      await page.locator('#black-node').selectOption('G');
      await activate(page, '#power', isMobile);
      await activate(page, '#check', isMobile);
      await locked(page, true);
    }
    await activate(page, '#free-mode', isMobile);
    await locked(page, false);
    for (const selector of ['#lesson-answer', '#loading-comparison', '#loading-observation', '#wiring-guide', '#measurement-actions', '#check', '#next']) {
      await expect(page.locator(selector)).toBeHidden();
    }
    await expect(page.locator('.meter')).toBeVisible();
    await expect(page.locator('#workbench')).not.toHaveClass(/prediction-mode/);
    await expect(page.locator('.meter-branch')).toHaveCount(0);
    await page.locator('#free-circuit').selectOption('divider');
    await expect(page.locator('#input')).toBeEnabled();
    await activate(page, '[data-mode="dc"]', isMobile);
    await page.locator('#red-node').selectOption('M');
    await page.locator('#black-node').selectOption('G');
    await page.locator('#input').selectOption('1000000');
    await activate(page, '#power', isMobile);
    await expect(page.locator('#reading')).toHaveText('3,33');
    await layout(page);
    await activate(page, '#free-mode', isMobile);
    await expect(page.locator('#task-heading')).toContainText('Steg 1 av 7');
    await expect(page.locator('#number-answer')).toHaveValue('');
    await expect(page.locator('#reading')).toHaveText('—');
    await expect(page.locator('.meter-branch')).toHaveCount(0);
    await expect(page.locator('#loading-comparison')).toBeHidden();
    await expect(page.locator('#measurement-actions')).toBeHidden();
    await locked(page, true);
  }
});
