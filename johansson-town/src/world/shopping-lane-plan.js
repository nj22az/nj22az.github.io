/** Original 1990s shopping lane, linked to the eastern coastal road. */
export const SHOPPING_LANE={minX:77,maxX:103,minZ:94,maxZ:134,x:90,z:113};
export const SHOPPING_LANE_ROUTE={id:'island-shopping-lane',peninsula:true,width:6,surface:'asphalt',points:[[89,87],[90,96],[90,128]]};
export const inShoppingLane=(x,z)=>x>=77&&x<=103&&z>=94&&z<=134;
export const SHOPPING_LANE_OUTFIT=Object.freeze({top:'jacket',topColour:'#eee8da',pattern:'none',bottom:'skirt',bottomColour:'#9b2834',bottomPattern:'plaid',footwear:'boots',shoes:'#704431',accent:'#e7c887',hat:'none'});
