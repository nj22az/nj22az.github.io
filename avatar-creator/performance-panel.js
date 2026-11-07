import {EXPRESSIVE_POSES} from '../johansson-town/src/avatars/expressive-poses.js';
/** Character-only controls: body poses and facial performance remain independent of the saved design. */
export function createPerformancePanel({creator,expression,pose,status}){
 const root=document.createElement('section');root.className='studio-performance';root.setAttribute('aria-label','Expressions and performance');
 const title=document.createElement('h3');title.textContent='Performance';root.append(title);
 const menu=document.createElement('div');menu.className='studio-performance-menu';root.append(menu);
 const row=(text,input)=>{const label=document.createElement('label');label.append(text,input);menu.append(label);};
 row('Expression',expression);row('Body pose',pose);
 const presets=document.createElement('div');presets.className='studio-expression-presets';presets.setAttribute('role','group');presets.setAttribute('aria-label','Expression presets');
 for(const [mood,label] of [['neutral','Neutral'],['happy','Happy'],['shy','Shy'],['surprised','Surprised'],['thinking','Thinking'],['wink','Wink'],['angry','Angry'],['sad','Sad']]){
  const button=document.createElement('button');button.type='button';button.textContent=label;button.dataset.mood=mood;
  button.onclick=()=>{expression.value=mood;expression.dispatchEvent(new Event('change'));};presets.append(button);
 }
 menu.append(presets);
 const strength=document.createElement('input');strength.type='range';strength.min='0';strength.max='100';strength.step='5';strength.value='100';strength.setAttribute('aria-label','Expression strength');
 const strengthLabel=document.createElement('label'),output=document.createElement('output');output.textContent='100%';
 strengthLabel.append('Strength ',output,strength);menu.append(strengthLabel);
 strength.oninput=()=>{output.textContent=strength.value+'%';creator.setPerformance({strength:Number(strength.value)/100});};
 const actions=document.createElement('div');actions.className='studio-performance-actions';
 const speak=document.createElement('button');speak.type='button';speak.textContent='Speaking preview';speak.setAttribute('aria-pressed','false');
 const freeze=document.createElement('button');freeze.type='button';freeze.textContent='Freeze pose';freeze.setAttribute('aria-pressed','false');
 speak.onclick=()=>{const active=!creator.performance.speaking;creator.setPerformance({speaking:active});speak.setAttribute('aria-pressed',String(active));};
 freeze.onclick=()=>{const active=!creator.performance.frozen;creator.setPerformance({frozen:active});freeze.textContent=active?'Resume motion':'Freeze pose';freeze.setAttribute('aria-pressed',String(active));status.textContent=active?'Pose frozen. Export PNG keeps this pose and expression.':'Motion resumed.';};
 actions.append(speak,freeze);menu.append(actions);
 const match=document.createElement('button');match.type='button';match.textContent='Match pose emotion';
 match.onclick=()=>{expression.value='auto';expression.dispatchEvent(new Event('change'));status.textContent='Expression follows the body pose. You can still choose a face yourself.';};
 const surprise=document.createElement('button');surprise.type='button';surprise.textContent='Surprise me';
 surprise.onclick=()=>{
  const choices=Object.keys(EXPRESSIVE_POSES).filter(name=>[...pose.options].some(o=>o.value===name));if(!choices.length)return;
  const alternatives=choices.filter(name=>name!==pose.value),next=(alternatives.length?alternatives:choices)[Math.floor(Math.random()*(alternatives.length||choices.length))];
  creator.setPerformance({frozen:false});pose.value=next;pose.dispatchEvent(new Event('change'));expression.value='auto';expression.dispatchEvent(new Event('change'));status.textContent=EXPRESSIVE_POSES[next].label+' with its matching expression.';
 };
 actions.append(match,surprise);
 const hint=document.createElement('p');hint.className='shm-note';hint.textContent='Choose a face and body pose. Freeze the moment, then Export PNG.';menu.append(hint);
 function syncButtons(){const state=creator.performance;freeze.textContent=state.frozen?'Resume motion':'Freeze pose';freeze.setAttribute('aria-pressed',String(state.frozen));speak.setAttribute('aria-pressed',String(state.speaking));}
 creator.root.addEventListener('studio-performance-change',syncButtons);
 function sync(){for(const b of presets.children)b.setAttribute('aria-pressed',String(expression.value===b.dataset.mood));creator.setPerformance({});}
 expression.addEventListener('change',sync);pose.addEventListener('change',sync);sync();
 return {root,dispose(){creator.root.removeEventListener('studio-performance-change',syncButtons);expression.removeEventListener('change',sync);pose.removeEventListener('change',sync);root.remove();}};
}
