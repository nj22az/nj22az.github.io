import {OUTER_PIER} from './layout.js';

/**
 * The Minato Maru's berth at Minato: the outer pier's west face fitted out for the bigger ship
 * (docs/FERRY-AUDIT.md §6, batch 4a; briefs/ferry-audit.md §6.1), and the anglers' corner at the
 * pier's new end. What stands where, and why; town.js builds it, ferry-paths.js lays her alongside it.
 *
 * World frame: x east, z north (the pier runs south, to −z, from the quay at z −49.65 to −88).
 * The 34.5 m ship lies here with her stem at z −52 and her stern at −86.5; today's 22 m ship lies
 * on the same fenders from −50.5 to −72.5 until she is replaced (batch 5).
 */
const WEST=OUTER_PIER.x-OUTER_PIER.width/2;
/** The coping's outer face along the west flank (the coping beam stands 0.09 m proud of the slab). */
const FACE=WEST-.09;
const PIER_END=OUTER_PIER.z-OUTER_PIER.length/2;

export const MINATO_BERTH=Object.freeze({
 face:FACE,
 /**
  * V-type rubber fenders (V型防舷材, 250 mm high, 1 m long) bolted upright to the coping face at 4 m
  * centres, from just under the deck edge to 0.4 m below the water, so they take her side at any
  * tide. Nine of them span her length; the 22 m ship lies on the first six.
  */
 fenders:Object.freeze({depth:.25,length:1,base:.52,front:.26,top:.04,z:Object.freeze([-52,-56,-60,-64,-68,-72,-76,-80,-84])}),
 /** The line her side lies on: the faces of the fenders. */
 line:FACE-.25,
 /**
  * Cast-iron bitts (曲柱) 0.45 m in from the face, one for each of her lines: the head line from the
  * bow, the forward spring leading aft from the bow, the after spring leading forward from the stern,
  * the stern line from the stern. The forward spring's bitt stands at −62, a metre clear of the
  * 22 m ship's gangway (z −63.5), which lands between it and the queue.
  */
 bitts:Object.freeze([
  Object.freeze({z:-53,line:'head line'}),
  Object.freeze({z:-62,line:'forward spring'}),
  Object.freeze({z:-77,line:'after spring'}),
  Object.freeze({z:-87,line:'stern line'}),
 ].map(b=>Object.freeze({...b,x:WEST+.45}))),
 /** A steel ladder recessed into the face between two fenders: the way up for anyone who falls in between ship and pier. */
 ladder:Object.freeze({z:-66,width:.5,bottom:-1.9}),
 /** Pier lamps on the centreline: the old one, and one more over the new length and her gangway. */
 lamps:Object.freeze([-63.25,-79.5]),
 /** The new end: its rail across the pier, and how far out you can walk (layout.js OUTER_PIER.open: the rail, less the lifebuoy on it). */
 end:Object.freeze({z:PIER_END,rail:PIER_END+.4,walk:OUTER_PIER.open}),
 /**
  * The anglers' corner at the end, where the fishing is: the bait station (bait and ice), the winch
  * at the east edge (it hauls a basket or a skiff up from the water), the anglers' crates, the coiled
  * rope, and a lifebuoy hung on the end rail among them. All of it east of the stern line's bitt, out
  * of her lines, with room between for the anglers.
  */
 anglers:Object.freeze({
  bait:Object.freeze([-1.75,PIER_END+2.75]),
  winch:Object.freeze([3,PIER_END+3.6]),
  crates:Object.freeze([-3.05,PIER_END+4.2]),
  rope:Object.freeze([1.05,PIER_END+1]),
  fishing:Object.freeze([0,PIER_END+1.2]),
  lifebuoy:Object.freeze([-.45,PIER_END+.53]),
 }),
 /**
  * The ramp's landing on the quay: a steel plate laid flush in the quay's edge where the raised
  * coping and kerb are cut away, wide enough for the 4.4 m ramp of the 34.5 m ship (x −10.84 to −6.44)
  * and today's 3.8 m one (−9.54 to −5.74), so the ramp's toe rests on steel and the cars drive off
  * level, not over a kerb. Nothing stands on it.
  */
 landing:Object.freeze({minX:-10.95,maxX:-5.55,minZ:-49.975,maxZ:-46.9}),
 /** The quay bollard for her starboard bow line, moved off the landing (it stood at x −10). */
 quayBollard:Object.freeze([-12.3,-49.3]),
});
