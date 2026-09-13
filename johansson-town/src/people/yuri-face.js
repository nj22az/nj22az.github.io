import * as THREE from '../../vendor/three.module.js';

// Small, skinned facial features follow the actual cheek surface. No rectangular
// eye covers, floating face cards or extra character model are used for Thuan.
export function createYuriFace(model){
 let body;model.traverse(o=>{if(o.isSkinnedMesh&&!body)body=o;});if(!body)return null;
 const source=body.geometry,colors=source.attributes.color,pos=source.attributes.position;
 const matches=(i,r,g,b)=>Math.abs(colors.getX(i)-r)<.003&&Math.abs(colors.getY(i)-g)<.003&&Math.abs(colors.getZ(i)-b)<.003;
 const eye=i=>matches(i,.031,.018,.011)||matches(i,.048,.034,.022),skin=i=>matches(i,.617,.418,.238);
 const keep=[],surface=[];
 for(let n=0;n<source.index.count;n+=3){
  const tri=[0,1,2].map(j=>source.index.getX(n+j));
  if(!tri.every(eye))keep.push(...tri);
  if(tri.every(i=>skin(i)&&pos.getY(i)>1.59&&pos.getZ(i)>.08))surface.push(tri.map(i=>new THREE.Vector3().fromBufferAttribute(pos,i)));
 }
 body.geometry=source.clone();body.geometry.setIndex(keep);
 const skinZ=(x,y)=>{
  let z=-Infinity;
  for(const [a,b,c] of surface){
   const den=(b.y-c.y)*(a.x-c.x)+(c.x-b.x)*(a.y-c.y);if(Math.abs(den)<1e-10)continue;
   const u=((b.y-c.y)*(x-c.x)+(c.x-b.x)*(y-c.y))/den,v=((c.y-a.y)*(x-c.x)+(a.x-c.x)*(y-c.y))/den;
   if(u>=-.001&&v>=-.001&&u+v<=1.001)z=Math.max(z,u*a.z+v*b.z+(1-u-v)*c.z);
  }
  return Number.isFinite(z)?z:.145;
 };
 const points=[],rgb=[],indices=[],joints=[],weights=[],features=[];
 const head=body.skeleton.bones.findIndex(b=>b.name==='Head');
 function vertex(x,y,layer,color,kind,side=0,u=0,v=0){
  const i=points.length/3,c=new THREE.Color(color);points.push(x,y,skinZ(x,y)+layer);rgb.push(c.r,c.g,c.b);joints.push(head,0,0,0);weights.push(1,0,0,0);features.push({i,x,y,layer,kind,side,u,v});return i;
 }
 function patch(cx,cy,rx,ry,color,layer,kind,side=0){
  const start=vertex(cx,cy,layer,color,kind,side,0,0),count=16;
  for(let n=0;n<=count;n++){const a=n/count*Math.PI*2,u=Math.cos(a),v=Math.sin(a);vertex(cx+u*rx,cy+v*ry,layer,color,kind,side,u*rx,v*ry);if(n)indices.push(start,start+n,start+n+1);}
 }
 function ribbon(cx,cy,width,thickness,color,layer,kind,side=0){
  const first=points.length/3,count=12;
  for(let n=0;n<=count;n++)for(const edge of [-1,1]){
   const u=n/count*2-1,v=edge*thickness/2;vertex(cx+u*width/2,cy+v,layer,color,kind,side,u,v);
  }
  for(let n=0;n<count;n++){const a=first+n*2;indices.push(a,a+2,a+1,a+1,a+2,a+3);}
 }
 for(const side of [-1,1]){
  const x=side*.042,y=1.6908;
  patch(x,y,.019,.0105,0xf1e2d0,.001,'eye',side);
  patch(x,y,.0075,.0088,0x765447,.0018,'iris',side);
  patch(x,y,.0042,.0065,0x352c2a,.0024,'iris',side);
  patch(x-.002,y+.003,.0017,.0017,0xfff4e4,.003,'glint',side);
  ribbon(x,y+.001,.037,.0015,0x74514e,.0036,'lid',side);
  ribbon(x,1.7105,.037,.0027,0x77534f,.0015,'brow',side);
 }
 patch(0,1.62,.018,.0018,0xad7275,.0013,'mouth');
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(points,3));geometry.setAttribute('color',new THREE.Float32BufferAttribute(rgb,3));geometry.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(joints,4));geometry.setAttribute('skinWeight',new THREE.Float32BufferAttribute(weights,4));geometry.setIndex(indices);geometry.computeVertexNormals();
 const face=new THREE.SkinnedMesh(geometry,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.9,side:THREE.DoubleSide}));
 face.name='Thuan expressive face';face.userData.facialFeatures=true;face.frustumCulled=false;face.position.copy(body.position);face.quaternion.copy(body.quaternion);face.scale.copy(body.scale);face.bind(body.skeleton,body.bindMatrix.clone());body.parent.add(face);
 let time=0,smile=0;
 const state={blink:0,smile:0,mouth:0};
 function update(dt,{sleeping=false,engaged=false,speaking=false}={}){
  time+=dt;smile=THREE.MathUtils.damp(smile,engaged?.85:.18,5,dt);
  const phase=time%4.7,blink=sleeping?1:phase<.17?Math.sin(phase/.17*Math.PI):0,open=Math.max(.025,1-blink),mouth=speaking&&!sleeping?(.5+.5*Math.sin(time*15))*.0035:0;
  const p=geometry.attributes.position;
  for(const f of features){let x=f.x,y=f.y;
   if(['eye','iris','glint'].includes(f.kind))y=1.6908+(y-1.6908)*open;
   if(f.kind==='lid')y=1.6908+open*.008*(1-f.u*f.u)+f.v;
   if(f.kind==='brow')y+=.003*(1-f.u*f.u)+smile*.0015;
   if(f.kind==='mouth'){y+=smile*.004*(f.u/.018)**2+Math.sign(f.v)*mouth;}
   p.setXYZ(f.i,x,y,skinZ(x,y)+f.layer);
  }
  p.needsUpdate=true;geometry.computeVertexNormals();Object.assign(state,{blink,smile,mouth});
 }
 update(0);return {mesh:face,state,update};
}
