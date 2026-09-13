// Measured from the supplied convenience-store model, in metres at floor Y=0.
const rect=(x,z,w,d,height=2.9)=>({x,z,w,d,height});
export const SAKURA_LAYOUT={
 bounds:{minX:-6.8,maxX:6.8,minZ:-6.78,maxZ:3.88},
 floorPolygon:[[-6.8,3.88],[6.8,3.88],[6.8,-3.95],[5.7,-3.95],[5.7,-6.78],[-5.7,-6.78],[-5.7,-3.95],[-6.8,-3.95]],
 spawn:[0,0,3.2],entrance:[0,0,3.45],exit:[0,1.35,3.88],yaw:0,
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
export const SAKURA_SHELVES={
 tea:{x:-1.62,z:-3.5,y:.84,yaw:0,stand:[-1.62,0,-2.57]},
 coffee:{x:-.27,z:-3.5,y:.84,yaw:0,stand:[-.27,0,-2.57]},
 water:{x:1.07,z:-3.5,y:.84,yaw:0,stand:[1.07,0,-2.57]},
 beer:{x:2.40,z:-3.5,y:.84,yaw:0,stand:[2.40,0,-2.57]},
 rice:{x:-3.6,z:1.77,y:.64,yaw:0,stand:[-3.6,0,2.52]},
 biscuit:{x:-1.48,z:1.77,y:.64,yaw:0,stand:[-1.48,0,2.52]},
 soap:{x:-3.6,z:.91,y:.64,yaw:Math.PI,stand:[-3.6,0,.32]},
 notebook:{x:-1.48,z:.91,y:.64,yaw:Math.PI,stand:[-1.48,0,.32]},
 postcard:{x:.55,z:1.77,y:.64,yaw:0,stand:[.55,0,2.52]},
 battery:{x:.55,z:.91,y:.64,yaw:Math.PI,stand:[.55,0,.32]},
 cola:{x:-1.48,z:-.70,y:.64,yaw:0,stand:[-1.48,0,-.18]},
 noodles:{x:.55,z:-.70,y:.64,yaw:0,stand:[.55,0,-.18]},
 milk:{x:.55,z:-1.58,y:.64,yaw:Math.PI,stand:[.55,0,-2.28]},
 bun:{x:-6.40,z:1.45,y:.91,yaw:Math.PI/2,stand:[-5.35,0,1.45]},
};
