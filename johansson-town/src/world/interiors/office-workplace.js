import * as THREE from '../../../vendor/three.module.js';

export const OFFICE_STAFF={'Harbour master':[-1.85,0,-1.20]};
export const OFFICE_DESK_SEAT={position:[-2.52,0,-1.82],stand:[-1.85,0,-1.20],eyeY:1.18,yaw:0,pitch:0};
export function buildOfficeWorkplace({room:parent,reg,action}){
 const room=new THREE.Group();room.name='Harbour office workplace';parent.add(room);
 const paper=new THREE.MeshStandardMaterial({color:0xe8e1c7,roughness:.92});
 const palette=new Map(),mat=c=>{if(!palette.has(c))palette.set(c,new THREE.MeshStandardMaterial({color:c,roughness:.8}));return palette.get(c);};
 function box(name,size,pos,material){const m=new THREE.Mesh(new THREE.BoxGeometry(...size),typeof material==='number'?mat(material):material);m.name=name;m.position.set(...pos);room.add(m);return m;}
 function label(text,pos,width=.7,height=.18,yaw=0){const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;const ctx=canvas.getContext('2d');ctx.fillStyle='#e7dfc7';ctx.fillRect(0,0,512,128);ctx.fillStyle='#33483e';ctx.textAlign='center';ctx.font='bold 46px sans-serif';ctx.fillText(text,256,82,485);const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;const mesh=new THREE.Mesh(new THREE.PlaneGeometry(width,height),new THREE.MeshBasicMaterial({map:texture}));mesh.position.set(...pos);mesh.rotation.y=yaw;room.add(mesh);}
 function records(pos,title,id,task){const o=new THREE.Object3D();o.name=title;o.position.set(...pos);room.add(o);o.userData.workers=['Harbour master'];o.userData.npcInteraction=!!task;if(task){o.userData.officeTask=task;if(task.seated)o.userData.seat=OFFICE_DESK_SEAT;}reg(o,title,()=>action('office-records','Harbour office records',id),true);return o;}
 // A visitor desk and a staffed computer share the existing fitted office asset.
 box('Clerk computer base',[.43,.09,.34],[-2.50,.99,-2.76],0xb9baa5);box('Clerk CRT monitor',[.46,.36,.37],[-2.50,1.20,-2.78],0xc6c6b1);
 box('Clerk green screen',[.36,.25,.018],[-2.50,1.22,-2.584],0x213e35);
 for(let i=0;i<5;i++)box('Computer record line',[.23-(i%2)*.06,.009,.008],[-2.52,1.30-i*.037,-2.57],0xa2bb88);
 box('Clerk keyboard',[.48,.035,.17],[-2.5,.955,-2.35],0xb7b7a2);for(let row=0;row<3;row++)for(let key=0;key<8;key++)box('Keyboard key',[.042,.013,.032],[-2.68+key*.05,.979,-2.41+row*.04],0x5b665a);
 label('HARBOUR MASTER',[-2.46,1.03,-2.15],.72,.12);
 const computer=records([-2.50,1.20,-2.55],'Open harbour spreadsheets','berth-register',{pose:'Type',activity:'typing berth records',seated:true});
 // Binders sit on the existing cabinet shelves; the centre aisle stays clear.
 for(const [row,y] of [[0,.78],[1,1.25],[2,1.72]])for(let i=0;i<7;i++){
  const z=-.65+i*.25;box('Labelled service binder',[.27,.34,.17],[-2.73,y,z],[0x526c61,0x8b6752,0x5d7184][row]);box('Binder spine label',[.018,.21,.095],[-2.58,y+.015,z],paper);
  box('Binder finger ring',[.020,.028,.028],[-2.56,y-.105,z],0x414d46);
 }
 label('VESSEL FILES',[-2.55,1.99,.17],1.2,.16,Math.PI/2);
 records([-2.56,1.20,.15],'Browse service binders','service-work-log',{pose:'Read',activity:'filing service certificates',heldItem:'paper'});
 for(const [i,y] of [[0,.96],[1,1.08]]){box('Document tray',[.58,.035,.35],[1.95,y,-2.64],0x556d60);for(const x of [1.65,2.25])box('Document tray side',[.025,.11,.35],[x,y+.06,-2.64],0x556d60);box('Office forms',[.48,.025,.29],[1.95,y+.032,-2.64],paper);}
 label('IN / OUT',[1.95,1.03,-2.44],.53,.10);
 box('Visitor writing pad',[.55,.028,.38],[.40,.95,-2.62],paper);box('Desk pencil',[.22,.018,.018],[.61,.979,-2.47],0xa77c3d);
 label('STORES & SERVICE',[.45,1.02,-2.18],.87,.13);
 records([.4,1.05,-2.40],'Open warehouse stock ledger','warehouse-stock');
 records([2.45,1.23,1.30],'Open berth record binders','berth-register');
 label('JOHANSSON HARBOUR',[0,2.48,-3.27],2.5,.28);
 const visitorSeat=new THREE.Object3D();visitorSeat.position.set(1.14,.7,-2.05);visitorSeat.userData.npcInteraction=false;visitorSeat.userData.seat={position:[1.14,0,-2.05],stand:[1.14,0,-1.1],eyeY:1.2,yaw:0,pitch:0};room.add(visitorSeat);reg(visitorSeat,'Sit at the visitor desk',()=>action('seat','Visitor desk','A clean writing pad and the harbour ledgers are ready.'),true);
 return {computer,staff:OFFICE_STAFF};
}
