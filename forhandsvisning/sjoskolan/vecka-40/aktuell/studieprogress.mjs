// Browser-local study evidence. Legacy manually checked boxes are never promoted.
export const STUDY_KEY = 'sj-v40-studie-v1';
export const LEGACY_KEY = 'sj-ovningar:/sjoskolan/vecka-40/aktuell/Formelstod_och_ovningar.html';
const empty = () => ({version: 1, read: {}, exercises: {}, examples: {}, cursor: null});
const object = x => x && typeof x === 'object' && !Array.isArray(x);
export function normalise(raw) {
  const state = empty();
  if (!object(raw) || raw.version !== 1) return state;
  for (const k of ['read', 'exercises', 'examples']) if (object(raw[k])) state[k] = raw[k];
  if (object(raw.cursor) && typeof raw.cursor.lesson === 'string' && typeof raw.cursor.step === 'string') state.cursor = raw.cursor;
  return state;
}
export function createStore(storage) {
  let memory = empty(), persistent = true;
  const read = () => {
    if (persistent) try { memory = normalise(JSON.parse(storage.getItem(STUDY_KEY) || 'null')); } catch { persistent = false; }
    return memory;
  };
  return {
    read,
    change(fn) {
      const state = read(); fn(state); memory = state;
      if (persistent) try { storage.setItem(STUDY_KEY, JSON.stringify(state)); } catch { persistent = false; }
      return state;
    },
    get persistent() { return persistent; },
  };
}
// Lazily obtain storage: merely evaluating localStorage can throw in restricted browsers.
let singleton;
export function studyStore() {
  if (!singleton) {
    let storage;
    try { storage = globalThis.localStorage; } catch { /* use memory */ }
    singleton = createStore(storage);
  }
  return singleton;
}
export function number(value) {
  const text = String(value ?? '').trim().replace(/[\s\u00a0]/g, '').replace('−', '-').replace(',', '.');
  return /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(text) && Number.isFinite(Number(text)) ? Number(text) : NaN;
}
const word = x => String(x ?? '').normalize('NFC').trim().toLocaleLowerCase('sv').replace(/\s+/g, ' ');
export function exerciseState(state, task) {
  const record = state.exercises[task.id];
  return object(record) && record.revision === task.revision ? record : {revision: task.revision, attempts: [], values: [], text: ''};
}
export function check(task, values, text = '') {
  const fields = task.solution.svar || [];
  const filled = fields.every((f, i) => typeof f.varde === 'number' ? Number.isFinite(number(values[i])) : !!word(values[i]));
  const explanation = !task.resonemang || !!text.trim();
  if (!filled || !explanation || (!fields.length && !text.trim())) return {valid: false, correct: false, fields: []};
  const results = fields.map((f, i) => {
    if (typeof f.varde !== 'number') return word(values[i]) === word(f.varde);
    const tolerance = Math.max(f.tolerans?.abs || 0, Math.abs(f.varde) * (f.tolerans?.rel ?? 0.02), 1e-9);
    return Math.abs(number(values[i]) - f.varde) <= tolerance;
  });
  return {valid: true, correct: fields.length > 0 && results.every(Boolean), fields: results};
}
export function attempt(previous, task, values, text = '') {
  const result = check(task, values, text);
  const record = {...previous, revision: task.revision, values: [...values], text};
  if (!result.valid) return {record, result, duplicate: false};
  // Empty entries and repeated clicks on the same answer never unlock a solution.
  const signature = JSON.stringify([values.map((v, i) => typeof task.solution.svar?.[i]?.varde === 'number' ? number(v) : word(v)), word(text)]);
  const attempts = Array.isArray(previous.attempts) ? previous.attempts : [];
  const duplicate = attempts.some(x => x.signature === signature);
  record.attempts = duplicate ? attempts : [...attempts, {signature, correct: result.correct}].slice(-50);
  record.correct = result.correct;
  record.independent = !!previous.independent || (result.correct && !previous.solutionSeen);
  record.submitted = true;
  return {record, result, duplicate};
}
export const solutionAvailable = r => !!r.correct || (Array.isArray(r.attempts) && r.attempts.length >= 2);
export function status(record, task) {
  if (record.help) return 'Behöver hjälp';
  if (record.correct && record.independent) return task.resonemang ? 'Tal rätt · förklaring sparad' : 'Rätt svar';
  if (record.solutionSeen) return 'Lösning genomgången';
  if (record.submitted && !(task.solution.svar || []).length) return 'Svar sparat · läraren bedömer';
  if (record.submitted) return 'Försök sparat';
  return 'Inte påbörjad';
}
export const isCorrect = r => !!r.correct && !!r.independent && !r.help;
export const isWorked = r => !!(r.submitted || r.solutionSeen);
export function verifiedExercises(tasks, state = studyStore().read()) {
  return Object.fromEntries(Object.values(tasks).map(t => [t.anchor, isCorrect(exerciseState(state, t))]));
}
// Reading is recorded only when every visible content block has been reached.
export function observeReading(element, onRead, Observer = globalThis.IntersectionObserver, seen = new Set()) {
  const targets = [...element.querySelectorAll('[data-read]')];
  if (!targets.length || !Observer) return () => {};
  const observer = new Observer(entries => {
    for (const entry of entries) if (entry.isIntersecting && !document.hidden) seen.add(entry.target.dataset.read);
    if (targets.every(target => seen.has(target.dataset.read))) { observer.disconnect(); onRead(); }
  }, {threshold: 0.1});
  for (const target of targets) observer.observe(target);
  return () => observer.disconnect();
}
