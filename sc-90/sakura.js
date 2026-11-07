/*
 * Sakura Shōten's jingles, for the Johansson SC-90 sound chip (chip.js).
 *
 * The owner, 3 November 2026, on the first versions (played on the PF-82, in the Ryukyu scale): "no its a bit too
 * difficult, to listen too .. .it needs to be more like Koji Kondo, pleasing for the ears", then "maybe for sakura we
 * can use something similar to MUSE ? or retro Sound systems?". So: a retro four-voice chip, and the bright, singable
 * manner of 1980s and 1990s game music: a major key, a hook you can hum, harmony in thirds and sixths, a bouncing bass,
 * clear cadences. The manner only: every melody here is new, and none quotes a game, a composer or a shop chain.
 *
 * All five are in C, the shop's key, and share one motif, the shop's name sung on the Japanese major pentatonic
 * (yonanuki, the scale of Japanese children's songs): "sa-ku-ra shō-ten" = E G A G C. Each jingle keeps its moment in
 * Sakura's real day (johansson-town/src/commerce/sakura-rota.js: open 09:00, the till until 20:00, the restock and the
 * shutter at 20:30, shut on Saturdays), its place and its reason, so it can be tested and stories can use it.
 *
 * chords: one entry per bar; a bar with two chords splits evenly. At every beat the melody, the harmony and the bass
 * sound a note of the chord (tests/jingles.test.mjs), so nothing grates.
 */

export const KEY = Object.freeze({ tonic: 0, scale: [0, 2, 4, 5, 7, 9, 11] }); // C major
export const MOTIF = 'E5 G5 A5 G5 C6'; // sa-ku-ra shō-ten

/* The sounds, shared so the shop sounds like one shop. Envelope times in seconds. */
const LEAD = { voice: 'pulse1', duty: 0.25, gain: 0, gate: 0.92, env: { a: 0.003, d: 0.35, s: 0.55, r: 0.09 }, vibrato: { delay: 0.22, depth: 0.12, rate: 5.6 } };
const SECOND = { voice: 'pulse2', duty: 0.125, gain: -6, gate: 0.92, env: { a: 0.003, d: 0.35, s: 0.5, r: 0.09 } };
const BASS = { voice: 'triangle', gain: -1, gate: 0.82, env: { a: 0.002, d: 0.5, s: 0.9, r: 0.03 } };
const BELL = { a: 0.002, d: 0.9, s: 0, r: 0.25 };

export const JINGLES = Object.freeze([
  {
    id: 'sakura-door', title: 'Door chime', seconds: [1.4, 2.4],
    when: 'Every time someone steps through Sakura’s door, coming in or going out, while the shop is open.',
    where: 'Ground floor, over the door; Thuan hears it from the small office through the open door (interiors/sakura-small-office.js).',
    why: 'The shop’s name sung once, “sa-ku-ra shō-ten”: four notes climbing and a happy landing on the high note, with a sweet second voice just below and a soft bass. Short enough never to talk over Thuan’s irasshaimase.',
    bpm: 150, meter: 4, bars: 1, swing: 0.5, chords: ['C F G C'],
    voices: {
      melody: { ...LEAD, env: { ...LEAD.env, d: 0.45, s: 0.4, r: 0.18 }, score: 'E5:1/2 G5:1/2 A5:1/2 G5:1 C6:3/2 |' },
      harmony: { ...SECOND, env: { ...SECOND.env, d: 0.45, s: 0.35, r: 0.18 }, score: 'C5:1/2 E5:1/2 F5:1/2 D5:1 E5:3/2 |' },
      bass: { ...BASS, gain: -4, score: 'C3:1 F2:1 G2:1 C3:1 |' },
    },
  },
  {
    id: 'sakura-till', title: 'Till “pi-pon”', seconds: [0.4, 1.2],
    when: 'When a sale goes through Sakura’s till, from 09:00 until the till closes at 20:00.',
    where: 'At the counter, from the register.',
    why: 'Two bell notes, a cheerful leap up with a second voice ringing under the top one: a bright “pi-pon”, so a purchase sounds finished.',
    bpm: 150, meter: 1, bars: 1, swing: 0.5, chords: ['C'],
    voices: {
      melody: { ...LEAD, duty: 0.5, gate: 1, env: BELL, vibrato: null, score: 'G5:1/4 E6:3/4 |' },
      harmony: { ...SECOND, duty: 0.25, gate: 1, gain: -7, env: BELL, score: 'R:1/4 C6:3/4 |' },
    },
  },
  {
    id: 'sakura-ident', title: 'Shop jingle', seconds: [7, 9.5],
    when: 'Between songs on the shop’s radio while Sakura is open.',
    where: 'Inside the shop, from the radio by the counter.',
    why: 'The shop’s tune sung out in full: “sa-ku-ra shō-ten”, its answer, a quick run up and home. A bouncing bass, a light skipping beat and an echo on the second voice; easy to hum after one hearing.',
    bpm: 132, meter: 4, bars: 4, swing: 0.6, chords: ['C6', 'Am', 'Dm G7', 'C'],
    voices: {
      melody: { ...LEAD, score: 'E5:1/2 G5:1/2 A5:1/2 G5:1 C6:3/2 | C6:1/2 B5:1/2 A5:1/2 E5:1 A5:3/2 | D6:1/2 C6 A5 F5 G5 A5 B5 D6 | C6:1 G5:1/2 E5:1/2 C6:2 |' },
      echo: { ...SECOND, gain: -10, echo: { of: 'melody', delay: 0.17 } },
      bass: { ...BASS, score: 'C3:1 G2 E3 G2 | A2 E3 C3 E3 | D3 F3 G2 B2 | C3:1 G2:1 C2:2 |' },
      drums: { voice: 'noise', gain: -9, score: 'C2:1/2 F#2 D2 F#2 C2 F#2 D2 F#2 | C2 F#2 D2 F#2 C2 F#2 D2 F#2 | C2 F#2 D2 F#2 C2 F#2 D2 F#2 | C2 F#2 D2 F#2 C2:1 A#2:1 |' },
    },
  },
  {
    id: 'sakura-open', title: 'Good morning', seconds: [4, 6],
    when: 'At 09:00 as the shutter goes up: Thuan on weekdays, Nhung on Sundays, never on Saturday, the closing day.',
    where: 'At the shop front, heard from the street.',
    why: 'A sunrise: the tune climbs step by step with a second voice alongside, over a walking bass, and lands warmly on the high note. Gentle, no drums, for a street still waking up.',
    bpm: 108, meter: 4, bars: 2, swing: 0.5, chords: ['C F', 'G C'],
    voices: {
      melody: { ...LEAD, duty: 0.5, env: { a: 0.02, d: 0.6, s: 0.7, r: 0.25 }, vibrato: { delay: 0.3, depth: 0.14, rate: 5.2 }, score: 'C5:1/2 D5:1/2 E5:1/2 G5:1/2 A5:3/2 C6:1/2 | D6:1 B5:1/2 G5:1/2 C6:2 |' },
      harmony: { ...SECOND, duty: 0.25, gain: -7, env: { a: 0.02, d: 0.6, s: 0.6, r: 0.25 }, score: 'E4:1/2 F4:1/2 G4:1/2 B4:1/2 C5:3/2 F5:1/2 | B5:1 G5:1/2 D5:1/2 E5:2 |' },
      bass: { ...BASS, gate: 0.9, score: 'C3:1 G2 F2 A2 | G2 B2 C3:2 |' },
    },
  },
  {
    id: 'sakura-closing', title: 'Closing waltz', seconds: [28, 32], loop: true,
    when: 'From 20:00, when the till closes, through the last half hour’s restock to the shutter at 20:30, looping.',
    where: 'Inside the shop.',
    why: 'Japanese shops play music at closing to say “finish up, kindly”. Sakura’s is a music-box waltz on the shop’s motif, sixteen bars over oom-pa-pa that end at home each time, so it can go round and round and nobody feels hurried out.',
    bpm: 96, meter: 3, bars: 16, swing: 0.5,
    chords: ['C', 'Am', 'Fmaj7', 'G', 'C', 'Am', 'Dm7', 'G', 'F', 'C', 'Dm7', 'G', 'C', 'Am', 'G7', 'C'],
    voices: {
      melody: { ...LEAD, duty: 0.5, gate: 0.95, env: { a: 0.002, d: 0.8, s: 0.12, r: 0.3 }, vibrato: null,
        score: 'E5:2 G5:1 | A5:2 E5:1 | C6:1 A5:1 E5:1 | G5:3 | E5:2 G5:1 | A5:2 C6:1 | D6:2 C6:1 | B5:2 G5:1 | '
          + 'C6:2 A5:1 | G5:2 E5:1 | F5:1 A5:1 C6:1 | B5:2 G5:1 | E5:2 G5:1 | A5:2 E5:1 | F5:1 D5:1 B4:1 | C5:3 |' },
      accomp: { ...SECOND, duty: 0.25, gain: -9, gate: 0.6, env: { a: 0.002, d: 0.3, s: 0.2, r: 0.1 },
        score: 'R:1 E4:1 G4:1 | R:1 E4:1 A4:1 | R:1 F4:1 A4:1 | R:1 D4:1 G4:1 | R:1 E4:1 G4:1 | R:1 E4:1 A4:1 | R:1 F4:1 A4:1 | R:1 D4:1 G4:1 | '
          + 'R:1 F4:1 A4:1 | R:1 E4:1 G4:1 | R:1 F4:1 A4:1 | R:1 D4:1 G4:1 | R:1 E4:1 G4:1 | R:1 E4:1 A4:1 | R:1 D4:1 G4:1 | R:1 E4:1 G4:1 |' },
      bass: { ...BASS, gate: 0.85, gain: -2, score: 'C3:1 R:2 | A2:1 R:2 | F2:1 R:2 | G2:1 R:2 | C3:1 R:2 | A2:1 R:2 | D3:1 R:2 | G2:1 R:2 | '
        + 'F2:1 R:2 | C3:1 R:2 | D3:1 R:2 | G2:1 R:2 | C3:1 R:2 | A2:1 R:2 | G2:1 R:2 | C3:1 R:2 |' },
    },
  },
].map(Object.freeze));

/* Chord symbols the jingles use, as pitch classes. */
export const CHORDS = Object.freeze({
  C: [0, 4, 7], C6: [0, 4, 7, 9], Am: [9, 0, 4], F: [5, 9, 0], Fmaj7: [5, 9, 0, 4], G: [7, 11, 2], G7: [7, 11, 2, 5],
  Dm: [2, 5, 9], Dm7: [2, 5, 9, 0], Em: [4, 7, 11],
});
