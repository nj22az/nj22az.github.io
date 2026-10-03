/** Where the oil jetty and fuel depot are (oil-jetty.js). No imports: layout.js reads it. */
export const OIL_JETTY=Object.freeze({
 root:Object.freeze([44.2,-45.5]),
 deck:Object.freeze({minX:44.2,maxX:63,minZ:-46.6,maxZ:-44.4,y:.12}),
 head:Object.freeze({minX:59,maxX:64,minZ:-47.6,maxZ:-43.4}),
 depot:Object.freeze({x:40.6,z:-45.6,r:1.7,h:3.2}),
 berth:Object.freeze({x:54,z:-49.6}),
});
/** Every third day, alongside from 08:00 to 15:00, half an hour in and out. */
export const TANKER_CALL=Object.freeze({every:3,arrive:480,leave:900,passage:30});

export function oilJettyAt(x,z,r=0){
 const D=OIL_JETTY.deck,H=OIL_JETTY.head;
 return x>=D.minX&&x<=D.maxX-r&&z>=D.minZ+r&&z<=D.maxZ-r||x>=H.minX+r&&x<=H.maxX-r&&z>=H.minZ+r&&z<=H.maxZ-r;
}

