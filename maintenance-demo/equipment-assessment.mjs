import {productClassify,RULESET_VERSION as PRODUCT_RULESET} from './classifier-core.mjs?v=2026.11.02.2';
import {operationalClassify} from './operational-classifier.mjs?v=2026.11.02.2';

export const ASSESSMENT_VERSION='2026.11.02.2';
export const DOCUMENT_CHECKS=['identity','issuer','scope','language','validity'];
const nonempty=x=>typeof x==='string'&&!!x.trim();
const safeId=x=>typeof x==='string'&&/^[\w-]+$/.test(x);
const validDate=x=>typeof x==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(x)&&Number.isFinite(Date.parse(x+'T12:00:00Z'))&&new Date(x+'T12:00:00Z').toISOString().slice(0,10)===x;
export function normaliseClassifications(db){if(db.pressure){if(db.pressure.classifications===undefined)db.pressure.classifications=[];db.pressure.classificationRulesVersion=ASSESSMENT_VERSION;}return db;}
export function assessInventory(input){
  let product=productClassify(input);
  if(product.status!=='outside'&&input.productRegime!=='ped'){product={...product,status:'review',category:null,ref:'AFS 2023:5 övergångsbestämmelser; §§1–2',reasons:[...(product.reasons||[]),input.productRegime==='legacy'?'Older equipment needs assessment under its original product legislation; a new PED category must not replace valid original documentation.':'Establish the applicable product regime before applying a PED category.'],required:[...(product.required||[]),'Applicable product regime and original legal/document basis']};}
  return {version:ASSESSMENT_VERSION,productRuleVersion:PRODUCT_RULESET,product,operational:operationalClassify(input)};
}
export function requiredDocuments(result){
  const rows=[];const add=(id,title,ref)=>{if(!rows.some(x=>x.id===id))rows.push({id,title,ref});};
  add('classification','Nameplate, technical data, scope and classification basis','AFS 2023:5 §§1–9; AFS 2023:11 9 kap. §§23–35');
  if(result.product.status!=='outside'||result.operational.status!=='outside')add('fluid','Safety data / documented fluid group and phase assessment','AFS 2023:5 §9; AFS 2023:11 9 kap. §§24–26');
  add('instructions','Applicable instructions and safe operating limits',result.product.status==='outside'?'Applicable product rules and documented use-risk assessment':'AFS 2023:5 §18; bilaga 1, 3.3–3.4');
  if(result.product.status==='calculated'&&result.product.category!=='SEP'){
    add('declaration','Applicable EU declaration covering this equipment','AFS 2023:5 §12; bilaga 4');
    add('marking','Product marking and notified-body identity where applicable','AFS 2023:5 §§36–37');
    add('conformity','Conformity assessment / approved module and body evidence','AFS 2023:5 §§10–11; bilaga 3');
  }
  if(result.product.category==='SEP')add('sep','Good engineering practice basis; CE not permitted under this AFS','AFS 2023:5 §8');
  if(result.product.status==='outside')add('scope','Applicable alternative or original product legislation','AFS 2023:5 §§1–2; övergångsbestämmelser');
  if(result.operational.status!=='outside'){
    add('op-risk','Documented risk assessment and operating conditions','AFS 2023:11 9 kap. §6');
    add('op-maintenance','Written supervision routine and assigned person','AFS 2023:11 9 kap. §§9–10, 38');
  }
  if(['A','B'].includes(result.operational.className)){
    add('op-register','Asset register, annual routine review and remaining-life journal','AFS 2023:11 9 kap. §§36–39');
    add('op-first-control','First-control certificate or documented applicable exception','AFS 2023:11 10 kap. §9');
    add('op-recurring-control','Control-body certificate and next driftprov due month','AFS 2023:11 10 kap. §10; bilaga 7');
    if(result.operational.className==='A')add('op-internal-control','Internal/external examination certificate or applicable exception','AFS 2023:11 10 kap. §10; bilaga 7');
  }
  return rows;
}
export function documentFindings(result,documents=[]){return requiredDocuments(result).flatMap(r=>{
  const d=documents.find(x=>x.id===r.id);
  if(d?.status==='reviewed'&&nonempty(d.reference)&&DOCUMENT_CHECKS.every(c=>d.checks?.includes(c)))return[];
  if(d?.status==='na'&&nonempty(d.reason))return[];
  return[r.title+': '+(d?.status==='missing'?'missing':d?.status==='expired'?'expired / superseded':'review required')];
});}
export function validateClassifications(db,at=new Date().toISOString().slice(0,10)){
  if(db?.pressure?.classifications===undefined)return true;
  if(!Array.isArray(db.pressure.classifications)||!Array.isArray(db.assets)||!validDate(at))return false;
  const ids=new Set(),aids=new Set(db.assets.map(a=>a.id));
  for(const r of db.pressure.classifications){
    if(!r||!safeId(r.id)||ids.has(r.id)||!aids.has(r.assetId)||!nonempty(r.by)||!nonempty(r.sourceReference)||!validDate(r.date)||r.date>at||!['draft','reviewed'].includes(r.decision)||!r.input||typeof r.input!=='object'||Array.isArray(r.input)||!r.result||typeof r.version!=='string'||!/^[A-Za-z0-9_.:-]{1,80}$/.test(r.version)||r.result.version!==r.version||!r.result.product||!r.result.operational||!['review','outside','calculated'].includes(r.result.product.status)||!['review','outside','calculated'].includes(r.result.operational.status)||!Array.isArray(r.documents))return false;
    ids.add(r.id);
    const current=r.version===ASSESSMENT_VERSION;
    const result=current?assessInventory(r.input):r.result;
    if(current&&JSON.stringify(result)!==JSON.stringify(r.result))return false;
    if(r.decision==='reviewed'&&(result.product.status==='review'||result.operational.status==='review'||r.confirmed!==true))return false;
    const docIds=new Set();
    for(const d of r.documents){
      if(!d||!nonempty(d.id)||docIds.has(d.id)||!['unknown','reviewed','missing','expired','na'].includes(d.status)||!Array.isArray(d.checks)||d.checks.some(x=>!DOCUMENT_CHECKS.includes(x)))return false;
      docIds.add(d.id);
      if(d.status==='reviewed'&&(!nonempty(d.reference)||!DOCUMENT_CHECKS.every(c=>d.checks.includes(c))))return false;
      if(d.status==='na'&&!nonempty(d.reason))return false;
    }
  }
  return true;
}
