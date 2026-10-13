import * as THREE from '../../vendor/three.module.js';
import {applyCelShading} from '../render/cel.js';
import {townDate} from '../town-clock.js';
import {SAKURA_BOX} from './okinawa/old-town.js';
import {std,mesh,buildPumpkinLantern,buildJackOLantern,buildObake,buildDog,buildCordReel} from './halloween-props.js';
export {buildPumpkinLantern,buildJackOLantern,buildObake,buildDog,buildCordReel};

/**
 * Halloween on Sakura Street, 1997 (the story "The Haunted Vending Machine", おばけ自販機).
 *
 * Okinawa has kept Halloween since the American bases came, and Minato Machi's shopkeepers hold a children's walk on
 * the last evening of October: paper pumpkin lanterns strung along Sakura Shōten's frontage, little cardboard ghosts
 * taped to the shutters, and the children walk the street in costume collecting sweets. Everything here has its reason:
 *
 *   lanterns     thirteen paper pumpkin lanterns (a 25 W bulb in each) on one string from the nobori pole by the drinks
 *                machine, along the awning's front edge, to the far end of the frontage: the walk's route
 *   ghosts       four cardboard obake (round, little arms, rosy cheeks) taped to the shutter at a child's eye height
 *   reel         the cord reel Kōji brought from his boat shed: 30 m of thin 0.75 mm² cord, still half coiled on its
 *                drum. The story's trouble: he plugged the reel into the machine's outdoor socket and the machine
 *                into the reel, so the machine's start surge goes through the thin coiled cord with the lanterns
 *   socket       the drinks machine's own outdoor socket (weatherproof, with its flip lid), on the corner pier south of
 *                the shutter; after the fix, beside it, a new outdoor socket with an RCD for the lanterns alone
 *   mist         cold air from the can chute meeting the warm, wet night: a low mist that creeps out on the pavement
 *   story things the plastic jack-o'-lanterns ringed round the machine for the walk's photograph, a plush obake
 *                peeking from the crates, the séance's candle jars, Mrs Sato's salt cones (morijio), Thao's rice ball
 *                on a plate, Fujita's tin bucket, a can in the take-out pocket, and Kuro, the Tamashiros' black dog
 *
 * Hidden the rest of the year; up from 24 October, the lanterns lit after six in the evening. A story or a film stages
 * any moment of it with stage({...}), and then the clock leaves it alone.
 */
export const HALLOWEEN=Object.freeze({
 why:'The children’s Halloween walk on Sakura Street, the last evening of October, as Okinawa has kept it since the American bases came: lanterns, paper ghosts and costumes.',
 season:Object.freeze({from:'10-24',to:'10-31',litFrom:18*60}),
 machine:Object.freeze({x:SAKURA_BOX.maxX+.45,z:SAKURA_BOX.minZ+1.7,front:SAKURA_BOX.maxX+.45+.35,chute:Object.freeze([SAKURA_BOX.maxX+.45+.36,.3,SAKURA_BOX.minZ+1.7])}),
 socket:Object.freeze({at:Object.freeze([SAKURA_BOX.maxX+.01,.5,SAKURA_BOX.minZ+.16]),why:'The drinks machine’s own outdoor socket on the corner pier, beside the shutter’s guide: the machine’s cord runs to it behind the machine.'}),
 rcd:Object.freeze({at:Object.freeze([SAKURA_BOX.maxX+.01,1.2,SAKURA_BOX.minZ+.16]),why:'After the fix: the lanterns’ own outdoor socket, with an RCD (earth-leakage breaker) and its test button, put in by Tetsuo.'}),
 reel:Object.freeze({at:Object.freeze([SAKURA_BOX.maxX+.42,0,SAKURA_BOX.minZ+.72]),why:'Kōji’s cord reel from his boat shed, half coiled: the lanterns and the machine both plugged into it.'}),
 nobori:Object.freeze([SAKURA_BOX.maxX+.95,SAKURA_BOX.minZ+.45]),
 pools:Object.freeze([-32.4,-29.1,-25.6,-22.1]),   // the four shared lights of the lanterns' warm pools (z along the string)
 poolIntensity:9,
 seance:Object.freeze({centre:Object.freeze([-5.75,-32.6]),radius:.72,candles:8}),
});

/**
 * The electrics, as numbers the story, the film and the tests share (the story's "Why it works"). 100 V; the
 * machine's cooling compressor draws 4 A running and about six times that for the moment it starts; thirteen 25 W
 * lantern bulbs; the reel's cord 30 m of 0.75 mm² copper, there and back. Incandescent light goes as about V^3.4.
 */
export const HALLOWEEN_ELECTRICS=Object.freeze({
 supply:100,compressorRun:4,startTimes:6,lanterns:13,lanternWatts:25,cordLength:30,cordArea:.75,copper:.0172,coiledRating:6,relayDropout:.7,
});
export function lanternCurrent(E=HALLOWEEN_ELECTRICS){return E.lanterns*E.lanternWatts/E.supply;}
export function cordResistance(E=HALLOWEEN_ELECTRICS){return 2*E.cordLength*E.copper/E.cordArea;}
/** The voltage at the reel's outlets: the machine running, or starting (its surge), with the lanterns on. */
export function reelVolts(starting=false,E=HALLOWEEN_ELECTRICS){
 const machine=E.compressorRun*(starting?E.startTimes:1);
 return E.supply-(machine+lanternCurrent(E))*cordResistance(E);
}
/** How bright a lantern is at a voltage, against its full brightness at 100 V. */
export const lanternBrightness=(volts,E=HALLOWEEN_ELECTRICS)=>Math.pow(Math.max(0,volts)/E.supply,3.4);
/** The heat in the reel's cord while everything runs (W): coiled, it cannot get rid of it. */
export const cordHeat=(E=HALLOWEEN_ELECTRICS)=>Math.pow(E.compressorRun+lanternCurrent(E),2)*cordResistance(E);

/** A tube along points (a cord or a cable), radius r. */
function cable(points,r,mat){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));return new THREE.Mesh(new THREE.TubeGeometry(curve,Math.max(12,points.length*8),r,6,false),mat);}

/** A weatherproof outdoor socket (屋外コンセント): a grey box with its flip lid, on a wall facing +x. rcd: the
 *  earth-leakage breaker's box above it with its test button. Origin at the box's back centre. */
function outdoorSocket({rcd=false}={}){
 const g=new THREE.Group();g.name=rcd?'Outdoor socket with RCD':'Outdoor socket';
 const grey=std(0xc9cbc6,{roughness:.5});
 mesh(g,new THREE.BoxGeometry(.06,.14,.11),grey,.03,0,0);
 mesh(g,new THREE.BoxGeometry(.012,.07,.1),std(0xb0b3ad,{roughness:.5}),.065,.045,0).rotation.z=-.25;
 for(const z of [-.012,.012])mesh(g,new THREE.BoxGeometry(.004,.02,.005),std(0x222222),.061,-.02,z);
 if(rcd){mesh(g,new THREE.BoxGeometry(.06,.12,.11),std(0xeceae4,{roughness:.5}),.03,.15,0);
  mesh(g,new THREE.BoxGeometry(.008,.02,.02),std(0xd8342c),.064,.17,.03);mesh(g,new THREE.BoxGeometry(.008,.03,.025),std(0x2b2f33),.064,.14,-.02);
  mesh(g,new THREE.PlaneGeometry(.07,.02),std(0x2f6fa8),.0605,.11,0).rotation.y=Math.PI/2;}
 return g;
}

/** Soft mist: flat discs of fading white, each a canvas-free radial fade in its vertex colours. */
function mistPuff(r){
 const geo=new THREE.CircleGeometry(r,24,0,Math.PI*2),P=geo.attributes.position,col=new Float32Array(P.count*4);
 for(let i=0;i<P.count;i++){const d=Math.hypot(P.getX(i),P.getY(i))/r;col.set([.78,.84,.92,.42*(1-d)*(1-d)],i*4);}
 geo.setAttribute('color',new THREE.BufferAttribute(col,4));geo.rotateX(-Math.PI/2);
 const m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,depthWrite:false,opacity:1}));m.name='Mist';m.renderOrder=2;return m;
}

/**
 * Builds Halloween on Sakura Street into the town (hidden until the season or a story stages it) and returns its api:
 *   stage({show, glow, machine, cable, mist, pumpkins, peek, can, candles, riceBall, salt, bucket, dog})
 *     show      true / false
 *     glow      the lanterns, 0 dark … 1 at full 100 V (reelVolts and lanternBrightness give the story's levels)
 *     machine   the drinks machine's lit window and brand, 0 … 1 (it flickers dim when its compressor starts)
 *     cable     'reel' (Kōji's way: the reel in the socket, the machine and the lanterns in the reel) or 'fixed'
 *               (the machine back in its own socket, the lanterns on their own RCD socket by a proper cable)
 *     mist      0 … 1, the cold mist from the chute; pumpkins (the ring), deco (jack-o'-lanterns on the crates, the bin and the
 *               pole's foot; on by default), peek, can, candles, salt, bucket: true / false;
 *     riceBall  'plate' or false; dog: false or {pose:'sit'|'eat'|'stand', at:[x,z], yaw}
 *   update(minutes) the season and the evening (until a stage pins it), state (the last stage).
 */
export function buildHalloween(world,{shadows=false}={}){
 const H=HALLOWEEN,M=H.machine,S=SAKURA_BOX;
 const group=new THREE.Group();group.name='Halloween on Sakura Street';group.visible=false;world.group.add(group);
 const add=(o,x,y,z,ry=0,parent=group)=>{o.position.set(x,y,z);o.rotation.y=ry;parent.add(o);return o;};
 // ---- the lantern string: from the nobori pole along the awning's front edge to the far end of the frontage
 const [nx,nz]=H.nobori,ties=[[nx,2.6,nz],[-6.1,2.42,-31.43],[-6.1,2.42,-26.0],[-6.1,2.42,-20.62]];
 const stringMat=std(0x2b2a28,{roughness:.6});
 const sagAt=z=>{for(let i=0;i<ties.length-1;i++){const a=ties[i],b=ties[i+1];if(z>=a[2]-1e-6&&z<=b[2]+1e-6){const t=(z-a[2])/(b[2]-a[2]);return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t-.12*Math.sin(Math.PI*t)];}}return [ties.at(-1)[0],ties.at(-1)[1]];};
 const strPts=[];for(let z=ties[0][2];z<=ties.at(-1)[2]+1e-6;z+=.25){const [x,y]=sagAt(z);strPts.push([x,y,z]);}
 const string=cable(strPts,.004,stringMat);string.name='Lantern string';group.add(string);
 const lanterns=[];
 for(let i=0;i<HALLOWEEN_ELECTRICS.lanterns;i++){const z=-33.12+i*1.0,[x,y]=sagAt(z);const l=add(buildPumpkinLantern(),x,y,z,Math.PI/2);l.name='Pumpkin lantern '+(i+1);lanterns.push(l);}
 // ---- where their light falls: a warm pool on the pavement, the shutter and the awning under the string. Four shared
 // lights along it (not one a lantern: a phone lights four cheaply), each following the lanterns' glow; none at dusk.
 const pools=new THREE.Group();pools.name='Lantern light';group.add(pools);
 for(const z of HALLOWEEN.pools){const [x,y]=sagAt(z),L=new THREE.PointLight(0xffa24a,0,4.5,2);L.position.set(x-.15,y-.45,z);L.name='Lantern pool';L.castShadow=false;pools.add(L);}
 // ---- the cardboard ghosts on the shutter, at a child's eye height
 for(const [z,y,s] of [[-30.45,1.32,.66],[-28.55,1.45,.6],[-24.9,1.3,.66],[-22.9,1.42,.6]]){const o=add(buildObake({h:s,flat:true}),S.maxX+.2,y,z,Math.PI/2);o.name='Cardboard ghost';}
 // ---- the sockets, the reel, the cords
 const sock=add(outdoorSocket(),...H.socket.at,0);sock.name='Drinks machine outdoor socket';
 const rcd=add(outdoorSocket({rcd:true}),...H.rcd.at,0);rcd.name='Lantern socket with RCD';
 const reel=add(buildCordReel(),...H.reel.at,0);
 const cordMat=std(0x3d3f42,{roughness:.6}),orangeCable=std(0xe8742a,{roughness:.55});
 const [rx,,rz]=H.reel.at,[sx,sy,sz]=H.socket.at;
 const reelWay=new THREE.Group();reelWay.name='Kōji’s way: the reel';group.add(reelWay);
 reelWay.add(cable([[sx+.07,sy-.03,sz],[sx+.12,.05,sz+.05],[rx-.1,.02,rz-.15],[rx-.02,.12,rz-.05],[rx,.2,rz]],.006,cordMat));            // the reel's plug in the machine's socket
 reelWay.add(cable([[rx+.11,.2,rz+.03],[rx+.2,.03,rz+.15],[M.x-.25,.03,M.z-.62],[M.x-.32,.12,M.z-.5]],.005,cordMat));                       // the machine's cord into the reel
 reelWay.add(cable([[rx+.11,.2,rz-.03],[rx+.35,.02,rz-.2],[nx+.06,.02,nz+.02],[nx+.06,.6,nz],[nx+.06,2.5,nz],[nx,2.6,nz]],.005,cordMat));        // the lantern string's cord down the nobori pole
 for(let i=0;i<5;i++){const loop=mesh(reelWay,new THREE.TorusGeometry(.13+i*.012,.005,6,28),cordMat,rx+.3+i*.02,.006+i*.004,rz-.32);loop.rotation.x=Math.PI/2;}   // loose coils on the pavement
 const fixedWay=new THREE.Group();fixedWay.name='The fix: the lanterns’ own socket';group.add(fixedWay);
 fixedWay.add(cable([[sx+.07,sy-.03,sz],[sx+.12,.05,sz+.05],[M.x-.3,.03,M.z-.62],[M.x-.32,.12,M.z-.5]],.006,cordMat));                       // the machine back in its own socket
 const [qx,qy,qz]=H.rcd.at;
 fixedWay.add(cable([[qx+.07,qy-.03,qz],[qx+.2,qy-.2,qz+.1],[nx+.06,1.0,nz-.04],[nx+.06,2.5,nz-.04],[nx,2.6,nz]],.008,orangeCable));            // a proper cable, fully run, up the pole
 // ---- the story's things
 const ring=new THREE.Group();ring.name='Jack-o’-lanterns round the machine';group.add(ring);
 for(let i=0;i<7;i++){const a=-1.15+i*2.3/6,r=.95;add(buildJackOLantern({r:i%2?.14:.17}),M.front+Math.cos(a)*r,0,M.z+Math.sin(a)*r,Math.PI/2-a*.6,ring);}
 const deco=new THREE.Group();deco.name='Jack-o’-lanterns on the frontage';group.add(deco);
 for(const [x,y,z,r,ry] of [[S.maxX+.32,.84,-30.75,.15,Math.PI/2],[S.maxX+.32,.84,-30.2,.12,Math.PI/2+.3],[S.maxX+.4,.78,-29.4,.13,Math.PI/2-.2],[H.nobori[0]+.12,0,H.nobori[1]-.22,.14,Math.PI/2-.4]])add(buildJackOLantern({r}),x,y,z,ry,deco);
 const peek=add(buildObake({h:.36}),M.x+.12,1.89,M.z-.36,Math.PI/2);peek.name='Plush ghost peeking';peek.rotation.z=-.18;   // on top of the machine, leaning out over its front edge
 const can=new THREE.Group();can.name='A can in the take-out pocket';group.add(can);
 {const c=mesh(can,new THREE.CylinderGeometry(.033,.033,.12,14).rotateX(Math.PI/2),std(0x5a3b26,{roughness:.4,metalness:.4}),M.front+.03,.25,M.z);c.rotation.y=Math.PI/2;}
 const candles=new THREE.Group();candles.name='Séance candles';group.add(candles);
 const flame=new THREE.MeshBasicMaterial({color:0xffd27a});
 for(let i=0;i<H.seance.candles;i++){const a=i/H.seance.candles*Math.PI*2,x=H.seance.centre[0]+Math.cos(a)*H.seance.radius,z=H.seance.centre[1]+Math.sin(a)*H.seance.radius;
  mesh(candles,new THREE.CylinderGeometry(.035,.035,.09,12),std(0xdfeef0,{transparent:true,opacity:.55,roughness:.1}),x,.045,z);
  mesh(candles,new THREE.CylinderGeometry(.025,.025,.06,10),std(0xf6f1e4),x,.04,z);mesh(candles,new THREE.SphereGeometry(.012,8,6),flame,x,.085,z).scale.set(1,1.8,1);}
 const salt=new THREE.Group();salt.name='Morijio (salt cones)';group.add(salt);
 for(const dz of [-.75,.75]){mesh(salt,new THREE.CylinderGeometry(.06,.05,.015,16),std(0xf3f1ea),M.front+.12,.008,M.z+dz);mesh(salt,new THREE.ConeGeometry(.035,.07,16),std(0xffffff,{roughness:.95}),M.front+.12,.05,M.z+dz);}
 const riceBall=new THREE.Group();riceBall.name='Thao’s rice ball on a plate';group.add(riceBall);
 mesh(riceBall,new THREE.CylinderGeometry(.08,.065,.015,18),std(0xf3f1ea),M.front+.32,.008,M.z+.42);
 {const r=mesh(riceBall,new THREE.ConeGeometry(.055,.075,3),std(0xfbfaf4,{roughness:.95}),M.front+.32,.052,M.z+.42);r.rotation.y=Math.PI/2;r.scale.set(1,1,.55);
  mesh(riceBall,new THREE.BoxGeometry(.05,.035,.02),std(0x1e2a22),M.front+.32,.035,M.z+.43).rotation.y=Math.PI/2;}
 const bucket=new THREE.Group();bucket.name='Fujita’s bucket';group.add(bucket);
 mesh(bucket,new THREE.CylinderGeometry(.13,.1,.22,18,1,true),std(0xa9aeb1,{metalness:.6,roughness:.35,side:THREE.DoubleSide}),M.front+.2,.11,M.z);
 mesh(bucket,new THREE.CircleGeometry(.1,18).rotateX(-Math.PI/2),std(0x8d9295),M.front+.2,.005,M.z);
 const mist=new THREE.Group();mist.name='Mist from the can chute';group.add(mist);
 for(const [dx,dz,r,y] of [[.12,0,.55,.06],[.45,.3,.7,.05],[.5,-.35,.65,.07],[.95,.05,.85,.04],[.3,.65,.55,.05],[.3,-.65,.55,.06],[1.4,.2,.8,.03],[1.3,-.5,.7,.035],[.08,0,.35,.2],[.1,.15,.3,.3],[.06,-.12,.28,.26]]){const p=mistPuff(r);p.position.set(M.front+dx,y,M.z+dz);mist.add(p);}
 let dog=null;
 // the drinks machine's own lit window and brand (the town's machine at Sakura): dimmed with its compressor's start.
 // Found afresh each time (the town may swap the machine's materials for its cel ones, or hydrate its model): every
 // unlit (basic) material is darkened from its own colour, every glowing one from its own glow.
 const machineObject=()=>{let m=null;world.group.traverse(o=>{if(!m&&o.name==='Harbour vending machine'&&Math.hypot(o.position.x-M.x,o.position.z-M.z)<.3)m=o;});return m;};
 const dimMachine=k=>{const mach=machineObject();if(!mach)return 0;let n=0;
  mach.traverse(o=>{if(!o.isMesh)return;for(const mat of [].concat(o.material)){if(!mat)continue;const u=mat.userData;
   if(mat.isMeshBasicMaterial){u.hwColour??=mat.color.getHex();mat.color.setHex(u.hwColour).multiplyScalar(k);n++;}
   else if(mat.emissive&&(u.hwGlow??=mat.emissiveIntensity)>0){mat.emissiveIntensity=u.hwGlow*k;n++;}}});
  return n;};
 applyCelShading(group);
 group.traverse(o=>{if(o.isMesh){o.castShadow=shadows&&!o.material.transparent;o.receiveShadow=true;}});
 let pinned=false;
 const state={show:false,glow:0,machine:1,cable:'reel',mist:0,pumpkins:false,deco:true,peek:false,can:false,candles:false,riceBall:false,salt:false,bucket:false,dog:false};
 const apply=()=>{
  group.visible=!!state.show;
  for(const l of lanterns)l.userData.lantern.setGlow(state.glow);
 const g=THREE.MathUtils.clamp(state.glow,0,1);for(const L of pools.children){L.intensity=H.poolIntensity*Math.pow(g,1.2);L.visible=g>0&&!!state.show;}
  reelWay.visible=state.cable==='reel';reel.visible=state.cable==='reel';fixedWay.visible=state.cable==='fixed';rcd.visible=state.cable==='fixed';
  for(const p of mist.children)p.material.opacity=THREE.MathUtils.clamp(state.mist,0,1);mist.visible=state.mist>0;
  ring.visible=!!state.pumpkins;deco.visible=!!state.deco;peek.visible=!!state.peek;can.visible=!!state.can;candles.visible=!!state.candles;salt.visible=!!state.salt;
  riceBall.visible=state.riceBall==='plate';bucket.visible=!!state.bucket;
  if(dog){dog.removeFromParent();dog=null;}
  if(state.dog){const d=state.dog;dog=buildDog({pose:d.pose||'sit'});applyCelShading(dog);dog.position.set(d.at[0],0,d.at[1]);dog.rotation.y=d.yaw??0;group.add(dog);}
  dimMachine(THREE.MathUtils.clamp(state.machine,0,1));
 };
 apply();
 const api={
  group,lanterns,state,
  stage(s={}){pinned=true;Object.assign(state,{show:true},s);apply();return state;},
  release(){pinned=false;},
  /** The season: up from 24 October, the lanterns lit after six (until a story pins a moment). */
  update(minutes){if(pinned||!(minutes>1440*365))return;const {key}=townDate(minutes),h=((minutes%1440)+1440)%1440,on=key>=H.season.from&&key<=H.season.to;
   state.show=on;state.glow=on&&h>=H.season.litFrom?lanternBrightness(reelVolts(false)):0;state.cable='reel';apply();},
 };
 (world.hourly??=[]).push(m=>api.update(m));
 return api;
}
