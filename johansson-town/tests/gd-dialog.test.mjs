import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createDialogEngine, defaultCondition, substitute, typewriterPlan} from '../src/dialogue/gd-dialog.js';
import {createTownDialog, speakerStartId, flagsFromTown} from '../src/dialogue/activity-bridge.js';
import graph from '../src/dialogue/town-dialogue.js';

test('substitutes player name and plans typewriter pauses', () => {
  assert.equal(substitute('Hello, &.', {playerName: 'Johansson'}), 'Hello, Johansson.');
  const plan = typewriterPlan('s|low');
  assert.equal(plan.final, 'slow');
  assert.equal(plan.steps.filter((s) => s.kind === 'pause').length, 1);
});

test('gd_dialog JSON branches, conditions and actions', () => {
  const engine = createDialogEngine({
    db: {
      start: {
        text: ['Pick a path.'],
        choices: [
          {text: 'Agree', next: 'yes', action: ['flag agreed']},
          {text: 'Secret', next: 'secret', show_only_if: 'flag agreed'},
        ],
      },
      yes: {text: ['Good.'], next: 'start', action: ['data set talked true']},
      secret: {text: ['Only after agree.']},
      gate: {
        text: ['Conditional next.'],
        next: [{id: 'secret', if: 'flag agreed'}, 'yes'],
      },
    },
  });
  let frame = engine.start('start');
  assert.equal(frame.choices.length, 1);
  frame = engine.choose(frame, 0);
  assert.equal(frame.id, 'yes');
  assert.equal(engine.flags.agreed, true);
  frame = engine.advance(frame);
  assert.equal(frame.id, 'start');
  assert.equal(frame.choices.length, 2);
  const gated = engine.start('gate');
  assert.equal(engine.resolveNext(gated.next), 'secret');
});

test('default town conditions understand yen, time and inventory', () => {
  assert.equal(defaultCondition('shops open', {}, {hour: 10}), true);
  assert.equal(defaultCondition('after hours', {}, {hour: 21}), true);
  assert.equal(defaultCondition('yen >= 100', {}, {yen: 80}), false);
  assert.equal(defaultCondition('has printed model', {}, {inventory: ['Form print']}), false);
  assert.equal(defaultCondition('has Form print', {}, {inventory: ['Form print']}), true);
});

test('town graph starts Thuan and Kenji and hides print talk without inventory', () => {
  assert.equal(speakerStartId('Thuan'), 'thuan_start');
  assert.ok(graph.thuan_menu);
  const engine = createTownDialog({state: {yen: 1200, inventory: [], notes: []}, getMinutes: () => 16 * 60 + 42});
  const start = engine.start('thuan_start');
  assert.match(start.display[0], /トゥアン/);
  const menu = engine.advance(start);
  assert.ok(menu.choices.every((c) => c.next !== 'thuan_print'));
  assert.equal(speakerStartId('Thuan', {notes: ['Met Thuan']}), 'thuan_return');
  assert.equal(engine.start('thuan_return').id, 'thuan_return');
});

test('printed inventory unlocks Thuan shop choice', () => {
  const flags = flagsFromTown({inventory: ['Harbour print'], notes: ['Met Thuan']}, 11 * 60);
  assert.equal(flags['printed model'], true);
  const engine = createDialogEngine({db: graph, flags, vars: {inventory: flags.inventory, hour: 11, yen: 200}});
  const menu = engine.start('thuan_menu');
  assert.ok(menu.choices.some((c) => c.next === 'thuan_print'));
});

test('graph file stays valid JSON with required keys', () => {
  const raw = JSON.parse(readFileSync(new URL('../src/dialogue/town-dialogue.json', import.meta.url)));
  assert.equal(raw.thuan_start.name, graph.thuan_start.name);
  for (const [id, node] of Object.entries(raw)) {
    if (id.startsWith('_')) continue;
    assert.ok(node.text, id);
  }
});
