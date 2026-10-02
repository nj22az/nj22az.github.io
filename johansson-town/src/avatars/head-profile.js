/** Original console-avatar silhouettes, shared by the face, hair and accessories. */
export const HEAD_FORMS=Object.freeze(['oval','round','square','narrow','heart','soft-square','oblong','diamond','pear','wide','soft-round','teardrop']);
const FORMS={oval:[.94,1.08,.22],round:[1.03,1.01,.1],square:[1.03,1.02,-.16],narrow:[.84,1.16,.25],heart:[1.01,1.07,.37], 'soft-square':[1.01,1.04,-.07,.02],oblong:[.90,1.17,.08,-.02],diamond:[.95,1.10,.36,.11],pear:[.97,1.04,-.18,.07],wide:[1.13,.96,.10,.01],'soft-round':[1.06,1.03,.20,.08],teardrop:[.92,1.10,.35,-.03]};
export function headProfile(head){
 const [width,height,taper,cheek=0]=FORMS[head.form]||FORMS.oval;
 return {width:width+(head.shape-.5)*.12,height:height-(head.shape-.5)*.1,
  taper:taper+(head.jaw-.5)*-.22,cheek:cheek+(head.cheeks-.5)*.13};
}
/** Deform a unit head without moving its poles or changing its texture coordinates. */
export function shapeHeadPoint(point,profile){
 const y=point.y,lower=Math.max(0,Math.min(1,(-y-.12)/.78));
 const cheek=Math.exp(-(((y+.16)/.32)**2))*profile.cheek;
 point.x*=1-profile.taper*lower+cheek;
 // A slightly flatter facial plane gives eyes and mouths a readable surface.
 if(point.z>0)point.z*=1-.08*Math.max(0,1-Math.abs(y)*1.4);
 return point;
}
