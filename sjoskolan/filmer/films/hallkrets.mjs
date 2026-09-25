// Film: Hållkretsen i fyra lägen, plus överlast och strömavbrott (v41_03 och v43_03)
import { COL, BOARD as B, stage, titleCard, text, line, roundRect, prog, compile } from '../engine.mjs';

const heading = (ctx, s) => text(ctx, s, B.x + 34, B.y + 46, { size: 32, weight: 700 });
const Y = B.y + 250, YU = B.y + 160, YD = B.y + 340; // huvudledning, START-gren, hållgren
const X = { L: 70, f2: 90, f1a: 170, f1b: 250, s0a: 280, s0b: 360, n1: 400, c0: 450, c1: 540, n2: 600, k0: 640, k1: 730, N: 820 };

/** Ledning; strömförande ledningar ritas orange med rörligt streckmönster i strömmens riktning. */
function wire(ctx, pts, live, t) {
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.strokeStyle = live ? COL.orange : COL.ink; ctx.lineWidth = live ? 7 : 4; ctx.stroke();
  if (live) { ctx.setLineDash([6, 18]); ctx.lineDashOffset = -t * 60; ctx.strokeStyle = '#ffe2c4'; ctx.lineWidth = 3; ctx.stroke(); }
  ctx.restore();
}
/**
 * Kontakt enligt IEC 60617, liggande. NO: kniven pekar upp från vänster anslutning och når inte den högra.
 * NC: kniven vilar mot ett stopp på den högra anslutningen. Manöverdonet trycker kniven nedåt i båda fallen.
 */
function contact(ctx, xa, xb, y, closed, live, t, { label, push = false, pressed = false, nc = false } = {}) {
  const a = xa + 18;
  wire(ctx, [[xa, y], [a, y]], live, t); wire(ctx, [[xb - 18, y], [xb, y]], live, t);
  if (nc) line(ctx, xb - 18, y, xb - 18, y - 26, live ? COL.orange : COL.ink, live ? 7 : 4);
  const end = nc ? (closed ? [xb - 12, y - 30] : [xb - 32, y + 8]) : (closed ? [xb - 18, y] : [xb - 22, y - 30]);
  line(ctx, a, y, end[0], end[1], live ? COL.orange : COL.ink, live ? 7 : 5);
  if (push) {
    const mx = (xa + xb) / 2; const by = y + (end[1] - y) * ((mx - a) / (end[0] - a));
    const top = y - 80 + (pressed ? 16 : 0);
    line(ctx, mx, top, mx, by - 3, COL.muted, 3, [6, 5]);
    line(ctx, mx - 22, top, mx + 22, top, COL.ink, 6); line(ctx, mx - 22, top, mx - 22, top + 12, COL.ink, 6);
  }
  text(ctx, label, (xa + xb) / 2, push ? y - 104 : y + 38, { size: 24, weight: 700, align: 'center' });
}
function motor(ctx, x, y, on) {
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, 34, 0, 2 * Math.PI); ctx.fillStyle = '#fff'; ctx.fill(); ctx.lineWidth = on ? 6 : 4; ctx.strokeStyle = on ? COL.green : COL.ink; ctx.stroke(); ctx.restore();
  text(ctx, 'M', x, y - 8, { size: 26, weight: 700, align: 'center', color: on ? COL.green : COL.ink });
  text(ctx, '3~', x, y + 16, { size: 18, weight: 700, align: 'center', color: on ? COL.green : COL.ink });
}
/** Hela styrkretsen i ett givet läge. */
function circuit(ctx, t, { supply = true, ol = false, stop = false, start = false, k1 = false }) {
  const flow = supply && !ol && !stop && (start || k1);
  text(ctx, 'L', X.L - 24, Y, { size: 30, weight: 700, color: supply ? COL.ink : COL.muted, align: 'center' });
  text(ctx, 'N', X.N + 22, Y, { size: 30, weight: 700, align: 'center' });
  wire(ctx, [[X.L, Y], [X.f1a, Y]], flow, t);
  roundRect(ctx, X.f2 + 4, Y - 10, 44, 20, 2, '#fff', flow ? COL.orange : COL.ink, 3); line(ctx, X.f2 + 4, Y, X.f2 + 48, Y, flow ? COL.orange : COL.ink, 2);
  text(ctx, 'F2', X.f2 + 26, Y + 38, { size: 24, weight: 700, align: 'center' });
  contact(ctx, X.f1a, X.f1b, Y, !ol, flow, t, { label: 'F1 överlast', nc: true });
  wire(ctx, [[X.f1b, Y], [X.s0a, Y]], flow, t);
  contact(ctx, X.s0a, X.s0b, Y, !stop, flow, t, { label: 'S0 STOPP', push: true, pressed: stop, nc: true });
  wire(ctx, [[X.s0b, Y], [X.n1, Y]], flow, t);
  wire(ctx, [[X.n1, Y], [X.n1, YU], [X.c0, YU]], flow && start, t); contact(ctx, X.c0, X.c1, YU, start, flow && start, t, { label: 'S1 START', push: true, pressed: start });
  wire(ctx, [[X.c1, YU], [X.n2, YU], [X.n2, Y]], flow && start, t);
  wire(ctx, [[X.n1, Y], [X.n1, YD], [X.c0, YD]], flow && k1, t); contact(ctx, X.c0, X.c1, YD, k1, flow && k1, t, { label: 'K1 hjälpkontakt (NO)' });
  wire(ctx, [[X.c1, YD], [X.n2, YD], [X.n2, Y]], flow && k1, t);
  wire(ctx, [[X.n2, Y], [X.k0, Y]], flow, t);
  roundRect(ctx, X.k0, Y - 30, X.k1 - X.k0, 60, 4, k1 ? '#fde9d6' : '#fff', flow ? COL.orange : COL.ink, 5);
  text(ctx, 'K1', (X.k0 + X.k1) / 2, Y, { size: 28, weight: 700, align: 'center' });
  text(ctx, 'spole', (X.k0 + X.k1) / 2, Y + 52, { size: 22, weight: 400, color: COL.muted, align: 'center' });
  wire(ctx, [[X.k1, Y], [X.N, Y]], flow, t);
  // statusrad
  const sy = B.y + 452;
  text(ctx, `Styrspänning 230 V: ${supply ? 'på' : 'av'}`, B.x + 40, sy, { size: 26, color: supply ? COL.ink : COL.red });
  text(ctx, `K1: ${k1 ? 'dragen' : 'släppt'}`, B.x + 380, sy, { size: 26, weight: 700, color: k1 ? COL.green : COL.ink });
  text(ctx, `Motor: ${k1 ? 'går' : 'står'}`, B.x + 580, sy, { size: 26, color: k1 ? COL.green : COL.ink });
  motor(ctx, B.x + 810, sy - 4, k1);
}

export default compile({
  id: 'hallkretsen', title: 'Hållkretsen', sub: 'START, STOPP och hjälpkontakt, överlast och strömavbrott', week: 'Vecka 41 och 43', deck: 'v41_03 och v43_03',
  scenes: [
    {
      dur: 8,
      draw(ctx, t) { titleCard(ctx, t, 'Hållkretsen', 'START, STOPP och hjälpkontakt', 'Vecka 41 och 43'); },
      say: [[0.8, 7.8, 'Måns', 'Hur kan motorn gå vidare när man släpper START-knappen?']],
    },
    {
      dur: 20,
      draw(ctx, t) { stage(ctx, t); heading(ctx, '1. Vila'); circuit(ctx, t, {}); },
      say: [[0.8, 7.8, 'Sigge', 'S0 STOPP är normalt sluten, NC. S1 START är normalt öppen, NO.'],
        [8.0, 13.8, 'Sigge', 'F1 är överlastskyddets kontakt. Den är också sluten.'],
        [14.0, 19.8, 'Måns', 'Men START är öppen. Ingen ström når spolen, och motorn står.']],
    },
    {
      dur: 15,
      draw(ctx, t) { stage(ctx, t); heading(ctx, '2. START trycks'); circuit(ctx, t, { start: t > 1.2, k1: t > 1.6 }); },
      say: [[0.8, 7.3, 'Sigge', 'Jag trycker START. Ström når spolen och K1 drar.'],
        [7.5, 14.8, 'Sigge', 'Då sluter också K1:s hjälpkontakt, som sitter parallellt med START.']],
    },
    {
      dur: 14,
      draw(ctx, t) { stage(ctx, t); heading(ctx, '3. START släpps'); circuit(ctx, t, { start: t < 5.2, k1: true }); },
      say: [[0.8, 5.0, 'Måns', 'Nu släpper du START. Stannar motorn?'],
        [5.2, 13.8, 'Sigge', 'Nej! Strömmen går genom hjälpkontakten i stället. K1 håller sig själv.']],
    },
    {
      dur: 16,
      draw(ctx, t) { stage(ctx, t); heading(ctx, '4. STOPP trycks'); circuit(ctx, t, { stop: t > 1 && t < 8.5, k1: t < 1.3 }); },
      say: [[0.8, 8.3, 'Sigge', 'STOPP bryter kretsen. Spolen blir strömlös, K1 släpper och hjälpkontakten öppnar.'],
        [8.5, 15.8, 'Måns', 'När STOPP släpps står motorn kvar. Den väntar på ett nytt tryck på START.']],
    },
    {
      dur: 17,
      draw(ctx, t) { stage(ctx, t); heading(ctx, 'Överlast'); circuit(ctx, t, { ol: t > 2.5, k1: t < 2.7 }); },
      say: [[0.8, 8.3, 'Sigge', 'Blir motorn överbelastad blir den varm. Då öppnar överlastskyddets kontakt F1.'],
        [8.5, 13.3, 'Måns', 'Samma I² · R som i filmen om dubbel ström!'],
        [13.5, 16.8, 'Sigge', 'Ta reda på orsaken innan du återställer.']],
    },
    {
      dur: 25,
      draw(ctx, t) { stage(ctx, t); heading(ctx, 'Strömavbrott'); circuit(ctx, t, { supply: t < 2.5 || t > 8, k1: t < 2.7 }); },
      say: [[0.8, 5.3, 'Måns', 'Och om fartyget får strömavbrott?'],
        [5.5, 11.8, 'Sigge', 'Då blir spolen strömlös. K1 släpper och hjälpkontakten öppnar.'],
        [12.0, 17.8, 'Sigge', 'När spänningen kommer tillbaka står motorn kvar. Det kallas återstartsskydd.'],
        [18.0, 24.8, 'Sigge', 'Men viktiga pumpar och styrmaskinen startar om automatiskt, i tur och ordning.']],
    },
    {
      dur: 26, cast: (t) => ({ wave: t > 21.5 }),
      draw(ctx, t) {
        stage(ctx, t); heading(ctx, 'Kom ihåg');
        const items = [['S1 START är NO, S0 STOPP är NC', COL.ink], ['Hjälpkontakten K1 sitter parallellt med START', COL.ink], ['STOPP och överlastskyddet F1 ligger i serie', COL.ink], ['Efter avbrott: nytt tryck på START', COL.ink], ['Felsök spänningslöst: frånskilj, lås, prova, mät R', COL.orange]];
        const at = [0.8, 2.3, 3.8, 5.3, 7.5];
        items.forEach(([s, c], i) => text(ctx, `${i + 1}.  ${s}`, B.x + 40, B.y + 125 + i * 74, { size: 31, weight: c === COL.orange ? 700 : 600, color: c, alpha: prog(t, at[i], at[i] + 0.7) }));
      },
      say: [[0.8, 7.3, 'Sigge', 'Kort sagt: START sluter, STOPP och F1 bryter, K1 håller.'],
        [7.5, 14.3, 'Sigge', 'Felsök i första hand spänningslöst: frånskilj, lås, prova och mät resistans.'],
        [14.5, 21.3, 'Måns', 'Mätning under spänning bara med kompetens, uppdrag, rätt instrument och skydd!'],
        [21.5, 24.8, 'Sigge', 'Precis. Vi ses!']],
    },
  ],
});
