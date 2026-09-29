// Generatorn: rotorn snurrar, och de tre fasspänningarna ritas i takt med den.
// u1 = û·sin(θ + 90°) har sitt toppvärde när nordpolen står mot spolen för L1 (θ = 0). L2 och L3 ligger 120° och 240° efter.
const $ = (q) => document.querySelector(q);
const FARG = ['#064f91', '#c8641e', '#0e7c5a'];
const NAMN = ['L1', 'L2', 'L3'];
const TOPP = 358;                                                   // û för 254 V, fartygets fasspänning i Y (254 · √2 ≈ 359 V)
let vinkel = 0, kor = true, fart = 0.5, scen = null, senast = 0;
const u = (k, g) => TOPP * Math.cos(((g - k * 120) * Math.PI) / 180);

function graf() {
  const c = $('#gen-graf'), d = c.getContext('2d'), W = c.width, H = c.height, v = 60, hm = 30, top = 24, bot = H - 44;
  d.clearRect(0, 0, W, H); d.fillStyle = '#fff'; d.fillRect(0, 0, W, H);
  const X = (g) => v + (g / 360) * (W - v - hm), Y = (x) => top + (1 - x / TOPP) / 2 * (bot - top);
  d.strokeStyle = '#cad8e2'; d.lineWidth = 1; d.font = '15px Arial'; d.fillStyle = '#4d6579'; d.textAlign = 'center';
  for (const g of [0, 90, 180, 270, 360]) { d.beginPath(); d.moveTo(X(g), top); d.lineTo(X(g), bot); d.stroke(); d.fillText(`${g}°`, X(g), bot + 20); }
  d.textAlign = 'right';
  for (const x of [TOPP, 0, -TOPP]) { d.beginPath(); d.moveTo(v, Y(x)); d.lineTo(X(360), Y(x)); d.stroke(); d.fillText(`${Math.round(x)} V`, v - 6, Y(x) + 5); }
  d.textAlign = 'center'; d.fillText('Rotorns vinkel', (v + X(360)) / 2, H - 4);
  for (let k = 0; k < 3; k++) {
    d.strokeStyle = FARG[k]; d.lineWidth = 3; d.beginPath();
    for (let g = 0; g <= 360; g += 2) { const x = X(g), y = Y(u(k, g)); g ? d.lineTo(x, y) : d.moveTo(x, y); }
    d.stroke();
  }
  const g = ((vinkel % 360) + 360) % 360;
  d.strokeStyle = '#163248'; d.lineWidth = 2; d.setLineDash([6, 5]); d.beginPath(); d.moveTo(X(g), top); d.lineTo(X(g), bot); d.stroke(); d.setLineDash([]);
  for (let k = 0; k < 3; k++) { d.fillStyle = FARG[k]; d.beginPath(); d.arc(X(g), Y(u(k, g)), 7, 0, Math.PI * 2); d.fill(); }
  const varden = [0, 1, 2].map((k) => u(k, g));
  const fmt = (x) => `${x < -0.5 ? '−' : ''}${Math.abs(Math.round(x))} V`;
  $('#gen-varden').innerHTML = varden.map((x, k) => `<li style="color:${FARG[k]}"><b>u<sub>${k + 1}</sub></b> = ${fmt(x)}</li>`).join('')
    + `<li><b>u<sub>1</sub> + u<sub>2</sub> + u<sub>3</sub></b> = ${fmt(varden.reduce((a, b) => a + b, 0))}</li>`;
  $('#gen-vinkel').value = Math.round(g); $('#gen-vinkel-v').textContent = `${Math.round(g)}°`;
  const max = varden.indexOf(Math.max(...varden));
  $('#gen-just-nu').textContent = `Nordpolen är närmast spolen för ${NAMN[max]}. Då har ${NAMN[max]} sitt största värde.`;
}

function steg(t) {
  if (kor && senast) vinkel = (vinkel + ((t - senast) / 1000) * 90 * fart) % 360;
  senast = t;
  scen?.satt(vinkel); graf();
  requestAnimationFrame(steg);
}

$('#gen-kor').addEventListener('click', (e) => { kor = !kor; e.currentTarget.textContent = kor ? 'Pausa' : 'Spela'; e.currentTarget.setAttribute('aria-pressed', String(!kor)); });
$('#gen-fart').addEventListener('input', (e) => { fart = +e.target.value; });
$('#gen-vinkel').addEventListener('input', (e) => { kor = false; $('#gen-kor').textContent = 'Spela'; vinkel = +e.target.value; });
for (const b of document.querySelectorAll('[data-till]')) b.addEventListener('click', () => { kor = false; $('#gen-kor').textContent = 'Spela'; vinkel = +b.dataset.till; });

(async () => {
  try {
    const c = document.createElement('canvas');
    if (!(c.getContext('webgl2') || c.getContext('webgl'))) throw Error('WebGL saknas');
    const { mount } = await import('./scen.js?v=20260929');
    scen = mount($('#gen-3d'));
  } catch {
    $('#gen-3d').innerHTML = '<p style="padding:20px">3D-bilden kunde inte visas i den här webbläsaren. Kurvorna och värdena fungerar ändå.</p>';
  }
  requestAnimationFrame(steg);
})();
