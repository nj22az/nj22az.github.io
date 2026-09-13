// node tools/pack-main-street.mjs /absolute/path/to/street_2.glb
// Preserve the supplied façades and repeating UVs; publish three small sections.
import {readFile,writeFile,mkdir,mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import * as THREE from '../vendor/three.module.js';
import {GLTFLoader} from '../vendor/GLTFLoader.js';
import {mergeVertices} from '../vendor/BufferGeometryUtils.js';
import {MeshoptSimplifier} from 'meshoptimizer';
const input=process.argv[2];if(!input)throw Error('Pass street_2.glb');
const bytes=await readFile(input),source=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)));
const folder=new URL('../assets/models/main-street/',import.meta.url);await mkdir(folder,{recursive:true});
const temp=await mkdtemp(join(tmpdir(),'town-frontage-'));
const scale=.022,sourceMin=-1106.4,sourceMax=1159.6,offset={x:-14.16,y:.02-10.8*scale,z:30.5+sourceMin*scale};
const sections=[['north',sourceMin,-221.9],['centre',-221.9,480.1],['south',480.1,sourceMax]];
try{
 const packed=spawnSync('python',['-c',`import sys,json,struct,io,hashlib
from pathlib import Path
from PIL import Image
b=Path(sys.argv[1]).read_bytes();n=struct.unpack_from('<I',b,12)[0];d=json.loads(b[20:20+n]);binary=b[28+n:];out=Path(sys.argv[2]);rects=[];mapping={};unique={}
for i,m in enumerate(d['materials']):
 p=m.get('pbrMetallicRoughness',{});factor=p.get('baseColorFactor',[1,1,1,1])
 if factor[3]<.01:continue
 if 'baseColorTexture' in p:
  image=d['images'][d['textures'][p['baseColorTexture']['index']]['source']];v=d['bufferViews'][image['bufferView']];a=v.get('byteOffset',0);im=Image.open(io.BytesIO(binary[a:a+v['byteLength']])).convert('RGB');im.thumbnail((256,256),Image.Resampling.LANCZOS)
 else:im=Image.new('RGB',(8,8),'white')
 key=hashlib.sha256(im.tobytes()+str(im.size).encode()).hexdigest()
 if key not in unique:unique[key]=len(rects);rects.append({'image':im,'key':key})
 mapping[i]=unique[key]
pages=[Image.new('RGB',(2048,2048),(176,173,164))];x=y=row=0;g=8
for r in sorted(rects,key=lambda r:-r['image'].height):
 im=r['image'];w,h=im.size
 if x+w+2*g>2048:x=0;y+=row;row=0
 if y+h+2*g>2048:pages.append(Image.new('RGB',(2048,2048),(176,173,164)));x=y=row=0
 page=pages[-1];page.paste(im,(x+g,y+g));page.paste(im.crop((0,0,1,h)).resize((g,h)),(x,y+g));page.paste(im.crop((w-1,0,w,h)).resize((g,h)),(x+g+w,y+g));page.paste(page.crop((x,y+g,x+w+2*g,y+g+1)).resize((w+2*g,g)),(x,y));page.paste(page.crop((x,y+g+h-1,x+w+2*g,y+g+h)).resize((w+2*g,g)),(x,y+g+h))
 r.update({'page':len(pages)-1,'region':[(x+g+.5)/2048,(y+g+.5)/2048,(w-1)/2048,(h-1)/2048]});x+=w+2*g;row=max(row,h+2*g)
for i,p in enumerate(pages):p.save(out/('atlas-'+str(i)+'.jpg'),quality=90,optimize=True)
(out/'atlases.json').write_text(json.dumps({'pages':len(pages),'materials':{i:{'page':rects[j]['page'],'region':rects[j]['region']} for i,j in mapping.items()}}))
`,input,temp],{encoding:'utf8'});if(packed.status)throw Error(packed.stderr);
 const atlas=JSON.parse(await readFile(join(temp,'atlases.json')));
 for(let i=0;i<atlas.pages;i++)await writeFile(new URL('atlas-'+i+'.jpg',folder),await readFile(join(temp,'atlas-'+i+'.jpg')));
 globalThis.self=globalThis;globalThis.createImageBitmap=async()=>({width:256,height:256,close(){}});
 const asset=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');asset.scene.updateMatrixWorld(true);
 await MeshoptSimplifier.ready;
 const meshes=[];let sourceTriangles=0;
 asset.scene.traverse(m=>{if(!m.isMesh)return;const material=asset.parser.associations.get(m.material)?.materials;if(!atlas.materials[material])return;const geometry=m.geometry.clone().applyMatrix4(m.matrixWorld);sourceTriangles+=geometry.index.count/3;meshes.push({geometry,material});});
 const clip=(polygon,axis,value,greater)=>{const out=[];for(let i=0;i<polygon.length;i++){const a=polygon[i],b=polygon[(i+1)%polygon.length],da=(a[axis]-value)*(greater?1:-1),db=(b[axis]-value)*(greater?1:-1);if(da>=0)out.push(a);if((da>=0)!==(db>=0)){const t=da/(da-db);out.push(a.map((n,j)=>n+(b[j]-n)*t));}}return out;};
 const report=[];
 for(const [name,minZ,maxZ] of sections){
  const buckets=new Map();let kept=0;
  for(const {geometry:g,material} of meshes){
   const p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv,ix=g.index.array,vertices=[];
   for(let i=0;i<ix.length;i+=3){const ids=[ix[i],ix[i+1],ix[i+2]];
    if(ids.every(k=>p.getZ(k)<minZ)||ids.every(k=>p.getZ(k)>maxZ)||ids.some(k=>p.getX(k)<-350)||ids.every(k=>p.getY(k)<=12))continue;
    let polygon=ids.map(k=>[p.getX(k),p.getY(k),p.getZ(k),n.getX(k),n.getY(k),n.getZ(k),uv?.getX(k)||0,uv?.getY(k)||0]);
    polygon=clip(clip(polygon,2,minZ,true),2,maxZ,false);polygon=clip(polygon,1,10.8,true);
    for(let k=1;k<polygon.length-1;k++)for(const v of [polygon[0],polygon[k],polygon[k+1]])vertices.push(...v);
   }
   if(!vertices.length)continue;kept+=vertices.length/24;
   const count=vertices.length/8,positions=new Float32Array(count*3),normals=new Float32Array(count*3),coords=new Float32Array(count*2);
   for(let k=0;k<count;k++){positions.set([-vertices[k*8]*scale+offset.x,vertices[k*8+1]*scale+offset.y,-vertices[k*8+2]*scale+offset.z],k*3);normals.set([-vertices[k*8+3],vertices[k*8+4],-vertices[k*8+5]],k*3);coords.set(vertices.slice(k*8+6,k*8+8),k*2);}
   let welded=new THREE.BufferGeometry();welded.setAttribute('position',new THREE.BufferAttribute(positions,3));welded.setAttribute('normal',new THREE.BufferAttribute(normals,3));welded.setAttribute('uv',new THREE.BufferAttribute(coords,2));welded=mergeVertices(welded,.00001);
   const original=new Uint32Array(welded.index.array),a=welded.attributes;
   const [indices,error]=original.length>600?MeshoptSimplifier.simplifyWithAttributes(original,a.position.array,3,a.uv.array,2,[.08,.08],null,Math.floor(original.length*.12/3)*3,.025,['ErrorAbsolute','Permissive']):[original,0];
   const {page,region}=atlas.materials[material];if(!buckets.has(page))buckets.set(page,[]);const dest=buckets.get(page),tint=source.materials[material].pbrMetallicRoughness?.baseColorFactor||[1,1,1,1];
   for(const k of indices)dest.push(a.position.getX(k),a.position.getY(k),a.position.getZ(k),a.normal.getX(k),a.normal.getY(k),a.normal.getZ(k),a.uv.getX(k),a.uv.getY(k),...region,...tint.slice(0,3));
  }
  const out={asset:{...source.asset,generator:'Johansson Town Street 2 packer'},scene:0,scenes:[{nodes:[]}],nodes:[],meshes:[],materials:[],accessors:[],bufferViews:[],buffers:[],extras:{source:'street_2.glb',section:name,atlasSampling:'repeat UV0 within the UV1/UV2 atlas region'}};
  const chunks=[];let length=0,triangles=0;const bounds=new THREE.Box3();
  const view=a=>{const b=Buffer.from(a.buffer,a.byteOffset,a.byteLength),index=out.bufferViews.length;out.bufferViews.push({buffer:0,byteOffset:length,byteLength:b.length});chunks.push(b);length+=b.length;const pad=(4-length%4)%4;if(pad){chunks.push(Buffer.alloc(pad));length+=pad;}return index;};
  const attr=(a,size,type=5126)=>{const index=out.accessors.length,e={bufferView:view(a),componentType:type,count:a.length/size,type:size===1?'SCALAR':size===2?'VEC2':'VEC3'};if(size===3){e.min=[Infinity,Infinity,Infinity];e.max=[-Infinity,-Infinity,-Infinity];for(let k=0;k<a.length;k++){e.min[k%3]=Math.min(e.min[k%3],a[k]);e.max[k%3]=Math.max(e.max[k%3],a[k]);}}out.accessors.push(e);return index;};
  for(const [page,values] of buckets){
   const count=values.length/15,geometry=new THREE.BufferGeometry();
   for(const [label,size,offset] of [['position',3,0],['normal',3,3],['uv',2,6],['uv1',2,8],['uv2',2,10],['color',3,12]]){const data=new Float32Array(count*size);for(let k=0;k<count;k++)for(let j=0;j<size;j++)data[k*size+j]=values[k*15+offset+j];geometry.setAttribute(label,new THREE.BufferAttribute(data,size));}
   const g=mergeVertices(geometry,.00001),attributes={};for(const [label,semantic] of [['position','POSITION'],['normal','NORMAL'],['uv','TEXCOORD_0'],['uv1','TEXCOORD_1'],['uv2','TEXCOORD_2'],['color','COLOR_0']])attributes[semantic]=attr(g.attributes[label].array,g.attributes[label].itemSize);
   const index=out.nodes.length,indices=g.index.count&&g.attributes.position.count<65536?new Uint16Array(g.index.array):new Uint32Array(g.index.array);triangles+=indices.length/3;g.computeBoundingBox();bounds.union(g.boundingBox);
   out.materials.push({name:'frontage-atlas-'+page,pbrMetallicRoughness:{baseColorFactor:[1,1,1,1],metallicFactor:0,roughnessFactor:.93},extras:{frontageAtlas:page}});
   out.nodes.push({name:'Main Street '+name+' atlas '+page,mesh:index});out.scenes[0].nodes.push(index);out.meshes.push({primitives:[{attributes,indices:attr(indices,1,indices.BYTES_PER_ELEMENT===2?5123:5125),material:index}]});
  }
  out.buffers=[{byteLength:length}];let json=Buffer.from(JSON.stringify(out));json=Buffer.concat([json,Buffer.alloc((4-json.length%4)%4,32)]);const binary=Buffer.concat(chunks),header=Buffer.alloc(20),bh=Buffer.alloc(8);header.writeUInt32LE(0x46546c67);header.writeUInt32LE(2,4);header.writeUInt32LE(28+json.length+binary.length,8);header.writeUInt32LE(json.length,12);header.writeUInt32LE(0x4e4f534a,16);bh.writeUInt32LE(binary.length);bh.writeUInt32LE(0x004e4942,4);const output=Buffer.concat([header,json,bh,binary]);
  await writeFile(new URL(name+'.glb',folder),output);report.push({id:name,file:name+'.glb',bytes:output.length,triangles,draws:out.meshes.length,min:bounds.min.toArray(),max:bounds.max.toArray()});console.log(name,output.length,triangles);
 }
 const manifest={source:source.asset.extras,sourceFile:'street_2.glb',sourceSha256:createHash('sha256').update(bytes).digest('hex'),sourceBytes:bytes.length,sourceOpaqueTriangles:sourceTriangles,scale,sourceRange:[sourceMin,sourceMax],offset,atlasSize:2048,atlasCount:atlas.pages,textureLimit:256,maximumSimplificationError:.025,sections:report};
 await writeFile(new URL('manifest.json',folder),JSON.stringify(manifest,null,2)+'\n');
 await writeFile(new URL('../src/world/main-street-sections.js',import.meta.url),'// Generated from street_2.glb by tools/pack-main-street.mjs.\nexport const MAIN_STREET_SECTIONS='+JSON.stringify(report)+';\nexport const FRONTAGE_ATLAS_COUNT='+atlas.pages+';\n');
}finally{await rm(temp,{recursive:true,force:true});}
