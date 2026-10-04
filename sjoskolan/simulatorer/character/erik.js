import {normalizeRecipe} from './recipe.js';
// Erik: maskinrummets elektriker. En gammal svensk sjöman, fyrtio år i maskinrum, som har slagit sig ner på ön.
// Han visar eleven vad som ska göras; eleven (Johansson) räknar och läser av. Samma recept som i motor-90l/workshop/erik.js,
// utan ålderssteget som den här kopian av avatarkoden saknar (vitt hår, skägg och rynkor gör honom äldre).
export const ERIK = normalizeRecipe({name:'Erik',
  body:{height:.62,build:.62,silhouette:'masculine',skin:'#f0cdb4'},
  head:{size:.5,shape:.55,form:'soft-square',jaw:.6,cheeks:.5},
  hair:{style:'crop',colour:'#e9e6e0'},
  eyes:{style:'gentle',colour:'#4c7aa6',size:.45},
  brows:{style:'bushy',colour:'#e4e0d8',size:.6},
  nose:{style:'wide',size:.55},
  mouth:{style:'smile',colour:'#b8544a',size:.45},
  facial:{style:'beard',colour:'#ece9e3'},
  blush:.45,wrinkles:.75,
  outfit:{top:'jacket',topColour:'#24324f',pattern:'none',bottom:'trousers',bottomColour:'#3b3d42',footwear:'boots',shoes:'#2b2420',
    hat:'captain',hatColour:'#1d2840',accent:'#f4f1ea'}});
