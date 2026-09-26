"""Registrerade beräkningsfunktioner.

Poster refererar till funktionerna med id (svar[].berakning, larare.facit_funktion). Innehållet innehåller aldrig kod.
Funktionerna räknar oberoende av simulatorernas JavaScript-modeller, så att facit och modeller kan jämföras.
Varje funktion tar parametrarna som en dict och returnerar ett tal.

Labbfunktioner (JavaScript) registreras i respektive labbs funktioner.mjs och listas med labbfunktioner().
"""
import cmath
import functools
import json
import math
import subprocess
from pathlib import Path

SJO = Path(__file__).resolve().parents[2]
R3 = math.sqrt(3)
REGISTER = {}


def registrera(namn):
    def dek(fn):
        if namn in REGISTER:
            raise ValueError(f'dubbelregistrerad beräkning {namn}')
        REGISTER[namn] = fn
        return fn
    return dek


def inom(v, facit, tol):
    gr = max(tol.get('abs', 0), tol.get('rel', 0) * abs(facit))
    return abs(v - facit) <= gr + 1e-12


# ---------------------------------------------------------------- likström
registrera('ohm.strom')(lambda p: p['U'] / p['R'])
registrera('ohm.spanning')(lambda p: p['R'] * p['I'])
registrera('ohm.resistans')(lambda p: p['U'] / p['I'])
registrera('effekt.ui')(lambda p: p['U'] * p['I'])
registrera('effekt.u2r')(lambda p: p['U'] ** 2 / p['R'])
registrera('effekt.i2r')(lambda p: p['I'] ** 2 * p['R'])
registrera('energi.wh')(lambda p: p['P'] * p['t_h'])
registrera('parallell.resistans')(lambda p: 1 / sum(1 / r for r in p['R']))
registrera('serie.resistans')(lambda p: sum(p['R']))
registrera('spanningsdelare.u2')(lambda p: p['U'] * p['R2'] / (p['R1'] + p['R2']))
registrera('ledare.resistans')(lambda p: p['rho'] * p['l'] / p['A'])
registrera('ledare.slingresistans')(lambda p: p['rho'] * 2 * p['l'] / p['A'])
registrera('verkningsgrad.pin')(lambda p: p['P_ut'] / p['eta'])
registrera('matosakerhet.grans')(lambda p: p['rel'] * p['U'] + p['siffror'] * p['upplosning'])

# ---------------------------------------------------------------- växelström
registrera('ac.period_ms')(lambda p: 1000 / p['f'])
registrera('ac.topp')(lambda p: math.sqrt(2) * p['U'])
registrera('ac.momentan')(lambda p: math.sqrt(2) * p['U'] * math.sin(2 * math.pi * p['f'] * p['t']))
registrera('ac.fas_grader')(lambda p: 360 * p['dt'] * p['f'])
registrera('ac.xl')(lambda p: 2 * math.pi * p['f'] * p['L'])
registrera('ac.xc')(lambda p: 1 / (2 * math.pi * p['f'] * p['C']))
registrera('ac.z_serie')(lambda p: math.hypot(p['R'], p.get('XL', 0) - p.get('XC', 0)))
registrera('ac.strom_serie')(lambda p: p['U'] / math.hypot(p['R'], p.get('XL', 0) - p.get('XC', 0)))
registrera('ac.fasvinkel_grader')(lambda p: math.degrees(math.atan2(p.get('XL', 0) - p.get('XC', 0), p['R'])))
registrera('ac.resonans')(lambda p: 1 / (2 * math.pi * math.sqrt(p['L'] * p['C'])))
registrera('ac.skenbar')(lambda p: p['P'] / p['PF'])
registrera('ac.reaktiv')(lambda p: math.sqrt((p['P'] / p['PF']) ** 2 - p['P'] ** 2))
registrera('ac.strom_pf')(lambda p: p['P'] / (p['U'] * p['PF']))
registrera('ac.kompensering')(lambda p: p['P'] * (math.tan(math.acos(p['PF'])) - math.tan(math.acos(p.get('PF_mal', 1)))))

# ---------------------------------------------------------------- trefas
registrera('trefas.fasspanning')(lambda p: p['UL'] / R3)
registrera('trefas.linjespanning')(lambda p: p['UF'] * R3)
registrera('trefas.effekt')(lambda p: R3 * p['UL'] * p['IL'] * p.get('PF', 1))
registrera('trefas.effekt_kw')(lambda p: R3 * p['UL'] * p['IL'] * p.get('PF', 1) / 1000)
registrera('trefas.linjestrom_y')(lambda p: p['UL'] / R3 / p['Z'])
registrera('trefas.linjestrom_d')(lambda p: R3 * p['UL'] / p['Z'])
registrera('trefas.linjestrom_effekt')(lambda p: p['P'] / (R3 * p['UL'] * p.get('PF', 1)))


@registrera('trefas.neutralstrom')
def _neutral(p):
    a = cmath.exp(-2j * math.pi / 3)
    return abs(p['I1'] + p['I2'] * a + p['I3'] * a * a)


@registrera('trefas.bruten_neutral_u')
def _bruten(p):
    """Två laster i serie över linjespänningen (neutralledaren bruten, tredje fasen obelastad): spänningen över Rx."""
    return p['UL'] * p['Rx'] / (p['R1'] + p['R2'])


@registrera('trefas.neutral_tva_laster')
def _neutral_tva(p):
    uf = p['UL'] / R3
    return _neutral({'I1': uf / p['R1'], 'I2': uf / p['R2'], 'I3': 0})


# ---------------------------------------------------------------- motor och transformator
registrera('motor.synkronvarv')(lambda p: 120 * p['f'] / p['poler'])
registrera('motor.eftersläpning')(lambda p: (120 * p['f'] / p['poler'] - p['n']) / (120 * p['f'] / p['poler']) * 100)
registrera('transformator.omsattning')(lambda p: p['U1'] / p['U2'])
registrera('transformator.sekundarstrom')(lambda p: p['S'] / p['U2'])

# ---------------------------------------------------------------- IT-nät och isolation
registrera('it.riso')(lambda p: 1 / sum(1 / r for r in p['R']))
registrera('it.kapacitiv_felstrom')(lambda p: 3 * 2 * math.pi * p['f'] * p['C'] * p['UL'] / R3)
registrera('it.andra_felet')(lambda p: p['UL'] / p['Rloop'])
registrera('isolation.provstrom_ma')(lambda p: p['U'] / p['R'] * 1000)

# ---------------------------------------------------------------- hållkrets
registrera('hallkrets.spolstrom_ma')(lambda p: p['U'] / p['R'] * 1000)


@functools.lru_cache(maxsize=1)
def labbfunktioner():
    """Id för alla funktioner som labbarna registrerar i sina funktioner.mjs (körs med Node)."""
    filer = sorted(SJO.glob('*/funktioner.mjs'))
    if not filer:
        return frozenset()
    kod = ';'.join(f"import('{f.as_uri()}').then(m=>Object.keys(m.FUNKTIONER))" for f in filer)
    js = f"Promise.all([{kod.replace(';', ',')}]).then(a=>console.log(JSON.stringify(a.flat())))"
    r = subprocess.run(['node', '--input-type=module', '-e', js], capture_output=True, text=True)
    if r.returncode:
        # Första bygget: labbarnas lessons.mjs importerar uppgifter.gen.mjs som inte finns ännu. Då kan registret inte läsas.
        return None
    return frozenset(json.loads(r.stdout))

# ---------------------------------------------------------------- tillägg för simulatorernas uppgifter
registrera('it.frisk_fas_vid_jordfel')(lambda p: p['UL'])
registrera('it.kapacitiv_felstrom_ma')(lambda p: 3 * 2 * math.pi * p['f'] * p['C'] * p['UL'] / R3 * 1000)
registrera('it.andra_felet_ka')(lambda p: p['UL'] / p['Rloop'] / 1000)
registrera('isolation.resistans_mohm')(lambda p: p['U'] / p['I'] / 1e6)
registrera('spanningsdelare.belastad')(lambda p: p['U'] * (1 / (1 / p['R2'] + 1 / p['Rin'])) / (p['R1'] + 1 / (1 / p['R2'] + 1 / p['Rin'])))
registrera('ac.z_rl')(lambda p: math.hypot(p['R'], 2 * math.pi * p['f'] * p['L']))
registrera('ac.strom_rl')(lambda p: p['U'] / math.hypot(p['R'], 2 * math.pi * p['f'] * p['L']))


# ---------------------------------------------------------------- lärarfacit för inlämningsuppgifterna (elevens tal D)
# Registrerade med id larare.facit_rader[].funktion = 'inlamning.<id>'. Returnerar facittext för ett givet D (1–31).
LARARFACIT = {}


def lararfacit(namn):
    def dek(fn):
        LARARFACIT[f'inlamning.{namn}'] = fn
        return fn
    return dek


def n(v, d=2):
    """Tal i svensk form: decimalkomma och hårt mellanslag som tusentalsavgränsare."""
    return f'{v:,.{d}f}'.replace(',', ' ').replace('.', ',')


UF = 400 / R3
lararfacit('37-1i')(lambda D: f'I = 24/(40 + {D}) = {n(24 / (40 + D), 3)} A')
lararfacit('37-1p')(lambda D: f'P = 24²/{40 + D} = {n(576 / (40 + D), 1)} W')
lararfacit('37-2i')(lambda D: f'IA = 0,400 A, IB = {n(24 / (100 + D), 3)} A, Itot = {n(0.4 + 24 / (100 + D), 3)} A')
lararfacit('37-2p')(lambda D: f'PA = 9,6 W, PB = {n(576 / (100 + D), 2)} W. A lyser starkast (lägre R ger större ström vid samma U).')
lararfacit('38-3v')(lambda D: f'{n(23.5 + D / 100, 2)} V')


@lararfacit('38-3d')
def _f383d(D):
    x = 23.5 + D / 100
    d = 0.008 * x + 0.02
    return f'δ = {n(d, 2)} V, intervall {n(x - d, 2)}–{n(x + d, 2)} V'


@lararfacit('38-3k')
def _f383k(D):
    x = 23.5 + D / 100
    d = 0.008 * x + 0.02
    return 'Ja, hela intervallet ligger inom kravet.' if x - d >= 23.76 and x + d <= 24.24 else 'Nej, intervallet går under 23,76 V. Kravet kan inte intygas.'


lararfacit('39-1e')(lambda D: f'Ljus 1 500 Wh, radar 1 728 Wh, pump {n(24 * (5 + D / 10) * 1.5, 0)} Wh, totalt {n(3228 + 24 * (5 + D / 10) * 1.5, 0)} Wh')
lararfacit('39-1ah')(lambda D: f'{n((3228 + 24 * (5 + D / 10) * 1.5) / 24, 1)} Ah')


@lararfacit('40-1')
def _f401(D):
    U, f = 10 + D, 60 if D % 2 == 0 else 50
    return f'U = {U} V, f = {f} Hz: û = {n(U * math.sqrt(2), 1)} V, Upp = {n(2 * U * math.sqrt(2), 1)} V, T = {n(1000 / f, 2)} ms'


@lararfacit('40-2')
def _f402(D):
    R, X = 20 + D, 2 * math.pi * 50 * 0.1
    Z = math.hypot(R, X)
    return f'R = {R} Ω, X_L = 31,4 Ω, |Z| = {n(Z, 1)} Ω, I = {n(230 / Z, 2)} A, φ = {n(math.degrees(math.atan(X / R)), 1)}°, strömmen släpar'


@lararfacit('40-2b')
def _f402b(D):
    R, X = 20 + D, 2 * math.pi * 100 * 0.1
    Z = math.hypot(R, X)
    return f'X_L = 62,8 Ω, |Z| = {n(Z, 1)} Ω, I = {n(230 / Z, 2)} A (minskar)'


@lararfacit('40-3')
def _f403(D):
    P = 1 + D / 10
    S = P / 0.7
    Q = S * math.sqrt(1 - 0.49)
    return f'P = {n(P, 1)} kW, S = {n(S, 2)} kVA, Q = {n(Q, 2)} kvar, I = {n(S * 1000 / 230, 1)} A'


@lararfacit('40-3b')
def _f403b(D):
    P = 1 + D / 10
    Q = P / 0.7 * math.sqrt(0.51)
    Q2 = P * math.tan(math.acos(0.95))
    I1, I2 = P * 1000 / (230 * 0.7), P * 1000 / (230 * 0.95)
    return f'Qc = {n(Q - Q2, 2)} kvar, ny I = {n(I2, 1)} A, förlusten blir {n((I2 / I1) ** 2 * 100, 0)} % av den tidigare'


@lararfacit('41-1')
def _f411(D):
    I3 = round((5 + D / 5) * 10) / 10
    return f'I3 = {n(I3, 1)} A, IN = |10 − {n(I3, 1)}| = {n(abs(10 - I3), 1)} A'


lararfacit('41-2y')(lambda D: f'R = {20 + D} Ω: Ugren = 231 V, Igren = I_L = {n(UF / (20 + D), 2)} A, P = {n(3 * UF * UF / (20 + D) / 1000, 2)} kW')
lararfacit('41-2d')(lambda D: f'Ugren = 400 V, Igren = {n(400 / (20 + D), 2)} A, I_L = {n(R3 * 400 / (20 + D), 2)} A, P = {n(3 * 160000 / (20 + D) / 1000, 2)} kW')
lararfacit('42-3')(lambda D: f'I = 230/({1000 + 10 * D}) = {n(230000 / (1000 + 10 * D), 0)} mA')
lararfacit('43-1c')(lambda D: f'f = {30 + D} Hz: nₛ = 120 · {30 + D}/4 = {30 * (30 + D)} r/min')


@lararfacit('43-2a')
def _f432a(D):
    k = 3 + D / 5
    return f'Ik = {n(k, 1)} kA: ' + ('räcker (≤ 6 kA)' if k <= 6 else 'räcker inte (> 6 kA) utan dokumenterad backup')


@lararfacit('43-2b')
def _f432b(D):
    m = 10 + D
    return f'IΔ = {m} mA: ' + ('löser (≥ 30 mA)' if m >= 30 else 'kan lösa; ska lösa senast vid 30 mA' if m >= 15 else 'löser inte (under 15 mA)')


@lararfacit('44-3')
def _f443(D):
    P = (1.5 + D / 10) * 1e6
    I = P / (R3 * 6600 * 0.88)
    return f'P = {n(P / 1e6, 1)} MW: I_L = {n(I, 0)} A vid 6,6 kV, {n(I * 15, 0)} A vid 440 V, CT sekundärt {n(I / 200, 2)} A'


@lararfacit('45-2')
def _f452(D):
    u = 20 + D / 100
    return f'Före: (24,1 − {n(u, 2)})/6 = {n((24.1 - u) / 6, 3)} Ω. Efter: (24,1 − 23,5)/6 = 0,100 Ω'
