// The bookshop retains its own street address after repairs move to the docks.
// The south wall is at z=-3.02, leaving just over 3 m to Minato's north gable.
export const BOOKSHOP_WORKSHOP_PLOT=Object.freeze({z:1.6,width:8.8,depth:7.4});
export const BOOKSHOP_WORKSHOP_ROOM=Object.freeze({
 width:8.4,depth:7,doorX:0,
 bounds:{minX:-4.2,maxX:4.2,minZ:-3.5,maxZ:3.5},
 spawn:[0,0,2.9],exit:[0,1.1,3.42],yaw:0,
 staff:{Aya:[-2.6,0,1.2],Reiko:[-2.6,0,-1.9]},
});
export const BOOKSHOP_WORKSHOP=Object.freeze({
 title:'Front-Row Books',jp:'Front-Row Books',sub:'BOOKS · NEWSPAPERS · LOCAL STORIES',
 bookshop:true,side:-1,
 line:'Aya’s small neighbourhood bookshop, with reading copies, second-hand books and Reiko’s evening newspaper.',
 directions:'On the west pavement, north of Minato Izakaya. A quiet bookshop with a window reading chair and a counter for recommendations.',
});
