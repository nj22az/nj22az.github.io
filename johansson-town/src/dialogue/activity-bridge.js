import {createDialogEngine} from './gd-dialog.js';
import graph from './town-dialogue.js';

const START = {
  Thuan: 'thuan_start',
  Kenji: 'kenji_start',
};

export function speakerStartId(name, state) {
  if (name === 'Thuan' && flagsFromTown(state).met_thuan) return 'thuan_return';
  return START[name] || null;
}

export function flagsFromTown(state = {}, minutes = 1002) {
  const hour = Math.floor((Number(minutes) || 0) / 60) % 24;
  const inventory = Array.isArray(state.inventory) ? state.inventory : [];
  return {
    talked: true,
    met_thuan: Array.isArray(state.notes) && state.notes.some((n) => String(n).includes('Thuan')),
    kenji_escort: state.kenjiEscort && state.kenjiEscort !== 'done',
    yen: state.yen,
    hour,
    inventory,
    'printed model': inventory.some((item) => /print|form|stepwise|model/i.test(String(item))),
  };
}

export function createTownDialog({
  state = {},
  getMinutes = () => 1002,
  note = () => {},
  say = () => {},
  onEscort = () => {},
} = {}) {
  const vars = {
    playerName: 'visitor',
    yen: state.yen,
    inventory: state.inventory,
    notes: state.notes,
    hour: Math.floor(getMinutes() / 60) % 24,
  };

  const engine = createDialogEngine({
    db: graph,
    flags: flagsFromTown(state, getMinutes()),
    vars,
    execute(act, flags, variables) {
      const text = String(act);
      if (text.startsWith('note ')) note(text.slice(5));
      if (text.startsWith('escort ')) onEscort();
      if (text.startsWith('say ')) say(text.slice(4));
      if (text.startsWith('flag ')) flags[text.slice(5).trim()] = true;
      if (text.startsWith('yen add ') && state) {
        state.yen = Number(state.yen || 0) + Number(text.slice(8));
        variables.yen = state.yen;
      }
    },
  });

  return engine;
}

export function renderFrame(show, close, engine, frame) {
  if (!frame || frame.missing) { close(); return; }
  const title = frame.name ? `${frame.name} · Harbour talk` : 'Talk';
  const text = frame.display.join('\n');
  const buttons = frame.choices.length
    ? frame.choices.map((choice, index) => [choice.text, () => {
      const next = engine.choose(frame, index);
      if (!next) close();
      else renderFrame(show, close, engine, next);
    }])
    : [['Continue', () => {
      const next = engine.advance(frame);
      if (!next) close();
      else renderFrame(show, close, engine, next);
    }]];
  show(title, text, buttons);
}

export function playTownDialog(name, api) {
  const id = speakerStartId(name, api.state);
  if (!id || !api?.show || !api?.close) return false;
  const engine = createTownDialog(api);
  renderFrame(api.show, api.close, engine, engine.start(id));
  return true;
}
