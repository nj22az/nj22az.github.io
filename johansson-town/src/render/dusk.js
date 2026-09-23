/**
 * Cel-safe dusk clock.
 *
 * No PointLights. Drives the existing sun, hemisphere, grade and emissive
 * meshes from town minutes. Sakura's fluorescent stays cold white; paper
 * lanterns and occupied windows glow as emissive only.
 *
 * MeshToonMaterial ignores HDR, so time of day is these knobs — not more
 * lights. Extra lights add extra ramp bands and turn anime cel into muddy
 * low-poly. Do not change ink thickness, shadow tint or flatten from here.
 */

export function wrapMinutes(minutes){
 return ((minutes%1440)+1440)%1440;
}

export function hourOf(minutes){
 return wrapMinutes(minutes)/60;
}

/**
 * 1 at full day (07:00–17:00), 0 at night. Same envelope the town already uses
 * so shutters, AI and the sun height keep agreeing with the clock.
 */
export function daylight(minutes){
 const h=hourOf(minutes);
 if(h>=7&&h<17)return 1;
 if(h>=17&&h<20)return 1-(h-17)/3;
 if(h>=5&&h<7)return (h-5)/2;
 return 0;
}

function saturate(t){
 return t<0?0:t>1?1:t;
}

function smooth(t){
 const u=saturate(t);
 return u*u*(3-2*u);
}

function mixHex(a,b,t){
 t=saturate(t);
 const ar=(a>>16)&255,ag=(a>>8)&255,ab=a&255;
 const br=(b>>16)&255,bg=(b>>8)&255,bb=b&255;
 return (Math.round(ar+(br-ar)*t)<<16)|(Math.round(ag+(bg-ag)*t)<<8)|Math.round(ab+(bb-ab)*t);
}

/**
 * 0 before 17:00, 1 from 18:30–20:00, gone by 20:30.
 * The Gion-shaped hour: apricot then violet, then night.
 */
export function duskAmount(minutes){
 const h=hourOf(minutes);
 if(h<17||h>=20.5)return 0;
 if(h<18.5)return smooth((h-17)/1.5);
 if(h<20)return 1;
 return smooth(1-(h-20)/0.5);
}

/**
 * Occupied windows: off in full day, full from 18:00 through the night,
 * fading with the morning rather than snapping at 18:00.
 */
export function windowGlow(minutes){
 const h=hourOf(minutes);
 if(h>=18||h<5)return 1;
 if(h>=17)return smooth(h-17);
 if(h>=5&&h<7)return smooth(1-(h-5)/2);
 return 0;
}

/**
 * Paper lanterns (Minato akachochin): on from 17:00, full by 17:30, until 05:00.
 * They lead the windows by half an hour.
 */
export function lanternGlow(minutes){
 const h=hourOf(minutes);
 if(h>=17.5||h<5)return 1;
 if(h>=17)return smooth((h-17)/0.5);
 if(h>=5&&h<6)return smooth(1-(h-5));
 return 0;
}

/**
 * Sakura fluorescent: cold and full from half past six until eleven -- through opening,
 * and on while Thuan cashes up and restocks after the shutters come down at eight -- then
 * the night light over the till. Never warms toward lantern orange.
 */
export function fluorescent(minutes){
 const m=wrapMinutes(minutes);
 if(m>=390&&m<1380)return 1;
 return 0.6;
}

export function periodLabel(minutes){
 const h=hourOf(minutes);
 if(h<7)return 'EARLY MORNING';
 if(h<17)return 'AFTERNOON';
 if(h<18.5)return 'DUSK';
 if(h<20)return 'EVENING';
 return 'NIGHT';
}

export const PALETTE=Object.freeze({
 skyDay:0xb8dce9,
 skyDuskApricot:0xe7b08a,
 skyDuskViolet:0x6a5b8c,
 skyNight:0x2c3a52,
 skyRain:0xa7bcc6,
 sunDay:0xffddb0,
 sunDusk:0xffb07a,
 sunNight:0x9aacd0,
 fillDay:0xdbe7f2,
 fillDusk:0xf0c4a8,
 fillNight:0x6a7a98,
 groundDay:0x6b5f8c,
 groundDusk:0x5a4a78,
 groundNight:0x3d3558,
 sakuraTube:0xfff1ce,
 lanternPaper:0xd8562e,
});

export function sunColor(minutes){
 const h=hourOf(minutes);
 if(h>=20&&h<20.5)return mixHex(PALETTE.sunDusk,PALETTE.sunNight,smooth((h-20)/.5));
 const day=daylight(minutes);
 const dusk=duskAmount(minutes);
 if(dusk>0)return mixHex(PALETTE.sunDay,PALETTE.sunDusk,dusk);
 if(day>0)return mixHex(PALETTE.sunNight,PALETTE.sunDay,day);
 return PALETTE.sunNight;
}

export function skyColor(minutes,rain=false){
 if(rain)return PALETTE.skyRain;
 const day=daylight(minutes);
 const dusk=duskAmount(minutes);
 const h=hourOf(minutes);
 if(h>=20&&h<20.5)return mixHex(PALETTE.skyDuskViolet,PALETTE.skyNight,smooth((h-20)/.5));
 if(dusk>0){
  // Apricot on the way in, violet as the hour deepens past 18:30.
  const violet=h<18.5?0:smooth((h-18.5)/1.5);
  const warm=mixHex(PALETTE.skyDay,PALETTE.skyDuskApricot,dusk);
  return mixHex(warm,PALETTE.skyDuskViolet,violet);
 }
 if(day>0)return mixHex(PALETTE.skyNight,PALETTE.skyDay,day);
 return PALETTE.skyNight;
}

export function skyFill(minutes){
 const h=hourOf(minutes);
 if(h>=20&&h<20.5)return mixHex(PALETTE.fillDusk,PALETTE.fillNight,smooth((h-20)/.5));
 const day=daylight(minutes);
 const dusk=duskAmount(minutes);
 if(dusk>0)return mixHex(PALETTE.fillDay,PALETTE.fillDusk,dusk);
 if(day>0)return mixHex(PALETTE.fillNight,PALETTE.fillDay,day);
 return PALETTE.fillNight;
}

export function groundFill(minutes){
 const h=hourOf(minutes);
 if(h>=20&&h<20.5)return mixHex(PALETTE.groundDusk,PALETTE.groundNight,smooth((h-20)/.5));
 const day=daylight(minutes);
 const dusk=duskAmount(minutes);
 if(dusk>0)return mixHex(PALETTE.groundDay,PALETTE.groundDusk,dusk);
 if(day>0)return mixHex(PALETTE.groundNight,PALETTE.groundDay,day);
 return PALETTE.groundNight;
}

/**
 * Grade warmth only. Do not touch uShadowTint / ink uniforms from here —
 * those are the cel look.
 */
export function gradeWarmth(minutes){
 return 0.05+duskAmount(minutes)*0.07;
}

/**
 * One clock sample. Safe to call every setTime().
 * @param {number} minutes town minutes
 * @param {{rain?:boolean,inside?:boolean}} [options]
 */
export function clock(minutes,{rain=false,inside=false}={}){
 const day=daylight(minutes);
 const dusk=duskAmount(minutes);
 return {
  minutes:wrapMinutes(minutes),
  day,
  dusk,
  period:periodLabel(minutes),
  sky:skyColor(minutes,rain),
  sun:sunColor(minutes),
  sunIntensity:(.22+day*3.25)*(rain?.62:1),
  skyFill:skyFill(minutes),
  groundFill:groundFill(minutes),
  ambient:inside?1.05:(.55+day*.38+dusk*.08),
  bounce:(.55+day*.85)*(rain?.8:1),
  exposure:inside?1.08:1.04+day*.04+dusk*.02,
  gradeWarmth:gradeWarmth(minutes),
  windowGlow:windowGlow(minutes),
  lanternGlow:lanternGlow(minutes),
  fluorescent:fluorescent(minutes),
  fog:null,
 };
}
