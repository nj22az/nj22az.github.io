import {STREET_CAST_NAMES,RESIDENTS} from './residents.js';

/**
 * The anchored cast (docs/RESIDENTIAL-PLAN.md §3): everybody who walks the island, with
 * the one record that says where their life is. Thuan and Johansson come first; the key
 * cast is anchored before anybody new is added.
 *
 * `home`, `work` and the hours come from the walking profiles (residents.js), so this
 * record cannot drift from what they actually do. What it adds is the part the profiles
 * leave implicit: who is core and who is key, the day off, and the leisure places they go
 * to when they are not working, by name.
 */
export const CAST_TIERS=Object.freeze({
 core:Object.freeze(['Johansson','Thuan']),
 key:Object.freeze(['Nao','Mrs Sato','Officer Mori','Harbour master']),
 // Kept for now (you asked to keep Aya and Kenji); Reiko and Tetsuo share their yard homes.
 kept:Object.freeze(['Aya','Kenji','Reiko','Tetsuo']),
});

const LIFE=Object.freeze({
 Thuan:{dayOff:'Wednesday',leisure:['Minato izakaya with Nao after closing','Umi-no-yu rock bath','the beach corner chairs']},
 Nao:{dayOff:'Monday',leisure:['the morning market','Umi-no-yu']},
 'Mrs Sato':{dayOff:'Sunday',leisure:['the fish auction at nine','Kitahama pocket park bench']},
 'Officer Mori':{dayOff:'Thursday',leisure:['the seawall with a fishing rod','Sato Ramen at lunch']},
 'Harbour master':{dayOff:'Sunday',leisure:['Mr Fujita’s shed on the pier, for the ballgame','the quay at dusk']},
 Aya:{dayOff:'Tuesday',leisure:['the window chair at Front-Row','the beach']},
 Kenji:{dayOff:'Sunday',leisure:['Star Port at the arcade cabinet','Minato']},
 Reiko:{dayOff:'Sunday',leisure:['Front-Row print bench (she cannot help it)','Umi-no-yu']},
 Tetsuo:{dayOff:'Monday',leisure:['the pier with his radio','Minato']},
});

const tierOf=name=>Object.entries(CAST_TIERS).find(([,names])=>names.includes(name))?.[0]||null;

/** The anchored record for each walking resident. Read it after the town mode is set. */
export function anchoredCast(){
 return STREET_CAST_NAMES.map(name=>{
  const p=RESIDENTS.find(r=>r.name===name);
  return Object.freeze({name,tier:tierOf(name),
   home:{door:[...p.home],address:p.homeAddress},
   work:{at:[...p.work],from:p.start,until:p.close},
   evening:{at:[...p.evening]},
   bed:p.retire,
   ...LIFE[name]});
 });
}
