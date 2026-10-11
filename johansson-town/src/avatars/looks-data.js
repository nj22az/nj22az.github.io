// Generated from data/studio/looks.json by tools/studio/build-data.mjs. Do not edit it: change a look in Johansson Studio
// or with the johansson-studio tools (avatar-creator/docs/STUDIO-MCP.md). CI refuses a copy that does not match the data.
const freeze=value=>{if(value&&typeof value==='object'){for(const v of Object.values(value))freeze(v);Object.freeze(value);}return value;};
/** The sha256 of the looks.json this module was made from. */
export const LOOKS_SHA256='4ade38e7df5579638deb8ba34a973e20da97ba74b70515173390ca69d2a742fb';
/** Published looks: a resident's name → {set, note, made}. cast.js recipeFor lays `set` over how World draws them. */
export const LOOKS=freeze({});
/** Studio-only characters (World does not place them yet): id → {name, recipe, card, made}. */
export const STUDIO_CHARACTERS=freeze({});
