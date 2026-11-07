// Shuffle a moment: Build scene's "give me a story" button. One tap turns the cast already on stage into a small scene
// that makes sense: who leads, how the others react, the faces that go with it, a line or two and a caption.
// The idea comes from Mario Artist Talent Studio's Shuffle (1999), which dealt random actions to the actors on stage;
// here nothing is random on its own. Each moment is written as a situation with a reason, and only the choice of which
// moment comes next is shuffled. Moves are grouped the way Talent Studio's action album grouped them (feelings,
// everyday movement, rhythm, contest), but the moments, lines and layouts are our own.
// Pure helpers (no DOM, no Three.js), so Node tests can check that every pose and face is one World can play.
import {turnToward,wrapTurn} from './scene-controls.mjs';

/**
 * A moment: `lead` is the first character on stage, `react` the roles the others take in turn (cycling when the cast is
 * bigger). `layout` 'face' puts the lead on one side facing the group; 'stage' puts the lead in the middle with the
 * others around, watching. `min` is the smallest cast the moment makes sense with.
 */
export const MOMENTS=Object.freeze([
 {id:'good-news',kind:'feelings',title:'Good news',min:1,layout:'face',caption:'Some days the whole street hears about it.',
  lead:{pose:'Tada',expression:'excited',speech:'Guess what? I passed!'},
  react:[{pose:'Cheer',expression:'happy',speech:'Congratulations!'},{pose:'Clap',expression:'laugh'}]},
 {id:'bad-news',kind:'feelings',title:'Bad news',min:1,layout:'face',caption:'The last ferry had left five minutes early.',
  lead:{pose:'Slump',expression:'sad',speech:'The last ferry’s gone…'},
  react:[{pose:'Gasp',expression:'shock',speech:'No!'},{pose:'ScratchHead',expression:'worried'}]},
 {id:'caught-out',kind:'feelings',title:'Caught out',min:2,layout:'face',caption:'Everyone knew who ate the last melon bread.',
  lead:{pose:'CollarTug',expression:'embarrassed',speech:'That wasn’t me…'},
  react:[{pose:'Point',expression:'smug',speech:'It was you!'},{pose:'Laugh',expression:'laugh'}]},
 {id:'first-hello',kind:'feelings',title:'First hello',min:2,layout:'face',caption:'Three weeks of practice for one word.',
  lead:{pose:'Coy',expression:'shy',speech:'Um… hi.'},
  react:[{pose:'HairTuck',expression:'lovestruck',speech:'Oh! Hi!'},{pose:'DoubleCheek',expression:'excited'}]},
 {id:'lost',kind:'movement',title:'Which way?',min:1,layout:'face',caption:'Every visitor asks. Every resident points a different way.',
  lead:{pose:'LookAround',expression:'worried',speech:'Which way is the harbour?'},
  react:[{pose:'Point',expression:'smile',speech:'That way!'},{pose:'Shrug',expression:'blank'}]},
 {id:'morning',kind:'movement',title:'Good morning',min:1,layout:'face',caption:'The town wakes up one yawn at a time.',
  lead:{pose:'Stretch',expression:'drowsy',speech:'Another day…'},
  react:[{pose:'Wave',expression:'smile',speech:'Morning!'},{pose:'Nod',expression:'content'}]},
 {id:'dance-off',kind:'rhythm',title:'Dance-off',min:1,layout:'stage',caption:'Nobody asked for music. Somebody danced anyway.',
  lead:{pose:'Kachashi',expression:'excited',speech:'Watch this!'},
  react:[{pose:'Clap',expression:'happy',speech:'Go, go!'},{pose:'HeelKick',expression:'laugh'}]},
 {id:'karaoke',kind:'rhythm',title:'Karaoke night',min:1,layout:'stage',caption:'Every song was the same song, and nobody minded.',
  lead:{pose:'Sing',expression:'bliss',speech:'♪ Minato, my harbour… ♪'},
  react:[{pose:'FanWild',expression:'starstruck'},{pose:'Cheer',expression:'excited',speech:'Encore!'}]},
 {id:'rematch',kind:'contest',title:'Rematch',min:2,layout:'face',caption:'The rock-paper-scissors rivalry entered its ninth year.',
  lead:{pose:'Fist',expression:'focus',speech:'Rematch. Now.'},
  react:[{pose:'HandsOnHips',expression:'smug',speech:'Any time.'},{pose:'Fidget',expression:'sweatdrop'}]},
 {id:'stop-right-there',kind:'contest',title:'Stop right there!',min:2,layout:'face',caption:'Running in the shop is not allowed. Ever.',
  lead:{pose:'FingerStop',expression:'angry',speech:'Stop right there!'},
  react:[{pose:'Bow',expression:'embarrassed',speech:'Sorry!'},{pose:'Shrug',expression:'dry'}]},
 {id:'bright-idea',kind:'everyday',title:'Bright idea',min:1,layout:'face',caption:'It was not, in the end, a good idea.',
  lead:{pose:'Point',expression:'excited',speech:'I’ve got it!'},
  react:[{pose:'ChinTap',expression:'thinking',speech:'Go on…'},{pose:'Think',expression:'dry'}]},
 {id:'the-joke',kind:'everyday',title:'The joke',min:2,layout:'face',caption:'The same joke, every Friday since 1986.',
  lead:{pose:'Talk',expression:'scheme',speech:'…and then the cat ate the ramen!'},
  react:[{pose:'Laugh',expression:'laugh'},{pose:'DoubleCheek',expression:'laugh',speech:'Stop, stop!'}]},
]);
export const MOMENT_KINDS=Object.freeze({feelings:'Feelings',movement:'Movement',rhythm:'Rhythm',contest:'Contest',everyday:'Everyday'});

/** Moments that make sense for a cast of `count` (none for an empty stage). */
export const momentsFor=count=>count<1?[]:MOMENTS.filter(m=>m.min<=count);

/**
 * The next moment to play: one that fits the cast and is not the one just played (`last` id), chosen with `rng`
 * (a function returning [0,1), Math.random by default). Returns null for an empty stage.
 */
export function pickMoment(count,{last='',rng=Math.random}={}){
 const fits=momentsFor(count),fresh=fits.length>1?fits.filter(m=>m.id!==last):fits;
 return fresh.length?fresh[Math.min(fresh.length-1,Math.floor(rng()*fresh.length))]:null;
}

/** Turn part of the way from facing `toward` to facing the camera, so faces read in the picture (a three-quarter view). */
const threeQuarter=(at,toward,camera,share=.45)=>{
 const a=turnToward(at,toward);if(!camera)return a;
 const c=turnToward(at,camera);return wrapTurn(a+wrapTurn(c-a)*share);
};

/**
 * Where everyone stands for a layout, as [{x,z}] in cast order (the lead first), relative to the location's origin. The
 * group is laid out across the picture: with the camera's {x,z} known, "across" is the camera's right and "back" is away
 * from it, so nobody stands behind anybody else as seen from the camera.
 */
export function arrange(count,layout,camera=null){
 const local=[];
 if(layout==='stage'){
  local.push({u:0,v:-.35});
  for(let k=0;k<count-1;k++){const side=k%2?-1:1,row=Math.floor(k/2);local.push({u:side*(1+row*.55),v:.35+row*.45});}
 }else{
  local.push({u:count>1?-.75:0,v:0});
  for(let k=0;k<count-1;k++)local.push({u:.45+Math.floor((k+1)/2)*.6,v:k%2?.55:0});
 }
 // u runs across the picture, v away from the camera; without a camera the picture looks along -z (World's default).
 let rx=1,rz=0,bx=0,bz=-1;
 if(camera){const d=Math.hypot(camera.x,camera.z);if(d>.01){bx=-camera.x/d;bz=-camera.z/d;rx=-bz;rz=bx;}}
 return local.map(({u,v})=>({x:Math.round((u*rx+v*bx)*1000)/1000,z:Math.round((u*rz+v*bz)*1000)/1000}));
}

/**
 * Who faces whom, from where everyone actually stands (`spots` [{x,z}], the lead first): in 'face' the lead looks at the
 * group and the others at the lead; on 'stage' the lead plays to the camera and the others watch the lead. Everyone
 * turns part of the way to the camera. Returns the turns in degrees.
 */
export function aim(spots,layout,camera=null){
 const lead=spots[0],group=spots.slice(1);
 const centre=group.length?{x:group.reduce((s,p)=>s+p.x,0)/group.length,z:group.reduce((s,p)=>s+p.z,0)/group.length}:null;
 return spots.map((p,i)=>{
  if(i>0)return threeQuarter(p,lead,camera,layout==='stage'?.35:.45);
  if(layout==='stage'||!centre)return camera?turnToward(p,camera):0;
  return threeQuarter(p,centre,camera);
 });
}

/**
 * The smallest shift that puts the whole group on open floor: `free(x,z)` says whether a spot (relative to the origin)
 * is clear. Tries rings of growing distance; returns {dx,dz}, or null when no shift within `reach` metres clears them all.
 */
export function fitGroup(spots,free,{reach=3,step=.3}={}){
 const tries=[{dx:0,dz:0}];
 for(let r=step;r<=reach+1e-9;r+=step){const n=Math.max(8,Math.round(2*Math.PI*r/step));for(let i=0;i<n;i++){const a=i/n*2*Math.PI;tries.push({dx:Math.round(r*Math.cos(a)*1000)/1000,dz:Math.round(r*Math.sin(a)*1000)/1000});}}
 return tries.find(({dx,dz})=>spots.every(p=>free(p.x+dx,p.z+dz)))||null;
}

/**
 * Play `moment` with the cast in `state` (changed in place): roles, poses, faces, lines, places and the caption. Only the
 * lead and the first to react speak, so the picture keeps room for faces. Characters keep who they are (recipe, name,
 * size); seats are left, since the moment is staged on the ground. `free(x,z)`, when given, says which floor is open, and
 * the whole group shifts together onto it (a list of such rules is tried in order, each with the group drawn tighter). After the location nudges anyone (furniture, walls), call `aim` again with
 * where they really stand. Returns the state, or null when nothing changed.
 */
export function applyMoment(state,moment,{camera=null,free=null}={}){
 const cast=state?.actors||[];if(!moment||!cast.length)return null;
 let places=arrange(cast.length,moment.layout,camera);
 // Rules in order of preference (e.g. seen clearly, then merely in the picture); a tighter group before a looser rule.
 const rules=free?(Array.isArray(free)?free:[free]):[];
 search:for(const rule of rules)for(const scale of [1,.8,.65]){
  const tried=places.map(p=>({x:p.x*scale,z:p.z*scale})),shift=fitGroup(tried,rule);
  if(shift){places=tried.map(p=>({x:p.x+shift.dx,z:p.z+shift.dz}));break search;}
 }
 const turns=aim(places,moment.layout,camera);
 cast.forEach((a,i)=>{
  const role=i===0?moment.lead:moment.react[(i-1)%moment.react.length];
  Object.assign(a,{pose:role.pose,expression:role.expression,speech:i<2?(role.speech||''):'',seat:'',x:places[i].x,z:places[i].z,turn:turns[i]});
 });
 state.bottom=moment.caption;
 return state;
}
