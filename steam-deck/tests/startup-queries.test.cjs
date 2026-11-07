const {test}=require('node:test'),assert=require('node:assert/strict');
test('indexed paving preserves exact path boundaries throughout the lawn',async()=>{
 const {indexedPaving}=await import('../../johansson-town/src/desktop/startup-queries.js');let seed=13;const random=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
 const patches=Array.from({length:600},()=>{const x0=random()*500-250,z0=random()*500-250;return {x0,x1:x0+random()*15,z0,z1:z0+random()*15};}),query=indexedPaving(patches),original=(x,z)=>patches.some(p=>x>=p.x0-.01&&x<=p.x1+.01&&z>=p.z0-.01&&z<=p.z1+.01);
 for(const p of patches)for(const x of [p.x0-.011,p.x0-.01,p.x0,p.x1+.01,p.x1+.011])for(const z of [p.z0-.01,p.z0,p.z1,p.z1+.011])assert.equal(query(x,z),original(x,z));
 for(let i=0;i<10000;i++){const x=random()*600-300,z=random()*600-300;assert.equal(query(x,z),original(x,z));}
});
test('wire broad phase keeps the same triangle hits, including rays starting inside a mesh box',async()=>{
 const THREE=await import('../../johansson-town/vendor/three.module.js'),{rayCandidates}=await import('../../johansson-town/src/desktop/startup-queries.js'),meshes=[];
 for(let i=0;i<100;i++){const mesh=new THREE.Mesh(new THREE.BoxGeometry(4,4,4),new THREE.MeshBasicMaterial({side:THREE.DoubleSide}));mesh.position.set((i%10)*6,Math.floor(i/10)%3*4,Math.floor(i/10)*6);mesh.updateMatrixWorld();meshes.push(mesh);}
 const candidates=rayCandidates(meshes,THREE),ray=new THREE.Raycaster();
 for(let i=0;i<80;i++){ray.set(new THREE.Vector3(i%12*5,i%18,-2),new THREE.Vector3(.1,0,1).normalize());ray.far=i%2?35:100;assert.deepEqual(ray.intersectObjects(candidates(ray),false).map(h=>h.distance),ray.intersectObjects(meshes,false).map(h=>h.distance));}
});
