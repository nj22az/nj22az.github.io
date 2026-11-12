// Sets the icons tools/draw-camera-icons.py drew (camera/icons/ui-icons.json) into the camera: the page's symbols, between
// the icon markers of camera/index.html, and camera/look-icons.js (the Looks', the kinds' and the Game Room's).
//   python3 tools/draw-camera-icons.py           draw them
//   node tools/apply-camera-icons.mjs            write the page's block and the module
//   node tools/apply-camera-icons.mjs --check    fail when either is not the drawing's (the icons test)
import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const START='<!-- icons:start (tools/apply-camera-icons.mjs writes this block from tools/draw-camera-icons.py; do not edit it by hand) -->',END='<!-- icons:end -->';
export const iconData=async()=>JSON.parse(await readFile(root+'camera/icons/ui-icons.json','utf8'));
/** The page's symbols: every icon a button uses by `<use href="#i-…">`, and the Game Room's signs. */
export async function spriteBlock(){
 const {sprite,games}=await iconData();
 const symbols=[...Object.entries(sprite),...Object.entries(games).map(([name,body])=>[`game-${name}`,body])]
  .map(([name,body])=>`  <symbol id="i-${name}" viewBox="0 0 24 24">${body}</symbol>`).join('\n');
 return `${START}\n${symbols}\n  ${END}`;
}
/** camera/look-icons.js, whole. */
export async function lookIconsModule(){
 const {kinds,looks}=await iconData();
 const map=o=>Object.entries(o).map(([name,body])=>` ${/^[a-zA-Z_$][\w$]*$/.test(name)?name:JSON.stringify(name)}:${JSON.stringify(body)},`).join('\n');
 return `// Drawn by tools/draw-camera-icons.py and written here by tools/apply-camera-icons.mjs: do not edit by hand.
// One symbol for each Look (shown until its live thumbnail is drawn, and on the mix's chips) and one for each kind of
// Look. They describe the medium, not a scene or a console brand. Two tones of the text's own colour; the Riso looks
// carry their inks.
export const LOOK_ICONS=Object.freeze({
${map(looks)}
});
export const KIND_ICONS=Object.freeze({
${map(kinds)}
});
export function lookIcon(name){
 const id=Object.hasOwn(LOOK_ICONS,name)?name:'none';
 return \`<svg class="look-symbol" data-look="\${id}" aria-hidden="true" viewBox="0 0 24 24">\${LOOK_ICONS[id]}</svg>\`;
}
export function kindIcon(id){
 return \`<svg class="kind-symbol" aria-hidden="true" viewBox="0 0 24 24">\${KIND_ICONS[Object.hasOwn(KIND_ICONS,id)?id:'more']}</svg>\`;
}
`;
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const check=process.argv.includes('--check');let stale=0;
 const page=await readFile(root+'camera/index.html','utf8'),a=page.indexOf(START),b=page.indexOf(END);
 if(a<0||b<a){console.error('camera/index.html has no icon markers');process.exit(1);}
 const nextPage=page.slice(0,a)+await spriteBlock()+page.slice(b+END.length);
 const module=await lookIconsModule(),had=await readFile(root+'camera/look-icons.js','utf8').catch(()=>'');
 for(const [path,now,next] of [['camera/index.html',page,nextPage],['camera/look-icons.js',had,module]]){
  if(now===next)continue;
  if(check){console.error(`${path} is not what tools/draw-camera-icons.py drew; run node tools/apply-camera-icons.mjs`);stale++;}
  else{await writeFile(root+path,next);console.log(`icons: written into ${path}`);}
 }
 if(stale)process.exit(1);
 if(check)console.log('icons: the page and look-icons.js carry the drawing');
}
