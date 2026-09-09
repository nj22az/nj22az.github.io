// Fog is disabled in every weather/time state, including restored rainy saves.
export function atmosphere(day,rain=false,inside=false){
 return {sky:rain?0xa7bcc6:day>.7?0xb8dce9:day>.1?0xdbb5a0:0x30455d,
  fog:null,
  exposure:inside?1.08:1.04+day*.04,ambient:inside?1.05:.55+day*.38};
}
