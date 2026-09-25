// Film: Dubbel ström, fyra gånger förlust. Effektförlust P = I²·R i en ledning (v39_01)
import { COL, BOARD as B, stage, titleCard, text, line, arrow, roundRect, prog, compile } from '../engine.mjs';

const heading = (ctx, s) => text(ctx, s, B.x + 34, B.y + 46, { size: 32, weight: 700 });
const R = 0.1; // ledningens resistans, Ω
const nf = (v, d = 0) => v.toFixed(d).replace('.', ',');
const mix = (a, b, k) => { const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)); const A = p(a), C = p(b); return `rgb(${A.map((v, i) => Math.round(v + (C[i] - v) * k)).join(',')})`; };

/** Ledning med ström I. Färgen går mot orange när förlusten växer. */
function cable(ctx, t, I) {
  const P = I * I * R; const k = Math.min(1, P / 90);
  const x0 = B.x + 70, x1 = B.x + B.w - 70, y = B.y + 150;
  if (k > 0.05) { ctx.save(); ctx.shadowColor = `rgba(224,110,30,${0.8 * k})`; ctx.shadowBlur = 40 * k; roundRect(ctx, x0, y - 22, x1 - x0, 44, 22, mix('#8796a2', '#e0691e', k)); ctx.restore(); }
  roundRect(ctx, x0, y - 22, x1 - x0, 44, 22, mix('#8796a2', '#e0691e', k), COL.ink, 3);
  // strömmens riktning, fler pilar vid större ström
  const n = 3; const off = (t * I * 6) % ((x1 - x0) / n);
  for (let i = 0; i < n; i++) { const x = x0 + 40 + ((off + i * (x1 - x0) / n) % (x1 - x0 - 100)); arrow(ctx, x, y, x + 46, y, '#ffffff', 5, 16); }
  text(ctx, `Ledning, R = ${nf(R, 1)} Ω`, x0, y - 50, { size: 26, color: COL.muted, weight: 400 });
  text(ctx, `I = ${nf(I)} A`, x0, y + 58, { size: 34, weight: 700, color: COL.blue });
  text(ctx, `P = I² · R = ${nf(P)} W`, x1, y + 58, { size: 34, weight: 700, color: COL.orange, align: 'right' });
}
/** P som funktion av I, 0–30 A, med markerad punkt. */
function curve(ctx, I, { upto = 1 } = {}) {
  const x0 = B.x + 120, y0 = B.y + 480, w = 460, h = 180; const X = (i) => x0 + (i / 30) * w, Yp = (p) => y0 - (p / 90) * h;
  line(ctx, x0, y0, x0 + w + 20, y0, '#9fb2c1', 2); line(ctx, x0, y0, x0, y0 - h - 20, '#9fb2c1', 2);
  text(ctx, 'I (A)', x0 + w + 30, y0, { size: 22, color: COL.muted, weight: 400 }); text(ctx, 'P (W)', x0 - 20, y0 - h - 36, { size: 22, color: COL.muted, weight: 400 });
  [10, 20, 30].forEach((i) => text(ctx, String(i), X(i), y0 + 20, { size: 20, color: COL.muted, weight: 400, align: 'center' }));
  [10, 40, 90].forEach((p) => text(ctx, String(p), x0 - 12, Yp(p), { size: 20, color: COL.muted, weight: 400, align: 'right' }));
  ctx.save(); ctx.beginPath(); for (let j = 0; j <= 100 * upto; j++) { const i = 0.3 * j; if (j) ctx.lineTo(X(i), Yp(i * i * R)); else ctx.moveTo(X(i), Yp(0)); }
  ctx.strokeStyle = COL.orange; ctx.lineWidth = 5; ctx.stroke(); ctx.restore();
  if (I !== null) { line(ctx, X(I), y0, X(I), Yp(I * I * R), COL.ink, 2, [6, 6]); roundRect(ctx, X(I) - 9, Yp(I * I * R) - 9, 18, 18, 4, COL.ink); }
}

export default compile({
  id: 'dubbel-strom', title: 'Dubbel ström', sub: 'Fyra gånger förlust: P = I² · R', week: 'Vecka 39', deck: 'v39_01 Effekt och energi',
  scenes: [
    {
      dur: 6, cast: (t) => ({ wave: t < 3 }),
      draw(ctx, t) { titleCard(ctx, t, 'Dubbel ström', 'Fyra gånger förlust: P = I² · R', 'Vecka 39'); },
      say: [[0.5, 5.8, 'Sigge', 'Varför blir kablar och klämmor varma? Och varför så mycket varmare vid hög last?']],
    },
    {
      dur: 11,
      draw(ctx, t) { stage(ctx, t); heading(ctx, 'Ström värmer ledningen'); cable(ctx, t, 10); },
      say: [[0.3, 5.3, 'Sigge', 'All ledning har lite resistans. Här 0,1 Ω. När ström går blir det värme i ledningen.'],
        [5.5, 10.8, 'Sigge', 'Förlusten är P = I² · R. Med 10 A blir det 10 · 10 · 0,1 = 10 W.']],
    },
    {
      dur: 14,
      draw(ctx, t) {
        stage(ctx, t); heading(ctx, 'Öka strömmen');
        const I = 10 + 10 * prog(t, 3.5, 7.5); cable(ctx, t, I); curve(ctx, I, { upto: 20 / 30 + 10 / 30 * prog(t, 3.5, 7.5) });
        if (t > 8) text(ctx, '4 gånger', B.x + 620, B.y + 330, { size: 44, weight: 700, color: COL.orange, alpha: prog(t, 8, 8.8) });
      },
      say: [[0.3, 3.3, 'Måns', 'Dubbla strömmen … dubbelt så varmt?'],
        [3.5, 7.8, 'Sigge', 'Titta. Vi går från 10 A till 20 A.'],
        [8.0, 13.8, 'Sigge', 'Nej, fyra gånger! 20 · 20 · 0,1 blir 40 W. Strömmen står i kvadrat.']],
    },
    {
      dur: 13,
      draw(ctx, t) {
        stage(ctx, t); heading(ctx, 'Strömmen i kvadrat');
        const I = t < 6 ? 20 : 20 + 10 * prog(t, 6, 9); cable(ctx, t, I); curve(ctx, I, { upto: 1 });
        const rows = [[10, 10], [20, 40], [30, 90]]; const tx = B.x + 640;
        text(ctx, 'I', tx, B.y + 290, { size: 26, color: COL.muted }); text(ctx, 'P', tx + 110, B.y + 290, { size: 26, color: COL.muted });
        rows.forEach(([i, p], k) => { const a = k < 2 ? 1 : prog(t, 8.5, 9.3); text(ctx, `${i} A`, tx, B.y + 330 + k * 44, { size: 30, weight: 700, color: COL.blue, alpha: a }); text(ctx, `${p} W`, tx + 110, B.y + 330 + k * 44, { size: 30, weight: 700, color: COL.orange, alpha: a }); });
      },
      say: [[0.3, 5.8, 'Måns', 'Så tre gånger strömmen … blir nio gånger värmen?'],
        [6.0, 12.8, 'Sigge', 'Ja! 30 A ger 90 W. Därför klarar en kabel bara en viss ström, och därför har den en säkring.']],
    },
    {
      dur: 14, cast: (t) => ({ wave: t > 10.5 }),
      draw(ctx, t) {
        stage(ctx, t); heading(ctx, 'Ombord');
        const items = [['Överlast värmer kabeln fyra gånger mer vid dubbel ström', COL.ink], ['En lös klämma har större R och blir varm', COL.orange], ['Värmekamera hittar varma anslutningar', COL.ink], ['Högre spänning ger lägre ström för samma effekt', COL.ink]];
        items.forEach(([s, c], i) => text(ctx, `${i + 1}.  ${s}`, B.x + 40, B.y + 140 + i * 80, { size: 31, weight: i === 1 ? 700 : 600, color: c, alpha: prog(t, 0.4 + i * 1.4, 1.1 + i * 1.4) }));
      },
      say: [[0.3, 5.3, 'Sigge', 'En lös klämma har större resistans. Samma ström ger då mer värme just där.'],
        [5.5, 10.3, 'Måns', 'Så därför letar maskinisterna efter varma klämmor med värmekamera!'],
        [10.5, 13.8, 'Sigge', 'Precis. Vi ses i nästa film!']],
    },
  ],
});
