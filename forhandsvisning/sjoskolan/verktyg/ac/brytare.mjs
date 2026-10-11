// Omslagsbild för Frånskiljning och mätteknik (v38_01): en effektbrytare i FRÅN-läge, låst med hänglås och skylt,
// mellan dvärgbrytare på en DIN-skena. Ritas som SVG (1500 × 1000). Den övre tredjedelen är mörk för den vita rubriken.
//
//   node sjoskolan/verktyg/ac/brytare.mjs > omslag.svg        (scheman_v38.py renderar och lägger in bilden)

const B = 1500, H = 1000;
const f = (n) => n.toFixed(1);

function dvargbrytare(x, y, text) {
  // En modul (70 × 230): vit kropp, fönster, spak i TILL-läge.
  return `<g>
  <rect x="${x}" y="${y}" width="70" height="230" rx="6" fill="url(#vit)" stroke="#8a97a3" stroke-width="2"/>
  <rect x="${x + 8}" y="${y + 14}" width="54" height="18" rx="3" fill="#dfe5ea"/>
  <text x="${x + 35}" y="${y + 28}" text-anchor="middle" font-size="13" font-weight="700" fill="#35495a">${text}</text>
  <rect x="${x + 20}" y="${y + 70}" width="30" height="90" rx="6" fill="#2c3945"/>
  <rect x="${x + 24}" y="${y + 74}" width="22" height="40" rx="4" fill="#5b88b5"/>
  <text x="${x + 35}" y="${y + 60}" text-anchor="middle" font-size="12" fill="#35495a">I</text>
  <text x="${x + 35}" y="${y + 180}" text-anchor="middle" font-size="12" fill="#35495a">O</text>
  <rect x="${x + 14}" y="${y + 200}" width="42" height="14" rx="3" fill="#c7cfd6"/>
</g>`;
}

function skruv(x, y, r = 9) {
  return `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#skruv)" stroke="#6b7883" stroke-width="1.5"/>
  <path d="M${x - r * 0.6},${y} H${x + r * 0.6} M${x},${y - r * 0.6} V${y + r * 0.6}" stroke="#56626d" stroke-width="2"/>`;
}

function effektbrytare(cx, top) {
  const w = 380, h = 470, x = cx - w / 2;
  let s = `<rect x="${x + 10}" y="${top + 14}" width="${w}" height="${h}" rx="18" fill="#000" opacity="0.35"/>`; // skugga
  s += `<rect x="${x}" y="${top}" width="${w}" height="${h}" rx="18" fill="url(#kropp)" stroke="#1f2a33" stroke-width="3"/>`;
  // Anslutningskåpor överst och nederst med tre poler
  for (const y of [top + 12, top + h - 82]) {
    s += `<rect x="${x + 22}" y="${y}" width="${w - 44}" height="70" rx="10" fill="#2e3943" stroke="#1b242c" stroke-width="2"/>`;
    for (let i = 0; i < 3; i++) s += skruv(x + 80 + i * 110, y + 35, 13);
  }
  // Frontpanel
  const py = top + 100, ph = h - 200;
  s += `<rect x="${x + 40}" y="${py}" width="${w - 80}" height="${ph}" rx="12" fill="url(#front)" stroke="#27323b" stroke-width="2"/>`;
  s += `<text x="${x + 62}" y="${py + 34}" font-size="18" font-weight="700" fill="#e6ecf1">3P · 160 A</text>`;
  s += `<text x="${x + 62}" y="${py + 56}" font-size="14" fill="#b8c4ce">Effektbrytare</text>`;
  // Spakens spår med I överst och O nederst. Spaken står i O (FRÅN).
  const sx = cx + 70, sy = py + 40, sh = ph - 80;
  s += `<rect x="${sx - 24}" y="${sy}" width="48" height="${sh}" rx="14" fill="#141b21" stroke="#0b1015" stroke-width="2"/>`;
  s += `<text x="${sx + 42}" y="${sy + 26}" font-size="22" font-weight="700" fill="#e6ecf1">I</text>`;
  s += `<text x="${sx - 44}" y="${sy + sh - 30}" text-anchor="end" font-size="22" font-weight="700" fill="#e6ecf1">O</text>`;
  s += `<text x="${sx - 44}" y="${sy + sh - 10}" text-anchor="end" font-size="13" fill="#b8c4ce">FRÅN</text>`;
  const hy = sy + sh - 96; // spaken nere
  s += `<rect x="${sx - 32}" y="${hy}" width="64" height="86" rx="10" fill="url(#spak)" stroke="#0e1419" stroke-width="2"/>`;
  s += `<rect x="${sx - 32}" y="${hy + 58}" width="64" height="10" fill="#0e1419" opacity="0.35"/>`;
  // Låsbygel genom spaken och ett rött hänglås som hänger ned
  const lx = sx, ly = hy + 30;
  s += `<path d="M${lx - 46},${ly} H${lx + 46}" stroke="#aab4bd" stroke-width="9" stroke-linecap="round"/>`;
  s += `<path d="M${lx + 46},${ly} v70" stroke="#aab4bd" stroke-width="9" stroke-linecap="round"/>`;
  const px = lx + 46, pyl = ly + 70;
  s += `<path d="M${px - 22},${pyl + 34} v-16 a22,22 0 0 1 44,0 v16" fill="none" stroke="#c9d1d8" stroke-width="10"/>`;
  s += `<rect x="${px - 38}" y="${pyl + 30}" width="76" height="66" rx="12" fill="url(#las)" stroke="#6e1a14" stroke-width="2"/>`;
  s += `<circle cx="${px}" cy="${pyl + 58}" r="7" fill="#3a0d0a"/><rect x="${px - 3}" y="${pyl + 60}" width="6" height="16" fill="#3a0d0a"/>`;
  // Gul skylt i ett snöre från låset
  const tx = px + 30, ty = pyl + 96;
  s += `<path d="M${px + 20},${pyl + 90} Q${px + 40},${ty - 20} ${tx + 60},${ty + 6}" fill="none" stroke="#2b2b2b" stroke-width="3"/>`;
  s += `<g transform="rotate(-8 ${tx + 110} ${ty + 70})">
    <rect x="${tx}" y="${ty}" width="220" height="130" rx="10" fill="#ffd43d" stroke="#8a6d00" stroke-width="2"/>
    <circle cx="${tx + 60}" cy="${ty + 16}" r="7" fill="#fff" stroke="#8a6d00" stroke-width="2"/>
    <rect x="${tx}" y="${ty + 30}" width="220" height="20" fill="#1c1c1c"/>
    <text x="${tx + 110}" y="${ty + 45}" text-anchor="middle" font-size="14" font-weight="700" fill="#ffd43d">FARA</text>
    <text x="${tx + 110}" y="${ty + 84}" text-anchor="middle" font-size="24" font-weight="700" fill="#1c1c1c">FRÅNSKILD</text>
    <text x="${tx + 110}" y="${ty + 114}" text-anchor="middle" font-size="18" font-weight="700" fill="#1c1c1c">MANÖVRERA EJ</text>
  </g>`;
  return s;
}

export function omslag() {
  let s = `<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#08141f"/><stop offset="0.45" stop-color="#10273a"/><stop offset="1" stop-color="#1b3a55"/></linearGradient>
  <radialGradient id="ljus" cx="0.5" cy="0.72" r="0.55"><stop offset="0" stop-color="#ffffff" stop-opacity="0.18"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient>
  <linearGradient id="platt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfd7de"/><stop offset="1" stop-color="#9eabb6"/></linearGradient>
  <linearGradient id="skena" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eef1f4"/><stop offset="0.5" stop-color="#b9c3cc"/><stop offset="1" stop-color="#e2e7eb"/></linearGradient>
  <linearGradient id="vit" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#f4f6f8"/><stop offset="1" stop-color="#d9e0e6"/></linearGradient>
  <linearGradient id="kropp" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4a5763"/><stop offset="1" stop-color="#2a343d"/></linearGradient>
  <linearGradient id="front" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#56636f"/><stop offset="1" stop-color="#3b4751"/></linearGradient>
  <linearGradient id="spak" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2a2f35"/><stop offset="0.5" stop-color="#4b535c"/><stop offset="1" stop-color="#23282d"/></linearGradient>
  <linearGradient id="las" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e0443a"/><stop offset="1" stop-color="#a3241c"/></linearGradient>
  <radialGradient id="skruv" cx="0.35" cy="0.35" r="0.8"><stop offset="0" stop-color="#f0f3f5"/><stop offset="1" stop-color="#8e9aa4"/></radialGradient>
</defs>
<rect width="${B}" height="${H}" fill="url(#bg)"/>`;
  // Centralens plåt med skruvar
  const px = 170, py = 350, pw = B - 340, ph = 560;
  s += `<rect x="${px}" y="${py}" width="${pw}" height="${ph + 40}" rx="16" fill="url(#platt)" stroke="#6f7c87" stroke-width="3"/>`;
  s += `<rect x="${px}" y="${py}" width="${pw}" height="${ph + 40}" fill="url(#ljus)"/>`;
  for (const [x, y] of [[px + 30, py + 30], [px + pw - 30, py + 30]]) s += skruv(x, y, 11);
  // DIN-skena med avlånga hål
  const ry = 600;
  s += `<rect x="${px + 30}" y="${ry}" width="${pw - 60}" height="36" rx="3" fill="url(#skena)" stroke="#8591a0" stroke-width="2"/>`;
  for (let x = px + 60; x < px + pw - 60; x += 70) s += `<rect x="${x}" y="${ry + 13}" width="34" height="10" rx="5" fill="#7f8b96"/>`;
  // Dvärgbrytare till vänster och höger, effektbrytaren i mitten
  ['C16', 'C10', 'C10'].forEach((t, i) => { s += dvargbrytare(px + 60 + i * 76, 500, t); });
  ['C16', 'C6', 'C6'].forEach((t, i) => { s += dvargbrytare(px + pw - 60 - 70 - i * 76, 500, t); });
  s += effektbrytare(B / 2 - 60, 380);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${B}" height="${H}" viewBox="0 0 ${B} ${H}" font-family="Arial, Helvetica, sans-serif">${s}</svg>`;
}

if (import.meta.url === `file://${process.argv[1]}`) process.stdout.write(omslag());
