/**
 * The equipment library's building kit.
 *
 * Every machine (valve, motor, generator, engine) is built from named parts, each with a
 * Swedish and an English name and a short text, and an explode offset: where the part goes
 * in an exploded view. The same model is used in Johansson Town, in Sjöskolan's lessons and
 * in the study viewer (index.html), so a part is described once.
 *
 * THREE is passed in rather than imported, so any page can use its own copy of three.js
 * (the town and Sjöskolan both use johansson-town/vendor/three.module.js, r170).
 *
 * Conventions: metres, Y up, the machine's main axis along X, the drive end towards +X.
 * Nothing here touches the DOM, so models also build in node for tests.
 */

/** Colours and surfaces, close to what the real things are painted or made of. */
export const FINISHES=Object.freeze({
 motorBlue:{color:0x2f5d8a,roughness:.55,metalness:.25},
 generatorGreen:{color:0x5d7a6a,roughness:.6,metalness:.2},
 engineGrey:{color:0x7d8a8f,roughness:.6,metalness:.25},
 castIron:{color:0x454c52,roughness:.75,metalness:.35},
 valveBody:{color:0x2f4f7a,roughness:.55,metalness:.2},
 steel:{color:0xb4b9be,roughness:.32,metalness:.85},
 darkSteel:{color:0x6d7378,roughness:.4,metalness:.8},
 lamination:{color:0x5a5f66,roughness:.5,metalness:.6},
 copper:{color:0xb8733d,roughness:.35,metalness:.9},
 aluminium:{color:0xc6cacd,roughness:.38,metalness:.7},
 brass:{color:0xc9a54a,roughness:.35,metalness:.85},
 rubber:{color:0x202224,roughness:.9,metalness:0},
 red:{color:0xc0392b,roughness:.5,metalness:.1},
 yellow:{color:0xd9a400,roughness:.5,metalness:.1},
 black:{color:0x2a2c2e,roughness:.6,metalness:.2},
 diode:{color:0x3a3f46,roughness:.5,metalness:.3},
 plate:{color:0xd8d2c0,roughness:.6,metalness:.4},
 varnish:{color:0x8a3d1f,roughness:.45,metalness:.35},
 insulator:{color:0xc9b48a,roughness:.7,metalness:0},
 cabinet:{color:0xd9d6cc,roughness:.6,metalness:.15},
 polyurethane:{color:0xe8b81e,roughness:.55,metalness:0},
 glass:{color:0xcfe3ea,roughness:.08,metalness:0,transparent:true,opacity:.35},
 white:{color:0xf2f0ea,roughness:.5,metalness:0},
 green:{color:0x2e8b57,roughness:.5,metalness:.1},
 orange:{color:0xe0742c,roughness:.5,metalness:.1},
 bronze:{color:0xa0703a,roughness:.4,metalness:.8},
});

/**
 * A kit for building one model.
 * @param {*} THREE the three.js module
 * @param {{id:string,title:{sv:string,en:string},summary:{sv:string,en:string}}} meta
 */
export function createKit(THREE,meta){
 const root=new THREE.Group();root.name=meta.id;
 const parts=[];

 /**
  * A named part. Everything added to it moves with it in the exploded view and lights up
  * with it when selected.
  * @param {{id:string,sv:string,en:string,textSv:string,textEn:string,explode?:number[],shell?:boolean,parent?:*}} spec
  *   shell: an outer casing that turns see-through in the cutaway view.
  */
 function part(spec){
  if(parts.some(p=>p.id===spec.id))throw Error('Duplicate part '+spec.id);
  const group=new THREE.Group();group.name=spec.id;(spec.parent||root).add(group);
  const materials=new Map();
  const record={id:spec.id,name:{sv:spec.sv,en:spec.en},text:{sv:spec.textSv,en:spec.textEn},
   object:group,explode:spec.explode||[0,0,0],shell:!!spec.shell,base:null,
   /** This part's own copy of a finish, so highlighting it lights nothing else. */
   finish(name,extra={}){
    const key=name+JSON.stringify(extra);
    if(!materials.has(key)){const f=FINISHES[name];if(!f)throw Error('Unknown finish '+name);materials.set(key,new THREE.MeshStandardMaterial({side:THREE.DoubleSide,...f,...extra}));}
    return materials.get(key);
   },
   materials,
  };
  group.userData.part=record;
  parts.push(record);return record;
 }

 /** Adds a mesh to a part. Geometry helpers below return geometry ready to place. */
 function add(rec,geometry,finish,position=[0,0,0],rotation=[0,0,0],name){
  const mesh=new THREE.Mesh(geometry,typeof finish==='string'?rec.finish(finish):finish);
  mesh.position.set(...position);mesh.rotation.set(...rotation);mesh.name=name||rec.id;
  mesh.castShadow=true;mesh.receiveShadow=true;mesh.userData.part=rec;rec.object.add(mesh);return mesh;
 }

 // Geometry, oriented for the X-axis convention.
 const geo={
  /** A solid cylinder along X. */
  cylX:(r,len,seg=32,r2=r)=>new THREE.CylinderGeometry(r2,r,len,seg).rotateZ(-Math.PI/2),
  /** A solid cylinder along Y. */
  cylY:(r,len,seg=24,r2=r)=>new THREE.CylinderGeometry(r2,r,len,seg),
  /** A solid cylinder along Z. */
  cylZ:(r,len,seg=24)=>new THREE.CylinderGeometry(r,r,len,seg).rotateX(Math.PI/2),
  /** A tube (a ring with thickness) along X: outer and inner radius, length. */
  tubeX:(outer,inner,len,seg=48)=>{
   const pts=[new THREE.Vector2(inner,-len/2),new THREE.Vector2(outer,-len/2),new THREE.Vector2(outer,len/2),new THREE.Vector2(inner,len/2),new THREE.Vector2(inner,-len/2)];
   return new THREE.LatheGeometry(pts,seg).rotateZ(-Math.PI/2);
  },
  /** A doughnut around X. */
  torusX:(r,tube,seg=40)=>new THREE.TorusGeometry(r,tube,10,seg).rotateY(Math.PI/2),
  torusY:(r,tube,seg=32)=>new THREE.TorusGeometry(r,tube,10,seg).rotateX(Math.PI/2),
  box:(x,y,z)=>new THREE.BoxGeometry(x,y,z),
  sphere:(r,seg=16)=>new THREE.SphereGeometry(r,seg,Math.max(8,seg/2)),
  /** A turned part along X from its profile: [[x, radius], …] from one end to the other. */
  latheX:(profile,seg=48)=>new THREE.LatheGeometry(profile.map(([x,r])=>new THREE.Vector2(Math.max(0,r),x)),seg).rotateZ(-Math.PI/2),
  /**
   * A curved slab around X (a pole shoe, a stator tooth, a volute wall): the ring between two
   * radii, between two angles (radians, measured from +Y towards +Z), over a length along X.
   */
  sectorX:(inner,outer,a0,a1,len,steps=12)=>{
   const shape=new THREE.Shape();
   for(let i=0;i<=steps;i++){const a=a0+(a1-a0)*i/steps;const pt=[Math.sin(a)*outer,Math.cos(a)*outer];i?shape.lineTo(...pt):shape.moveTo(...pt);}
   for(let i=steps;i>=0;i--){const a=a0+(a1-a0)*i/steps;shape.lineTo(Math.sin(a)*inner,Math.cos(a)*inner);}
   // Shape x is world z, shape y is world y; extruded along shape z, turned onto X.
   return new THREE.ExtrudeGeometry(shape,{depth:len,bevelEnabled:false}).translate(0,0,-len/2).rotateY(-Math.PI/2);
  },
  /** A hex bolt head or nut, its axis along X. */
  hexX:(across,height)=>new THREE.CylinderGeometry(across/Math.sqrt(3),across/Math.sqrt(3),height,6).rotateZ(-Math.PI/2),
 };

 /**
  * A ring of bolt heads on a face perpendicular to X: n bolts on a circle of radius r round
  * (cy, cz), at x, facing +X (dir 1) or -X (dir -1). Real machines are held by them, and
  * service starts by taking them out.
  */
 function boltCircle(rec,{x,cy=0,cz=0,r,n,size=.016,dir=1,finish='darkSteel'}){
  const g=geo.hexX(size*1.6,size*.7);
  for(let i=0;i<n;i++){const a=(i+.5)/n*Math.PI*2;add(rec,g,finish,[x+dir*size*.35,cy+Math.cos(a)*r,cz+Math.sin(a)*r],[0,0,0],'Bolt');}
 }

 /** Done: remembers where every part sits, for the exploded view. */
 function finish(extra={}){
  for(const p of parts)p.base=p.object.position.clone();
  return {id:meta.id,title:meta.title,summary:meta.summary,group:root,parts,controls:[],procedures:[],update(){},...extra};
 }
 return {root,part,add,geo,boltCircle,finish,THREE};
}

/**
 * Moves every part out along its explode offset: 0 is assembled, 1 fully exploded.
 * Parts inside other parts move relative to their parent, so offsets add up.
 */
export function setExplode(model,t){
 const k=Math.max(0,Math.min(1,t));
 for(const p of model.parts){const [x,y,z]=p.explode;p.object.position.set(p.base.x+x*k,p.base.y+y*k,p.base.z+z*k);}
 model.exploded=k;
}

/** The cutaway view: outer casings turn see-through so the inside shows. */
export function setCutaway(model,on){
 for(const p of model.parts)if(p.shell)for(const m of p.materials.values()){
  // Each material goes back to how it was made (a mesh guard stays a see-through mesh).
  const base=m.userData.asMade??={transparent:m.transparent,opacity:m.opacity,depthWrite:m.depthWrite};
  m.transparent=on||base.transparent;m.opacity=on?Math.min(base.opacity,.18):base.opacity;m.depthWrite=on?false:base.depthWrite;m.needsUpdate=true;}
 model.cutaway=!!on;
}

/** Lights up one part (or none): a warm glow on its own materials. */
export function highlight(model,id){
 for(const p of model.parts)for(const m of p.materials.values()){m.emissive?.setHex(p.id===id?0xff8a2a:0x000000);m.emissiveIntensity=p.id===id?.45:0;}
 model.selected=id||null;
}

/** Triangles in a model, for keeping models light enough for an iPad. */
export function triangleCount(model){
 let n=0;model.group.traverse(o=>{if(!o.isMesh)return;const g=o.geometry;n+=(g.index?g.index.count:g.attributes.position.count)/3;});
 return Math.round(n);
}

/**
 * Service procedures: a job done in order, as in the maker's manual. Each step says what to do
 * (Swedish and English), may name a tool and a check, and may:
 *   remove: [part ids]   parts taken off (they stay off for later steps)
 *   move:   {id:[x,y,z]} parts slid out of place, metres (adds up over the steps)
 *   set:    {control:value} controls changed (a breaker opened, a valve shut)
 * A procedure may give `initial`: [[control, value], …] applied in order before its first step,
 * so stepping back always starts from the same machine.
 *   focus:  [part ids]   parts the step is about
 *
 * @returns {{removed:Set<string>,moved:Map<string,number[]>,settings:Array<[string,*]>,focus:string[]}}
 */
export function procedureState(model,procedureId,stepIndex){
 const proc=model.procedures.find(p=>p.id===procedureId),removed=new Set(),moved=new Map(),settings=[
  // Every procedure starts from a stopped, locked-out machine.
  ...(model.controls.some(c=>c.id==='running')?[['running',false]]:[]),...(proc?.initial||[])];
 if(!proc)return {removed,moved,settings,focus:[]};
 const k=Math.max(-1,Math.min(proc.steps.length-1,stepIndex));
 for(let i=0;i<=k;i++){const st=proc.steps[i];
  for(const id of st.remove||[])removed.add(id);
  for(const [id,d] of Object.entries(st.move||{})){const m=moved.get(id)||[0,0,0];moved.set(id,m.map((v,j)=>v+d[j]));}
  settings.push(...Object.entries(st.set||{}));
 }
 const st=k>=0?proc.steps[k]:{};
 return {removed,moved,settings,focus:[...(st.focus||[]),...(st.remove||[]),...Object.keys(st.move||{})]};
}

/** Shows a procedure step: parts taken off are hidden, moved parts stand where they were moved to, the step's parts glow. */
export function showProcedureStep(model,procedureId,stepIndex){
 const state=procedureState(model,procedureId,stepIndex),{removed,moved,settings,focus}=state;
 const leaving=new Set(model.procedures.find(p=>p.id===procedureId)?.steps[stepIndex]?.remove||[]);
 for(const p of model.parts){
  // A part being taken off in this step is shown on its way out; earlier ones are gone.
  p.object.visible=!removed.has(p.id)||leaving.has(p.id)||focus.includes(p.id);
  const m=moved.get(p.id)||[0,0,0],k=leaving.has(p.id)?.6:0;
  p.object.position.set(p.base.x+m[0]+p.explode[0]*k,p.base.y+m[1]+p.explode[1]*k,p.base.z+m[2]+p.explode[2]*k);
  for(const mat of p.materials.values()){const on=focus.includes(p.id);mat.emissive?.setHex(on?0xff8a2a:0x000000);mat.emissiveIntensity=on?.45:0;}
 }
 for(const [id,v] of settings)model.controls.find(c=>c.id===id)?.set(v);
 return state;
}

/** Back to the whole machine, as built. */
export function clearProcedure(model){
 for(const p of model.parts)p.object.visible=true;
 setExplode(model,model.exploded||0);highlight(model,model.selected||null);
}
