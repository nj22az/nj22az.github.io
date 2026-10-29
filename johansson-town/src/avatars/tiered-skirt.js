import * as THREE from '../../vendor/three.module.js';
import {skirtSpec} from './skirt-shape.js';

/** Where each tier of the tiered skirt ends, as a fraction of its length down from the waist: a yoke, then two tiers. */
export const TIERS=Object.freeze([.3,.64,1]);
/** The gathers round a tier: how many soft folds, and how far they stand out at the tier's hem (a fraction of its radius). */
export const GATHERS=Object.freeze({folds:10,depth:.022});

/**
 * The tiered skirt (ティアードスカート), the costume gallery's batch (2026-10-29, docs/research/costume-gallery.md): a long
 * skirt of a smooth yoke and two gathered tiers. Each tier is sewn on just under the hem of the one above it and stands a
 * hem's step (`skirtSpec(m,'tieredskirt').step`) fuller than the seam it hangs from, so the cloth steps down in three and
 * every tier's hem casts its own line. Below the yoke the cloth is gathered: soft folds round the tier that open towards its
 * hem, as a gathered tier does, never a pressed pleat.
 *
 * One closed shell, as the pleated skirt is: the outer face down, round the hem, the lining back up (thickness
 * `skirtSpec().thickness`), centred on y = 0 for the shared builder (build.js), which scales it to the body's ellipse and
 * hangs it from the waist. No floor disk: the legs enter and leave through the two openings.
 */
/**
 * The outer face's line, waist to hem: [{r, y, f, gather}], y from L/2 at the waist down to -L/2, f the fraction of the
 * length, gather how far the folds stand out there (0 to 1 of GATHERS.depth).
 */
export function tieredProfile(s){
 const L=s.length,t=s.thickness,step=s.step;
 // The skirt's line without its steps: from the waist, through the hips, out to the hem.
 const cone=f=>THREE.MathUtils.lerp(s.waistR,s.hemR-step,f);
 const profile=[{r:s.waistR,y:L/2,f:0,gather:0}];
 TIERS.forEach((end,i)=>{
  const start=i?TIERS[i-1]:0,top=i?cone(start):s.waistR,hem=cone(end)+step,rows=i?4:2;
  // Under the hem above, the seam the tier hangs from (a cloth's thickness higher than that hem's edge).
  if(i)profile.push({r:top,y:L*(.5-start)+t,f:start,gather:0});
  // A gathered tier fills out quickly below its seam and then falls nearly straight to its hem; the yoke is smooth.
  for(let k=1;k<=rows;k++){const u=k/rows,f=THREE.MathUtils.lerp(start,end,u);
   profile.push({r:THREE.MathUtils.lerp(top,hem,i?1-(1-u)**1.6:u),y:L*(.5-f),f,gather:i?THREE.MathUtils.smoothstep(u,0,.7):0});}
 });
 return profile;
}

/**
 * How far out anything lying over the skirt from the waist down must be, at fraction f of its length (an apron, a hand at
 * rest): the furthest the cloth reaches at f or anywhere above it, folds included, so it spans each tier's step as stiff
 * cloth does instead of dipping into it.
 */
export function tieredReachAt(s,f){
 let reach=s.waistR;
 for(const p of tieredProfile(s)){if(p.f>f+1e-9)break;reach=Math.max(reach,p.r*(1+GATHERS.depth*p.gather));}
 // Between two rows the line runs straight, so the next row down reaches part of the way.
 const profile=tieredProfile(s),next=profile.find(p=>p.f>f+1e-9),prev=[...profile].reverse().find(p=>p.f<=f+1e-9);
 if(next&&prev&&next.f>prev.f)reach=Math.max(reach,THREE.MathUtils.lerp(prev.r*(1+GATHERS.depth*prev.gather),next.r*(1+GATHERS.depth*next.gather),(f-prev.f)/(next.f-prev.f)));
 return reach;
}

export function tieredSkirtGeometry(m){
 const s=skirtSpec(m,'tieredskirt'),t=s.thickness,profile=tieredProfile(s),first=profile[0];
 // The lining: the same line a cloth's thickness inside, back up to the waist; then closed.
 const lining=[...profile].reverse().map(p=>({...p,r:p.r-t}));
 const rows=[...profile,...lining,first];
 // LatheGeometry expects the outward side of a profile to run bottom to top (as skirt-shape.js tailoredSkirtGeometry).
 rows.reverse();
 // Five segments round each fold: enough for a soft fold, and the set inside the wardrobe's vertex budget.
 const segments=GATHERS.folds*5,g=new THREE.LatheGeometry(rows.map(p=>new THREE.Vector2(p.r,p.y)),segments),P=g.attributes.position;
 const per=rows.length;
 for(let i=0;i<P.count;i++){
  const row=rows[i%per],a=Math.atan2(P.getX(i),P.getZ(i));
  const f=1+GATHERS.depth*row.gather*Math.cos(a*GATHERS.folds);
  P.setXYZ(i,P.getX(i)*f,P.getY(i),P.getZ(i)*f);
 }
 g.computeVertexNormals();g.userData.skirtSpec=s;return g;
}
