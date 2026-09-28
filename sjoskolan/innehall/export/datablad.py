"""Instrumentkorten M1 och M2 som datablad: bild, vad instrumentet kan mäta (Ja/Nej) och tekniska data.

Uppgifterna står i studieplan-v40.json (kort). Samma HTML används på elevuppgifterna (vecka 38), i veckans arbetsrum
(vecka 40) och på Underlagskort. Stilen finns i gemensamt/datablad.css.
"""
import rendera as R

INK, BLA, LINJE, MJUK, ROD, SVART = '#163248', '#064f91', '#9fb4c4', '#edf4f9', '#b8323c', '#1d2a33'


def _uttag(x, y, farg, text, under=''):
    s = (f'<circle cx="{x}" cy="{y}" r="11" fill="{farg}" stroke="{INK}" stroke-width="2"/>'
         f'<circle cx="{x}" cy="{y}" r="4" fill="#0b1720"/>'
         f'<text x="{x}" y="{y - 17}" text-anchor="middle" font-size="12" font-weight="700" fill="{INK}">{text}</text>')
    if under:
        s += f'<text x="{x}" y="{y + 26}" text-anchor="middle" font-size="9.5" fill="{INK}">{under}</text>'
    return s


def _hus(b, h, namn, visning):
    return (f'<rect x="4" y="4" width="{b - 8}" height="{h - 8}" rx="22" fill="#f6c343" stroke="{INK}" stroke-width="3"/>'
            f'<rect x="16" y="16" width="{b - 32}" height="{h - 32}" rx="14" fill="#2c3e4c"/>'
            f'<text x="{b / 2}" y="40" text-anchor="middle" font-size="15" font-weight="700" fill="#ffffff">{namn}</text>'
            f'<rect x="30" y="52" width="{b - 60}" height="54" rx="6" fill="#cfe0cf" stroke="#0b1720" stroke-width="2"/>'
            f'<text x="{b - 40}" y="92" text-anchor="end" font-size="30" font-family="Courier New, monospace" font-weight="700" fill="#1f2d24">{visning}</text>')


def bild_m1():
    b, h = 200, 300
    s = _hus(b, h, 'M1 · DC VOLT', '- -.- -')
    s += f'<text x="{b - 40}" y="102" text-anchor="end" font-size="11" fill="#1f2d24">V⎓</text>'
    s += (f'<rect x="72" y="126" width="56" height="30" rx="15" fill="#43596a" stroke="#0b1720" stroke-width="2"/>'
          f'<circle cx="87" cy="141" r="11" fill="#dfe8ee"/><text x="100" y="176" text-anchor="middle" font-size="11" fill="#ffffff">PÅ / AV</text>')
    s += f'<rect x="24" y="200" width="{b - 48}" height="80" rx="10" fill="#dfe8ee"/>'
    s += _uttag(70, 244, SVART, 'COM') + _uttag(130, 244, ROD, 'V⎓')
    return _svg(b, h, 'M1: digital voltmeter med display, strömbrytare och två uttag, COM och V för likspänning. Ingen vridomkopplare.', s)


def bild_m2():
    b, h = 220, 300
    s = _hus(b, h, 'M2 · TRUE RMS', '- -.- -')
    cx, cy = b / 2, 170
    s += f'<circle cx="{cx}" cy="{cy}" r="34" fill="#dfe8ee" stroke="#0b1720" stroke-width="2"/>'
    s += f'<rect x="{cx - 5}" y="{cy - 32}" width="10" height="30" rx="4" fill="{INK}"/>'
    for text, x, y in (('AV', cx, cy - 42), ('V⎓', cx - 52, cy - 18), ('V~', cx + 52, cy - 18), ('Ω', cx - 50, cy + 26), ('mA⎓', cx + 52, cy + 26)):
        s += f'<text x="{x}" y="{y}" text-anchor="middle" font-size="12.5" font-weight="700" fill="#ffffff">{text}</text>'
    s += f'<rect x="20" y="218" width="{b - 40}" height="66" rx="10" fill="#dfe8ee"/>'
    s += _uttag(52, 252, ROD, 'mA', '200 mA') + _uttag(110, 252, SVART, 'COM') + _uttag(168, 252, ROD, 'VΩ', 'CAT III 600 V')
    return _svg(b, h, 'M2: digital multimeter med display, vridomkopplare för AV, V likspänning, V växelspänning, ohm och mA likström, samt tre uttag: mA med säkring 200 mA, COM och VΩ.', s)


def _svg(b, h, alt, inner):
    return (f'<svg viewBox="0 0 {b} {h}" width="{b}" height="{h}" role="img" aria-label="{R.attr(alt)}" '
            f'font-family="Arial, Helvetica, sans-serif" translate="no">{inner}</svg>')


BILD = {'M1': bild_m1, 'M2': bild_m2}


def html(id_, c):
    """Ett datablad. Ja/Nej skrivs ut i text; färgen är bara ett extra stöd."""
    rader = ''.join(
        f'<tr class="{"ja" if finns else "nej"}"><th scope="row">{R.h(namn)} <span class="db-sym" translate="no">{R.h(sym)}</span></th>'
        f'<td class="db-finns">{"✓ Ja" if finns else "✗ Nej"}</td><td>{R.h(omr) if finns else "–"}</td></tr>'
        for namn, sym, finns, omr in c['funktioner'])
    data = ''.join(f'<tr><th scope="row">{R.h(k)}</th><td>{R.h(v)}</td></tr>' for k, v in c['data'])
    return (f'<section class="datablad" aria-labelledby="db-{id_}" data-read="card-{id_}">'
            f'<header class="db-head"><h3 id="db-{id_}">{R.h(c["titel"])}</h3><p>{R.h(c["typ"])}</p></header>'
            f'<div class="db-kropp"><figure class="db-bild">{BILD[id_]()}<figcaption>Uttag: {R.h(c["uttag"])}</figcaption></figure>'
            f'<div class="db-tabeller"><table class="db-funk"><caption>Vad instrumentet kan mäta</caption>'
            f'<thead><tr><th scope="col">Mätning</th><th scope="col">Finns</th><th scope="col">Mätområde</th></tr></thead><tbody>{rader}</tbody></table>'
            f'<table class="db-data"><caption>Tekniska data</caption><tbody>{data}</tbody></table></div></div>'
            f'<p class="db-anm">Konstruerat utbildningsunderlag, inte en produktmanual.</p></section>')


def alla(kort):
    return '<div class="datablad-par">' + ''.join(html(k, c) for k, c in kort.items()) + '</div>'


# Komponentkortet: IEC-symbol per rad. Ritas i en ruta 64 × 40.
def _sym(namn):
    L = f'stroke="{INK}" stroke-width="2.2" fill="none" stroke-linecap="round"'
    ledn = f'<line x1="2" y1="20" x2="18" y2="20" {L}/><line x1="46" y1="20" x2="62" y2="20" {L}/>'
    if namn == 'motstand':
        s = ledn + f'<rect x="18" y="13" width="28" height="14" {L}/>'
    elif namn == 'sakring':
        s = ledn + f'<rect x="18" y="13" width="28" height="14" {L}/><line x1="12" y1="20" x2="52" y2="20" {L}/>'
    elif namn == 'spole':
        s = ledn + f'<rect x="18" y="10" width="28" height="20" {L}/>'
    else:
        kontakt = (f'<line x1="2" y1="26" x2="22" y2="26" {L}/><line x1="42" y1="26" x2="62" y2="26" {L}/>'
                   + (f'<line x1="22" y1="26" x2="44" y2="14" {L}/>' if namn in ('no', 'knapp-no')
                      else f'<line x1="42" y1="26" x2="42" y2="18" {L}/><line x1="22" y1="26" x2="46" y2="18" {L}/>'))
        s = kontakt
        if namn.startswith('knapp'):
            s += (f'<line x1="33" y1="20" x2="33" y2="6" stroke="{INK}" stroke-width="1.6" stroke-dasharray="3 2"/>'
                  f'<path d="M27 3 H39 M27 3 V7 M39 3 V7" {L}/>')
    return f'<svg viewBox="0 0 64 40" width="64" height="40" aria-hidden="true">{s}</svg>'


def komponentkort(c):
    rader = ''.join(
        f'<tr><td class="db-symbol">{_sym(r["symbol"])}</td><td class="db-id" translate="no">{R.h(r["id"])}</td><th scope="row">{R.h(r["namn"])}</th>'
        f'<td data-etikett="Märkdata">{R.h(r["data"])}</td><td data-etikett="I vila" class="{"db-tom" if r["vila"] == "–" else ""}">{R.h(r["vila"])}</td>'
        f'<td data-etikett="Anges inte" class="{"db-saknas" if r["saknas"] != "–" else "db-tom"}">{R.h(r["saknas"])}</td></tr>'
        for r in c['rader'])
    return (f'<section class="datablad db-komponenter" aria-labelledby="db-komponenter" data-read="card-komponenter">'
            f'<header class="db-head"><h3 id="db-komponenter">{R.h(c["titel"])}</h3><p>{R.h(c["typ"])}</p></header>'
            f'<div class="db-bred"><table class="db-komp"><caption>Komponenter, märkdata och läge i vila</caption>'
            f'<thead><tr><th scope="col">Symbol</th><th scope="col">Bet.</th><th scope="col">Komponent</th><th scope="col">Märkdata</th>'
            f'<th scope="col">I vila</th><th scope="col">Anges inte på kortet</th></tr></thead><tbody>{rader}</tbody></table></div>'
            f'<p class="db-anm">{R.h(c["anm"])} Konstruerat utbildningsunderlag, inte en produktmanual.</p></section>')
