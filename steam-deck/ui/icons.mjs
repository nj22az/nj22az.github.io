import {svg} from '../johansson-town/src/ui/icons.js';
// Semantic actions stay common to installed platforms. Original SVGs ship on
// Linux. Future Apple shells can map data-sf-symbol to native system symbols;
// no Apple glyph/font data is copied into this cross-platform package.
export const ICONS=Object.freeze({
 island:['sun','sun.max.fill'],people:['person','person.2.fill'],settings:['gear','gearshape.fill'],
 resume:['moves','figure.walk'],town:['map','map.fill'],bag:['bag','bag.fill'],home:['home','house.fill'],
 save:['book','square.and.arrow.down.fill'],help:['talk','questionmark.bubble.fill'],talk:['talk','bubble.left.and.bubble.right.fill'],
 controls:['game','gamecontroller.fill'],display:['screen','display'],updates:['reset','arrow.triangle.2.circlepath'],
 quit:['exit','door.left.hand.open'], 'quit-confirm':['exit','door.left.hand.open'],move:['moves','figure.walk'],look:['eye','eye.fill'],
 swap:['shuffle','arrow.left.arrow.right'],reset:['game','gamecontroller.fill'],hud:['eye','eye'],performance:['clock','speedometer'],update:['reset','arrow.triangle.2.circlepath']
});
export function icon(action){const [name,symbol]=ICONS[action]||['star','star.fill'];return `<span class="console-icon" data-icon="${action}" data-sf-symbol="${symbol}" aria-hidden="true">${svg(name,{size:32})}</span>`;}
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function residentPortrait(name){
 const resident=window.JOHANSSON_RESIDENT_GUIDE?.find(p=>p.name===name);
 return resident?.portrait?`<span class="console-portrait"><img class="console-resident-photo" src="../johansson-town/${escape(resident.portrait)}" alt="" width="120" height="120" loading="lazy"></span>`:`<span class="console-portrait console-portrait-fallback" aria-hidden="true">${icon('people')}</span>`;
}
export function controlDiagram(){return `<figure class="console-controller-map" aria-label="Steam Deck: left stick moves, right stick looks. Physical buttons are labelled on the diagram; current assignments appear below."><svg viewBox="0 0 440 166" role="img" aria-label="Steam Deck controller"><path d="M60 27Q20 27 16 67L10 128Q8 150 37 150h366q29 0 27-22l-6-61q-4-40-44-40Z" fill="#273469"/><rect x="108" y="40" width="224" height="96" rx="8" fill="#dcecff"/><path d="M116 115l52-36 40 22 59-44 57 58" fill="none" stroke="#8ab9ee" stroke-width="5"/><circle cx="60" cy="61" r="19" fill="#566ec5"/><circle cx="380" cy="118" r="18" fill="#566ec5"/><path d="M53 94h14v13h13v14H67v13H53v-13H40v-14h13Z" fill="#c7d4ff"/><g fill="#fff" font-family="system-ui" font-weight="700" font-size="13" text-anchor="middle"><text x="60" y="66">L</text><text x="380" y="123">R</text><text data-physical="3" x="380" y="48">Y</text><text data-physical="2" x="359" y="68">X</text><text data-physical="1" x="401" y="68">B</text><text data-physical="0" x="380" y="88">A</text><text data-physical="8" x="91" y="65">▣</text><text data-physical="9" x="346" y="47">☰</text></g><rect x="26" y="4" width="64" height="19" rx="8" fill="#e6536b"/><rect x="350" y="4" width="64" height="19" rx="8" fill="#e6536b"/><g fill="white" font-family="system-ui" font-size="12" text-anchor="middle" font-weight="700"><text x="58" y="18">L2 / L1</text><text x="382" y="18">R2 / R1</text></g></svg><figcaption>Move <b>L</b> · Look <b>R</b> · Pause <b>☰</b></figcaption></figure>`;}
