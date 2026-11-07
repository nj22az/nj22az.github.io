// Complete per-item records. General tests never mutate statutory decisions.
export const TEST_TYPES=['Inspection','Calibration','Functional test','Electrical test','Pressure test','NDT','Commissioning','Other'];
export const TEST_OUTCOMES=['Not assessed','Pass','Fail','Conditional','Not applicable'];
export const RECORD_LISTS=['tests','documents','notes','properties'];
const id=x=>typeof x==='string'&&/^[\w-]+$/.test(x);
const text=x=>typeof x==='string'&&x.trim().length>0;
export const validRecordDate=x=>typeof x==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(x)&&Number.isFinite(Date.parse(x+'T12:00:00Z'))&&new Date(x+'T12:00:00Z').toISOString().slice(0,10)===x;
export function normaliseRecords(db){db.records??={version:1,tests:[],documents:[],notes:[],properties:[]};return db;}
export function readingCheck(r){
 const numeric=x=>(typeof x==='string'||typeof x==='number')&&String(x).trim()!==''&&/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(String(x).trim())&&Number.isFinite(Number(x));
 const hasLow=r.lower!==''&&r.lower!==undefined,hasHigh=r.upper!==''&&r.upper!==undefined;
 if(hasLow&&!numeric(r.lower)||hasHigh&&!numeric(r.upper)||hasLow&&hasHigh&&Number(r.lower)>Number(r.upper))return {state:'invalid',label:'Invalid limits'};
 if(!numeric(r.actual)||!text(r.unit)||!hasLow&&!hasHigh)return {state:'unknown',label:'Not compared'};
 const outside=hasLow&&Number(r.actual)<Number(r.lower)||hasHigh&&Number(r.actual)>Number(r.upper);
 return {state:outside?'outside':'within',label:outside?'Outside recorded limits':'Within recorded limits'};
}
export function testFindings(r){const out=[];if(r.outcome==='Not assessed')out.push('Outcome has not been assessed.');if(!r.readings?.length)out.push('No structured readings recorded; consult the report.');if(r.readings?.some(x=>readingCheck(x).state==='unknown'))out.push('Some readings cannot be compared with recorded numeric limits.');if(r.readings?.some(x=>readingCheck(x).state==='outside'))out.push('A reading is outside the recorded limits; review the declared outcome and follow-up.');if(['Fail','Conditional'].includes(r.outcome))out.push('Follow-up is required for the recorded outcome.');return out;}
export function validateRecords(db,at){
 if(!db||typeof db!=='object')return false;
 if(db.records===undefined)return true;const s=db.records;if(!s||s.version!==1||!RECORD_LISTS.every(k=>Array.isArray(s[k]))||!Array.isArray(db.assets))return false;
 const assets=new Set(db.assets.map(a=>a?.id)),all=new Set();
 for(const k of RECORD_LISTS)for(const r of s[k]){if(!r||!id(r.id)||all.has(r.id)||!assets.has(r.assetId)||!text(r.by)||!validRecordDate(r.date)||at&&r.date>at||!text(r.recordedAt)||!Number.isFinite(Date.parse(r.recordedAt)))return false;all.add(r.id);}
 for(const r of s.documents){if(!text(r.title)||!text(r.reference)||!['Unreviewed','Reviewed'].includes(r.review)||r.url&&!safeDocumentURL(r.url)||r.validUntil&&!validRecordDate(r.validUntil))return false;if(r.pressureEvidenceId&&!db.pressure?.evidence?.some(e=>e.id===r.pressureEvidenceId&&e.assetId===r.assetId))return false;if(r.review==='Reviewed'&&(!text(r.reviewer)||!validRecordDate(r.reviewedOn)||at&&r.reviewedOn>at||!text(r.reviewNotes)))return false;if(r.file&&(!/^[a-f0-9]{64}$/.test(r.file.id)||!text(r.file.name)||!Number.isInteger(r.file.size)||r.file.size<=0||r.file.size>10*1024*1024||typeof r.file.type!=='string'))return false;}
 for(const r of s.tests){if(!text(r.title)||!TEST_TYPES.includes(r.type)||!TEST_OUTCOMES.includes(r.outcome)||!text(r.method)||!text(r.reference)||!Array.isArray(r.readings)||r.readings.length>100)return false;if(r.documentId&&!s.documents.some(d=>d.id===r.documentId&&d.assetId===r.assetId))return false;if(r.reviewedOn&&(!validRecordDate(r.reviewedOn)||r.reviewedOn<r.date||at&&r.reviewedOn>at)||r.reviewer&&!r.reviewedOn||r.reviewedOn&&!text(r.reviewer))return false;if(r.supersedesId&&(!s.tests.some(t=>t.id===r.supersedesId&&t.assetId===r.assetId&&t.id!==r.id&&t.recordedAt<=r.recordedAt)||!text(r.correctionReason)))return false;for(const m of r.readings){if(!m||!text(m.label)||!['actual','unit','lower','upper','uncertainty','notes'].every(k=>typeof m[k]==='string')||readingCheck(m).state==='invalid')return false;}}
 for(const r of s.tests){const seen=new Set([r.id]);let next=r.supersedesId;while(next){if(seen.has(next))return false;seen.add(next);next=s.tests.find(t=>t.id===next)?.supersedesId;}}
 const files=new Map();for(const r of s.documents)if(r.file){if(files.has(r.file.id)&&files.get(r.file.id)!==r.file.size)return false;files.set(r.file.id,r.file.size);}if([...files.values()].reduce((n,x)=>n+x,0)>50*1024*1024)return false;
 for(const r of s.notes)if(!text(r.title)||!text(r.text))return false;
 for(const r of s.properties)if(!text(r.label)||!text(r.value)||!text(r.source))return false;
 return true;
}
export function safeDocumentURL(value){try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password;}catch{return false;}}
export function assetBundle(db,aid){
 const a=db.assets.find(a=>a.id===aid);if(!a)return null;
 const tasks=db.tasks.filter(t=>t.assetId===aid),resources=(db.equipment||[]).filter(r=>r.assetIds?.includes(aid)||tasks.some(t=>t.equipmentIds?.includes(r.id)));
 const result={format:'maintenance-item-record',version:1,programme:{company:db.settings?.company||'',site:db.settings?.site||'',coordinator:db.settings?.coordinator||''},asset:structuredClone(a),tasks,history:db.history.filter(r=>r.assetId===aid),risks:db.risks.filter(r=>r.assetId===aid),issues:db.issues.filter(r=>r.assetId===aid),equipment:resources,preparations:(db.preparations||[]).filter(r=>r.assetId===aid),pressure:{},records:{version:1}};
 for(const[k,v]of Object.entries(db.pressure||{}))result.pressure[k]=Array.isArray(v)?v.filter(r=>r.assetId===aid):v;
 for(const k of RECORD_LISTS)result.records[k]=(db.records?.[k]||[]).filter(r=>r.assetId===aid);
 // Retain future workspace extensions associated with the item as well.
 const associated=value=>{if(Array.isArray(value)){const rows=value.map(associated).filter(x=>x!==undefined);return rows.length?rows:undefined;}if(value&&typeof value==='object'){if('assetId' in value)return value.assetId===aid?structuredClone(value):undefined;const out={};for(const[k,v]of Object.entries(value)){const picked=associated(v);if(picked!==undefined)out[k]=picked;}if(Object.keys(out).length){if('version' in value)out.version=value.version;return out;}}return undefined;};
 result.additional={};for(const[k,v]of Object.entries(db))if(!(k in result)&&!['assets','settings','demoDismissed','version','records','archive'].includes(k)){if(Array.isArray(v))result.additional[k]=v.filter(r=>r?.assetId===aid);else if(v&&typeof v==='object'){const picked=associated(v);if(picked!==undefined)result.additional[k]=picked;}}
 return structuredClone(result);
}
export function referencedFiles(db){const map=new Map();for(const d of db.records?.documents||[])if(d.file)map.set(d.file.id,d.file);return [...map.values()];}
