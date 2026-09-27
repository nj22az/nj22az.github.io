// Elevens personliga tal D (1–31) räknas fram ur namnet. Eleven skriver sitt namn; inlämningen, den guidade labben
// och lärarsidorna räknar samma D ur samma namn. Stora och små bokstäver och extra mellanslag spelar ingen roll.
// Samma funktion finns i lärarguiden (inbäddad) och i innehall/lib/berakningar.py (elevtal); ändra alla tre samtidigt.
export const NAMNNYCKEL = 'sj-elevnamn';

export function normalisera(namn) {
  return String(namn ?? '').normalize('NFC').trim().replace(/\s+/g, ' ').toLocaleLowerCase('sv-SE');
}

/** FNV-1a (32 bit) över namnets UTF-8-byte, D = 1 + hash mod 31. Tomt namn ger null. */
export function elevtal(namn) {
  const s = normalisera(namn);
  if (!s) return null;
  let h = 0x811c9dc5;
  for (const b of new TextEncoder().encode(s)) { h ^= b; h = Math.imul(h, 0x01000193) >>> 0; }
  return 1 + (h % 31);
}

/** Ett namn räknas som giltigt när det har minst två delar (för- och efternamn). */
export const fulltNamn = (namn) => normalisera(namn).split(' ').filter((d) => d.length >= 2).length >= 2;

export function sparatNamn() { try { return localStorage.getItem(NAMNNYCKEL) || ''; } catch { return ''; } }
export function sparaNamn(namn) { try { localStorage.setItem(NAMNNYCKEL, String(namn ?? '').trim()); } catch { /* privat läge */ } }
