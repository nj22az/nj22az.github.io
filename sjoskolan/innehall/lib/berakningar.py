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
