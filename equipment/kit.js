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
    if(!materials.has(key)){const f=FINISHES[name];if(!f)throw Error('Unknown finish '+name);materials.set(key,new THREE.MeshStandardMaterial({...f,...extra}));}
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
 };

 /** Done: remembers where every part sits, for the exploded view. */
 function finish(extra={}){
  for(const p of parts)p.base=p.object.position.clone();
  return {id:meta.id,title:meta.title,summary:meta.summary,group:root,parts,controls:[],update(){},...extra};
 }
 return {root,part,add,geo,finish,THREE};
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
 for(const p of model.parts)if(p.shell)for(const m of p.materials.values()){m.transparent=on;m.opacity=on?.18:1;m.depthWrite=!on;m.needsUpdate=true;}
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
