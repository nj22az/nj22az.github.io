/**
 * Runs in headless Chromium, served by tools/ferry-viewer-export.mjs: builds the ferry with the game's own modules, names
 * her the Christina (see below: she is the viewer's ship, drawn from the Minato Maru until she has data of her own) and
 * posts her back as the Office's ferry viewer reads her (nj22az.github.io, /ferry/).
 *
 * The container (JMF1): one JSON header and one binary block.
 *   header.bounds          the box every position is quantised over (metres; x to port, y up from the laden waterline)
 *   header.materials[]     shading (standard|basic), metalness, roughness, transparent, opacity, emissive, side, textured,
 *                          depthWrite, alphaTest, offset ([factor, units] of the depth offset a plate lies off its wall by, or null)
 *   header.views[].groups  the parts that move apart: id, name, level, explode [x,y,z] in metres at full spread,
 *                          spaces[] (id, name, text: what is in it, why, and its box min/max in the same axes; from FERRY_GA,
 *                          the yard's working notes taken out) and meshes[]
 *   mesh                   material, vertices, triangles and byte offsets into the block: pos (Uint16 ×3 over bounds),
 *                          nor (Int8 ×3), col (sRGB Uint8 ×3, already multiplied by the material's colour),
 *                          uv (Uint16 ×2 over the atlas, textured meshes only), idx (Uint16, or Uint32 when `wide`)
 * Every chunk starts on a 4-byte boundary.
 */
globalThis.__KIT_TRACE__=true;
const BASE='/johansson-town/';
const post=async(name,body)=>{const r=await fetch('/__out/'+name,{method:'POST',body});if(!r.ok)throw Error('could not hand back '+name+': '+r.status);};

try{
 const THREE=await import(BASE+'vendor/three.module.js');
 const {buildFerryModel}=await import(BASE+'src/world/ferry-model.js');
 const {paintBack}=await import(BASE+'src/render/canvas-release.js');
 const {FERRY_GA,FERRY_SHIP,FERRY_HEIGHTS}=await import(BASE+'src/world/ferry-ship.js');
 const {NAME_BOARD}=await import(BASE+'src/world/ferry-boards.js');

 /**
  * ---- The ship shown is the Christina. The owner, 9 November 2026: "I think you should call this ship the Christina ,
  * it's not the same as Minato Maru , it doesn't look the same either", and "We can rebuild Minato maru later from what we
  * learn from building this ship". She is the lead ship. Until she has data of her own she is drawn by the Minato Maru's
  * builders, and nothing under src/ changes for her: the World's ferry stays as it is.
  *
  * Her name is painted here. Every plate and marking is written on a canvas, so the name is changed as it is written:
  *   bow          CHRISTINA on one line, centred in the tile (the Minato Maru carries みなと丸 over MINATO MARU there)
  *   transom      CHRISTINA over the port of registry, which stays MINATO until the owner names hers
  *   name boards  CHRISTINA alone: the board lays out two names with a gap, so the second is measured as taking the gap
  *                back and is not written, which centres the first
  *   elsewhere    wherever a line of text carries the ship's name (the safety plan's heading)
  * Minato the town and the Minato – Kitano-jima route are left as they are; `report.renamed.kept` lists every line that
  * still says Minato, so nothing of the old name stays unseen.
  */
 const CHRISTINA=Object.freeze({name:'Christina',painted:'CHRISTINA',drawnFrom:FERRY_SHIP.name});
 const renamed={bow:0,bowSecondLine:0,transom:0,board:0,boardSecondName:0,elsewhere:0,kept:new Set()};
 {
  const P=CanvasRenderingContext2D.prototype,fill0=P.fillText,measure0=P.measureText;
  const JP=FERRY_SHIP.jp,EN=FERRY_SHIP.name.toUpperCase(),TO=CHRISTINA.painted;
  const fontPx=c=>+(c.font.match(/([\d.]+)px/)||[0,0])[1];
  const inText=s=>s.split(`${EN} ${JP}`).join(TO).split(JP).join(TO).split(EN).join(TO).split(FERRY_SHIP.name).join(CHRISTINA.name);
  P.measureText=function(s){
   if(s===JP)return measure0.call(this,TO);
   if(s===EN&&Math.abs(fontPx(this)-NAME_BOARD.enSize)<.01)return {width:-NAME_BOARD.gap};
   return measure0.call(this,typeof s==='string'?inText(s):s);
  };
  P.fillText=function(s,x,y,...rest){
   if(typeof s!=='string')return fill0.call(this,s,x,y,...rest);
   if(s===EN){renamed[this.textAlign==='center'?'bowSecondLine':'boardSecondName']++;return;}
   if(s===JP&&this.textAlign!=='center'){renamed.board++;return fill0.call(this,TO,x,y,...rest);}
   if(s===JP){
    // The hull: the bow name is the larger of the two. Lettered wide, as a name welded on in plate letters is, and fitted to its tile.
    const bow=fontPx(this)>=60,font=this.font,spacing=this.letterSpacing,room=this.canvas.width*.44;
    let px=bow?82:54;
    const set=()=>{this.font=`bold ${px}px sans-serif`;this.letterSpacing=(px*.07).toFixed(1)+'px';};
    set();const w=measure0.call(this,TO).width;if(w>room){px=Math.floor(px*room/w);set();}
    // The last letter's spacing trails it, so the word is moved half of that to stay centred.
    fill0.call(this,TO,x+px*.035,bow?this.canvas.height/8:y,...rest);
    this.font=font;this.letterSpacing=spacing;renamed[bow?'bow':'transom']++;return;
   }
   const t=inText(s);if(t!==s)renamed.elsewhere++;
   if(/minato|みなと/i.test(t))renamed.kept.add(t);
   return fill0.call(this,t,x,y,...rest);
  };
 }

 // ---- Built and posed as the game poses her with someone below deck (tools/ferry-cad.mjs does the same in Node).
 const ship=buildFerryModel();
 const h1=ship.userData.engineRoomH1;if(!h1)throw Error('the ferry has no engine room handle (userData.engineRoomH1)');
 h1.group.visible=true;await h1.ensure();if(!h1.loaded)throw Error('the engine room model did not load: '+h1.error);
 const below=ship.userData.belowDeck.plates;below.visible=true;
 ship.updateMatrixWorld(true);
 const toShip=new THREE.Matrix4().copy(ship.matrixWorld).invert();

 // ---- The parts that move apart, bottom to top.
 const H=FERRY_HEIGHTS,keel=h=>h-FERRY_SHIP.draft,m1=v=>v.toFixed(1);
 const SECTIONS=[
  {id:'hull',name:'Hull',level:`${m1(FERRY_SHIP.length)} m long, ${m1(FERRY_SHIP.beam)} m beam, ${m1(FERRY_SHIP.depth)} m to the car deck, ${m1(FERRY_SHIP.draft)} m draft`},
  {id:'machinery',name:'Machinery spaces',level:`Floor plates ${m1(H.floorPlates)} m above the keel`},
  {id:'car',name:'Car deck',level:`${m1(H.carDeck)} m above the keel`,from:keel(H.carDeck)-.3},
  {id:'passenger',name:'Passenger deck',level:`${m1(H.passengerDeck)} m above the keel`,from:keel(H.passengerDeck)-.3},
  {id:'bridge',name:'Bridge deck',level:`${m1(H.bridgeDeck)} m above the keel`,from:keel(H.bridgeDeck)-.3},
  {id:'top',name:'Compass deck and mast',level:`${m1(H.compassDeck)} m above the keel, masthead light at ${m1(H.mastheadLight)} m`,from:keel(H.compassDeck)-.3},
 ];
 const byHeight=y=>{let id='hull';for(const s of SECTIONS)if(s.from!==undefined&&y>=s.from)id=s.id;return id;};
 /**
  * Where a piece goes. It belongs to the deck it stands on: its foot against bands that start 0.3 m under each deck,
  * so a bulkhead, a stair or a mast goes with the deck under it and a deckhead with the deck over it. The exceptions
  * are named, each with its reason.
  */
 const PASS=keel(H.passengerDeck);
 const EXCEPTIONS=[
  {id:'funnels',section:'passenger',why:'the funnels, their caps and exhausts stand on the passenger deck, one on the other',
   test:(it,c)=>Math.abs(c[0])>2.8&&c[2]>-13.6&&c[2]<-11.1&&it.min[1]>PASS+1},
 ];
 const used={};
 const sectionOf=it=>{
  const c=[0,1,2].map(a=>(it.min[a]+it.max[a])/2);
  for(const e of EXCEPTIONS)if(e.test(it,c)){used[e.id]=(used[e.id]||0)+1;return e.section;}
  return byHeight(it.min[1]+.05);
 };

 // ---- Materials: one record for each different look; the colour itself travels on the vertices.
 const materials=[],materialIndex=new Map();
 const materialOf=m=>{
  const lit=!m.isMeshBasicMaterial,glow=lit&&m.emissive&&m.emissive.getHex()!==0;
  const rec={shading:lit?'standard':'basic',metalness:lit?+(m.metalness??0).toFixed(3):0,roughness:lit?+(m.roughness??1).toFixed(3):1,
   transparent:!!m.transparent,opacity:+(m.transparent?m.opacity:1).toFixed(3),emissive:glow?'#'+m.emissive.getHexString():'#000000',emissiveIntensity:glow?+(m.emissiveIntensity??1).toFixed(3):1,
   side:m.side===THREE.DoubleSide?'double':m.side===THREE.BackSide?'back':'front',textured:!!m.map,
   depthWrite:m.depthWrite!==false,alphaTest:+(m.alphaTest||0).toFixed(3),offset:m.polygonOffset?[m.polygonOffsetFactor||0,m.polygonOffsetUnits||0]:null};
  const key=JSON.stringify(rec);let i=materialIndex.get(key);if(i===undefined){i=materials.length;materials.push(rec);materialIndex.set(key,i);}return i;
 };

 // ---- Every visible mesh, in the ship's own coordinates, cut into the pieces the kit merged (kitSources).
 const tiles=new Map(),items=[],skipped=[],hidden=[];
 const V=new THREE.Vector3(),N=new THREE.Vector3(),C=new THREE.Color(),A=new THREE.Vector3(),Bv=new THREE.Vector3(),Cv=new THREE.Vector3();
 /** One piece: `corners` are indices into the mesh's own vertices, three a triangle. */
 function piece(mesh,M,m,corners,where,machinery){
  const g=mesh.geometry,P=g.attributes.position,Cc=m.vertexColors?g.attributes.color:null,U=m.map?g.attributes.uv:null,count=corners.length;
  let Nn=g.attributes.normal;if(!Nn){const c=g.clone();c.computeVertexNormals();Nn=c.attributes.normal;}
  const nm=new THREE.Matrix3().getNormalMatrix(M),mirrored=M.determinant()<0;
  const pos=new Float32Array(count*3),nor=new Float32Array(count*3),col=new Float32Array(count*3),uv=U?new Float32Array(count*2):null;
  const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
  for(let k=0;k<count;k++){
   // A mirrored placement turns every triangle inside out: swap two corners so its face still looks outward.
   const i=corners[mirrored?(k%3===1?k+1:k%3===2?k-1:k):k];
   V.fromBufferAttribute(P,i).applyMatrix4(M);N.fromBufferAttribute(Nn,i).applyMatrix3(nm).normalize();
   pos[k*3]=V.x;pos[k*3+1]=V.y;pos[k*3+2]=V.z;nor[k*3]=N.x;nor[k*3+1]=N.y;nor[k*3+2]=N.z;
   for(let a=0;a<3;a++){const v=pos[k*3+a];if(v<min[a])min[a]=v;if(v>max[a])max[a]=v;}
   if(Cc)C.fromBufferAttribute(Cc,i).multiply(m.color);else C.copy(m.color);
   col[k*3]=C.r;col[k*3+1]=C.g;col[k*3+2]=C.b;
   if(uv){uv[k*2]=U.getX(i);uv[k*2+1]=U.getY(i);}
  }
  let area=0;for(let k=0;k<count;k+=3){A.fromArray(pos,k*3);Bv.fromArray(pos,k*3+3).sub(A);Cv.fromArray(pos,k*3+6).sub(A);area+=Bv.cross(Cv).length()/2;}
  let tile=null;
  if(uv){tile=tiles.get(m.map.uuid);if(!tile){tile={tex:m.map,area:0,name:mesh.name};tiles.set(m.map.uuid,tile);}tile.area=Math.max(tile.area,area);}
  const it={name:mesh.name,where,material:materialOf(uv?m:Object.assign(Object.create(m),{map:null})),pos,nor,col,uv,tile,min,max,triangles:count/3};
  it.section=machinery?'machinery':sectionOf(it);items.push(it);
 }
 /** The separate bodies of a mesh the kit did not build (the windows, the markings): triangles that share a corner. */
 function bodies(g,M,corners){
  const P=g.attributes.position,id=new Map(),of=new Int32Array(corners.length),parent=[];
  const find=i=>{while(parent[i]!==i)i=parent[i]=parent[parent[i]];return i;};
  for(let k=0;k<corners.length;k++){const i=corners[k],key=Math.round(P.getX(i)*1000)+','+Math.round(P.getY(i)*1000)+','+Math.round(P.getZ(i)*1000);let n=id.get(key);if(n===undefined){n=parent.length;parent.push(n);id.set(key,n);}of[k]=n;}
  for(let k=0;k<corners.length;k+=3){const a=find(of[k]);parent[find(of[k+1])]=a;parent[find(of[k+2])]=a;}
  const out=new Map();for(let k=0;k<corners.length;k+=3){const r=find(of[k]);let list=out.get(r);if(!list)out.set(r,list=[]);list.push(corners[k],corners[k+1],corners[k+2]);}
  return [...out.values()];
 }
 const split=[];
 function mesh(o,M,machinery){
  const g=o.geometry,P=g&&g.attributes.position;if(!P)return;
  const I=g.index,total=I?I.count:P.count,at=I?i=>I.getX(i):i=>i,range=(start,count)=>Array.from({length:count},(_,k)=>at(start+k));
  const list=Array.isArray(o.material)?o.material:[o.material];
  const groups=Array.isArray(o.material)&&g.groups.length?g.groups:[{start:0,count:total,materialIndex:0}];
  const src=o.userData.kitSources;
  if(src&&!I&&list.length===1){
   const covered=src.reduce((n,s)=>n+s.count,0);if(covered!==total)throw Error(`${o.name}: its kit sources cover ${covered} of ${total} corners`);
   for(const s of src)piece(o,M,list[0],range(s.start,s.count),s.where,machinery);return;
  }
  // A mesh that reaches across decks is taken apart into its bodies, so each goes with its own deck.
  g.computeBoundingBox();const box=g.boundingBox.clone().applyMatrix4(M),across=!machinery&&byHeight(box.min.y+.05)!==byHeight(box.max.y-.05);
  for(const grp of groups){
   const m=list[grp.materialIndex];if(!m||m.visible===false)continue;const count=Math.min(grp.count,total-grp.start);if(count<3)continue;
   const corners=range(grp.start,count-count%3);
   if(!across){piece(o,M,m,corners,null,machinery);continue;}
   const parts=bodies(g,M,corners);split.push({mesh:o.name,bodies:parts.length});for(const part of parts)piece(o,M,m,part,null,machinery);
  }
 }
 const I4=new THREE.Matrix4();
 (function walk(o,machinery){
  if(!o.visible){hidden.push(o.name||o.type);return;}
  machinery=machinery||o===h1.group||o===below;
  if(o.isInstancedMesh){for(let i=0;i<o.count;i++){o.getMatrixAt(i,I4);mesh(o,new THREE.Matrix4().multiplyMatrices(toShip,o.matrixWorld).multiply(I4),machinery);}}
  else if(o.isMesh)mesh(o,new THREE.Matrix4().multiplyMatrices(toShip,o.matrixWorld),machinery);
  else if(o.isLine||o.isPoints||o.isSprite)skipped.push(o.name||o.type);
  for(const c of o.children)walk(c,machinery);
 })(ship,false);

 /**
  * How far each part lifts at full spread: GAP metres of air between a deck's own height and the deck over it, so each
  * deck can be looked into from above. A deck's own height runs from its band's foot to the next deck's plating; what
  * stands taller (the funnels, a mast, a trunk) reaches into the gap, and is checked to stay clear of the part above.
  */
 const GAP=4,span={};
 for(const it of items){const s=span[it.section]||(span[it.section]={min:Infinity,max:-Infinity,triangles:0});s.min=Math.min(s.min,it.min[1]);s.max=Math.max(s.max,it.max[1]);s.triangles+=it.triangles;}
 for(const s of SECTIONS)if(!span[s.id])throw Error('nothing was built for '+s.name);
 {let lift=0,above=null,reach=null;
  SECTIONS.forEach((s,i)=>{
   const b=span[s.id],next=SECTIONS[i+1],foot=s.from!==undefined?s.from:b.min;
   // The hull's own height is all of it (the machinery lifts out over the bulwarks); a deck's ends at the next plating.
   const head=next&&next.from!==undefined?next.from+.3:b.max;
   if(above!==null)lift=above+GAP-foot;
   if(reach!==null&&b.min+lift<reach+.5)throw Error(s.name+' would not clear the part under it at full spread: raise GAP');
   s.explode=[0,+lift.toFixed(2),0];above=head+lift;reach=b.max+lift;
  });}

 // ---- One picture for every plate, dial and sign. Each gets the room its size on the ship earns.
 const SIZE=2048,PAD=2,list=[...tiles.values()];
 for(const t of list){paintBack(t.tex);const im=t.tex.image;t.sw=im.width;t.sh=im.height;t.rx=t.tex.repeat.x;t.ry=t.tex.repeat.y;
  if(t.sw<=1||t.sh<=1)console.warn('unpainted picture: '+t.name);
  if(t.tex.offset.x||t.tex.offset.y||t.tex.rotation)console.warn('picture with an offset or rotation, drawn without it: '+t.name);}
 // Every picture has now been painted: each place the Christina's name stands must have been written at least once.
 for(const [where,n] of Object.entries(renamed))if(n===0)throw Error(`the Christina's name was not painted (${where}): the lettering she is drawn from has changed under her`);
 let density=2400,rows;
 for(;;){
  for(const t of list){const aspect=(t.sw*t.rx)/(t.sh*t.ry),w=Math.sqrt(t.area*aspect)*density,k=Math.min(1,(t.sw*t.rx)/w);t.w=Math.max(4,Math.round(w*k));t.h=Math.max(4,Math.round(w*k/aspect));if(t.w>SIZE-2*PAD){t.h=Math.max(4,Math.round(t.h*(SIZE-2*PAD)/t.w));t.w=SIZE-2*PAD;}}
  list.sort((a,b)=>b.h-a.h||b.w-a.w||(a.name<b.name?-1:1));
  let x=0,y=0,row=0;rows=true;
  for(const t of list){const w=t.w+2*PAD,h=t.h+2*PAD;if(x+w>SIZE){x=0;y+=row;row=0;}t.x=x+PAD;t.y=y+PAD;x+=w;row=Math.max(row,h);if(y+row>SIZE){rows=false;break;}}
  if(rows)break;density*=.92;if(density<60)throw Error('the plates do not fit on one picture');
 }
 const atlas=document.createElement('canvas');atlas.width=atlas.height=SIZE;const ax=atlas.getContext('2d');
 for(const t of list){
  const im=t.tex.image;let srcImage=im;
  if(t.rx!==1||t.ry!==1){
   // A repeating pattern (floor plates, gratings): the repeats are drawn out, counted from the bottom left as the game does.
   const c=document.createElement('canvas');c.width=t.w;c.height=t.h;const cx=c.getContext('2d'),cw=t.w/t.rx,ch=t.h/t.ry;
   for(let l=0;l<Math.ceil(t.ry);l++)for(let k=0;k<Math.ceil(t.rx);k++)cx.drawImage(im,k*cw,t.h-(l+1)*ch,cw,ch);
   srcImage=c;
  }
  ax.drawImage(srcImage,t.x-PAD,t.y-PAD,t.w+2*PAD,t.h+2*PAD);ax.clearRect(t.x,t.y,t.w,t.h);ax.drawImage(srcImage,t.x,t.y,t.w,t.h);
 }
 const webp=await new Promise(done=>atlas.toBlob(done,'image/webp',.9));if(!webp)throw Error('the plate picture could not be written');

 // ---- Geometry: everything of one part and one look becomes one mesh, its corners shared and quantised.
 const bmin=[Infinity,Infinity,Infinity],bmax=[-Infinity,-Infinity,-Infinity];
 for(const it of items)for(let a=0;a<3;a++){bmin[a]=Math.min(bmin[a],it.min[a]);bmax[a]=Math.max(bmax[a],it.max[a]);}
 for(let a=0;a<3;a++){bmin[a]=+(bmin[a]-.001).toFixed(4);bmax[a]=+(bmax[a]+.001).toFixed(4);}
 const srgb=x=>Math.round(255*Math.min(1,Math.max(0,x<=.0031308?12.92*x:1.055*Math.pow(x,1/2.4)-.055)));
 const chunks=[];let offset=0;
 const chunk=typed=>{const at=offset,bytes=new Uint8Array(typed.buffer,typed.byteOffset,typed.byteLength);chunks.push(bytes);offset+=bytes.length;const pad=(4-offset%4)%4;if(pad){chunks.push(new Uint8Array(pad));offset+=pad;}return at;};
 let outside=0;
 function weld(group,textured){
  const corners=group.reduce((n,it)=>n+it.triangles*3,0),qp=new Uint16Array(corners*3),qn=new Int8Array(corners*3),qc=new Uint8Array(corners*3),qu=textured?new Uint16Array(corners*2):null,idx=new Uint32Array(corners),seen=new Map();
  let nv=0,ni=0;const tri=[0,0,0];
  for(const it of group){
   const t=it.tile,flipY=t?t.tex.flipY:true;
   for(let k=0;k<it.triangles*3;k++){
    const p=[0,0,0],n=[0,0,0],c=[0,0,0];let u=0,v=0;
    for(let a=0;a<3;a++){p[a]=Math.round((it.pos[k*3+a]-bmin[a])/(bmax[a]-bmin[a])*65535);n[a]=Math.round(it.nor[k*3+a]*127);c[a]=srgb(it.col[k*3+a]);}
    if(textured){
     let s=it.uv[k*2],w=it.uv[k*2+1];if(s<-1e-4||s>1.0001||w<-1e-4||w>1.0001)outside++;s=Math.min(1,Math.max(0,s));w=Math.min(1,Math.max(0,w));
     u=Math.round((t.x+s*t.w)/SIZE*65535);v=Math.round((1-(t.y+(flipY?1-w:w)*t.h)/SIZE)*65535);
    }
    const key=p[0]+','+p[1]+','+p[2]+','+n[0]+','+n[1]+','+n[2]+','+c[0]+','+c[1]+','+c[2]+','+u+','+v;
    let i=seen.get(key);
    if(i===undefined){i=nv++;seen.set(key,i);qp.set(p,i*3);qn.set(n,i*3);qc.set(c,i*3);if(qu){qu[i*2]=u;qu[i*2+1]=v;}}
    tri[k%3]=i;
    // A triangle that quantising closed to a line is left out.
    if(k%3===2&&tri[0]!==tri[1]&&tri[1]!==tri[2]&&tri[0]!==tri[2]){idx[ni++]=tri[0];idx[ni++]=tri[1];idx[ni++]=tri[2];}
   }
  }
  const wide=nv>65535,rec={vertices:nv,triangles:ni/3,wide};
  rec.pos=chunk(qp.subarray(0,nv*3));rec.nor=chunk(qn.subarray(0,nv*3));rec.col=chunk(qc.subarray(0,nv*3));
  if(qu)rec.uv=chunk(qu.subarray(0,nv*2));
  rec.idx=chunk(wide?idx.subarray(0,ni):Uint16Array.from(idx.subarray(0,ni)));
  return rec;
 }
 const DECK={car:'car',passenger:'passenger',bridge:'bridge',compass:'top'};
 const spaceSection=s=>s.deck==='hold'?(s.y[1]<=H.floorPlates+1e-6?'hull':'machinery'):DECK[s.deck];
 const report={sections:{},hidden:[...new Set(hidden)],skipped:[...new Set(skipped)],split,exceptions:EXCEPTIONS.map(e=>({id:e.id,section:e.section,why:e.why,pieces:used[e.id]||0})),atlas:{pictures:list.length,density:+density.toFixed(0)},
  // Pieces that reach across a deck: each stays with the deck it stands on. Listed for checking against the drawings.
  across:items.filter(it=>it.section!=='machinery'&&byHeight(it.min[1]+.05)!==byHeight(it.max[1]-.05)).map(it=>({from:it.where||it.name,section:it.section,triangles:it.triangles,min:it.min.map(v=>+v.toFixed(2)),max:it.max.map(v=>+v.toFixed(2))}))};
 for(const e of EXCEPTIONS)if(!used[e.id])throw Error('the exception "'+e.id+'" matched nothing: the ship has changed under it');
 // A room as the viewer reads it: its box in the ship's own axes (the arrangement keeps z from the stern and heights from the keel).
 const r2=v=>+v.toFixed(2),half=FERRY_SHIP.length/2;
 // A room's name is how its description opens, up to the first colon, bracket or comma; "Casing, port" keeps its side.
 const spaceName=what=>{const [head,next='']=what.split(/[:(;]/)[0].split(',');const side=next.match(/^\s*(port|starboard)\b/);return (head+(side?', '+side[1]:'')).trim();};
 /**
  * The arrangement's descriptions are the yard's working notes: they carry batch numbers, decision dates and positions in
  * yard metres. A visitor reads the room, so those come out, each by a rule that says what it removes; every sentence
  * changed is listed in the report (`tidied`), so nothing is dropped unseen.
  */
 const NUM='\\d+(?:\\.\\d+)?',RANGE=`${NUM}[–-]${NUM}`;
 const TIDY=[
  [/\s*\(batch [^)]*\)/g,''],                                   // which batch of work made the room
  [/\s*\((?:the owner, )?\d+ \w+ 20\d\d[^)]*\)/g,''],           // when it was decided, and what was tried first
  [new RegExp(`\\s*\\((?:x ±${NUM}, )?z ${NUM}(?:–${NUM})?\\)`,'g'),''],   // a bracket holding only a position
  [new RegExp(`\\s*\\(${RANGE}\\)`,'g'),''],
  [new RegExp(`\\((?:z )?${RANGE}, `,'g'),'('],                 // a position that opens a bracket of other facts
  [new RegExp(`\\s*(?:relocated to|at) z? ?${RANGE}`,'g'),''],  // "at z14.1-15.4", "its door at 11.35–12.55"
  [new RegExp(`\\bz ?(${NUM})`,'g'),'$1 m from the stern'],       // a position left in a sentence, said in words
  [/\bm3\b/g,'m³'],
 ];
 const tidied=[];
 const tidy=(id,field,s)=>{const out=TIDY.reduce((t,[re,to])=>t.replace(re,to),s).replace(/ {2,}/g,' ').trim();if(out!==s)tidied.push({space:id,field,from:s,to:out});return out;};
 const spaceRecord=sp=>{
  const what=tidy(sp.id,'what',sp.what),name=spaceName(what);
  // What follows the name, when the description goes on from it with a colon or a comma; else the description whole.
  // A bracket straight after the name ("Void (a cofferdam) between …") is said without the bracket.
  const after=what.startsWith(name)?what.slice(name.length):null,aside=after&&after.match(/^ \(([^)]*)\)([^]*)$/);
  const rest=after===null?what:aside?aside[1]+aside[2]:/^[:,]/.test(after)?after.replace(/^[:,]\s*/,''):after===''?'':what;
  return {id:sp.id,name,text:rest&&rest[0].toUpperCase()+rest.slice(1),why:tidy(sp.id,'why',sp.why),
   min:[r2(sp.x[0]),r2(keel(sp.y[0])),r2(sp.z[0]-half)],max:[r2(sp.x[1]),r2(keel(sp.y[1])),r2(sp.z[1]-half)]};
 };
 const groups=SECTIONS.map(s=>{
  const mine=items.filter(it=>it.section===s.id),meshes=[];
  for(let m=0;m<materials.length;m++){const g=mine.filter(it=>it.material===m);if(g.length)meshes.push({material:m,...weld(g,materials[m].textured)});}
  const spaces=FERRY_GA.filter(sp=>spaceSection(sp)===s.id).map(spaceRecord);
  // The report: what went where, by source line, for checking a part against the drawings.
  const by={};for(const it of mine){const k=it.where||it.name||'(unnamed)',r=by[k]||(by[k]={triangles:0,min:[...it.min],max:[...it.max]});r.triangles+=it.triangles;for(let a=0;a<3;a++){r.min[a]=Math.min(r.min[a],it.min[a]);r.max[a]=Math.max(r.max[a],it.max[a]);}}
  report.sections[s.id]={triangles:span[s.id].triangles,y:[+span[s.id].min.toFixed(2),+span[s.id].max.toFixed(2)],explode:s.explode,
   pieces:Object.entries(by).sort((a,b)=>b[1].triangles-a[1].triangles).map(([k,r])=>({from:k,triangles:r.triangles,min:r.min.map(v=>+v.toFixed(2)),max:r.max.map(v=>+v.toFixed(2))}))};
  return {id:s.id,name:s.name,level:s.level,explode:s.explode,spaces,meshes};
 });
 report.tidied=tidied;
 report.renamed={...renamed,kept:[...renamed.kept].sort()};
 if(outside)console.warn(outside+' picture corners lay outside their picture and were pulled in');
 // The Minato Maru's year, yard and hull number are hers, not the Christina's: they are left out until the Christina has her own.
 const header={format:'JMF1',
  ship:{name:CHRISTINA.name,drawnFrom:CHRISTINA.drawnFrom,type:FERRY_SHIP.type,length:FERRY_SHIP.length,beam:FERRY_SHIP.beam,depth:FERRY_SHIP.depth,draft:FERRY_SHIP.draft,grossTons:FERRY_SHIP.grossTons},
  axes:'x to port, y up from the laden waterline, z forward from amidships; metres',
  bounds:{min:bmin,max:bmax},atlas:{file:'ferry-atlas.webp',size:SIZE},materials,views:[{id:'ship',name:'Ship',groups}]};
 const bin=new Uint8Array(offset);{let at=0;for(const c of chunks){bin.set(c,at);at+=c.length;}}
 await post('header.json',JSON.stringify(header));await post('data.bin',bin);await post('atlas.webp',webp);await post('report.json',JSON.stringify(report,null,1));
 console.log(groups.map(g=>`${g.name}: ${g.meshes.reduce((n,m)=>n+m.triangles,0)} triangles in ${g.meshes.length} meshes, lifts ${g.explode[1]} m, ${g.spaces.length} spaces`).join('\n'));
 console.log(`${materials.length} materials, ${list.length} pictures at ${density.toFixed(0)} px/m, ${hidden.length} hidden nodes left out, ${skipped.length} lines or sprites left out`);
 globalThis.__exportDone=true;
}catch(e){console.error(e&&e.stack||String(e));globalThis.__exportError=String(e&&e.message||e);}
