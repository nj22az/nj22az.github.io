/**
 * Conversations as scenes: Shenmue's staging, Grim Fandango's words.
 *
 * It dresses the town's one modal (#activity) when it holds a conversation, and leaves
 * it alone for everything else (the field book, the ledger, the shop). There is no box
 * and no name tag. The line is a subtitle along the bottom of a letterboxed frame, in
 * the speaker's own colour; your possible replies are a plain list of lines beneath it,
 * and the one under the cursor lights up. When you pick one, Johansson says it (in
 * white, with the camera on him) before they answer, so it is a conversation and not a
 * menu. Buttons that are not things you would say out loud ("Look at the receipt")
 * simply happen.
 *
 * Controls, the same everywhere:
 *   E, Space, Enter, a click   skip the pause, or say the lit line
 *   Up / Down, W / S            move the light
 *   1–9                          say that line
 *   Esc                          leave
 * A controller's A and D-pad reach the same place (see game.js).
 */

/** Each speaker's subtitle colour; Johansson is white. Anyone else gets a stable one. */
export const SPEAKER_COLOURS=Object.freeze({
 Johansson:'#ffffff',Thuan:'#ffd56b',Nao:'#ffa585',Aya:'#cdb0ff','Mrs Sato':'#ff9ec0',Yoshiko:'#b9e59a',
 Kenji:'#8fd3ff',Reiko:'#ffb3c7',Emi:'#ffc9a8','Harbour master':'#9fd8ff',Masaru:'#ffbf80'
});
const PALETTE=['#8fd3ff','#a8f0b8','#ffbe7a','#e3aaff','#ffe08a','#86e3d3','#ffa7b8','#bccaff'];
export function speakerColour(name=''){
 if(SPEAKER_COLOURS[name])return SPEAKER_COLOURS[name];
 let h=0;for(const c of String(name))h=(h*31+c.codePointAt(0))>>>0;
 return PALETTE[h%PALETTE.length];
}

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

// Buttons that are doing, not saying.
const SILENT=/^(Go on|Back to |Back$|Look at |Read |Sell |Put back|Put something back|Into your pocket|Close|Konbini passport|Last receipt|Try again|Return to town)/;
// Menu labels, and what Johansson actually says when he picks them.
const SAYS=Object.freeze({
 'Talk with Thuan':'Got a minute, Thuan?',
 'Give her a present':'I brought you something.',
 'Ask her something':'Can I ask you something?',
 'The shop side of things':'Let’s talk shop.',
 'Come to Umi-no-yu after work':'Come to Umi-no-yu with me after work?',
 'Umi-no-yu after work — still on':'Still on for Umi-no-yu tonight?',
 'Tell me something else':'Tell me something else.'
});

/**
 * What Johansson says out loud for a reply, or null when it is an action. A button may
 * carry its own line in data-say ('' for none).
 */
export function spokenLine(label,said){
 if(typeof said==='string')return said||null;
 const text=String(label||'').replace(/\s+/g,' ').trim();
 if(!text||SILENT.test(text))return null;
 if(/^Pay ¥/.test(text))return 'Here you are.';
 if(SAYS[text])return SAYS[text];
 return /[.?!…”’)]$/.test(text)?text:text+'.';
}

/** How long a line stays up before the replies come in, and how long Johansson's lasts. */
export const readingBeat=text=>Math.min(1600,450+String(text||'').length*12);
export const playerLineTime=text=>Math.min(3200,Math.max(1200,700+String(text||'').length*55));

/**
 * @param {object} options
 * @param {HTMLElement} options.modal     #activity
 * @param {HTMLElement} options.heading   #activityTitle
 * @param {HTMLElement} options.body      #activityBody
 * @param {HTMLElement} options.actions   #activityActions
 * @param {() => boolean} options.isOpen  whether the modal is showing
 * @param {() => void} options.leave      closes the conversation
 * @param {(phase:{phase:'speaker'|'player'|'none',speaker?:string,text?:string,seconds?:number})=>void} [options.onPhase]
 * @param {Window} [options.win]
 */
export function createDialogueBox({modal,heading,body,actions,isOpen,leave,onPhase=()=>{},win=globalThis.window}){
 const doc=modal.ownerDocument||globalThis.document;
 // Outside a real browser (the tests' stand-in DOM) everything happens at once.
 const animated=typeof win?.matchMedia==='function'&&typeof win?.setTimeout==='function';
 let active=false,listening=false,speakingOwn=false,beat=null,lineTimer=null,selected=-1,speaker='',passThrough=false,afterLine=null,own=null;
 const choices=()=>[...actions.querySelectorAll('button')].filter(b=>!b.disabled);
 const clear=()=>{if(beat){win.clearTimeout(beat);beat=null;}if(lineTimer){win.clearTimeout(lineTimer);lineTimer=null;}};

 function select(index,focus=true){
  const list=choices();
  list.forEach(b=>b.classList?.remove('selected'));
  selected=list.length?Math.max(0,Math.min(index,list.length-1)):-1;
  const button=list[selected];
  if(button){button.classList.add('selected');if(focus||doc?.activeElement?.closest?.('#activity'))button.focus?.({preventScroll:true});}
 }
 function endBeat(){
  if(!listening)return false;
  if(beat){win.clearTimeout(beat);beat=null;}
  listening=false;modal.classList.remove('listening');select(selected<0?0:selected);
  return true;
 }
 /** Johansson's own line has been said: now the reply actually happens. */
 function endOwnLine(){
  if(!speakingOwn)return false;
  if(lineTimer){win.clearTimeout(lineTimer);lineTimer=null;}
  speakingOwn=false;modal.classList.remove('player-speaking');
  const then=afterLine;afterLine=null;
  passThrough=true;try{then?.();}finally{passThrough=false;}
  return true;
 }

 /**
  * Called by the modal each time it is filled. Conversations become the scene; anything
  * else is left exactly as it was.
  */
 function present({title,text,conversation}){
  clear();listening=false;speakingOwn=false;afterLine=null;active=!!conversation;
  modal.classList.toggle('rpg',active);
  modal.classList.remove('listening');modal.classList.remove('player-speaking');
  if(!active){onPhase({phase:'none'});return;}
  ({speaker}=splitTitle(title));
  heading.dataset.speaker=speaker;
  modal.style?.setProperty?.('--line-colour',speakerColour(speaker));
  const line=body.querySelector('p')||doc.createElement('p');
  if(!line.parentNode)body.append(line);
  line.classList.add('rpg-line');
  line.textContent=String(text??'');
  // Johansson's side of the exchange, said over the same spot when he speaks.
  own=doc.createElement('p');own.className='rpg-own';body.append(own);
  choices().forEach((b,i)=>{b.dataset.key=i<9?String(i+1):'';});
  selected=0;select(0);
  onPhase({phase:'speaker',speaker,text:String(text??'')});
  if(!animated)return;
  // A beat to take the line in before the replies come up.
  listening=true;modal.classList.add('listening');
  beat=win.setTimeout(endBeat,readingBeat(text));
 }

 /** Say the reply at `index` (Johansson speaks it first, unless it is an action). */
 function choose(index){
  const button=choices()[index];if(!button)return false;
  select(index,false);
  const said=spokenLine(button.textContent,button.dataset?.say);
  if(!animated||!said){passThrough=true;try{button.click();}finally{passThrough=false;}return true;}
  speakingOwn=true;afterLine=()=>button.click();
  if(own)own.textContent=said;
  modal.classList.add('player-speaking');
  const ms=playerLineTime(said);
  onPhase({phase:'player',speaker:'Johansson',text:said,seconds:ms/1000});
  lineTimer=win.setTimeout(endOwnLine,ms);
  return true;
 }

 /** Confirm: skip the beat or Johansson's line, otherwise say the lit reply. */
 function confirm(){
  if(!active||!isOpen())return false;
  if(endOwnLine()||endBeat())return true;
  return choose(selected);
 }

 function onKey(event){
  if(!active||!isOpen()||event.defaultPrevented)return;
  // Typing into the chat box with Thuan is typing, not steering the conversation.
  if(event.target?.closest?.('input,textarea,select'))return;
  const code=event.code;
  let handled=true;
  if(code==='KeyE'||code==='Space'||code==='Enter'||code==='NumpadEnter')confirm();
  else if(code==='ArrowDown'||code==='KeyS'){if(!listening&&!speakingOwn)select(stepSelection(selected,1,choices().length));}
  else if(code==='ArrowUp'||code==='KeyW'){if(!listening&&!speakingOwn)select(stepSelection(selected,-1,choices().length));}
  else if(/^(Digit|Numpad)[1-9]$/.test(code)){
   if(speakingOwn)endOwnLine();
   else{endBeat();if(!choose(Number(code.slice(-1))-1))handled=false;}
  }
  else if(code==='Escape')leave();
  else handled=false;
  if(handled){event.preventDefault();event.stopImmediatePropagation();}
 }
 win?.addEventListener?.('keydown',onKey,true);
 // A click on a reply says it first; a click anywhere else in the scene moves it on.
 actions.addEventListener('click',event=>{
  if(!active||passThrough||!animated)return;
  const button=event.target.closest?.('button');if(!button)return;
  event.preventDefault();event.stopImmediatePropagation();
  if(speakingOwn){endOwnLine();return;}
  endBeat();choose(choices().indexOf(button));
 },true);
 modal.addEventListener('pointerdown',event=>{
  if(!active||event.target.closest?.('#activityActions button,#closeActivity,input'))return;
  if(speakingOwn)endOwnLine();else endBeat();
 });
 actions.addEventListener('pointerover',event=>{
  const button=event.target.closest?.('button');if(!active||listening||speakingOwn||!button)return;
  const index=choices().indexOf(button);if(index>=0)select(index,false);
 });
 // A controller or Tab moves focus; the light follows it.
 actions.addEventListener('focusin',event=>{
  const index=choices().indexOf(event.target);if(active&&index>=0&&index!==selected)select(index,false);
 });

 return {
  present,confirm,choose,
  /** For the controller: A skips the pause. */
  skip:()=>endOwnLine()||endBeat(),
  close(){clear();listening=false;speakingOwn=false;afterLine=null;active=false;modal.classList.remove('rpg');modal.classList.remove('listening');modal.classList.remove('player-speaking');onPhase({phase:'none'});},
  get active(){return active;},
  get typing(){return listening||speakingOwn;},
  /** Who the camera should be on: the person talking to you, or Johansson. */
  get shot(){return speakingOwn?'player':'speaker';},
  get selected(){return selected;},
  dispose(){clear();win?.removeEventListener?.('keydown',onKey,true);}
 };
}
