import {KITAHAMA} from '../src/world/kitahama-layout.js';

// Secondary views complement the entrance fixture. They use the authored plans:
// concrete-family table (-2.25,-1.45), red-tile guest table (1.6,1), shared-home
// personal notes at (+/- .72,1.35), and the mayor's keepsake shelf (1.6,2.64).
// Eye positions stay below ceilings and away from full-height partitions.
const CONCRETE={name:'household',pos:[-.65,1.65,-.95],at:[-2.1,.95,-1.68]};
const RED_TILE={name:'household',pos:[2.55,1.65,2.55],at:[1.35,.65,.3]};
const SHARED={name:'living',pos:[2.5,1.6,2.5],at:[-.45,.78,-.45]};
const MAYOR={name:'keepsakes',pos:[-1.2,1.5,.6],at:[1.7,1.25,2.4]};
const SATO={name:'tea-corner',pos:[1.3,1.65,2],at:[-1.5,.8,0]};
const plots=new Map(KITAHAMA.plots.map(p=>['home-'+p.id,p]));

/** Fixed camera fixtures for all fifteen entered homes; unknown venues return []. */
export function homeViews(id,layout){
 let view;
 if(id==='mayor-home')view=MAYOR;
 else if(id==='resident-home-mrs-sato')view=SATO;
 else if(['resident-home-thuan','resident-home-aya','resident-home-kenji'].includes(id))view=SHARED;
 else if(plots.has(id))view=plots.get(id).kind==='red-tile'?RED_TILE:CONCRETE;
 else return [];
 if(layout?.bounds){
  const b=layout.bounds,[x,,z]=view.pos;
  if(x<=b.minX||x>=b.maxX||z<=b.minZ||z>=b.maxZ)throw new RangeError('Secondary camera is outside '+id+' bounds');
 }
 return [{name:id==='home-kitahama-5'?'rental':view.name,pos:[...view.pos],at:[...view.at]}];
}
