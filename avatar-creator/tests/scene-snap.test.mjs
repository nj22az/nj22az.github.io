import test from 'node:test';
import assert from 'node:assert/strict';
import {SNAP,seatKey,matchSeat,numberLabels,seatTurn,counterEdges,edgeLine,lineDistance,personMarks,nearestFree,resolveSnap,snapTurn,stepTurn,gridPoint} from '../scene-snap.mjs';

const near=(a,b,e=1e-6)=>Math.abs(a-b)<=e;
// A camera straight above the ground: 100 CSS px per metre, the picture 1000 × 1000 px around (0,0).
const top=(scale=100)=>(p,clip=true)=>{const x=500+p[0]*scale,y=500+p[2]*scale;return clip&&(x<8||y<8||x>992||y>992)?null:{x,y};};
const seat=(id,x,z,extra={})=>({id,kind:'seat',rank:0,point:[x,0,z],turn:180,seat:{id},...extra});

test('a seat keeps World\'s id when it is unique, else its place, and old scenes find theirs again',()=>{
 const seats=[{id:'bench',position:[1,0,2]},{id:'stool',position:[3,0,4]},{id:'stool',position:[5,0,6]},{position:[1.234,0,-.5]},{position:[7,0,7]},{position:[7,0,7]}];
 assert.deepEqual(seats.map(s=>seatKey(s,seats)),['bench','@3.00,4.00','@5.00,6.00','@1.23,-0.50','@7.00,7.00','@7.00,7.00#2']);
 const keyed=seats.map((s,i)=>({...s,id:seatKey(s,seats),legacyId:'seat-'+i}));
 assert.equal(matchSeat('bench',keyed),keyed[0]);assert.equal(matchSeat('@5.00,6.00',keyed),keyed[2]);
 assert.equal(matchSeat('seat-1',keyed),keyed[1],'an old walk-order id');
 assert.equal(matchSeat('@5.20,6.10',keyed),keyed[2],'World moved the seat a little');
 assert.equal(matchSeat('@5.40,6.00',keyed),null,'more than 0.3 m away');
 assert.equal(matchSeat('',keyed),null);assert.equal(matchSeat('seat-99',keyed),null);assert.equal(matchSeat('nonsense',keyed),null);
});
test('repeated seat labels are numbered left to right on the screen, others stay as they are',()=>{
 const seats=[{label:'Sit at the counter',x:3},{label:'Sit at the table',x:0},{label:'Sit at the counter',x:1},{label:'Sit at the counter',x:2}];
 assert.deepEqual(numberLabels(seats,s=>s.x),['Sit at the counter 3','Sit at the table','Sit at the counter 1','Sit at the counter 2']);
 assert.deepEqual(numberLabels([{label:'A',x:NaN},{label:'A',x:5}],s=>s.x),['A 2','A 1'],'a seat off the screen comes last');
});
test('a seat\'s turn faces the way World\'s seat faces',()=>{
 assert.equal(seatTurn({yaw:0}),180,'World yaw 0 looks along −z');assert.equal(seatTurn({yaw:Math.PI/2}),-90);assert.equal(seatTurn({yaw:-Math.PI/2}),90);assert.equal(seatTurn({}),180);
});
test('counter faces: height window, length, rotation, outward normal and facing',()=>{
 const flat=()=>0,box={x:0,z:0,w:2,d:.6,height:.9};
 const faces=counterEdges([box],flat);assert.equal(faces.length,4);
 for(const f of faces){const mx=(f.a[0]+f.b[0])/2,mz=(f.a[1]+f.b[1])/2;assert.ok(mx*f.n[0]+mz*f.n[1]>0,f.id+' normal points out');
  assert.ok(near(Math.sin(f.turn*Math.PI/180),-f.n[0],1e-3)&&near(Math.cos(f.turn*Math.PI/180),-f.n[1],1e-3),f.id+' faces the counter');}
 const front=faces.find(f=>f.id.endsWith(':+v'));assert.deepEqual([front.a,front.b,front.n,front.turn],[[-1,.3],[1,.3],[0,1],180]);
 assert.equal(counterEdges([{...box,height:1.3}],flat).length,0,'a shelf is not a counter');
 assert.equal(counterEdges([{...box,height:.7}],flat).length,0,'a table is not a counter');
 assert.equal(counterEdges([{...box,minY:.5}],flat).length,0,'a wall cupboard is not a counter');
 assert.equal(counterEdges([{...box,w:.5,d:.5}],flat).length,0,'too short to stand at');
 assert.equal(counterEdges([{...box,d:.4}],flat).length,2,'only the long faces of a thin counter');
 assert.equal(counterEdges([{x:0,z:0,r:.5,height:.9}],flat).length,0,'round things have no face');
 assert.equal(counterEdges([{...box,x:20}],flat,{reach:12,origin:[0,0,0]}).length,0,'too far away');
 const plinth=(x,z)=>Math.abs(x)<1.1&&Math.abs(z)<.4?.12:0;assert.equal(counterEdges([box],plinth).length,4,'the floor is measured where people stand, not on the plinth');
 assert.equal(counterEdges([box,{...box}],flat).length,4,'a counter registered twice gives its faces once');
 assert.equal(counterEdges([box],flat,{seats:[[.3,0]]}).length,0,'furniture with a seat in it (a booth and its back) is not a counter');assert.equal(counterEdges([box],flat,{seats:[[0,.7,180]]}).length,4,'a stool in front of it, facing it: still a counter');assert.deepEqual(counterEdges([box],flat,{seats:[[0,.7,0]]}).map(f=>f.id),['edge:0:+u','edge:0:-u','edge:0:-v'],'not the face a seat has its back to (a booth back)');
 const turned=counterEdges([{...box,yaw:Math.PI/2}],flat),side=turned.find(f=>f.id.endsWith(':+u'));
 assert.ok(near(side.a[1],-1)&&near(side.b[1],-1),'+u of a box turned 90° lies at z −1 (World footprint())');assert.deepEqual(side.n,[0,-1]);assert.equal(side.turn,0);
 const line=edgeLine(front,1);assert.ok(near(line.a[1],.3+.23+.03)&&near(line.a[0],-1+.23)&&near(line.b[0],1-.23),'standoff 0.23·size + 0.03, inset 0.23·size');
 const big=edgeLine(front,1.4);assert.ok(near(big.a[1],.3+.23*1.4+.03)&&near(big.a[0],-1+.23*1.4));
 assert.equal(edgeLine({a:[0,0],b:[.4,0],n:[0,1]},1).length,0,'a face shorter than the body: one place in its middle');
 assert.ok(near(lineDistance({x:0,z:1},line),1-.56)&&near(lineDistance({x:5,z:.56},line),5-.77));
});
test('the places beside a standing character scale with the two sizes; none beside someone seated',()=>{
 const [talk,left,right]=personMarks({x:1,z:2,turn:0,size:1},1);
 assert.ok(near(talk.x,1)&&near(talk.z,2.95));assert.equal(talk.turn,180);
 assert.ok(near(left.x,1.7)&&near(left.z,2)&&left.turn===0);assert.ok(near(right.x,.3)&&near(right.z,2)&&right.turn===0);
 const big=personMarks({x:0,z:0,turn:90,size:1},1.4);assert.ok(near(big[0].x,.95*1.2)&&near(big[0].z,0),'mean size 1.2, in front of someone facing +x');assert.equal(big[0].turn,-90);
 assert.ok(near(Math.hypot(big[1].x,big[1].z),.7*1.2));
 assert.deepEqual(personMarks({x:0,z:0,turn:0,size:1,seat:'@1,1'}),[]);assert.deepEqual(personMarks({x:0,z:0,turn:0,size:1,seated:true}),[]);
});
test('a seat beats a person, and a person a counter, unless it is closer by more than 0.1 R',()=>{
 const targets=[seat('stool',0,0),{id:'mika:talk',kind:'person',rank:1,point:[.4,0,0],turn:90}],ctx={targets,project:top(),capturePx:24};
 assert.equal(resolveSnap({x:.2,y:0,z:0},ctx).kind,'seat','equally near: the seat');
 assert.equal(resolveSnap({x:.21,y:0,z:0},ctx).kind,'seat','the person is nearer, but by less than 0.1 R');
 assert.equal(resolveSnap({x:.22,y:0,z:0},ctx).kind,'person','nearer by more than 0.1 R');
});
test('a target catches within R, holds until 1.5 R, and the next one takes over 57% of the way',()=>{
 const ctx={targets:[seat('a',0,0)],project:top(),capturePx:44};
 assert.equal(resolveSnap({x:.43,y:0,z:0},ctx).key,'a');assert.equal(resolveSnap({x:.45,y:0,z:0},ctx).kind,'free');
 assert.equal(resolveSnap({x:.65,y:0,z:0},{...ctx,lock:'a'}).key,'a','held');assert.equal(resolveSnap({x:.67,y:0,z:0},{...ctx,lock:'a'}).kind,'free','let go');
 const R=resolveSnap({x:.1,y:0,z:0},{targets:[seat('a',0,0)],project:top(300),capturePx:44});assert.equal(R.key,'a','R grows to 0.2 m when the picture is close');
 assert.equal(resolveSnap({x:.25,y:0,z:0},{targets:[seat('a',0,0)],project:top(300),capturePx:44}).kind,'free','but no further than 0.45 m… 0.2 m clamp holds');
 // Two stools 0.70 m apart (Sato Ramen): walk the finger from one to the other.
 const stools={targets:[seat('a',0,0),seat('b',.7,0)],project:top(),capturePx:44};let lock='a',switched=null;
 for(let f=0;f<=1.0001;f+=.005){const r=resolveSnap({x:.7*f,y:0,z:0},{...stools,lock});if(r.key==='b'&&switched==null)switched=f;lock=r.target?.id||null;}
 assert.ok(switched>.55&&switched<.6,'switched at '+switched?.toFixed(3));
});
test('targets that fail their gate are skipped, and only the winner\'s gate is asked',()=>{
 let asked=0;const taken=seat('taken',0,0,{ok:()=>{asked++;return false;}}),open=seat('open',.3,0,{ok:()=>true});
 const r=resolveSnap({x:.05,y:0,z:0},{targets:[taken,open],project:top(),capturePx:44});assert.equal(r.key,'open');assert.equal(asked,1);
 let far=0;resolveSnap({x:.05,y:0,z:0},{targets:[seat('near',0,0),seat('far',3,0,{ok:()=>{far++;return true;}})],project:top(),capturePx:44});assert.equal(far,0,'out of reach: not asked');
});
test('without magnets the point itself, rounded to 1 cm; along a counter in 5 cm steps',()=>{
 const free=resolveSnap({x:.123,y:0,z:.456},{targets:[seat('a',.12,.46)],project:top(),snapping:false});assert.deepEqual([free.x,free.z,free.kind],[.12,.46,'free']);
 assert.equal(resolveSnap({x:.123,y:0,z:.456},{targets:[seat('a',.12,.46)],project:top()}).kind,'seat','with magnets the seat');
 const counter={id:'edge:till:-u',kind:'edge',rank:2,line:{a:[0,0],b:[2.02,0]},turn:0};
 const at=resolveSnap({x:.537,y:0,z:.1},{targets:[counter],project:top(),floor:()=>0});assert.deepEqual([at.x,at.z,at.kind,at.turn],[.55,0,'edge',0]);
 assert.equal(resolveSnap({x:.56,y:0,z:.1},{targets:[counter],project:top()}).key,at.key,'the same 5 cm step: the same result');
 assert.notEqual(resolveSnap({x:.58,y:0,z:.1},{targets:[counter],project:top()}).key,at.key);
 assert.equal(resolveSnap({x:2.3,y:0,z:0},{targets:[counter],project:top()}).x,2,'the end of the line, on the 5 cm lattice');
 const blocked=resolveSnap({x:.537,y:0,z:.1},{targets:[{...counter,ok:x=>x>1}],project:top()});assert.equal(blocked.kind,'free','a part of the counter someone stands at');
});
test('a wall slides the character to the nearest free place within 0.6 m, else nothing',()=>{
 const free=x=>x<1;
 const slid=resolveSnap({x:1.2,y:0,z:.3},{free,project:top()});assert.equal(slid.kind,'free');assert.ok(slid.x<1&&slid.x>.9&&near(slid.z,.3,.11),JSON.stringify(slid));
 const along=resolveSnap({x:1.2,y:0,z:.3},{free,project:top(),previous:{x:.9,z:.3}});assert.ok(near(along.x,.95,.001)&&near(along.z,.3,.001),'straight off the wall, towards the last landing: '+JSON.stringify(along));
 const prefer=nearestFree({x:1.02,z:0},x=>x<1,SNAP.search,{x:.9,z:1});assert.ok(prefer.z>0,'on the ring, the point nearest the last landing');
 assert.equal(nearestFree({x:3,z:0},free),null,'too deep in the wall');
 const hugging=resolveSnap({x:-3.208,y:0,z:1.5096},{free:x=>x>=-3.208,project:top(),snapping:false});assert.deepEqual([hugging.x,hugging.z,hugging.kind],[-3.2,1.51,'free'],'against a shelf: the free centimetre, not a 5 cm jump');
 assert.equal(resolveSnap({x:0,y:0,z:0},{free:()=>false,project:top()}),null,'boxed in: keep the last landing');
 assert.equal(resolveSnap({x:0,y:0,z:0},{free:()=>true,seen:(x,z)=>z>.2,project:top()}),null,'the camera must see them: else keep the last landing');
 const off=resolveSnap({x:2,y:0,z:0},{free:x=>x<1.97,seen:()=>true,project:top()});assert.ok(off.x<1.97&&off.x>1.94&&Math.hypot(off.x-2,off.z)<=.06,'the first ring, 5 cm out (to 1 cm)');
});
test('a twist steps 15° from the camera, 3° past halfway, and catches on a neighbour or a counter',()=>{
 const z=10;let r=snapTurn(31,{zero:z});assert.deepEqual(r,{turn:25,detent:null});
 assert.equal(snapTurn(33.4,{zero:z,previous:r}).turn,25,'not yet 3° past halfway');assert.equal(snapTurn(36,{zero:z,previous:r}).turn,40);
 const back={turn:40,detent:null};assert.equal(snapTurn(30,{zero:z,previous:back}).turn,40);assert.equal(snapTurn(29,{zero:z,previous:back}).turn,25);
 r=snapTurn(43,{zero:z,detents:[50]});assert.deepEqual(r,{turn:50,detent:0},'caught within 8°');
 assert.deepEqual(snapTurn(39,{zero:z,detents:[50],previous:r}),{turn:50,detent:0},'held to 12°');
 assert.deepEqual(snapTurn(37,{zero:z,detents:[50],previous:r}),{turn:40,detent:null},'let go');
 assert.equal(snapTurn(43,{zero:z,detents:[]}).turn,40);
 assert.equal(snapTurn(-175,{zero:170}).turn,-175,'wraps');assert.equal(snapTurn(179,{zero:0,detents:[-178]}).turn,-178,'a detent across ±180');
});
test('the toolbar and keys step to the next 45° or 15° stop around the camera, both ways',()=>{
 const z={zero:10,step:45};
 assert.equal(stepTurn(10,1,z),55);assert.equal(stepTurn(10,-1,z),-35);assert.equal(stepTurn(20,1,z),55);assert.equal(stepTurn(20,-1,z),10);
 assert.equal(stepTurn(145,1,z),-170,'wraps past the back');assert.equal(stepTurn(-170,-1,z),145);assert.equal(stepTurn(-170,1,z),-125);
 const k={zero:-33.4,step:15};assert.equal(stepTurn(-33.4,-1,k),-48.4);assert.equal(stepTurn(-48.4,-1,k),-63.4);assert.equal(stepTurn(-63.4,1,{...k,step:45}),-33.4);assert.equal(stepTurn(-33.4,1,k),-18.4);
 assert.equal(stepTurn(-33.45,1,k),-18.4,'a turn rounded to 0.1° is on its stop');
});
test('grid points for the builders, turned and moved',()=>{
 assert.deepEqual(gridPoint({x:.26,z:-.74},{size:.5}),{x:.5,z:-.5});
 const g={size:.5,origin:[1,1],yaw:Math.PI/6},p=gridPoint({x:1.9,z:.3},g);
 assert.deepEqual(gridPoint(p,g),p,'a grid point maps to itself');assert.ok(Math.hypot(p.x-1.9,p.z-.3)<=.5*Math.SQRT1_2+1e-9);
 const grid=resolveSnap({x:.26,y:0,z:-.74},{project:top(),grid:{size:.5}});assert.deepEqual([grid.x,grid.z,grid.kind],[.5,-.5,'grid']);
 assert.equal(resolveSnap({x:.26,y:0,z:-.74},{project:top(),grid:{size:.5},snapping:false}).kind,'free');
});
