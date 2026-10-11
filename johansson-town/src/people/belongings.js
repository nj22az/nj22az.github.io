/**
 * What the residents own and keep: one small thing each that they carry or keep close, so a
 * story can lose it, find it, lend it or ask where it came from. Nothing is random: every thing
 * has a reason in the resident's life, and wherever possible it is the thing their own guide
 * entry already mentions (canon). Where it came from is real too: one of the town's suppliers
 * (merchandising.js SUPPLIERS), the resident's workplace, a family, or another resident.
 *
 *   what    the thing, written to follow "my" and "the" ("bait box", not "a bait box"); one
 *           thing, so a story can say "it"
 *   tale    one short line about it (60 characters at most, so a comic caption stays small and
 *           clear of faces) that a story can narrate as it stands
 *   from    a SUPPLIERS id, 'work' (issued by their workplace), 'own' (brought or made by them),
 *           'family' (handed down), 'won', or the name of the resident who gave or made it
 *   keeps   where it lives when it is not in their hand, as a place phrase ("in his jacket pocket")
 *   canon   true when the resident's guide entry (guide/residents.json) names the thing itself
 *
 * Tests hold every resident to at least one thing and every source to a real one; the
 * storyteller's "lost" stories lose these.
 */
export const BELONGING_SOURCES=Object.freeze(['work','own','family','won']);

export const BELONGINGS=Object.freeze({
 Johansson:[{what:'second notebook',from:'frontrow',keeps:'in his jacket pocket',canon:true,
  tale:'The harbour has one notebook. Everything else has this one.'}],
 Thuan:[{what:'notebook of supplier names',from:'own',keeps:'in the drawer under Sakura’s till',canon:true,
  tale:'Thuan wrote every supplier’s name in it, her first year.'}],
 Thao:[{what:'tag pen',from:'frontrow',keeps:'behind Minato’s counter, by the bottle keep',canon:false,
  tale:'Every bottle tag in Minato’s keep was written with it.'}],
 Barfly:[{what:'broom',from:'Thao',keeps:'against the end of Minato’s counter',canon:true,
  tale:'The Barfly pays off his tab with it, one sweep at a time.'}],
 'Mrs Sato':[{what:'aluminium delivery box',from:'own',keeps:'on the shelf by Sato Ramen’s door',canon:true,
  tale:'At noon it carries two bowls to the harbour office.'}],
 Nhung:[{what:'pad of bookmark slips',from:'frontrow',keeps:'in her satchel',canon:true,
  tale:'Nhung tucks its slips into books she wants found.'}],
 Chin:[{what:'tool roll',from:'own',keeps:'on the workshop bench',canon:true,
  tale:'Chin lines up its tools before any new repair.'}],
 Tetsuo:[{what:'pocket radio',from:'own',keeps:'in his shirt pocket, switched on',canon:true,
  tale:'Chin repaired it twice. Tetsuo is still finding screws.'}],
 Reiko:[{what:'pencil',from:'frontrow',keeps:'behind her ear',canon:true,
  tale:'Reiko taps it twice before she asks the real question.'}],
 'Officer Mori':[{what:'report book',from:'frontrow',keeps:'on the kōban desk',canon:true,
  tale:'Three pages in it about a night when nothing happened.'}],
 'Harbour master':[{what:'pocket tide table',from:'work',keeps:'in his breast pocket',canon:false,
  tale:'The Harbour master trusts it over the radio forecast.'}],
 'Bus driver':[{what:'notebook of opening sentences',from:'frontrow',keeps:'on the wheelhouse shelf',canon:true,
  tale:'It is full of passengers’ opening sentences.'}],
 'Mrs Higa':[{what:'crossword book',from:'frontrow',keeps:'on the bandai',canon:true,
  tale:'Mrs Higa finishes a clue in it before taking coins.'}],
 'Grandmother Higa':[{what:'old bus cap',from:'family',keeps:'on the hook inside her front door',canon:false,
  tale:'Her husband wore it for thirty years on the island bus.'}],
 'Mr Ōshiro':[{what:'1979 race pennant',from:'won',keeps:'on the wall of the sabani yard',canon:true,
  tale:'Fourth place, 1979. A perfectly respectable result.'}],
 'Uncle Kinjō':[{what:'bait box',from:'own',keeps:'beside him on the seawall',canon:true,
  tale:'Uncle Kinjō guards it from the net-shed cat twice a day.'}],
 'Mrs Kinjō':[{what:'flower knife',from:'own',keeps:'in her apron pocket',canon:false,
  tale:'Mrs Kinjō trims every stem on the island with it.'}],
 'Mrs Nakamura':[{what:'bean ladle',from:'own',keeps:'on the hook over the bean pot',canon:false,
  tale:'It has stirred the beans at six every morning since 1972.'}],
 'Mr Shimabukuro':[{what:'mechanic’s stethoscope',from:'work',keeps:'on the power house desk',canon:false,
  tale:'Mr Shimabukuro listens to the diesels’ hearts with it.'}],
 'Mrs Yonamine':[{what:'sashimi knife',from:'own',keeps:'under the fish counter',canon:false,
  tale:'It cuts parrotfish sashimi for anyone who looks doubtful.'}],
 'Mrs Miyagi':[{what:'offering tray',from:'family',keeps:'on the shelf by her door',canon:true,
  tale:'Rice, salt and incense go to the grove on it.'}],
 'Mr Tamaki':[{what:'ice pick',from:'work',keeps:'on the hook by the ice plant door',canon:false,
  tale:'Mr Tamaki splits forty tonnes of ice a day with it.'}],
 Kōji:[{what:'tally board',from:'work',keeps:'on his sorting bench',canon:false,
  tale:'Kōji marks every sorted crate on it before dawn.'}],
 'Postman Tōma':[{what:'bicycle bell',from:'work',keeps:'on the handlebar of the post bicycle',canon:true,
  tale:'Postman Tōma rings it twice at the harbour turn.'}],
 Riku:[{what:'ratchet strap',from:'work',keeps:'on the hoist rail',canon:true,
  tale:'Riku checks it twice before he signals the lift.'}],
 'Emi Kado':[{what:'red pencil',from:'frontrow',keeps:'in the dispatch desk drawer',canon:true,
  tale:'Every crate Emi Kado checks gets a dot from it.'}],
 Haru:[{what:'net needle',from:'own',keeps:'in his tackle bag',canon:true,
  tale:'Haru mends the nets with it every afternoon.'}],
 Mina:[{what:'little notebook',from:'frontrow',keeps:'under the store counter',canon:true,
  tale:'Mina keeps a list in it of the things her neighbours need.'}],
 Jun:[{what:'boarding stamp',from:'work',keeps:'on the boarding counter',canon:false,
  tale:'Jun stamps every boarding pass with it.'}],
 Vy:[{what:'satchel',from:'own',keeps:'over her shoulder',canon:true,
  tale:'It is full of kanji, minus the ten Vy has not learned.'}],
 'Mr Toguchi':[{what:'hanging scale',from:'own',keeps:'on the side of his push cart',canon:true,
  tale:'Mr Toguchi trusts it more than any shop’s scale.'}],
});

/** A resident's things (empty if they have none on record). */
export const belongingsOf=name=>BELONGINGS[name]||[];

