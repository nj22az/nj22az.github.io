/** An off-duty sea-wall gag: the final line is the entire punchline. */
export function seventeenBeersComic(recipeFor){
 const man=()=>({id:'f',name:'Fujita',recipe:recipeFor('Mr Fujita'),x:0,z:0,y:0,size:1,seat:'seawall-bench-4',turn:-90,pose:'Sit',expression:'content',speech:'',speechStyle:'large',take:{format:'johansson-actor-take',version:1,name:'A happy glance',frames:[0,1].map(t=>({t,pose:'Sit',expression:'smile',head:[0,.6,0],smile:.35,strength:1}))}});
 const johansson=(z,pose='Idle')=>({id:'j',name:'Johansson',recipe:recipeFor('Johansson'),x:0,z,y:0,size:1,seat:'',turn:-110,pose,expression:'smile',speech:'',speechStyle:'large'});
 const shot=(actors,camera={})=>({version:2,location:'seawall',format:'square',style:'comic',look:'riso',top:'',bottom:'',camera:{orbit:0,elevation:0,zoom:1,...camera},actors});
 const first=shot([man(),johansson(2.1,'Walk')]);
 const second=shot([man(),johansson(1.1)]);second.actors[1].speech='You look happy.';
 const third=shot([man(),johansson(1.1)],{zoom:.82});third.actors[0].expression='smile';third.actors[0].speech='Thanks for noticing. I just had 17 beers.';
 return [first,second,third];
}
