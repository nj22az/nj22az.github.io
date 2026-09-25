// Film: Fem säkerhetsåtgärder före arbete utan spänning (v42_02 och v42_03)
import { COL, BOARD as B, stage, titleCard, text, line, roundRect, prog, compile } from '../engine.mjs';

const heading = (ctx, s) => text(ctx, s, B.x + 34, B.y + 46, { size: 32, weight: 700 });
const LIVE = COL.orange, DEAD = '#8a98a5';
const Y1 = 185, Y2 = 370, XQ = 330, XK = 640; // matningarnas höjd, brytarnas och K3:s läge

function wire(ctx, pts, live) {
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.strokeStyle = live ? LIVE : DEAD; ctx.lineWidth = live ? 7 : 5; ctx.stroke(); ctx.restore();
}
function breaker(ctx, x, y, open, live) {
  wire(ctx, [[x - 40, y], [x - 20, y]], live);
  const e = open ? [x + 14, y - 34] : [x + 20, y];
  line(ctx, x - 20, y, e[0], e[1], live ? LIVE : COL.ink, 6); wire(ctx, [[x + 20, y], [x + 40, y]], live && !open);
}
function lock(ctx, x, y, a) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha = a;
  ctx.lineWidth = 6; ctx.strokeStyle = COL.ink; ctx.beginPath(); ctx.arc(x, y - 8, 13, Math.PI, 0); ctx.stroke();
  roundRect(ctx, x - 18, y - 8, 36, 30, 4, COL.orange, COL.ink, 3);
  roundRect(ctx, x + 26, y - 10, 150, 42, 4, '#ffe9a8', COL.orange, 2); text(ctx, 'Arbete pågår', x + 101, y + 2, { size: 17, align: 'center', weight: 700 }); text(ctx, 'Sigge, tel. 123', x + 101, y + 22, { size: 14, align: 'center' });
  ctx.restore();
}
function tester(ctx, x, y, lit) {
  roundRect(ctx, x - 22, y - 44, 44, 70, 6, '#f2c200', COL.ink, 3);
  ctx.save(); ctx.beginPath(); ctx.arc(x, y - 22, 11, 0, 2 * Math.PI); ctx.fillStyle = lit ? '#e53935' : '#3a4450'; ctx.fill(); ctx.restore();
  line(ctx, x - 10, y + 26, x - 24, y + 62, COL.ink, 4); line(ctx, x + 10, y + 26, x + 24, y + 62, COL.ink, 4);
}

/** Hela bilden. s: { q1, q2 (öppna), lk (lås 0–1), probe: null|'kand1'|'obj'|'kand2', earth (0–1), shield (0–1), ups (UPS synlig 0–1) } */
function scene(ctx, t, s) {
  const live1 = !s.q1, live2 = !s.q2;
  roundRect(ctx, B.x + 30, Y1 - 28, 150, 56, 8, '#fff', COL.ink, 3); text(ctx, 'Huvudtavla', B.x + 105, Y1, { size: 22, align: 'center', weight: 700 });
  wire(ctx, [[B.x + 180, Y1], [XQ - 40, Y1]], true); breaker(ctx, XQ, Y1, s.q1, true); text(ctx, 'Q1', XQ - 44, Y1 - 30, { size: 22, align: 'center', weight: 700 });
  wire(ctx, [[XQ + 40, Y1], [XK, Y1], [XK, 245]], live1 || live2);
  const u = s.ups ?? 1;
  if (u > 0) {
    ctx.save(); ctx.globalAlpha = u;
    roundRect(ctx, B.x + 30, Y2 - 28, 150, 56, 8, '#fff', COL.ink, 3); text(ctx, 'UPS', B.x + 105, Y2, { size: 24, align: 'center', weight: 700 });
    wire(ctx, [[B.x + 180, Y2], [XQ - 40, Y2]], true); breaker(ctx, XQ, Y2, s.q2, true); text(ctx, 'Q2', XQ - 44, Y2 - 30, { size: 22, align: 'center', weight: 700 });
    wire(ctx, [[XQ + 40, Y2], [XK, Y2], [XK, 325]], live2 || live1);
    ctx.restore();
  }
  const on = live1 || (live2 && u > 0);
  roundRect(ctx, XK - 85, 245, 170, 80, 8, on ? '#fde9d6' : '#eef2f5', on ? LIVE : COL.ink, 4);
  text(ctx, 'K3', XK, 272, { size: 28, weight: 700, align: 'center' });
  text(ctx, on ? 'spänningssatt' : s.verified ? 'spänningslös' : 'frånskild, ej kontrollerad', XK, 302, { size: s.verified || on ? 20 : 15, align: 'center', color: on ? LIVE : s.verified ? COL.green : COL.muted });
  [XK - 34, XK + 14].forEach((x) => roundRect(ctx, x - 6, 239, 12, 12, 3, '#fff', COL.ink, 2)); // plintar
  // grannkrets som fortsatt är i drift
  wire(ctx, [[830, 120], [830, 470]], true); text(ctx, 'grannkrets', 830, 100, { size: 20, align: 'center', color: LIVE });
  if (s.shield > 0) { ctx.save(); ctx.globalAlpha = s.shield; roundRect(ctx, 800, 140, 60, 300, 6, 'rgba(90,110,130,.35)', COL.ink, 3); text(ctx, 'skydd', 790, 445, { size: 20, align: 'right', weight: 700 }); ctx.restore(); }
  lock(ctx, XQ - 40, Y1 + 42, s.lk || 0); if (u > 0) lock(ctx, XQ - 40, Y2 + 42, (s.lk || 0) * u);
  if (s.earth > 0) {
    ctx.save(); ctx.globalAlpha = s.earth;
    // alla ledare förbinds med en skena (kortslutning) och skenan jordas
    [262, 285, 308].forEach((y) => line(ctx, XK + 85, y, XK + 112, y, COL.green, 4));
    line(ctx, XK + 112, 255, XK + 112, 315, COL.green, 7); line(ctx, XK + 112, 315, XK + 112, 360, COL.green, 5);
    [30, 20, 10].forEach((w, k) => line(ctx, XK + 112 - w, 360 + k * 9, XK + 112 + w, 360 + k * 9, COL.green, 4));
    text(ctx, 'jordad och kortsluten', XK, 410, { size: 20, align: 'center', color: COL.green, weight: 700 });
    ctx.restore();
  }
  if (s.probe) {
    roundRect(ctx, 650, 440, 130, 50, 8, '#fff', COL.ink, 3); text(ctx, 'känd källa', 715, 465, { size: 20, align: 'center' });
    if (s.probe === 'obj') tester(ctx, XK - 10, 183, false); else tester(ctx, 715, 380, true);
  }
}
/** Stegrad längst ner: aktuellt steg är ifyllt. */
function steps(ctx, cur) {
  for (let k = 0; k < 5; k++) {
    const x = B.x + 60 + k * 58, y = B.y + 480, done = k < cur, now = k === cur;
    ctx.save(); ctx.beginPath(); ctx.arc(x, y, 20, 0, 2 * Math.PI); ctx.fillStyle = now ? COL.blue : done ? '#9fbbd6' : '#fff'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = COL.blue; ctx.stroke(); ctx.restore();
    text(ctx, String(k + 1), x, y, { size: 20, weight: 700, align: 'center', color: now || done ? '#fff' : COL.blue });
  }
}
const base = { q1: false, q2: false, lk: 0, probe: null, earth: 0, shield: 0, ups: 1, verified: false };

export default compile({
  id: 'fem-steg', title: 'Fem steg', sub: 'Säkerhetsåtgärder före arbete utan spänning', week: 'Vecka 42', deck: 'v42_02 och v42_03',
  scenes: [
    {
      dur: 8,
      draw(ctx, t) { titleCard(ctx, t, 'Fem steg', 'Före arbete utan spänning', 'Vecka 42'); },
      say: [[0.8, 7.8, 'Måns', 'Sigge ska arbeta i kopplingslådan K3. Räcker det att slå ifrån en brytare?']],
    },
    {
      dur: 20,
      draw(ctx, t) { stage(ctx, t); heading(ctx, '1. Frånskilj fullständigt'); scene(ctx, t, { ...base, q1: t > 2, q2: t > 13.5 }); steps(ctx, 0); },
      say: [[0.8, 6.8, 'Sigge', 'Nej, men vi börjar där. Jag öppnar Q1, som är avsedd för frånskiljning.'],
        [7.0, 12.8, 'Måns', 'K3 är fortfarande spänningssatt! Det finns en UPS också.'],
        [13.0, 19.8, 'Sigge', 'Därför kartlägger vi alla matningsvägar. Nu öppnar jag Q2 också.']],
    },
    {
      dur: 14,
      draw(ctx, t) { stage(ctx, t); heading(ctx, '2. Skydda mot återinkoppling'); scene(ctx, t, { ...base, q1: true, q2: true, lk: prog(t, 1, 2) }); steps(ctx, 1); },
      say: [[0.8, 7.3, 'Sigge', 'Jag låser båda brytarna och sätter skylt med namn. K3 är ännu inte kontrollerad.'],
        [7.5, 13.8, 'Måns', 'En skylt informerar. Låset hindrar att någon slår till.']],
    },
    {
      dur: 21,
      draw(ctx, t) {
        stage(ctx, t); heading(ctx, '3. Kontrollera spänningslöshet');
        const probe = t < 1 ? null : t < 7 ? 'kand1' : t < 14 ? 'obj' : 'kand2';
        scene(ctx, t, { ...base, q1: true, q2: true, lk: 1, probe, verified: t > 11 }); steps(ctx, 2);
      },
      say: [[0.8, 6.8, 'Sigge', 'Först provar jag provaren mot en känd källa. Den visar spänning.'],
        [7.0, 13.8, 'Sigge', 'Sedan mäter jag på K3, mellan alla ledare och mot jord. Ingen spänning.'],
        [14.0, 20.8, 'Måns', 'Och sist mot den kända källan igen, så att provaren fortfarande fungerar!']],
    },
    {
      dur: 14,
      draw(ctx, t) { stage(ctx, t); heading(ctx, '4. Jorda och kortslut'); scene(ctx, t, { ...base, q1: true, q2: true, lk: 1, verified: true, earth: prog(t, 1, 2) }); steps(ctx, 3); },
      say: [[0.8, 7.3, 'Sigge', 'Där det krävs jordas och kortsluts ledarna, synligt från arbetsstället.'],
        [7.5, 13.8, 'Sigge', 'Det är vanligt vid högspänning. Beredningen anger när det gäller.']],
    },
    {
      dur: 14,
      draw(ctx, t) { stage(ctx, t); heading(ctx, '5. Skydda mot närliggande delar'); scene(ctx, t, { ...base, q1: true, q2: true, lk: 1, verified: true, earth: 1, shield: prog(t, 5, 6) }); steps(ctx, 4); },
      say: [[0.8, 4.8, 'Måns', 'Grannkretsen är fortfarande i drift!'],
        [5.0, 13.8, 'Sigge', 'Den skärmar vi av eller håller avstånd till, enligt beredningen.']],
    },
    {
      dur: 20, cast: (t) => ({ wave: t > 16.5 }),
      draw(ctx, t) {
        stage(ctx, t); heading(ctx, 'Kom ihåg');
        const items = [['Frånskilj alla matningsvägar', COL.ink], ['Lås och märk mot återinkoppling', COL.ink], ['Prova – mät – prova', COL.ink], ['Jorda och kortslut där det krävs', COL.ink], ['Skydda mot närliggande spänningssatta delar', COL.ink]];
        items.forEach(([s, c], i) => text(ctx, `${i + 1}.  ${s}`, B.x + 40, B.y + 125 + i * 74, { size: 32, weight: 600, color: c, alpha: prog(t, 0.8 + i * 1.2, 1.5 + i * 1.2) }));
      },
      say: [[0.8, 8.3, 'Sigge', 'Fem steg, i ordning. Först därefter ger den ansvarige enligt arbetstillståndet startbesked.'],
        [8.5, 16.3, 'Måns', 'Och ändras något under arbetet, stoppar vi och gör en ny bedömning!'],
        [16.5, 19.8, 'Sigge', 'Precis. Vi ses!']],
    },
  ],
});
