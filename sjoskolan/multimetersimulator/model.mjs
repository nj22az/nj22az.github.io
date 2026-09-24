// Resistive DC model. Independent of lesson IDs and of the DOM.
export const MODES = { off: 'OFF', dc: 'V ⎓', ac: 'V ~', current: 'A ⎓', ohm: 'Ω', continuity: 'Summer' };
export function initialState(circuit = 'lamp') {
  return { circuit, power: false, voltage: 12, load: 120, link: true, parallel: true,
    broken: false, input: 10e6, mode: 'off', jack: 'v', red: null, black: null,
    range: 'auto', fuse: false, trip: null };
}
export function network(s) {
  if (s.circuit === 'resistor') return { nodes: ['A','B'], edges: [ ['A','B',1000], ...(s.parallel ? [['A','B',1000]] : []) ], fixed: {} };
  if (s.circuit === 'fuse') return { nodes: ['A','B'], edges: s.broken ? [] : [['A','B',0.2]], fixed: {} };
  if (s.circuit === 'divider') return { nodes: ['S','M','G'], edges: [['S','M',1e6],['M','G',1e6]], fixed: s.power ? {S:10,G:0} : {} };
  return { nodes: ['K1','K2','P1','P2'], edges: [['K2','P1',0],['P1','P2',s.load], ...(s.link ? [['K1','K2',0]] : [])], fixed: s.power ? { K1:s.voltage, P2:0 } : {} };
}
// Ideal wires are collapsed before nodal analysis. Floating components remain null.
export function solve(net, extra = [], override = null) {
  const edges = [...net.edges, ...extra];
  const parent = Object.fromEntries(net.nodes.map(n => [n,n]));
  const root = n => parent[n] === n ? n : (parent[n] = root(parent[n]));
  for (const [a,b,r] of edges) if (r === 0) parent[root(a)] = root(b);
  const nodes = [...new Set(net.nodes.map(root))];
  const resistors = edges.filter(e => e[2] > 0).map(([a,b,r]) => [root(a),root(b),r]);
  const fixed = {};
  for (const [n,v] of Object.entries(override ?? net.fixed)) {
    const r = root(n);
    if (r in fixed && Math.abs(fixed[r]-v) > 1e-9) throw new Error('Conflicting ideal voltage sources');
    fixed[r] = v;
  }
  const reachable = new Set(Object.keys(fixed));
  let changed = true;
  while (changed) {
    changed = false;
    for (const [a,b] of resistors) {
      if (reachable.has(a) && !reachable.has(b)) { reachable.add(b); changed = true; }
      if (reachable.has(b) && !reachable.has(a)) { reachable.add(a); changed = true; }
    }
  }
  const unknown = nodes.filter(n => reachable.has(n) && !(n in fixed));
  const idx = new Map(unknown.map((n,i) => [n,i]));
  const A = unknown.map(() => unknown.map(() => 0));
  const z = unknown.map(() => 0);
  for (const [a,b,r] of resistors) {
    if (a === b) continue;
    const g = 1/r;
    for (const [n,m] of [[a,b],[b,a]]) if (idx.has(n)) {
      const i = idx.get(n); A[i][i] += g;
      if (idx.has(m)) A[i][idx.get(m)] -= g;
      else if (m in fixed) z[i] += g*fixed[m];
    }
  }
  for (let col=0; col<z.length; col++) {
    let pivot = col;
    for (let row=col+1; row<z.length; row++) if (Math.abs(A[row][col]) > Math.abs(A[pivot][col])) pivot = row;
    [A[col],A[pivot]] = [A[pivot],A[col]]; [z[col],z[pivot]] = [z[pivot],z[col]];
    if (Math.abs(A[col][col]) < 1e-15) throw new Error('Singular network');
    const divisor = A[col][col];
    for (let j=col; j<z.length; j++) A[col][j] /= divisor;
    z[col] /= divisor;
    for (let row=0; row<z.length; row++) if (row !== col) {
      const f = A[row][col];
      for (let j=col; j<z.length; j++) A[row][j] -= f*A[col][j];
      z[row] -= f*z[col];
    }
  }
  const voltages = {...fixed};
  unknown.forEach((n,i) => { voltages[n] = z[i]; });
  return { voltage: Object.fromEntries(net.nodes.map(n => [n, voltages[root(n)] ?? null])), root };
}
export function resistance(net, a, b) {
  const base = solve(net, [], {});
  if (base.root(a) === base.root(b)) return 0;
  const result = solve(net, [], {[a]:1,[b]:0});
  let current = 0;
  for (const [x,y,r] of net.edges) if (r > 0) {
    if (result.root(x) === result.root(a) && result.voltage[y] !== null) current += (1-result.voltage[y])/r;
    if (result.root(y) === result.root(a) && result.voltage[x] !== null) current += (1-result.voltage[x])/r;
  }
  return current > 1e-14 ? 1/current : Infinity;
}
function display(value, unit, digits, detail = '') {
  const rounded = Math.abs(value) < 0.5*10**(-digits) ? 0 : value;
  return { value, text: rounded.toFixed(digits).replace('.',','), unit, detail, code:'reading' };
}
export function measure(s) {
  const empty = (text, detail, code='waiting') => ({text,unit:'',value:null,detail,code});
  if (s.trip) return empty('STOPP', s.trip === 'fuse' ? 'mA-säkringen har löst ut. Bryt matningen och lossa båda mätspetsarna före återställning.' : 'Kortslutningsrisk: strömingången gav en väg med mycket låg resistans. Matningen har brutits i simulatorn.', 'tripped');
  const net = network(s);
  const connected = net.nodes.includes(s.red) && net.nodes.includes(s.black);
  const currentJack = s.jack !== 'v';
  let electrical = null;
  let current = 0;
  // A current jack is a low-resistance path even when the selector is on V or OFF.
  if (connected && currentJack && !(s.jack === 'ma' && s.fuse)) {
    const shunt = s.jack === 'ma' ? 1 : 0.1;
    electrical = solve(net, [[s.red,s.black,shunt]]);
    current = ((electrical.voltage[s.red] ?? 0)-(electrical.voltage[s.black] ?? 0))/shunt;
    if (s.power && s.jack === 'ma' && Math.abs(current) > 0.2) return {...empty('STOPP','Strömmen överstiger mA-ingångens 200 mA. Säkringen löser ut i denna modell.','fault'),trip:'fuse'};
    if (s.power && Math.abs(current) > 2) return {...empty('STOPP','Strömingången kortsluter matningen. Modellens skydd bryter vid mer än 2 A.','fault'),trip:'short'};
  }
  if (s.mode === 'off') return empty('—','Välj mätfunktion.');
  if (s.jack === 'ma' && s.fuse) return empty('OL','mA-säkringen är trasig. Återställ den med frånkopplade mätspetsar och bruten matning.','fuse');
  if (!connected) return empty('—','Anslut båda mätspetsarna till märkta mätpunkter.');
  if (currentJack && s.mode !== 'current') return empty('FEL','Fel uttag. Flytta röd sladd till V Ω för denna funktion. A- och mA-uttag kan kortsluta en spänningskälla.','jack');
  if (s.mode === 'current' && !currentJack) return empty('FEL','Strömmätning kräver A- eller mA-uttaget. Bryt matningen innan du kopplar om.','jack');
  if (s.mode === 'current') return s.jack === 'ma' ? display(current*1000,'mA',1,'Ström genom mätarens shunt, 1 Ω i mA-uttaget.') : display(current,'A',3,'Ström genom mätarens shunt, 0,1 Ω i A-uttaget.');
  if (s.mode === 'ohm' || s.mode === 'continuity') {
    if (s.power) return empty('STOPP','Ω och summer använder mätarens egen testström. Frånskilj spänningskällan före mätningen.','live-ohm');
    const r = resistance(net,s.red,s.black);
    if (!Number.isFinite(r)) return empty('OL','Öppen krets: ingen sammanhängande strömväg mellan mätspetsarna.','open');
    if (s.mode === 'continuity') return {...display(r,'Ω',1,r < 30 ? 'Kontakt: summerns gräns är 30 Ω i denna modell.' : 'Ingen ton: resistansen är minst 30 Ω.'),beep:r < 30};
    return r >= 1000 ? display(r/1000,'kΩ',3,'Visar den sammanlagda resistansen mellan mätspetsarna.') : display(r,'Ω',1,'Visar den sammanlagda resistansen mellan mätspetsarna.');
  }
  electrical = solve(net, [[s.red,s.black,s.input]]);
  const a = electrical.voltage[s.red], b = electrical.voltage[s.black];
  const volts = (a ?? 0)-(b ?? 0);
  if (s.mode === 'ac') return display(0,'V ~',2,'Källorna här ger ren likspänning. Modellens AC-kopplade V ~ visar därför 0 V. Välj V ⎓ för likspänning.');
  if (s.range !== 'auto' && Math.abs(volts) >= Number(s.range)) return empty('OL','Mätvärdet överskrider valt spänningsområde. Välj ett högre område eller AUTO.','overrange');
  return display(volts,'V ⎓',2,'Spänning vid röd spets minus spänning vid svart spets.');
}
export function lampCurrent(s) {
  if (s.circuit !== 'lamp' || s.trip) return 0;
  const net = network(s), extra = [];
  if (s.red && s.black && !(s.jack === 'ma' && s.fuse)) extra.push([s.red,s.black,s.jack === 'v' ? s.input : s.jack === 'ma' ? 1 : 0.1]);
  const v = solve(net,extra).voltage;
  return Math.abs(((v.P1 ?? 0)-(v.P2 ?? 0))/s.load);
}
