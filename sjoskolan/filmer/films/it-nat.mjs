// Film: IT-nätet ombord – första och andra jordfelet (v44_01)
import { COL, BOARD as B, stage, titleCard, text, line, roundRect, prog, compile } from '../engine.mjs';

const heading = (ctx, s) => text(ctx, s, B.x + 34, B.y + 46, { size: 32, weight: 700 });
const LY = [140, 175, 210], PH = [COL.blue, COL.orange, COL.green], XR = 860;
const HULL = 470, C1 = 430, C2 = 650; // skrovets överkant, förbrukarnas lägen

function bolt(ctx, x, y, a = 1) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = COL.orange; ctx.beginPath();
  [[0, -22], [12, -2], [3, -2], [12, 22], [-10, 0], [0, 0]].forEach(([dx, dy], i) => (i ? ctx.lineTo(x + dx, y + dy) : ctx.moveTo(x + dx, y + dy)));
  ctx.closePath(); ctx.fill(); ctx.restore();
}
function glow(ctx, pts, a) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha = 0.45 * a; ctx.strokeStyle = COL.orange; ctx.lineWidth = 18; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke(); ctx.restore();
}
/** Nätet. f1/f2: första och andra felet (0–1). tripped: förbrukare 2 bortkopplad. */
function net(ctx, t, { f1 = 0, f2 = 0, sc = 0, tripped = false } = {}) {
  roundRect(ctx, 70, 110, 120, 130, 10, '#eef2f5', COL.ink, 3); text(ctx, 'G', 130, 158, { size: 34, weight: 700, align: 'center' }); text(ctx, '440 V', 130, 200, { size: 20, align: 'center' });
  glow(ctx, [[190, LY[0]], [C1 + 20, LY[0]], [C1 + 20, 360], [C1 + 60, 400], [C1 + 60, HULL], [C2 + 60, HULL], [C2 + 60, 400], [C2 + 20, 360], [C2 + 20, LY[1]], [190, LY[1]]], sc);
  ['L1', 'L2', 'L3'].forEach((n, k) => { line(ctx, 190, LY[k], XR, LY[k], PH[k], 5); text(ctx, n, XR + 10, LY[k], { size: 20, weight: 700, color: PH[k] }); });
  ctx.fillStyle = '#8c99a6'; ctx.fillRect(B.x + 10, HULL, B.w - 20, 50); text(ctx, 'skrov', B.x + B.w - 30, HULL + 25, { size: 20, color: '#fff', align: 'right', weight: 700 });
  // isolationsvakt
  const bad = f1 > 0.5;
  line(ctx, 130, 240, 130, 330, COL.muted, 3); roundRect(ctx, 70, 330, 120, 70, 8, bad ? '#fde2e2' : '#e6f3ec', bad ? COL.red : COL.green, 3);
  text(ctx, 'IMD', 130, 350, { size: 18, weight: 700, align: 'center' }); text(ctx, bad ? 'LARM' : 'OK', 130, 378, { size: 20, weight: 700, align: 'center', color: bad ? COL.red : COL.green });
  line(ctx, 130, 400, 130, HULL, COL.muted, 3);
  // förbrukare
  [[C1, 0, f1], [C2, 1, f2]].forEach(([x, ph, f], k) => {
    const off = k === 1 && tripped;
    line(ctx, x + 20, LY[ph], x + 20, 300, off ? '#9fb2c1' : PH[ph], 4);
    if (k === 1) { roundRect(ctx, x + 6, 268, 28, 28, 4, '#fff', COL.ink, 3); if (off) text(ctx, 'löst', x + 42, 282, { size: 18, color: COL.red, weight: 700 }); }
    roundRect(ctx, x - 20, 330, 120, 80, 8, '#f3f6f9', COL.ink, 3); text(ctx, k ? 'pump' : 'fläkt', x + 40, 390, { size: 18, align: 'center', color: COL.muted });
    line(ctx, x + 20, 300, x + 20, 355, off ? '#9fb2c1' : PH[ph], 4);
    line(ctx, x + 60, 410, x + 60, HULL, COL.green, 4);
    bolt(ctx, x + 38, 362, f);
  });
}
const steps = (ctx, t, s) => { stage(ctx, t); net(ctx, t, s); };

export default compile({
  id: 'it-nat', title: 'IT-nätet ombord', sub: 'Första och andra jordfelet', week: 'Vecka 44', deck: 'v44_01 Lågspänningssystem',
  scenes: [
    {
      dur: 8,
      draw(ctx, t) { titleCard(ctx, t, 'IT-nätet ombord', 'Första och andra jordfelet', 'Vecka 44'); },
      say: [[0.8, 7.8, 'Måns', 'Isolationslarmet piper, men allt fungerar. Kan vi strunta i det?']],
    },
    {
      dur: 16,
      draw(ctx, t) { steps(ctx, t, {}); heading(ctx, 'Ett isolerat nät'); },
      say: [[0.8, 7.8, 'Sigge', 'Ombord är 440 V-nätet oftast ett IT-nät. Ingen fas är förbunden med skrovet.'],
        [8.0, 15.8, 'Sigge', 'Isolationsvakten, IMD, mäter hela tiden isolationen mellan nätet och skrovet.']],
    },
    {
      dur: 22,
      draw(ctx, t) { steps(ctx, t, { f1: prog(t, 1, 1.6) }); heading(ctx, 'Första jordfelet'); },
      say: [[0.8, 7.8, 'Sigge', 'Nu får fläkten ett jordfel på L1. Strömmen har ingen väg tillbaka till generatorn.'],
        [8.0, 12.8, 'Måns', 'Så det blir bara larm, och fläkten går vidare!'],
        [13.0, 21.8, 'Sigge', 'Ja. Men nu ligger L1 på skrovets potential. L2 och L3 har hela 440 V mot skrovet.']],
    },
    {
      dur: 20,
      draw(ctx, t) { steps(ctx, t, { f1: 1, f2: prog(t, 1, 1.6), sc: prog(t, 1.6, 2.2) * (t < 9 ? 1 : 1 - prog(t, 9, 9.6)), tripped: t > 9 }); heading(ctx, 'Andra jordfelet'); },
      say: [[0.8, 8.3, 'Sigge', 'Kommer ett andra fel på en annan fas blir det kortslutning mellan L1 och L2 via skrovet.'],
        [8.5, 13.8, 'Måns', 'Då löser skyddet, och pumpen stannar!'],
        [14.0, 19.8, 'Sigge', 'Det kan drabba viktiga förbrukare, ibland två på en gång.']],
    },
    {
      dur: 24, cast: (t) => ({ wave: t > 20.5 }),
      draw(ctx, t) {
        stage(ctx, t); heading(ctx, 'Kom ihåg');
        const items = [['Första felet i IT-nät: larm, ingen utlösning', COL.ink], ['De friska faserna får 440 V mot skrovet', COL.orange], ['Andra felet: kortslutning via skrovet', COL.orange], ['Spåra första felet direkt, enligt rutinen', COL.ink], ['Mät med instrument för systemet, CAT III 1 000 V', COL.ink]];
        const at = [0.8, 2.3, 3.8, 7.8, 13.8];
        items.forEach(([s, c], i) => text(ctx, `${i + 1}.  ${s}`, B.x + 40, B.y + 125 + i * 74, { size: 31, weight: c === COL.orange ? 700 : 600, color: c, alpha: prog(t, at[i], at[i] + 0.7) }));
      },
      say: [[0.8, 7.5, 'Sigge', 'Därför spårar vi första felet direkt, till exempel genom att koppla bort grupper i tur och ordning.'],
        [7.8, 13.5, 'Måns', 'Aldrig ignorera ett isolationslarm!'],
        [13.8, 20.3, 'Sigge', 'Och vi mäter med instrument som är avsedda för 440 V-nätet.'],
        [20.5, 23.8, 'Sigge', 'Vi ses!']],
    },
  ],
});
