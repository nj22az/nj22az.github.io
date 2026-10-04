export const TOWN_MODES=Object.freeze({
 LEGACY:'legacy',
 SHOPPING:'shopping-district',
 /**
  * The peninsula (an island, now): the konbini, the park, the port and the ferry, and the
  * old sea cave in the headland at the top of Main Street.
  * Everything else the town has built up is switched off rather than deleted, so it
  * can be brought back a building at a time once this core is right.
  */
 PENINSULA:'peninsula'
});
let activeMode=TOWN_MODES.PENINSULA;

// The compact shopping district and the peninsula are both published layouts. Legacy
// callers keep the older residential fixtures available for archived interior and
// layout tests.
export function configureTownMode(){
 activeMode=TOWN_MODES.PENINSULA;
 return activeMode;
}
export const shoppingDistrictActive=()=>activeMode!==TOWN_MODES.LEGACY;
export const peninsulaActive=()=>activeMode===TOWN_MODES.PENINSULA;
