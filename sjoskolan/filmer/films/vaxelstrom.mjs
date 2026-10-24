// Film: Växelström ombord. Repetition av vecka 40: sinus, reaktans, impedans och effekt (v40_01–v40_03)
// Exemplen är valda så att inget tal är svaret på en övning i kursen (se ANDRINGSLOGG.md, regel 1–3).
import { COL, BOARD as B, stage, titleCard, text, line, arrow, plot, axes, prog, compile, roundRect } from '../engine.mjs';

const heading = (ctx, s) => text(ctx, s, B.x + 34, B.y + 46, { size: 32, weight: 700 });
const TOP = 622; // toppvärde för 440 V
const F = 60; // Hz ombord
const P = { x0: B.x + 90, y0: B.y + 96, w: B.w - 150, h: 330 };
const small = { size: 24, color: COL.muted, weight: 400 };

/** Rader som tonas in efter varandra: [[tid, text, färg, storlek]] */
function rows(ctx, t, list, { x = B.x + 60, y = B.y + 130, gap = 78 } = {}) {
  list.forEach(([at, s, c = COL.ink, size = 42], i) => text(ctx, s, x, y + i * gap, { size, weight: 700, color: c, alpha: prog(t, at, at + 0.7) }));
}
/** Ruta med rubrik och värde */
function box(ctx, x, y, w, title, value, color, alpha = 1) {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha = alpha;
  roundRect(ctx, x, y, w, 120, 16, '#f4f8fb', color, 3);
  text(ctx, title, x + w / 2, y + 36, { size: 24, color: COL.muted, weight: 400, align: 'center' });
  text(ctx, value, x + w / 2, y + 84, { size: 40, weight: 700, color, align: 'center' });
  ctx.restore();
}

export default compile({
  id: 'vaxelstrom', title: 'Växelström ombord', sub: 'Sinus, reaktans, impedans och effekt', week: 'Vecka 40', deck: 'v40_01–v40_03',
  scenes: [
    {
      dur: 8,
      draw(ctx, t) { titleCard(ctx, t, 'Växelström ombord', 'Sinus, reaktans, impedans och effekt', 'Vecka 40'); },
      say: [[0.8, 7.8, 'Måns', 'Ombord står det 440 V och 60 Hz. Vad betyder talen egentligen?']],
    },
    {
      dur: 20,
      draw(ctx, t) {
        stage(ctx, t); heading(ctx, 'Spänningen ombord: 440 V, 60 Hz');
        axes(ctx, P);
        text(ctx, 'u', P.x0 - 30, P.y0 + 6, { ...small, size: 28 });
        text(ctx, 't', P.x0 + P.w + 10, P.y0 + P.h / 2, { ...small, size: 28 });
        const Tms = 1000 / F, span = 2 * Tms; // två perioder
        const { X, Y } = plot(ctx, (ms) => TOP * Math.sin(2 * Math.PI * F * ms / 1000), { ...P, a: 0, b: span, ymax: 700, upto: prog(t, 0.6, 4.5), color: COL.blue });
        const a = prog(t, 6.6, 7.4);
        if (a > 0) {
          ctx.save(); ctx.globalAlpha = a;
          const y = P.y0 + P.h + 30;
          line(ctx, X(0), y - 12, X(0), y + 12, COL.ink, 3); line(ctx, X(Tms), y - 12, X(Tms), y + 12, COL.ink, 3);
          arrow(ctx, X(Tms / 2), y, X(0) + 4, y, COL.ink, 3, 12); arrow(ctx, X(Tms / 2), y, X(Tms) - 4, y, COL.ink, 3, 12);
          text(ctx, 'T = 1/f = 1/60 s ≈ 16,7 ms', X(Tms) + 24, y, { size: 28, weight: 700 });
          ctx.restore();
        }
        const b = prog(t, 13.8, 14.6);
        if (b > 0) {
          ctx.save(); ctx.globalAlpha = b;
          line(ctx, P.x0, Y(TOP), P.x0 + P.w, Y(TOP), COL.ink, 2, [8, 7]);
          text(ctx, 'û = √2 · U ≈ 622 V', P.x0 + P.w - 4, Y(TOP) - 22, { size: 30, align: 'right', weight: 700 });
          ctx.restore();
        }
      },
      say: [[0.6, 6.4, 'Sigge', 'Spänningen byter riktning hela tiden. Den svänger 60 gånger i sekunden.'],
        [6.6, 13.2, 'Sigge', 'En hel period tar 1/60 sekund. Det är ungefär 16,7 ms.'],
        [13.4, 19.8, 'Måns', '440 V är effektivvärdet. Toppen är √2 gånger så hög, 622 V!']],
    },
    {
      dur: 22,
      draw(ctx, t) {
        stage(ctx, t); heading(ctx, 'Spänningen i ett visst ögonblick');
        const Q = { ...P, y0: P.y0 + 40, h: 300, w: 470 };
        axes(ctx, Q);
        const span = 1000 / F;
        const { X, Y } = plot(ctx, (ms) => TOP * Math.sin(2 * Math.PI * F * ms / 1000), { ...Q, a: 0, b: span, ymax: 700, upto: prog(t, 0.6, 3), color: COL.blue });
        text(ctx, 'u(t) = û · sin(2π · f · t)', Q.x0 + Q.w + 30, Q.y0 + 20, { size: 30, weight: 700, alpha: prog(t, 0.6, 1.4) });
        const a = prog(t, 7, 8);
        if (a > 0) {
          const ms = 2.0, u = TOP * Math.sin(2 * Math.PI * F * ms / 1000);
          ctx.save(); ctx.globalAlpha = a;
          line(ctx, X(ms), Y(0), X(ms), Y(u), COL.red, 3, [6, 6]); line(ctx, Q.x0, Y(u), X(ms), Y(u), COL.red, 3, [6, 6]);
          ctx.fillStyle = COL.red; ctx.beginPath(); ctx.arc(X(ms), Y(u), 9, 0, 2 * Math.PI); ctx.fill();
          text(ctx, '2,0 ms', X(ms), Y(0) + 26, { size: 22, color: COL.red, align: 'center' });
          ctx.restore();
        }
        rows(ctx, t, [[8.5, 'u = 622 · sin(2π · 60 · 0,002)', COL.ink, 30], [13, 'u = 622 · sin(0,754) ≈ 426 V', COL.red, 30], [17.5, 'Räknaren i radianer!', COL.orange, 30]], { x: Q.x0 + Q.w + 30, y: Q.y0 + 90, gap: 64 });
      },
      say: [[0.6, 6.8, 'Sigge', 'Formeln u(t) ger spänningen i varje ögonblick längs kurvan.'],
        [7.0, 12.8, 'Måns', 'Hur stor är spänningen 2,0 ms efter nollgenomgången?'],
        [13.0, 17.3, 'Sigge', 'Sätt in t = 0,002 s. Du får ungefär 426 V.'],
        [17.5, 21.8, 'Sigge', 'Ställ räknaren på radianer, annars blir det fel.']],
    },
    {
      dur: 20,
      draw(ctx, t) {
        stage(ctx, t); heading(ctx, 'Motstånd och spole: vem kommer först?');
        const L = { x0: B.x + 60, y0: B.y + 120, w: 360, h: 260 }, R = { ...L, x0: B.x + 470 };
        [[L, 'Motstånd R', 0, 0.5], [R, 'Spole L', Math.PI / 2, 9]].forEach(([Q, name, lag, at]) => {
          const g = prog(t, at, at + 3); if (g <= 0) return;
          ctx.save(); ctx.globalAlpha = Math.min(1, g * 3);
          axes(ctx, Q); text(ctx, name, Q.x0, Q.y0 - 26, { size: 28, weight: 700 });
          ctx.restore();
          plot(ctx, (x) => Math.sin(x), { ...Q, a: 0, b: 4 * Math.PI, ymax: 1.25, upto: g, color: COL.blue });
          plot(ctx, (x) => 0.65 * Math.sin(x - lag), { ...Q, a: 0, b: 4 * Math.PI, ymax: 1.25, upto: g, color: COL.orange });
        });
        text(ctx, 'u', B.x + 60, B.y + 440, { size: 28, weight: 700, color: COL.blue, alpha: prog(t, 1, 2) });
        text(ctx, 'spänning', B.x + 84, B.y + 440, { ...small, alpha: prog(t, 1, 2) });
        text(ctx, 'i', B.x + 230, B.y + 440, { size: 28, weight: 700, color: COL.orange, alpha: prog(t, 1, 2) });
        text(ctx, 'ström', B.x + 248, B.y + 440, { ...small, alpha: prog(t, 1, 2) });
        text(ctx, 'strömmen släpar 90°', R.x0, B.y + 440, { size: 28, weight: 700, color: COL.orange, alpha: prog(t, 12, 13) });
      },
      say: [[0.6, 7.8, 'Sigge', 'I ett motstånd följer strömmen spänningen. De når toppen samtidigt.'],
        [8.0, 14.3, 'Sigge', 'I en spole når strömmen toppen en kvarts period senare.'],
        [14.5, 19.8, 'Måns', 'Strömmen släpar efter spänningen med 90°!']],
    },
    {
      dur: 30,
      draw(ctx, t) {
        stage(ctx, t); heading(ctx, 'Induktiv reaktans: X_{L} = 2π · f · L');
        text(ctx, 'Drossel i en lysrörsarmatur, L = 200 mH', B.x + 60, B.y + 110, { size: 28, weight: 400, color: COL.muted, alpha: prog(t, 0.6, 1.4) });
        rows(ctx, t, [[3.5, 'I land, 50 Hz:', COL.ink, 34], [5.5, 'X_{L} = 2π · 50 · 0,2 ≈ 62,8 Ω', COL.blue, 40]], { y: B.y + 180, gap: 64 });
        rows(ctx, t, [[11, 'Ombord, 60 Hz:', COL.ink, 34]], { y: B.y + 330 });
        const pause = t >= 13 && t < 21;
        if (pause) {
          const k = Math.ceil(21 - t);
          roundRect(ctx, B.x + 330, B.y + 300, 330, 60, 30, COL.gold);
          text(ctx, `Pausa och räkna … ${k}`, B.x + 495, B.y + 330, { size: 28, weight: 700, align: 'center' });
        }
        rows(ctx, t, [[21, 'X_{L} = 2π · 60 · 0,2 ≈ 75,4 Ω', COL.red, 40]], { y: B.y + 394 });
        text(ctx, 'Högre frekvens ger större X_{L}.', B.x + 60, B.y + 470, { size: 30, weight: 700, color: COL.orange, alpha: prog(t, 25, 25.8) });
      },
      say: [[0.6, 5.3, 'Sigge', 'Spolen bromsar växelström. Det kallas reaktans.'],
        [5.5, 10.8, 'Sigge', 'En drossel på 200 mH har 62,8 Ω vid 50 Hz.'],
        [11.0, 16.8, 'Måns', 'Hur stor blir den ombord, vid 60 Hz?'],
        [17.0, 20.8, 'Sigge', 'Pausa och räkna själv först.'],
        [21.0, 24.8, 'Sigge', 'Svaret är ungefär 75,4 Ω.'],
        [25.0, 29.8, 'Måns', 'Högre frekvens, större reaktans i spolen!']],
    },
    {
      dur: 20,
      draw(ctx, t) {
        stage(ctx, t); heading(ctx, 'Kondensatorn gör tvärtom');
        const G = { x0: B.x + 90, y0: B.y + 110, w: 420, h: 300 };
        line(ctx, G.x0, G.y0 + G.h, G.x0 + G.w, G.y0 + G.h, '#9fb2c1', 2); line(ctx, G.x0, G.y0, G.x0, G.y0 + G.h, '#9fb2c1', 2);
        text(ctx, 'f', G.x0 + G.w + 12, G.y0 + G.h, { ...small, size: 28 });
        text(ctx, 'X', G.x0 - 30, G.y0 + 4, { ...small, size: 28 });
        const X = (f) => G.x0 + f * G.w, Y = (v) => G.y0 + G.h - v * G.h;
        const curve = (fn, upto, color) => { ctx.save(); ctx.beginPath(); for (let i = 10; i <= 100 * upto; i++) { const f = i / 100; if (i > 10) ctx.lineTo(X(f), Y(fn(f))); else ctx.moveTo(X(f), Y(fn(f))); } ctx.strokeStyle = color; ctx.lineWidth = 5; ctx.stroke(); ctx.restore(); };
        curve((f) => 0.9 * f, prog(t, 0.6, 3), COL.blue);
        curve((f) => 0.09 / Math.max(f, 0.1), prog(t, 7, 9.5), COL.orange);
        text(ctx, 'X_{L}', X(0.9) + 12, Y(0.81), { size: 30, weight: 700, color: COL.blue, alpha: prog(t, 2, 3) });
        text(ctx, 'X_{C}', X(0.9) + 12, Y(0.1), { size: 30, weight: 700, color: COL.orange, alpha: prog(t, 9, 10) });
        rows(ctx, t, [[7, 'X_{C} = 1/(2π · f · C)', COL.orange, 36], [11.5, 'strömmen leder 90°', COL.orange, 30]], { x: B.x + 560, y: B.y + 170, gap: 70 });
      },
      say: [[0.6, 6.8, 'Sigge', 'Spolens reaktans växer när frekvensen ökar.'],
        [7.0, 11.3, 'Sigge', 'Kondensatorns reaktans minskar i stället.'],
        [11.5, 19.8, 'Sigge', 'I en kondensator kommer strömmen före spänningen. Strömmen leder 90°.']],
    },
    {
      dur: 26,
      draw(ctx, t) {
        stage(ctx, t); heading(ctx, 'Impedans: R och X_{L} läggs ihop som sidor');
        text(ctx, 'Motorlindning: R = 5 Ω och X_{L} = 12 Ω', B.x + 60, B.y + 104, { size: 28, weight: 400, color: COL.muted, alpha: prog(t, 0.6, 1.4) });
        const O = [B.x + 110, B.y + 440], s = 26; // 1 Ω = 26 px
        const r = prog(t, 1.5, 3), x = prog(t, 3, 4.5), z = prog(t, 8, 9.5);
        if (r > 0) { arrow(ctx, O[0], O[1], O[0] + 5 * s * r, O[1], COL.blue, 6, 18); text(ctx, 'R = 5 Ω', O[0] + 60, O[1] + 34, { size: 28, weight: 700, color: COL.blue, alpha: r }); }
        if (x > 0) { arrow(ctx, O[0] + 5 * s, O[1], O[0] + 5 * s, O[1] - 12 * s * x, COL.orange, 6, 18); text(ctx, 'X_{L} = 12 Ω', O[0] + 5 * s + 20, O[1] - 160, { size: 28, weight: 700, color: COL.orange, alpha: x }); }
        if (z > 0) { arrow(ctx, O[0], O[1], O[0] + 5 * s * z, O[1] - 12 * s * z, COL.red, 6, 18); text(ctx, 'Z = ?', O[0] + 20, O[1] - 190, { size: 30, weight: 700, color: COL.red, alpha: z }); }
        rows(ctx, t, [[10, 'Z = √(R² + X_{L}²)', COL.ink, 36], [14, 'Z = √(25 + 144) = √169', COL.ink, 34], [16.5, 'Z = 13 Ω', COL.red, 40], [20.5, 'inte 5 + 12 = 17 Ω', COL.muted, 30]], { x: B.x + 440, y: B.y + 170, gap: 72 });
      },
      say: [[0.6, 7.8, 'Måns', 'Lindningen har 5 Ω resistans och 12 Ω reaktans. Blir det 17 Ω?'],
        [8.0, 13.8, 'Sigge', 'Nej. R och X_{L} står vinkelrätt. De är sidor i en triangel.'],
        [14.0, 20.3, 'Sigge', 'Pythagoras sats ger impedansen Z = 13 Ω.'],
        [20.5, 25.8, 'Måns', 'Aldrig lägga ihop dem rakt av. Jag lovar!']],
    },
    {
      dur: 26,
      draw(ctx, t) {
        stage(ctx, t); heading(ctx, 'Samma effekt, olika ström');
        box(ctx, B.x + 60, B.y + 110, 360, 'Värmeelement, PF = 1', '1 380 W', COL.ink, prog(t, 0.6, 1.4));
        box(ctx, B.x + 460, B.y + 110, 360, 'Pumpmotor, PF = 0,80', '1 380 W', COL.ink, prog(t, 7, 7.8));
        text(ctx, 'I = 1 380 / 230 = 6,0 A', B.x + 240, B.y + 290, { size: 32, weight: 700, color: COL.blue, align: 'center', alpha: prog(t, 3, 3.8) });
        text(ctx, 'I = P / (U · PF)', B.x + 640, B.y + 290, { size: 32, weight: 700, align: 'center', alpha: prog(t, 10, 10.8) });
        text(ctx, 'I = 1 380 / (230 · 0,80) = 7,5 A', B.x + 640, B.y + 350, { size: 30, weight: 700, color: COL.red, align: 'center', alpha: prog(t, 13, 13.8) });
        text(ctx, 'Båda matas med 230 V.', B.x + 60, B.y + 450, { ...small, size: 28, alpha: prog(t, 1, 2) });
      },
      say: [[0.6, 6.8, 'Sigge', 'Ett värmeelement på 1 380 W vid 230 V drar 6,0 A.'],
        [7.0, 12.8, 'Sigge', 'En pumpmotor med samma effekt har effektfaktorn 0,80.'],
        [13.0, 19.3, 'Måns', 'Den drar 7,5 A! Samma effekt men mer ström?'],
        [19.5, 25.8, 'Sigge', 'Ja. En del av strömmen pendlar bara fram och tillbaka.']],
    },
    {
      dur: 24,
      draw(ctx, t) {
        stage(ctx, t); heading(ctx, 'Effekttriangeln: P, Q och S');
        const O = [B.x + 90, B.y + 430], k = 0.3; // 1 W = 0,3 px
        const p = prog(t, 0.6, 2.2), q = prog(t, 6.5, 8), s = prog(t, 12.5, 14);
        if (p > 0) { arrow(ctx, O[0], O[1], O[0] + 1380 * k * p, O[1], COL.blue, 6, 18); text(ctx, 'P = 1 380 W', O[0] + 110, O[1] + 34, { size: 28, weight: 700, color: COL.blue, alpha: p }); }
        if (q > 0) { arrow(ctx, O[0] + 1380 * k, O[1], O[0] + 1380 * k, O[1] - 1035 * k * q, COL.orange, 6, 18); text(ctx, 'Q', O[0] + 1380 * k + 18, O[1] - 150, { size: 30, weight: 700, color: COL.orange, alpha: q }); }
        if (s > 0) { arrow(ctx, O[0], O[1], O[0] + 1380 * k * s, O[1] - 1035 * k * s, COL.red, 6, 18); text(ctx, 'S', O[0] + 150, O[1] - 190, { size: 30, weight: 700, color: COL.red, alpha: s }); text(ctx, 'φ', O[0] + 70, O[1] - 22, { size: 26, alpha: s }); }
        rows(ctx, t, [[3, 'P: nyttig effekt, W', COL.blue, 30], [8.5, 'Q: pendlar, var', COL.orange, 30], [14.5, 'S = U · I = 230 · 7,5', COL.red, 30], [17, 'S = 1 725 VA', COL.red, 36], [19.5, 'Q = √(S² − P²) ≈ 1 035 var', COL.orange, 30]], { x: B.x + 520, y: B.y + 130, gap: 66 });
      },
      say: [[0.6, 6.3, 'Sigge', 'P är den aktiva effekten. Den blir värme och arbete.'],
        [6.5, 12.3, 'Sigge', 'Q är reaktiv effekt. Den pendlar mellan nätet och motorn.'],
        [12.5, 18.8, 'Sigge', 'S är skenbar effekt: spänning gånger ström, 1 725 VA.'],
        [19.0, 23.8, 'Måns', 'Och PF = P/S = 0,80. Det går ihop!']],
    },
    {
      dur: 24,
      draw(ctx, t) {
        stage(ctx, t); heading(ctx, 'Kompensering: kondensator nära motorn');
        box(ctx, B.x + 60, B.y + 110, 360, 'Utan kompensering', '7,5 A', COL.red, prog(t, 0.6, 1.4));
        box(ctx, B.x + 460, B.y + 110, 360, 'Med kondensator, PF = 1', '6,0 A', COL.green, prog(t, 7, 7.8));
        rows(ctx, t, [[13, 'Förlusten i kabeln följer I².', COL.ink, 32], [16, '(7,5 / 6,0)² ≈ 1,56', COL.ink, 32], [18.5, 'Utan kompensering: 56 % mer värme', COL.orange, 32]], { y: B.y + 300, gap: 64 });
      },
      say: [[0.6, 6.8, 'Sigge', 'En kondensator nära motorn levererar den reaktiva effekten.'],
        [7.0, 12.8, 'Sigge', 'Då behöver kabeln bara bära 6,0 A. Motorn får samma effekt.'],
        [13.0, 18.3, 'Måns', 'Mindre ström ger mindre värme i kabeln!'],
        [18.5, 23.8, 'Sigge', 'Förlusten följer I². 7,5 A ger 56 % mer värme.']],
    },
    {
      dur: 26, cast: (t) => ({ wave: t > 21.5 }),
      draw(ctx, t) {
        stage(ctx, t); heading(ctx, 'Kom ihåg');
        const items = [['T = 1/f  och  û = √2 · U', COL.ink], ['Spole: X_{L} = 2π · f · L, strömmen släpar', COL.ink], ['Kondensator: X_{C} = 1/(2π · f · C), strömmen leder', COL.ink], ['Z = √(R² + X²), aldrig R + X', COL.red], ['I = P / (U · PF): låg PF ger större ström', COL.orange]];
        const at = [0.6, 4.5, 8.5, 12.5, 16.5];
        items.forEach(([s, c], i) => text(ctx, `${i + 1}.  ${s}`, B.x + 50, B.y + 125 + i * 74, { size: 32, weight: c === COL.ink ? 600 : 700, color: c, alpha: prog(t, at[i], at[i] + 0.7) }));
      },
      say: [[0.6, 8.3, 'Sigge', 'Här är det viktigaste. Pausa gärna och skriv av listan.'],
        [8.5, 16.3, 'Måns', 'Ombord gäller samma formler, bara med 60 Hz.'],
        [16.5, 21.3, 'Sigge', 'Testa nu själv i växelströmslabbet.'],
        [21.5, 25.8, 'Sigge', 'Vi ses i nästa film!']],
    },
  ],
});
