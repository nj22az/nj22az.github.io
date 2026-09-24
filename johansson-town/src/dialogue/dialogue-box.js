/**
 * The RPG dialogue box: how a conversation reads and how you move through it.
 *
 * It dresses the town's one modal (#activity) when it holds a conversation, and leaves
 * it alone for everything else (the field book, the ledger, the shop). The speaker's
 * line is typed out in a box along the bottom of the screen under a name tag, with a
 * tail that points up at whoever is talking; the replies come in underneath once the
 * line has finished, numbered, with one of them always selected.
 *
 * Controls, the same everywhere:
 *   E, Space, Enter, click the box  finish the line, then take the selected reply
 *   Up / Down, W / S                 move the selection
 *   1–9                               take that reply
 *   Esc                               leave the conversation
 * A controller's A and D-pad reach the same place through focus (see game.js).
 *
 * The line used to live only in a bubble over the speaker's head, which is hidden
 * whenever she is off screen, far away or behind the counter; then the replies came up
 * with nothing to reply to. The box always carries the line; the bubble over her head
 * now only marks who is speaking.
 */

const CHARS_PER_SECOND=55;

/** Which conversation line a title belongs to: "Thuan · Heart of Sakura" is Thuan's. */
export function splitTitle(title=''){
 const [speaker,...rest]=String(title).split('·').map(s=>s.trim());
 return {speaker:speaker||'',place:rest.join(' · ')};
}

/** The next selection after a move of `step`, wrapping round the list. */
export function stepSelection(index,step,count){
 if(!count)return -1;
 if(index<0)return step>0?0:count-1;
 return ((index+step)%count+count)%count;
}

/**
 * @param {object} options
 * @param {HTMLElement} options.modal     #activity
 * @param {HTMLElement} options.heading   #activityTitle
 * @param {HTMLElement} options.body      #activityBody
 * @param {HTMLElement} options.actions   #activityActions
 * @param {() => boolean} options.isOpen  whether the modal is showing
 * @param {() => void} options.leave      closes the conversation
 * @param {Window} [options.win]
 */
export function createDialogueBox({modal,heading,body,actions,isOpen,leave,win=globalThis.window}){
 const doc=modal.ownerDocument||globalThis.document;
 // Outside a real browser (the tests' stand-in DOM) the line appears at once: no timers.
 const animated=typeof win?.matchMedia==='function'&&typeof win?.setInterval==='function';
 let active=false,typing=false,timer=null,line=null,full='',shown=0,selected=-1;
 const reduceMotion=()=>{try{return !!win?.matchMedia?.('(prefers-reduced-motion: reduce)').matches;}catch{return false;}};
 const choices=()=>[...actions.querySelectorAll('button')].filter(b=>!b.disabled);

 function stopTyping(){if(timer){win.clearInterval(timer);timer=null;}}
 function finish(){
  if(!typing)return false;
  stopTyping();typing=false;
  if(line)line.textContent=full;
  modal.classList.remove('typing');
  select(selected<0?0:selected,false);
  return true;
 }
 function select(index,focus=true){
  const list=choices();
  list.forEach(b=>b.classList?.remove('selected'));
  selected=list.length?Math.max(0,Math.min(index,list.length-1)):-1;
  const button=list[selected];
  if(button){button.classList.add('selected');if(focus||doc?.activeElement?.closest?.('#activity'))button.focus?.({preventScroll:true});}
 }

 /**
  * Called by the modal each time it is filled. Conversations become the dialogue box;
  * anything else is left exactly as it was.
  */
 function present({title,text,conversation}){
  stopTyping();typing=false;active=!!conversation;
  modal.classList.toggle('rpg',active);
  modal.classList.remove('typing');
  if(!active)return;
  // The name tag: the speaker, and where you are with them. The heading keeps the whole
  // title as its text (for screen readers); the tag is drawn from these in the CSS.
  const {speaker,place}=splitTitle(title);
  heading.dataset.speaker=speaker;heading.dataset.place=place;
  // The line, typed out.
  line=body.querySelector('p')||doc.createElement('p');
  if(!line.parentNode)body.append(line);
  line.classList.add('rpg-line');
  full=String(text??'');shown=0;
  const list=choices();
  list.forEach((b,i)=>{b.dataset.key=i<9?String(i+1):'';});
  actions.classList.toggle('single',list.length===1);
  selected=0;
  if(!animated||reduceMotion()||!full){line.textContent=full;select(0);return;}
  typing=true;modal.classList.add('typing');line.textContent='';
  select(0);
  const started=performance.now();
  timer=win.setInterval(()=>{
   const target=Math.min(full.length,Math.floor((performance.now()-started)/1000*CHARS_PER_SECOND)+1);
   if(target!==shown){shown=target;line.textContent=full.slice(0,shown);}
   if(shown>=full.length)finish();
  },16);
 }

 /** Confirm: finish the line if it is still typing, otherwise take the selected reply. */
 function confirm(){
  if(!active||!isOpen())return false;
  if(finish())return true;
  const button=choices()[selected];
  if(button){button.click();return true;}
  return false;
 }

 function onKey(event){
  if(!active||!isOpen()||event.defaultPrevented)return;
  // Typing into the chat box with Thuan is typing, not steering the conversation.
  if(event.target?.closest?.('input,textarea,select'))return;
  const code=event.code;
  let handled=true;
  if(code==='KeyE'||code==='Space'||code==='Enter'||code==='NumpadEnter')confirm();
  else if(code==='ArrowDown'||code==='KeyS'){if(!typing)select(stepSelection(selected,1,choices().length));}
  else if(code==='ArrowUp'||code==='KeyW'){if(!typing)select(stepSelection(selected,-1,choices().length));}
  else if(/^(Digit|Numpad)[1-9]$/.test(code)){
   const index=Number(code.slice(-1))-1;
   if(finish())return void event.preventDefault();
   const button=choices()[index];if(button){select(index);button.click();}else handled=false;
  }
  else if(code==='Escape')leave();
  else handled=false;
  if(handled){event.preventDefault();event.stopImmediatePropagation();}
 }
 win?.addEventListener?.('keydown',onKey,true);
 // A click or tap on the box finishes the line; on a reply it is that reply.
 modal.addEventListener('pointerdown',event=>{
  if(!active||!typing)return;
  if(event.target.closest('.activity-card')&&!event.target.closest('#closeActivity')){event.preventDefault();finish();}
 });
 actions.addEventListener('pointerover',event=>{
  const button=event.target.closest?.('button');if(!active||typing||!button)return;
  const index=choices().indexOf(button);if(index>=0)select(index,false);
 });
 // A controller or Tab moves focus; the highlight follows it.
 actions.addEventListener('focusin',event=>{
  const index=choices().indexOf(event.target);if(active&&index>=0&&index!==selected)select(index,false);
 });

 return {
  present,confirm,
  /** For the controller: A finishes a line that is still being typed. */
  skip:finish,
  close(){stopTyping();typing=false;active=false;modal.classList.remove('rpg','typing');},
  get active(){return active;},
  get typing(){return typing;},
  get selected(){return selected;},
  dispose(){stopTyping();win?.removeEventListener?.('keydown',onKey,true);}
 };
}
