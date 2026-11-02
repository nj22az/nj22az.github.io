// Programme screening definitions, not AFS classification limits or acceptance criteria.
export const LIKELIHOOD = [
  ['1','Rare','Only in exceptional circumstances; supported by relevant experience.'],
  ['2','Unlikely','Could happen, but is not expected under the stated conditions.'],
  ['3','Possible','Could happen during the work or operating period assessed.'],
  ['4','Likely','Expected unless further precautions are taken.'],
  ['5','Very likely','Already occurring or expected repeatedly.']
];
export const CONSEQUENCE = [
  ['1','Minor harm','Temporary discomfort or a minor injury.'],
  ['2','Recoverable injury','Injury or ill health requiring treatment, with recovery expected.'],
  ['3','Serious injury','Significant injury or ill health, potentially requiring hospital care.'],
  ['4','Permanent harm','Permanent disability or life-changing ill health.'],
  ['5','Fatal harm','One or more deaths.']
];
const rating = x => /^[1-5]$/.test(String(x)) ? Number(x) : null;
export function riskSummary(r) {
  const l=rating(r.likelihood),c=rating(r.consequence),score=l&&c?l*c:null;
  const band=score===null?'Not scored':score>=15?'High planning priority':score>=6?'Medium planning priority':'Lower planning priority';
  const missing=[];
  for(const [key,label] of [['hazard','hazard'],['context','activity and exposure'],['effect','possible harm to people'],['controls','existing safeguards'],['basis','assessment evidence / reasoning'],['seriousReason','serious-risk reasoning'],['assessor','assessor'],['review','review date']])if(!String(r[key]||'').trim())missing.push(label);
  if(!l||!c)missing.push('likelihood and consequence');
  if(!['yes','no'].includes(r.serious))missing.push('serious-risk decision');
  if(!['planned','immediate','none'].includes(r.actionDecision))missing.push('action decision');
  if(r.actionDecision==='planned')for(const [key,label] of [['action','required action'],['actionOwner','action owner'],['actionDue','action deadline']])if(!String(r[key]||'').trim())missing.push(label);
  if(r.actionDecision==='immediate'&&(!r.action?.trim()||!r.verification?.trim()))missing.push('completed action and effectiveness check');
  if(r.actionDecision==='none'&&!r.noActionReason?.trim())missing.push('reason no further action is needed');
  if(!['yes','no'].includes(r.pressureUse))missing.push('pressure-use applicability');
  if(r.pressureUse==='yes'&&!r.pressureBasis?.trim())missing.push('pressure-use evidence review');
  const priority=r.serious==='yes'||c>=3||score>=15;
  return {score,band,missing,priority,label:missing.length?'Needs assessment':priority?'Priority review':'Assessment recorded',tone:priority?'overdue':missing.length?'review':'blue'};
}
