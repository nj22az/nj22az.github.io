// Clear September air. Fog belongs to distant scenery and bad weather, not the shop aisle.
export function atmosphere(day,rain=false,inside=false){
 return {sky:rain?0xa7bcc6:day>.7?0xb8dce9:day>.1?0xdbb5a0:0x22384e,
  near:inside?500:rain?75:180,far:inside?1000:rain?245:520,
  exposure:inside?1.08:.98+day*.12,ambient:inside?1.05:.48+day*.8};
}
