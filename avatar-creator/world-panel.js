import {playerRecipe,playerRecipeKey,savePlayerRecipe} from '../johansson-town/src/avatars/actors.js';
import {saveResidentRecipe} from '../johansson-town/src/avatars/wardrobe.js';
import {recipeFor} from '../johansson-town/src/avatars/cast.js';
import {RESIDENTS} from '../johansson-town/src/people/residents.js';
import {readPlayers,readSave} from '../johansson-town/src/save.js';
import {THUAN_OUTFITS,readStudioChoices,writeStudioChoices} from '../johansson-town/src/studio-handoff.js';

const shown=name=>name==='Thuan'?'Thuận':name;
const ME='';
// Where a change shows. World installed on the Home Screen keeps its own storage, apart from the browser's.
const WHERE=' Johansson World in this browser shows it when it opens, and at once if it is already open. (World installed on the Home Screen keeps a separate copy.)';

/**
 * "Johansson World" in Edit character: the look being edited goes into the game, for your own islander or for a
 * resident, and Thuận's outfit is chosen here. Customisation is Studio's; World only shows what is sent from here
 * (World's src/studio-handoff.js). Nothing reaches World until a button here is pressed, and a resident's look is
 * replaced by one that was not loaded from them only after you say so.
 */
export function createWorldPanel({creator,status}){
 const storage=globalThis.localStorage;
 const root=document.createElement('details');root.className='studio-files studio-world';
 const summary=document.createElement('summary');summary.textContent='Johansson World';root.append(summary);
 const menu=document.createElement('div');menu.className='studio-file-menu studio-world-menu';root.append(menu);
 const close=()=>{root.open=false;summary.focus();};
 const field=(text,control,parent=menu)=>{const label=document.createElement('label');label.append(text,control);parent.append(label);return label;};
 const button=(text,action,parent=menu,primary=false)=>{const b=document.createElement('button');b.type='button';b.textContent=text;b.onclick=action;if(primary)b.dataset.primary='';parent.append(b);return b;};
 const player=()=>{const roster=readPlayers(storage);return roster.players.find(p=>p.id===roster.active);};
 const failed='Browser storage is unavailable, so Johansson World could not be updated.';

 // Whose look is in the editor: set by "Load their look from World", cleared by any other change of design (a
 // template, an opened file), so sending to a resident can tell whether it replaces them with somebody else.
 let loadedFrom=null;
 const setRecipe=creator.setRecipe.bind(creator);
 try{creator.setRecipe=recipe=>{loadedFrom=null;return setRecipe(recipe);};}catch{}

 const who=document.createElement('select');
 const refreshWho=()=>{const value=who.value;who.replaceChildren(new Option('My islander · '+(player()?.name||'Visitor'),ME),...RESIDENTS.map(r=>new Option(shown(r.name),r.name)));who.value=[...who.options].some(o=>o.value===value)?value:ME;};
 refreshWho();field('Who wears it',who);
 button('Use this look in Johansson World',()=>{
  const name=who.value;
  if(name!==ME&&loadedFrom!==name&&!confirm(`Replace ${shown(name)}’s look in Johansson World with the one you are editing${creator.recipe?.name?' ('+creator.recipe.name+')':''}?`))return;
  try{
   if(name===ME){const code=savePlayerRecipe(creator.recipe,storage);if(storage.getItem(playerRecipeKey(storage))!==code)throw Error('storage');status.textContent='Your islander has this look now.'+WHERE;}
   else{saveResidentRecipe(name,creator.recipe,storage);loadedFrom=name;status.textContent=`${shown(name)} has this look now.`+WHERE;}
  }catch{status.textContent=failed;}
  close();
 },menu,true);
 button('Load their look from World',()=>{
  const name=who.value;setRecipe(name===ME?playerRecipe(storage):recipeFor(name));loadedFrom=name;
  status.textContent=(name===ME?'Your islander’s':shown(name)+'’s')+' look from Johansson World is loaded. Edit it, then use it in World.';close();
 });

 // Thuận's outfit is sent on its own: choosing what she wears never changes her look.
 const outfitBox=document.createElement('div');outfitBox.className='studio-world-outfit';menu.append(outfitBox);
 const outfit=document.createElement('select');outfit.append(...THUAN_OUTFITS.map(o=>new Option(o.name,o.id)));
 field('Thuận wears',outfit,outfitBox);
 const currentOutfit=()=>readStudioChoices(storage).thuanOutfit||readSave(storage)?.thuanOutfit||'clothes';
 // It shows what she wears in World now, until another outfit is chosen here.
 let chosen=false;outfit.onchange=()=>{chosen=true;};
 button('Use this outfit in Johansson World',()=>{
  if(writeStudioChoices({thuanOutfit:outfit.value},storage)){chosen=false;status.textContent=`Thuận wears ${THUAN_OUTFITS.find(o=>o.id===outfit.value).name.replace(/^The /,'the ').replace(/^Her /,'her ')} now.`+WHERE;}
  else status.textContent=failed;
  close();
 },outfitBox);
 const sync=()=>{outfitBox.hidden=who.value!=='Thuan';if(!chosen)outfit.value=currentOutfit();};sync();who.onchange=sync;

 const play=document.createElement('a');play.href='/johansson-town/';play.textContent='Play Johansson World';play.className='studio-world-play';menu.append(play);
 root.addEventListener('toggle',()=>{if(root.open){refreshWho();sync();}});
 root.addEventListener('keydown',event=>{if(event.key==='Escape'&&root.open){event.preventDefault();event.stopPropagation();close();}});
 return root;
}
