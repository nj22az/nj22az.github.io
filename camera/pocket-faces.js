/**
 * The Pocket faces: the residents' heads through the Pocket Look, scribbled over (tools/draw-pocket-faces.mjs), as the
 * Game Boy Camera kept scribbled photographs of Nintendo's staff for its error screens and its "Run" option ("Who are
 * you running from?"). Each face is a sticker of the secret sheet (stickers/pocket-faces.json) and carries its own
 * line; the app shows one when something goes wrong, on the refused camera, on Cancel after a change, at the thirtieth
 * photo (a Game Boy Camera held thirty) and when the sheet itself is won (unlocks.js).
 */
import {loadStickerSets,stickerById} from './stickers.js?v=20261105fun1';

/** The faces by what they are for; each is `pocket-faces/<kind>` on the sheet. */
export const FACE_KINDS=Object.freeze(['run','hide','oops','silly','full','secret','wait','nope']);
/** The three faces a failure can show; the Game Boy Camera had three too, and a rare fourth. */
const ERROR_FACES=Object.freeze(['oops','nope','wait']);
/** A face for a failure: one of the three, and one time in eight the rare "Don’t be so silly!". */
export function errorFace(random=Math.random){return random()<.125?'silly':ERROR_FACES[Math.floor(random()*ERROR_FACES.length)];}
/** The face, its small picture, its words and its description, or null while the sheets cannot be loaded. */
export async function pocketFace(kind){
 try{await loadStickerSets();}catch{return null;}
 const s=stickerById(`pocket-faces/${kind}`);
 return s?{kind,url:s.thumbUrl,full:s.url,alt:s.gloss,line:s.line}:null;
}
