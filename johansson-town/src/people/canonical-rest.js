// Named shore residents' overnight hours. Main-cast night shifts retain their
// established home-life.js hours; these cover the canonical neighbour controller.
const H=(sleep,wake)=>Object.freeze({sleep,wake});
export const CANONICAL_REST=Object.freeze({
 'Grandmother Chinen':H(1260,360),Vy:H(1260,420),'Kōji':H(1260,225),Riku:H(1260,420),
 'Miss Higa':H(1380,420),'Grandmother Higa':H(1260,390),'Grandmother Sakurai':H(1260,330),
 'Postman Tōma':H(1320,420),'Dr Kakazu':H(1380,450),'Mr Ōshiro':H(1260,270),
 'Mrs Kinjō':H(1320,420),'Mrs Nakamura':H(1290,315),Mai:H(1260,420),
 'Bus driver':H(1320,330),'Mr Nakandakari':H(1320,285),'Mr Higa Jr':H(1320,315),
 'Ms Uezu':H(1320,315),'Ms Ganaha':H(1320,420),'Mr Shimabukuro':H(1320,285),
});
const minute=m=>((m%1440)+1440)%1440;
/** A home stays occupied through midnight and breakfast, even without a modelled bedroom. */
export function canonicalRest(name,minutes){
 const hours=CANONICAL_REST[name];if(!hours)return null;
 const m=minute(minutes),sinceWake=minute(m-hours.wake);
 if(minute(m-hours.sleep)<minute(hours.wake-hours.sleep))return {id:'sleep',activity:'sleeping at home'};
 if(sinceWake<15)return {id:'wake',activity:'waking up at home'};
 if(sinceWake<45)return {id:'breakfast',activity:'having breakfast at home'};
 return null;
}
