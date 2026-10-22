import * as THREE from '../../vendor/three.module.js';

// Studio proof v1. Original numerical tuning; Disney's reflectance research is a reference,
// not imported shader code. r170 supplies every feature used here. No recipe migration.
export const MATERIAL_PRESET_VERSION=1;
export const MATERIAL_PRESETS=Object.freeze({
 skin:Object.freeze({roughness:.76,metalness:0,specularIntensity:.28}),
 hair:Object.freeze({roughness:.52,metalness:0}),
 cotton:Object.freeze({roughness:.94,metalness:0}),
 satin:Object.freeze({roughness:.48,metalness:0,sheen:.24,sheenRoughness:.65,specularIntensity:.38})
});
const SURFACES=['legacy','skin','hair','cotton'];

/** Triangle ranges authored by the builder, independent of palette, UVs and bone weights.
 * Adjacent equal finishes share a draw. Vertex order stays intact for hats, hair and hands. */
export function collectSurfaceRegions(parts){
 const regions=[];let offset=0;const p=new THREE.Vector3(),q=new THREE.Vector3();
 for(const g of parts){
  const P=g.attributes.position,surface=g.userData.surface||'legacy';
  for(let i=0;i<P.count;i+=3){
   let id=surface;
   if(typeof surface==='function'){p.set(0,0,0);for(let j=0;j<3;j++)p.add(q.fromBufferAttribute(P,i+j));id=surface(p.multiplyScalar(1/3));}
   const materialIndex=Math.max(0,SURFACES.indexOf(id)),last=regions.at(-1);
   if(last&&last.materialIndex===materialIndex)last.count+=3;
   else regions.push({start:offset+i,count:3,materialIndex});
  }
  offset+=P.count;
 }
 return regions;
}

/** Each preview owns its materials. Textures remain owned by the original avatar.
 * The existing garment compositing hook is retained, with no new BRDF/shading patch. */
export function createPresetMaterial(source,id,{roughness}={}){
 const preset=MATERIAL_PRESETS[id];if(!preset)throw new Error('Unknown material finish: '+id);
 const physical=id==='skin'||id==='satin';
 const material=new (physical?THREE.MeshPhysicalMaterial:THREE.MeshStandardMaterial)();
 for(const key of ['color','emissive'])if(source[key])material[key].copy(source[key]);
 for(const key of ['map','alphaMap','emissiveMap','emissiveIntensity','transparent','opacity','side','alphaTest','fog','vertexColors','depthWrite','depthTest','shadowSide','polygonOffset','polygonOffsetFactor','polygonOffsetUnits','visible','toneMapped'])if(source[key]!==undefined)material[key]=source[key];
 Object.assign(material,preset);
 if(id==='satin')material.sheenColor.setHex(0xffffff);
 if(Number.isFinite(roughness))material.roughness=THREE.MathUtils.clamp(roughness,.35,1);
 material.name='Johansson study v1 · '+id;
 material.userData={materialPreset:{version:MATERIAL_PRESET_VERSION,id},keepPhysical:true,keepPhysicalStrict:true};
 if(source.userData?.garment){
  material.onBeforeCompile=source.onBeforeCompile.bind(source);
  material.customProgramCacheKey=()=>`study-v1-${id}-${source.customProgramCacheKey()}`;
 }
 return material;
}

/** Reversible per-avatar overlay. Dispose BEFORE disposing the avatar. Alternate bathing
 * outfits keep their existing materials throughout this first, ordinary-clothing proof. */
export function createAvatarMaterialStudy(avatar){
 const body=avatar.body,source=body.material,original=body.geometry;
 if(!body.userData.materialRegions)throw new Error('Build this avatar with materialStudy:true');
 // Index only the preview copy into four finish batches, keeping hat vertices last.
 // Attribute buffers, weights and positions stay shared with the original animation.
 // The original body/outline geometry and its hat draw range are never reordered.
 const geometry=new THREE.BufferGeometry();
 for(const [name,attribute] of Object.entries(original.attributes))geometry.setAttribute(name,attribute);
 geometry.boundingSphere=original.boundingSphere?.clone()||null;
 const buckets=Array.from({length:5},()=>[]),hatStart=body.userData.materialHatStart;
 for(const region of body.userData.materialRegions)for(let i=region.start;i<region.start+region.count;i++)buckets[i>=hatStart?4:region.materialIndex].push(i);
 const indices=[];for(let i=0;i<buckets.length;i++){if(buckets[i].length)geometry.addGroup(indices.length,buckets[i].length,i===4?0:i);for(const index of buckets[i])indices.push(index);}
 geometry.setIndex(indices);
 const heads=[];avatar.face.head.traverse(mesh=>{if(mesh.isMesh&&mesh.material===avatar.face.head.material)heads.push(mesh);});
 const headSource=avatar.face.head.material;
 const owned=new Map();let mode='legacy',cloth='cotton',active=false,disposed=false;
 function get(source,id){const key=source.uuid+':'+id;if(!owned.has(key))owned.set(key,createPresetMaterial(source,id));return owned.get(key);}
 function restore(){body.material=source;body.geometry=original;for(const mesh of heads)mesh.material=headSource;active=false;}
 function refresh(){
  if(disposed)return;
  const wanted=mode==='enhanced'&&avatar.outfit==='clothes';
  if(!wanted){if(active)restore();return;}
  geometry.setDrawRange(original.drawRange.start,original.drawRange.count);
  if(active)return;
  body.material=[source,get(source,'skin'),get(source,'hair'),get(source,cloth)];
  body.geometry=geometry;
  for(const mesh of heads)mesh.material=get(headSource,'skin');active=true;
 }
 return {
  set(options={}){if(disposed)return;if((options.mode===undefined||options.mode===mode)&&(options.cloth===undefined||options.cloth===cloth)){refresh();return this.state;}if(active)restore();if(['legacy','enhanced'].includes(options.mode))mode=options.mode;if(['cotton','satin'].includes(options.cloth))cloth=options.cloth;refresh();return this.state;},
  refresh,
  get state(){return {version:MATERIAL_PRESET_VERSION,mode,cloth,active,ownedMaterials:owned.size};},
  dispose(){if(disposed)return;restore();for(const material of owned.values())material.dispose();owned.clear();geometry.dispose();disposed=true;}
 };
}
