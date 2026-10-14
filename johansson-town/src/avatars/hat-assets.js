import * as THREE from '../../vendor/three.module.js';
import {shapeHeadPoint} from './head-profile.js';

/**
 * Hats that are models from World's asset catalogue, worn by anyone (the creator, 2026-10-14: "he should be wearing a 3d
 * asset, you should be able to buy a nice hat in the Konbini and wear it"). The first is the Minato Seagulls cap
 * (assets/catalog/seagulls-cap/: built in Blender by its source/build-seagulls-cap.py, checked and published by
 * Johansson Studio).
 *
 * How it works:
 *  - A recipe names the hat (`outfit.hat: 'seagulls-cap'`). ASSET_HATS says which catalogue asset that is, and which of
 *    build.js's own hats stands in for it while the model is not in hand (never a bare head).
 *  - Somebody fetches the model once (World: src/catalog/hat-models.js; a test or a tool: the file from disk; the film:
 *    its own copy) and hands its bytes to provideHatModel(). The GLB is read here, without GLTFLoader, so this file runs
 *    wherever build.js runs (Node, World, Studio, the film's copy of the avatars) and a body is built in one go.
 *  - build.js asks assetHatPieces(recipe, m) for the hat's pieces, fitted to this head, and binds them to the head bone
 *    like every other part, as the last range of the body: the hat comes off (setHat) and goes on a hook
 *    (buildHatProp) as every hat does, and follows the head in every move.
 *  - The fit: the model records the head it was built on (extras `wear.head`: its centre and radii, the town's default
 *    adult). A point's place on that head, in head radii, is carried to the same place on the wearer's head (their radii,
 *    and the shape of their head: head-profile.js), so it sits the same on a child, a big round head or a narrow one.
 *  - The hair: under the crown it is pressed in to the cap's sweatband (`wear.tuck`), above the band line all round,
 *    except in the snapback's opening above the strap, where it shows (and a ponytail comes through). hatTuck() gives
 *    build.js that rule.
 *  - The colours: the cloth material's vertex colour is a shade of the wearer's `hatColour` (one model is a navy, a
 *    white or a green cap); the other materials carry their own colours (the green undervisor, the sweatband, the button,
 *    the straps, the embroidery).
 */

/** Recipe hat id → its catalogue asset, and the hat build.js draws until the model is in hand. */
export const ASSET_HATS=Object.freeze({
 'seagulls-cap':Object.freeze({asset:'seagulls-cap',standIn:'cap',name:'Seagulls cap'}),
});
export const isAssetHat=id=>Object.hasOwn(ASSET_HATS,id);
/** The catalogue ids of every asset hat (what a page fetches before it builds people). */
export const assetHatIds=()=>[...new Set(Object.values(ASSET_HATS).map(h=>h.asset))];

const models=new Map();
/** True once the model of a hat (a recipe hat id or a catalogue id) is in hand. */
export function hatModelLoaded(id){const asset=ASSET_HATS[id]?.asset??id;return models.has(asset);}
/** The parsed model of a catalogue hat, or null: {asset, wear, meshes:[{name, material, ink, position, colour, index}]}. */
export const hatModel=id=>models.get(ASSET_HATS[id]?.asset??id)||null;

// ---- Reading the GLB ----------------------------------------------------------------------------------------------
const COMPONENTS={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT4:16};
const ARRAYS={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array};
const NORMALIZE={5120:127,5121:255,5122:32767,5123:65535};

function readAccessor(json,bin,index){
 const a=json.accessors[index],view=json.bufferViews[a.bufferView],Type=ARRAYS[a.componentType],n=COMPONENTS[a.type];
 if(!Type||!n)throw new Error(`hat model: accessor ${index} has a type this reader does not know`);
 if(a.sparse)throw new Error('hat model: sparse accessors are not read');
 const size=Type.BYTES_PER_ELEMENT,stride=view.byteStride||size*n,start=bin.byteOffset+(view.byteOffset||0)+(a.byteOffset||0);
 const out=new Float32Array(a.count*n),dv=new DataView(bin.buffer);
 const get={5120:'getInt8',5121:'getUint8',5122:'getInt16',5123:'getUint16',5125:'getUint32',5126:'getFloat32'}[a.componentType];
 const scale=a.normalized?1/NORMALIZE[a.componentType]:1;
 for(let i=0;i<a.count;i++)for(let k=0;k<n;k++)out[i*n+k]=dv[get](start+i*stride+k*size,true)*scale;
 return {array:out,itemSize:n,count:a.count};
}
const extrasOf=o=>{const e=o?.extras;return e&&typeof e==='object'?e:{};};
const parseMaybe=v=>{if(typeof v!=='string')return v;try{return JSON.parse(v);}catch{return v;}};

/**
 * Reads a binary glTF (Blender's, or the one Johansson Studio exports from it with three's GLTFExporter) into what a hat
 * needs: every triangle mesh in the file's frame (its nodes' transforms applied), its material's name, its vertex
 * colours, whether World inks it (node extras `ink`, 1 when it does not say), and the `wear` record from the node that
 * carries it. Strict: anything it does not read (no positions, no triangles, a missing `wear`) throws.
 */
export function readHatGlb(bytes){
 const data=bytes instanceof ArrayBuffer?new Uint8Array(bytes):new Uint8Array(bytes.buffer,bytes.byteOffset,bytes.byteLength);
 const dv=new DataView(data.buffer,data.byteOffset,data.byteLength);
 if(dv.getUint32(0,true)!==0x46546c67||dv.getUint32(4,true)!==2)throw new Error('hat model: not a binary glTF 2.0');
 let at=12,json=null,bin=null;
 while(at<dv.byteLength){
  const length=dv.getUint32(at,true),type=dv.getUint32(at+4,true),chunk=new Uint8Array(data.buffer,data.byteOffset+at+8,length);
  if(type===0x4e4f534a)json=JSON.parse(new TextDecoder().decode(chunk));else if(type===0x004e4942)bin=chunk;
  at+=8+length;
 }
 if(!json||!bin)throw new Error('hat model: no JSON or no binary chunk');
 const meshes=[];let wear=null,asset=null;
 const visit=(index,parent)=>{
  const node=json.nodes[index],extras=extrasOf(node),local=new THREE.Matrix4();
  if(node.matrix)local.fromArray(node.matrix);
  else local.compose(new THREE.Vector3(...(node.translation||[0,0,0])),new THREE.Quaternion(...(node.rotation||[0,0,0,1])),new THREE.Vector3(...(node.scale||[1,1,1])));
  const world=parent.clone().multiply(local);
  if(extras.wear&&!wear){wear=parseMaybe(extras.wear);asset=extras.asset||extras.name||node.name;}
  if(node.mesh!==undefined)for(const prim of json.meshes[node.mesh].primitives){
   if((prim.mode??4)!==4)throw new Error('hat model: only triangles are read');
   const P=readAccessor(json,bin,prim.attributes.POSITION),C=prim.attributes.COLOR_0!==undefined?readAccessor(json,bin,prim.attributes.COLOR_0):null;
   const position=new Float32Array(P.count*3),v=new THREE.Vector3();
   for(let i=0;i<P.count;i++){v.fromArray(P.array,i*3).applyMatrix4(world);v.toArray(position,i*3);}
   const colour=new Float32Array(P.count*3);
   for(let i=0;i<P.count;i++)for(let k=0;k<3;k++)colour[i*3+k]=C?C.array[i*C.itemSize+k]:1;
   const index=prim.indices!==undefined?Uint32Array.from(readAccessor(json,bin,prim.indices).array):Uint32Array.from({length:P.count},(_,i)=>i);
   const material=prim.material!==undefined?json.materials[prim.material].name||'':'';
   meshes.push({name:extras.name||node.name||'',material,ink:extras.ink===undefined?1:+extras.ink,position,colour,index});
  }
  for(const child of node.children||[])visit(child,world);
 };
 const scene=json.scenes[json.scene??0];
 for(const root of scene.nodes)visit(root,new THREE.Matrix4());
 if(!wear?.head?.radii||!wear?.band||!wear?.tuck)throw new Error('hat model: no `wear` record (the head it was built on, its band, its tuck)');
 if(!meshes.length)throw new Error('hat model: no meshes');
 return {asset,wear,meshes};
}

/** Takes a hat's model (the GLB's bytes, fetched or read by whoever has it) for a catalogue id. Returns the parsed model. */
export function provideHatModel(assetId,bytes){
 if(!Object.values(ASSET_HATS).some(h=>h.asset===assetId))throw new Error(`${JSON.stringify(assetId)} is not a hat in ASSET_HATS`);
 const model=readHatGlb(bytes);
 models.set(assetId,Object.freeze(model));
 return model;
}

// ---- The band, the opening and the tuck, from the model's `wear` record --------------------------------------------
const wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
const smooth=(e0,e1,x)=>{const t=Math.min(1,Math.max(0,(x-e0)/(e1-e0)));return t*t*(3-2*t);};
/**
 * The band's bottom edge (head radii above the head's centre) at azimuth phi (0 the front, +π/2 the wearer's left): in
 * front it follows the bill's curve from the forehead down to the temples, behind them it settles over the ears to the
 * nape. The same curve the build script cut the crown to (build-seagulls-cap.py band_y).
 */
export function bandHeight(wear,phi){
 const {front,side,back,billRoot,arch}=wear.band,a=Math.abs(wrap(phi));
 if(a<=billRoot)return front-arch*(Math.sin(a)/Math.sin(billRoot))**2;
 const f=(a-billRoot)/(Math.PI-billRoot),m0=-arch*2*Math.cos(billRoot)/Math.sin(billRoot)*(Math.PI-billRoot)/(side-back);
 return back+(side-back)*((2*f**3-3*f**2+1)+(f**3-2*f**2+f)*m0);
}

/**
 * The hair rule under an asset hat, or null (not an asset hat, or its model is not in hand: the stand-in's own rule
 * applies). A function of a hair point in head radii (x, y, z, its distance r from the head's centre) that returns how far
 * out it may be: pressed in to the sweatband above the band line (ramping in over the last 0.08 below it, so the hair is
 * held by the band rather than cut), left alone below it and in the snapback's opening above the strap.
 */
export function hatTuck(recipe){
 const model=hatModel(recipe?.outfit?.hat);
 if(!isAssetHat(recipe?.outfit?.hat)||!model)return null;
 const w=model.wear,{radius,front,frontFrom,frontTo}=w.tuck,o=w.opening;
 return (x,y,z,r)=>{
  const phi=Math.atan2(x,z),band=bandHeight(w,phi);
  if(o){const d=Math.abs(wrap(phi-Math.PI))/o.halfWidth;if(d<1&&y>band+o.strapHeight&&y<band+o.height*Math.sqrt(1-d*d))return r;}
  const limit=radius+(front-radius)*smooth(frontFrom,frontTo,Math.cos(phi)),hold=smooth(band-.08,band,y);
  return r>limit?r-(r-limit)*hold:r;
 };
}

// ---- Wearing it ------------------------------------------------------------------------------------------------------
const key=(r,g,b)=>`${Math.round(r*4096)},${Math.round(g*4096)},${Math.round(b*4096)}`;
/**
 * The hat's pieces on this head, or null when its model is not in hand: [{geometry (non-indexed, positions in the body's
 * model space, normals), colour (THREE.Color, linear), ink (0 or 1), name}], one piece per mesh and colour, for build.js to
 * paint and bind to the head bone. `m` is build.js measure(recipe).
 */
export function assetHatPieces(recipe,m){
 const model=hatModel(recipe.outfit.hat);
 if(!isAssetHat(recipe.outfit.hat)||!model)return null;
 const {centre,radii}=model.wear.head,R=m.Rh,S=[m.headSX*R,m.headSY*R,R*.98];
 const cloth=new THREE.Color(recipe.outfit.hatColour),u=new THREE.Vector3(),pieces=[];
 for(const mesh of model.meshes){
  // Carried onto this head: the place on the head it was built on, in head radii, shaped as this head is.
  const P=mesh.position,count=P.length/3,out=new Float32Array(P.length);
  for(let i=0;i<count;i++){
   u.set((P[i*3]-centre[0])/radii[0],(P[i*3+1]-centre[1])/radii[1],(P[i*3+2]-centre[2])/radii[2]);
   shapeHeadPoint(u,m.profile);
   out[i*3]=u.x*S[0];out[i*3+1]=m.headCentre+u.y*S[1];out[i*3+2]=u.z*S[2];
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(out,3));g.setIndex(new THREE.BufferAttribute(mesh.index,1));
  g.computeVertexNormals();
  const flat=g.toNonIndexed();g.dispose();
  // One piece per colour: a triangle takes its first corner's colour (the model's colours are per face).
  const groups=new Map(),I=mesh.index,C=mesh.colour,tinted=mesh.material==='cloth';
  for(let t=0;t<I.length/3;t++){
   const c=I[t*3],k=key(C[c*3],C[c*3+1],C[c*3+2]);
   if(!groups.has(k))groups.set(k,{shade:[C[c*3],C[c*3+1],C[c*3+2]],tris:[]});
   groups.get(k).tris.push(t);
  }
  for(const {shade,tris} of groups.values()){
   const pos=new Float32Array(tris.length*9),nrm=new Float32Array(tris.length*9),FP=flat.attributes.position.array,FN=flat.attributes.normal.array;
   tris.forEach((t,j)=>{pos.set(FP.subarray(t*9,t*9+9),j*9);nrm.set(FN.subarray(t*9,t*9+9),j*9);});
   const piece=new THREE.BufferGeometry();piece.setAttribute('position',new THREE.BufferAttribute(pos,3));piece.setAttribute('normal',new THREE.BufferAttribute(nrm,3));
   const colour=tinted?cloth.clone().multiply(new THREE.Color(shade[0],shade[1],shade[2])):new THREE.Color(shade[0],shade[1],shade[2]);
   pieces.push({geometry:piece,colour,ink:mesh.ink?1:0,name:mesh.name});
  }
  flat.dispose();
 }
 return pieces;
}
