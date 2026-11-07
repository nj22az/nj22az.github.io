#!/usr/bin/env python3
"""3D-figurer till vecka 42 (elsäkerhet), ur figurer3d/sakerhet.mjs, med etiketter i kursens typsnitt.

    python3 sjoskolan/verktyg/figurer/figurer3d_v42.py <utmapp>

Skriver v42_01_s07_beroring3d.png, v42_01_s08_ljusbage3d.png, v42_02_s07_zoner3d.png, v42_03_s08_lasmark3d.png och
v42_03_s21_jordning3d.png. Figurerna visas i bildens högra kolumn (4,25 tum), så modellen renderas liten och
etiketterna stora (spalter i fig3d.py). Kräver sjoskolan/figurer3d/rendera.js (node sjoskolan/figurer3d/tools/build.mjs).
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from PIL import ImageDraw

from fig3d import *  # noqa: F401,F403

ORANGE = (200, 100, 30)
S = 50                                                                    # etiketternas storlek i px
rendera(['ber=m=beroring&w=620&h=440', 'ljus=m=ljusbage&w=560&h=450', 'zon=m=zoner&w=600&h=450',
         'las=m=lasmark&w=620&h=465', 'jord=m=jordning&w=660&h=450'])


def spara(im, namn, marg=20):
    im.crop(beskar(im, marg)).save(UT / namn)


def mitt(d, im, y, text, storlek=S, fet=False, farg=INK):
    d.text((im.width / 2, y), text, font=f(storlek, fet), fill=farg, anchor='ma')


# 1. Beröringsspänning (v42_01 bild 7)
im, A = las('ber')
im, A = spalter(im, A, vanster=[('PE', ['PE bruten']), ('dampare', ['gummidämpare:', 'fötterna har ingen', 'kontakt med däck'])],
                hoger=[('A', ['A: handen', 'på höljet']), ('fel', ['isolationsfel:', 'fasen mot höljet']), ('B', ['B: fötterna', 'på däck'])], storlek=S, o=90)
d = ImageDraw.Draw(im)
x0 = im.width / 2 - 250
x0 += text_sub(d, (x0, 14), 'U', 'beröring', 56, BLA); x0 += text_sub(d, (x0, 14), ' = |V', 'A', 56, BLA); x0 += text_sub(d, (x0, 14), ' − V', 'B', 56, BLA)
d.text((x0 + 2, 14), '|', font=f(56), fill=BLA)
im = undertext(im, [('Höljet är jordat bara via PE. Krovet och däcket leder.', False, GRA)])
spara(im, 'v42_01_s07_beroring3d.png')

# 2. Ljusbågen (v42_01 bild 8)
im, A = las('ljus')
im, A = spalter(im, A, vanster=[('skal', ['tryckvåg'])],
                hoger=[('bage', ['ljusbåge', 'mellan L1 och L2']), ('sken', ['värme och', 'starkt ljus']), ('splitter', ['splitter:', 'smält metall'])], storlek=S, o=80)
d = ImageDraw.Draw(im)
for fas in ('L1', 'L2', 'L3'):
    x, y = A[fas]; d.text((x - 14, y), fas, font=f(44, True), fill=FAS[fas], anchor='rm')
mitt(d, im, 10, 'Skada utan ström genom kroppen', 50, True)
im = undertext(im, [('även giftiga gaser och buller', False, GRA)])
spara(im, 'v42_01_s08_ljusbage3d.png')

# 3. Riskområde och närområde (v42_02 bild 7)
im, A = las('zon')
im, A = spalter(im, A, vanster=[('del', ['spänningssatt del']), ('risk', ['riskområde']), ('nara', ['närområde'])],
                hoger=[('utanfor', ['utanför', 'närområdet'])], storlek=S, o=20)
im = undertext(im, [('Zonerna gäller åt alla håll, också bakåt och uppåt.', True, INK), ('Med spänning: arbete i riskområdet', False, ORANGE),
                    ('Nära spänning: arbete i närområdet', False, BLA), ('Utan spänning: efter de fem säkerhetsåtgärderna', False, BLA)], 42, 58)
spara(im, 'v42_02_s07_zoner3d.png')

# 4. Frånskilj, lås, märk och kontrollera (v42_03 bild 8)
im, A = las('las')
im, A = spalter(im, A, vanster=[('vred', ['1 Frånskilj:', 'vredet i läge 0']), ('las', ['2 Lås och märk:', 'eget hänglås']), ('tag', ['skylt: namn,', 'datum, telefon'])],
                hoger=[('plint', ['utgående plintar', 'L1, L2, L3 och PE']), ('provare', ['3 Kontrollera', 'spänningslöshet:', 'prova – mät – prova'])], storlek=S, o=20)
im = undertext(im, [('Mät mellan alla ledare och mot PE. Prova provaren mot en känd källa före och efter.', False, GRA)], 40)
spara(im, 'v42_03_s08_lasmark3d.png')

# 5. Jordning och kortslutning (v42_03 bild 21)
im, A = las('jord')
im, A = spalter(im, A, vanster=[('jordskena', ['jordskena'])],
                hoger=[('arbete', ['arbetsstället']), ('don', ['jordnings- och', 'kortslutningsdon']), ('jordledare', ['jordledaren:', 'ansluts först,', 'tas bort sist'])], storlek=S, o=110)
d = ImageDraw.Draw(im)
mitt(d, im, 8, 'Nära arbetsstället, synligt därifrån', 50, True)
for fas in ('L1', 'L2', 'L3'):
    x, y = A[fas]; d.text((x + 26, y - 24), fas, font=f(40, True), fill=FAS[fas], anchor='mm')
x, y = A['kniv']; d.text((x, y - 16), 'synligt brytställe', font=f(44, True), fill=INK, anchor='mb')
spara(im, 'v42_03_s21_jordning3d.png')
print('ok', sorted(p.name for p in UT.glob('v42*.png')))
