import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const here=dirname(fileURLToPath(import.meta.url));
const root=resolve(here,'..');
const physicsSource=await readFile(resolve(root,'physics.js'),'utf8');
const physics=await import(`data:text/javascript;base64,${Buffer.from(physicsSource).toString('base64')}`);
const {circleHitsRect,circleHitsCircle,roomBoundsBlocked,townBoundsBlocked,sweepFraction}=physics;

assert.equal(circleHitsRect(0,0,.28,{x:1,z:0,w:1,d:1}),false,'clear space must remain clear');
assert.equal(circleHitsRect(.3,0,.28,{x:1,z:0,w:1,d:1}),true,'inflated prop collision must stop the player');
assert.equal(circleHitsCircle(0,0,.28,.7,0,.35),false,'separated residents must not collide');
assert.equal(circleHitsCircle(0,0,.28,.5,0,.35),true,'resident overlap must be blocked');
assert.equal(roomBoundsBlocked(0,0,.28),false);
assert.equal(roomBoundsBlocked(5.5,0,.28),true,'room wall radius must be respected');
assert.equal(townBoundsBlocked(0,0,.28),false);
assert.equal(townBoundsBlocked(6.9,0,.28),true,'shopping-street edge must be solid');
assert.equal(townBoundsBlocked(10,-56,.28),false,'harbour apron must remain accessible');
assert.equal(townBoundsBlocked(0,-75,.28),false,'outer harbour pier must be walkable');
assert.equal(townBoundsBlocked(3.7,-75,.28),false,'pier usable width must remain accessible');
assert.equal(townBoundsBlocked(4.0,-75,.28),true,'pier side must stop the player before the water');
assert.equal(townBoundsBlocked(0,-79,.28),true,'pier end must stop the player before open water');
const sweep=sweepFraction({x:0,z:0},{x:5,z:0},x=>x>=2,.1);
assert.ok(sweep>.35&&sweep<.4,`camera sweep stopped at unexpected fraction ${sweep}`);

for(const file of ['main.js','main-professional.js','world.js','world-professional.js','characters.js','characters-cel.js','characters-aaa.js','activities.js','resource-catalog.js','prop-factory.js','webmcp.js','webmcp-characters.js']){
  const source=await readFile(resolve(root,file),'utf8');
  const refs=[...source.matchAll(/(?:from\s+|import\()['"]([^'"]+)["']/g)].map(m=>m[1]);
  for(const ref of refs){if(!ref.startsWith('.'))continue;const clean=ref.split('?')[0];await access(resolve(root,clean));}
}

const main=await readFile(resolve(root,'main.js'),'utf8');
assert.match(main,/sweepFraction/,'third-person camera must use swept collision');
assert.match(main,/residentBlocked/,'NPCs must participate in player collision');
assert.match(main,/activities\.js\?v=9/,'gameplay module must retain the activity import specifier targeted by the import map');
assert.match(main,/function addRoomProps/,'interiors must have a dedicated prop builder');
for(const id of ['office','frontrow','form3d','stepwise','journal','electronics','market','career'])assert.match(main,new RegExp(`s\\.id==='${id}'`),`interior ${id} must have an individual layout`);
for(const feature of ['addDesk','addShelf','addCabinet','addMachine','addCounter','addChair'])assert.match(main,new RegExp(`function ${feature}`),`${feature} must remain available to build interactive interiors`);
assert.match(main,/activities\.action\(kind,title,text\)/,'interior props must route through activity interactions');
assert.match(main,/streetInteractions/,'runtime stability must check street interaction coverage');
assert.doesNotMatch(main,/import\('\.\/characters\.js/,'characters must not stream asynchronously after play begins');

const professional=await readFile(resolve(root,'world-professional.js'),'utf8');
assert.match(professional,/replaceCableLines/,'professional layer must replace raster-thin utility lines');
assert.match(professional,/InstancedMesh/,'replacement cables must be batched');
assert.doesNotMatch(professional,/new THREE\.Line\(/,'professional layer must not introduce new raster line primitives');
assert.doesNotMatch(professional,/LineBasicMaterial/,'professional layer must not use one-pixel line materials');
assert.match(professional,/createPropFactory/,'professional layer must use the local resource-backed prop factory');
assert.match(professional,/addStreetLife/,'street-life pass must remain enabled');
assert.match(professional,/addSiteFrontage/,'every shop frontage must receive an environmental interaction pass');
assert.match(professional,/streetInteractions/,'street-life interaction count must be reported');
for(const prop of ['bicycleRack','convexMirror','menuBoard','baitStation','pierWinch'])assert.match(professional,new RegExp(`factory\\.${prop}`),`${prop} must remain in the interactive city pass`);
for(const kind of ["'read'","'buy'","'radio'","'machine'"])assert.match(professional,new RegExp(kind),`street layer must route ${kind} interactions`);
assert.match(professional,/walkableOuterPier:true/,'professional layer must report walkable pier support');
assert.match(professional,/resourceBackedProps:true/,'professional layer must report resource-backed props');
assert.match(professional,/localRuntimeAssets:true/,'third-party hotlinks must not be required at runtime');
assert.match(professional,/computeVertexNormals/,'animated cel water must refresh normals');

const resources=await readFile(resolve(root,'resource-catalog.js'),'utf8');
assert.match(resources,/Fasani\/three-js-resources/,'resource discovery provenance must be explicit');
assert.match(resources,/Poly Haven asphalt_02/,'local asphalt provenance must remain documented');
assert.match(resources,/Quaternius Sushi Restaurant Kit/,'approved Japanese prop source must remain documented');
assert.match(resources,/localOnly:true/,'runtime resource policy must remain local-only');
assert.match(resources,/fallbackRequired:true/,'all future sourced models must retain fallbacks');

const props=await readFile(resolve(root,'prop-factory.js'),'utf8');
assert.match(props,/getTextureResource/,'prop factory must resolve documented local textures');
for(const texture of ['asphalt','timber','roof','plaster'])assert.match(props,new RegExp(texture),`prop factory must retain ${texture} resource support`);
for(const prop of ['bench','postbox','newspaperRack','deliveryTrolley','noticeBoard','utilityCabinet','bicycleRack','convexMirror','airConditioner','noren','awning','crateStack','baitStation','pierWinch','menuBoard'])assert.match(props,new RegExp(`function ${prop}`),`${prop} must remain a dedicated prop factory`);
assert.doesNotMatch(props,/https?:\/\//,'runtime prop factory must not hot-link remote assets');

const activities=await readFile(resolve(root,'activities.js'),'utf8');
assert.match(activities,/johansson-town-1988-v3/,'expanded interaction state must preserve the current save namespace');
for(const kind of ['inspect','read','machine','seat','buy','radio'])assert.match(activities,new RegExp(`case '${kind}'`),`activity system must support ${kind} interactions`);
assert.match(activities,/Quaternius CC0 packs/,'credits must explain curated CC0 model intake');
assert.match(activities,/Fasani\/three-js-resources/,'credits must expose the approved resource catalogue');

const boot=await readFile(resolve(root,'main-professional.js'),'utf8');
assert.match(boot,/newMin=-82,newSpan=144/,'minimap projection must include the outer pier');
assert.match(boot,/paintedHarbour=false/,'minimap harbour overlay must reset each frame');
assert.match(boot,/main\.js\?v=14-base/,'professional wrapper must load the current gameplay module exactly once');

const local=await readFile(resolve(root,'characters.js'),'utf8');
for(const name of ['player','Aiko','Kenji','Mrs Sato','Harbour master'])assert.match(local,new RegExp(name.replace(' ','\\s')),`local cast must retain ${name}`);
assert.match(local,/hero:true/,'Johansson must have a dedicated hero body/wardrobe branch');
assert.match(local,/blouse:true/,'Aiko must have dedicated blouse geometry');
assert.match(local,/workwear:true/,'Kenji must have dedicated workwear geometry');
assert.match(local,/cardigan:true/,'Mrs Sato must have dedicated cardigan geometry');
assert.match(local,/apron:true/,'Mrs Sato must have dedicated apron geometry');
assert.match(local,/coat:true/,'harbour master must have dedicated coat geometry');
assert.match(local,/peakedCap:true/,'harbour master must have dedicated cap geometry');
assert.match(local,/moustache:true/,'harbour master must have distinct facial geometry');
assert.match(local,/hairStyle:'ponytail'/,'Aiko must keep her own hair silhouette');
assert.match(local,/hairStyle:'crop'/,'Kenji must keep his own hair silhouette');
assert.match(local,/hairStyle:'bun'/,'Mrs Sato must keep her own hair silhouette');
assert.match(local,/hairStyle:'receding'/,'harbour master must keep his own hair silhouette');
assert.doesNotMatch(local,/satchel:true|suitcase:true/,'Johansson must not carry a suitcase or satchel');
assert.match(local,/head:\[/,'cast identities must include distinct head proportions, not palette swaps');
assert.match(local,/stride:/,'cast identities must include distinct movement cadence, not palette swaps');

const aaa=await readFile(resolve(root,'characters-aaa.js'),'utf8');
assert.match(aaa,/stable-local-authored/,'runtime must use the stable individually authored cast');
assert.match(aaa,/createStableCharacters/,'runtime must delegate to stable local character rigs');
assert.doesNotMatch(aaa,/GLTFLoader|AnimationMixer|raw\.githubusercontent/,'unstable remote skinned actors must not be active at runtime');
assert.match(aaa,/stageConversation/,'dialogue must stage spacing and facing explicitly');
assert.match(aaa,/targetDistance=1\.34/,'dialogue must maintain a deliberate conversational gap');
assert.match(aaa,/jumpVelocity/,'Johansson must retain deterministic jump physics');
assert.match(aaa,/__JOHANSSON_JUMP__/,'Johansson jump must remain externally callable by the touch control');
assert.match(aaa,/__JOHANSSON_CHARACTER_CONTROL__/,'named residents must expose bounded browser-agent control');
assert.match(aaa,/moveNPC/,'NPC AI control must use a bounded movement function');
assert.match(aaa,/MathUtils\.clamp\(e\.position\.x/,'NPC control must remain within the playable street width');

const webmcp=await readFile(resolve(root,'webmcp.js'),'utf8');
assert.match(webmcp,/document\.modelContext\|\|navigator\.modelContext/,'WebMCP must prefer the current document.modelContext API with legacy alias fallback');
for(const tool of ['johansson_get_state','johansson_move','johansson_look','johansson_jump','johansson_interact','johansson_travel','johansson_choose_action','johansson_ui'])assert.match(webmcp,new RegExp(tool),`${tool} must be registered`);
assert.match(webmcp,/__JOHANSSON_AGENT_API__/,'compatible browser-agent bridges must have a bounded fallback API');
assert.doesNotMatch(webmcp,/\beval\s*\(|new Function\s*\(/,'WebMCP must not expose arbitrary JavaScript execution');

const npcWebmcp=await readFile(resolve(root,'webmcp-characters.js'),'utf8');
for(const tool of ['johansson_list_characters','johansson_control_npc'])assert.match(npcWebmcp,new RegExp(tool),`${tool} must be registered`);
assert.match(npcWebmcp,/Only town NPCs can be controlled directly/,'direct AI character control must exclude Johansson position writes');
assert.match(npcWebmcp,/minimum:\.1,maximum:4/,'NPC movement distance must be bounded in the tool schema');

const index=await readFile(resolve(root,'index.html'),'utf8');
assert.match(index,/world-professional\.js\?v=16/,'boot import map must select the resource-backed street pass');
assert.match(index,/characters-aaa\.js\?v=21/,'boot import map must select the AI-controllable stable individual cast');
assert.match(index,/activities\.js\?v=10/,'boot import map must bypass stale activity caches');
assert.match(index,/main-professional\.js\?v=18/,'boot import map must select the current professional wrapper');
assert.match(index,/webmcp\.js\?v=1/,'WebMCP player tool surface must load after gameplay');
assert.match(index,/webmcp-characters\.js\?v=1/,'WebMCP NPC tool surface must load after the cast');
assert.match(index,/preloadCharacters/,'character system must initialise before gameplay');
assert.ok(index.indexOf('preloadCharacters')<index.indexOf("import('./main.js?v=15')"),'cast initialisation must complete before gameplay starts');
assert.ok(index.indexOf("import('./main.js?v=15')")<index.indexOf("import('./webmcp.js?v=1')"),'WebMCP must register only after the game surface exists');
assert.match(index,/id="jump"/,'touch HUD must expose a dedicated Johansson jump button');
assert.match(index,/character-controls\.css/,'jump control styling must be loaded');

console.log('Johansson Town stability regression tests: PASS');
