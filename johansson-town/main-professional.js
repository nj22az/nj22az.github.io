// Professional boot wrapper for Johansson Town.
// It corrects the legacy minimap projection before the stable gameplay module
// takes ownership of the canvas, then loads that module unchanged.

const mapCanvas=document.getElementById('minimap');
if(mapCanvas){
  const originalGetContext=mapCanvas.getContext.bind(mapCanvas);
  const real=originalGetContext('2d');
  if(real){
    const oldMin=-66,oldSpan=130,newMin=-82,newSpan=144;
    const transformY=y=>{
      const z=y/mapCanvas.height*oldSpan+oldMin;
      return (z-newMin)/newSpan*mapCanvas.height;
    };
    const scaleY=oldSpan/newSpan;
    let paintedHarbour=false;
    const proxy=new Proxy(real,{
      get(target,prop){
        if(prop==='fillRect')return (x,y,w,h)=>{
          if(x===0&&y===0&&w===mapCanvas.width&&h===mapCanvas.height)paintedHarbour=false;
          const worldMarker=h<=9&&y!==0;
          target.fillRect(x,worldMarker?transformY(y):y,w,worldMarker?h*scaleY:h);
          if(!paintedHarbour&&y===0&&h===11&&w===mapCanvas.width){
            paintedHarbour=true;
            const previous=target.fillStyle;
            const px=xw=>mapCanvas.width/2+xw*3;
            const yApron=((-63.7)-newMin)/newSpan*mapCanvas.height;
            const yTown=((-52)-newMin)/newSpan*mapCanvas.height;
            const yPierEnd=((-79)-newMin)/newSpan*mapCanvas.height;
            target.fillStyle='#58686a';target.fillRect(px(-17.2),yApron,17.2*6,yTown-yApron);
            target.fillStyle='#747b78';target.fillRect(px(-4.15),yPierEnd,4.15*6,yApron-yPierEnd);
            target.fillStyle=previous;
          }
        };
        if(prop==='arc')return (x,y,r,start,end,ccw)=>target.arc(x,transformY(y),r,start,end,ccw);
        if(prop==='translate')return (x,y)=>target.translate(x,transformY(y));
        if(prop==='clearRect')return (...args)=>{paintedHarbour=false;return target.clearRect(...args);};
        const value=Reflect.get(target,prop,target);
        return typeof value==='function'?value.bind(target):value;
      },
      set(target,prop,value){Reflect.set(target,prop,value,target);return true;}
    });
    mapCanvas.getContext=(type,...args)=>type==='2d'?proxy:originalGetContext(type,...args);
  }
}

await import('./main.js?v=24-base');
