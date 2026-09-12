import * as THREE from '../../vendor/three.module.js';
// Distant scenery outside the collision/navigation core; replaces fog-hidden cut-off edges.
export function addHorizon(parent){
 const oceanMat=new THREE.MeshStandardMaterial({color:0x426f79,roughness:.65});
 for(const [w,d,x,z] of [[1400,1400,0,-300]]){const sea=new THREE.Mesh(new THREE.PlaneGeometry(w,d),oceanMat);sea.name='Peninsula surrounding sea';sea.rotation.x=-Math.PI/2;sea.position.set(x,-.56,z);parent.add(sea);}
 const mesh=new THREE.PlaneGeometry(600,300,60,30);mesh.rotateX(-Math.PI/2);const p=mesh.attributes.position,colors=[];
 for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i)+265,edge=Math.min(1,Math.max(0,(z-115)/60));const ridge=14+30*Math.exp(-Math.pow((x+70)/75,2))+18*Math.exp(-Math.pow((x-110)/65,2))+5*Math.sin(x*.055+z*.026)+4*Math.cos(z*.08);p.setXYZ(i,x,edge*ridge-1,z);const c=new THREE.Color(0x6e8265).lerp(new THREE.Color(0x9ca68b),Math.max(0,Math.min(1,z/600)));colors.push(c.r,c.g,c.b);}
 mesh.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));mesh.computeVertexNormals();const hills=new THREE.Mesh(mesh,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1}));hills.name='Distant wooded ridge';parent.add(hills);return hills;
}
