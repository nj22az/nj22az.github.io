import * as THREE from '../../vendor/three.module.js';
import {FERRY_HULL} from './ferry-model.js';
import {MINATO_BERTH} from './minato-berth.js';

/**
 * How the Minato Maru moves in Minato harbour: where her centre goes, and which way her bow
 * points, which is not always the way she is going. A 22 m twin-screw ferry with a bow thruster
 * comes in round the breakwater's west end, swings in the basin and lays herself alongside the
 * pier; leaving, she goes astern off the berth, swings with the thruster and only then goes ahead.
 *
 * A path is a list of keys [x, z, yaw°|null]: the centre passes through every key; where a key
 * gives a yaw the bow points that way there (null: along the track, bow first), and between keys
 * it turns smoothly. The keys were chosen so that every point of the hull stays off the outer pier's
 * fenders (she lies on their faces only at the berth), a metre and more off the second pier's arm and the
 * breakwater, and off the quay (tests/ferry.test.mjs, tests/airport-ferry.test.mjs).
 *
 * Since the breakwater moved out (batch 3) the basin is 54 m from the quay, and the outer pier runs
 * 38 m out along her port side: she backs out and to the west until her stern is clear of it, then
 * swings in the western basin onto a heading for the mouth.
 */
/**
 * Moored: port side to the outer pier's west flank, lying on its fenders (minato-berth.js; until
 * batch 4a she lay 0.15 m off the bare face), the bow 0.5 m off the quay wall at z -50.
 */
export const BERTH_X=MINATO_BERTH.line-FERRY_HULL.beam/2,BERTH_Z=-50.5-FERRY_HULL.length/2;
const freeze=keys=>Object.freeze(keys.map(k=>Object.freeze(k)));
/**
 * Off the berth: astern, straight, until her bow is clear of the quay (to key `astern`); then the
 * thruster swings her bow west while she works across the basin, until she lies on a heading for
 * the harbour mouth at the last key.
 */
export const TOWN_UNBERTHING=Object.freeze({astern:2,keys:freeze([
 [BERTH_X,BERTH_Z,0],[BERTH_X-.3,-64,0],[-8.2,-67,0],
 // Astern and to the west, clear of the outer pier (38 m long since batch 3), the thruster turning her bow west...
 [-9.2,-70,-4],[-11.5,-73,-10],[-14,-76,-22],
 // ...and the swing in the western basin, which the breakwater's move opened, onto a heading for the mouth.
 [-16.5,-78,-42],[-18,-79,-62],[-19.5,-79.5,-82],[-24,-79.5,-100],[-30,-79.5,-108],
])});
/** In from inside the breakwater's end: swinging her bow to the north as she crosses the basin, and alongside, parallel to the fenders for her last metres. */
export const TOWN_BERTHING=Object.freeze({keys:freeze([[-29,-73.5,72],[-19,-68.5,45],[-12,-66.2,14],[-8,-63.4,0],[BERTH_X,BERTH_Z,0]])});
/** The harbour mouth, west of the breakwater's end, where her last turn in harbour is. */
export const HARBOUR_MOUTH=Object.freeze([-47,-86]);
/** The fairway from the open sea to the harbour mouth (the timetable's boats come and go by it). */
export const TOWN_FAIRWAY=freeze([[-82,-142],[-56,-100]]);
const wrap=d=>{while(d>Math.PI)d-=Math.PI*2;while(d<-Math.PI)d+=Math.PI*2;return d;};

/**
 * The fastest a ship of her kind turns, in degrees a second, by the kind of leg she is on
 * (briefs/ferry-audit.md §7.2): pivoting on the thruster and split engines in a harbour, up to
 * 3°/s; under way at sea with the rudder, 1°/s. Every passage is held to these (tests/airport-ferry).
 */
export const TURN_LIMITS=Object.freeze({astern:3,swing:3,manoeuvring:3,approach:3,berthing:3,sea:1});

/**
 * A polyline turned into keys a ship can sail: each corner is rounded on a circle of the given
 * radius (a turn at a steady rate of turn, as a helmsman makes it). The exact track, straights and
 * arcs, is sampled every `step` metres along its length, so the spline through the keys lies on it.
 * `points` are [x, z]; `radius` one number or one per corner. The keys carry no yaw: along them the
 * bow follows the track. `turns` lists, for each turn, the keys where it begins and ends.
 */
export function roundedTrack(points,radius,step=3){
 // The track as pieces: straights [a, b] and arcs {c, R, a0, sweep}, end to end.
 const pieces=[],used=points.map(()=>0);let at=[...points[0]];
 for(let i=1;i<points.length-1;i++){
  const [ax,az]=points[i-1],[bx,bz]=points[i],[cx,cz]=points[i+1],R=Array.isArray(radius)?radius[i-1]:radius;
  const u=[ax-bx,az-bz],v=[cx-bx,cz-bz],lu=Math.hypot(...u),lv=Math.hypot(...v);u[0]/=lu;u[1]/=lu;v[0]/=lv;v[1]/=lv;
  const angle=Math.acos(Math.max(-1,Math.min(1,u[0]*v[0]+u[1]*v[1])));
  if(Math.PI-angle<1e-3)continue;
  const t=R/Math.tan(angle/2);
  // Each straight is shared by the turns at its two ends: together they must leave some of it straight.
  if(used[i-1]+t>lu*.98||t>lv*.98)throw new RangeError('Corner '+i+' is too tight for a '+R+' m turn');used[i]=t;
  const p=[bx+u[0]*t,bz+u[1]*t],q=[bx+v[0]*t,bz+v[1]*t],bis=[u[0]+v[0],u[1]+v[1]],lb=Math.hypot(...bis),d=R/Math.sin(angle/2);
  const c=[bx+bis[0]/lb*d,bz+bis[1]/lb*d],a0=Math.atan2(p[1]-c[1],p[0]-c[0]),sweep=wrap(Math.atan2(q[1]-c[1],q[0]-c[0])-a0);
  pieces.push({a:at,b:p,length:Math.hypot(p[0]-at[0],p[1]-at[1])});
  pieces.push({c,R,a0,sweep,length:Math.abs(sweep)*R,turn:true});at=q;
 }
 pieces.push({a:at,b:[...points.at(-1)],length:Math.hypot(points.at(-1)[0]-at[0],points.at(-1)[1]-at[1])});
 const total=pieces.reduce((sum,piece)=>sum+piece.length,0),count=Math.max(2,Math.round(total/step));
 const sample=s=>{for(const piece of pieces){if(s<=piece.length+1e-9){const f=piece.length?Math.min(1,s/piece.length):0;
   if(!piece.turn)return [piece.a[0]+(piece.b[0]-piece.a[0])*f,piece.a[1]+(piece.b[1]-piece.a[1])*f];
   const a=piece.a0+piece.sweep*f;return [piece.c[0]+Math.cos(a)*piece.R,piece.c[1]+Math.sin(a)*piece.R];}s-=piece.length;}
  return [...points.at(-1)];};
 const out=[];for(let k=0;k<=count;k++)out.push([...sample(total*k/count),null]);
 // Which keys each turn spans.
 const turns=[];let s0=0;for(const piece of pieces){if(piece.turn)turns.push({from:Math.floor(s0/total*count),to:Math.ceil((s0+piece.length)/total*count)});s0+=piece.length;}
 out.turns=turns;
 return out;
}

/**
 * A passage: a keyed track sailed leg by leg, as a ship sails it. Each leg runs from where the last
 * one ended to the key `to`, in its own time (`minutes`), and is of a `kind` (TURN_LIMITS):
 * 'astern' off a berth, 'swing' (pivoting), 'manoeuvring' (slow ahead in a harbour), 'sea',
 * 'approach' and 'berthing'. Her speed along the track is continuous from rest at the first key to
 * rest at the last: a monotone cubic in time through the legs' ends (Fritsch–Carlson, with the
 * Fritsch–Butland slopes), so she never jumps, stops dead or backs up the track. Her bow turns
 * through the keyed headings on a cubic in time whose rate is continuous at every key, and where the
 * keys give no heading she follows the track, bow first. A leg may carry a whistle `signal`
 * ('prolonged', 'astern'), sounded as she enters it.
 *
 * pose(seconds) answers where she is, her heading, speed (m/s), rate of turn (rad/s), the leg, and
 * how exposed she is to the swell (0 in harbour, 1 at sea), for her roll and pitch. `under` says
 * whether she is already making way at the first key (`from`) or still at the last (`to`), as a
 * ship that comes in from beyond the horizon or goes out of sight is; otherwise she is at rest there.
 */
export function passage(keys,legs,under={from:false,to:false}){
 const n=keys.length,curve=new THREE.CatmullRomCurve3(keys.map(([x,z])=>new THREE.Vector3(x,0,z)),false,'centripetal');
 // Arc lengths finely enough that her speed along it does not ripple (the curve's default is 200 steps).
 const PER=Math.max(40,Math.ceil(curve.getLength()*12/(n-1)));curve.arcLengthDivisions=PER*(n-1);curve.updateArcLengths();
 const lengths=curve.getLengths(),L=lengths.at(-1),S=keys.map((_,k)=>lengths[k*PER]);
 const v=new THREE.Vector3(),tan=new THREE.Vector3();
 const point=s=>{curve.getPointAt(Math.max(0,Math.min(1,s/L)),v);return [v.x,v.z];};
 const trackYaw=s=>{curve.getTangentAt(Math.max(.0001,Math.min(.9999,s/L)),tan);return Math.atan2(tan.x,tan.z);};
 // Headings at the keys (unwrapped): keyed, or the track's own where she follows it.
 const free=keys.map(k=>k[2]===null||k[2]===undefined);
 const Y=[];for(let k=0;k<n;k++){let y=free[k]?trackYaw(S[k]):keys[k][2]*Math.PI/180;if(k)y=Y[k-1]+wrap(y-Y[k-1]);Y.push(y);}
 // Time knots at every key. A leg's time is shared among its keys by the work each stretch needs:
 // its distance at the leg's mean speed, or its turn at a comfortable rate (60 % of the limit),
 // whichever takes longer; so she slows where she pivots instead of spinning. Then the monotone
 // cubic s(t) runs through the knots.
 const kt=[0],ks=[0],legEnd=[0];let from=0;
 for(const leg of legs){
  if(!(leg.to>from)||leg.to>=n)throw new RangeError('Legs must run forward along the keys');
  if(!(leg.kind in TURN_LIMITS))throw new RangeError('Unknown leg kind '+leg.kind);
  const span=leg.minutes*60,mean=(S[leg.to]-S[from])/span,rate=TURN_LIMITS[leg.kind]*.6*Math.PI/180,work=[];
  for(let k=from;k<leg.to;k++)work.push(Math.max((S[k+1]-S[k])/mean,Math.abs(Y[k+1]-Y[k])/rate,1e-6));
  const total=work.reduce((a,b)=>a+b,0);
  for(let k=from;k<leg.to;k++){kt.push(kt.at(-1)+span*work[k-from]/total);ks.push(S[k+1]);}
  legEnd.push(kt.length-1);from=leg.to;
 }
 if(from!==n-1)throw new RangeError('The last leg must end at the last key');
 const m=kt.length,h=[],d=[];for(let j=0;j<m-1;j++){h.push(kt[j+1]-kt[j]);d.push((ks[j+1]-ks[j])/h[j]);}
 // At rest at a berth; or already making way, at the speed of her first or last stretch, where she comes in from or goes out to sea.
 const slope=[under.from?d[0]:0];for(let j=1;j<m-1;j++)slope.push(d[j-1]*d[j]<=0?0:3*(h[j-1]+h[j])/((2*h[j]+h[j-1])/d[j-1]+(h[j]+2*h[j-1])/d[j]));slope.push(under.to?d[m-2]:0);
 const hermite=(t,t0,t1,y0,y1,m0,m1)=>{const hh=t1-t0,u=(t-t0)/hh,u2=u*u,u3=u2*u;
  return [(2*u3-3*u2+1)*y0+(u3-2*u2+u)*hh*m0+(-2*u3+3*u2)*y1+(u3-u2)*hh*m1,((6*u2-6*u)*y0+(3*u2-4*u+1)*hh*m0+(-6*u2+6*u)*y1+(3*u2-2*u)*hh*m1)/hh];};
 const T=kt.at(-1);
 const knot=t=>{let j=0;while(j<m-2&&t>kt[j+1])j++;return j;};
 const distance=t=>{t=Math.max(0,Math.min(T,t));const j=knot(t);return hermite(t,kt[j],kt[j+1],ks[j],ks[j+1],slope[j],slope[j+1]);};
 // She passes key k at kt[k] (every key is a knot).
 const keyT=kt;
 // Her heading along the track: between keyed headings a cubic in distance (so the hull sweeps the
 // same water whatever her speed), with the track's own curvature where it meets a stretch she
 // sails bow first, and Fritsch–Butland slopes elsewhere (no overshoot between keys). Her rate of
 // turn is that slope times her speed.
 const trackCurve=s=>{const e=Math.min(.25,L/1e4),a=Math.max(0,s-e),b=Math.min(L,s+e);return wrap(trackYaw(b)-trackYaw(a))/(b-a);};
 const M=keys.map((_,k)=>{
  if(k===0||k===n-1)return free[k]?trackCurve(S[k]):0;
  if(free[k]&&(free[k-1]||free[k+1]))return trackCurve(S[k]);
  const a=(Y[k]-Y[k-1])/(S[k]-S[k-1]),b=(Y[k+1]-Y[k])/(S[k+1]-S[k]),ha=S[k]-S[k-1],hb=S[k+1]-S[k];
  return a*b<=0?0:3*(ha+hb)/((2*hb+ha)/a+(hb+2*ha)/b);
 });
 const headingAt=s=>{let k=0;while(k<n-2&&s>S[k+1])k++;
  if(free[k]&&free[k+1]){const y=Y[k]+wrap(trackYaw(s)-Y[k]);return [y,trackCurve(s)];}
  return hermite(s,S[k],S[k+1],Y[k],Y[k+1],M[k],M[k+1]);};
 const legTimes=legEnd.map(i=>kt[i]);
 const legAt=t=>{let j=0;while(j<legs.length-1&&t>=legTimes[j+1])j++;return j;};
 // Exposure to the swell: 1 on a sea leg, easing in and out over its first and last minute.
 const exposureAt=t=>{const j=legAt(t);if(legs[j].kind!=='sea')return 0;const e=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};return Math.min(e((t-legTimes[j])/60),e((legTimes[j+1]-t)/60));};
 function pose(t){
  t=Math.max(0,Math.min(T,t));const [s,speed]=distance(t),[x,z]=point(s),[yaw,perMetre]=headingAt(s),turn=perMetre*speed;
  const leg=legAt(t);
  return {x,z,yaw:wrap(yaw),speed,turn,leg,kind:legs[leg].kind,exposure:exposureAt(t),distance:s};
 }
 /** Whistle signals in order, with the time she sounds each (entering the leg that carries it). */
 const signals=legs.flatMap((leg,j)=>[].concat(leg.signal||[]).map(kind=>({kind,at:legTimes[j],leg:j})));
 return {pose,duration:T,length:L,legs:legs.map((leg,j)=>({...leg,from:legTimes[j],until:legTimes[j+1]})),keyTimes:keyT,signals,curve};
}

/** A keyed path: pose(u) for u 0–1 along it, and the share at which it passes a key or a point. */
export function keyedPath(keys){
 const curve=new THREE.CatmullRomCurve3(keys.map(([x,z])=>new THREE.Vector3(x,0,z)),false,'centripetal');
 const v=new THREE.Vector3(),t=new THREE.Vector3();
 const shareNear=(x,z)=>{let best=0,bestD=Infinity;for(let i=0;i<=1200;i++){curve.getPointAt(i/1200,v);const d=Math.hypot(v.x-x,v.z-z);if(d<bestD){bestD=d;best=i/1200;}}return best;};
 const at=keys.map(([x,z])=>shareNear(x,z));at[0]=0;at[at.length-1]=1;
 const tangentYaw=u=>{curve.getTangentAt(Math.max(.0005,Math.min(.9995,u)),t);return Math.atan2(t.x,t.z);};
 const yawOf=(i,u)=>keys[i][2]===null?tangentYaw(u):keys[i][2]*Math.PI/180;
 function pose(u){
  u=Math.max(0,Math.min(1,u));curve.getPointAt(u,v);
  let j=at.findIndex(a=>a>u);if(j===-1)j=at.length-1;if(j===0)j=1;
  const i=j-1,f=Math.max(0,Math.min(1,(u-at[i])/((at[j]-at[i])||1))),s=f*f*(3-2*f);
  const a=yawOf(i,u),b=yawOf(j,u);
  return {x:v.x,z:v.z,yaw:a+wrap(b-a)*s};
 }
 return {curve,pose,at,shareNear};
}

/**
 * The timetable's arrival and departure (ferry.js): in from the open sea by the fairway, round the
 * corner at the harbour mouth, across the basin and alongside; and out the same way. Their legs
 * are FERRY_TIMES in ferry.js: in, two minutes at sea and three and a half in harbour; out, a minute
 * and a half astern, a minute and a half swinging, two minutes to the mouth and two at sea.
 */
export function townArrival(T){
 const track=roundedTrack([...TOWN_FAIRWAY,HARBOUR_MOUTH,TOWN_BERTHING.keys[0].slice(0,2)],[60,16]),inside=track.turns.at(-1).from;
 const keys=[...track.slice(0,-1),...TOWN_BERTHING.keys];
 return passage(keys,[{to:inside,minutes:T.sea,kind:'sea'},{to:keys.length-3,minutes:T.harbour*.55,kind:'approach',signal:'prolonged'},{to:keys.length-1,minutes:T.harbour*.45,kind:'berthing'}],{from:true});
}
export function townDeparture(T){
 const U=TOWN_UNBERTHING,last=U.keys.at(-1);
 const track=roundedTrack([last.slice(0,2),HARBOUR_MOUTH,...[...TOWN_FAIRWAY].reverse()],[16,60]);
 const keys=[...U.keys,...track.slice(1)],clear=U.keys.length-1+track.turns[0].to;
 return passage(keys,[{to:U.astern,minutes:T.reverse,kind:'astern',signal:['prolonged','astern']},{to:U.keys.length-1,minutes:T.turn,kind:'swing'},
  {to:clear,minutes:T.leaveHarbour,kind:'manoeuvring'},{to:keys.length-1,minutes:T.leaveSea,kind:'sea',signal:'prolonged'}],{to:true});
}
