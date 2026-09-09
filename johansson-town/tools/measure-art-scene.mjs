// CPU scene/frustum estimate, not a GPU benchmark. Run from the game directory.
import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
const root=process.argv.slice(2).find(a=>!a.startsWith('--'))||process.cwd(),url=p=>pathToFileURL(root+'/'+p).href;
const THREE=await import(url('vendor/three.module.js'));
const {installDOM}=await import(url('tests/fixtures.mjs'));installDOM();
const {preloadIzakaya}=await import(url('src/world/izakaya.js'));
const {preloadHarbourBlock}=await import(url('src/world/harbour-block.js'));
const {preloadStreetPlants}=await import(url('src/world/street-plants.js'));
const {createTown}=await import(url('src/world/town.js'));
const {preloadModels,createLocalCharacters}=await import(url('src/people/models.js'));
const {createCastAI}=await import(url('src/people/schedules.js'));
const {createContentItems}=await import(url('content-items.js'));
const source=await readFile(root+'/src/game.js','utf8');const sites=Function('return '+source.match(/const SITES=(\[[\s\S]*?\n\]);/)[1])();
const scene=new THREE.Scene(),player=new THREE.Group();player.position.set(0,0,46);
// Embedded GLB images use blob URLs. Decode is stubbed for CPU geometry only.
const originalFetch=globalThis.fetch;
globalThis.self=globalThis;globalThis.createImageBitmap=async()=>({width:1024,height:1024,close(){}});
globalThis.fetch=async path=>{
 if(String(path).startsWith('blob:'))return originalFetch(path);
 const pathname=new URL(path).pathname;
 if(!pathname.startsWith('/johansson-town/assets/'))throw new Error('Unexpected model URL: '+path);
 return new Response(await readFile(root+'/assets/'+pathname.split('/assets/')[1]));
};
const {preloadTeaHouse}=await import(url('src/world/tea-house.js'));if(!await preloadTeaHouse())throw Error('Missing tea house asset');
if(!await preloadStreetPlants())throw Error('Missing OS3A street plant');
if(!process.argv.includes('--without-block')&&!await preloadHarbourBlock())throw Error('Missing harbour block');
const izakayaLoaded=await preloadIzakaya();if(izakayaLoaded.ready!==2)throw Error('Missing izakaya assets');
const world=createTown({scene,sites,harbourBatching:!process.argv.includes('--legacy'),harbourCellSize:Number(process.argv.find(a=>a.startsWith('--cell='))?.split('=')[1]||48),mobile:false,shadows:true,register(){},onAction(){},enter(){},getPlayerPosition:()=>player.position});
createContentItems({group:world.group,colliders:world.colliders,register(){},onInspect(){},onRead(){}});
const loaded=await preloadModels();if(loaded.ready!==loaded.total)throw new Error(`Incomplete measurement: ${loaded.ready}/${loaded.total} character assets loaded`);const cast=createLocalCharacters({shadows:true});for(const p of world.people)cast.attach(p.g,p.g.userData.name);
createCastAI({world,player,state:()=>({inventory:[],quest:0}),paused:()=>false,collides:()=>false}).update(1/60,1002,false);cast.update(1/60);
const camera=new THREE.PerspectiveCamera(65,16/9,.07,220);camera.position.set(0,1.65,46);camera.lookAt(0,1.6,20);scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);
const frustum=new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse));
function measure(position,target){
 camera.position.set(...position);camera.lookAt(...target);camera.updateMatrixWorld(true);scene.updateMatrixWorld(true);
 scene.traverse(o=>{if(o.isLOD)o.update(camera);});
 frustum.setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse));
 let calls=0,triangles=0,totalCalls=0,totalTriangles=0;const contributors={};
 scene.traverseVisible(o=>{
  if(!o.isMesh||!o.layers.test(camera.layers))return;
  const count=(o.geometry.index?.count||o.geometry.attributes.position.count)/3*(o.isInstancedMesh?o.count:1),draws=Array.isArray(o.material)?o.geometry.groups.length:1;
  totalCalls+=draws;totalTriangles+=count;
  if(o.frustumCulled&&!frustum.intersectsObject(o))return;
  calls+=draws;triangles+=count;
  const category=o.name.startsWith('harbour-instances:')?'harbourInstances':o.isSkinnedMesh?'characters':o.name.startsWith('static-props:')?'staticProps':o.isInstancedMesh?'otherInstances':'otherMeshes';
  const row=contributors[category]??={calls:0,triangles:0};row.calls+=draws;row.triangles+=count;
 });
 return {visibleCallsEstimate:calls,submittedTrianglesEstimate:triangles,totalVisibleSceneCalls:totalCalls,totalVisibleSceneTriangles:totalTriangles,contributors};
}
const viewpoints=[
 ['start',[0,1.65,46],[0,1.6,20]],
 ['street',[0,1.65,0],[0,1.6,-35]],
 ['quay',[0,1.65,-58],[0,1.6,-78]],
 ['pierLookingBack',[0,1.65,-76],[0,1.6,-40]],
 ['shrineLookingBack',[72,7.65,117],[45,1.6,55]]
];
const initial=measure(viewpoints[0][1],viewpoints[0][2]),views={};
// Fixed starting population for comparable culling samples, not a simulated walk.
for(const [state,day,minutes,rain] of [['day',1,1002,false],['rainNight',0,1200,true]]){
 world.setRain(rain);world.update(0,0,day,minutes);
 views[state]=Object.fromEntries(viewpoints.map(([name,position,target])=>[name,{position,target,...measure(position,target)}]));
}
console.log(JSON.stringify({
 method:'CPU frustum estimate; all local character assets must load. Images are stubbed. No shadows, Points, GPU timings, player/held objects or interiors. Fixed starting resident population across viewpoints; not a gameplay walk-through.',
 configuration:{consolidate:!process.argv.includes('--legacy'),cellSize:process.argv.find(a=>a.startsWith('--cell='))?.split('=')[1]||'48'},
 loaded,harbourBlock:world.quality.harbourBlock,streetPlants:world.quality.streetPlants,staticProps:world.quality.staticProps,...initial,views
},null,2));
