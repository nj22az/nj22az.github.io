import {fujitaComic} from './fujita-comic.mjs';
/** Canonical avatars, with the man's identity deliberately omitted from the printed comic. */
export function makeSomethingComic(recipeFor){const scenes=fujitaComic(recipeFor);
 const thuan=scenes[0].actors[0];thuan.name='Thuan';thuan.recipe=recipeFor('Thuan');thuan.pose='Sit';thuan.expression='worried';delete thuan.heldItem;thuan.speech='You could do so much with your life. Go out and make something of it!';
 for(const scene of scenes)for(const a of scene.actors)if(a.name==='Mr Fujita')a.name='Man';
 const hero=scenes[1];hero.backdrop='hero';hero.actors[0].speech="You're right! No more sitting around. From now on, I live with purpose!";
 const ending=scenes[2];ending.television='football';ending.bottom='TV: “Just two minutes left! Can they hold on?”';ending.actors[0].expression='content';
 return scenes;
}
