// JavaScript port of the gd_dialog JSON runtime (Qin Tina / MIT).
// Godot scenes and GDScript are not used. The JSON shape is the same:
// nodes with text[], choices[], next, action, show_only_if, name, icon, voice.

const PAUSE = '|';
const NAME_TOKEN = '&';

export function substitute(text, vars = {}) {
  const player = vars.playerName ?? vars['&'] ?? 'visitor';
  return String(text ?? '').replaceAll(NAME_TOKEN, player);
}

export function stripPauses(text) {
  return String(text ?? '').replaceAll(PAUSE, '');
}

export function typewriterPlan(text, vars = {}) {
  const raw = substitute(text, vars);
  const steps = [];
  let visible = '';
  for (const ch of raw) {
    if (ch === PAUSE) steps.push({ kind: 'pause', visible });
    else {
      visible += ch;
      steps.push({ kind: 'char', visible, ch });
    }
  }
  return { raw, final: visible, steps };
}

function asList(value) {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

export function createDialogEngine({
  db = {},
  flags = {},
  vars = {},
  isConditionMet,
  execute,
} = {}) {
  const data = { ...flags };
  const variables = { ...vars };
  const custom = new Map();

  function node(id) {
    return custom.get(id) ?? db[id] ?? null;
  }

  function condition(expr) {
    if (!expr) return true;
    if (typeof isConditionMet === 'function') return !!isConditionMet(expr, data, variables);
    return defaultCondition(expr, data, variables);
  }

  function runActions(list) {
    const fired = [];
    for (const act of asList(list)) {
      if (typeof execute === 'function') execute(act, data, variables);
      else defaultExecute(act, data, variables);
      fired.push(act);
    }
    return fired;
  }

  function resolveNext(next) {
    if (next == null || next === '') return null;
    if (typeof next === 'string') return next;
    if (Array.isArray(next)) {
      for (const entry of next) {
        if (typeof entry === 'string') return entry;
        if (entry && condition(entry.if)) return entry.id;
      }
      return null;
    }
    if (typeof next === 'object' && next.id) return condition(next.if) ? next.id : null;
    return null;
  }

  function visibleChoices(entry) {
    return asList(entry?.choices).filter((choice) => condition(choice.show_only_if));
  }

  function present(id) {
    const entry = node(id);
    if (!entry) return { id, missing: true, text: [], choices: [], actions: [] };
    const lines = asList(entry.text).map((line) => substitute(line, variables));
    const actions = runActions(entry.action);
    return {
      id,
      missing: false,
      name: entry.name ?? '',
      icon: entry.icon ?? '',
      voice: entry.voice ?? '',
      text: lines,
      display: lines.map(stripPauses),
      plans: lines.map((line) => typewriterPlan(line, {})),
      choices: visibleChoices(entry).map((choice, index) => ({
        index,
        text: substitute(choice.text ?? '', variables),
        next: choice.next ?? null,
        action: asList(choice.action),
        show_only_if: choice.show_only_if ?? null,
      })),
      next: entry.next ?? null,
      actions,
    };
  }

  return {
    get flags() { return data; },
    get vars() { return variables; },
    setFlag(key, value = true) { data[key] = value; },
    setVar(key, value) { variables[key] = value; },
    addNode(id, entry) { custom.set(id, entry); },
    has(id) { return !!node(id); },
    start(id) { return present(id); },
    advance(frame) {
      if (!frame || frame.missing) return null;
      if (frame.choices.length) return frame;
      const nextId = resolveNext(frame.next);
      return nextId ? present(nextId) : null;
    },
    choose(frame, index) {
      const choice = frame?.choices?.[index];
      if (!choice) return frame;
      runActions(choice.action);
      if (!choice.next) return null;
      return present(choice.next);
    },
    resolveNext,
    condition,
  };
}

export function defaultCondition(expr, flags = {}, vars = {}) {
  const raw = String(expr).trim();
  if (!raw) return true;
  if (raw.startsWith('not ')) return !defaultCondition(raw.slice(4), flags, vars);
  if (raw.includes(' && ')) return raw.split('&&').every((part) => defaultCondition(part, flags, vars));
  if (raw.includes(' and ')) return raw.split(/\band\b/).every((part) => defaultCondition(part, flags, vars));

  const yen = Number(vars.yen ?? flags.yen ?? 0);
  const hour = Number(vars.hour ?? flags.hour ?? 12);
  const inventory = asList(vars.inventory ?? flags.inventory);

  if (raw === 'already talked' || raw === 'talked') return !!flags.talked;
  if (raw === 'shops open') return hour >= 9 && hour < 20;
  if (raw === 'evening') return hour >= 18;
  if (raw === 'after hours') return hour >= 20 || hour < 9;
  if (/^has (\d+) (.+)$/.test(raw)) {
    const [, count, item] = raw.match(/^has (\d+) (.+)$/);
    return inventory.filter((entry) => String(entry).toLowerCase() === item.toLowerCase()).length >= Number(count);
  }
  if (raw.startsWith('has ')) return inventory.map(String).some((item) => item.toLowerCase() === raw.slice(4).toLowerCase());
  if (raw.startsWith('yen >=') ) return yen >= Number(raw.slice(6).trim());
  if (raw.startsWith('yen >')) return yen > Number(raw.slice(5).trim());
  if (raw.startsWith('flag ')) return !!flags[raw.slice(5).trim()];
  if (Object.prototype.hasOwnProperty.call(flags, raw)) return !!flags[raw];
  if (Object.prototype.hasOwnProperty.call(vars, raw)) return !!vars[raw];
  return false;
}

export function defaultExecute(act, flags = {}, vars = {}) {
  const parts = String(act).trim().split(/\s+/);
  const verb = parts[0];
  if (verb === 'data' && parts[1] === 'set') flags[parts[2]] = parts.slice(3).join(' ') || true;
  if (verb === 'flag') flags[parts[1]] = parts[2] === 'false' ? false : true;
  if (verb === 'yen' && parts[1] === 'add') vars.yen = Number(vars.yen ?? 0) + Number(parts[2] || 0);
  if (verb === 'yen' && parts[1] === 'spend') vars.yen = Math.max(0, Number(vars.yen ?? 0) - Number(parts[2] || 0));
  if (verb === 'inventory' && parts[1] === 'add') {
    vars.inventory = asList(vars.inventory);
    vars.inventory.push(parts.slice(2).join(' '));
  }
  if (verb === 'note') {
    vars.notes = asList(vars.notes);
    const text = parts.slice(1).join(' ');
    if (text && !vars.notes.includes(text)) vars.notes.push(text);
  }
}
