export function travelProgress(state){
 const tasks=[
  {done:state.quest===3,title:'Bring Tama home',hint:'Speak to Aya by the bookshop, feed Tama a fish, then return to Aya.'},
  {done:state.kenjiEscort==='done',title:'Follow Kenji to his workshop',hint:'Score 3/3 at Star Port, ask Kenji to show you the workshop, and walk there together.'}
 ];
 return {tasks,completed:tasks.filter(t=>t.done).length,total:tasks.length,unlocked:tasks.every(t=>t.done)};
}
export function travelStatusText(state){
 const progress=travelProgress(state);
 return progress.unlocked?'Town shortcuts unlocked · Quick travel is available in the Town Book.':`Town shortcuts · ${progress.completed}/${progress.total} favours complete\n`+progress.tasks.map(t=>`${t.done?'✓':'○'} ${t.title}${t.done?'':' — '+t.hint}`).join('\n');
}
