// Stillbilder av motorlabbets bänk till kursens figurer (verktyg/figurer/figurer3d.py).
// rendera.html?visa=M&pos=x,y,z&mal=x,y,z&fov=30&w=1000&h=700&s=<JSON med tillstånd>
import { mount } from './scen.js';
const q = new URLSearchParams(location.search);
const tal = (k) => q.get(k).split(',').map(Number);
const s = {
  bleck: [], losa: [], prob: {}, sprob: {}, visningM: '', visningS: '', utlost: false, tang: { lage: 'ute', pa: false, visning: '' },
  ...JSON.parse(q.get('s') || '{}'),
};
const el = document.getElementById('yta');
const scen = mount(el, { bild: true });
scen.set(s);
window.RESULTAT = scen.bild({
  visa: (q.get('visa') || 'M,S,T').split(','), bank: q.get('bank') !== '0', stangd: q.get('lock') === '1', pos: tal('pos'), mal: tal('mal'),
  fov: +q.get('fov') || 30, w: +q.get('w') || 1000, h: +q.get('h') || 700,
});
