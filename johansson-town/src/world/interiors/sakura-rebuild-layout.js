// Candidate single-storey layout. One rigid translation from CAD metres to the existing shop frame.
export const SAKURA_REBUILD_OFFSET=Object.freeze([-6.95,0,3.91]);
export const sakuraRebuildRequested=()=>new URLSearchParams(globalThis.location?.search||'').has('sakura-rebuild');
export const sakuraRoomPoint=(x,depth,y=0)=>[x-6.95,y,3.91-depth];
export function sakuraRebuildLayout(solids=[]){
 const rect=(x,z,w,d,height=2.6)=>({x:x+w/2-6.95,z:3.91-z-d/2,w,d,height});
 const colliders=[rect(0,1.2,.7,7.04,2.12),...[1.85,3.8,5.75].map(x=>rect(x,2.4,.9,4.5,1.35)),rect(7.7,2.3,.9,4.5,.85),rect(11.3,1.4,.8,4.8,.78),rect(13.3,1.4,.6,4.8,.78),rect(5.5,.8,.4,.5,.6),rect(8.2,0,1.4,.6,.85),rect(9.7,0,.6,.8,1.45),rect(10.4,0,1,.8,.95),rect(.2,0,1.8,.6,1.3)];
 for(const s of solids)if(s.g==='Partitions'||s.g==='ColdRoom'&&s.h>2000&&s.w<6000&&s.d!==20&&s.z>=8240)colliders.push(rect(s.x/1000,s.z/1000,s.w/1000,s.d/1000,s.h/1000));
 // Rear work: rack, empties, parked trolley, futon, table, desk/safe/chair and WC/basin.
 for(const r of [[13.4,8.34,.5,1.7],[12.35,10.04,.9,.5],[12.8,9,.6,.8],[4.1,8.54,1,2],[2.6,8.7,.5,.5],[13.2,6.66,.6,1.1],[11.53,7.66,.45,.45],[12.8,7.1,.45,.45],[.25,9.8,.45,.65],[1.72,8.42,.45,.4]])colliders.push(rect(...r,1));
 const spot=(id,x,d,facing,why)=>({id,x:x-6.95,z:3.91-d,facing,why});
 const queue=[spot('paying',10.65,2.9,[1,0],'customer at the retained till'),spot('next',10.65,1.9,[0,-1],'one metre behind the paying customer')];
 const browse=[spot('fresh',1.27,4.6,[-1,0],'fresh lunch'),spot('pantry',3.275,4.6,[-1,0],'pantry goods'),spot('sweets',5.225,4.6,[-1,0],'snacks'),spot('daily',7.175,4.6,[-1,0],'daily goods')];
 return {candidate:true,bounds:{minX:-6.95,maxX:6.95,minZ:-6.73,maxZ:3.91},floorPolygon:[[-6.95,3.91],[6.95,3.91],[6.95,-6.73],[-6.95,-6.73]],spawn:sakuraRoomPoint(6.95,.85),entrance:sakuraRoomPoint(6.95,.85),exit:sakuraRoomPoint(6.95,0,1.35),frontZ:3.91,yaw:0,clearance:.36,staff:sakuraRoomPoint(12.45,2.9),staffApproach:sakuraRoomPoint(12.7,2.9),staffBody:.2,staffYaw:Math.PI/2,checkout:sakuraRoomPoint(10.65,2.9),register:[4.89,.93,1.01],queue,browse,guestStands:[sakuraRoomPoint(10.65,4),sakuraRoomPoint(10.65,5)],guestYaw:-Math.PI/2,guestActivity:'chatting with Thuan at the counter',stockroom:sakuraRoomPoint(10.9,9.7),colliders};
}
