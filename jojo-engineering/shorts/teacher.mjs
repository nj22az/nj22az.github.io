// The channel's pixel-art teacher: a ship's electrician with a yellow hard hat, red beard, navy coverall and multimeter.
// Each sprite is a grid of characters, one character per palette colour ('.' = transparent).
// Overlays (talk, blink, point) patch rows; in an overlay ' ' keeps the pixel underneath.

export const PAL = {
  k: '#141c26', y: '#f2b705', Y: '#c98a00', L: '#ffe27a', s: '#f1c7a5', t: '#d9a07c', e: '#141c26', w: '#ffffff',
  R: '#c2512f', Q: '#8f3419', B: '#7a2a14', m: '#4a1410', b: '#1f3a68', p: '#16284a', W: '#dfe7ee', c: '#ffffff', h: '#6b4226',
  n: '#0c1116', g: '#9aa7b2', G: '#a8e6c0', o: '#e07b24', r: '#d23b3b', d: '#3a4652',
};

const NILS = [
  '..........kkkkkk..........', // 0  hard hat
  '........kkyyLyyyykk.......',
  '.......kyyyLyyyyyyyk......',
  '......kyyyyLyyyyyyyyk.....',
  '......kyyyyyyyyyyyyyk.....',
  '....kkkYyyyyyyyyyyyYkkk...',
  '...kyyyyyyyyyyyyyyyyyyyk..', // 6  brim
  '...kkkkkkkkkkkkkkkkkkkkk..',
  '......kRssssssssssRk......', // 8  face
  '......kRsQQssssQQsRk......',
  '......kRssessssessRk......',
  '.....ktRssessssessRtk.....',
  '......kRsssssttsssRk......',
  '......kRRRRRRRRRRRRk......', // 13 moustache
  '......kRRRRQQQQRRRRk......',
  '......kRRRRRRRRRRRRk......',
  '.......kRRRQRRQRRRk.......',
  '........kRRRRRRRRk........',
  '....kbbbbkkRRRRkkbbbbk....', // 18 shoulders
  '...kbbbbbbbkRRkbbbbbbbk...',
  '..kbbbbbbbbbkkbbbbbbbbbk..',
  '..kbbkbbbbbbbbbbccccbkbbk.', // 21 name badge
  '..kbbkbbbbbbbbbbcddcbkbbk.',
  '..kWWkWWWWWWWWWWWWWWWkWWk.', // 23 reflective stripe
  '..kbbkbbbbbbbbbbbbbbbkbbk.',
  '..kbbkbbbbbbbbbbbbbbbkbbk.',
  '..kWWkbbbbbbbbbbbbbbbkWWk.',
  '..kbbkbbbbbbbbbbbbbbbkbbk.',
  '..ksskhhhhhhhyyhhhhhhkssk.', // 28 belt and hands
  '..ksskhhhhhhhyyhhhhhhkssk.',
  '...kkkbbbbbbbbbbbbbbbkkk..',
  '......kbbbbbbkbbbbbbk.....',
  '......kbbbbbbkbbbbbbk.....',
  '......kWWWWWWkWWWWWWk.....', // 33 knees
  '......kbbbbbbkbbbbbbk.....',
  '......kbbbbbbkbbbbbbk.....',
  '......kbbbbbbkbbbbbbk.....',
  '.....knnnnnnnknnnnnnnk....', // 37 boots
  '.....knnnnnnnknnnnnnnk....',
  '.....kkkkkkkkkkkkkkkkk....',
];

// Open mouth in the beard
const TALK = { 14: '      kRRRmmmmmmRRRk      ', 15: '      kRRRRmmmmRRRRk      ' };
const BLINK = { 10: '      kRssssssssssRk      ' };
// Raised left arm (viewer's left), pointing up at the board
const POINT = {
  8: '.kssk', 9: '.kssk', 10: '.kbbk', 11: '.kbbk', 12: '.kWWk', 13: '.kbbk', 14: '.kbbk', 15: '.kbbk',
  16: '.kbbbk', 17: '..kbbbk', 18: '..kbbbb', 19: '..kbbbbb',
  21: '..kbbb', 22: '..kbbb', 23: '..kWWW', 24: '..kbbb', 25: '..kbbb', 26: '..kbbb', 27: '..kbbb', 28: '..kbbb', 29: '..kbbb', 30: '..kkkk',
};

// Multimeter held in the right hand
const METER = [
  '.kkkkkkk.',
  'kyyyyyyyk',
  'kykkkkkyk',
  'kykGGGkyk',
  'kykGGGkyk',
  'kykkkkkyk',
  'kyyydyyyk',
  'kyydddyyk',
  'kyyydyyyk',
  'kyryykyyk',
  '.kkkkkkk.',
];

function patch(base, ov) {
  const rows = base.slice();
  if (!ov) return rows;
  for (const [i, r] of Object.entries(ov)) {
    const src = rows[+i].split('');
    for (let c = 0; c < r.length; c++) if (r[c] !== ' ') src[c] = r[c];
    rows[+i] = src.join('');
  }
  return rows;
}
export function paint(ctx, rows, x, y, px) {
  for (let j = 0; j < rows.length; j++) {
    for (let i = 0; i < rows[j].length; i++) {
      const ch = rows[j][i]; if (ch === '.' || ch === ' ') continue;
      ctx.fillStyle = PAL[ch] || '#f0f';
      ctx.fillRect(Math.round(x + i * px), Math.round(y + j * px), Math.ceil(px), Math.ceil(px));
    }
  }
}

const mouthOpen = (time, talking) => talking && Math.floor(time / 0.13) % 3 !== 2;
const blinking = (time) => (time % 3.9) < 0.14;

/** Draws the teacher with feet at (x, bottom). Returns size and hand position. */
export function drawTeacher(ctx, x, bottom, { px = 14, time = 0, talking = false, point = false, meter = true } = {}) {
  const bob = Math.round(Math.sin(time * 1.7) * 0.5) * Math.round(px / 3);
  let rows = patch(NILS, mouthOpen(time, talking) && TALK);
  rows = patch(rows, blinking(time) && BLINK);
  if (point) rows = patch(rows, POINT);
  const y = bottom - rows.length * px + bob;
  paint(ctx, rows, x, y, px);
  if (meter) {
    // Multimeter in the right hand, with test leads
    const mx = x + 22 * px, my = y + 25 * px, mp = Math.round(px * 0.8);
    ctx.save(); ctx.lineWidth = Math.max(3, px / 3); ctx.lineCap = 'round';
    for (const [col, dx] of [['#d23b3b', 2], ['#141c26', 6]]) {
      ctx.strokeStyle = col; ctx.beginPath(); ctx.moveTo(mx + dx * mp, my + 10.5 * mp);
      ctx.bezierCurveTo(mx + dx * mp, my + 14 * mp, mx + (dx + 4) * mp, my + 15 * mp, mx + (dx + 3) * mp, my + 19 * mp); ctx.stroke();
    }
    ctx.restore();
    paint(ctx, METER, mx, my, mp);
  }
  return { w: 26 * px, h: rows.length * px, top: y, hand: [x + px, y + 13 * px] };
}
export const NILS_SIZE = [26, NILS.length];
export const _rows = { NILS, METER };
