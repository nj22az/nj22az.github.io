import {driverLayout, standardPad} from './pad-layout.mjs';
const finite = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;
const clamp = (value, min, max) => Math.max(min, Math.min(max, finite(value)));
export const DEFAULT_BINDINGS = Object.freeze([0,1,5,3,7,2,4,6,8,9,13,11,12,10,14,15,16]);
export function profileSettings(saved = {}) {
  const index = (value, fallback) => Number.isInteger(value) && value >= 0 && value < 64 ? value : fallback;
  return {
    moveAxes: [index(saved.moveAxes?.[0], 0), index(saved.moveAxes?.[1], 1)],
    lookAxes: [index(saved.lookAxes?.[0], 2), index(saved.lookAxes?.[1], 3)],
    bindings: DEFAULT_BINDINGS.map((value, i) => index(saved.bindings?.[i], value)),
    glyphs: ['auto','deck','xbox','playstation','nintendo','positions'].includes(saved.glyphs) ? saved.glyphs : 'auto',
    controller: typeof saved.controller === 'string' ? saved.controller : '',
  };
}
export function radialStick(x, y, deadzone = .16) {
  x = clamp(x, -1, 1); y = clamp(y, -1, 1);
  const length = Math.hypot(x, y), d = clamp(deadzone, .05, .45);
  if (length <= d) return {x: 0, y: 0};
  const scale = (Math.min(1, length) - d) / (1 - d) / length;
  return {x: x * scale, y: y * scale};
}
// The Linux package targets Steam Deck through Steam Input's standard virtual pad.
// Saved experimental remaps never change its physical controls.
export function steamDeckProfile() { return {...profileSettings(), glyphs: 'deck'}; }
export function createDesktopInput(getProfile, {steamDeck = false} = {}) {
  let previous = null, identity = '', selected = '';
  // Per connected pad: its axes when first seen (to tell resting triggers from
  // sticks) and its buttons last read (to notice which pad is being used).
  const seen = new Map();
  const empty = () => ({connected: false, move: {x: 0, y: 0}, look: {x: 0, y: 0}, held: [], pressed: [], zoom: 0});
  function read(pads = [], deadzone = .16) {
    const profile = steamDeck ? steamDeckProfile() : profileSettings(getProfile());
    const connected = Array.from(pads || []).filter(p => p?.connected && p.buttons?.length >= 2 && (!steamDeck || (p.mapping === 'standard' && p.axes?.length >= 4 && p.buttons.length >= 16)));
    for (const key of seen.keys()) if (!connected.some(p => p.index + ':' + p.id === key)) seen.delete(key);
    let used = null;
    const available = connected.map(raw => {
      const key = raw.index + ':' + raw.id;
      if (!seen.has(key)) seen.set(key, {rest: Array.from(raw.axes || []), held: []});
      const memory = seen.get(key), pad = steamDeck ? raw : standardPad(raw, driverLayout(raw, memory.rest));
      const held = Array.from(pad.buttons, b => !!b?.pressed);
      const axisActive = steamDeck && Array.from(pad.axes).slice(0,4).some(a => Math.abs(a) > .3);
      if (held.some((down, i) => down && !memory.held[i]) || (axisActive && !memory.axisActive)) used ??= key;
      memory.axisActive = axisActive;
      memory.held = held;
      return pad;
    });
    // A pad that connects late, or the real pad beside Steam's virtual one, takes
    // over with its first press while the one being read is idle.
    const current = available.find(p => p.index + ':' + p.id === selected);
    if (used && used !== selected && !current?.buttons.some(b => b?.pressed || b?.value > .55) && (!steamDeck || !Array.from(current?.axes || []).slice(0,4).some(a => Math.abs(a) > .3))) selected = used;
    const pad = available.find(p => p.id === profile.controller) || available.find(p => p.index + ':' + p.id === selected) || available.find(p => p.mapping === 'standard') || available[0];
    if (!pad) return {...empty(), pad: null};
    selected = pad.index + ':' + pad.id;
    const buttons = profile.bindings.map(i => pad.buttons[i] || {pressed: false, value: 0});
    // A pair saved for a pad's raw layout (the xpad right stick is axes 3 and 4)
    // can point past the four standard axes it is read as now: use the default.
    const axes = (pair, fallback) => pair.every(i => i < pad.axes.length) ? pair : fallback;
    const [mx, my] = axes(profile.moveAxes, [0, 1]), [lx, ly] = axes(profile.lookAxes, [2, 3]);
    return {
      connected: true, pad,
      move: radialStick(pad.axes[mx], pad.axes[my], deadzone),
      look: radialStick(pad.axes[lx], pad.axes[ly], deadzone),
      held: buttons.map(b => b.pressed || b.value > .55),
      navigation: Array.from(pad.buttons,b=>!!b.pressed||b.value>.55),
      zoom: clamp(buttons[7]?.value, 0, 1),
    };
  }
  return {
    read,
    suspend() { previous = null; },
    sample(pads, deadzone) {
      const frame = read(pads, deadzone);
      if (!frame.connected) { previous = null; identity = ''; return empty(); }
      const key = frame.pad.index + ':' + frame.pad.id;
      if (identity !== key) { identity = key; previous = null; }
      const pressed = frame.held.map((held, i) => previous !== null && held && !previous[i]);
      previous = frame.held.slice();
      // Axes work immediately. Each held button must be released before it can
      // fire after reconnect/resume; stick drift cannot lock out the entire pad.
      const {pad, ...result} = frame;
      return {...result, pressed};
    },
  };
}

const DECK=['A','B','X','Y','L1','R1','L2','R2','▣','☰','L3','R3','↑','↓','←','→','Steam'];
const XBOX=['A','B','X','Y','LB','RB','LT','RT','View','Menu','L3','R3','↑','↓','←','→','Guide'];
const PLAYSTATION=['×','○','□','△','L1','R1','L2','R2','Create','Options','L3','R3','↑','↓','←','→','PS'];
const NINTENDO=['B','A','Y','X','L','R','ZL','ZR','−','+','L3','R3','↑','↓','←','→','Home'];
const POSITIONS=['Bottom','Right','Left','Top','L1','R1','L2','R2','View','Menu','L3','R3','↑','↓','←','→','Guide'];
const SETS={deck:DECK,xbox:XBOX,playstation:PLAYSTATION,nintendo:NINTENDO,positions:POSITIONS};
export function controllerFamily(id='',override='auto'){
 if(SETS[override])return override;
 // Steam Input can intentionally expose a virtual Xbox pad. Respect the device
 // the browser actually reports; offer an override for that translation layer.
 if(/Steam.?Deck|Valve.*(Neptune|Jupiter)|Neptune.*Valve/i.test(id))return 'deck';
 if(/DualSense|DualShock|PlayStation|PS[345] Controller|054c|Sony/i.test(id))return 'playstation';
 if(/Nintendo|Switch.*Pro|Pro Controller|Joy.?Con|057e/i.test(id))return 'nintendo';
 if(/Xbox|XInput|045e|Microsoft/i.test(id))return 'xbox';
 return 'positions';
}
export function physicalGlyph(index,profile={},id=''){
 const family=controllerFamily(id,profile.glyphs);
 return SETS[family][index]||'Button '+index;
}
export function buttonGlyph(action,profile={},id=''){const p=profileSettings(profile);return physicalGlyph(p.bindings[action],p,id);}
export function buttonPrompt(action,profile={},id='',physical=false){
 const p=profileSettings(profile),index=physical?action:p.bindings[action],family=controllerFamily(id,p.glyphs);
 if(family!=='positions'||index>3)return physicalGlyph(index,p,id);
 const points=[[22,34],[34,22],[10,22],[22,10]];
 return `<svg class="console-button-diamond" viewBox="0 0 44 44" role="img" aria-label="${POSITIONS[index]} face button">${points.map(([x,y],i)=>`<circle cx="${x}" cy="${y}" r="7" fill="${i===index?'#e84d6b':'#d0daef'}" stroke="${i===index?'#ffffff':'#7285ad'}" stroke-width="${i===index?2:1}"/>`).join('')}</svg>`;
}
