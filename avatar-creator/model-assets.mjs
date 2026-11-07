// The assets "Make model" works on, without its page: where each comes from, how it is built, its card, its checks and
// its files. The workspace (model.js) and the agent API (studio-api.js, for the johansson-studio tools' asset_export)
// both use it, so a file an agent exports is the file the creator saves on the iPad.
//
// Three sources, one shape ({key, source, id, name, kind, tags, picture, card(), build(), glb?}):
//  - World's catalogue (assets/catalog: the massage chair, the trucker cap and its display copy): its published model,
//    its card as published;
//  - World's hand-coded props (johansson-town/src/studio/prop-registry.js): built fresh by World's own builder, stood
//    on the floor, with a card from the registry's purpose and size;
//  - models made here (the Lathe maker, johansson-town/src/studio/makers/lathe.js): built from their parameters.
import * as THREE from '../johansson-town/vendor/three.module.js';
import {GLTFLoader} from '../johansson-town/vendor/GLTFLoader.js';
import {assetURL} from '../johansson-town/src/assets.js';
import {catalogIds,catalogCard} from '../johansson-town/src/catalog/catalog-cards.js';
import {PROP_REGISTRY,buildProp,propPurpose} from '../johansson-town/src/studio/prop-registry.js';
import {madeFromObject,standOnFloor,disposeMade} from '../johansson-town/src/studio/modeller/made.js';
import {runChecks} from '../johansson-town/src/studio/modeller/checks.js';
import {cardChecks,orderChecks} from '../johansson-town/src/studio/modeller/card-checks.js';
import {trianglesOf,stlBytes,meshReport,printWords} from '../johansson-town/src/studio/modeller/stl.js';
import {renderHero} from '../johansson-town/src/studio/modeller/look.js';
import {exportGlb,prepareForExport,resolveCard,assetPackage} from '../johansson-town/src/studio/modeller/export.js';
import {sha256} from '../johansson-town/src/studio/sha256.js';
import {LATHE_FAMILIES,normalizeLathe,buildLathe} from '../johansson-town/src/studio/makers/lathe.js';
import {BUILD_CATALOGUE} from '../johansson-town/src/build/catalogue.js';
import {HOME_FURNITURE} from '../johansson-town/src/build/home-furniture.js';

export {THREE};
export const MODELS_KEY='nj-studio-models-v1';

let rulesPromise=null,brandsPromise=null;
/** The asset rules (rules.json, the desktop's copy) and World's own brand list. */
export const loadRules=()=>rulesPromise??=fetch(new URL('../johansson-town/src/studio/modeller/rules.json',import.meta.url)).then(r=>{if(!r.ok)throw Error('rules.json: HTTP '+r.status);return r.json();});
export const loadExtraBrands=()=>brandsPromise??=fetch(new URL('../johansson-town/data/studio/brand-rules.json',import.meta.url)).then(r=>r.ok?r.json():{brands:[]}).then(b=>b.brands||[],()=>[]);

/** The models made in Studio on this device: {id: {card, params, saved}}. */
export function readMade(storage=globalThis.localStorage){
 try{const d=JSON.parse(storage?.getItem(MODELS_KEY));if(d?.format==='nj-studio-models'&&d.models&&typeof d.models==='object')return d.models;}catch{}
 return {};
}
export function writeMade(models,storage=globalThis.localStorage){
 try{storage.setItem(MODELS_KEY,JSON.stringify({format:'nj-studio-models',version:1,models}));return true;}catch{return false;}
}

/** Ids already used, and by what (card-checks.js cardChecks `taken`), leaving out the asset itself. */
export function takenIds(self=null,made=readMade()){
 const out={};
 for(const e of BUILD_CATALOGUE)out[e.id]='World’s build catalogue';
 for(const e of HOME_FURNITURE)out[e.id]='World’s home furniture';
 for(const e of PROP_REGISTRY)out[e.id]=`World’s code (${e.source})`;
 for(const id of catalogIds())out[id]='catalogue:johansson-studio';
 for(const id of Object.keys(made))if(!out[id])out[id]='Studio';
 if(self&&out[self.id]&&self.source!=='catalogue')delete out[self.id];
 // a design made here is saved again under its own id (saving it updates it)
 if(self&&(self.source==='made'||self.source==='lathe')&&out[self.id]==='Studio')delete out[self.id];
 return out;
}

const loader=()=>new GLTFLoader();
/** A catalogue model's GLB as World fetches it, and its root: the node Studio marked as the asset, names restored. */
async function catalogueModel(id){
 const card=catalogCard(id),response=await fetch(assetURL('catalog/'+card.model+'?v='+card.modelSha));
 if(!response.ok)throw Error(`${card.name}: the model could not be fetched (HTTP ${response.status}).`);
 const bytes=new Uint8Array(await response.arrayBuffer()),gltf=await loader().parseAsync(bytes.buffer.slice(0),'');
 gltf.scene.traverse(o=>{if(typeof o.userData?.name==='string')o.name=o.userData.name;});
 let node=null;gltf.scene.traverse(o=>{if(!node&&!o.isMesh&&o.userData?.asset===card.name)node=o;});
 node??=gltf.scene;node.removeFromParent?.();node.updateMatrixWorld(true);
 return {bytes,root:node};
}

/** Every asset the library shows, as items (cards and builds are made when one is opened). */
export function libraryItems({made=readMade()}={}){
 const items=[];
 for(const id of catalogIds()){
  const c=catalogCard(id);
  items.push({key:'catalogue:'+id,source:'catalogue',id,name:c.name,kind:c.kind,tags:c.tags||[],version:c.version,picture:c.hero?assetURL('catalog/'+c.hero):null,
   from:'World’s catalogue',async card(){const r=await fetch(assetURL(`catalog/${id}/asset.json`));if(!r.ok)throw Error(`${c.name}: its card could not be fetched.`);return r.json();},
   async build(){return (await catalogueModel(id)).root;},async glb(){return (await catalogueModel(id)).bytes;}});
 }
 for(const e of PROP_REGISTRY)items.push({key:'registry:'+e.id,source:'registry',id:e.id,name:e.name,kind:e.kind,tags:e.tags,version:1,picture:null,entry:e,
  from:'World’s code: '+e.source,card:()=>registryCard(e),build:()=>buildRegistry(e)});
 for(const [id,m] of Object.entries(made))items.push(madeItem(id,m));
 return items;
}

/** An item for a model made here (its card and its maker's parameters). */
export function madeItem(id,m){
 return {key:'made:'+id,source:'made',id,name:m.card.name||id,kind:m.card.kind,tags:m.card.tags||[],version:m.card.version||1,picture:null,params:m.params,
  from:'Made in Studio: '+(LATHE_FAMILIES[m.params?.family]?.name||'Lathe'),card:async()=>structuredClone(m.card),build:async()=>buildMade(m.params,m.card)};
}

/** A registry prop's card: its purpose, real size and kind, the rest as World's catalogue cards have them. */
export async function registryCard(e){
 const rules=await loadRules(),k=rules.kinds[e.kind];
 return {format:1,id:e.id,name:e.name,kind:e.kind,version:1,purpose:await propPurpose(e.id),size:[...e.size],model:'model.glb',colours:{},colliders:'auto',
  seats:[],spots:[],action:e.action||{kind:'look',label:'Look at the '+e.name.toLowerCase()},anchors:{},keepClear:[],
  budget:{triangles:k.triangles,materials:k.materials},tags:[...e.tags],
  notes:`Built in World’s own code (${e.source}); Studio stands it on the floor${e.hangs?' (World hangs it from the anchor "hang")':''}${e.turn?' and turns it upright':''}.`};
}

/** A registry prop built fresh by World's builder, stood on the floor inside a root named as the asset. */
export async function buildRegistry(e){
 const object=await buildProp(e.id),root=new THREE.Group();root.name=e.name;root.userData.asset=e.name;
 if(e.turn)object.rotation.x=Math.PI;
 object.updateMatrixWorld(true);root.add(object);
 // a lit prop is shown lit (World lights them after dark)
 object.userData.lantern?.setGlow?.(1);
 standOnFloor(THREE,object);const anchors={};
 if(e.hangs)anchors.hang=[+object.position.x.toFixed(4),+object.position.y.toFixed(4),+object.position.z.toFixed(4)];
 root.userData.anchors=anchors;
 return root;
}

/** A made model from its parameters (the Lathe maker). */
export function buildMade(params,card){
 const p=normalizeLathe(params);
 return buildLathe(p,{name:card?.name||LATHE_FAMILIES[p.family].name});
}

/** The card a Lathe design gets: its words from the creator, its size and parts from the model. */
export function latheCard(params,{id,name,kind,purpose,tags=[],action,version=1},root,rules){
 const r=v=>+v.toFixed(3),k=rules.kinds[kind]||rules.kinds.prop;
 // only meshes count (the halo of a lit lamp is light)
 const b=new THREE.Box3();root.updateMatrixWorld(true);root.traverse(o=>{if(o.isMesh)b.expandByObject(o);});
 const p=normalizeLathe(params);
 return {format:1,id,name,kind,version,purpose,size:[r(b.max.x-b.min.x),r(b.max.y-b.min.y),r(b.max.z-b.min.z)],model:'model.glb',
  colours:{body:p.colours.body,trim:p.colours.trim},colliders:'auto',seats:[],spots:[],action:action||{kind:'look',label:'Look at the '+name.toLowerCase()},
  anchors:{...root.userData.anchors||{}},keepClear:[],budget:{triangles:k.triangles,materials:k.materials},tags,
  notes:`Made with Johansson Studio’s Lathe maker (${LATHE_FAMILIES[p.family].name}); its parameters are under "maker", so it can be opened and changed again.`,
  maker:p};
}

/**
 * The checks for a card and its built model, in Studio's order, each {id, label, ok, detail}: the card's own (complete,
 * purpose, brands, id) and the model's (floor, size next to a 1.6 m resident, phone budget, parts, collider, seats, room).
 */
export async function checkAsset(item,card,root,{made=null}={}){
 const [rules,extraBrands]=await Promise.all([loadRules(),loadExtraBrands()]);
 const built=made||madeFromObject(THREE,root,{anchors:root.userData.anchors||{}});
 const result=runChecks(THREE,built,card,rules);
 const checks=orderChecks([...cardChecks(card,rules,{assetId:card.id,taken:takenIds(item),extraBrands,recipe:''}),...result.checks],rules);
 return {checks,result,made:built,ok:checks.every(c=>c.ok)};
}

/** The STL bytes and what they are, for 3D printing (stl.js). */
export function stlOf(root,name){
 const triangles=trianglesOf(THREE,root),bytes=stlBytes(triangles,{name}),report=meshReport(triangles);
 const mm={...report,min:report.min.map(v=>v*1000),max:report.max.map(v=>v*1000)};
 return {bytes,report:mm,words:printWords(mm)};
}

/** The GLB for World: a catalogue asset's own published file, anything else written fresh from a new build. */
export async function glbOf(item,card){
 if(item.glb)return item.glb();
 const root=await item.build();
 return exportGlb(prepareForExport(root,card.name));
}

/** The resolved card World gets (checks, measures, colliders), with the maker's parameters. */
export async function resolvedCardOf(item,card){
 if(item.source==='catalogue')return card;
 const root=await item.build(),{checks,result,made}=await checkAsset(item,card,root);
 const out=resolveCard(card,made,result,checks);disposeMade(made);
 return out;
}

/** Everything an export needs, once: {card, checks, glb, stl, png, resolved}. Used by the agent API (asset_export). */
export async function exportAll(item,{card=null,png=true,hero=false,size=1200}={}){
 card??=await item.card();
 const root=await item.build(),{checks,result,made,ok}=await checkAsset(item,card,root);
 const resolved=item.source==='catalogue'?card:resolveCard(card,made,result,checks);disposeMade(made);
 const glb=await glbOf(item,card),stl=stlOf(await item.build(),card.name);
 const picture=png?await renderHero(await item.build(),{size,transparent:true}):null;
 const heroPng=hero?await renderHero(await item.build(),{size}):null;
 return {card,checks,ok,resolved,glb,stl,png:picture,hero:heroPng};
}

/** The hand-off package for World's draft (export.js assetPackage), for an asset whose checks all pass. */
export function handOff(resolved,glb,hero){return assetPackage({card:resolved,glb,hero,by:'ipad',sha:sha256});}
