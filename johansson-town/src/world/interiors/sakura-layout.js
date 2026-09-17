// Measured from the supplied convenience-store model, in metres at floor Y=0.
const rect=(x,z,w,d,height=2.9)=>({x,z,w,d,height});
export const SAKURA_LAYOUT={
 bounds:{minX:-6.8,maxX:6.8,minZ:-6.78,maxZ:3.88},
 floorPolygon:[[-6.8,3.88],[6.8,3.88],[6.8,-3.95],[5.7,-3.95],[5.7,-6.78],[-5.7,-6.78],[-5.7,-3.95],[-6.8,-3.95]],
 spawn:[0,0,3.2],entrance:[0,0,3.45],exit:[0,1.35,3.88],yaw:0,
 // The glazing plane, in room coordinates. Both directions of the shop window use
 // it: the street seen from inside, and the real interior seen from the street.
 frontZ:3.91,
 staff:[5.5,0,.85],staffYaw:Math.PI/2,checkout:[3.9,0,.85],stockroom:[.7,0,-5.5],register:[4.78,1.1,.85],
 colliders:[
  rect(-1.5,1.33,6.05,1.23,1.5),rect(-.48,-1.16,4.08,1.23,1.5),
  rect(1.85,1.35,.57,1.2,1.55),rect(1.85,-1.15,.57,1.2,1.55),rect(-2.85,-1.17,.57,1.2,1.55),
  rect(-4.65,3.40,4.12,.65,1.5),rect(-5.17,-2.16,2.04,.61,1.5),
  rect(-6.4,.43,.9,4.03,2.25),rect(.4,-3.55,5.35,.8,2.3),
  rect(4.8,1.97,.52,3.78,1.0),rect(6.74,2.08,.18,3.48,2.0),rect(3.64,3.6,1.35,.57,1.06),
  rect(-.66,-3.99,7.82,.12),rect(5.62,-3.99,2.46,.12),
  rect(-4.02,-3.2,.12,1.53),rect(-5.4,-2.48,2.82,.12),
  rect(4.60,-2.6,.12,2.7),rect(4.86,-1.17,.56,.12),rect(6.56,-1.17,.56,.12),
  rect(-2.16,-4.49,6.88,.86,2.3),rect(-6.26,-3.26,1.0,1.2,1.2),
 ]
};
// Each stocked unit has a real position. Opposite sides of an aisle use opposite
// facings; the same product geometry is used on the shelf and in the hand.
// Shelf tops measured against the imported triangles, not the nominal shelf origin.
export const AISLE_LEVELS=[.3553,.6683,.9813,1.2943];
export const FRIDGE_LEVELS=[.34,.70,1.06,1.42,1.78];
export const SAKURA_SHELVES={};
function aisle(low,high,x,z,yaw,stand){
 for(const [id,levels] of [[low,AISLE_LEVELS.slice(0,2)],[high,AISLE_LEVELS.slice(2)]])SAKURA_SHELVES[id]={x,z,levels,yaw,stand,spacing:.24,depth:.12};
}
aisle('rice','curry',-3.6,1.56,0,[-3.6,0,2.30]);
aisle('biscuit','chips',-1.48,1.56,0,[-1.48,0,2.30]);
aisle('chocolate','candy',.55,1.56,0,[.55,0,2.30]);
aisle('soap','detergent',-3.6,1.10,Math.PI,[-3.6,0,.32]);
aisle('notebook','postcard',-1.48,1.10,Math.PI,[-1.48,0,.32]);
aisle('battery','tissues',.55,1.10,Math.PI,[.55,0,.32]);
aisle('noodles','crackers',-1.48,-.93,0,[-1.48,0,-.18]);
aisle('soup','peaches',.55,-.93,0,[.55,0,-.18]);
aisle('soy','tuna',-1.48,-1.39,Math.PI,[-1.48,0,-2.14]);
aisle('toothpaste','bread',.55,-1.39,Math.PI,[.55,0,-2.14]);
for(const [column,ids] of [['tea','coffee'],['water','orange'],['beer','cola'],['milk','yogurt']].entries()){
 for(const [row,id] of ids.entries()){const x=-1.60+column*1.33;SAKURA_SHELVES[id]={x,z:-3.48,levels:FRIDGE_LEVELS.slice(row*2,row*2+2),yaw:0,stand:[x,0,-2.78],spacing:.19,depth:.13,fridge:column};}
}
SAKURA_SHELVES.soda={x:-.27,z:-3.48,levels:[FRIDGE_LEVELS[4]],yaw:0,stand:[-.27,0,-2.78],spacing:.19,depth:.105,fridge:1};
SAKURA_SHELVES.bun={x:-6.50,z:1.515,levels:[.9573,1.3203,1.6833],columns:4,yaw:Math.PI/2,stand:[-5.58,0,1.515],spacing:.33,depth:.12};

SAKURA_SHELVES.noodles.depth=.15;
