// Chromium maps the controllers it knows to the standard Gamepad layout. A pad it
// does not know (often a Bluetooth pad on Linux, whose product id differs from the
// cable's) arrives with mapping '' in its driver's order: buttons by key code, the
// triggers as axes resting at -1 and the D-pad as a hat on two axes. Read as if it
// were standard, the camera turns on its own (a resting trigger is a full stick)
// and Menu and the D-pad do nothing. The driver layouts below are turned into the
// standard one, so the defaults, prompts and remaps mean the same on every pad.

// Standard index (0 bottom, 1 right, 2 left, 3 top, 4 L1, 5 R1, 6 L2, 7 R2, 8 View,
// 9 Menu, 10 L3, 11 R3, 12-15 D-pad, 16 Home) -> the driver's button, by how many
// buttons the driver reports. -1 is filled from an axis (triggers, hat).
const DRIVER_BUTTONS = {
  11: [0,1,2,3,4,5,-1,-1,6,7,9,10,-1,-1,-1,-1,8],  // xpad and xpadneo (Xbox): A B X Y LB RB View Menu Guide L3 R3
  12: [0,1,2,3,4,5,-1,-1,6,7,9,10,-1,-1,-1,-1,8],  // the same with Share after them
  13: [0,1,3,2,4,5,6,7,8,9,11,12,-1,-1,-1,-1,10],  // hid-playstation (DualShock 4, DualSense): × ○ △ □ …
  14: [0,1,3,2,5,6,7,8,9,10,12,13,-1,-1,-1,-1,11], // hid-nintendo (Switch Pro): B A X Y Capture L R ZL ZR − + Home
  15: [0,1,3,4,6,7,8,9,10,11,13,14,-1,-1,-1,-1,12], // hid-generic with the C and Z gaps (Xbox over Bluetooth, 8BitDo)
};
const resting = v => Number.isFinite(v) && v <= -.9;

// rest: the axes as first seen, when nothing is usually held. A pad is first shown
// to the page on a button press, so a trigger resting at -1 is still at rest then.
export function driverLayout(pad, rest = pad.axes) {
  const buttons = DRIVER_BUTTONS[pad.buttons?.length];
  if (pad.mapping === 'standard' || !buttons) return null;
  const count = pad.axes?.length || 0;
  // xpad and hid-playstation: X Y Z(L2) RX RY RZ(R2); hid-generic: X Y Z RZ GAS BRAKE.
  const triggers = count < 6 ? [] : resting(rest[2]) || resting(rest[5]) ? [2,5] : resting(rest[4]) && resting(rest[5]) ? [5,4] : [];
  const sticks = Array.from({length: count}, (_, i) => i).filter(i => !triggers.includes(i));
  return {buttons, triggers, sticks: sticks.slice(0, 4), hat: sticks.length >= 6 ? sticks.slice(4, 6) : []};
}

const button = (pressed, value = pressed ? 1 : 0) => ({pressed, value, touched: pressed});
export function standardPad(pad, layout) {
  if (!layout) return pad;
  const axis = i => Number.isFinite(pad.axes[i]) ? pad.axes[i] : 0;
  const trigger = i => {const value = Math.max(0, Math.min(1, (axis(i) + 1) / 2)); return button(value > .55, value);};
  const [hx, hy] = layout.hat.map(axis);
  const hat = [hy < -.5, hy > .5, hx < -.5, hx > .5];
  const buttons = layout.buttons.map((raw, i) => {
    if (raw >= 0) return pad.buttons[raw] || button(false);
    if ((i === 6 || i === 7) && layout.triggers.length) return trigger(layout.triggers[i - 6]);
    if (i >= 12 && i <= 15) return button(!!hat[i - 12]);
    return button(false);
  });
  return {id: pad.id, index: pad.index, connected: pad.connected, timestamp: pad.timestamp, mapping: 'standard', driverMapping: pad.mapping, axes: layout.sticks.map(axis), buttons};
}
