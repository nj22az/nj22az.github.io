/**
 * One floor of the old sea cave, laid out on a grid of tiles.
 *
 * Rooms are scattered rectangles of cave floor, joined in a chain by crooked passages and
 * then by a couple of extra links, so a floor has loops rather than one long corridor. The
 * first room is where the rope comes down from the cave mouth; the stairs down are in the
 * room furthest from it by walking. Chests and the townsfolk in their monster suits go in
 * the other rooms, more of both the deeper you go. Everything comes from the seed, so a floor is the same floor if
 * you come back to it with the same seed, and tests can walk it.
 */
export const TILE=2.4;
export const WALL=0,FLOOR=1;

export function seeded(seed){
 let s=(seed>>>0)||1;
 return ()=>{s=Math.imul(s^s>>>15,2246822507);s=Math.imul(s^s>>>13,3266489909);s^=s>>>16;return (s>>>0)/4294967296;};
}

/** What a chest can hold, beyond coins: things the sea puts in caves. */
export const TREASURES=Object.freeze([
 {name:'Glass fishing float',value:300},{name:'Old Ryukyu coin',value:500},{name:'Black pearl',value:1200},
 {name:'Coral comb',value:450},{name:'Brass ship’s bell',value:800},{name:'Tin toy robot',value:650},
]);

/**
 * @param {number} floor 1 for the first floor down
 * @param {number} seed
 */
export function generateFloor(floor=1,seed=1){
 const random=seeded(seed*7919+floor*104729);
 const int=(a,b)=>a+Math.floor(random()*(b-a+1));
 const size=Math.min(27,17+floor*2),w=size,h=size;
 const tiles=new Uint8Array(w*h);
 const at=(x,y)=>x>=0&&y>=0&&x<w&&y<h?tiles[y*w+x]:WALL;
 const set=(x,y)=>{if(x>0&&y>0&&x<w-1&&y<h-1)tiles[y*w+x]=FLOOR;};
 // Rooms, kept a tile apart so walls stand between them.
 const rooms=[],want=Math.min(9,4+floor);
 for(let tries=0;tries<200&&rooms.length<want;tries++){
  const rw=int(3,5),rh=int(3,5),x=int(1,w-rw-2),y=int(1,h-rh-2);
  if(rooms.some(r=>x<r.x+r.w+1&&x+rw+1>r.x&&y<r.y+r.h+1&&y+rh+1>r.y))continue;
  rooms.push({x,y,w:rw,h:rh,cx:x+Math.floor(rw/2),cy:y+Math.floor(rh/2)});
 }
 for(const r of rooms)for(let y=r.y;y<r.y+r.h;y++)for(let x=r.x;x<r.x+r.w;x++)set(x,y);
 // Passages: each room to the next, then two extra links for loops.
 const dig=(a,b)=>{
  let x=a.cx,y=a.cy;const horizontalFirst=random()<.5;
  const stepX=()=>{while(x!==b.cx){x+=Math.sign(b.cx-x);set(x,y);}},stepY=()=>{while(y!==b.cy){y+=Math.sign(b.cy-y);set(x,y);}};
  if(horizontalFirst){stepX();stepY();}else{stepY();stepX();}
 };
 for(let i=1;i<rooms.length;i++)dig(rooms[i-1],rooms[i]);
 for(let i=0;i<2&&rooms.length>3;i++){const a=rooms[int(0,rooms.length-1)],b=rooms[int(0,rooms.length-1)];if(a!==b)dig(a,b);}
 // Walking distance from the first room decides where the stairs go.
 const start=rooms[0],dist=new Int32Array(w*h).fill(-1),queue=[start.cy*w+start.cx];dist[queue[0]]=0;
 for(let q=0;q<queue.length;q++){
  const i=queue[q],x=i%w,y=(i-x)/w;
  for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const j=(y+dy)*w+x+dx;if(at(x+dx,y+dy)===FLOOR&&dist[j]<0){dist[j]=dist[i]+1;queue.push(j);}}
 }
 const far=rooms.slice(1).reduce((best,r)=>dist[r.cy*w+r.cx]>dist[best.cy*w+best.cx]?r:best,rooms[1]||start);
 const stairs={x:far.cx,y:far.cy};
 // Chests and creatures in the rooms between, on free tiles.
 const taken=new Set([start.cy*w+start.cx,stairs.y*w+stairs.x]);
 const freeTile=r=>{for(let t=0;t<20;t++){const x=int(r.x,r.x+r.w-1),y=int(r.y,r.y+r.h-1),k=y*w+x;if(!taken.has(k)){taken.add(k);return {x,y};}}return null;};
 const chests=[],creatures=[];
 for(const r of rooms.slice(1)){
  if(random()<.7){const t=freeTile(r);if(t){
   const treasure=random()<.25+floor*.05?TREASURES[int(0,TREASURES.length-1)]:null;
   chests.push({...t,yen:treasure?0:int(4,12)*10*floor,treasure});
  }}
  const count=r===far?1:int(0,Math.min(3,1+Math.floor(floor/2)));
  for(let i=0;i<count;i++){const t=freeTile(r);if(t)creatures.push({...t,kind:'costume',pick:random()});}
 }
 return {floor,seed,w,h,tiles,rooms,start:{x:start.cx,y:start.cy},stairs,chests,creatures,dist,at};
}

/** Tile to world metres (the tile's centre) and back. */
export const tileCentre=(x,y)=>[(x+.5)*TILE,(y+.5)*TILE];
export const worldTile=(x,z)=>[Math.floor(x/TILE),Math.floor(z/TILE)];
