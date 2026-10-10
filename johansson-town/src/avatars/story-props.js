import * as THREE from '../../vendor/three.module.js';
import {celFrom} from '../render/cel.js';
import {bodyVolume} from './build.js';

/**
 * Small things the story puts on a body, each with its reason (nothing is random), built light for phones: a handful of
 * plain shapes each, cel-shaded like the room they come from, no textures, and at most one light (only once it is
 * switched on). They are carried by the body's own bones, so they move with it; the moves that use them (animate.js:
 * TorchUp, TorchOff, SitRead, CordWrapped, BasketHead) say where the hands are, and this module places the thing.
 *
 *   storyProps(avatar).give('torch')          Tetsuo's pocket torch, clipped to his shirt (or vest) at the left chest
 *   storyProps(avatar).give('basketOnHead')   a locker basket upside down on the head, resting on the head (or its towel)
 *   storyProps(avatar).give('newspaper')      the evening paper, folded, held open between the two mittens while reading
 *   storyProps(avatar).give('dryerCord')      the vanity dryer's cord, wound round the body and its pinned arms
 *
 * The moves give what they need themselves (SitRead the paper, CordWrapped the cord, BasketHead the basket, TorchUp the
 * torch, at his pocket); giving it beforehand puts it in place before the move (the torch on his pocket in 3f).
 */
export const STORY_PROPS=Object.freeze({
 torch:Object.freeze({who:'Tetsuo',why:'The island’s electrician carries a pocket torch for dark switchboards and roof spaces; in Umi-no-yu’s blackout it is the only light, and he switches the loads off by it before the breaker goes back up.',
  where:'Head down in his shirt pocket at the left chest beside his badge (after the bath, clipped to the vest’s neckline), where his right hand finds it without looking.'}),
 basketOnHead:Object.freeze({who:'Thuan',why:'In the dark she grabbed the nearest thing from the lockers to feel her way: a rattan clothes basket, which ends up on her head.',
  where:'The women’s room lockers’ basket (0.40 × 0.40 × 0.22 m, the men’s side’s size), upside down on the crown, askew, resting on her head towel.'}),
 newspaper:Object.freeze({who:'Tetsuo',why:'After his bath he reads the evening paper on the koagari edge, which is why nobody pays him any attention until the lights go.',
  where:'Folded once down the middle and held open like a book in both mittens, at reading distance before the chest.'}),
 dryerCord:Object.freeze({who:'Thao',why:'Spinning round in the dark with her dryer still in her hand, she winds herself up in its own cord, like a parcel.',
  where:'From the dryer’s handle in her right mitten, four turns round her and her arms from under the arms to the hips, then away to the socket.'}),
});

const mat=(c,o={})=>celFrom(new THREE.MeshStandardMaterial({color:c,roughness:.6,...o}),{bands:'soft3'});
const add=(g,geo,m,x=0,y=0,z=0)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=true;g.add(o);return o;};

/**
 * The pocket torch: a 13 cm penlight-sized electrician's torch, black with a chrome head, a steel pocket clip along its
 * side. Built along +z (the lens at +z), its origin where the mitten grips it (the middle of the body); the clip on its +y
 * side, by the tail. setOn(true) lights the lens and the little beam and, the first time, adds its light: a small warm spot from the
 * lens, aimed (aimAt) at the face of whoever holds it before their chest, so the face is lit from below and little else
 * (the spill a torch held under the chin throws up; nothing beyond a metre).
 */
export const TORCH=Object.freeze({length:.13,radius:.0105,head:.014,lensAt:.072,light:Object.freeze({colour:0xffe6b8,intensity:.4,distance:1.2,angle:.42,penumbra:.75,decay:2})});
export function buildPocketTorch(){
 const g=new THREE.Group();g.name='Pocket torch';
 const black=mat(0x26282a,{roughness:.45}),chrome=mat(0xc9ccce,{metalness:.8,roughness:.25}),steel=mat(0x9aa0a4,{metalness:.7,roughness:.35});
 const T=TORCH,cyl=(r0,r1,h,z,m,seg=14)=>add(g,new THREE.CylinderGeometry(r0,r1,h,seg).rotateX(Math.PI/2),m,0,0,z);
 cyl(T.radius,T.radius,.1,-.012,black);                 // the barrel (the batteries)
 cyl(T.head,T.radius,.022,.049,black);                  // the head, flaring a little
 cyl(T.head*1.02,T.head*1.02,.006,.063,chrome);         // the bezel
 cyl(T.radius*.9,T.radius*.9,.006,-.064,chrome);        // the tail cap with the switch
 const lensMat=new THREE.MeshStandardMaterial({color:0xfff6dc,emissive:0x000000,emissiveIntensity:0,roughness:.2});
 const lens=cyl(T.head*.86,T.head*.86,.002,.0665,lensMat);lens.castShadow=false;
 // the clip: a steel strip from the tail along the side, standing a little off the barrel
 add(g,new THREE.BoxGeometry(.005,.0016,.058),steel,0,T.radius+.0022,-.035);
 add(g,new THREE.BoxGeometry(.005,.0035,.006),steel,0,T.radius+.0012,-.063);
 // the beam: a short soft cone out of the lens, added light, fading to nothing (drawn only when on)
 const L=.32,cone=new THREE.CylinderGeometry(T.head*.8,.07,L,16,4,true).rotateX(Math.PI/2);cone.translate(0,0,.068+L/2);
 const P=cone.attributes.position,col=new Float32Array(P.count*4);
 for(let i=0;i<P.count;i++){const u=(P.getZ(i)-.068)/L;col.set([1,.95,.82,.2*(1-u)**2],i*4);}
 cone.setAttribute('color',new THREE.BufferAttribute(col,4));
 const beam=new THREE.Mesh(cone,new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide}));
 beam.name='Torch beam';beam.visible=false;beam.castShadow=false;g.add(beam);
 let light=null,on=false;
 g.userData.torch={
  get on(){return on;},
  get light(){return light;},
  setOn(v){v=!!v;if(v===on)return;on=v;
   lensMat.emissive.setHex(on?0xfff1c8:0);lensMat.emissiveIntensity=on?2.4:0;beam.visible=on;
   if(on&&!light){const S=T.light;light=new THREE.SpotLight(S.colour,S.intensity,S.distance,S.angle,S.penumbra,S.decay);light.name='Torch light';light.castShadow=false;
    light.position.set(0,0,T.lensAt+.004);light.target.position.set(0,.3,0);light.add(light.target);g.add(light);}
   if(light)light.intensity=on?T.light.intensity:0;},
  /** Aims the light at a point in the world (the holder's face). */
  aimAt(p){if(!light)return;g.updateWorldMatrix(true,false);light.updateWorldMatrix(false,false);light.target.position.copy(light.worldToLocal(p.clone()));light.target.updateMatrixWorld(true);},
 };
 return g;
}

/** The locker basket (the onsen's rattan basket, 0.40 × 0.40 × 0.22 m), built upside down: open side down, its floor on
 *  top; its origin at the middle of the rim. Woven rattan in two tones: the body and a darker rim band. */
export const BASKET=Object.freeze({w:.4,d:.4,h:.22,wall:.012,tilt:Object.freeze([-.08,0,.2])});
export function buildBasket(){
 const g=new THREE.Group();g.name='Rattan basket';
 const B=BASKET,rattan=mat(0xc9a36a,{roughness:.9}),rim=mat(0xa47e48,{roughness:.9}),t=B.wall;
 add(g,new THREE.BoxGeometry(B.w,t,B.d),rattan,0,B.h-t/2,0);
 for(const s of [-1,1]){add(g,new THREE.BoxGeometry(t,B.h-t,B.d),rattan,s*(B.w/2-t/2),(B.h-t)/2,0);add(g,new THREE.BoxGeometry(B.w-2*t,B.h-t,t),rattan,0,(B.h-t)/2,s*(B.d/2-t/2));}
 // the rim band round the open edge, a little proud of the walls
 for(const s of [-1,1]){add(g,new THREE.BoxGeometry(t*1.6,.022,B.d+t*.6),rim,s*(B.w/2-t*.5),.011,0);add(g,new THREE.BoxGeometry(B.w+t*.6,.022,t*1.6),rim,0,.011,s*(B.d/2-t*.5));}
 // the weave: three darker bands round the walls
 const band=mat(0xb48d56,{roughness:.9});
 for(const y of [.07,.12,.17])for(const s of [-1,1]){add(g,new THREE.BoxGeometry(t*1.2,.008,B.d+t*.2),band,s*(B.w/2-t/2),y,0);add(g,new THREE.BoxGeometry(B.w+t*.2,.008,t*1.2),band,0,y,s*(B.d/2-t/2));}
 return g;
}

/** The evening paper folded once down its middle (a quarter of a broadsheet: each leaf 0.19 × 0.28 m at the town's scale),
 *  printed in grey columns with a dark masthead; its origin at the middle of the fold. setSpread(half) opens it so its two
 *  outer edges are `half` metres either side of the fold's line (held between the mittens). */
export const PAPER=Object.freeze({leaf:.19,height:.28});
export function buildPaper(){
 const g=new THREE.Group();g.name='Evening paper';
 const page=mat(0xf1ece0,{roughness:.95,side:THREE.DoubleSide}),ink=mat(0x8b8780,{roughness:1,side:THREE.DoubleSide}),head=mat(0x3a3836,{roughness:1,side:THREE.DoubleSide});
 const P=PAPER,leaves=[];
 for(const s of [-1,1]){
  const leaf=new THREE.Group();g.add(leaf);leaves.push(leaf);
  const sheet=add(leaf,new THREE.PlaneGeometry(P.leaf,P.height),page,s*P.leaf/2,0,0);sheet.castShadow=true;
  // print on both faces: columns of grey, a dark headline across the outer leaf's top (the front page)
  for(const f of [1,-1]){const z=f*.0012;
   for(let c=0;c<3;c++)add(leaf,new THREE.PlaneGeometry(P.leaf*.26,P.height*.62),ink,s*(P.leaf*(.18+c*.31)),-P.height*.1,z).castShadow=false;
   add(leaf,new THREE.PlaneGeometry(P.leaf*.86,P.height*.1),f>0?ink:head,s*P.leaf*.5,P.height*.36,z).castShadow=false;}
 }
 g.userData.paper={setSpread(half){const a=Math.acos(THREE.MathUtils.clamp(half/P.leaf,0,1));leaves[0].rotation.y=-a;leaves[1].rotation.y=a;return a;}};
 g.userData.paper.setSpread(P.leaf*.9);
 return g;
}

const _v=new THREE.Vector3(),_w=new THREE.Vector3(),_m=new THREE.Matrix4();
/** Every point of the drawn body (each skinned mesh as it stands this frame, the face's head), in `frame`'s space, through
 *  `keep(point in the root's space)`: what a prop round the body must clear. The outlines and hidden ranges are left out. */
function posedPoints(avatar,frame,keep=()=>true,stride=1){
 avatar.root.updateMatrixWorld(true);const inv=new THREE.Matrix4().copy(frame.matrixWorld).invert(),rootInv=new THREE.Matrix4().copy(avatar.root.matrixWorld).invert(),out=[];
 const take=p=>{_w.copy(p).applyMatrix4(rootInv);if(keep(_w))out.push(p.clone().applyMatrix4(inv));};
 for(const mesh of avatar.root.children){
  if(!mesh.isSkinnedMesh||!mesh.visible||mesh.userData.outline||mesh.name.includes('outline'))continue;
  const g=mesh.geometry,n=g.attributes.position.count,r=g.drawRange,end=Math.min(r.start+r.count,g.index?g.index.count:n);
  const ids=new Set();if(g.index){for(let i=r.start;i<end;i++)ids.add(g.index.getX(i));}else for(let i=r.start;i<end;i++)ids.add(i);
  let k=0;for(const i of ids){if(k++%stride)continue;mesh.getVertexPosition(i,_v);mesh.localToWorld(_v);take(_v);}
 }
 const h=avatar.face?.head;if(h){const P=h.geometry.attributes.position;for(let i=0;i<P.count;i+=2){_v.fromBufferAttribute(P,i);h.localToWorld(_v);take(_v);}}
 return out;
}

/**
 * The basket on the head: upside down, a little askew (BASKET.tilt), centred over the crown, and lowered until it rests on
 * whatever the head carries (the hair, the head towel, the head itself): the lowest place where no point of them is in its
 * walls, its rim or under its floor. Worked out once for each body and what it has on, in the head bone's frame.
 */
export function fitBasket(avatar){
 const head=avatar.bones.head,B=BASKET,m=avatar.measure;
 // the head and what is on it, at rest (the head carries them rigidly), in the head bone's frame
 const pts=posedPoints(avatar,head,p=>p.y>m.headY+m.Rh*.15,1);
 const q=new THREE.Quaternion().setFromEuler(new THREE.Euler(...B.tilt)),qi=q.clone().invert(),hc=m.headCentre-m.headY;
 const inside=y=>{for(const p of pts){_v.copy(p);_v.y-=y;_v.applyQuaternion(qi);
   const ax=Math.abs(_v.x),az=Math.abs(_v.z);if(_v.y<-.002||_v.y>B.h+.002||ax>B.w/2+.004||az>B.d/2+.004)continue;   // outside the basket's box
   if(ax<B.w/2-B.wall-.003&&az<B.d/2-B.wall-.003&&_v.y<B.h-B.wall-.003)continue;                               // in its hollow
   return true;}return false;};
 let y=hc+m.Rh*m.headSY*1.6;const top=y;while(y>hc&&!inside(y-.0005))y-=.0005;y+=.0025;   // resting, a hair clear (the towel and hair move a little with the head)
 return {position:new THREE.Vector3(0,y,0),quaternion:q,rested:y<top-.002};
}

/**
 * The dryer's cord wound round the body: four turns from the hips to just under the arms, round the body and the arms
 * pinned to it, every point just clear of whatever is drawn there (the wrap, the arms), then away behind to the socket
 * (`to`, in the body's space; by default down to the floor and along it behind). It starts at the dryer's handle under the
 * right mitten. Built from the body as it stands (CordWrapped's pose), in the chest bone's frame, as one thin tube.
 */
export const CORD=Object.freeze({radius:.0045,turns:4,clear:.003,colour:0x2e3032});
export function buildCordWrap(avatar,{to=null}={}){
 const m=avatar.measure,k=m.k,chest=avatar.bones.chest,root=avatar.root;
 const y0=m.hipY+.02*k,y1=m.shoulderY-.1*k;
 // pulled tight, the cord lies on the outline of everything it goes round at its height (the body and the arms): the
 // convex hull of what is drawn in a slab there, in the root's space
 const pts=posedPoints(avatar,root,p=>p.y>y0-.04&&p.y<y1+.04),slab=.012,levels=[];
 for(let y=y0-.01;y<=y1+.011;y+=.01){
  const flat=pts.filter(p=>Math.abs(p.y-y)<slab).map(p=>[p.x,p.z]).sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
  const cross=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]),lo=[],hi=[];
  for(const p of flat){while(lo.length>1&&cross(lo[lo.length-2],lo[lo.length-1],p)<=0)lo.pop();lo.push(p);}
  for(const p of flat.slice().reverse()){while(hi.length>1&&cross(hi[hi.length-2],hi[hi.length-1],p)<=0)hi.pop();hi.push(p);}
  levels.push({y,hull:lo.slice(0,-1).concat(hi.slice(0,-1))});
 }
 /** How far out the hull is at angle a (radians from ahead, toward the left): where the ray from the body's axis leaves it. */
 const rayOut=(hull,a)=>{const dx=Math.sin(a),dz=Math.cos(a);let r=0;
  for(let i=0;i<hull.length;i++){const [x1,z1]=hull[i],[x2,z2]=hull[(i+1)%hull.length],ex=x2-x1,ez=z2-z1,den=dx*ez-dz*ex;if(Math.abs(den)<1e-12)continue;
   const t=(x1*ez-z1*ex)/den,u=(x1*dz-z1*dx)/den;if(t>0&&u>=-1e-9&&u<=1+1e-9)r=Math.max(r,t);}
  return r;};
 const need=(a,y)=>{const f=THREE.MathUtils.clamp((y-levels[0].y)/.01,0,levels.length-1),i=Math.floor(f),j=Math.min(levels.length-1,i+1);
  // the larger of the two levels either side (it is pulled over whichever sticks out), and the cord's own thickness
  return Math.max(rayOut(levels[i].hull,a*Math.PI*2),rayOut(levels[j].hull,a*Math.PI*2))+CORD.radius+CORD.clear;};
 // the turns, from the bottom up, starting at the right side (where the hand and the dryer are)
 // (and three quarters of a turn more, so it leaves her at the middle of her back, away from her arms)
 const turns=CORD.turns+.75,N=Math.round(turns*72),ring=[];
 for(let i=0;i<=N;i++){const u=i/N,a=(.75+u*turns)%1,y=y0+(y1-y0)*u;ring.push([a,y,need(a,y)]);}
 const R=ring.map(r=>r[2]);
 const path=ring.map(([a,y],i)=>new THREE.Vector3(Math.sin(a*Math.PI*2)*R[i],y,Math.cos(a*Math.PI*2)*R[i]));
 // in at the bottom: up from the dryer's handle (below the right mitten) to the first turn
 root.updateMatrixWorld(true);
 const hand=avatar.bones.handR.localToWorld(new THREE.Vector3(0,-m.hand*.55-.11*k,0));root.worldToLocal(hand);
 const first=path[0],between=hand.clone().lerp(first,.5);between.x-=.012*k;   // a little out to her right, round the mitten
 path.unshift(hand,between);
 // out at the top, behind: over the back and down to the socket (or to the floor behind her)
 const last=path[path.length-1],back=new THREE.Vector3(last.x,last.y-.06*k,last.z-.07*k);
 const end=to?new THREE.Vector3(...to):new THREE.Vector3(-.15*k,.005,-.75*k);
 const mid=back.clone().lerp(end,.5);mid.y=Math.min(back.y,end.y)-.05*k;if(!to)mid.y=Math.max(.02,back.y*.35);
 path.push(back,mid,end);
 const curve=new THREE.CatmullRomCurve3(path,false,'centripetal');
 const geometry=new THREE.TubeGeometry(curve,path.length*3,CORD.radius,6,false);
 // into the chest bone's frame, so it moves with the body that wears it
 const toChest=new THREE.Matrix4().copy(chest.matrixWorld).invert().multiply(root.matrixWorld);geometry.applyMatrix4(toChest);
 const mesh=new THREE.Mesh(geometry,mat(CORD.colour,{roughness:.5}));mesh.name='Dryer cord';mesh.castShadow=true;
 mesh.userData.indexCount=geometry.index.count;
 return mesh;
}

/** Where a torch clipped to the left chest sits, in the chest bone's frame: head down in the shirt pocket (or down the front of
 *  the vest, clipped to its neckline), its clip over the edge, beside the badge he wears there, lying on the body. */
export function pocketSpot(avatar){
 const m=avatar.measure,vol=bodyVolume(avatar.recipe,m),vest=avatar.outfit==='afterbath',a=vest?.16:.22;
 const edge=vest?.8:.78,mid=edge-(TORCH.length/2+.002)/m.torso;   // the clip's top at the pocket's (or the neckline's) edge
 const s=vol.surf(a,mid),n=vol.normal(s),gap=(vest?.009:.004)*m.k+TORCH.radius;
 const at=s.clone().addScaledVector(n,gap).sub(new THREE.Vector3(0,m.chestY,0));
 // the torch's +z (its lens) down the chest along the surface, its +y (the clip) outward
 const out=n.clone(),down=new THREE.Vector3(0,-1,0).addScaledVector(out,out.y).normalize(),side=new THREE.Vector3().crossVectors(out,down);
 const q=new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(side,out,down));
 return {position:at,quaternion:q,normal:n};
}

/** The story's props on one body: given, taken, and where each is. */
export function storyProps(avatar){
 if(avatar.storyProps)return avatar.storyProps;
 const held=new Map();
 const api={
  has:kind=>held.has(kind),
  get:kind=>held.get(kind)||null,
  /** Puts a prop on the body (where it lives when not in use) and returns it. */
  give(kind,options={}){
   if(held.has(kind))return held.get(kind);
   let o=null;
   if(kind==='torch'){o=buildPocketTorch();const p=pocketSpot(avatar);o.position.copy(p.position);o.quaternion.copy(p.quaternion);avatar.bones.chest.add(o);o.userData.at='pocket';}
   else if(kind==='basketOnHead'){o=buildBasket();const f=fitBasket(avatar);o.position.copy(f.position);o.quaternion.copy(f.quaternion);avatar.bones.head.add(o);o.userData.fit=f;}
   else if(kind==='newspaper'){o=buildPaper();o.visible=false;avatar.root.add(o);}
   else if(kind==='dryerCord'){o=buildCordWrap(avatar,options);avatar.bones.chest.add(o);}
   else throw new Error('No story prop "'+kind+'" (story-props.js STORY_PROPS)');
   o.userData.storyProp=kind;held.set(kind,o);return o;
  },
  take(kind){const o=held.get(kind);if(!o)return;o.removeFromParent();o.traverse(x=>{if(x.isMesh){x.geometry.dispose();}});held.delete(kind);},
  /** The torch to the hand ('R') or back on the pocket; on or off. */
  torchTo(where){const o=held.get('torch');if(!o||o.userData.at===where)return;
   if(where==='pocket'){const p=pocketSpot(avatar);avatar.bones.chest.add(o);o.position.copy(p.position);o.quaternion.copy(p.quaternion);}
   else avatar.bones['hand'+where].attach(o);   // taken as it is: the hand closes on it where it lies
   o.userData.at=where;},
  dispose(){for(const kind of [...held.keys()])api.take(kind);},
 };
 avatar.storyProps=api;
 const dispose=avatar.dispose;avatar.dispose=(...a)=>{api.dispose();return dispose.apply(avatar,a);};
 return api;
}
