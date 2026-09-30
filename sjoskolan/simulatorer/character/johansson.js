import {normalizeRecipe} from './recipe.js';
export const JOHANSSON = normalizeRecipe({name:'Johansson',
  body:{height:.72,build:.72,skin:'#dc9d7a'},head:{size:.48,shape:.45,form:'square',jaw:.75,cheeks:.55},
  hair:{style:'horseshoe',colour:'#b8b4aa'},
  eyes:{style:'gentle',colour:'#3d6a8a',size:.45,spacing:.52,height:.5,tilt:.45},
  brows:{style:'bushy',colour:'#a8a49a',size:.6,height:.55,tilt:.45},
  nose:{style:'wide',size:.6,height:.48},mouth:{style:'smile',colour:'#a8433e',size:.55,height:.5},
  facial:{style:'stubble',colour:'#b8b4aa'},wrinkles:.7,blush:.35,
  outfit:{top:'kariyushi',topColour:'#7fb0d8',pattern:'flowers',bottom:'shorts',bottomColour:'#c8b48a',shoes:'#6d4a32',accent:'#f4f1ea'},
  swim:{colour:'#2f5f9e'}});
export const ENGINEER = normalizeRecipe({...JOHANSSON, glasses:{style:'square',colour:'#c8d6db'}, outfit:{...JOHANSSON.outfit,top:'jacket',topColour:'#064f91',pattern:'none',bottom:'trousers',bottomColour:'#064f91',shoes:'#202a30',hat:'helmet',hatColour:'#f5cd53'}});
