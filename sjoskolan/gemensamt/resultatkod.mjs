// Resultatkodens kodning för vecka 41 och framåt: JSON, komprimerat (deflate-raw) och base64url efter # i en länk.
// Samma format som vecka 40 (vecka-40/aktuell/resultat.mjs, låst): z + komprimerat eller j + okomprimerat JSON.
// Ingenting skickas till någon server. Varje vecka har egen modul med fälten och egen lärarsida.

const b64 = (u8) => { let s = ''; for (const b of u8) s += String.fromCharCode(b); return btoa(s).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, ''); };
const unb64 = (s) => { s = s.replaceAll('-', '+').replaceAll('_', '/'); while (s.length % 4) s += '='; return Uint8Array.from(atob(s), (c) => c.charCodeAt(0)); };
async function stream(u8, T) { return new Uint8Array(await new Response(new Blob([u8]).stream().pipeThrough(new T('deflate-raw'))).arrayBuffer()); }

export async function koda(obj) {
  const u8 = new TextEncoder().encode(JSON.stringify(obj));
  if (typeof CompressionStream === 'function') {
    try { return 'z' + b64(await stream(u8, CompressionStream)); } catch { /* deflate-raw saknas: JSON */ }
  }
  return 'j' + b64(u8);
}

/** Avkodar och kontrollerar version och vecka. */
export async function avkoda(text, vecka) {
  const t = String(text || '').trim();
  if (t[0] !== 'z' && t[0] !== 'j') throw new Error('okänt format');
  if (t[0] === 'z' && typeof DecompressionStream !== 'function') throw new Error('Webbläsaren saknar stöd för komprimerade resultatkoder.');
  let obj;
  try {
    const u8 = unb64(t.slice(1));
    obj = JSON.parse(new TextDecoder().decode(t[0] === 'z' ? await stream(u8, DecompressionStream) : u8));
  } catch { throw new Error('Resultatkoden är skadad eller ofullständig.'); }
  if (obj?.v !== 1) throw new Error('fel version');
  if (obj.w !== vecka) throw new Error(`Koden gäller vecka ${obj.w}. Öppna den på lärarsidan för vecka ${obj.w}.`);
  return obj;
}

/** Tal som eleven skriver: komma eller punkt, mellanslag som tusentalsavgränsare. */
export function tal(s) {
  const t = String(s ?? '').trim().replace(/\s/g, '').replace(',', '.').replace('−', '-');
  if (!/^-?\d+(\.\d+)?$|^-?\.\d+$/.test(t)) return NaN;
  return Number(t);
}
export const avrunda = (v) => Number(Number(v).toPrecision(5));
export const las = (k, def) => { try { return JSON.parse(localStorage.getItem(k) || 'null') ?? def; } catch { return def; } };
