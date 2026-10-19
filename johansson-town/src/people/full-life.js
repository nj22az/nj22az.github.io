/**
 * One switch for the residents' fuller life: stand points in their days (stand-points.js) and the quay's shared spots
 * (quay-breaks.js). On by default; an edition that has to keep the web light can turn it off (setFullLife(false)), and
 * those residents fall back to one target a phase and no quay breaks. Sakura's till queue is not behind it: it only runs
 * while customers are in the shop, with no path search of its own.
 */
const options={fullLife:true};
export const fullLife=()=>options.fullLife;
export function setFullLife(on=true){options.fullLife=on!==false;}
export {options as lifeOptions};
