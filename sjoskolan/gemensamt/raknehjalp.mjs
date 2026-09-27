// Räknarhjälp som visas där eleven behöver den: RAD eller DEG på räknaren och prefix (mH, µF, ms) till grundenheter.
// behov(text) avgör vilka kort en text behöver; hjalpHtml(text) ger korten som hopfällbara rutor.
// Samma kort används i genomgången, artikeln (innehall/export/lektioner.py), labbet och övningarna,
// och alla samlas på /sjoskolan/gemensamt/Raknehjalp.html.
export const KORT = {
  rad: {
    titel: 'Räknaren i RAD: när vinkeln kommer från 2π · f · t',
    html: `<p>I <b>u(t) = û · sin(2π · f · t)</b> är 2π · f · t en vinkel i <b>radianer</b>. Räknaren ska stå i <b>RAD</b>.</p>
<p><b>Kontrollera:</b> räkna sin(π/2). Blir svaret <b>1</b> står räknaren rätt. Blir det 0,0274 står den i DEG.</p>
<p><b>Ställ om:</b> Casio: tryck SHIFT och sedan Mode eller Menu (inställningar), välj vinkelenhet Rad. TI-30X: tryck Mode och välj Rad. Telefonen: vrid den på tvären och tryck Rad. I fönstret står då ett litet <b>R</b> eller Rad.</p>
<p><b>Regel:</b> står det π eller 2π · f · t i vinkeln, använd RAD. Ställ tillbaka till DEG efteråt.</p>
<p><b>Varför radianer?</b> Se filmen <a href="/sjoskolan/filmer/#radianer">Radianer och grader</a> (2 min).</p>`,
  },
  deg: {
    titel: 'Räknaren i DEG: när vinkeln är i grader',
    html: `<p>Fasvinkeln <b>φ = arctan(X/R)</b> och vinklar som 30°, 90° och 120° räknas i <b>grader</b>. Räknaren ska stå i <b>DEG</b>.</p>
<p><b>Kontrollera:</b> räkna sin(90). Blir svaret <b>1</b> står räknaren rätt.</p>
<p><b>arctan</b> heter tan⁻¹ på räknaren: tryck SHIFT och sedan tan.</p>
<p><b>Ställ om:</b> Casio: tryck SHIFT och sedan Mode eller Menu (inställningar), välj vinkelenhet Deg. TI-30X: tryck Mode och välj Deg. Telefonen: tryck Deg. I fönstret står då ett litet <b>D</b> eller Deg.</p>
<p><b>Regel:</b> står det ° eller söker du en fasvinkel i grader, använd DEG.</p>`,
  },
  prefix: {
    titel: 'Enheter: byt prefixet mot en tiopotens',
    html: `<table class="rh-tabell"><thead><tr><th>Prefix</th><th>Betyder</th><th>Gånger</th></tr></thead><tbody>
<tr><td>k (kilo)</td><td>tusen</td><td>1 000</td></tr><tr><td>m (milli)</td><td>tusendel</td><td>0,001 = 10⁻³</td></tr>
<tr><td>µ (mikro)</td><td>miljondel</td><td>0,000 001 = 10⁻⁶</td></tr><tr><td>n (nano)</td><td>miljarddel</td><td>10⁻⁹</td></tr></tbody></table>
<p><b>Så gör du:</b> skriv talet och byt prefixet mot talet i tabellen.</p>
<ul><li>382 mH = 382 · 0,001 H = <b>0,382 H</b></li><li>47 µF = 47 · 10⁻⁶ F = <b>0,000 047 F</b></li><li>16,7 ms = 16,7 · 0,001 s = <b>0,0167 s</b></li></ul>
<p><b>På räknaren:</b> 47 µF skrivs 47 och sedan tiopotensknappen (×10ˣ) och −6.</p>
<p><b>Kontroll:</b> i formlerna ska L stå i henry (H), C i farad (F) och t i sekunder (s). Svaret i ms får du genom att gånga sekunderna med 1 000.</p>`,
  },
};

const MONSTER = {
  rad: /u\(t\)|sin\s*\(\s*2π|sin\s*\(\s*π|sin\(0,\d|\bRAD\b|\d\s?rad\b|momentanvärde/i,
  deg: /arctan|tan⁻¹|\bDEG\b|fasvinkel|\d\s?°/i,
  prefix: /\d\s?(mH|µF|μF|nF|ms|µs)(?![\wÅÄÖåäö])|millisekunder/,
};

export function behov(text) {
  const t = String(text || '');
  const k = Object.keys(MONSTER).filter((id) => MONSTER[id].test(t));
  // ”Ett varv är 360°” i en radiantext ska inte ge DEG-kortet; bara en fasvinkel eller arctan gör det.
  if (k.includes('rad') && k.includes('deg') && !/arctan|tan⁻¹|fasvinkel/i.test(t)) k.splice(k.indexOf('deg'), 1);
  return k;
}

let stilKlar = false;
function stil() {
  if (stilKlar || typeof document === 'undefined') return;
  stilKlar = true;
  if (document.querySelector('link[href*="raknehjalp.css"]')) return;
  const l = document.createElement('link');
  l.rel = 'stylesheet'; l.href = '/sjoskolan/gemensamt/raknehjalp.css?v=20260929';
  document.head.append(l);
}

export function hjalpHtml(text) {
  const k = behov(text);
  if (!k.length) return '';
  stil();
  return `<div class="raknehjalp">${k.map((id) => `<details class="rh-kort rh-${id}"><summary>${KORT[id].titel}</summary>${KORT[id].html}<p class="rh-mer"><a href="/sjoskolan/gemensamt/Raknehjalp.html#${id}" target="_blank" rel="noopener">All räknarhjälp</a></p></details>`).join('')}</div>`;
}
