const finite = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;
const clamp = (value, min, max) => Math.max(min, Math.min(max, finite(value)));
export const DEFAULT_BINDINGS = Object.freeze(Array.from({length: 17}, (_, i) => i));
export function profileSettings(saved = {}) {
  const index = (value, fallback) => Number.isInteger(value) && value >= 0 && value < 64 ? value : fallback;
  return {
    moveAxes: [index(saved.moveAxes?.[0], 0), index(saved.moveAxes?.[1], 1)],
    lookAxes: [index(saved.lookAxes?.[0], 2), index(saved.lookAxes?.[1], 3)],
    bindings: DEFAULT_BINDINGS.map((value, i) => index(saved.bindings?.[i], value)),
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
export function createDesktopInput(getProfile) {
  let previous = null, identity = '', selected = '';
  const empty = () => ({connected: false, move: {x: 0, y: 0}, look: {x: 0, y: 0}, held: [], pressed: [], zoom: 0});
  function read(pads = [], deadzone = .16) {
    const profile = profileSettings(getProfile());
    const available = Array.from(pads || []).filter(p => p?.connected && p.buttons?.length >= 2);
    const pad = available.find(p => p.id === profile.controller) || available.find(p => p.index + ':' + p.id === selected) || available.find(p => p.mapping === 'standard') || available[0];
    if (!pad) return {...empty(), pad: null};
    selected = pad.index + ':' + pad.id;
    const buttons = profile.bindings.map(i => pad.buttons[i] || {pressed: false, value: 0});
    return {
      connected: true, pad,
      move: radialStick(pad.axes[profile.moveAxes[0]], pad.axes[profile.moveAxes[1]], deadzone),
      look: radialStick(pad.axes[profile.lookAxes[0]], pad.axes[profile.lookAxes[1]], deadzone),
      held: buttons.map(b => b.pressed || b.value > .55),
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
