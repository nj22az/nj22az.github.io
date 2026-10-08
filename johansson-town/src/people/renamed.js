/**
 * Residents who have been renamed: the old name, and who they are now. Yui was the
 * original Sakura clerk and Yuri the later one; both read as Thuan. Aya, Nao and Kenji
 * became Nhung and Thao (Thuan's elder sisters) and Chin. Saves (save.js) and saved
 * looks (avatars/wardrobe.js) written under an old name are read as the new one.
 */
export const RENAMED_RESIDENTS=Object.freeze({Yuri:'Thuan',Yui:'Thuan',Aya:'Nhung',Nao:'Thao',Kenji:'Chin'});
const pattern=new RegExp('\\b(?:'+Object.keys(RENAMED_RESIDENTS).join('|')+')\\b','g');
export const renameResidents=text=>typeof text==='string'?text.replace(pattern,old=>RENAMED_RESIDENTS[old]):text;
/** The names someone was known by before. */
export const formerNames=name=>Object.keys(RENAMED_RESIDENTS).filter(old=>RENAMED_RESIDENTS[old]===name);
