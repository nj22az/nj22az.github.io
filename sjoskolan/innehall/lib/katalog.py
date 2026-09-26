"""Innehållskatalogen: läser de redigerbara källorna, slår ihop skyddade fält och kontrollerar allt.

Redigerbara källor (inget annat får redigeras):
    ovningar/EL-xxxxxx.json   publika delar av varje övning
    skyddat/larare.enc        lärarfält och lärarposter (krypterad, LARARLOSEN)
    skyddat/bok.enc           bokens lösningar, figurer och egna övningar (krypterad, BOKLOSEN)
    placeringar/*.json        var övningarna visas, ordning, nummer och alias
    teori.json                lärandemål och teoriavsnitt

id-register.json är katalogens förteckning över alla id (även skyddade), deras revision och innehållshash.
Det uppdateras av `innehall.py revidera` och får inte redigeras för hand.
"""
import copy
import hashlib
import json
import os
import re
from pathlib import Path

from validering import Validerare
import text as T

ROT = Path(__file__).resolve().parents[1]
SJO = ROT.parent
SCHEMA_VERSION = 1
SKYDD = {'larare': 'LARARLOSEN', 'bok': 'BOKLOSEN'}
ARBETSKOPIA = ROT / '.skyddat'  # dekrypterade arbetskopior (gitignore)

# Fält som alltid lagras i den skyddade filen, även när resten av posten är publik.
SKYDDADE_FALT = {
    'larare': [('larare',)],
    'bok': [('losning', 'steg'), ('losning', 'svarstext'), ('losning', 'kontroll'), ('bok',)],
}


def kanonisk(obj):
    return json.dumps(obj, ensure_ascii=False, sort_keys=True, separators=(',', ':'))


def hash_av(obj):
    return hashlib.sha256(kanonisk(obj).encode()).hexdigest()[:16]


def djup_merge(a, b):
    """b ovanpå a. Objekt slås ihop, allt annat ersätts."""
    ut = copy.deepcopy(a)
    for k, v in b.items():
        ut[k] = djup_merge(ut[k], v) if isinstance(v, dict) and isinstance(ut.get(k), dict) else copy.deepcopy(v)
    return ut


def dela_skyddat(post):
    """Delar en fullständig post i (publik del eller None, {skydd: del}). Motsatsen till djup_merge."""
    publik = post['referenser']['publik']
    if publik in SKYDD:
        return None, {publik: copy.deepcopy(post)}
    pub, skyddat = copy.deepcopy(post), {}
    for skydd, vagar in SKYDDADE_FALT.items():
        for vag in vagar:
            x = pub
            for k in vag[:-1]:
                x = x.get(k) if isinstance(x, dict) else None
            if isinstance(x, dict) and vag[-1] in x:
                d = skyddat.setdefault(skydd, {})
                for k in vag[:-1]:
                    d = d.setdefault(k, {})
                d[vag[-1]] = x.pop(vag[-1])
    return pub, skyddat


class Katalogfel(Exception):
    pass


class Katalog:
    def __init__(self, rot=ROT, skydd=None):
        """skydd: vilka skyddade filer som ska läsas ('larare', 'bok'). None = de vars lösenord finns i miljön."""
        self.rot = Path(rot)
        self.schema = Validerare.fran_fil(self.rot / 'schema' / 'ovning.schema.json')
        self.pschema = Validerare.fran_fil(self.rot / 'schema' / 'placering.schema.json')
        self.tschema = Validerare.fran_fil(self.rot / 'schema' / 'teori.schema.json')
        self.fel, self.varningar = [], []
        self.register = json.loads((self.rot / 'id-register.json').read_text(encoding='utf-8')) if (self.rot / 'id-register.json').exists() else {'poster': {}}
        self.publika = {}
        for f in sorted((self.rot / 'ovningar').glob('EL-*.json')):
            p = json.loads(f.read_text(encoding='utf-8'))
            if p.get('id') != f.stem:
                self.fel.append(f'{f.name}: id {p.get("id")} stämmer inte med filnamnet')
            self.publika[f.stem] = p
        self.skyddat = {}
        oppna = [s for s in SKYDD if os.environ.get(SKYDD[s])] if skydd is None else list(skydd)
        for s in oppna:
            self.skyddat[s] = self.las_skyddat(s)
        self.teori = json.loads((self.rot / 'teori.json').read_text(encoding='utf-8'))
        self.ytor = {}
        for f in sorted((self.rot / 'placeringar').glob('*.json')):
            self.ytor[f.stem] = json.loads(f.read_text(encoding='utf-8'))
        self.poster = self._sla_ihop()

    # ------------------------------------------------------------------ skyddade filer
    def las_skyddat(self, skydd):
        ark = ARBETSKOPIA / f'{skydd}.json'
        if ark.exists():
            return json.loads(ark.read_text(encoding='utf-8'))
        enc = self.rot / 'skyddat' / f'{skydd}.enc'
        if not enc.exists():
            return {'format': 1, 'skydd': skydd, 'poster': {}, 'falt': {}}
        losen = os.environ.get(SKYDD[skydd])
        if not losen:
            raise Katalogfel(f'{SKYDD[skydd]} saknas för {enc.name}')
        import krypto
        return json.loads(krypto.dekryptera(enc, losen))

    @property
    def fullstandig(self):
        return set(self.skyddat) == set(SKYDD)

    def _sla_ihop(self):
        poster = {}
        for i, p in self.publika.items():
            poster[i] = p
        for s, d in self.skyddat.items():
            for i, p in d.get('poster', {}).items():
                if i in poster:
                    self.fel.append(f'{i}: finns både som publik post och i {s}.enc')
                poster[i] = p
            for i, falt in d.get('falt', {}).items():
                if i not in poster:
                    self.fel.append(f'{s}.enc: fält för okänd post {i}')
                    continue
                poster[i] = djup_merge(poster[i], falt)
        return dict(sorted(poster.items()))

    # ------------------------------------------------------------------ kontroller
    def kontrollera(self):
        """Fyller self.fel och self.varningar. Returnerar True om inga fel hittades."""
        reg = self.register['poster']
        kanda_id = set(reg) | set(self.poster)
        for i, p in self.poster.items():
            for f in self.schema.fel(p):
                self.fel.append(f'{i}: {f}')
            publik = p.get('referenser', {}).get('publik')
            if i in self.publika and publik in SKYDD:
                self.fel.append(f'{i}: publik={publik} men posten ligger i ovningar/ (ska ligga i skyddat/{publik}.enc)')
            if i in self.publika:
                _, skyddat = dela_skyddat(p)
                for s in skyddat:
                    if s not in self.skyddat or i not in self.skyddat[s].get('falt', {}):
                        self.fel.append(f'{i}: skyddade {s}-fält ligger i den publika filen')
            for vag, t in _texter(p):
                for f in T.kontrollera(t):
                    self.fel.append(f'{i}: {vag}: {f}')
            for k in ('fysisk_variant', 'simulerad_variant'):
                v = (p.get('labb') or {}).get(k)
                if v and v not in kanda_id:
                    self.fel.append(f'{i}: labb.{k} pekar på okänd post {v}')
            for t in p.get('larande', {}).get('teori', []):
                if t not in self.teori['teori']:
                    self.fel.append(f'{i}: okänd teori {t}')
            for m in p.get('larande', {}).get('mal', []):
                if m not in self.teori['mal']:
                    self.fel.append(f'{i}: okänt lärandemål {m}')
            if p.get('granskning', {}).get('status') in ('utkast', 'att-granska'):
                self.varningar.append(f'{i}: status {p["granskning"]["status"]}' + (f' ({p["granskning"].get("kommentar")})' if p['granskning'].get('kommentar') else ''))
            # Revision: ändrat innehåll kräver höjd revision.
            r = reg.get(i)
            if r is None:
                self.fel.append(f'{i}: saknas i id-register.json (kör innehall.py revidera {i})')
            else:
                if r.get('revision') != p.get('revision'):
                    self.fel.append(f'{i}: revision {p.get("revision")} men id-registret har {r.get("revision")} (kör innehall.py revidera {i})')
                if i in self.publika and r.get('hash_publik') != hash_av(self.publika[i]):
                    self.fel.append(f'{i}: innehållet har ändrats utan att revisionen höjts (kör innehall.py revidera {i})')
                if self.fullstandig and r.get('hash') != hash_av(p):
                    self.fel.append(f'{i}: det skyddade innehållet har ändrats utan att revisionen höjts (kör innehall.py revidera {i})')
        for i, r in reg.items():
            if i not in self.poster:
                if r.get('skydd') in self.skyddat or r.get('skydd') == 'elev':
                    self.fel.append(f'{i}: finns i id-registret men posten saknas')
        if not self.fullstandig:
            saknas = [s for s in SKYDD if s not in self.skyddat]
            self.varningar.append(f'skyddade filer inte öppnade ({", ".join(saknas)}): de fälten kontrolleras inte')
        for f in self.tschema.fel(self.teori):
            self.fel.append(f'teori.json: {f}')
        alias = {}
        for namn, y in self.ytor.items():
            for f in self.pschema.fel(y):
                self.fel.append(f'placeringar/{namn}.json: {f}')
            if y.get('yta') != namn:
                self.fel.append(f'placeringar/{namn}.json: yta ska vara {namn}')
            sett = set()
            for pl in y.get('placeringar', []):
                i = pl.get('ovning')
                if i not in kanda_id:
                    self.fel.append(f'placeringar/{namn}.json: okänd övning {i}')
                    continue
                skydd = reg.get(i, {}).get('skydd') or self.poster.get(i, {}).get('referenser', {}).get('publik')
                if y['publik'] == 'elev' and skydd != 'elev':
                    self.fel.append(f'placeringar/{namn}.json: {i} har publik {skydd} men ytan är öppen för elever')
                nyckel = (pl.get('plats'), pl.get('del'), pl.get('ordning'), pl.get('roll'))
                if nyckel in sett:
                    self.fel.append(f'placeringar/{namn}.json: dubbel ordning {nyckel}')
                sett.add(nyckel)
                for a in pl.get('alias', []) + ([pl['ankare']] if pl.get('ankare') else []):
                    k = (namn, pl['plats'], a)  # ankare och alias är unika per fil
                    if alias.get(k, i) != i:
                        self.fel.append(f'alias {a} på {namn} pekar på både {alias[k]} och {i}')
                    alias[k] = i
        self.berakningar_kontroll()
        return not self.fel

    def berakningar_kontroll(self):
        import berakningar
        labbfn = berakningar.labbfunktioner()
        if labbfn is None:
            self.varningar.append('labbarnas funktioner.mjs kunde inte läsas (saknas uppgifter.gen.mjs? kör innehall.py bygg simulatorer); labbfunktioner kontrolleras inte')
            labbfn = None
        for i, p in self.poster.items():
            param = {k: v['varde'] for k, v in (p.get('parametrar') or {}).items()}
            for s in (p.get('losning') or {}).get('svar', []):
                if not s.get('berakning'):
                    continue
                fn = berakningar.REGISTER.get(s['berakning'])
                if fn is None:
                    self.fel.append(f'{i}: okänd beräkningsfunktion {s["berakning"]}')
                    continue
                try:
                    v = fn(param)
                except Exception as e:  # noqa: BLE001
                    self.fel.append(f'{i}: {s["berakning"]} kunde inte räknas: {e}')
                    continue
                tol = s.get('tolerans') or {'rel': 0.01}
                if isinstance(s.get('varde'), (int, float)) and not berakningar.inom(v, s['varde'], tol):
                    self.fel.append(f'{i}: {s["storhet"]} = {s["varde"]} men {s["berakning"]} ger {v:.6g}')
            sim = p.get('simulator') or {}
            fnid = (sim.get('validering') or {}).get('funktion')
            if fnid and labbfn is not None and fnid not in labbfn:
                self.fel.append(f'{i}: okänd labbfunktion {fnid}')
            for st in (p.get('labb') or {}).get('steg', []):
                k = (st.get('kod') or {}).get('test')
                if k and labbfn is not None and k not in labbfn:
                    self.fel.append(f'{i}: steg {st["id"]}: okänd labbfunktion {k}')

    # ------------------------------------------------------------------ hjälp
    def fingeravtryck(self, bara_publikt=False):
        data = {'schema': SCHEMA_VERSION, 'poster': self.publika if bara_publikt else self.poster, 'ytor': self.ytor, 'teori': self.teori}
        return hash_av(data)

    def anvands(self, id_):
        return [(namn, pl) for namn, y in self.ytor.items() for pl in y['placeringar'] if pl['ovning'] == id_]

    def hitta(self, nyckel):
        """Id, alias eller ankare -> lista med (id, yta)."""
        if re.fullmatch(r'EL-\d{6}', nyckel):
            return [(nyckel, None)]
        return sorted({(pl['ovning'], namn) for namn, y in self.ytor.items() for pl in y['placeringar']
                       if nyckel == pl.get('ankare') or nyckel in pl.get('alias', [])})


def _texter(obj, vag=''):
    if isinstance(obj, str):
        yield vag, obj
    elif isinstance(obj, dict):
        for k, v in obj.items():
            yield from _texter(v, f'{vag}.{k}' if vag else k)
    elif isinstance(obj, list):
        for n, v in enumerate(obj):
            yield from _texter(v, f'{vag}[{n}]')
