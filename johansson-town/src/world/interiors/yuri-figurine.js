import * as THREE from '../../../vendor/three.module.js';
import {createYuriFigurine} from '../../people/models.js?snappy=1';

export function displayYuriFigurine({room,reg,action}){
 const display=new THREE.Group();display.name='Sakura figurine display';display.position.set(2.25,1.17,-.48);room.add(display);
 const base=new THREE.Mesh(new THREE.CylinderGeometry(.13,.14,.035,16),new THREE.MeshStandardMaterial({color:0x7f5b48,roughness:.8}));display.add(base);
 reg(display,'Admire Yuri’s figurine',()=>action('inspect','Yuri’s figurine','A tiny, soft-featured Yuri in her original pink outfit. The real Yuri calls it her very first employee. It never takes a tea break.'),true);
 const ready=createYuriFigurine().then(figure=>{if(figure&&display.parent===room){figure.position.y=.018;display.add(figure);}return figure;}).catch(error=>{console.warn('Yuri figurine awaiting its display model:',error.message);return null;});
 return {display,ready};
}
