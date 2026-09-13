import * as THREE from '../../../vendor/three.module.js';

export const OFFICE_STAFF={'Harbour master':[-1.85,0,-1.20]};
export const OFFICE_DESK_SEAT={position:[-2.52,0,-2.02],stand:[-1.85,0,-1.20],eyeY:1.18,yaw:0,pitch:0};
export function buildOfficeWorkplace({room:parent,reg,action}){
 const room=new THREE.Group();room.name='Harbour office workplace';parent.add(room);
 const paper=new THREE.MeshStandardMaterial({color:0xe8e1c7,roughness:.92});
 const palette=new Map(),mat=c=>{if(!palette.has(c))palette.set(c,new THREE.MeshStandardMaterial({color:c,roughness:.8}));return palette.get(c);};
 function box(name,size,pos,material){const m=new THREE.Mesh(new THREE.BoxGeometry(...size),typeof material==='number'?mat(material):material);m.name=name;m.position.set(...pos);room.add(m);return m;}
 function label(text,pos,width=.7,height=.18,yaw=0){const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;const ctx=canvas.getContext('2d');ctx.fillStyle='#e7dfc7';ctx.fillRect(0,0,512,128);ctx.fillStyle='#33483e';ctx.textAlign='center';ctx.font='bold 46px sans-serif';ctx.fillText(text,256,82,485);const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;const mesh=new THREE.Mesh(new THREE.PlaneGeometry(width,height),new THREE.MeshBasicMaterial({map:texture}));mesh.position.set(...pos);mesh.rotation.y=yaw;room.add(mesh);}
 function records(pos,title,id,task){const o=new THREE.Object3D();o.name=title;o.position.set(...pos);room.add(o);o.userData.workers=['Harbour master'];o.userData.npcInteraction=!!task;if(task){o.userData.officeTask=task;if(task.seated)o.userData.seat=OFFICE_DESK_SEAT;}reg(o,title,()=>action('office-records','Harbour office records',id),true);return o;}
 // One period workstation fits the original desk; the baked duplicate PCs were
 // removed from the source asset. The keyboard rests on the .90 m desktop.
 box('Clerk computer base',[.50,.08,.38],[-2.52,.945,-2.90],0xb9baa5);
 box('Clerk CRT monitor',[.56,.43,.45],[-2.52,1.20,-2.89],0xc6c6b1);
 box('Clerk green screen',[.44,.31,.018],[-2.52,1.22,-2.656],0x213e35);
 for(let i=0;i<6;i++)box('Computer record line',[.29-(i%2)*.06,.009,.008],[-2.54,1.33-i*.04,-2.642],0xa2bb88);
 box('Clerk keyboard',[.52,.035,.19],[-2.52,.921,-2.40],0xb7b7a2);
 for(let row=0;row<3;row++)for(let key=0;key<9;key++)box('Keyboard key',[.042,.010,.032],[-2.72+key*.05,.944,-2.46+row*.04],0x5b665a);
 box('Harbour master nameplate base',[.67,.045,.12],[-1.48,.925,-2.43],0x66563f);
 label('HARBOUR MASTER',[-1.48,.994,-2.365],.62,.12);
 label('SEPTEMBER 1988',[-1.22,1.35,-3.298],.48,.28);
 const computer=records([-2.52,1.20,-2.55],'Open harbour spreadsheets','berth-register',{pose:'Type',activity:'typing berth records',seated:true});
 // A fitted cabinet replaces the old decorative shelf. Each binder rests on a
 // shelf and keeps its spine within the frame, clear of the working aisle.
 box('Filing cabinet back',[.06,2.05,2.22],[-3.27,1.035,.17],0x8e9587);
 for(const z of [-.91,1.25])box('Filing cabinet side',[.56,2.05,.06],[-3.02,1.035,z],0xc1c2ad);
 for(const y of [.12,.68,1.24,1.80,2.04])box('Filing cabinet shelf',[.56,.04,2.16],[-3.02,y,.17],0xc1c2ad);
 for(const [row,y] of [[0,.31],[1,.87],[2,1.43]])for(let i=0;i<7;i++){
  const z=-.65+i*.25;box('Labelled service binder',[.28,.34,.17],[-2.98,y,z],[0x526c61,0x8b6752,0x5d7184][row]);
  box('Binder spine label',[.012,.19,.095],[-2.834,y+.025,z],paper);
  box('Binder finger ring',[.014,.028,.028],[-2.825,y-.105,z],0x414d46);
 }
 label('VESSEL FILES',[-2.726,1.93,.17],1.2,.16,Math.PI/2);
 records([-2.56,1.20,.15],'Browse service binders','service-work-log',{pose:'Read',activity:'filing service certificates',heldItem:'paper'});
 for(const [i,y] of [[0,.923],[1,1.04]]){box('Document tray',[.58,.035,.35],[1.93,y,-2.65],0x556d60);for(const x of [1.65,2.25])box('Document tray side',[.025,.11,.35],[x,y+.06,-2.64],0x556d60);box('Office forms',[.48,.025,.29],[1.95,y+.032,-2.64],paper);}
 label('IN / OUT',[1.95,1.03,-2.44],.53,.10);
 box('Visitor writing pad',[.55,.028,.38],[1.15,.917,-2.62],paper);box('Desk pencil',[.22,.018,.018],[1.43,.94,-2.50],0xa77c3d);
 label('STORES & SERVICE',[.46,.97,-2.43],.87,.13);
 records([1.15,1.05,-2.40],'Open warehouse stock ledger','warehouse-stock');
 records([2.45,1.23,1.30],'Open berth record binders','berth-register');
 label('JOHANSSON HARBOUR',[0,2.48,-3.27],2.5,.28);
 const visitorSeat=new THREE.Object3D();visitorSeat.position.set(1.14,.7,-2.05);visitorSeat.userData.npcInteraction=false;visitorSeat.userData.seat={position:[1.14,0,-2.05],stand:[1.14,0,-1.1],eyeY:1.2,yaw:0,pitch:0};room.add(visitorSeat);reg(visitorSeat,'Sit at the visitor desk',()=>action('seat','Visitor desk','A clean writing pad and the harbour ledgers are ready.'),true);
 return {computer,staff:OFFICE_STAFF};
}
