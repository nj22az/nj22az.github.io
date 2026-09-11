import * as THREE from '../../vendor/three.module.js';

// Smooth duplicated export vertices without changing position, colour, skinning or topology.
// A crease threshold keeps collars, shoe soles and disconnected parts crisp.
export function smoothCharacterNormals(geometry,creaseDegrees=70){
 const position=geometry.attributes.position,normal=geometry.attributes.normal,skin=geometry.attributes.skinIndex,weight=geometry.attributes.skinWeight,colour=geometry.attributes.color;
 if(!position||!normal)return {vertices:0,changed:0};
 const buckets=new Map(),keys=[],factor=1e5,cosine=Math.cos(creaseDegrees*Math.PI/180),original=normal.array.slice();
 for(let i=0;i<position.count;i++){
  const values=[position.getX(i),position.getY(i),position.getZ(i)];
  if(colour)values.push(colour.getX(i),colour.getY(i),colour.getZ(i));
  if(skin&&weight)for(let j=0;j<4;j++)values.push(skin.getComponent(i,j),weight.getComponent(i,j));
  const key=values.map(v=>Math.round(v*factor)).join('/');keys.push(key);if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(i);
 }
 let changed=0;
 for(let i=0;i<position.count;i++){
  let x=0,y=0,z=0;const n=new THREE.Vector3().fromArray(original,i*3);
  for(const j of buckets.get(keys[i])){const other=new THREE.Vector3().fromArray(original,j*3);if(n.dot(other)>=cosine){x+=other.x;y+=other.y;z+=other.z;}}
  const result=new THREE.Vector3(x,y,z).normalize();if(result.lengthSq()===0)result.copy(n);
  if(result.distanceToSquared(n)>1e-8)changed++;normal.setXYZ(i,result.x,result.y,result.z);
 }
 normal.needsUpdate=true;geometry.userData.normalSmoothing={creaseDegrees,vertices:position.count,changed};return geometry.userData.normalSmoothing;
}

// Recognise garment palettes from torso bones and exclude palettes found on skin/hair.
// Each identity gets its own colour buffer; positions, skin weights and clips stay shared.
export function dressCharacter(mesh,colour,style){
 if(!(style?.top||colour)||!mesh.isSkinnedMesh||!mesh.geometry.attributes.color)return;
 const source=mesh.geometry,colors=source.attributes.color,skin=source.attributes.skinIndex,weights=source.attributes.skinWeight;
 const key=i=>[colors.getX(i),colors.getY(i),colors.getZ(i)].map(v=>Math.round(v*10000)).join('/');
 const garment=new Set(),protectedColours=new Set();
 for(let i=0;i<colors.count;i++){
  let best=0;for(let j=1;j<4;j++)if(weights.getComponent(i,j)>weights.getComponent(i,best))best=j;
  const bone=mesh.skeleton.bones[skin.getComponent(i,best)]?.name||'';
  if(/Head|Neck|Wrist|Finger|Thumb/i.test(bone))protectedColours.add(key(i));
  if(/Chest|Torso|Abdomen/i.test(bone))garment.add(key(i));
 }
 const target=new THREE.Color(style?.top||colour),out=colors.clone();let changed=0;
 const palette={hair:new THREE.Color(style?.hair||'#302820'),skin:new THREE.Color(style?.skin||'#cba27e'),trousers:new THREE.Color(style?.trousers||'#405060'),helmet:new THREE.Color(style?.helmet||'#737768')};
 const hairPalette={suit:[.067,.027,.009],worker:[.163,.053,.001],casual_2:[.067,.027,.009],female_casual:[.260,.179,.063],female_formal:[.138,.016,.004]};
 for(let i=0;i<colors.count;i++){
  let best=0;for(let j=1;j<4;j++)if(weights.getComponent(i,j)>weights.getComponent(i,best))best=j;
  const bone=mesh.skeleton.bones[skin.getComponent(i,best)]?.name||'',rgb=[colors.getX(i),colors.getY(i),colors.getZ(i)];
  const matches=sample=>sample&&sample.every((v,j)=>Math.abs(rgb[j]-v)<.003);
  let personal=null,shade=1;
  if(style){
   if(matches([.617,.418,.238]))personal=palette.skin;
   else if(matches([.487,.331,.190])){personal=palette.skin;shade=.79;}
   else if(/Head/.test(bone)&&matches(hairPalette[style.source]))personal=palette.hair;
   else if(style.helmet&&matches([.456,.296,.007]))personal=palette.helmet;
   else if(/Leg/.test(bone)&&!protectedColours.has(key(i))&&!matches([.018,.018,.018])&&!matches([.050,.050,.050])){personal=palette.trousers;shade=.75+Math.max(...rgb)*.4;}
  }
  if(personal){out.setXYZ(i,personal.r*shade,personal.g*shade,personal.b*shade);changed++;}
  else if(garment.has(key(i))&&!protectedColours.has(key(i))){
  const luminance=.2126*colors.getX(i)+.7152*colors.getY(i)+.0722*colors.getZ(i),shade=THREE.MathUtils.clamp(.55+luminance,.65,1.2);
  out.setXYZ(i,target.r*shade,target.g*shade,target.b*shade);changed++;
  }
 }
 const geometry=new THREE.BufferGeometry();geometry.setIndex(source.index);for(const [name,attribute] of Object.entries(source.attributes))geometry.setAttribute(name,name==='color'?out:attribute);
 geometry.boundingBox=source.boundingBox?.clone()||null;geometry.boundingSphere=source.boundingSphere?.clone()||null;geometry.userData={...source.userData,wardrobeVertices:changed};mesh.geometry=geometry;
}
