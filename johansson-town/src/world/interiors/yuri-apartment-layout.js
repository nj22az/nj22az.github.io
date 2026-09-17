// Measured from the supplied apartment after a uniform 0.65 scale.
// The polygon follows the inner walls, excluding the neighbouring corridor.
export const YURI_APARTMENT_LAYOUT={
 bounds:{minX:-5.62,maxX:3.78,minZ:-4.75,maxZ:4.40},
 floorPolygon:[[-5.62,-.83],[-3.88,-.83],[-3.88,-2.65],[-3.43,-2.65],[-3.43,-4.75],[-.68,-4.75],[-.68,-1.43],[1.08,.42],[3.78,.42],[3.78,4.40],[-5.62,4.40]],
 spawn:[-.45,0,.4],yaw:Math.PI/2,exit:[.24,1.1,-.55],
 colliders:[
  {x:-4.15,z:3.27,w:1.15,d:1.85,height:.55},
  {x:-1.6,z:3.27,w:1.15,d:1.85,height:.55},
  {x:-2.75,z:.84,w:1.54,d:.76,height:.56},
  {x:-2.75,z:.27,w:1.1,d:.38,height:.56},
  {x:-2.75,z:1.41,w:1.1,d:.38,height:.56},
  {x:-4.96,z:-.55,w:1.41,d:.64,height:.62},
  {x:-4.99,z:.12,w:.8,d:.7,height:.91},
  {x:-5.45,z:.98,w:.31,d:.96,height:.78},
  {x:-2.94,z:-1.02,w:.75,d:.51,height:1.87},
  {x:2.2,z:.92,w:1.02,d:.73,height:1.9},
  {x:3.58,z:2.57,w:1.0,d:3.45,height:1.23},
  {x:2.28,z:4.01,w:3.1,d:.81,height:1.23},
  {x:1.16,z:3.19,w:.73,d:1.63,height:.9},
  {x:-1.37,z:-4.36,w:.94,d:.69,height:1.29},
  {x:-2.65,z:-2.87,w:1.6,d:.14,height:2.2},
  {x:-.73,z:-3.4,w:.22,d:1,height:2.16},
  {x:-3.23,z:-1.25,w:.43,d:.14,height:2.2},
  {x:-3.47,z:-1.05,w:.14,d:.5,height:2.2},
  {x:-5.3,z:2.62,w:.67,d:.1,height:2.2},
  {x:-4.97,z:2.31,w:.1,d:.62,height:2.2},
 ],
};
export const THUAN_APARTMENT_ROUTINES={
 Thuan:{bed:[-4.15,.58,3.95],bedside:[-3.08,0,2.25],table:[-1.6,0,.5],door:[-.45,0,.4],
  cover:{position:[-4.15,.64,3.35],width:1.08,length:1.3,axis:'z'}},
 Nao:{bed:[-1.6,.58,3.95],bedside:[-2.65,0,3.3],table:[-3.98,0,.5],door:[-.45,0,.4],
  cover:{position:[-1.6,.64,3.35],width:1.08,length:1.3,axis:'z'}},
};
export const YURI_APARTMENT_ROUTINE=THUAN_APARTMENT_ROUTINES.Thuan;
