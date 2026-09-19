import {ITEMS} from '../../../content-data.js';
import {makeContentObject} from '../../../content-items.js';
import {peninsulaActive} from '../town-mode.js';

const positions={
 frontrow:{
  ...Object.fromEntries(['book','book2','book3','book4','book5','book6'].map((id,i)=>[id,{pos:[-2.3+i*.31,1.60,-.86],upright:true}])),
  bligh:{pos:[0,.95,-.91]},discipline:{pos:[.36,.95,-.91]},vietnam:{pos:[.72,.95,-.91]},wordpress:{pos:[1.09,.95,-.91]},journal:{pos:[-1.75,.95,.70]},
 },
 form3d:{keychain:{pos:[-1.97,.96,-.87]},model:{pos:[-.54,.99,-.87],scale:.30,upright:true},stepwise:{pos:[.93,.96,-.99]},github:{pos:[1.23,.96,-1.10],scale:.18},etsy:{pos:[1.97,.96,-.91],scale:.18}},
 office:{cv:{pos:[1.95,1.145,-2.64],scale:.32},linkedin:{pos:[-.12,.97,-2.70],scale:.28}},
};
export const BUSINESS_CONTENT=Object.freeze(positions);
export const COMBINED_CONTENT=Object.freeze({
 ...Object.fromEntries(['book','book2','book3','book4','book5','book6'].map((id,i)=>[id,{pos:[-3.84,1.60,-1.4+i*.18],upright:true}])),
 bligh:{pos:[-1.65,.96,-3.12]},discipline:{pos:[-1.65,.97,-2.92]},vietnam:{pos:[-2.35,.96,2.12]},wordpress:{pos:[-2.0,.96,2.12]},journal:{pos:[-2.7,.96,2.12]},
 keychain:{pos:[3.7,.96,-.48]},model:{pos:[3.7,1,.0],scale:.30,upright:true},stepwise:{pos:[1.5,.97,-3.02]},github:{pos:[3.7,.96,.65],scale:.18},etsy:{pos:[3.7,.96,1.3],scale:.18},
});
export const BUSINESS_CONTENT_CATALOGUE=ITEMS.map(item=>{
 const originalSite=Object.keys(positions).find(id=>positions[id][item.id]);
 return {...item,get siteId(){return peninsulaActive()&&originalSite==='form3d'?'frontrow':originalSite;},get place(){return peninsulaActive()&&this.siteId==='frontrow'?'Front-Row Books & Workshop · Main Street':{frontrow:'Front-Row Books & Press · shopping alley',form3d:'Kenji & Tetsuo Repairs · shopping alley',office:'Johansson Harbour Office · quay'}[originalSite];}};
});
export function buildBusinessContent({site,room,register,onInspect,onAction}){
 const entries=site.combinedWorkshop?COMBINED_CONTENT:positions[site.id]||{},objects=new Map();
 for(const [id,placement] of Object.entries(entries)){
  const original=ITEMS.find(item=>item.id===id);if(!original)continue;
  const item={...original,place:site.title,pos:placement.pos},object=makeContentObject(item,{pageScale:.5});
  object.position.set(...placement.pos);object.rotation.x=placement.upright?0:-Math.PI/2+.12;object.scale.setScalar(placement.scale??.24);room.add(object);
  object.userData.npcInteraction=false;register(object,id==='stepwise'&&onAction?'Use StepWise calculator':'Lift '+item.title,()=>id==='stepwise'&&onAction?onAction('stepwise'):onInspect(item),true);objects.set(id,object);
 }
 return {items:BUSINESS_CONTENT_CATALOGUE,objects};
}
