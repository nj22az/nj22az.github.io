import {ITEMS} from '../../../content-data.js';
import {makeContentObject} from '../../../content-items.js';

const positions={
 frontrow:{
  ...Object.fromEntries(['book','book2','book3','book4','book5','book6'].map((id,i)=>[id,{pos:[-2.3+i*.31,1.60,-.86],upright:true}])),
  bligh:{pos:[0,.95,-.91]},discipline:{pos:[.36,.95,-.91]},vietnam:{pos:[.72,.95,-.91]},wordpress:{pos:[1.09,.95,-.91]},journal:{pos:[-1.75,.95,.70]},
 },
 form3d:{keychain:{pos:[-1.02,.96,-1.04]},model:{pos:[-.54,1.07,-1.02],scale:.30,upright:true},stepwise:{pos:[.93,.96,-.99]},github:{pos:[1.23,.96,-1.10],scale:.18},etsy:{pos:[-1.97,.96,-1.03],scale:.18}},
 office:{cv:{pos:[1.95,1.145,-2.64],scale:.32},linkedin:{pos:[-.12,.97,-2.70],scale:.28}},
};
export const BUSINESS_CONTENT=Object.freeze(positions);
export const BUSINESS_CONTENT_CATALOGUE=ITEMS.map(item=>{
 const siteId=Object.keys(positions).find(id=>positions[id][item.id]);
 const place={frontrow:'Front-Row Books & Press · shopping alley',form3d:'Kenji & Tetsuo Repairs · shopping alley',office:'Johansson Harbour Office · quay'}[siteId];
 return {...item,siteId,place};
});
export function buildBusinessContent({site,room,register,onInspect}){
 const entries=positions[site.id]||{},objects=new Map();
 for(const [id,placement] of Object.entries(entries)){
  const original=ITEMS.find(item=>item.id===id);if(!original)continue;
  const item={...original,place:site.title,pos:placement.pos},object=makeContentObject(item,{pageScale:.5});
  object.position.set(...placement.pos);object.rotation.x=placement.upright?0:-Math.PI/2+.12;object.scale.setScalar(placement.scale??.24);room.add(object);
  object.userData.npcInteraction=false;register(object,'Lift '+item.title,()=>onInspect(item),true);objects.set(id,object);
 }
 return {items:BUSINESS_CONTENT_CATALOGUE,objects};
}
