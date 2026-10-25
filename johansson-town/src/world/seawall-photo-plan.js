/** Owner-approved option A, CAD JW-PH-001 C. Prototype opt-in; no ordinary-world changes. */
export const SEAWALL_PHOTO_ENABLED=globalThis.process?.env?.JOHANSSON_SEAWALL_PHOTO==='1'||
 (typeof location!=='undefined'&&new URLSearchParams(location.search).has('seawall-photo'));
export const SEAWALL_PHOTO=Object.freeze({
 rail:{x:-39.55,minZ:-10.3,maxZ:-4.3,top:1.24},
 pier:{minX:-55.55,maxX:-39.2,minZ:-13.2,maxZ:-10.8,top:.04},
 photo:{id:'photo-nishi-overlook',title:'Nishi seawall portrait',at:'at the Nishi seawall overlook',x:-38.65,z:-6.65,y:.04,
  photoPreset:{subject:[-38.65,.04,-6.65],camera:[-35.3,1.22,-6.65],target:[-38.65,.86,-7.05],fov:34,yaw:Math.PI/2,format:'square'}},
});
export function seawallPhotoAt(x,z,r=0){const p=SEAWALL_PHOTO.pier;return SEAWALL_PHOTO_ENABLED&&x>=p.minX+r&&x<=p.maxX-r&&z>=p.minZ+r&&z<=p.maxZ-r;}
/** Old wall is physically cut into three retained runs; new bay has its own low plinth/rails. */
export function seawallRetainedRuns(from,to){return SEAWALL_PHOTO_ENABLED?[[from,-13.2],[-10.8,-10.3],[-4.3,to]]:[[from,to]];}
/** West-shore tetrapods are ~1.9 m wide: remove the entire envelope, never clip legs under the slab. */
export function seawallArmourKept(x,z){return !SEAWALL_PHOTO_ENABLED||x>-39||x< -44||z< -14.7||z> -2.8;}
export function seawallPhotoGround(){const p=SEAWALL_PHOTO.pier;return {cls:'quay',name:'Nishi lookout pier deck',x0:p.minX,x1:p.maxX,z0:p.minZ,z1:p.maxZ,top:p.top,depth:.16,why:'The owner-approved lookout deck connects flush to the seawall promenade; Blender supports carry it over the water.'};}
export function seawallPhotoSolids(){const p=SEAWALL_PHOTO.pier,r=SEAWALL_PHOTO.rail,out=[];
 const add=(id,x,z,w,d,height)=>out.push({id:'nishi-photo-'+id,x,z,w,d,height,seawallPhoto:true});
 add('portrait-rail',r.x,(r.minZ+r.maxZ)/2,.16,6,r.top); // Continuous barrier follows all three rails and the plinth.
 for(const z of [p.minZ+.05,p.maxZ-.05])add('pier-side',(p.minX+p.maxX)/2,z,p.maxX-p.minX,.1,p.top+1.1);
 add('pier-end',p.minX+.05,(p.minZ+p.maxZ)/2,.1,p.maxZ-p.minZ,p.top+1.1);
 return out;
}
