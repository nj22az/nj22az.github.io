"""Validering mot JSON Schema (den delmängd som schemafilerna använder) utan externa paket.

Stöd: type, const, enum, pattern, minLength, minimum, required, properties, additionalProperties,
items, minItems, $ref till #/$defs, allOf, if/then och tillägget anyRequired (minst ett av fälten).
Okända nyckelord ger fel, så att schemat inte tyst använder något som inte kontrolleras.
"""
import json
import re
from pathlib import Path

KANDA = {'$schema', '$id', 'title', 'description', 'type', 'const', 'enum', 'pattern', 'minLength', 'minimum', 'required',
         'properties', 'additionalProperties', 'items', 'minItems', '$ref', 'allOf', 'if', 'then', 'anyRequired', '$defs', 'maxItems'}
TYPER = {'object': dict, 'array': list, 'string': str, 'boolean': bool}


def _typ_ok(v, t):
    if t == 'integer':
        return isinstance(v, int) and not isinstance(v, bool)
    if t == 'number':
        return isinstance(v, (int, float)) and not isinstance(v, bool)
    if t == 'null':
        return v is None
    return isinstance(v, TYPER[t])


class Validerare:
    def __init__(self, schema):
        self.rot = schema
        self._kolla_nyckelord(schema, '#')

    @classmethod
    def fran_fil(cls, fil):
        return cls(json.loads(Path(fil).read_text(encoding='utf-8')))

    def _kolla_nyckelord(self, s, vag):
        if not isinstance(s, dict):
            return
        okanda = set(s) - KANDA
        if okanda:
            raise ValueError(f'schemat använder okända nyckelord vid {vag}: {sorted(okanda)}')
        for k in ('properties', '$defs'):
            for n, d in s.get(k, {}).items():
                self._kolla_nyckelord(d, f'{vag}/{k}/{n}')
        for k in ('items', 'additionalProperties', 'if', 'then'):
            if isinstance(s.get(k), dict):
                self._kolla_nyckelord(s[k], f'{vag}/{k}')
        for i, d in enumerate(s.get('allOf', [])):
            self._kolla_nyckelord(d, f'{vag}/allOf/{i}')

    def _ref(self, ref):
        if not ref.startswith('#/$defs/'):
            raise ValueError(f'bara lokala $ref stöds: {ref}')
        return self.rot['$defs'][ref.split('/')[-1]]

    def fel(self, v, s=None, vag='$'):
        """Returnerar en lista med felbeskrivningar (tom lista = giltig)."""
        s = self.rot if s is None else s
        if '$ref' in s:
            return self.fel(v, self._ref(s['$ref']), vag)
        f = []
        if 'type' in s:
            typer = s['type'] if isinstance(s['type'], list) else [s['type']]
            if not any(_typ_ok(v, t) for t in typer):
                return [f'{vag}: ska vara {"/".join(typer)}, är {type(v).__name__}']
        if 'const' in s and v != s['const']:
            f.append(f'{vag}: ska vara {s["const"]!r}')
        if 'enum' in s and v not in s['enum']:
            f.append(f'{vag}: {v!r} är inte ett av {s["enum"]}')
        if isinstance(v, str):
            if 'minLength' in s and len(v) < s['minLength']:
                f.append(f'{vag}: för kort text')
            if 'pattern' in s and not re.search(s['pattern'], v):
                f.append(f'{vag}: {v!r} följer inte mönstret {s["pattern"]}')
        if isinstance(v, (int, float)) and not isinstance(v, bool) and 'minimum' in s and v < s['minimum']:
            f.append(f'{vag}: mindre än {s["minimum"]}')
        if isinstance(v, list):
            if 'minItems' in s and len(v) < s['minItems']:
                f.append(f'{vag}: minst {s["minItems"]} element')
            if 'maxItems' in s and len(v) > s['maxItems']:
                f.append(f'{vag}: högst {s["maxItems"]} element')
            if 'items' in s:
                for i, x in enumerate(v):
                    f += self.fel(x, s['items'], f'{vag}[{i}]')
        if isinstance(v, dict):
            for k in s.get('required', []):
                if k not in v:
                    f.append(f'{vag}: saknar {k}')
            if 'anyRequired' in s and not any(k in v for k in s['anyRequired']):
                f.append(f'{vag}: kräver något av {s["anyRequired"]}')
            props = s.get('properties', {})
            for k, x in v.items():
                if k in props:
                    f += self.fel(x, props[k], f'{vag}.{k}')
                elif s.get('additionalProperties') is False:
                    f.append(f'{vag}: okänt fält {k}')
                elif isinstance(s.get('additionalProperties'), dict):
                    f += self.fel(x, s['additionalProperties'], f'{vag}.{k}')
        for d in s.get('allOf', []):
            f += self.fel(v, d, vag)
        if 'if' in s and not self.fel(v, s['if'], vag):
            f += self.fel(v, s.get('then', {}), vag)
        return f
