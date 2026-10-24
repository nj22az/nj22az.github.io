// Sjöskolans maskotar i pixelstil: måsen Måns och matrosen Sigge.
// Varje figur är ett rutnät av tecken; varje tecken är en färg ur paletten ('.' = genomskinligt).

const PAL = {
  k: '#1b2530', w: '#ffffff', g: '#b9c5cd', d: '#5b6770', y: '#f2b705', r: '#d23b3b', o: '#e07b24', e: '#0c1116',
  b: '#1f3a68', s: '#f1c7a5', h: '#6b4226', m: '#b8323c', W: '#e9eef4', p: '#16284a', n: '#0c1116', c: '#ffffff',
};

const MANS = [
  '..........kkkkk.......',
  '.........kwwwwwk......',
  '........kwwwwwwwk.....',
  '........kwwwwwwewk....',
  '........kwwwwwwwwkkkk.',
  '........kwwwwwwwwyyyyk',
  '........kwwwwwwwwkkrk.',
  '...kkkkkwwwwwwwwk.....',
  '..kwwwwwwwwwwwwwk.....',
  'kkwwggggggggwwwwk.....',
  'kwwgggggggggwwwwk.....',
  'kwwggggggddddwwwk.....',
  '.kwwgggdddddwwwk......',
  '..kwwwwwwwwwwwk.......',
  '...kkkkkkkkkkk........',
  '.......o...o..........',
  '.......o...o..........',
  '......oo..oo..........',
];
// Öppen näbb: övre näbben kortare, undre näbben syns
const MANS_TALK = { 5: '........kwwwwwwwwyyyk.', 6: '........kwwwwwwwwk.yyk' };
const MANS_BLINK = { 3: '........kwwwwwwdwk....' };
// Vingen lyft (flaxar)
const MANS_FLAP = {
  7: '...kkkkkwwwwwwwwk.....', 8: '..kggggkwwwwwwwwk.....', 9: '.kgggggkwwwwwwwwk.....',
  10: 'kdddgggkwwwwwwwwk.....', 11: 'kwwkkkkwwwwwwwwwk.....', 12: '.kwwwwwwwwwwwwwk......',
};

const SIGGE = [
  '....kkkkkkkk....',
  '...kwwwwwwwwk...',
  '..kwwwwwwwwwwk..',
  '..kbbbbbbbbbbk..',
  '..khhhhhhhhhhk..',
  '..khsssssssshk..',
  '..kssessssessk..',
  '..kssssssssssk..',
  '..kssskkkksssk..',
  '...kssssssssk...',
  '....kkrrrrkk....',
  '..kbbbrrrrbbbk..',
  '.kbbbbbrrbbbbbk.',
  '.kbWbWbWbWbWbbk.',
  '.kbbbbbbbbbbbbk.',
  '.ksbWbWbWbWbbsk.',
  '.ksbbbbbbbbbbsk.',
  '..kbbbbbbbbbbk..',
  '..kppppppppppk..',
  '..kppppkkppppk..',
  '..kpppk..kpppk..',
  '..kpppk..kpppk..',
  '..knnnk..knnnk..',
  '..kkkkk..kkkkk..',
];
const SIGGE_TALK = { 8: '..ksssmmmmsssk..', 9: '...ksssmmssk....' };
const SIGGE_BLINK = { 6: '..kssksssskssk..' };
// Vinkar/pekar med höger arm (betraktarens vänster sida hålls stilla)
const SIGGE_WAVE = {
  9: '...kssssssssk.ks', 10: '....kkrrrrkk.kbk', 11: '..kbbbrrrrbbbkbk', 12: '.kbbbbbrrbbbbbk.',
  15: '.ksbWbWbWbWbbbk.', 16: '.ksbbbbbbbbbbbk.',
};

function sprite(base, ...overlays) {
  const rows = base.slice();
  for (const ov of overlays) if (ov) for (const [i, r] of Object.entries(ov)) rows[+i] = r;
  return rows;
}
function paint(ctx, rows, x, y, px, flip = false) {
  const w = Math.max(...rows.map((r) => r.length));
  ctx.save();
  for (let j = 0; j < rows.length; j++) {
    const r = rows[j];
    for (let i = 0; i < r.length; i++) {
      const ch = r[i]; if (ch === '.' || ch === ' ') continue;
      ctx.fillStyle = PAL[ch] || '#f0f';
      const col = flip ? w - 1 - i : i;
      ctx.fillRect(Math.round(x + col * px), Math.round(y + j * px), px, px);
    }
  }
  ctx.restore();
  return { w: w * px, h: rows.length * px };
}

/** Pratar-animation: växlar munläge var 0,14 s när talking är sant. */
const mouthOpen = (time, talking) => talking && Math.floor(time / 0.14) % 2 === 0;
/** Blinkar kort ungefär var 3,7 s (förskjuten per figur). */
const blinking = (time, offset = 0) => ((time + offset) % 3.7) < 0.13;

export function drawMans(ctx, x, y, { px = 8, time = 0, talking = false, flip = false, flap = false, hop = false } = {}) {
  const dy = hop ? -Math.abs(Math.sin(time * 6)) * px * 2 : Math.sin(time * 2) * px * 0.3;
  const rows = sprite(MANS, mouthOpen(time, talking) && MANS_TALK, blinking(time, 1.1) && MANS_BLINK, flap && Math.floor(time / 0.18) % 2 === 0 && MANS_FLAP);
  return paint(ctx, rows, x, y + dy, px, flip);
}
export function drawSigge(ctx, x, y, { px = 9, time = 0, talking = false, wave = false, flip = false } = {}) {
  const dy = Math.sin(time * 1.6) * px * 0.25;
  const rows = sprite(SIGGE, mouthOpen(time, talking) && SIGGE_TALK, blinking(time) && SIGGE_BLINK, wave && Math.floor(time / 0.3) % 2 === 0 && SIGGE_WAVE);
  return paint(ctx, rows, x, y + dy, px, flip);
}
export const SIZE = { mans: [22, 18], sigge: [16, 24] };
