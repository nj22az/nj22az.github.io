/**
 * The Minato Seagulls cap at Sakura Shōten: the shop's one line that is worn, not eaten, drunk or used up (the creator,
 * 2026-10-14: "you should be able to buy a nice hat in the Konbini and wear it").
 *
 * It is not in Sakura's products file (data/studio/products.json): that file is the packed goods on the shelves, each
 * with a pack shape and a cell in the label atlas, and a cap is neither. Its record is here, in the same terms
 * (who buys it, why, where it stands and why there, the supplier), with what a garment has besides: its maker and model,
 * its colourways and the model in World's asset catalogue that is both the cap on the stand and the cap on a head.
 * Selling it at the till and wearing what you bought are open (briefs/NEXT.md): the till sells PRODUCTS only, and the
 * player's look is changed in Johansson Studio, not by a purchase.
 *
 *   hat       the recipe's `outfit.hat` (src/avatars/hat-assets.js ASSET_HATS)
 *   asset     World's asset catalogue id (assets/catalog/seagulls-cap)
 *   price     yen, 1997, tax included (Sakura prices as a shop pricing tax-inclusive did: commerce/konbini.js)
 *   stock     the caps on the stand, by colourway (each a hatColour from the island palette)
 *   purpose   who buys it (residents by name, guide/residents.json), why, and why it stands where it does
 *   stand     the free-standing cap tree on the floor (world/interiors/sakura-cap-stand.js)
 */
export const SEAGULLS_CAP=Object.freeze({
 id:'seagulls-cap',hat:'seagulls-cap',asset:'seagulls-cap',
 name:'Seagulls cap',
 // On the price card (Japanese on signs): the team, "supporters' cap", one size with the strap.
 jp:Object.freeze({team:'ミナト・シーガルズ',line:'応援キャップ',size:'フリーサイズ（アジャスター付）',price:'¥1,800',tax:'税込'}),
 price:1800,
 priceWhy:'In 1997 a plain cotton cap was ¥980 at a supermarket and a professional team’s official cap ¥3,500 to ¥4,000 at a sports shop. A town team’s cap, embroidered in a short run for one island, sits between: ¥1,800 is a day’s lunches and a pack of cigarettes for a catch sorter, a treat and not a decision.',
 maker:Object.freeze({name:'Johansson Headwear',jp:'ヨハンソン帽子',works:'Naha',model:'JH-605',
  what:'A six-panel cotton twill snapback: stiffened front panels, an eyelet in each panel, a cloth button, a cotton sweatband, a curved board bill with five rows of stitching and the green undervisor, two plastic straps with seven studs; the gull embroidered for the club in Naha.'}),
 supplier:'sakura',
 supply:'Sakura Trading orders them from Johansson Headwear in Naha by the dozen, in the team’s navy and two summer colours; they come over on the Minato Maru in the depot’s Tuesday freight with the stationery and the batteries.',
 colourways:Object.freeze([
  Object.freeze({name:'Seagulls navy',hatColour:'#27304d'}),
  Object.freeze({name:'Paper white',hatColour:'#f4f1ea'}),
  Object.freeze({name:'Fukugi green',hatColour:'#4f7a4f'}),
 ]),
 // On the stand, a stack on each cap form, the bottom one first: the team's navy on top, the summer colours below.
 stock:Object.freeze([
  Object.freeze({form:'top',caps:Object.freeze(['#27304d','#27304d','#27304d'])}),
  Object.freeze({form:'low',caps:Object.freeze(['#4f7a4f','#f4f1ea','#f4f1ea'])}),
 ]),
 purpose:Object.freeze({
  zone:'stand',
  for:Object.freeze(['Kōji','Haru','Uncle Kinjō','Mr Toguchi','Riku','Barfly']),
  why:'The boats’ crews and the catch sorters work bare-headed under the sun and the glare off the water from first light: a peak, cloth that breathes and a strap that fits anyone. The Seagulls are the town’s team (their 1996 squad’s board hangs at Sato Ramen, the fixtures are chalked at Minato): the gull is whose side you are on, and the counter at the izakaya will tell you.',
  placed:'On its own stand by the east window, between the copy machine and the end of the counter: in the window, where the street sees the season’s line; beside the till, where a ¥1,800 thing is watched and a cap can be tried on in the window’s reflection; and out of the walk from the door to the till and of the queue along the counter.',
 }),
 // A cap tree, as a 1990s shop stood one: a chromed pole on a weighted base, two arms to the north (the shop side), each
 // ending in a cap form, a dome the size of a head, that a stack of caps sits on, crown up and bill out, as they are worn.
 // `forms` are the heights of the caps' lowest points; `reach` how far out the form's centre is from the pole; `nest`
 // how much higher each cap of a stack sits. The collider is the base and the caps, the box the walkers keep out of.
 stand:Object.freeze({x:3.28,z:3.62,yaw:Math.PI,forms:Object.freeze({top:1.55,low:1.0}),reach:.3,nest:.02,height:2.0,
  collider:Object.freeze({x:3.28,z:3.37,w:.52,d:.96,height:2.25})}),
});
/** The cap lines Sakura stocks that are worn (one so far), by id. */
export const WORN_LINES=Object.freeze({[SEAGULLS_CAP.id]:SEAGULLS_CAP});
