"""Självrättande inlämning: svarsfält under uppgifterna, rättning i webbläsaren och inlämning som PDF.

Beslut 11 oktober 2026 (Nils): inlämningen i vecka 42 rättar sig själv. Eleven skriver sina svar, trycker Rätta och får
Rätt! eller Skiljer sig med en hänvisning till var hen kan läsa (regel 5 och 6, tolerans 2 %). Varje fråga har tre
försök. Efter tre fel låses frågan; när eleven har läst om veckans delar och Transportstyrelsens text (bekräftat på
delsidorna och i formuläret) får de låsta frågorna tre nya försök. Sidan sparar första svar, sista svar, försök, omgång
och tider (regel 25). Lämna in visar resultatet och ger en PDF som eleven lämnar in i Google Classroom.
Logiken finns i gemensamt/sjalvrattning.mjs, sidan i gemensamt/sjalvrattning-sida.mjs och PDF:en i gemensamt/pdf.mjs.

Här finns bara det publika: fälten, alternativen, hänvisningarna och checklistan. Rätta svar står aldrig här.
De finns som saltade SHA-256-hashar i vecka-XX/aktuell/inlamning-nyckel.mjs, som facit.py skriver ur en klartextfil
utanför repot. Uppgifternas text kommer ur innehållsdatabasen (EL-000817–819, 887). Fälten följer postens delfrågor
(a, b, c …) och bygget stoppar om de inte gör det. Läsförståelsen (EL-000887) har frågor, alternativ och
läshänvisningar i själva posten (delfrågor med alternativ och ledtrad); fälten byggs därifrån.

Hänvisningar till delsidorna anges med avsnittets rubrik. Numret räknas ur Del_N.html när sidan byggs (regel 5),
så att hänvisningen stämmer när avsnitt flyttas. En rubrik som saknas stoppar bygget.
"""
import base64
import hashlib
import html
import json
import re
from pathlib import Path

SJO = Path(__file__).resolve().parents[2]
# Veckor där inlämningssidan rättar sig själv. verktyg/inlamning/bygg.py och innehall/export/delsidor_veckor.py läser den.
SJALVRATTANDE = {42}
# Cacheversion för gemensamt/sjalvrattning*.mjs, pdf.mjs, lasbekraftelse.mjs och sjalvrattning.css (regel 13).
VERSION = '20261012'
MAX_FORSOK = 3
MULTIMETER_CAT = '../../multimetersimulator/?ovning=category'
# Alternativen visas i en fast, blandad ordning (samma för alla elever), så att rätt svar inte står på samma plats.
ORDNINGSFRO = 'sjoskolan-v42'


def mark(text):
    """Innehållsmarkering till HTML (X_{L} blir X<sub>L</sub>), som markHtml i gemensamt/markering.mjs."""
    tagg = {'_': 'sub', '^': 'sup'}
    return re.sub(r'([_^])\{([^{}]*)\}', lambda m: f'<{tagg[m.group(1)]}>{m.group(2)}</{tagg[m.group(1)]}>', html.escape(text, quote=False))


def visningsordning(falt_id, alternativ):
    """Alternativen (id, text) i visningsordning: sorterade på sha256(frö|fält|id). Id:t och hashningen ändras inte."""
    return sorted(alternativ, key=lambda a: hashlib.sha256(f'{ORDNINGSFRO}|{falt_id}|{a[0]}'.encode()).hexdigest())


# ------------------------------------------------------------------ fält
def tal(id_, etikett, enhet, kort, pekare, dec=1, tolerans=2, heltal=None):
    """Ett tal. Godkänns inom tolerans % och avrundas till dec decimaler innan det hashas (facit.py gör samma sak).
    heltal=(min, max): bara ett heltal i intervallet är ett giltigt svar."""
    return {'id': id_, 'typ': 'tal', 'etikett': etikett, 'enhet': enhet, 'kort': kort, 'pekare': pekare, 'dec': dec,
            'tolerans': tolerans, 'heltal': heltal}


def val(id_, fraga, alternativ, kort, pekare, lista=False):
    """Ett val bland alternativ. lista=True ger en rullista (korta alternativ i naturlig ordning), annars radioknappar."""
    return {'id': id_, 'typ': 'val', 'fraga': fraga, 'alternativ': alternativ, 'kort': kort, 'pekare': pekare, 'lista': lista}


def text(id_, etikett, kort, hjalp='', las=False, rad=3, enrad=False):
    """Fri text. las=True: texten låses som första version med knappen Jag är klar med texten (rättas inte)."""
    return {'id': id_, 'typ': 'lastext' if las else 'text', 'etikett': etikett, 'kort': kort, 'hjalp': hjalp, 'rad': rad, 'enrad': enrad}


def avsnitt(del_, titel, efter=''):
    return {'del': del_, 'titel': titel, 'efter': efter}


def lank(href, titel, fore='', efter='', slut='.'):
    return {'href': href, 'titel': titel, 'fore': fore, 'efter': efter, 'slut': slut}


KATEGORI = [('1', 'CAT II'), ('2', 'CAT III'), ('3', 'CAT IV'), ('4', 'Ingen nätkategori (äldre CAT I)')]
SPANNING = [('1', '300 V'), ('2', '600 V'), ('3', '1 000 V'), ('4', '1 500 V')]
LAS_KATEGORI = lank(MULTIMETER_CAT, 'Multimeterlabbet: Välj CAT-klass', efter='Tabellen och texten under den visar vilken kategori en mätplats har.')
LAS_SPANNING = lank(MULTIMETER_CAT, 'Multimeterlabbet: Välj CAT-klass',
                    fore='Jämför spänningen på mätplatsen med märkspänningen.')


def plats(nr, namn, kort):
    return {'namn': namn, 'falt': [
        val(f'819a{nr}-kat', 'Mätplatsens kategori', KATEGORI, f'a {kort} kategori', LAS_KATEGORI, lista=True),
        val(f'819a{nr}-volt', 'Lägsta märkspänning som räcker', SPANNING, f'a {kort} spänning', LAS_SPANNING, lista=True)]}


# Vecka 42. Fyra alternativ per flervalsfråga, så att tre försök inte räcker för att pröva sig fram.
FORMULAR = {42: {
    'EL-000817': {'delar': [
        {'del': 'a', 'rubrik': 'a) Riskbedömningen', 'falt': [
            text('817a-fara', 'Fara', 'a fara', 'Vad kan skada någon?', las=True),
            text('817a-handelse', 'Händelse', 'a händelse', 'Vad kan hända under arbetet?', las=True),
            text('817a-konsekvens', 'Konsekvens', 'a konsekvens', 'Vilken skada kan det bli?', las=True),
            text('817a-skydd', 'Befintliga skydd', 'a befintliga skydd', 'Vad skyddar redan nu?', las=True),
            text('817a-atgarder', 'Åtgärder', 'a åtgärder', 'Vad gör ni före och under arbetet?', las=True, rad=4)]},
        {'del': 'b', 'rubrik': 'b) Arbetsmetod', 'falt': [
            text('817b-metod', 'Arbetsmetod', 'b arbetsmetod', 'Vilken arbetsmetod väljer du?', las=True, enrad=True),
            text('817b-motivering', 'Motivering', 'b motivering', 'Varför väljer du den?', las=True)]},
        {'del': 'c', 'rubrik': 'c) Vem gör vad', 'falt': [
            text('817c-vem', 'Vem gör vad', 'c vem gör vad', 'Skriv vem (funktion) och vad personen gör.', las=True, rad=4),
            text('817c-verifiering', 'Hur varje åtgärd verifieras', 'c verifiering', 'Hur kontrollerar ni att varje åtgärd är gjord?', las=True, rad=4)]},
        {'del': 'd', 'falt': [
            val('817d', 'd) Vilken energikälla är lätt att missa?', [
                ('1', 'Gruppen i fördelningen som matar armaturen'),
                ('2', 'Nödljusbatteriet inne i armaturen'),
                ('3', 'Landströmmen när fartyget ligger vid kaj'),
                ('4', 'Kylmaskinen som kyler kylrummet')], 'd', avsnitt(2, 'Avgränsning före beslut'))]}],
        # Visas först när eleven har låst sin första version av a–c och fråga d är rätt eller låst (namnger inte svaret på d).
        'checklista_efter': '817d',
        'checklista': [
            ('Gruppen i fördelningen är frånskild, låst och märkt.', avsnitt(2, 'Fem säkerhetsåtgärder')),
            ('Du kontrollerar att armaturen är spänningslös med en provare som du provar före och efter.', avsnitt(3, 'Provare, låsning och märkning')),
            ('Alla energikällor som kan finnas kvar när gruppen är bortkopplad är kartlagda, bortkopplade och kontrollerade.', avsnitt(2, 'Avgränsning före beslut')),
            ('Det fuktiga golvet finns med i bedömningen, till exempel att golvet torkas och att du står torrt.', avsnitt(1, 'Risker i marin miljö')),
            ('Arbetsmetoden är arbete utan spänning, och du förklarar varför.', avsnitt(2, 'SS-EN 50110-1 och ESA')),
            ('Det står vem som gör vad, till exempel vem som frånskiljer och låser och vem som byter armaturen.', avsnitt(2, 'Roller och kommunikation')),
            ('Det står hur varje åtgärd kontrolleras och vem som kontrollerar den.', avsnitt(3, 'Från identifierad fara till beslut'))],
        'las_pekare': avsnitt(3, 'Arbetsmomentets gränser')},
    'EL-000818': {'delar': [
        {'del': 'a', 'falt': [tal('818a', 'a) Beröringsspänning U_{beröring} (V)', 'V', 'a', avsnitt(1, 'Beröringsspänning'))]},
        {'del': 'b', 'falt': [tal('818b', 'b) Strömmen genom kroppen I (mA)', 'mA', 'b',
                                 avsnitt(1, 'Beröringsspänning', 'Sätt in D = 12 i R och svara i mA.'))]},
        {'del': 'c', 'falt': [
            val('818c', 'c) Varför kan modellen inte användas som säkerhetsgräns?', [
                ('1', 'Kroppens resistans ändras mycket med fukt, kontaktyta och spänning. Ett antaget värde ger ingen säker gräns.'),
                ('2', 'Modellen ger alltid för hög ström. Den verkliga strömmen blir lägre, så modellen är på den säkra sidan.'),
                ('3', 'Modellen räknar inte med säkringen. Säkringen begränsar strömmen genom kroppen till en ofarlig nivå.'),
                ('4', 'Kroppens resistans är alltid exakt 1 000 Ω, så modellen räknar med fel värde.')],
                'c', avsnitt(1, 'Strömmens väg genom kroppen')),
            text('818c-text', 'Förklara med egna ord (frivilligt)', 'c egna ord', rad=2)]},
        {'del': 'd', 'falt': [
            val('818d', 'd) Varför kopplade säkringen eller dvärgbrytaren kanske inte bort matningen?', [
                ('1', 'Säkringen löser bara ut vid kortslutning mellan fas och neutralledare, aldrig vid fel mot ett hölje.'),
                ('2', 'Säkringen löser ut först när någon rör höljet. Då går strömmen genom kroppen och säkringen bryter.'),
                ('3', 'Utan skyddsledare finns ingen bra väg tillbaka för felströmmen. Strömmen blir för liten för att säkringen ska lösa ut.'),
                ('4', 'Säkringen var för stor. En mindre säkring hade löst ut, också utan skyddsledare.')],
                'd', avsnitt(1, 'Beröringsspänning', 'Titta i figuren: vilken väg har felströmmen när skyddsledaren (PE) har gått av?')),
            text('818d-text', 'Förklara med egna ord (frivilligt)', 'd egna ord', rad=2)]}]},
    'EL-000819': {'delar': [
        {'del': 'a', 'intro': 'a) Välj mätplatsens kategori och den lägsta märkspänning som räcker för hela mätutrustningen.',
         'platser': [plats(1, 'Plintarna för en utgående grupp i huvudtavlan, 440 V', 'huvudtavla'),
                     plats(2, 'Ett eluttag i en hytt, 230 V', 'hytt'),
                     plats(3, 'Batteriet i en livbåt, 24 V', 'livbåt')]},
        {'del': 'b', 'falt': [
            val('819b', 'b) Varför räcker det inte att bara instrumentet har rätt kategori?', [
                ('1', 'Kategorin gäller bara instrumentet. Sladdarna behöver bara klara spänningen.'),
                ('2', 'Sladdar, spetsar och tillbehör måste också ha rätt kategori och spänning. Den lägsta märkningen i hela mätutrustningen gäller.'),
                ('3', 'Det är volt-talet som avgör. Ett högt volt-tal på instrumentet räcker för alla mätplatser.'),
                ('4', 'Sladdarna har ingen egen märkning, så de behöver inte kontrolleras.')],
                'b', lank(MULTIMETER_CAT, 'Multimeterlabbet: Välj CAT-klass', efter='Steg 3 handlar om mätare och sladdar.')),
            text('819-text', 'Motivera dina val med egna ord (frivilligt)', 'motivering', rad=3)]}]},
    # Läsförståelsen: fälten byggs ur postens delfrågor (frågor, alternativ och ledtrad = läshänvisning).
    'EL-000887': {'fran_posten': True, 'heltal': {'f': (1, 5)}},
}}


def post(ovning):
    return json.loads((SJO / 'innehall' / 'ovningar' / f'{ovning}.json').read_text(encoding='utf-8'))


def textkalla(p):
    """Läsförståelsens text: (adress relativt sidan, titel) ur postens första resurs."""
    r = p['referenser']['resurser'][0]
    return Path(r['url']).name, r['titel']


def fran_posten(nr, p):
    """Delarna för en post vars delfrågor själva har alternativ och läshänvisning (EL-000887)."""
    spec, kort = FORMULAR[nr][p['id']], p['id'][-3:]
    href, _ = textkalla(p)
    delar = []
    for d in p['uppgift']['delfragor']:
        pekare = lank(href, d['ledtrad'], slut=' i Transportstyrelsens riktlinjer.')
        fraga = f'{d["id"]}) {d["text"]}'
        if d.get('alternativ'):
            f = val(f'{kort}{d["id"]}', fraga, [(str(i), a) for i, a in enumerate(d['alternativ'], 1)], d['id'], pekare)
        else:
            tol = (d.get('tolerans') or {}).get('abs')
            f = tal(f'{kort}{d["id"]}', fraga, d.get('enhet', ''), d['id'], pekare, dec=0, tolerans=0 if tol == 0 else 2,
                    heltal=spec.get('heltal', {}).get(d['id']))
        delar.append({'del': d['id'], 'falt': [f]})
    return delar


def delar_for(nr, ovning, p=None):
    spec = FORMULAR[nr][ovning]
    return fran_posten(nr, p or post(ovning)) if spec.get('fran_posten') else spec['delar']


def uppgiftens_falt(nr, ovning, p=None):
    """Alla fält i en uppgift, i sidans ordning."""
    ut = []
    for d in delar_for(nr, ovning, p):
        ut += d.get('falt', [])
        for pl in d.get('platser', []):
            ut += pl['falt']
    return ut


def alla_falt(nr):
    return {f['id']: f for o in FORMULAR.get(nr, {}) for f in uppgiftens_falt(nr, o)}


def rattade_falt(nr):
    """Fälten som rättas (tal och val), med typ, decimaler, tolerans och alternativens id. facit.py använder dem."""
    return {i: f for i, f in alla_falt(nr).items() if f['typ'] in ('tal', 'val')}


# ------------------------------------------------------------------ rendering
_AVSNITT = {}


def avsnittsnummer(nr, del_, titel):
    """Avsnittets nummer på delsidan (id="teori-N"), räknat ur Del_N.html."""
    nyckel = (nr, del_)
    if nyckel not in _AVSNITT:
        s = (SJO / f'vecka-{nr}' / 'aktuell' / f'Del_{del_}.html').read_text(encoding='utf-8')
        _AVSNITT[nyckel] = re.findall(r'<details class="del-kort del-teori" id="teori-(\d+)"[^>]*><summary><span class="kort-nr">\d+</span>'
                                      r'<span class="kort-text"><span class="kort-titel">(.*?)</span>', s)
    tr = [int(n) for n, t in _AVSNITT[nyckel] if html.unescape(t) == titel]
    if len(tr) != 1:
        raise SystemExit(f'sjalvrattning.py: vecka {nr}, del {del_} har {"inget" if not tr else "flera"} avsnitt ”{titel}”. '
                         'Rätta hänvisningen i verktyg/inlamning/sjalvrattning.py.')
    return tr[0]


def pekare_html(nr, p):
    if 'del' in p:
        n = avsnittsnummer(nr, p['del'], p['titel'])
        s = f'Läs <a href="Del_{p["del"]}.html#teori-{n}">del {p["del"]}, avsnitt {n}: {html.escape(p["titel"])}</a>.'
        return s + (f' {mark(p["efter"])}' if p['efter'] else '')
    delar = [mark(p['fore'])] if p['fore'] else []
    delar.append(f'Läs <a href="{html.escape(p["href"])}">{html.escape(p["titel"])}</a>{html.escape(p["slut"])}')
    if p['efter']:
        delar.append(mark(p['efter']))
    return ' '.join(delar)


def _besked(nr, f):
    # Beskedet hör till fältet (aria-describedby); bara sammanfattningen efter Rätta läses upp direkt (aria-live).
    return (f'<p class="ri-besked" id="ri-{f["id"]}-besked"></p>'
            f'<p class="ri-pekare" hidden>{pekare_html(nr, f["pekare"])}</p>')


def falt_html(nr, f):
    i, k = f['id'], html.escape(f['kort'], quote=True)
    if f['typ'] == 'tal':
        heltal = f' data-heltal="{f["heltal"][0]}-{f["heltal"][1]}"' if f.get('heltal') else ''
        mode = 'numeric' if f.get('heltal') else 'decimal'
        return (f'<div class="ri-falt" data-falt="{i}" data-typ="tal" data-enhet="{f["enhet"]}" data-kort="{k}"{heltal}>'
                f'<label for="ri-{i}">{mark(f["etikett"])}</label>'
                f'<input id="ri-{i}" class="ri-tal" type="text" inputmode="{mode}" autocomplete="off" spellcheck="false" aria-describedby="ri-{i}-besked">'
                f'{_besked(nr, f)}</div>')
    if f['typ'] == 'val' and f['lista']:
        alt = ''.join(f'<option value="{v}">{html.escape(t)}</option>' for v, t in f['alternativ'])
        return (f'<div class="ri-falt" data-falt="{i}" data-typ="val" data-kort="{k}"><label for="ri-{i}">{mark(f["fraga"])}</label>'
                f'<select id="ri-{i}" aria-describedby="ri-{i}-besked"><option value="">Välj …</option>{alt}</select>{_besked(nr, f)}</div>')
    if f['typ'] == 'val':
        alt = ''.join(f'<label class="ri-val"><input type="radio" name="ri-{i}" value="{v}"><span>{mark(t)}</span></label>'
                      for v, t in visningsordning(i, f['alternativ']))
        return (f'<fieldset class="ri-falt" data-falt="{i}" data-typ="val" data-kort="{k}" aria-describedby="ri-{i}-besked">'
                f'<legend>{mark(f["fraga"])}</legend>{alt}{_besked(nr, f)}</fieldset>')
    hjalp = f'<p class="ri-hjalp" id="ri-{i}-hjalp">{mark(f["hjalp"])}</p>' if f['hjalp'] else ''
    beskriv = f' aria-describedby="ri-{i}-hjalp"' if f['hjalp'] else ''
    ruta = (f'<input id="ri-{i}" type="text" autocomplete="off"{beskriv}>' if f['enrad']
            else f'<textarea id="ri-{i}" rows="{f["rad"]}"{beskriv}></textarea>')
    return (f'<div class="ri-falt ri-textfalt" data-falt="{i}" data-typ="{f["typ"]}" data-kort="{k}">'
            f'<label for="ri-{i}">{mark(f["etikett"])}</label>{hjalp}{ruta}</div>')


def lista_b64(nr, lista):
    """Checklistan som base64-kodad JSON. Base64 är inget skydd: det håller bara listan dold tills eleven har låst sin
    första version (sidan avkodar den då). Den som läser källkoden kan avkoda den."""
    data = [{'text': t, 'las': pekare_html(nr, p)} for t, p in lista]
    return base64.b64encode(json.dumps(data, ensure_ascii=False, separators=(',', ':')).encode('utf-8')).decode('ascii')


def lasknapp(href, titel):
    """Länken till läsförståelsens text och knappen Jag har läst texten (nyckeln text i sj-last:vecka-NN)."""
    return (f'<p class="ri-textlas"><a href="{html.escape(href)}" data-ri-text>{html.escape(titel)}</a> '
            '<button type="button" class="ri-textknapp" data-ri-last="text">Jag har läst texten</button> '
            '<span class="ri-lasstatus" data-ri-status="text"></span></p>')


def utan_fragelista(nr, p):
    """Läsförståelsens frågor står i svarsfälten; listan a–h i uppgiften skulle bara upprepa dem."""
    return bool(FORMULAR.get(nr, {}).get(p['id'], {}).get('fran_posten'))


def svarsfalt(nr, pl, p):
    """Svarsfälten för en uppgift (en sektion på inlämningssidan). Tom sträng om veckan inte rättar sig själv."""
    form = FORMULAR.get(nr, {}).get(p['id'])
    if not form or nr not in SJALVRATTANDE:
        return ''
    delar = delar_for(nr, p['id'], p)
    delfragor = [d['id'] for d in p['uppgift'].get('delfragor', [])]
    if [d['del'] for d in delar] != delfragor:
        raise SystemExit(f'sjalvrattning.py: svarsfälten för {p["id"]} ({", ".join(d["del"] for d in delar)}) följer inte '
                         f'postens delfrågor ({", ".join(delfragor)}). Ändra FORMULAR och kör facit.py igen.')
    uppg = re.sub(r'\D', '', pl['nummer'])
    ut = []
    if form.get('fran_posten'):
        href, titel = textkalla(p)
        ut.append(lasknapp(href, f'Öppna {titel}'))
        if p['referenser'].get('rattigheter'):
            ut.append(f'<p class="ri-kalla">Källa: {mark(p["referenser"]["rattigheter"])}</p>')
    for d in delar:
        if d.get('rubrik'):
            ut.append(f'<h4>{mark(d["rubrik"])}</h4>')
        if d.get('intro'):
            ut.append(f'<p class="ri-intro">{mark(d["intro"])}</p>')
        for pla in d.get('platser', []):
            ut.append(f'<fieldset class="ri-plats"><legend>{mark(pla["namn"])}</legend><div class="ri-plats-rad">'
                      + ''.join(falt_html(nr, f) for f in pla['falt']) + '</div></fieldset>')
        ut += [falt_html(nr, f) for f in d.get('falt', [])]
        if d['del'] == 'c' and form.get('checklista'):
            # Låsningen gäller a–c: efter c kommer knappen och checklistan.
            ut.append(f'<div class="ri-las" data-lista="{lista_b64(nr, form["checklista"])}" data-lista-efter="{form["checklista_efter"]}">'
                      '<p class="ri-las-intro">När du har skrivit a–c trycker du på knappen. Då sparas din första version, och läraren ser den. '
                      'Sedan får du en checklista och kan skriva till mer.</p>'
                      f'<p class="ri-las-intro ri-las-hjalp">{pekare_html(nr, form["las_pekare"])}</p>'
                      '<p class="ri-knappar"><button type="button" class="sj-btn ri-las-knapp">Jag är klar med texten</button></p>'
                      '<p class="ri-las-status" aria-live="polite"></p><div class="ri-lista" hidden></div></div>')
    lm = ' '.join(p['larande'].get('mal', []))
    return (f'<div class="ri-svar" data-ovning="{p["id"]}" data-nr="{uppg}" data-titel="{html.escape(p["titel"], quote=True)}" data-lm="{lm}">'
            f'<h3>Dina svar</h3>{"".join(ut)}'
            f'<div class="ri-knappar"><button type="button" class="sj-btn ri-ratta">Rätta inlämning {uppg}</button>'
            '<p class="ri-summa" aria-live="polite"></p></div></div>')


def epost_ruta(epost, vn, pa_sidan):
    """Rutan Så lämnar du in för en självrättande vecka (inlämningssidan; veckosidan länkar dit)."""
    var = 'i rutorna under varje uppgift' if pa_sidan else 'i rutorna på <a href="Inlamning.html">inlämningssidan</a>'
    knapp = '<p><a class="sj-btn" href="#lamna-in">Till Lämna in</a></p>' if pa_sidan else ''
    return ('<div class="sj-panel soft handin-mail"><h3>Så lämnar du in</h3>'
            '<p><strong>Skriv dina svar. Tryck Rätta. Du får se vad som är rätt och var du kan läsa om något skiljer sig. '
            'Läraren ser ditt första svar och hur många försök du gjorde.</strong></p>'
            f'<ol><li>Skriv dina svar {var}.</li>'
            f'<li>Tryck <strong>Rätta</strong>. Du har {MAX_FORSOK} försök på varje fråga. Efter {MAX_FORSOK} fel låses frågan. '
            f'Då läser du om veckan och får {MAX_FORSOK} nya försök.</li>'
            f'<li>Tryck <strong>Lämna in</strong> längst ner{"" if pa_sidan else " på inlämningssidan"} och skriv ditt namn. Ladda ner PDF:en.</li>'
            f'<li>Lämna in PDF-filen i Google Classroom under Vecka {vn}.</li></ol>'
            '<p>Ett tal räknas som rätt om det skiljer högst 2 % från rätt värde. Komma eller punkt går bra. '
            'Uträkningar kan du lämna in som foto eller PDF i Classroom, men det behövs bara om läraren ber om det.</p>'
            f'{knapp}</div>')


def lasdelar(nr):
    """Det eleven läser om när en fråga är låst: veckans delar och läsförståelsens text. [(nyckel, titel, adress)]."""
    ut = []
    for f in sorted((SJO / f'vecka-{nr}' / 'aktuell').glob('Del_*.html')):
        titel = re.search(r'<title>(.*?) · ', f.read_text(encoding='utf-8')).group(1)
        ut.append((f'del-{f.stem.split("_")[1]}', html.unescape(titel), f.name))
    for o, spec in FORMULAR[nr].items():
        if spec.get('fran_posten'):
            href, titel = textkalla(post(o))
            ut.append(('text', titel, href))
    return ut


def lasom_ruta(nr, vn):
    """Rutan överst i formuläret som visas när en fråga är låst (gemensamt/sjalvrattning-sida.mjs)."""
    delar = lasdelar(nr)
    namn = [t.split(':')[0].lower() if k.startswith('del-') else 'Transportstyrelsens text' for k, t, _ in delar]
    upprakning = ', '.join(namn[:-1]) + ' och ' + namn[-1]
    rader = ''.join(f'<li><a href="{h}"{" data-ri-text" if k == "text" else ""}>{html.escape(t)}</a> '
                    f'<span class="ri-lasstatus" data-ri-status="{k}"></span>'
                    + (' <button type="button" class="ri-textknapp" data-ri-last="text">Jag har läst texten</button>' if k == 'text' else '')
                    + '</li>' for k, t, h in delar)
    return (f'<section class="sj-panel warn ri-lasom" id="ri-lasom" data-ri-delar="{" ".join(k for k, _, _ in delar)}" hidden>'
            f'<h2>Låsta frågor</h2><p>Läs om vecka {vn}: {upprakning}. Sedan får du tre nya försök på de låsta frågorna.</p>'
            f'<ul class="ri-lasom-lista">{rader}</ul>'
            '<p class="ri-lasom-hjalp">Längst ner på varje del finns en knapp där du bekräftar att du har läst den.</p>'
            '<p class="ri-lasom-klart" role="status"></p></section>\n')


def lm_text(mal):
    """Kursplanens punkter med enkla ord (verktyg/veckosidor/kursplan.py ENKEL), annars teori.json."""
    try:
        import importlib.util
        spec = importlib.util.spec_from_file_location('kursplan_enkel', SJO / 'verktyg' / 'veckosidor' / 'kursplan.py')
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
        enkel = mod.ENKEL
    except Exception:  # noqa: BLE001  reserv: den formella texten
        enkel = {k: v['text'] for k, v in json.loads((SJO / 'innehall' / 'teori.json').read_text(encoding='utf-8'))['mal'].items()}
    return {m: enkel[m] for m in mal if m in enkel}


def lamna_in(nr, vn, titel, epost):
    """Sista delen av sidan: namn, Lämna in och resultatet med PDF-nedladdningen (gemensamt/sjalvrattning-sida.mjs)."""
    mal = sorted({m for o in FORMULAR[nr] for m in post(o)['larande'].get('mal', [])}, key=lambda m: int(m.split('-')[1]))
    lm = html.escape(json.dumps(lm_text(mal), ensure_ascii=False), quote=True)
    return (f'<section class="sj-panel ri-lamna" id="lamna-in" data-ri-vecka="{vn}" data-ri-lagring="sj-v{nr}-inlamning" '
            f'data-ri-epost="{epost}" data-ri-titel="{html.escape(titel, quote=True)}" data-ri-max="{MAX_FORSOK}" data-ri-lm="{lm}">'
            '<h2>Lämna in</h2><p>När du är klar: skriv ditt namn och tryck Lämna in. Sidan rättar alla svar och visar ditt resultat. '
            f'Sedan laddar du ner PDF:en och lämnar in den i Google Classroom under Vecka {vn}.</p>'
            '<noscript><p><strong>Sidan behöver JavaScript för att rätta och lämna in.</strong> '
            f'Skriv dina svar i ett dokument och lämna in det i Google Classroom under Vecka {vn}.</p></noscript>'
            '<p class="ri-lagring" role="status" hidden></p>'
            '<p><label for="ri-namn">Förnamn och efternamn</label><input id="ri-namn" type="text" autocomplete="name"></p>'
            '<p class="ri-namnfel" role="alert"></p>'
            '<p><button type="button" class="sj-btn primary large" id="ri-lamna">Lämna in</button></p>'
            '<div class="ri-resultat" id="ri-resultat" tabindex="-1" hidden></div></section>\n')


BEDOMNING = ('<h2>Bedömning</h2><ul><li>Sidan rättar svaren i rutorna. Ett tal räknas som rätt om det skiljer högst 2 % från rätt värde.</li>'
             f'<li>Du har {MAX_FORSOK} försök på varje fråga. En låst fråga får {MAX_FORSOK} nya försök när du har läst om veckan.</li>'
             '<li>Läraren ser ditt första svar, ditt sista svar och hur många försök du gjorde.</li>'
             '<li>Läraren läser din riskbedömning i inlämning 1 och dina egna förklaringar.</li>'
             '<li>Säkerhetsresonemang skiljer på observation och antagande och hittar inte på uppgifter som saknas.</li></ul>\n')


def skript(nr):
    """Sidans modul. Nyckelns version är filens hash, så att en ny nyckel aldrig fastnar i cachen (regel 13). Går nyckeln
    inte att läsa startar sidan ändå (starta(null)): eleven kan lämna in och läraren rättar."""
    nyckel = SJO / f'vecka-{nr}' / 'aktuell' / 'inlamning-nyckel.mjs'
    v = hashlib.sha256(nyckel.read_bytes()).hexdigest()[:10] if nyckel.exists() else 'saknas'
    return (f'<script type="module">import {{starta}} from \'/sjoskolan/gemensamt/sjalvrattning-sida.mjs?v={VERSION}\';'
            f'import(\'./inlamning-nyckel.mjs?v={v}\').then((m) => starta(m.NYCKEL), () => starta(null));</script>\n')


def lasbekraftelse_html(nr, del_):
    """Rutan sist på en delsida: Har du läst hela del N? (gemensamt/lasbekraftelse.mjs). Bara veckor i SJALVRATTANDE."""
    if nr not in SJALVRATTANDE:
        return ''
    return (f'<link rel="stylesheet" href="/sjoskolan/gemensamt/sjalvrattning.css?v={VERSION}">'
            f'<section class="sj-panel ri-lasdel" id="las-del-{del_}" data-ri-las-vecka="{nr}" data-ri-las-del="del-{del_}">'
            f'<h2>Har du läst hela del {del_}?</h2>'
            '<p class="ri-lasdel-hjalp">Knappen öppnas när du har läst hela sidan (minst 3 minuter).</p>'
            f'<p><button type="button" class="sj-btn ri-lasdel-knapp" disabled>Jag har läst del {del_}</button></p>'
            '<p class="ri-lasdel-status" role="status"></p></section>'
            f'<script type="module">import {{startaLasning}} from \'/sjoskolan/gemensamt/lasbekraftelse.mjs?v={VERSION}\';startaLasning();</script>')
