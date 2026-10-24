import {writeFile} from 'node:fs/promises';
import * as THREE from '../../../vendor/three.module.js';
import {installDOM} from '../../../tests/fixtures.mjs';
import {retainSakuraStock} from '../../../src/world/interiors/sakura-rebuild-stock.js';
import {sakuraProductTemplate} from '../../../src/world/interiors/sakura-food-products.js';
import DATA from './schedule.json' with {type:'json'};
installDOM();const root=new THREE.Group();root.userData.groups={};const stock=retainSakuraStock(root,{printedExamples:false}),mesh=root.getObjectByName('Sakura rice goods'),template=sakuraProductTemplate('rice'),record=stock.records.find(r=>r.id==='rice');
const columns=mesh.count/6,boxes=[],matrix=new THREE.Matrix4(),p=new THREE.Vector3(),q=new THREE.Quaternion(),s=new THREE.Vector3(),rotated=[];
for(let i=0;i<mesh.count;i++){mesh.getMatrixAt(i,matrix);const level=Math.floor(i/(2*columns)),row=Math.floor(i/columns)%2,column=i%columns,w=DATA.riceWobble.find(w=>w.level===[545,895,1245][level]&&w.row===row&&w.column===column);if(w){matrix.decompose(p,q,s);q.setFromAxisAngle(new THREE.Vector3(0,1,0),Math.PI/2+w.degrees*Math.PI/180);matrix.compose(p,q,s);rotated.push(i);}boxes.push(template.bounds.clone().applyMatrix4(matrix));}
for(const i of rotated)for(let j=0;j<boxes.length;j++)if(i!==j&&boxes[i].intersectsBox(boxes[j]))throw Error('Rice overlap '+i+'/'+j);
for(const i of rotated){const b=boxes[i];if(b.min.x<.09||b.max.x>.66||b.min.z< -2.34||b.max.z> -1.30)throw Error('Rice outside fixture '+i);}
const report={columns,rotatedSlots:rotated,capacity:record.stockCapacity,display:mesh.count,overlaps:0,fixtureFit:true};await writeFile(new URL('stock-audit.json',import.meta.url),JSON.stringify(report,null,2)+'\n');console.log(report);
