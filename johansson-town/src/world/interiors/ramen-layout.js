// Measured against inakaya-exterior.glb. The street pack compresses X/Z;
// restore its depth and give the customer aisle room for the player and diners.
export const INAKAYA_FIT={scale:[1,1,1.25],floor:.32778847};
// Undo the street pack's width compression, then add 60 cm only in the aisle.
// Counter, stools and right-wall fixtures keep their original proportions.
export const ramenX=x=>x/.75+.6*Math.max(0,Math.min(1,(x-.43)/.30));
export const ramenPoint=(x,y,z)=>[ramenX(x),y-INAKAYA_FIT.floor,z*INAKAYA_FIT.scale[2]];
const seat=z=>({position:ramenPoint(.28,INAKAYA_FIT.floor,z),height:.8868523-INAKAYA_FIT.floor,yaw:Math.PI/2});
// Alternate stools leave shoulder room; two more stools remain for the player.
export const RAMEN_GUEST_SEATS=[seat(1),seat(-.6)];
export const RAMEN_PLAYER_SEATS=[seat(1.8),seat(.2)];
export const RAMEN_YURI_SPOT={position:ramenPoint(.25,INAKAYA_FIT.floor,2.58),yaw:0};
const rect=(x,z,w,d,height)=>({x:(ramenX(x-w/2)+ramenX(x+w/2))/2,z:z*1.25,w:ramenX(x+w/2)-ramenX(x-w/2),d:d*1.25,height});
export const RAMEN_LAYOUT={
 bounds:{minX:ramenX(-1.76),maxX:ramenX(1.035),minZ:-1.10*1.25,maxZ:2.94*1.25},
 spawn:ramenPoint(.72,INAKAYA_FIT.floor,2.56),exit:ramenPoint(.66,1.35,3.04),
 colliders:[
  // Counter and kitchen are visible but not a customer passage.
  rect(-.74,.38,1.95,3.52,1.55),
  // Continuous stool row: prevents walking through the furniture.
  rect(.28,.22,.30,3.52,.60),
  // Hand basin projects from the right wall beside the middle stools.
  rect(.90,1.11,.34,.44,.83),
  // Front display case; leave the entrance and the standing guest spot clear.
  rect(-.90,2.69,1.10,.44,1.65),
 ]
};
