// Liten PDF-skrivare utan bibliotek (Sjöskolans inlämning vecka 42 och framåt): A4, Helvetica och Helvetica-Bold
// (PDF:ens standardtypsnitt, inbäddas inte) med WinAnsiEncoding. Tecken utanför WinAnsi blir enkel text: Ω → ohm,
// → → ->, ≤ → <=, nedsänkta och upphöjda siffror → vanliga siffror. Hela filen är ASCII, så byteadresserna i xref-tabellen
// är exakta. Test: pdf.test.mjs (struktur, pdfinfo och pdftotext). Innehållet: sjalvrattning.mjs (pdfBlock).

// Teckenbredder (1/1000 em) för WinAnsi-koderna 32–255, ur typsnittens AFM-mått (Adobe Core14).
const HELVETICA = [278,278,355,556,556,889,667,191,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,278,278,584,584,584,556,1015,667,667,722,722,667,611,778,722,278,500,667,556,833,722,778,667,778,722,667,611,722,667,944,667,667,611,278,278,278,469,556,333,556,556,500,556,556,278,556,556,222,222,500,222,833,556,556,556,556,333,500,278,556,500,722,500,500,500,334,260,334,584,0,556,0,222,556,333,1000,556,556,333,1000,667,333,1000,0,611,0,0,222,222,333,333,350,556,1000,333,1000,500,333,944,0,500,667,278,333,556,556,556,556,260,556,333,737,370,556,584,333,737,333,400,584,333,333,333,556,537,278,333,333,365,556,834,834,834,611,667,667,667,667,667,667,1000,722,667,667,667,667,278,278,278,278,722,722,778,778,778,778,778,584,778,722,722,722,722,667,667,611,556,556,556,556,556,556,889,500,556,556,556,556,278,278,278,278,556,556,556,556,556,556,556,584,611,556,556,556,556,500,556,500];
const HELVETICA_BOLD = [278,333,474,556,556,889,722,238,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,333,333,584,584,584,611,975,722,722,722,722,667,611,778,722,278,556,722,611,833,722,778,667,778,722,667,611,722,667,944,667,667,611,333,278,333,584,556,333,556,611,556,611,556,333,611,611,278,278,556,278,889,611,611,611,611,389,556,333,611,556,778,556,556,500,389,280,389,584,0,556,0,278,556,500,1000,556,556,333,1000,667,333,1000,0,611,0,0,278,278,500,500,350,556,1000,333,1000,556,333,944,0,500,667,278,333,556,556,556,556,280,556,333,737,370,556,584,333,737,333,400,584,333,333,333,611,556,278,333,333,365,556,834,834,834,611,722,722,722,722,722,722,1000,722,667,667,667,667,278,278,278,278,722,722,778,778,778,778,778,584,778,722,722,722,722,667,667,611,556,556,556,556,556,556,889,556,556,556,556,556,278,278,278,278,611,611,611,611,611,611,611,584,611,611,611,611,611,556,611,556];

// Unicode → WinAnsi (cp1252) för koderna 0x80–0x9F. Latin-1 (0xA0–0xFF) har samma kod som Unicode.
const CP1252 = { 0x20ac: 0x80, 0x201a: 0x82, 0x0192: 0x83, 0x201e: 0x84, 0x2026: 0x85, 0x2020: 0x86, 0x2021: 0x87, 0x02c6: 0x88,
  0x2030: 0x89, 0x0160: 0x8a, 0x2039: 0x8b, 0x0152: 0x8c, 0x017d: 0x8e, 0x2018: 0x91, 0x2019: 0x92, 0x201c: 0x93, 0x201d: 0x94,
  0x2022: 0x95, 0x2013: 0x96, 0x2014: 0x97, 0x02dc: 0x98, 0x2122: 0x99, 0x0161: 0x9a, 0x203a: 0x9b, 0x0153: 0x9c, 0x017e: 0x9e, 0x0178: 0x9f };
// Tecken som inte finns i WinAnsi skrivs om till text som går att läsa.
const ERSATT = { 'Ω': 'ohm', 'Ω': 'ohm', '→': '->', '←': '<-', '⇒': '=>', '↔': '<->', '≤': '<=', '≥': '>=', '≈': '~', '≠': '!=',
  '−': '-', '‐': '-', '‑': '-', '√': 'sqrt', 'Δ': 'Delta', 'δ': 'delta', 'φ': 'phi', 'Φ': 'Phi', 'π': 'pi', 'ω': 'omega', 'θ': 'theta',
  'λ': 'lambda', 'α': 'alfa', 'β': 'beta', 'η': 'eta', 'ρ': 'rho', 'σ': 'sigma', 'τ': 'tau', 'µ': 'µ', 'μ': 'µ', '∞': 'oo', '∑': 'summa',
  '✓': 'OK', '✔': 'OK', '✗': 'X', '✘': 'X', '•': '•', '­': '', '​': '', ' ': ' ', ' ': ' ', ' ': ' ',
  ' ': ' ', ' ': ' ', ' ': ' ', ' ': ' ', 'ᴸ': 'L', 'ᶜ': 'C', 'ᴿ': 'R', 'ꜰ': 'F', 'ɴ': 'N', '′': "'", '″': '"' };
const NEDSANKT = '₀₁₂₃₄₅₆₇₈₉', UPPHOJT = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const UPP = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁺': '+', '⁻': '-' };

/** Text → sträng med tecken 0–255 (WinAnsi). Markeringen X_{L} blir X_L. En upphöjd följd som inte finns i WinAnsi
 * (10⁻³) skrivs 10^-3; x² och x³ finns och behålls. Okända tecken blir ?. */
export function winAnsi(text) {
  let ut = '';
  const forberedd = String(text ?? '').normalize('NFC').replace(/_\{([^{}]*)\}/g, '_$1').replace(/\^\{([^{}]*)\}/g, '^$1')
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻]+/g, (m) => (/^[¹²³]+$/.test(m) ? m : `^${[...m].map((c) => UPP[c]).join('')}`));
  for (const ch of forberedd) {
    const c = ch.codePointAt(0);
    if (c === 0x0a || (c >= 0x20 && c < 0x7f) || (c >= 0xa0 && c <= 0xff)) ut += ch;
    else if (c === 0x09) ut += ' ';
    else if (CP1252[c]) ut += String.fromCharCode(CP1252[c]);
    else if (ERSATT[ch] !== undefined) ut += winAnsi(ERSATT[ch]);
    else if (NEDSANKT.includes(ch)) ut += String(NEDSANKT.indexOf(ch));
    else if (UPPHOJT.includes(ch)) ut += String(UPPHOJT.indexOf(ch));
    else if (/\p{M}/u.test(ch)) continue;
    else {
      const bas = ch.normalize('NFD').replace(/\p{M}/gu, '');
      ut += bas && bas !== ch ? winAnsi(bas) : '?';
    }
  }
  return ut;
}

/** Bredd i punkter för en WinAnsi-sträng. */
export function bredd(s, fet, storlek) {
  const t = fet ? HELVETICA_BOLD : HELVETICA;
  let w = 0;
  for (let i = 0; i < s.length; i++) { const c = s.charCodeAt(i); w += c >= 32 && c <= 255 ? t[c - 32] : 0; }
  return (w * storlek) / 1000;
}

/** Radbrytning av en WinAnsi-sträng till rader som ryms i max punkter. Ett för långt ord delas. Radbrytningar behålls. */
export function radbryt(s, fet, storlek, max) {
  const rader = [];
  for (const stycke of s.split('\n')) {
    let rad = '';
    for (const ord of stycke.split(/ +/)) {
      const forsok = rad ? `${rad} ${ord}` : ord;
      if (bredd(forsok, fet, storlek) <= max) { rad = forsok; continue; }
      if (rad) rader.push(rad);
      rad = '';
      let rest = ord;
      while (bredd(rest, fet, storlek) > max) {
        let n = rest.length - 1;
        while (n > 1 && bredd(rest.slice(0, n), fet, storlek) > max) n--;
        rader.push(rest.slice(0, n));
        rest = rest.slice(n);
      }
      rad = rest;
    }
    rader.push(rad);
  }
  return rader;
}

const pdfStrang = (s) => {
  let ut = '(';
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (c === 0x28 || c === 0x29 || c === 0x5c) ut += `\\${s[i]}`;
    else if (c < 32 || c > 126) ut += `\\${c.toString(8).padStart(3, '0')}`;
    else ut += s[i];
  }
  return `${ut})`;
};
// Informationsfält (titel, författare) som UTF-16BE med BOM, så att svenska tecken blir rätt i läsarens egenskaper.
const infoStrang = (text) => `<FEFF${Array.from(String(text ?? '')).map((ch) => {
  const c = ch.codePointAt(0);
  if (c <= 0xffff) return c.toString(16).padStart(4, '0').toUpperCase();
  const v = c - 0x10000;
  return ((0xd800 + (v >> 10)).toString(16) + (0xdc00 + (v & 0x3ff)).toString(16)).toUpperCase();
}).join('')}>`;
const datum = (d) => {
  const p = (n) => String(n).padStart(2, '0');
  return `D:${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}Z`;
};
const tal = (x) => (Math.round(x * 100) / 100).toString();

export const A4 = [595.28, 841.89];
const MARGINAL = 56, BREDD = A4[0] - 2 * MARGINAL, TOPP = A4[1] - MARGINAL, BOTTEN = MARGINAL + 22;
const STIL = { rubrik: { storlek: 15, fet: true, fore: 0, farg: '0.024 0.31 0.569' }, underrubrik: { storlek: 12, fet: true, fore: 12, farg: '0.024 0.31 0.569' },
  text: { storlek: 10, fet: false, fore: 2, farg: '0.086 0.196 0.282' } };

/** Lägger ut blocken på A4-sidor. Block: {typ: 'rubrik'|'underrubrik'|'text', text, fet?, indrag?, storlek?, luft?}.
 * Returnerar sidor med rader {x, y, text, fet, storlek, farg}. */
export function layout(block) {
  const sidor = [[]];
  let y = TOPP;
  const nySida = () => { sidor.push([]); y = TOPP; };
  for (const b of block) {
    const stil = STIL[b.typ] || STIL.text, storlek = b.storlek || stil.storlek, fet = b.fet ?? stil.fet;
    const indrag = (b.indrag || 0) * 14, radavstand = storlek * 1.38;
    const rader = radbryt(winAnsi(b.text), fet, storlek, BREDD - indrag);
    const fore = (b.luft ?? stil.fore) + (y === TOPP ? 0 : 0);
    // En rubrik står inte ensam sist på en sida: den behöver plats för minst två rader efter sig.
    const behov = fore + radavstand * (b.typ === 'text' ? 1 : 3);
    if (y - behov < BOTTEN) nySida(); else y -= y === TOPP ? 0 : fore;
    for (const text of rader) {
      if (y - radavstand < BOTTEN) nySida();
      y -= radavstand;
      sidor[sidor.length - 1].push({ x: MARGINAL + indrag, y: y + storlek * 0.3, text, fet, storlek, farg: stil.farg });
    }
  }
  return sidor;
}

/** Skapar PDF-filen. info: {titel, forfattare, amne, sidfot, skapad (Date)}. Returnerar Uint8Array. */
export function skapaPdf(block, info = {}) {
  const sidor = layout(block), n = sidor.length;
  const sidfot = winAnsi(info.sidfot || '');
  const strommar = sidor.map((rader, i) => {
    const ops = ['BT'];
    let font = null, farg = null;
    for (const r of rader) {
      const f = `${r.fet ? '/F2' : '/F1'} ${tal(r.storlek)} Tf`;
      if (f !== font) { ops.push(f); font = f; }
      if (r.farg !== farg) { ops.push(`${r.farg} rg`); farg = r.farg; }
      ops.push(`1 0 0 1 ${tal(r.x)} ${tal(r.y)} Tm`, `${pdfStrang(r.text)} Tj`);
    }
    const fot = `${sidfot ? `${sidfot} · ` : ''}Sida ${i + 1} av ${n}`;
    ops.push('/F1 8 Tf', '0.3 0.4 0.47 rg', `1 0 0 1 ${MARGINAL} 34 Tm`, `${pdfStrang(winAnsi(fot))} Tj`, 'ET');
    return ops.join('\n');
  });
  // Objekt: 1 katalog, 2 sidträd, 3–4 typsnitt, 5 info, sedan sida och innehåll växelvis.
  const obj = [];
  obj[1] = '<< /Type /Catalog /Pages 2 0 R >>';
  obj[2] = `<< /Type /Pages /Kids [${sidor.map((_, i) => `${6 + 2 * i} 0 R`).join(' ')}] /Count ${n} >>`;
  obj[3] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>';
  obj[4] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>';
  const skapad = datum(info.skapad instanceof Date ? info.skapad : new Date());
  obj[5] = `<< /Title ${infoStrang(info.titel)} /Author ${infoStrang(info.forfattare)} /Subject ${infoStrang(info.amne)} /Creator ${infoStrang('Sjöskolan')} /Producer ${infoStrang('Sjöskolan pdf.mjs')} /CreationDate (${skapad}) >>`;
  strommar.forEach((s, i) => {
    obj[6 + 2 * i] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${A4[0]} ${A4[1]}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${7 + 2 * i} 0 R >>`;
    obj[7 + 2 * i] = `<< /Length ${s.length} >>\nstream\n${s}\nendstream`;
  });
  let pdf = '%PDF-1.4\n';
  const adress = [];
  for (let i = 1; i < obj.length; i++) { adress[i] = pdf.length; pdf += `${i} 0 obj\n${obj[i]}\nendobj\n`; }
  const xref = pdf.length;
  pdf += `xref\n0 ${obj.length}\n0000000000 65535 f \n${adress.slice(1).map((a) => `${String(a).padStart(10, '0')} 00000 n \n`).join('')}`;
  pdf += `trailer\n<< /Size ${obj.length} /Root 1 0 R /Info 5 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  const ut = new Uint8Array(pdf.length);
  for (let i = 0; i < pdf.length; i++) {
    const c = pdf.charCodeAt(i);
    if (c > 127) throw new Error('PDF-filen ska vara ASCII');
    ut[i] = c;
  }
  return ut;
}
