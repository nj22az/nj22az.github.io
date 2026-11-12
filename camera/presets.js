/*
 * Presets (the owner, 12 November 2026: "have many presets to make the shaders to look awesome … sliders need to be
 * accessed by a setting").
 *
 * A preset is one Look set a certain way, named for what it gives: its strength, the screen or the console model it
 * is shown on, and what it adds to the picture before the Look draws it (light, contrast, colour, warmth, the size of
 * the Look's own pattern, how much detail it inks, and Pop). Where the strip offered one "Sepia" and a slider from 0
 * to 100, it now offers Classic, Faded album, Rich brown, Tea-stained and Hand-tinted, each drawn on the photographer's
 * own picture, one tap each.
 *
 * The first preset of every Look is the Look itself, untouched. A preset's numbers are copied onto the layer when it
 * is chosen (looks-gl.js normalRecipe keeps `preset` and `tune`), so a saved photo does not change when this list
 * does. The photographer's own adjustments stay their own: the engine adds the two (looks-gl.js tuned()).
 *
 * Some presets lay a second Look over the first (Ink & wash is Watercolour with Line drawing over it): the pairings an
 * artist picked for Surprise (smart-shuffle.js MIXES), each offered under the Look it starts from.
 *
 * What a preset does not set: the size of a Look's pattern and how many lines it inks. Those do not show in a small
 * picture (at a thumbnail's size every dot is at its smallest), so two tiles would look the same; they are steps under
 * Adjust instead (Pattern, Detail).
 */
const P=(id,name,o={})=>Object.freeze({id,name,...o,...(o.tune?{tune:Object.freeze(o.tune)}:{}),...(o.over?{over:Object.freeze(o.over)}:{})});
const CRT=Object.freeze({mode:'crt',scanlines:.45,glow:.25,curve:.3,mask:.15});
const ARCADE=Object.freeze({mode:'crt',scanlines:.75,glow:.45,curve:.5,mask:.3});
/** A second Look laid over the first: the pairings an artist picked (smart-shuffle.js MIXES), each under its base. */
const over=(look,amount=1)=>({look,amount});

/** What a game console's Look is offered as, after itself. */
const console_=(extra=[])=>[
 P('tv','On the TV',{screen:CRT}),
 P('arcade','Arcade',{screen:ARCADE,tune:{contrast:.15,colour:.15}}),
 P('vivid','Vivid',{tune:{colour:.45,contrast:.2}}),
 P('dark','Night level',{tune:{light:-.3,contrast:.2}}),
 ...extra,
];

export const LOOK_PRESETS=Object.freeze({
 // ---- Photo ----
 none:[P('plain','Natural'),
  P('bright','Bright',{tune:{light:.28,pop:.2}}),
  P('punchy','Punchy',{tune:{contrast:.38,colour:.25,pop:.35}}),
  P('vivid','Vivid',{tune:{colour:.55,pop:.25}}),
  P('golden','Golden hour',{tune:{warmth:.7,colour:.18,contrast:.1,light:.06}}),
  P('cool','Blue hour',{tune:{warmth:-.6,light:-.06,contrast:.12}}),
  P('soft','Soft',{tune:{contrast:-.32,light:.14,detail:-.4}}),
  P('faded','Faded',{tune:{contrast:-.48,light:.2,colour:-.28}}),
  P('moody','Moody',{tune:{light:-.26,contrast:.32,colour:-.22,warmth:-.15}}),
  P('crisp','Crisp',{tune:{contrast:.16,pop:.6}}),
 ],
 mono:[P('plain','Classic'),
  P('noir','Noir',{tune:{contrast:.6,light:-.12}}),
  P('silver','Silver',{tune:{light:.16,contrast:.16,pop:.35}}),
  P('soft','Soft grey',{tune:{contrast:-.34,light:.12}}),
  P('high','High key',{tune:{light:.4,contrast:.1}}),
  P('low','Low key',{tune:{light:-.38,contrast:.3}}),
  P('half','Half colour',{amount:.6}),
  P('late','Late show',{over:over('crt')}),
 ],
 sepia:[P('plain','Classic'),
  P('faded','Faded album',{amount:.88,tune:{contrast:-.34,light:.16}}),
  P('rich','Rich brown',{tune:{contrast:.34,light:-.08}}),
  P('old','Old print',{tune:{light:-.3,contrast:.5,pop:.4}}),
  P('sunlit','Sunlit',{tune:{light:.36,contrast:-.1}}),
  P('tinted','Hand-tinted',{amount:.58,tune:{colour:.25}}),
  P('reel','Old reel',{over:over('crt',.8)}),
 ],
 negative:[P('plain','Classic'),
  P('xray','X-ray',{tune:{colour:-1,contrast:.3}}),
  P('hot','Hot',{tune:{warmth:1,colour:.4}}),
  P('cold','Cold',{tune:{warmth:-1,colour:.4}}),
  P('hard','Hard',{tune:{contrast:.6}}),
  P('ghost','Ghost',{amount:.82,tune:{light:.15}}),
 ],
 instant:[P('plain','Classic'),
  P('sunny','Sunny',{tune:{light:.26,warmth:.3,contrast:-.1}}),
  P('chrome','Cool chrome',{tune:{warmth:-.85,colour:-.15,contrast:.15}}),
  P('faded','Sun-faded',{tune:{contrast:-.38,light:.16,colour:-.22}}),
  P('rich','Rich',{tune:{contrast:.28,colour:.3}}),
  P('half','Light touch',{amount:.6}),
  P('video','Home video',{over:over('camcorder')}),
 ],
 tilt:[P('plain','Classic'),
  P('toy','Toy town',{tune:{colour:.55,contrast:.22,pop:.2}}),
  P('model','Model railway',{tune:{colour:.25,light:.12,warmth:.2}}),
  P('dusk','Dusk',{tune:{warmth:.45,light:-.14,colour:.3}}),
  P('mist','Morning mist',{tune:{contrast:-.3,light:.18,warmth:-.2}}),
 ],
 nightVision:[P('plain','Classic'),
  P('over','Over the photo',{amount:.62}),
  P('watch','Night watch',{over:over('crt',.8)}),
 ],
 // ---- Pop ----
 popArt:[P('plain','Classic'),
  P('bold','Bolder',{tune:{contrast:.42}}),
  P('pastel','Pastel',{tune:{contrast:-.32,light:.16}}),
  P('warm','Warm print',{tune:{warmth:.55}}),
  P('cool','Cool print',{tune:{warmth:-.55}}),
  P('over','Paste-up',{amount:.7}),
 ],
 poster:[P('plain','Classic'),
  P('bright','Daylight',{tune:{light:.28}}),
  P('night','Night',{tune:{light:-.32}}),
  P('bold','Bold',{tune:{contrast:.55}}),
  P('soft','Soft',{tune:{contrast:-.4}}),
  P('over','Paste-up',{amount:.7}),
 ],
 neon:[P('plain','Classic'),
  P('bright','Brighter',{tune:{light:.32,colour:.3}}),
  P('glow','Glow on the photo',{amount:.6}),
  P('cool','Ice',{tune:{warmth:-.8}}),
  P('hot','Ember',{tune:{warmth:.8}}),
 ],
 thermal:[P('plain','Classic'),
  P('hot','Hotter',{tune:{light:.3}}),
  P('cold','Colder',{tune:{light:-.3}}),
  P('hard','Hard edges',{tune:{contrast:.55}}),
  P('over','Over the photo',{amount:.6}),
 ],
 funhouse:[P('plain','Classic'),
  P('candy','Candy',{tune:{colour:.55,light:.1}}),
  P('spooky','Spooky',{tune:{light:-.25,contrast:.35,warmth:-.4}}),
  P('comic','Comic mirror',{over:over('popArt',.8)}),
 ],
 // ---- Games ----
 pocket:[P('plain','Game Boy'),
  P('dark','In the dark',{tune:{light:-.3,contrast:.2}}),
  P('sun','In the sun',{tune:{light:.3}}),
  P('tv','Hand-held TV',{over:over('crt')}),
 ],
 colourHandheld:[P('plain','Classic'),
  P('vivid','Vivid',{tune:{colour:.5,contrast:.25}}),
  P('dark','In the dark',{tune:{light:-.3,contrast:.2}}),
  P('sun','In the sun',{tune:{light:.3}}),
 ],
 redVisor:[P('plain','Classic'),
  P('bright','Bright',{tune:{light:.5}}),
  P('dim','Dim',{tune:{light:-.5}}),
 ],
 eightBit:[P('plain','Classic'),...console_()],
 snes:[P('plain','Classic'),...console_()],
 thirtyTwoBit:[P('plain','Classic'),...console_()],
 sixtyFourBit:[P('plain','Classic'),...console_([P('fog','Foggy',{tune:{contrast:-.3,light:.12}})])],
 // ---- 80s ----
 crt:[P('plain','Classic'),
  P('arcade','Arcade',{screen:ARCADE,tune:{contrast:.15,colour:.2}}),
  P('soft','Bedroom TV',{screen:{mode:'crt',scanlines:.25,glow:.4,curve:.2,mask:.08},tune:{contrast:-.15}}),
  P('bw','Black & white set',{tune:{colour:-1,contrast:.2}}),
  P('late','Late show',{tune:{light:-.24,warmth:-.35}}),
  P('vivid','Saturday morning',{tune:{colour:.5,light:.1}}),
 ],
 camcorder:[P('plain','Classic'),
  P('birthday','Birthday ’89',{tune:{warmth:.45,colour:.25,light:.08}}),
  P('worn','Worn tape',{tune:{contrast:-.3,colour:-.25,light:.1}}),
  P('night','Night shot',{tune:{light:-.3,contrast:.25}}),
  P('security','Security',{tune:{colour:-1,contrast:.3}}),
  P('vivid','Holiday',{tune:{colour:.5,contrast:.15}}),
 ],
 // ---- Drawn ----
 lines:[P('plain','Classic'),
  P('over','Over the photo',{amount:.6}),
  P('dark','Heavy ink',{tune:{light:-.3,contrast:.3}}),
  P('light','Light hand',{tune:{light:.3}}),
  P('riso','Two-colour print',{over:over('riso')}),
  P('plan','Engineer’s plan',{over:over('cyanotype')}),
 ],
 sketchbook:[P('plain','Classic'),
  P('dark','Dark',{tune:{light:-.3,contrast:.3}}),
  P('light','Light',{tune:{light:.3}}),
  P('over','Over the photo',{amount:.6}),
  P('model','Architect’s model',{over:over('tilt')}),
 ],
 crayon:[P('plain','Classic'),
  P('bright','Bright box',{tune:{colour:.5,light:.1}}),
  P('soft','Soft',{tune:{contrast:-.3,light:.12}}),
  P('dark','Pressed hard',{tune:{light:-.25,contrast:.3}}),
  P('over','Over the photo',{amount:.55}),
 ],
 pencilManga:[P('plain','Classic'),
  P('dark','Dark page',{tune:{light:-.3,contrast:.3}}),
  P('light','Light page',{tune:{light:.3}}),
  P('over','Over the photo',{amount:.6}),
 ],
 manga:[P('plain','Classic'),
  P('dark','Dark page',{tune:{light:-.22,contrast:.2}}),
  P('light','Light page',{tune:{light:.22}}),
  P('over','Over the photo',{amount:.6}),
 ],
 flat:[P('plain','Classic'),
  P('vivid','Vivid',{tune:{colour:.5,contrast:.15}}),
  P('pastel','Pastel',{tune:{contrast:-.32,light:.16}}),
  P('sunday','Sunday comic',{over:over('manga',.45)}),
  P('line','Line & colour',{over:over('lines',.6)}),
  P('book','Comic book',{over:over('halftone')}),
 ],
 adventureInk:[P('plain','Classic'),
  P('vivid','Vivid',{tune:{colour:.5,contrast:.15}}),
  P('pastel','Pastel',{tune:{contrast:-.3,light:.15}}),
  P('sunset','Sunset',{tune:{warmth:.6,colour:.25}}),
  P('night','Night',{tune:{light:-.3,warmth:-.4,contrast:.15}}),
 ],
 // ---- Comic ----
 halftone:[P('plain','Classic'),
  P('bold','Bold',{tune:{contrast:.45,colour:.25}}),
  P('pale','Pale',{tune:{contrast:-.32,light:.16}}),
  P('over','Over the photo',{amount:.62}),
  P('warm','Old paper',{tune:{warmth:.6}}),
 ],
 goldenAge:[P('plain','Classic'),
  P('bold','Bold',{tune:{contrast:.42}}),
  P('pale','Sun-bleached',{tune:{contrast:-.3,light:.18}}),
  P('dark','Night issue',{tune:{light:-.3}}),
 ],
 actionManga:[P('plain','Classic'),
  P('dark','Dark page',{tune:{light:-.3,contrast:.3}}),
  P('light','Light page',{tune:{light:.3}}),
  P('over','Over the photo',{amount:.6}),
 ],
 oldCartoon:[P('plain','Classic'),
  P('bold','Bold',{tune:{contrast:.45}}),
  P('soft','Soft',{tune:{contrast:-.3,light:.12}}),
  P('dark','Night scene',{tune:{light:-.32}}),
  P('tv','On the old set',{over:over('crt',.8)}),
 ],
 // ---- Painted ----
 watercolour:[P('plain','Classic'),
  P('vivid','Vivid',{tune:{colour:.5,contrast:.15}}),
  P('pale','Pale wash',{tune:{contrast:-.34,light:.18}}),
  P('ink','Ink & wash',{over:over('lines',.7)}),
  P('comic','Comic colour',{over:over('manga',.5)}),
  P('pencil','Pencil & wash',{over:over('pencilManga',.5)}),
  P('village','Model village',{over:over('tilt')}),
 ],
 oil:[P('plain','Classic'),
  P('vivid','Vivid',{tune:{colour:.5,contrast:.15}}),
  P('dark','Old master',{tune:{light:-.28,contrast:.3,warmth:.3}}),
  P('inked','Inked oils',{over:over('manga',.4)}),
  P('diorama','Diorama',{over:over('tilt')}),
 ],
 brushOil:[P('plain','Classic'),
  P('vivid','Vivid',{tune:{colour:.5,contrast:.15}}),
  P('dark','Old master',{tune:{light:-.28,contrast:.3,warmth:.3}}),
  P('pale','Pale',{tune:{contrast:-.32,light:.16}}),
 ],
 // ---- Print ----
 print:[P('plain','Classic'),
  P('bold','Bold cut',{tune:{detail:-.6,contrast:.3}}),
  P('dark','Dark',{tune:{light:-.3}}),
  P('light','Light',{tune:{light:.3}}),
  P('toy','Toy town',{over:over('tilt')}),
  P('poster','Poster',{over:over('riso',.6)}),
 ],
 stamp:[P('plain','Classic'),
  P('heavy','Heavy ink',{tune:{light:-.3}}),
  P('dry','Dry pad',{tune:{light:.3}}),
  P('over','Over the photo',{amount:.6}),
 ],
 cyanotype:[P('plain','Classic'),
  P('deep','Deep blue',{tune:{light:-.28,contrast:.3}}),
  P('pale','Pale',{tune:{light:.3,contrast:-.2}}),
  P('hard','Hard',{tune:{contrast:.55}}),
  P('over','Over the photo',{amount:.6}),
 ],
 // ---- Riso ----
 ...Object.fromEntries(['riso','risoPinkBlue','risoRedNavy','risoBlackPink','risoThree'].map(name=>[name,[P('plain','Classic'),
  P('bold','Bold',{tune:{contrast:.45}}),
  P('pale','Pale',{tune:{contrast:-.3,light:.18}}),
  P('dark','Heavy ink',{tune:{light:-.3}}),
  P('over','Over the photo',{amount:.62}),
 ]])),
});

/** The presets of a Look: at least itself. */
export const presetsFor=look=>LOOK_PRESETS[look]||[P('plain','Classic')];
/** A layer set to a Look's preset: its strength, its screen or model, its name and its tuning. */
export function presetLayer(look,preset){
 const layer={look,amount:preset.amount??1,preset:preset.id};
 if(preset.handheld)layer.handheld=preset.handheld;
 if(preset.screen)layer.screen={...preset.screen};
 if(preset.tune)layer.tune={...preset.tune};
 return layer;
}
/**
 * Sets layer `index` of a mix to a Look's preset. A preset that lays a second Look over the first puts that Look in
 * the next place (marked `mate`, so the next preset chosen knows it came with this one and takes it away again);
 * a Look the photographer mixed in themselves is never removed. Returns the layers.
 */
export function applyPreset(layers,index,look,preset,max=3){
 layers[index]=presetLayer(look,preset);
 if(layers[index+1]?.mate)layers.splice(index+1,1);
 if(preset.over&&layers.length<max)layers.splice(index+1,0,{look:preset.over.look,amount:preset.over.amount??1,mate:true});
 return layers;
}
/** The preset a layer is set to, or null once its strength or screen has been changed by hand. */
export function presetOf(layer){
 const list=presetsFor(layer.look);
 if(layer.preset)return list.find(p=>p.id===layer.preset)||null;
 // A layer from before presets, or one set by Surprise: the Look itself, when nothing about it was changed.
 return layer.amount===1&&!layer.tune&&!layer.screen&&!layer.handheld&&!layer.mate?list[0]:null;
}
export const presetCount=()=>Object.values(LOOK_PRESETS).reduce((n,list)=>n+list.length,0);
