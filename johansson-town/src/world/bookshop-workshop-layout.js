// One street address for the books, evening press and repair workshop.
// The south wall is at z=-3.02, leaving just over 3 m to Minato's north gable.
export const BOOKSHOP_WORKSHOP_PLOT=Object.freeze({z:1.6,width:8.8,depth:7.4});
export const BOOKSHOP_WORKSHOP_ROOM=Object.freeze({
 width:8.4,depth:7,doorX:0,
 bounds:{minX:-4.2,maxX:4.2,minZ:-3.5,maxZ:3.5},
 spawn:[0,0,2.9],exit:[0,1.1,3.42],yaw:0,
 staff:{Aya:[-2.6,0,1.2],Reiko:[-2.6,0,-1.9],Kenji:[.8,0,-1.9],Tetsuo:[2.7,0,-1.9]},
});
export const BOOKSHOP_WORKSHOP=Object.freeze({
 title:'Front-Row Books & Workshop',jp:'前列書房・工房',sub:'BOOKS · PRESS · REPAIRS',
 combinedWorkshop:true,side:-1,
 line:'Aya’s books, Reiko’s evening press, and Kenji and Tetsuo’s workshop.',
 directions:'On the west pavement, north of Minato Izakaya. Books, printing and repairs share one entrance.',
});
