/**
 * Minato when it is closed (open 16:00–03:00, people/social.js izakayaOpen).
 *
 * It is never empty. The Barfly lives there and works off his tab:
 *   03:00–04:00  Thao wipes the counter down; he stacks up the stools' cushions and mops.
 *   04:00–10:00  He sleeps on his stool (Thao has gone home; she sleeps 04:00–12:00).
 *   10:00–12:00  He sweeps the floor.
 *   12:00–14:00  He washes and polishes the glasses behind the counter.
 *   14:00–15:00  He mops.
 *   15:00–16:00  He wipes the tables while Thao preps at her station (social.js NAO_DAY).
 *
 * A job is a list of stations: where to stand, which way to face, the pose, the tool in
 * the right hand. The station changes every few minutes of town time, and the walker in
 * indoor-residents.js walks them there. Poses are drawn in avatars/animate.js; tools in
 * avatars/tools.js.
 */
const minuteOfDay=m=>((m%1440)+1440)%1440;
const FACE_COUNTER=0,FACE_DOOR=Math.PI;
// In front of the stools (z -1.42), facing the counter.
const STOOLS=[-3.8,-2.3,-.8,.7,2.2].map(x=>[x,0,-.62]);
const FLOOR=[[0,0,.5],[0,0,2.9],[-1.6,0,4.6],[1.2,0,4.6],[-1.2,0,-.4],[1.2,0,-.4]];
// Behind the counter, facing over it (the staff aisle, z -3.6).
const BEHIND=[[-2.6,0,-3.7],[-1.1,0,-3.7],[.4,0,-3.7]];
// At the table ends, facing along them.
const TABLES=[[-5.15,0,2.2,-Math.PI/2],[-1.85,0,2.2,Math.PI/2],[.95,0,2.0,-Math.PI/2]];

const JOBS=Object.freeze({
 Barfly:[
  {from:180,to:240,every:8,stations:STOOLS.map(at=>({at,yaw:FACE_COUNTER})),pose:'Stack',tool:null,activity:'stacking the stool cushions after closing'},
  {from:600,to:720,every:6,stations:FLOOR.map((at,i)=>({at,yaw:i*1.7})),pose:'Sweep',tool:'broom',activity:'sweeping Minato’s floor, to pay off his tab'},
  {from:720,to:840,every:15,stations:BEHIND.map(at=>({at,yaw:FACE_DOOR})),pose:'Polish',tool:'glass',activity:'washing and polishing the glasses'},
  {from:840,to:900,every:6,stations:FLOOR.map((at,i)=>({at,yaw:i*1.3+.6})),pose:'Mop',tool:'mop',activity:'mopping the floor before opening'},
  {from:900,to:960,every:7,stations:TABLES.map(([x,y,z,yaw])=>({at:[x,y,z],yaw})),pose:'Wipe',tool:'cloth',activity:'wiping the tables down for the evening'},
 ],
 Thao:[
  {from:180,to:240,every:9,stations:BEHIND.map(at=>({at,yaw:FACE_DOOR})),pose:'Wipe',tool:'cloth',activity:'wiping the counter down after closing'},
 ],
});

/** What somebody is doing in closed Minato at `minutes`, or null (asleep, out, or open). */
export function izakayaJob(name,minutes){
 const m=minuteOfDay(minutes),job=JOBS[name]?.find(j=>m>=j.from&&m<j.to);if(!job)return null;
 const step=Math.floor((m-job.from)/job.every),station=job.stations[step%job.stations.length];
 return {key:name+':'+job.from+':'+step%job.stations.length,at:station.at,yaw:station.yaw,pose:job.pose,tool:job.tool,activity:job.activity};
}
/** Who is cleaning, for the line you get coming in while Minato is closed. */
export function closedGreeting(minutes){
 const m=minuteOfDay(minutes);
 if(m>=180&&m<240)return 'Minato is closed. Thao and the Barfly are cleaning up.';
 if(m>=240&&m<600)return 'Minato is closed. The Barfly is asleep on his stool; someone has put a jacket over him.';
 if(m>=900&&m<960)return 'Minato opens at four. Thao is getting ready; the Barfly is wiping the tables.';
 return 'Minato is closed until four. The Barfly is cleaning, to pay off his tab.';
}
export const CLEANING_POSES=Object.freeze(['Stack','Sweep','Polish','Mop','Wipe']);
