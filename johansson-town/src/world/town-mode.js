export const TOWN_MODES=Object.freeze({
 LEGACY:'legacy',
 SHOPPING:'shopping-district',
 /**
  * The peninsula: the konbini, the park, the port, and one road out to the bus stop.
  * Everything else the town has built up is switched off rather than deleted, so it
  * can be brought back a building at a time once this core is right.
  */
 PENINSULA:'peninsula'
});
let activeMode=TOWN_MODES.LEGACY;

// The compact shopping district and the peninsula are both published layouts. Legacy
// callers keep the older residential fixtures available for archived interior and
// layout tests.
export function configureTownMode(mode=TOWN_MODES.LEGACY){
 activeMode=Object.values(TOWN_MODES).includes(mode)?mode:TOWN_MODES.LEGACY;
 return activeMode;
}
export const currentTownMode=()=>activeMode;
/**
 * True for every layout that is not the archived residential one. The homes, the west
 * service lane and the other legacy fixtures hang off this, and the peninsula wants
 * them off for the same reasons the shopping district does.
 */
export const shoppingDistrictActive=()=>activeMode!==TOWN_MODES.LEGACY;
export const peninsulaActive=()=>activeMode===TOWN_MODES.PENINSULA;
