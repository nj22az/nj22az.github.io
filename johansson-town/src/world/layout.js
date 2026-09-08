// Street and surface data shared by the renderer, map and movement checks.
// Original harbour coordinates are retained for v4 compatibility.
export const ROUTES = [
 {id:'shotengai',width:14,surface:'asphalt',points:[[0,58],[0,-52]]},
 {id:'quay',width:12,surface:'stone',points:[[-17,-58],[17,-58]]},
 {id:'outer-pier',width:8.2,surface:'wood',points:[[0,-58],[0,-79]]},
 {id:'east-alley',width:5.5,surface:'asphalt',points:[[0,18],[29,18],[36,30],[42,62],[25,84],[0,84],[0,56]]},
 {id:'west-alley',width:5.5,surface:'stone',points:[[0,50],[-29,50],[-40,31],[-42,-5],[-30,-11],[0,-11]]},
 {id:'residential',osmWays:[118267079,461555200],width:6,surface:'asphalt',points:[[36, 30], [38.0, 45.0], [34.84, 29.28], [65.44, 25.05], [74.68, 23.77], [74.73, 17.67], [78.59, 9.28], [89.61, 0.17], [100.09, 13.07], [110.15, 26.5], [118.6, 47.57], [122.14, 59.1], [124.76, 69.77], [42, 62]]},
 {id:'river-walk',width:4,surface:'stone',points:[[-42,-5],[-64,-14],[-71,-37],[-58,-56],[-17,-58]]},
 {id:'second-pier',width:4.6,surface:'wood',points:[[-58,-56],[-58,-80],[-42,-80]]},
 {id:'home-door',width:4,surface:'stone',points:[[42,62],[46,62]]},
 {id:'izakaya-door',width:4,surface:'asphalt',points:[[24,18],[24,20.5]]},
 {id:'ramen-door',width:4,surface:'stone',points:[[24,18],[24,14]]},
 {id:'bus-door',width:4,surface:'stone',points:[[-26,50],[-26,46]]},
 {id:'school-route',width:6,surface:'asphalt',points:[[65.44,25.05],[73,36],[73,48],[67,48],[67,64.35]]},
 {id:'shrine-slope',width:5,surface:'stone',points:[[25,84],[43,97],[63,104],[72,113]]},
];
export function nearestOnSegment(x,z,a,b){const dx=b[0]-a[0],dz=b[1]-a[1],q=dx*dx+dz*dz;const t=q?Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/q)):0;return {x:a[0]+dx*t,z:a[1]+dz*t,t,d:Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t)};}
export const LANDINGS=[{id:"shrine-landing",x:72,z:117,w:8,d:8,height:6,surface:"stone"}];
export function routeAt(x,z,r=0){return LANDINGS.find(p=>Math.abs(x-p.x)<=p.w/2-r&&Math.abs(z-p.z)<=p.d/2-r)||ROUTES.find(route=>route.points.slice(1).some((b,i)=>nearestOnSegment(x,z,route.points[i],b).d<=route.width/2-r));}
export function groundHeight(x,z){const landing=LANDINGS.find(p=>Math.abs(x-p.x)<=p.w/2&&Math.abs(z-p.z)<=p.d/2);if(landing)return landing.height;const slope=ROUTES.find(r=>r.id==='shrine-slope');let best=null,done=0,total=0;for(let i=1;i<slope.points.length;i++)total+=Math.hypot(slope.points[i][0]-slope.points[i-1][0],slope.points[i][1]-slope.points[i-1][1]);for(let i=1;i<slope.points.length;i++){const a=slope.points[i-1],b=slope.points[i],n=nearestOnSegment(x,z,a,b),len=Math.hypot(b[0]-a[0],b[1]-a[1]);if(!best||n.d<best.d)best={...n,height:(done+n.t*len)/total*6};done+=len;}return best.d<4?best.height:0;}
export const MAP_BOUNDS={minX:-80,maxX:140,minZ:-86,maxZ:126};
