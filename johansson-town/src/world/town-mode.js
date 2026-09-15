export const TOWN_MODES=Object.freeze({LEGACY:'legacy',SHOPPING:'shopping-district'});
let activeMode=TOWN_MODES.LEGACY;

// The compact shopping district is the published game. Legacy callers keep the
// older residential fixtures available for archived interior and layout tests.
export function configureTownMode(mode=TOWN_MODES.LEGACY){
 activeMode=mode===TOWN_MODES.SHOPPING?TOWN_MODES.SHOPPING:TOWN_MODES.LEGACY;
 return activeMode;
}
export const currentTownMode=()=>activeMode;
export const shoppingDistrictActive=()=>activeMode===TOWN_MODES.SHOPPING;
