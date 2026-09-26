// Multimeterlabbet · registrerade kontrollfunktioner. Övningarna (uppgifter.gen.mjs) refererar till dem med id.
// Funktionerna tar (tillstånd, mätarvisning) och returnerar sant när steget är klart. Ändras bara här.
import { rigOf } from './model.mjs';
const loadingReading=(input,expected)=>(s,m)=>s.circuit==='divider'&&s.mode==='dc'&&s.jack==='v'&&s.power&&!s.trip&&s.input===input&&
  ['M','G'].includes(s.red)&&['M','G'].includes(s.black)&&s.red!==s.black&&m.code==='reading'&&m.unit==='V ⎓'&&Math.abs(Math.abs(m.value)-expected)<.01;

const pairIs=(s,a,b)=>[s.red,s.black].sort().join()===[a,b].sort().join();
// Stationsmätaren har små fel inom specifikationen, så avläsningen jämförs med en marginal (1 % + 0,02).
const near=(m,v)=>m.code==='reading'&&Math.abs(m.value-v)<=.01*Math.abs(v)+.02;
const rigI=s=>{const g=rigOf(s);return g.U/(g.R1+g.R2);};
const stationV=(red,black,value)=>(s,m)=>s.circuit==='station'&&s.mode==='dc'&&s.jack==='v'&&s.power&&s.link&&s.red===red&&s.black===black&&near(m,value(s));
const deadR=(a,b,value)=>(s,m)=>s.circuit==='station'&&s.mode==='ohm'&&!s.power&&!s.link&&pairIs(s,a,b)&&near(m,value(s)/1000);

export const FUNKTIONER = {
  'multimetersimulator.voltage.1': (s,m)=>s.mode==='dc'&&s.jack==='v'&&s.red==='P1'&&s.black==='P2'&&s.power&&s.link&&Math.abs(m.value-12)<.01,
  'multimetersimulator.polarity.1': (s,m)=>s.mode==='dc'&&s.jack==='v'&&s.red==='P2'&&s.black==='P1'&&s.power&&Math.abs(m.value+12)<.01,
  'multimetersimulator.current.1': (s,m)=>s.mode==='current'&&s.jack==='a'&&!s.link&&s.red==='K1'&&s.black==='K2'&&s.power&&m.value>.099&&m.value<.101,
  'multimetersimulator.current.2': s=>!s.power&&!s.red&&!s.black&&s.jack==='v',
  'multimetersimulator.resistance.1': (s,m)=>s.mode==='ohm'&&s.jack==='v'&&s.red!==s.black&&Math.abs(m.value-1)<.001&&!s.parallel,
  'multimetersimulator.parallel.1': (s,m)=>s.mode==='ohm'&&s.parallel&&m.value===500,
  'multimetersimulator.parallel.2': (s,m)=>s.mode==='ohm'&&!s.parallel&&m.value===1,
  'multimetersimulator.continuity.1': (s,m)=>s.mode==='continuity'&&!s.broken&&m.beep&&s.red!==s.black,
  'multimetersimulator.continuity.2': (s,m)=>s.mode==='continuity'&&s.broken&&s.red!==s.black&&m.code==='open',
  'multimetersimulator.loading.3': loadingReading(10e6, 100 / 21),
  'multimetersimulator.loading.5': loadingReading(1e6, 10 / 3),
  'multimetersimulator.stationA.1': (s,m)=>s.circuit==='station'&&s.mode==='dc'&&s.jack==='v'&&s.red==='Ref+'&&s.black==='Ref−'&&near(m,5),
  'multimetersimulator.stationA.2': (s,m)=>s.circuit==='station'&&s.mode==='dc'&&s.jack==='v'&&!s.power&&!s.link&&pairIs(s,'A','B')&&m.code==='reading'&&Math.abs(m.value)<.01,
  'multimetersimulator.stationA.3': deadR('A', 'B', (s) => rigOf(s).R1),
  'multimetersimulator.stationA.4': deadR('B', 'N', (s) => rigOf(s).R2),
  'multimetersimulator.stationA.5': stationV('P', 'N', (s) => rigOf(s).U),
  'multimetersimulator.stationA.6': stationV('A', 'B', (s) => rigI(s) * rigOf(s).R1),
  'multimetersimulator.stationA.7': stationV('B', 'N', (s) => rigI(s) * rigOf(s).R2),
  'multimetersimulator.stationA.8': (s,m)=>s.circuit==='station'&&s.mode==='current'&&s.jack==='ma'&&!s.link&&s.power&&s.red==='P'&&s.black==='A'&&near(m,rigI(s)*1000),
  'multimetersimulator.stationA.9': (s,m)=>s.circuit==='station'&&!s.power&&s.link&&s.jack==='v'&&s.mode==='dc'&&s.red==='Ref+'&&s.black==='Ref−'&&near(m,5),
};
