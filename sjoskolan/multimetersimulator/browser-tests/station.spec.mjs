import { test, expect } from '@playwright/test';

test('Station A rig 6: autoranged R1 advances and saved work survives reload', async ({ page }) => {
  const key = 'sjoskolan-multimeter-v1';
  const old = { done: ['voltage', 'polarity'], records: [{ time: '2026-09-29', lesson: 'Spänning', step: 1, reading: '12,00 V' }] };
  const protocol = { name: 'Test', rows: [{ forv: '1000 Ω', uppm: '961,8 Ω' }] };
  await page.addInitScript(({ key, old, protocol }) => {
    if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(old));
    if (!localStorage.getItem('sjoskolan-protokoll-stationA')) localStorage.setItem('sjoskolan-protokoll-stationA', JSON.stringify(protocol));
  }, { key, old, protocol });
  await page.goto('/sjoskolan/multimetersimulator/?ovning=stationA&rigg=6');
  const mode = value => page.locator(`#functions [data-mode="${value}"]`).click();
  const probes = async (red, black) => {
    await page.locator('#red-node').selectOption(red);
    await page.locator('#black-node').selectOption(black);
  };
  const pass = async step => {
    await expect(page.locator('#task-heading')).toContainText(`Steg ${step} av 9`);
    await page.locator('#check').click();
    await expect(page.locator('#next')).toBeVisible();
    await page.locator('#next').click();
  };
  await mode('dc'); await probes('Ref+', 'Ref−'); await pass(1);
  await page.locator('#link').click(); await probes('A', 'B'); await pass(2);
  await mode('ohm');
  await expect(page.locator('#reading')).toHaveText('961,8');
  await pass(3);
  await probes('N', 'B'); await pass(4);
  await mode('dc'); await page.locator('#link').click(); await probes('P', 'N');
  await page.locator('#power').click(); await pass(5);
  await probes('A', 'B'); await pass(6);
  await probes('B', 'N'); await pass(7);
  await page.locator('#power').click(); await page.locator('#link').click();
  await probes('P', 'A'); await page.locator('[data-jack="ma"]').click(); await mode('current');
  await page.locator('#power').click(); await pass(8);
  await page.locator('#power').click(); await page.locator('#link').click();
  await page.locator('[data-jack="v"]').click(); await mode('dc'); await probes('Ref+', 'Ref−');
  await pass(9);
  const saved = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), key);
  expect(saved.done).toEqual(['voltage', 'polarity', 'stationA']);
  expect(saved.records[0]).toEqual(old.records[0]);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('sjoskolan-protokoll-stationA')))).toEqual(protocol);
  await page.reload();
  await expect(page.locator('#progress')).toContainText('3 av 9');
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('sjoskolan-protokoll-stationA')))).toEqual(protocol);
});
