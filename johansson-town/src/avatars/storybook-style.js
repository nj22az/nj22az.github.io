/**
 * Original island-storybook shape study, v1. Review-only builder option, not a
 * saved-recipe migration or a default change. Face/hair/accessories/prop solvers
 * consume the same resulting measurements and head profile.
 */
export function renderStyleOf(style){
 if(!['classic','island-storybook-v1','island-storybook-v2'].includes(style))throw new RangeError('Unknown character render style: '+style);
 return style;
}
export function storybookProfile(profile,version=1){
 if(version===2)return {...profile,width:profile.width*1.025,height:profile.height*.99,taper:profile.taper*.35-.035,cheek:profile.cheek*.7+.11,corners:Math.max(.08,profile.corners*.7),lowerFace:.12,cheekRelief:.12};
 // Keep square/pear/heart identities; soften their extremity rather than making
 // every person spherical. Fuller lower cheeks meet a less pinched chin.
 return {...profile,taper:profile.taper*.68,cheek:profile.cheek+.045,corners:profile.corners*.88,lowerFace:.06};
}
export function storybookHairPoint(point,keep,side,style,version=1){
 // Broad, deliberately unequal crown masses. Taper to zero at hairline and scalp;
 // no extra meshes, detached locks or modification of bald/horseshoe identities.
 if(['horseshoe','buzz','bald'].includes(style))return point;
 const crown=Math.max(0,Math.min(1,(point.y-(version===2?-.05:.12))/.65));
 const mass=(version===2?.05:.026)*crown*Math.max(0,keep)*(.65+.35*Math.sin(Math.atan2(point.x*side,point.z)*3+.6));
 return point.multiplyScalar(1+mass);
}
