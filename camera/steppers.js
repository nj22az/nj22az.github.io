/*
 * Steppers (the owner, 12 November 2026: "I don't like the sliders … sliders need to be accessed by a setting").
 *
 * With Sliders off, a control that was a slider is a minus, a row of pips and a plus: one tap is one step, and the
 * pips show where it stands. The stepper drives the slider's own input (its value, its `input` and `change`
 * events), so whatever listened to the slider still hears every step, and a stepper never holds a value of its own.
 * With Sliders on, the stepper is hidden and the slider is shown (camera-fun.css, by the page's data-sliders).
 */
const steppers=new Set();
/**
 * Puts a stepper after `input` (a range input), with `steps` places from the input's least to its most.
 * `onStep` is told of each step (the app's tick). Returns the stepper's element.
 */
export function stepperFor(input,{steps=9,onStep=()=>{}}={}){
 const min=Number(input.min),max=Number(input.max),bipolar=min<0&&max>0;
 const el=document.createElement('span');el.className='stepper step-control';el.setAttribute('role','group');
 const button=(cls,icon,label)=>{const b=document.createElement('button');b.type='button';b.className=`step-button ${cls}`;b.innerHTML=`<svg aria-hidden="true"><use href="#i-${icon}"/></svg>`;b.dataset.label=label;return b;};
 const minus=button('step-minus','minus','Less'),plus=button('step-plus','plus','More');
 const pips=document.createElement('span');pips.className='step-pips';pips.setAttribute('aria-hidden','true');
 for(let i=0;i<steps;i++)pips.append(document.createElement('i'));
 el.append(minus,pips,plus);
 const valueAt=i=>min+(max-min)*i/(steps-1);
 const place=()=>Math.round((Number(input.value)-min)/(max-min)*(steps-1));
 const zero=bipolar?Math.round((0-min)/(max-min)*(steps-1)):0;
 function sync(){
  const at=place(),name=input.getAttribute('aria-label')||input.labels?.[0]?.textContent||'';
  [...pips.children].forEach((pip,i)=>{pip.classList.toggle('lit',bipolar?(i>=Math.min(zero,at)&&i<=Math.max(zero,at)&&at!==zero):i<=at);pip.classList.toggle('at',i===at);pip.classList.toggle('zero',bipolar&&i===zero);});
  minus.disabled=input.disabled||at<=0;plus.disabled=input.disabled||at>=steps-1;
  el.setAttribute('aria-label',name);
  minus.setAttribute('aria-label',`${minus.dataset.label} ${name}`.trim());plus.setAttribute('aria-label',`${plus.dataset.label} ${name}`.trim());
 }
 function step(by){
  const at=Math.max(0,Math.min(steps-1,place()+by));
  input.value=String(Math.round(valueAt(at)));
  input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));
  onStep(by);sync();
 }
 minus.addEventListener('click',()=>step(-1));plus.addEventListener('click',()=>step(1));
 input.addEventListener('input',sync);input.addEventListener('change',sync);
 // A value set by the app (another adjustment chosen, a reset) shows on the pips at once.
 const own=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value');
 Object.defineProperty(input,'value',{configurable:true,get(){return own.get.call(this);},set(v){own.set.call(this,v);sync();}});
 input.classList.add('fine-control');input.after(el);
 const entry={sync};steppers.add(entry);sync();
 return el;
}
/** Every stepper read again from its input (a control enabled or disabled, a label changed). */
export function syncSteppers(){for(const s of steppers)s.sync();}
