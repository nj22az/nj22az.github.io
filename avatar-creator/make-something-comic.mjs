import {fujitaComic} from './fujita-comic.mjs';
export const MAKE_SOMETHING_DIALOGUE=Object.freeze({
 en:["You could do so much with your life. Go out and make something of it!","You're right! No more sitting around. From now on, I live with purpose!",'TV: “Just two minutes left! Can they hold on?”'],
 vi:['Anh còn có thể làm được bao điều trong đời. Ra ngoài làm gì đó có ý nghĩa đi!','Đúng thật! Không ngồi không nữa. Từ giờ, tôi sẽ sống có mục đích!','TV: “Chỉ còn hai phút! Liệu họ có giữ được tỉ số?”'],
 ja:['人生、まだまだできることがあるでしょ。外に出て、何かやってみたら？','その通りだ！もうダラダラしない。これからは目標を持って生きるぞ！','テレビ「残り２分！このまま逃げ切れるか？」'],
 sv:['Du kan göra så mycket med ditt liv. Gå ut och gör något av det!','Du har rätt! Slut på slöandet. Från och med nu ska jag leva med ett mål!','TV: ”Bara två minuter kvar! Kan de hålla undan?”']
});
/** Canonical avatars, with the man's identity deliberately omitted from the printed comic. */
export function makeSomethingComic(recipeFor,{language='en'}={}){
 const dialogue=MAKE_SOMETHING_DIALOGUE[language];if(!dialogue)throw Error('Supported comic languages: en, vi, ja, sv.');
 const scenes=fujitaComic(recipeFor);
 const thuan=scenes[0].actors[0];thuan.name='Thuan';thuan.recipe=recipeFor('Thuan');thuan.pose='Sit';thuan.expression='worried';delete thuan.heldItem;thuan.speech=dialogue[0];
 for(const scene of scenes)for(const a of scene.actors)if(a.name==='Mr Fujita')a.name='Man';
 const hero=scenes[1];hero.backdrop='hero';hero.actors[0].speech=dialogue[1];
 const ending=scenes[2];ending.television='football';ending.bottom=dialogue[2];ending.actors[0].expression='content';
 return scenes;
}
