/**
 * The police box: a chūzaisho, the kind of kōban a small town gets, where the officer
 * lives behind the front office. It stands on the lawn corner where Main Street opens
 * into the bus plaza, facing the pavement, so Officer Mori sees everybody who comes
 * off the Harbour Line. Front office on the street side, his tatami room behind.
 */
export const KOBAN=Object.freeze({
 id:'koban',title:'Minato Police Box',jp:"Police box",
 x:6.8,z:27,w:5,d:4.2,height:3.1,
 /** The street face is the west wall; the door is in its south half, near the plaza. */
 face:4.3,door:Object.freeze([3.65,27.9]),
 /** Walking in heads east, into the room. */
 inward:-Math.PI/2,
 address:'Minato Police Box, top of Main Street',
 resident:'Officer Mori',
});

/** The ground the building and its forecourt take; the lawn keeps its trees and shrubs off it. */
export const KOBAN_PLOT=Object.freeze({minX:KOBAN.x-KOBAN.w/2-.9,maxX:KOBAN.x+KOBAN.w/2+.6,minZ:KOBAN.z-KOBAN.d/2-.6,maxZ:KOBAN.z+KOBAN.d/2+1.4});
export const inKobanPlot=(x,z,r=0)=>x>KOBAN_PLOT.minX-r&&x<KOBAN_PLOT.maxX+r&&z>KOBAN_PLOT.minZ-r&&z<KOBAN_PLOT.maxZ+r;
