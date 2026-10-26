/** Offline orthogonal shortcut pass. Every edit preserves ports and is fully clearance revalidated. */
import fs from 'node:fs';
import {FERRY_INTERIOR as I} from '../src/world/ferry-interior.js';
import {validatePipeRoute} from '../src/world/ferry-pipe-routes.js';
const D=I.fuelEngineering,all=D.routes.map(r=>({...r,points:r.points.map(p=>p.slice())}));
const orders=[[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]],same=(a,b)=>a.every((v,k)=>Math.abs(v-b[k])<1e-7);
const clean=ps=>ps.filter((p,i)=>!i||!same(p,ps[i-1]));
const nonfuel=I.engineeringPipes.filter(r=>r.system!=='fuel');
for(const r of all){const before=r.points.length,[a,b]=r.terminals,existing=[...nonfuel,...all.filter(o=>o!==r)];
 for(let pass=0;pass<3;pass++){let changed=false;
  for(let i=1;i<r.points.length-3;i++){
   let found=false;
   for(let j=r.points.length-2;j>i+1&&!found;j--)for(const order of orders){const p=r.points[i].slice(),q=r.points[j],link=[p.slice()];
    for(const k of order){p[k]=q[k];link.push(p.slice());}
    const ps=clean([...r.points.slice(0,i),...link,...r.points.slice(j+1)]);
    if(ps.length>=r.points.length)continue;
    if(validatePipeRoute(ps,D.geometry,r.dn,{a,b,existing}).ok){r.points=ps;changed=true;found=true;break;}
   }
  }
  if(!changed)break;
 }
 console.log(r.lineId,before,'->',r.points.length);
}
fs.writeFileSync('/tmp/fuel-c1-simplified.json',JSON.stringify(Object.fromEntries(all.map(r=>[r.from+'>'+r.to,r.points])),null,1));
