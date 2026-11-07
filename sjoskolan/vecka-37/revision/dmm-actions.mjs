import {METER_DEFAULT,METER_MODES,observeDMM,applyDMMProtection} from './dmm-model.mjs';
import {DC_TERMINALS} from './dc-interaction.mjs';
export function newDMMState(){return {voltage:12,resistance:6,closed:true,fault:'none',power:false,isolated:false,seriesOpen:false,probeTargets:{red:null,black:null},meter:{...METER_DEFAULT}};}
export function operateDMM(input,action,args={}){const s=structuredClone(input);if(!s.meter||!s.probeTargets)throw Error('Invalid multimeter state');const off=()=>{if(s.power)throw Error('Bryt matningen före omkoppling.');};switch(action){
 case 'connect':if(!['red','black'].includes(args.probe)||(args.terminal!==null&&!DC_TERMINALS[args.terminal]))throw Error('Unknown probe or terminal');s.probeTargets[args.probe]=args.terminal;break;
 case 'disconnect':s.probeTargets={red:null,black:null};s.meter.hold=false;s.meter.held=null;break;
 case 'set_mode':if(!METER_MODES[args.mode])throw Error('Unknown dial function');s.meter.mode=args.mode;s.meter.hold=false;s.meter.held=null;break;
 case 'set_jack':off();if(!['v','ma','a'].includes(args.jack))throw Error('Unknown input jack');s.meter.jack=args.jack;break;
 case 'set_range':if(!['auto','2','20','200','2000','2000000'].includes(String(args.range)))throw Error('Unknown range');s.meter.range=String(args.range);break;
 case 'set_input':if(![1e6,10e6].includes(args.input))throw Error('Input must be 1 or 10 MΩ');s.meter.input=args.input;break;
 case 'set_voltage':if(![6,12,24].includes(args.voltage))throw Error('Source must be 6, 12 or 24 V');s.voltage=args.voltage;break;
 case 'set_load':if(![6,12,24,1e6].includes(args.resistance))throw Error('Unsupported load');s.resistance=args.resistance;break;
 case 'power':if(typeof args.on!=='boolean')throw Error('on must be boolean');if(args.on&&(s.protection||s.isolated))throw Error('Återställ skyddet eller återanslut källan först.');s.power=args.on;break;
 case 'isolate':off();if(typeof args.isolated!=='boolean')throw Error('isolated must be boolean');s.isolated=args.isolated;break;
 case 'series_bridge':off();if(typeof args.open!=='boolean')throw Error('open must be boolean');s.seriesOpen=args.open;break;
 case 'switch':if(typeof args.closed!=='boolean')throw Error('closed must be boolean');s.closed=args.closed;break;
 case 'return':if(typeof args.open!=='boolean')throw Error('open must be boolean');s.fault=args.open?'open-return':'none';break;
 case 'com':off();if(typeof args.connected!=='boolean')throw Error('connected must be boolean');s.meter.blackConnected=args.connected;break;
 case 'hold':if(typeof args.on!=='boolean')throw Error('on must be boolean');s.meter.hold=args.on;s.meter.held=args.on&&args.reading?.code==='reading'?structuredClone(args.reading):null;break;
 case 'backlight':if(typeof args.on!=='boolean')throw Error('on must be boolean');s.meter.backlight=args.on;break;
 case 'reset':off();if(s.probeTargets.red||s.probeTargets.black)throw Error('Lossa båda proberna före återställning.');s.protection=false;s.meter.fuseMA=false;s.meter.fuseA=false;break;
 default:throw Error('Unknown multimeter action');}
 const observation=applyDMMProtection(s);return {state:s,observation};}
export function readDMM(input){const s=structuredClone(input);let observation=applyDMMProtection(s);if(s.meter.hold&&s.meter.held&&observation.code==='reading')observation={...s.meter.held,detail:'HOLD · sparad avläsning. '+s.meter.held.detail};else if(s.meter.hold&&observation.code==='reading')s.meter.held=structuredClone(observation);return {state:s,observation};}
