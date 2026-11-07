// Engångsmigrering: läser simulatorernas uppgifter och protokoll ur en utcheckning av källrevisionen (argv[2])
// och skriver dem som JSON. Funktioner (mistakes, test) utvärderas eller sparas som källkod för registret.
const rot = process.argv[2];
const imp = (f) => import(`${rot}/sjoskolan/${f}`);
const ut = {};
const num = (x) => (typeof x === 'number' && isFinite(x) ? Number(x.toPrecision(6)) : x);

for (const lab of ['trefaslabbet', 'vaxelstromslabbet', 'hallkretslabbet', 'isolationslabbet']) {
  const m = await imp(`${lab}/lessons.mjs`);
  ut[lab] = m.CHALLENGES.map((c) => ({
    ...c,
    mistakes: (typeof c.mistakes === 'function' ? c.mistakes() : c.mistakes || []).map((x) => ({ v: num(x.v), msg: x.msg })),
    expected: num(m.expected(c)),
  }));
}
const g = await imp('vaxelstromslabbet/guided-lessons.mjs');
ut.guidad = g.GUIDE_TASKS.map((t) => ({ ...t, values: Object.fromEntries(t.fields.map(([k]) => [k, num(g.guideValues(t)[k])])) }));
ut.guidad_version = g.GUIDE_VERSION;
const mm = await imp('multimetersimulator/lessons.mjs');
ut.multimeter = mm.LESSONS.map((l) => ({ ...l, steps: l.steps.map((s) => ({ ...s, test: s.test ? s.test.toString() : undefined })) }));
const P = [['multimetersimulator/stationA-protokoll.mjs', 'STATION_A_PROTOKOLL'], ['vaxelstromslabbet/stationB-protokoll.mjs', 'STATION_B_AC_PROTOKOLL'],
  ['trefaslabbet/stationB-protokoll.mjs', 'STATION_B_3F_PROTOKOLL'], ['hallkretslabbet/stationC-protokoll.mjs', 'STATION_C_PROTOKOLL'], ['isolationslabbet/protokoll.mjs', 'ISO_PROTOKOLL']];
ut.protokoll = {};
for (const [f, k] of P) {
  const mod = await imp(f);
  ut.protokoll[k] = { fil: f, data: JSON.parse(JSON.stringify(mod[k])), ovrigt: Object.fromEntries(Object.entries(mod).filter(([n]) => n !== k).map(([n, v]) => [n, JSON.parse(JSON.stringify(v))])) };
}
const lek = await imp('vecka-40/aktuell/lektioner.mjs');
ut.lektioner = JSON.parse(JSON.stringify(lek.LESSONS));
console.log(JSON.stringify(ut));
