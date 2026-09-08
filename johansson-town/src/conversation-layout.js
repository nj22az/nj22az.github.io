// Reserve a separate scene area: dialogue never overlaps rendered characters.
export function conversationViewport(width,height,active){
 if(!active)return {width,height};
 if(width<720)return {width,height:Math.floor(height*.52)};
 return {width:width-Math.min(420,Math.max(300,width*.36)),height};
}
