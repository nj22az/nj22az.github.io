// A local save catches up at the established one second / one town minute rate.
// Bound a return to one town day so a long absence cannot stall mobile startup.
export const MAX_ABSENCE_MINUTES=1440;
export function elapsedTownAbsence(savedAt,now=Date.now()){
 return Number.isFinite(savedAt)&&savedAt>0&&Number.isFinite(now)?Math.max(0,Math.min(MAX_ABSENCE_MINUTES,(now-savedAt)/1000)):0;
}
