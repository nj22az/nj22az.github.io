// Talmanus för kortfilmerna: varje replik i läsbar form för talsyntes (OmniVoice m.fl.).
// Symboler, index, tal och enheter skrivs ut i ord, så att rösten läser dem rätt: ”U_{L} = √3 · U_{F}” blir
// ”U L är roten ur tre gånger U F”, ”440 V” blir ”fyrahundrafyrtio volt”. Varje replik behåller sin tid i filmen,
// så att ljudet kan kontrolleras mot tidsfönstret.
//
//   node sjoskolan/filmer/tal.mjs     skriver filmer/tal/manus.json och filmer/tal/<film>.txt
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ENTAL = ['noll', 'ett', 'två', 'tre', 'fyra', 'fem', 'sex', 'sju', 'åtta', 'nio', 'tio', 'elva', 'tolv', 'tretton', 'fjorton', 'femton', 'sexton', 'sjutton', 'arton', 'nitton'];
const TIOTAL = ['', '', 'tjugo', 'trettio', 'fyrtio', 'femtio', 'sextio', 'sjuttio', 'åttio', 'nittio'];

/** Heltal i ord (svenska, sammanskrivet): 440 -> fyrahundrafyrtio, 120 -> hundratjugo, 1732 -> tusensjuhundratrettiotvå. */
export function heltal(n) {
  if (n < 20) return ENTAL[n];
  if (n < 100) return TIOTAL[Math.floor(n / 10)] + (n % 10 ? ENTAL[n % 10] : '');
  if (n < 1000) return (Math.floor(n / 100) === 1 ? '' : ENTAL[Math.floor(n / 100)]) + 'hundra' + (n % 100 ? heltal(n % 100) : '');
  if (n < 1e6) return (Math.floor(n / 1000) === 1 ? '' : heltal(Math.floor(n / 1000))) + 'tusen' + (n % 1000 ? heltal(n % 1000) : '');
  return String(n);
}

/** Tal med decimalkomma: 1,732 -> ett komma sju tre två. */
function tal(s) {
  const [h, d] = s.replace(/[\s  ]/g, '').split(',');
  const ord = heltal(Number(h));
  return d ? `${ord} komma ${[...d].map((c) => ENTAL[Number(c)]).join(' ')}` : ord;
}

const ENHETER = {
  kV: 'kilovolt', mV: 'millivolt', V: 'volt', kA: 'kiloampere', mA: 'milliampere', A: 'ampere', kW: 'kilowatt', W: 'watt',
  kVA: 'kilovoltampere', VA: 'voltampere', kvar: 'kilovar', var: 'var', kΩ: 'kiloohm', MΩ: 'megaohm', Ω: 'ohm', Hz: 'hertz',
  ms: 'millisekunder', s: 'sekunder', '°': 'grader', '%': 'procent', mH: 'millihenry', µF: 'mikrofarad', kWh: 'kilowattimmar',
};
// Förkortningar som läses bokstav för bokstav
const BOKSTAVERA = ['RMS', 'IT', 'TN', 'PE', 'AC', 'DC', 'EMK', 'SELV', 'PF'];

/** Replikens text (med kursmarkering U_{L}) i talform. */
export function talform(t) {
  let s = String(t);
  s = s.replace(/[ᴸᶜᴿꜰɴ]/g, (c) => ({ 'ᴸ': '_{L}', 'ᶜ': '_{C}', 'ᴿ': '_{R}', 'ꜰ': '_{F}', 'ɴ': '_{N}' })[c]);
  s = s.replace(/√(\d)/g, (_, d) => `roten ur ${ENTAL[Number(d)]}`);
  s = s.replace(/û/g, 'u topp').replace(/î/g, 'i topp');
  s = s.replace(/²/g, ' i kvadrat').replace(/³/g, ' i kubik').replace(/\bcos\b/g, 'cosinus').replace(/\bsin\b/g, 'sinus').replace(/\btan\b/g, 'tangens');
  // index: U_{L} -> U L, U_{gren} -> U gren, U_{RMS} -> U R M S
  s = s.replace(/([A-Za-zΔφ])_\{([^{}]*)\}/g, (_, x, i) => `${x} ${/^[A-Z]{2,}$/.test(i) ? [...i].join(' ') : i}`);
  // ledarbeteckningar L1, L2, L3
  s = s.replace(/\bL([123])\b/g, (_, d) => `L ${ENTAL[Number(d)]}`);
  // tal med enhet och fristående tal
  const enhet = Object.keys(ENHETER).sort((a, b) => b.length - a.length).map((e) => e.replace(/[%°]/g, '\\$&')).join('|');
  s = s.replace(new RegExp(`(\\d[\\d\\s\\u00a0\\u202f]*(?:,\\d+)?)\\s?(${enhet})(?![\\wÅÄÖåäö])`, 'g'), (_, n, e) => `${tal(n.trim())} ${ENHETER[e]}`);
  s = s.replace(/\d+(?:,\d+)?/g, (n) => tal(n));
  // tecken
  s = s.replace(/\s*·\s*/g, ' gånger ').replace(/\s*≈\s*/g, ' är ungefär ').replace(/\s*=\s*/g, ' lika med ').replace(/\s*−\s*/g, ' minus ').replace(/\s*\+\s*/g, ' plus ');
  s = s.replace(/(\w)\s*\/\s*(\w)/g, '$1 delat med $2');
  s = s.replace(new RegExp(`\\b(${BOKSTAVERA.join('|')})\\b`, 'g'), (m) => [...m].join(' '));
  s = s.replace(/\s+/g, ' ').trim();
  return s.replace(/(^|[.!?…]\s+)([a-zåäö])/g, (_, a, b) => a + b.toUpperCase());
}

// ------------------------------------------------------------ manus
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const { FILMS } = await import('./films/index.mjs');
  const UT = join(dirname(fileURLToPath(import.meta.url)), 'tal');
  mkdirSync(UT, { recursive: true });
  const manus = [];
  for (const f of FILMS) {
    let start = 0, rader = [`${f.title} – ${f.sub}`, ''];
    f.scenes.forEach((sc, si) => {
      (sc.say || []).forEach(([at, to, vem, text], ri) => {
        const rad = { film: f.id, scen: si + 1, replik: ri + 1, vem, start: +(start + at).toFixed(2), slut: +(start + to).toFixed(2), sekunder: +(to - at).toFixed(2), text, tal: talform(text) };
        manus.push(rad);
        rader.push(`${vem} (${rad.sekunder} s): ${rad.tal}`);
      });
      start += sc.dur;
    });
    writeFileSync(join(UT, `${f.id}.txt`), rader.join('\n') + '\n');
  }
  writeFileSync(join(UT, 'manus.json'), JSON.stringify(manus, null, 1) + '\n');
  console.log(`${manus.length} repliker i ${FILMS.length} filmer -> ${UT}`);
}
