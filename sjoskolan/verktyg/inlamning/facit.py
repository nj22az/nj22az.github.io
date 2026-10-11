#!/usr/bin/env python3
"""Skriver nyckeln till en självrättande inlämning: saltade SHA-256-hashar av de godkända svaren.

    python3 sjoskolan/verktyg/inlamning/facit.py 42 --svar /utanför/repot/facit-v42.json
    python3 sjoskolan/innehall/innehall.py bygg inlamning      # sidan läser nyckelns version

Klartexten ligger i en fil UTANFÖR repot och checkas aldrig in (skriptet vägrar läsa en fil i repot). Format:

    {"falt": {"<fält-id>": "<svar>", ...}}        till exempel {"falt": {"xa": "12,5", "xb": "250/3", "xc": "2"}}

Exemplet är påhittat. Ett tal skrivs som decimaltal eller som kvot (a/b, exakt). Ett val skrivs som alternativets id i
verktyg/inlamning/sjalvrattning.py, eller som en lista med id när läraren godkänner flera alternativ (["1", "2"]); alla
alternativ kan inte vara rätt. Alla fält som rättas ska ha ett svar, inga andra.

Nyckeln (vecka-XX/aktuell/inlamning-nyckel.mjs) innehåller för varje fält de första 16 hextecknen av
sha256("salt|fält|svar"). Svar är "v:<id>" för ett val och "t<dec>:<k>" för ett tal, där k = talet · 10^dec avrundat.
Ett tal godkänns inom fältets tolerans, normalt 2 % (regel 6): nyckeln har hashen för varje k i intervallet. Ett fält
med tolerans 0 (sannolikhetsgraden i läsförståelsen) godkänner bara exakt rätt tal. gemensamt/sjalvrattning.mjs räknar
likadant. Saltet behålls mellan körningarna (--ny-salt byter det).

Hasharna håller svaren borta från den som läser sidans källkod, men det är inget säkert skydd: den som vill kan pröva
alla alternativ och alla tal. Därför har varje fråga tre försök per omgång. Nyckeln anger också postens revision;
testet vecka-XX/aktuell/inlamning.test.mjs stoppar när en post har ändrats efter att nyckeln skrevs.
"""
import argparse
import hashlib
import json
import math
import re
import secrets
import sys
from decimal import Decimal
from fractions import Fraction
from pathlib import Path

HAR = Path(__file__).resolve().parent
SJO = HAR.parents[1]
REPO = SJO.parent
sys.path.insert(0, str(HAR))
import sjalvrattning as S  # noqa: E402

HEX = 16


def hashsvar(salt, falt, kanon):
    return hashlib.sha256(f'{salt}|{falt}|{kanon}'.encode('utf-8')).hexdigest()[:HEX]


def exakt(text):
    """'12.5', '12,5' eller '250/3' som exakt bråk."""
    t = str(text).strip().replace(',', '.').replace(' ', '')
    if '/' in t:
        a, b = t.split('/', 1)
        return Fraction(Decimal(a)) / Fraction(Decimal(b))
    return Fraction(Decimal(t))


def talintervall(varde, dec, tolerans=2):
    """Alla k = x · 10^dec (heltal) där x ligger inom tolerans % från varde."""
    v, t = exakt(varde), Fraction(tolerans, 100)
    if v <= 0:
        raise SystemExit(f'talet {varde} måste vara positivt')
    skala = 10 ** dec
    ks = range(math.ceil(v * (1 - t) * skala), math.floor(v * (1 + t) * skala) + 1)
    if not ks:
        raise SystemExit(f'talet {varde} går inte att skriva med {dec} decimaler')
    return ks


def nyckel(nr, svar, salt):
    falt = S.rattade_falt(nr)
    saknas, okanda = sorted(set(falt) - set(svar)), sorted(set(svar) - set(falt))
    if saknas or okanda:
        raise SystemExit(f'klartexten stämmer inte med fälten i sjalvrattning.py: saknas {saknas or "inga"}, okända {okanda or "inga"}')
    ut = {}
    for i, f in sorted(falt.items()):
        if f['typ'] == 'val':
            ids = [v for v, _ in f['alternativ']]
            godkanda = [str(x).strip() for x in (svar[i] if isinstance(svar[i], list) else [svar[i]])]
            for x in godkanda:
                if x not in ids:
                    raise SystemExit(f'{i}: ”{x}” är inget alternativ (id {", ".join(ids)})')
            if not godkanda or len(set(godkanda)) != len(godkanda):
                raise SystemExit(f'{i}: ange minst ett godkänt alternativ och inget två gånger')
            if len(godkanda) >= len(ids):
                raise SystemExit(f'{i}: alla alternativ kan inte vara rätt')
            ut[i] = {'typ': 'val', 'h': sorted(hashsvar(salt, i, f'v:{x}') for x in godkanda)}
        else:
            if isinstance(svar[i], list):
                raise SystemExit(f'{i}: ett tal har ett svar, ingen lista')
            s = str(svar[i]).strip()
            ks = talintervall(s, f['dec'], f['tolerans'])
            if f.get('heltal') and not all(f['heltal'][0] <= k <= f['heltal'][1] for k in ks):
                raise SystemExit(f'{i}: svaret ligger utanför {f["heltal"][0]}–{f["heltal"][1]}')
            ut[i] = {'typ': 'tal', 'dec': f['dec'], 'h': sorted(hashsvar(salt, i, f't{f["dec"]}:{k}') for k in ks)}
    return ut


def revisioner(nr):
    return {o: S.post(o)['revision'] for o in sorted(S.FORMULAR[nr])}


def skriv(nr, falt, salt, ut):
    data = {'version': 1, 'vecka': nr, 'salt': salt, 'poster': revisioner(nr), 'falt': falt}
    rader = ',\n'.join(f'    {json.dumps(k)}: {json.dumps(v, ensure_ascii=False, separators=(",", ":"))}' for k, v in data['falt'].items())
    huvud = ',\n'.join(f'  {json.dumps(k)}: {json.dumps(v, ensure_ascii=False)}' for k, v in data.items() if k != 'falt')
    text = ('// GENERERAD FIL av sjoskolan/verktyg/inlamning/facit.py, redigera inte. Nyckel till den självrättande inlämningen:\n'
            '// godkända svar som saltade SHA-256-hashar (tal inom 2 %). Inga svar i klartext; klartexten finns utanför repot.\n'
            '// Inget säkert skydd (alla alternativ går att pröva), därför ser läraren första svar och antal försök.\n'
            f'export const NYCKEL = {{\n{huvud},\n  "falt": {{\n{rader}\n  }}\n}};\n')
    ut.write_text(text, encoding='utf-8')


def befintligt_salt(fil):
    if fil.exists():
        m = re.search(r'"salt": "([0-9a-f]+)"', fil.read_text(encoding='utf-8'))
        if m:
            return m.group(1)
    return None


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('vecka', type=int)
    ap.add_argument('--svar', required=True, help='klartextfilen (JSON) utanför repot')
    ap.add_argument('--ut', help='nyckelfilen (standard: vecka-XX/aktuell/inlamning-nyckel.mjs)')
    ap.add_argument('--ny-salt', action='store_true', help='byt saltet')
    ap.add_argument('--salt', help='använd detta salt (hex), till exempel i tester')
    a = ap.parse_args()
    if a.vecka not in S.FORMULAR:
        raise SystemExit(f'vecka {a.vecka} har inga svarsfält i sjalvrattning.py')
    svarsfil = Path(a.svar).resolve()
    if svarsfil.is_relative_to(REPO):
        raise SystemExit(f'{svarsfil} ligger i repot. Lägg klartexten utanför repot så att svaren aldrig checkas in.')
    svar = json.loads(svarsfil.read_text(encoding='utf-8'))['falt']
    ut = Path(a.ut).resolve() if a.ut else SJO / f'vecka-{a.vecka}' / 'aktuell' / 'inlamning-nyckel.mjs'
    salt = a.salt or (None if a.ny_salt else befintligt_salt(ut)) or secrets.token_hex(16)
    if not re.fullmatch(r'[0-9a-f]{8,64}', salt):
        raise SystemExit('saltet ska vara 8–64 hextecken')
    falt = nyckel(a.vecka, svar, salt)
    skriv(a.vecka, falt, salt, ut)
    antal = sum(len(f['h']) for f in falt.values())
    print(f'skrev {ut.relative_to(REPO) if ut.is_relative_to(REPO) else ut}: {len(falt)} fält, {antal} hashar')
    if not a.ut:
        print('Kör nu: python3 sjoskolan/innehall/innehall.py bygg inlamning')


if __name__ == '__main__':
    main()
