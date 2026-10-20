import {parseAst} from 'rollup/parseAst';
import {readFile,readdir,writeFile} from 'node:fs/promises';
const root=new URL('../',import.meta.url),files=[];
async function scan(dir){for(const e of await readdir(new URL(dir,root),{withFileTypes:true})){if(e.isDirectory())await scan(dir+e.name+'/');else if(e.name.endsWith('.js'))files.push(dir+e.name);}}
await scan('src/');for(const e of await readdir(root))if(e.endsWith('.js'))files.push(e);
// Japanese is deliberate on physical scenery and jp metadata. Controls, quests and narration remain English.
const scenery=new Set(['src/world/interiors/sakura-office-room.js','src/world/interiors/sakura-office-dressing.js','src/world/interiors/classroom-notices.js','src/world/west-shore.js','src/world/okinawa/lots.js','src/world/okinawa/lot-dressing.js','src/world/ferry-quick-crossing.js','src/world/interiors/tetsuo-flat.js','src/world/ferry-ship.js','src/world/ferry-model.js','src/world/johansson-marine.js','src/world/ferry-safety-plan.js','src/world/kitano-hamlet-layout.js','src/world/kitano-hamlet.js','src/world/okinawa/signs.js','src/world/okinawa/fish.js','src/world/road-standards.js','src/world/storefront.js','src/world/izakaya.js','src/world/vending.js','src/commerce/vending-catalogue.js','src/commerce/sakura-specials.js','src/world/interiors/sakura-specials-board.js','src/world/warehouse.js','src/world/sato-ramen-layout.js','src/world/minato-facade.js','src/world/aoba-radio.js','src/world/park-access.js','src/world/town-power.js','src/world/interiors/onsen-electrics.js','src/world/interiors/onsen-signs.js','src/world/interiors/onsen-props.js','src/world/interiors/onsen-steam.js','src/world/interiors/onsen-rocks.js','src/world/districts.js','src/world/interiors/staff-board.js','src/world/interiors/sakura-backroom.js','src/world/interiors/stockroom-products.js','src/world/interiors/sakura-corners.js','src/world/interiors/izakaya-dressing.js','src/world/interiors/sato-ramen-dressing.js','src/commerce/fresh-labels.js','src/commerce/packaging-art.js','src/commerce/sakura-caps.js',
 // The names painted on the fishing and cargo boats' bows, Sakura's shelf talkers (each with its English line), the face
 // glyph table (an open-mouthed 口 is a drawing, not a word) and the quay's painted signs.
 'src/world/harbour-boats.js','src/world/interiors/sakura-shelf-edge.js','src/avatars/face.js','src/world/quay-dressing.js',
 // The labels on Tetsuo's bench kit (分電盤, 感電注意, the parts drawers), each item's `jp` beside its English `en`.
 'src/workshop/tetsuo-bench.js',
 // Chin's wall: the bins' katakana labels, the outboard's decal, the 消火器 sign, Sakura Trading's calendar and the poster's
 // fair line, each item's `jp` beside its English `en`.
 'src/workshop/chin-wall.js',
 // The printed headings of Sakura's papers (納品書, 請求書 …), each shown beside its English title.
 'src/commerce/paperwork.js',
 // Sakura's small office: each thing's `jp` beside its English name, and the calendar, rota, plate and TV's printed headings.
 'src/world/interiors/sakura-small-office.js','src/world/interiors/sakura-small-office-build.js']);
const values=[];for(const path of files){if(path==='src/people/voice-lines.js'||scenery.has(path))continue;const src=await readFile(new URL(path,root),'utf8');const ast=parseAst(src);function walk(n){if(!n||typeof n!=='object')return;if(n.type==='CallExpression'&&(n.callee?.name==='plate'||n.callee?.name==='plateTexture'))return;if(n.type==='CallExpression'&&n.callee?.property?.name==='fillText')return;if(n.type==='Literal'&&typeof n.value==='string'&&/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u.test(n.value))values.push({path,start:n.start,end:n.end,value:n.value});if(n.type==='TemplateElement'&&/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u.test(n.value.raw))values.push({path,start:n.start,end:n.end,value:n.value.raw,template:true});for(const [k,v] of Object.entries(n)){if(k==='raw')continue;if(Array.isArray(v))v.forEach(walk);else if(v&&typeof v==='object')walk(v);}}walk(ast);}
if(process.argv.includes('--json'))await writeFile('/tmp/town-english-inventory.json',JSON.stringify(values,null,2));console.log(values.length,'strings');
const parts=[...new Set(values.flatMap(x=>x.value.match(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}][\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}、。・〜ー！？]*[！？]?/gu)||[]))];console.log(parts.length,'phrases');console.log(parts.join('\n'));

if(values.length)process.exitCode=1;
