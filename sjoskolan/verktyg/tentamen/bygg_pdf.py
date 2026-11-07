#!/usr/bin/env python3
"""Frågor och facit som separata PDF:er, ur övningstentans publika källposter.

Kräver reportlab. Kör sedan innehall.py bygg tentamen idregister.
"""
import sys
from html import escape
from pathlib import Path

SJO = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(SJO / 'innehall'))
import innehall as I  # noqa: E402
import tentamen as T  # noqa: E402

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import KeepTogether, Paragraph, SimpleDocTemplate, Spacer


def stycke(text):
    delar = []
    for typ, t in T.R.T.delar(text):
        tagg = {'sub': 'sub', 'sup': 'super'}.get(typ)
        t = escape(t).replace('–', '-').replace('—', '-')
        delar.append(f'<{tagg}>{t}</{tagg}>' if tagg else t)
    return ''.join(delar)


def bygg(poster, facit=False):
    blatt = colors.HexColor('#064f91')
    morkt = colors.HexColor('#163248')
    stilar = {
        'titel': ParagraphStyle('titel', fontName='FilmSans-Bold', fontSize=26, leading=31, textColor=blatt, spaceAfter=12),
        'ingress': ParagraphStyle('ingress', fontName='FilmSans', fontSize=11, leading=17, textColor=morkt, spaceAfter=18),
        'rubrik': ParagraphStyle('rubrik', fontName='FilmSans-Bold', fontSize=14, leading=19, textColor=blatt, spaceBefore=15, spaceAfter=7),
        'text': ParagraphStyle('text', fontName='FilmSans', fontSize=10.5, leading=16, textColor=morkt, alignment=TA_LEFT, spaceAfter=9),
        'losning': ParagraphStyle('losning', fontName='FilmSans', fontSize=10.5, leading=17, textColor=morkt,
                                 backColor=colors.HexColor('#edf4f9'), borderPadding=9, spaceBefore=3, spaceAfter=10),
    }
    titel = 'Övningstentamen - facit' if facit else 'Övningstentamen'
    fil = SJO / 'tentamen' / ('ovningstentamen-facit.pdf' if facit else 'ovningstentamen.pdf')
    fil.parent.mkdir(parents=True, exist_ok=True)
    doc = SimpleDocTemplate(str(fil), pagesize=A4, rightMargin=21*mm, leftMargin=21*mm,
                            topMargin=24*mm, bottomMargin=22*mm, title=titel,
                            author='Nils Johansson · Sjöskolan', subject='sjoskolan-tentamen:' + T.pdf_kallhash(poster))
    flode = [Paragraph(titel, stilar['titel']), Paragraph(
        'Elteknik och ellära · hösten 2026<br/>Tolv scenarier från kursens övningstenta. Frivilligt träningsmaterial.', stilar['ingress'])]
    flode.append(Paragraph('Räkna först själv. Jämför sedan din lösningsgång med facit och välj vad du behöver repetera.' if facit else
                           'Skriv givna värden, samband, insättning och svar med enhet. I resonemangsuppgifter: skilj observation från slutsats. '
                           'Använd kursens formelsamling och räknare. Facit finns i ett separat dokument.', stilar['text']))
    for pl, p in poster:
        uppgift = p['uppgift']
        start = [Paragraph(f'{pl["nummer"]}. {stycke(p["titel"])}', stilar['rubrik'])]
        start += [Paragraph(stycke(x), stilar['text']) for x in uppgift.get('stycken') or [uppgift['fraga']]]
        flode.append(KeepTogether(start))
        if facit:
            flode.append(Paragraph('<b>Lösningsgång</b><br/>' + stycke(p['losning']['text']), stilar['losning']))
        else:
            flode.append(Spacer(1, 15*mm))

    def sidfot(canvas, document):
        canvas.saveState()
        canvas.setStrokeColor(colors.HexColor('#cad8e2'))
        canvas.line(21*mm, 18*mm, A4[0]-21*mm, 18*mm)
        canvas.setFont('FilmSans', 8)
        canvas.setFillColor(morkt)
        canvas.drawString(21*mm, 12*mm, 'Sjöskolan · Nils Johansson · Frivillig övningstentamen')
        canvas.drawRightString(A4[0]-21*mm, 12*mm, str(document.page))
        canvas.restoreState()

    doc.build(flode, onFirstPage=sidfot, onLaterPages=sidfot)
    print(fil.relative_to(SJO.parent))


if __name__ == '__main__':
    for namn in ('FilmSans', 'FilmSans-Bold'):
        pdfmetrics.registerFont(TTFont(namn, str(SJO / 'multimeterfilm/assets' / (namn + '.ttf'))))
    pdfmetrics.registerFontFamily('FilmSans', normal='FilmSans', bold='FilmSans-Bold', italic='FilmSans', boldItalic='FilmSans-Bold')
    katalog = I.katalog_eller_avbryt()
    poster = I.Atkomst(I.bygg_db(katalog), 'elev').placeringar('tentamen', 'tentamen.html')
    bygg(poster)
    bygg(poster, facit=True)
