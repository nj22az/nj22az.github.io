/*
 * Sakura Shōten's jingles, played on the Johansson PF-82 (the owner, 3 November 2026: "render the Sakura konbini
 * jingles with the PF-82, put it needs to be fun and playful and fitting").
 *
 * Each has a moment in Sakura's real day (johansson-town/src/commerce/sakura-rota.js: open 09:00, the till until
 * 20:00, the restock and the shutter at 20:30, shut on Saturdays), a place, and a reason, kept with its notes so it
 * can be tested and stories can use it. Minato is an Okinawan town, so every tune keeps to the Ryukyu scale
 * (C E F G B, the scale of Okinawan island songs). All five melodies are original: no shop chain's door melody or
 * jingle is imitated. Songs are written in the PF-82's notation (see polivoks/songs.js and polivoks/agent.js).
 */

export const RYUKYU = Object.freeze([0, 4, 5, 7, 11]); // pitch classes C E F G B

export const JINGLES = Object.freeze([
  {
    id: 'sakura-door', title: 'Door melody', seconds: [1, 2.6],
    when: 'Every time someone steps through Sakura’s door, coming in or going out, while the shop is open.',
    where: 'Ground floor, over the door; Thuan hears it from the small office through the open door (interiors/sakura-small-office.js).',
    why: 'A bright four-note climb that lands up the octave and steps back: a welcome in the island scale, short enough never to talk over Thuan’s irasshaimase.',
    song: {
      title: 'Sakura Shōten · door', bpm: 150, meter: 4, gate: 0.9,
      score: 'C5:1/2 E5 G5 B5 C6:1 G5:1 |',
      patch: 'init',
      set: { 'vco1.wave': 'tri', 'vco2.wave': 'square', 'vco2.oct': 1, 'mix.vco1': 0.8, 'mix.vco2': 0.35, 'flt.frq': 0.72, 'flt.res': 0.72, 'flt.cv1': 0.64, 'flt.lvl': 0.55,
        'eg1.a': 0, 'eg1.d': 0.38, 'eg1.s': 0.15, 'eg1.r': 0.4, 'eg2.a': 0.01, 'eg2.d': 0.5, 'eg2.s': 0.25, 'eg2.r': 0.45, 'glob.track': 0.5, 'glob.volume': 0.8 },
    },
  },
  {
    id: 'sakura-till', title: 'Till “pi-pon”', seconds: [0.3, 0.9],
    when: 'When a sale goes through Sakura’s till, from 09:00 until the till closes at 20:00.',
    where: 'At the counter, from the register.',
    why: 'Two notes, the fifth stepping up to the home note: the cheerful “pi-pon” of a 1990s register, so a purchase sounds finished.',
    song: {
      title: 'Sakura Shōten · till', bpm: 120, meter: 0.75, gate: 0.85,
      score: 'G5:1/4 C6:1/2 |',
      patch: 'init',
      set: { 'vco1.wave': 'square', 'vco2.wave': 'tri', 'mix.vco2': 0.5, 'flt.frq': 0.8, 'flt.res': 0.6, 'flt.cv1': 0.6,
        'eg1.d': 0.3, 'eg1.s': 0.2, 'eg2.a': 0, 'eg2.d': 0.4, 'eg2.s': 0.2, 'eg2.r': 0.35, 'glob.volume': 0.75 },
    },
  },
  {
    id: 'sakura-ident', title: 'Shop jingle', seconds: [6, 9],
    when: 'Between songs on the shop’s radio while Sakura is open.',
    where: 'Inside the shop, from the radio by the counter.',
    why: 'The hook sings the shop’s name in its first five notes, sa-ku-ra-shō-ten, with the kachāshī swing of the Okinawan dance; it climbs once more and comes home, so it is fun to hum and easy to know.',
    song: {
      title: 'Sakura Shōten · shop jingle', bpm: 132, meter: 4, gate: 0.78,
      score: 'C5:2/3 E5:1/3 F5:2/3 G5:1/3 B5:1 C6:1 | B5:2/3 G5:1/3 F5:2/3 E5:1/3 F5:1 G5:1 | '
        + 'C5:2/3 E5:1/3 F5:2/3 G5:1/3 B5:2/3 C6:1/3 E6:1 | C6:2/3 B5:1/3 G5:2/3 E5:1/3 C5:2 |',
      patch: 'scream',
      set: { 'flt.res': 0.84, 'flt.frq': 0.66, 'flt.cv1': 0.62, 'flt.lvl': 0.62, 'glob.glide': 0.12, 'glob.legato': 'off', 'lfo.pitch': 0.08, 'lfo.rate': 0.6,
        'eg1.a': 0.05, 'eg1.d': 0.45, 'eg1.s': 0.3, 'eg2.a': 0.02, 'eg2.d': 0.45, 'eg2.s': 0.6, 'eg2.r': 0.25, 'glob.volume': 0.7 },
    },
  },
  {
    id: 'sakura-open', title: 'Good morning', seconds: [3.5, 5.5],
    when: 'At 09:00 as the shutter goes up: Thuan on weekdays, Nhung on Sundays, never on Saturday, the closing day.',
    where: 'At the shop front, heard from the street.',
    why: 'A rising arpeggio and a warm landing, slow to open like the filter: the street’s morning wake-up call.',
    song: {
      title: 'Sakura Shōten · good morning', bpm: 120, meter: 4, gate: 0.9,
      score: 'C4:1/2 E4 G4 B4 C5:1 E5:1 | F5:1/2 E5 C5 B4 C5:2 |',
      patch: 'duo',
      set: { 'glob.mode': 'mono', 'vco2.detune': 0.54, 'mix.vco2': 0.45, 'flt.frq': 0.62, 'flt.res': 0.6, 'eg1.a': 0.3, 'eg1.d': 0.5, 'eg1.s': 0.55, 'eg2.a': 0.08, 'eg2.s': 0.85, 'eg2.r': 0.45, 'glob.volume': 0.7 },
    },
  },
  {
    id: 'sakura-closing', title: 'Closing waltz', seconds: [25, 40], loop: true,
    when: 'From 20:00, when the till closes, through the last half hour’s restock to the shutter at 20:30, looping.',
    where: 'Inside the shop.',
    why: 'Japanese shops play music at closing to say “finish up, kindly”; Sakura’s is a soft waltz in the island scale, a music box rather than a bell, so nobody feels hurried out.',
    song: {
      title: 'Sakura Shōten · closing waltz', bpm: 96, meter: 3, gate: 0.95,
      score: 'E5:2 G5:1 | F5:1 E5:1 C5:1 | B4:2 C5:1 | E5:3 | G5:2 B5:1 | C6:1 B5:1 G5:1 | F5:2 E5:1 | F5:3 | '
        + 'E5:2 G5:1 | F5:1 E5:1 C5:1 | B4:2 G4:1 | C5:3 | G5:1 F5:1 E5:1 | F5:1 E5:1 C5:1 | B4:2 C5:1 | C5:3 |',
      patch: 'init',
      set: { 'vco1.wave': 'tri', 'vco2.wave': 'tri', 'vco2.oct': 1, 'mix.vco2': 0.3, 'flt.frq': 0.62, 'flt.res': 0.55, 'flt.cv1': 0.58,
        'eg1.a': 0.02, 'eg1.d': 0.5, 'eg1.s': 0.3, 'eg2.a': 0.02, 'eg2.d': 0.55, 'eg2.s': 0.35, 'eg2.r': 0.6, 'lfo.pitch': 0.05, 'lfo.rate': 0.4, 'glob.volume': 0.75 },
    },
  },
].map(Object.freeze));
