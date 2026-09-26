// Isolationslabbet · räkna-först-uppgifter. Värdena skiljer sig från övningarna i vecka 44 så att svaren inte kan skrivas av.
import { itNet, insulationTest } from './model.mjs';

export const DEFAULTS = {
  del: 'overvakning', UL: 440, f: 50, R: [5e6, 5e6, 5e6], C: 1e-6, larm: 100e3, Rloop: 0.08,
  obj: 'motor-m3', par: 'L1-PE', Uprov: 500, frans: true,
};

export function expected(ch) {
  const s = { ...DEFAULTS, ...ch.set };
  if (ch.ask.key === 'prov') { const t = insulationTest(s); return ch.ask.unit === 'mA' ? t.I * 1e3 : t.R / 1e6; }
  const r = itNet(s);
  const v = { Riso: r.Riso, Uhull: r.Uhull[ch.ask.phase ?? 0], Ifault: r.Ifault, second: r.second?.I }[ch.ask.key];
  return v / (ch.ask.scale ?? 1);
}

export const CHALLENGES = [
  { id: 'riso', title: 'Vad mäter isolationsövervakningen?', deck: 'v44_03 · övning 4',
    set: { R: [3e6, 3e6, 1.5e6], C: 0 },
    task: 'Isolationsresistansen mot skrovet är 3 MΩ i L1, 3 MΩ i L2 och 1,5 MΩ i L3. Vilket värde visar isolationsövervakningen?',
    ask: { key: 'Riso', label: 'Riso', unit: 'MΩ', scale: 1e6 }, mask: ['net'],
    hint: 'Övervakningen lägger en likspänning mellan nätet och skrovet. Alla tre isolationsvägarna leder då parallellt.',
    solution: '1/Riso = 1/3 + 1/3 + 1/1,5 = 4/3. Riso = 0,75 MΩ. Den sämsta fasen drar ned hela nätets värde.',
    mistakes: [{ v: 1.5, msg: 'Övervakningen ser inte bara den sämsta fasen. Vägarna ligger parallellt.' }, { v: 7.5, msg: 'Parallella resistanser adderas inte. Använd 1/R = 1/R₁ + 1/R₂ + 1/R₃.' }] },
  { id: 'larm', title: 'Larmar övervakningen?', deck: 'v44_01 · övning 3 och 4',
    set: { R: [120e3, 10e6, 10e6], C: 0, larm: 100e3 },
    task: 'Isolationen i L1 har sjunkit till 120 kΩ. L2 och L3 har 10 MΩ. Larmgränsen är 100 kΩ. Beräkna Riso i kΩ. Larmar övervakningen?',
    ask: { key: 'Riso', label: 'Riso', unit: 'kΩ', scale: 1e3 }, mask: ['net'],
    hint: 'Räkna i kΩ: 10 MΩ = 10 000 kΩ. Jämför sedan med larmgränsen.',
    solution: '1/Riso = 1/120 + 2/10 000 kΩ⁻¹. Riso ≈ 118 kΩ. Det är över 100 kΩ, så övervakningen larmar inte ännu, trots att L1 är klart försämrad.',
    mistakes: [{ v: 120, msg: 'Nästan, men L2 och L3 leder också lite. Räkna med alla tre parallellt.' }] },
  { id: 'symmetri', title: 'Fas mot skrov i friskt nät', deck: 'v44_01 · bild om IT-nät',
    set: { R: [10e6, 10e6, 10e6], C: 1e-6 },
    task: 'Nätet är 440 V och friskt: alla faser har samma isolation och kapacitans mot skrovet. Vilken spänning har L1 mot skrovet?',
    ask: { key: 'Uhull', phase: 0, label: 'U(L1–skrov)', unit: 'V' }, mask: ['net'],
    hint: 'När alla faser läcker lika mycket hamnar skrovet i nätets stjärnpunkt.',
    solution: 'Skrovet ligger i stjärnpunkten. U = 440/√3 ≈ 254 V.',
    mistakes: [{ v: 440, msg: '440 V är huvudspänningen. Så högt blir det först vid ett jordfel på en annan fas.' }, { v: 0, msg: 'Ett IT-nät är isolerat, men faserna har ändå spänning mot skrovet via kapacitans och isolation.' }] },
  { id: 'forsta', title: 'Första jordfelet', deck: 'v44_01 · film IT-nätet ombord',
    set: { R: [0, 10e6, 10e6], C: 1e-6 },
    task: 'L1 får ett fullständigt jordfel mot skrovet. Driften fortsätter. Vilken spänning har L2 mot skrovet nu?',
    ask: { key: 'Uhull', phase: 1, label: 'U(L2–skrov)', unit: 'V' }, mask: ['net'],
    hint: 'Skrovet har nu samma potential som L1. Vilken spänning finns mellan L1 och L2?',
    solution: 'Skrovet ligger på L1:s potential. U(L2–skrov) = U(L2–L1) = 440 V. Friska faser får huvudspänning mot skrovet. Instrument och sladdar måste klara det.',
    mistakes: [{ v: 254, msg: 'Det var värdet före felet. Nu ligger skrovet på L1:s potential.' }] },
  { id: 'kapstrom', title: 'Ström i jordfelet', deck: 'v44_01 · film IT-nätet ombord',
    set: { R: [0, 10e6, 10e6], C: 1e-6, f: 50 },
    task: 'Samma fel på L1. Varje fas har 1,0 µF kapacitans mot skrovet (kablar och filter). f = 50 Hz. Hur stor ström går i jordfelet? Svara i mA.',
    ask: { key: 'Ifault', label: 'Ifel', unit: 'mA', scale: 1e-3 }, mask: ['net'],
    hint: 'Strömmen går tillbaka genom de friska fasernas kapacitans. I ≈ 3 · ωC · UF, med ω = 2πf och UF = 440/√3.',
    solution: 'I = 3 · 2π · 50 · 1,0 · 10⁻⁶ · 254 ≈ 0,239 A ≈ 239 mA. Strömmen är för liten för att säkringar ska lösa men tillräckligt stor för att ge stöt och gnistor.',
    mistakes: [{ v: 0, msg: 'Utan kapacitans vore strömmen nästan noll. Men kablarna har kapacitans mot skrovet.' }, { v: 79.8, msg: 'Det är bidraget från en fas. Strömmen kommer tillbaka via båda friska faserna, och resultatet blir tre gånger så stort.' }] },
  { id: 'andra', title: 'Andra jordfelet', deck: 'v44_01 · övning 4',
    set: { R: [0, 0, 10e6], C: 1e-6, Rloop: 0.08 },
    task: 'L1 har kvar sitt jordfel. Nu får L2 också ett fullständigt jordfel. Slingan L1–skrov–L2 har 0,08 Ω. Beräkna felströmmen i kA.',
    ask: { key: 'second', label: 'Ik', unit: 'kA', scale: 1e3 }, mask: ['net'],
    hint: 'Två jordfel på olika faser är en kortslutning mellan faserna via skrovet. Drivande spänning är huvudspänningen.',
    solution: 'I = 440/0,08 = 5 500 A = 5,5 kA. Skydden ska lösa. Därför ska första felet hittas och åtgärdas innan ett andra uppstår.',
    mistakes: [{ v: 3.18, msg: 'Drivande spänning är huvudspänningen mellan L1 och L2, inte fasspänningen.' }] },
  { id: 'prov', title: 'Isolationsprovning: resistans', deck: 'v44_03 · övning 3',
    set: { del: 'prov', obj: 'motor-fukt', par: 'L1-PE', Uprov: 500 },
    task: 'En motor som stått i fukt provas mellan L1 och PE med 500 V. Läckströmmen blir 0,40 mA. Beräkna isolationsresistansen i MΩ.',
    ask: { key: 'prov', label: 'R', unit: 'MΩ' }, mask: ['prov'],
    hint: 'R = Uprov/Iläck. Omvandla mA till A först.',
    solution: 'R = 500/0,00040 = 1 250 000 Ω = 1,25 MΩ. Det klarar en gräns på 1 MΩ med liten marginal. Jämför med samma motor torr.',
    mistakes: [{ v: 1250, msg: 'Svaret ska vara i MΩ. 1 250 kΩ = 1,25 MΩ.' }] },
  { id: 'kabel', title: 'Isolationsprovning: skadad kabel', deck: 'v44_03 · övning 3',
    set: { del: 'prov', obj: 'kabel-skadad', par: 'L2-PE', Uprov: 500 },
    task: 'En kabel med skadad mantel har 50 kΩ mellan L2 och PE. Vilken läckström visar provaren vid 500 V? Svara i mA.',
    ask: { key: 'prov', label: 'Iläck', unit: 'mA' }, mask: ['prov'],
    hint: 'I = Uprov/R. 50 kΩ = 50 000 Ω.',
    solution: 'I = 500/50 000 = 0,010 A = 10 mA. Mycket över det en frisk kabel läcker. L2 ligger långt under en gräns på 1 MΩ.',
    mistakes: [{ v: 0.01, msg: 'Svaret ska vara i mA. 0,01 A = 10 mA.' }] },
];
