// Film: Hållkretsen i fyra lägen, plus strömavbrott (v41_03 och v43_03)
import { COL, BOARD as B, stage, titleCard, text, line, roundRect, prog, compile } from '../engine.mjs';

const heading = (ctx, s) => text(ctx, s, B.x + 34, B.y + 46, { size: 32, weight: 700 });
const Y = B.y + 250, YU = B.y + 160, YD = B.y + 340; // huvudledning, START-gren, hållgren
const X = { L: 110, s0: 170, s1: 260, n1: 330, c0: 400, c1: 490, n2: 560, k0: 610, k1: 700, N: 800 };

/** Ledning; strömförande ledningar ritas orange med rörligt streckmönster i strömmens riktning. */
function wire(ctx, pts, live, t) {
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.strokeStyle = live ? COL.orange : COL.ink; ctx.lineWidth = live ? 7 : 4; ctx.stroke();
  if (live) { ctx.setLineDash([6, 18]); ctx.lineDashOffset = -t * 60; ctx.strokeStyle = '#ffe2c4'; ctx.lineWidth = 3; ctx.stroke(); }
  ctx.restore();
}
/** Kontakt mellan xa och xb. push: tryckknapp med manöverdon ovanför; pressed flyttar knappen. */
function contact(ctx, xa, xb, y, closed, live, t, { label, push = false, pressed = false, nc = false } = {}) {
  wire(ctx, [[xa, y], [xa + 18, y]], live, t); wire(ctx, [[xb - 18, y], [xb, y]], live, t);
  const bx = closed ? [xb - 18, y] : [xb - 26, y - 34];
  line(ctx, xa + 18, y, bx[0], bx[1], live ? COL.orange : COL.ink, live ? 7 : 5);
  if (nc) line(ctx, xb - 18, y, xb - 18, y - (closed ? 10 : 18), COL.ink, 4);
  if (push) {
    const mx = (xa + xb) / 2, top = y - 78 + (pressed ? 18 : 0);
    line(ctx, mx, top, mx, closed ? y - 8 : y - 22, COL.muted, 3, [6, 5]);
    line(ctx, mx - 22, top, mx + 22, top, COL.ink, 6); line(ctx, mx - 22, top, mx - 22, top + 12, COL.ink, 6);
  }
  text(ctx, label, (xa + xb) / 2, push ? y - 104 : y + 36, { size: 26, weight: 700, align: 'center' });
}
function motor(ctx, x, y, on, t) {
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, 34, 0, 2 * Math.PI); ctx.fillStyle = '#fff'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = COL.ink; ctx.stroke(); ctx.restore();
  const a = on ? t * 9 : 0.4;
  for (let k = 0; k < 3; k++) { const b = a + k * 2 * Math.PI / 3; line(ctx, x, y, x + 24 * Math.cos(b), y + 24 * Math.sin(b), on ? COL.green : COL.muted, 5); }
}
/** Hela kretsen i ett givet läge. */
function circuit(ctx, t, { supply = true, stop = false, start = false, k1 = false }) {
  const stopClosed = !stop, flow = supply && stopClosed && (start || k1);
  text(ctx, 'L', X.L - 40, Y, { size: 30, weight: 700, color: supply ? COL.ink : COL.muted });
  text(ctx, 'N', X.N + 18, Y, { size: 30, weight: 700 });
  wire(ctx, [[X.L, Y], [X.s0, Y]], flow, t);
  contact(ctx, X.s0, X.s1, Y, stopClosed, flow, t, { label: 'STOPP', push: true, pressed: stop, nc: true });
  wire(ctx, [[X.s1, Y], [X.n1, Y]], flow, t);
  wire(ctx, [[X.n1, Y], [X.n1, YU], [X.c0, YU]], flow && start, t); contact(ctx, X.c0, X.c1, YU, start, flow && start, t, { label: 'START', push: true, pressed: start });
  wire(ctx, [[X.c1, YU], [X.n2, YU], [X.n2, Y]], flow && start, t);
  wire(ctx, [[X.n1, Y], [X.n1, YD], [X.c0, YD]], flow && k1, t); contact(ctx, X.c0, X.c1, YD, k1, flow && k1, t, { label: 'K1 hållkontakt' });
  wire(ctx, [[X.c1, YD], [X.n2, YD], [X.n2, Y]], flow && k1, t);
  wire(ctx, [[X.n2, Y], [X.k0, Y]], flow, t);
  roundRect(ctx, X.k0, Y - 30, X.k1 - X.k0, 60, 4, k1 ? '#fde9d6' : '#fff', flow ? COL.orange : COL.ink, 5);
  text(ctx, 'K1', (X.k0 + X.k1) / 2, Y, { size: 28, weight: 700, align: 'center' });
  text(ctx, 'spole', (X.k0 + X.k1) / 2, Y + 52, { size: 22, weight: 400, color: COL.muted, align: 'center' });
  wire(ctx, [[X.k1, Y], [X.N, Y]], flow, t);
  // statusrad
  const sy = B.y + 450;
  text(ctx, `Styrspänning: ${supply ? 'på' : 'av'}`, B.x + 50, sy, { size: 28, color: supply ? COL.ink : COL.red });
  text(ctx, `K1: ${k1 ? 'dragen' : 'släppt'}`, B.x + 360, sy, { size: 28, weight: 700, color: k1 ? COL.green : COL.ink });
  text(ctx, `Motor: ${k1 ? 'går' : 'står'}`, B.x + 560, sy, { size: 28, color: k1 ? COL.green : COL.ink });
  motor(ctx, B.x + 800, sy - 6, k1, t);
}

export default compile({
  id: 'hallkretsen', title: 'Hållkretsen', sub: 'START, STOPP och hållkontakt i fyra lägen', week: 'Vecka 41 och 43', deck: 'v41_03 och v43_03',
  scenes: [
    {
      dur: 6, cast: (t) => ({ wave: t < 3 }),
      draw(ctx, t) { titleCard(ctx, t, 'Hållkretsen', 'START, STOPP och hållkontakt', 'Vecka 41 och 43'); },
      say: [[0.5, 5.8, 'Sigge', 'Hur kan en motor fortsätta gå när man släpper START-knappen? Vi följer strömmen.']],
    },
    {
      dur: 11,
      draw(ctx, t) { stage(ctx, t); heading(ctx, '1. Vila'); circuit(ctx, t, {}); },
      say: [[0.3, 5.8, 'Sigge', 'STOPP är en brytande kontakt och är sluten. START är slutande och är öppen.'],
        [6.0, 10.8, 'Måns', 'Så ingen ström når spolen. K1 är släppt och motorn står.']],
    },
    {
      dur: 12,
      draw(ctx, t) { stage(ctx, t); heading(ctx, '2. START trycks'); const st = t > 1.2; circuit(ctx, t, { start: st, k1: t > 1.6 }); },
      say: [[0.3, 5.8, 'Sigge', 'Jag trycker START. Ström går genom START till spolen, och K1 drar.'],
        [6.0, 11.8, 'Sigge', 'När K1 drar sluter också hållkontakten. Den sitter parallellt med START.']],
    },
    {
      dur: 12,
      draw(ctx, t) { stage(ctx, t); heading(ctx, '3. START släpps'); circuit(ctx, t, { start: t < 3.2, k1: true }); },
      say: [[0.3, 3.0, 'Måns', 'Nu släpper du START. Stannar motorn?'],
        [3.2, 11.8, 'Sigge', 'Nej! Strömmen tar vägen genom hållkontakten i stället. K1 håller sig själv.']],
    },
    {
      dur: 13,
      draw(ctx, t) { stage(ctx, t); heading(ctx, '4. STOPP trycks'); const stop = t > 1 && t < 6.5; circuit(ctx, t, { stop, k1: t < 1.3 }); },
      say: [[0.3, 6.2, 'Sigge', 'STOPP bryter kretsen. Spolen blir strömlös, K1 släpper och hållkontakten öppnar.'],
        [6.5, 12.8, 'Måns', 'Och när STOPP släpps startar motorn inte igen. Den väntar på ett nytt tryck på START.']],
    },
    {
      dur: 14,
      draw(ctx, t) { stage(ctx, t); heading(ctx, 'Strömavbrott'); const supply = t < 2.5 || t > 7; circuit(ctx, t, { supply, k1: t < 2.7 }); },
      say: [[0.3, 2.4, 'Måns', 'Och om fartyget får strömavbrott?'],
        [2.6, 7.0, 'Sigge', 'Då blir spolen strömlös. K1 släpper och hållkontakten öppnar.'],
        [7.2, 13.8, 'Sigge', 'När spänningen kommer tillbaka står motorn kvar. Den startar inte av sig själv. Det är ett skydd.']],
    },
    {
      dur: 12, cast: (t) => ({ wave: t > 8.5 }),
      draw(ctx, t) {
        stage(ctx, t); heading(ctx, 'Kom ihåg');
        const items = [['START sluter, STOPP bryter', COL.ink], ['Hållkontakten sitter parallellt med START', COL.ink], ['STOPP ligger i serie och bryter allt', COL.ink], ['Efter avbrott krävs ett nytt START', COL.orange]];
        items.forEach(([s, c], i) => text(ctx, `${i + 1}.  ${s}`, B.x + 50, B.y + 140 + i * 80, { size: 34, weight: i === 3 ? 700 : 600, color: c, alpha: prog(t, 0.4 + i * 1.2, 1.1 + i * 1.2) }));
      },
      say: [[0.3, 4.6, 'Sigge', 'Vid felsökning: mät var i kretsen spänningen försvinner, steg för steg.'],
        [4.8, 8.4, 'Måns', 'Men bara om arbetet är riskbedömt och tillåtet!'],
        [8.6, 11.8, 'Sigge', 'Precis. Vi ses!']],
    },
  ],
});
