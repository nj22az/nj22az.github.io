// Orthographic Canvas2D fallback using the same Three.js meshes and camera.
// Painter ordering and affine screen textures preserve a usable 3D view without WebGL.
import {Vector3,Matrix3,Color} from 'three';
export function canvasRenderer(){
 const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');if(!ctx)throw Error('Canvas2D unavailable');
 let ratio=1,width=1,height=1;
 const eye=new Vector3(),light=new Vector3(-.35,.7,1).normalize(),normalMatrix=new Matrix3(),color=new Color();
 const project=v=>({x:(v.x+1)*width/2,y:(1-v.y)*height/2,z:v.z});
 return {domElement:canvas,isCanvasRenderer:true,shadowMap:{},setPixelRatio(v){ratio=Math.min(v,1.5);},setSize(w,h){width=w;height=h;canvas.width=Math.round(w*ratio);canvas.height=Math.round(h*ratio);},dispose(){canvas.remove();},render(scene,camera){
  scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);ctx.setTransform(ratio,0,0,ratio,0,0);ctx.fillStyle=scene.background?.getStyle()||'#edf3f7';ctx.fillRect(0,0,width,height);
  const faces=[];eye.copy(camera.position);
  scene.traverseVisible(obj=>{
   if(!obj.isMesh||!obj.geometry?.attributes.position)return;const g=obj.geometry,mat=Array.isArray(obj.material)?obj.material[0]:obj.material;if(!mat||mat.visible===false)return;
   const pos=g.attributes.position;normalMatrix.getNormalMatrix(obj.matrixWorld);
   if(mat.map?.image?.getContext&&g.type==='PlaneGeometry'){
    const n=new Vector3(0,0,1).applyMatrix3(normalMatrix).normalize(),center=new Vector3().setFromMatrixPosition(obj.matrixWorld);if(n.dot(eye.clone().sub(center))<=0)return;
    const w=g.parameters.width/2,h=g.parameters.height/2;const corners=[[-w,h],[w,h],[-w,-h]].map(([x,y])=>project(new Vector3(x,y,0).applyMatrix4(obj.matrixWorld).project(camera)));
    faces.push({z:corners.reduce((s,p)=>s+p.z,0)/3,texture:mat.map.image,points:corners});return;
   }
   const world=Array.from({length:pos.count},(_,i)=>new Vector3().fromBufferAttribute(pos,i).applyMatrix4(obj.matrixWorld));const screen=world.map(v=>project(v.clone().project(camera)));const index=g.index?.array;const count=index?index.length:pos.count;
   for(let i=0;i<count;i+=3){const a=index?index[i]:i,b=index?index[i+1]:i+1,c=index?index[i+2]:i+2;const n=world[b].clone().sub(world[a]).cross(world[c].clone().sub(world[a])).normalize();if(n.dot(eye.clone().sub(world[a]))<=0)continue;
    const pts=[screen[a],screen[b],screen[c]];if(pts.every(p=>p.x<0)||pts.every(p=>p.x>width)||pts.every(p=>p.y<0)||pts.every(p=>p.y>height))continue;
    const shade=mat.isMeshBasicMaterial?1:.61+.32*Math.max(0,n.dot(light))+.1*Math.max(0,n.y);color.copy(mat.color||new Color('white')).multiplyScalar(shade);faces.push({z:(pts[0].z+pts[1].z+pts[2].z)/3,points:pts,fill:color.getStyle()});
   }
  });
  // Screen decals sit on the instrument faces; paint them after the shells.
  faces.sort((a,b)=>Number(Boolean(a.texture))-Number(Boolean(b.texture))||b.z-a.z);
  for(const f of faces){const [a,b,c]=f.points;
   if(f.texture){const w=f.texture.width,h=f.texture.height;ctx.save();ctx.transform((b.x-a.x)/w,(b.y-a.y)/w,(c.x-a.x)/h,(c.y-a.y)/h,a.x,a.y);ctx.drawImage(f.texture,0,0);ctx.restore();}
   else{ctx.fillStyle=f.fill;ctx.strokeStyle=f.fill;ctx.lineWidth=.35;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.lineTo(c.x,c.y);ctx.closePath();ctx.fill();ctx.stroke();}
  }
 }};
}
