#!/usr/bin/env python3
"""Draw Pocket Camera's original Minato playing-card sprites from the World stickers.

Run from the repository root with Pillow: python3 tools/draw-playing-cards.py
The sheet has 13 columns (A to K) and four rows (hearts, diamonds, clubs,
spades). Each tile is 160 by 224 pixels. Source stickers are the camera's own
Johansson, Thuận and Thao artwork; no third-party playing-card art is used.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'camera' / 'cards'
W, H = 160, 224
CREAM = '#fff8e8'
INK = '#214b49'
CORAL = '#b85046'
GOLD = '#d9b876'
SUITS = ('hearts', 'diamonds', 'clubs', 'spades')
FACES = {11: ('THẢO', 'thao-pixar/Wave.webp'),
         12: ('THUẬN', 'thuan-blender/wave.webp'),
         13: ('JOHANSSON', 'johansson-pixar/Wave.webp')}

def font(size):
    for path in ('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
                 '/Library/Fonts/Arial Bold.ttf', 'C:/Windows/Fonts/arialbd.ttf'):
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            pass
    return ImageFont.load_default()

def suit(draw, name, x, y, size, colour):
    """Draw a conventional suit, centred on x/y, without font glyph dependencies."""
    s = size
    def ellipse(box): draw.ellipse(tuple(round(v) for v in box), fill=colour)
    def poly(points): draw.polygon([(round(a),round(b)) for a,b in points], fill=colour)
    if name == 'diamonds':
        poly([(x,y-s*.58),(x+s*.43,y),(x,y+s*.58),(x-s*.43,y)])
    elif name == 'hearts':
        ellipse((x-s*.46,y-s*.43,x,y+s*.04)); ellipse((x,y-s*.43,x+s*.46,y+s*.04))
        poly([(x-s*.46,y-s*.17),(x+s*.46,y-s*.17),(x,y+s*.57)])
    elif name == 'clubs':
        ellipse((x-s*.22,y-s*.51,x+s*.22,y-s*.07)); ellipse((x-s*.46,y-s*.12,x,y+s*.31)); ellipse((x,y-s*.12,x+s*.46,y+s*.31))
        poly([(x-s*.09,y+s*.18),(x+s*.09,y+s*.18),(x+s*.22,y+s*.53),(x-s*.22,y+s*.53)])
    else:
        poly([(x,y-s*.55),(x-s*.45,y+s*.05),(x+s*.45,y+s*.05)])
        ellipse((x-s*.45,y-s*.16,x,y+s*.30)); ellipse((x,y-s*.16,x+s*.45,y+s*.30))
        poly([(x-s*.09,y+s*.18),(x+s*.09,y+s*.18),(x+s*.22,y+s*.52),(x-s*.22,y+s*.52)])

def indices(card, rank, name, colour):
    small=Image.new('RGBA',(38,58),(0,0,0,0)); d=ImageDraw.Draw(small)
    label={1:'A',11:'J',12:'Q',13:'K'}.get(rank,str(rank))
    d.text((19,1),label,font=font(29 if rank != 10 else 24),fill=colour,anchor='mt',stroke_width=0)
    suit(d,name,19,47,17,colour)
    card.alpha_composite(small,(6,6))
    card.alpha_composite(small.rotate(180),(W-44,H-64))

PIPS={1:[(.5,.5)],2:[(.5,.26),(.5,.74)],3:[(.5,.22),(.5,.5),(.5,.78)],
      4:[(.32,.25),(.68,.25),(.32,.75),(.68,.75)],
      5:[(.32,.25),(.68,.25),(.5,.5),(.32,.75),(.68,.75)],
      6:[(.32,.22),(.68,.22),(.32,.5),(.68,.5),(.32,.78),(.68,.78)],
      7:[(.32,.2),(.68,.2),(.5,.35),(.32,.5),(.68,.5),(.32,.8),(.68,.8)],
      8:[(.32,.19),(.68,.19),(.5,.34),(.32,.5),(.68,.5),(.5,.66),(.32,.81),(.68,.81)],
      9:[(.32,.17),(.68,.17),(.32,.39),(.68,.39),(.5,.5),(.32,.61),(.68,.61),(.32,.83),(.68,.83)],
      10:[(.32,.16),(.68,.16),(.5,.27),(.32,.39),(.68,.39),(.32,.61),(.68,.61),(.5,.73),(.32,.84),(.68,.84)]}

def make_card(rank, name, stickers):
    colour=CORAL if name in ('hearts','diamonds') else INK
    card=Image.new('RGBA',(W,H),(0,0,0,0));d=ImageDraw.Draw(card)
    d.rounded_rectangle((1,1,W-2,H-2),radius=9,fill=CREAM,outline=INK,width=3)
    d.rounded_rectangle((5,5,W-6,H-6),radius=7,outline=GOLD,width=1)
    if rank <= 10:
        for x,y in PIPS[rank]: suit(d,name, x*W, 38+y*(H-76), 24 if rank>1 else 40,colour)
    else:
        d.rounded_rectangle((37,30,123,191),radius=9,fill='#e2eee1',outline=colour,width=2)
        d.line((40,51,120,51),fill=GOLD,width=2)
        d.line((40,170,120,170),fill=GOLD,width=2)
        img=stickers[rank].copy();img.thumbnail((79,135),Image.Resampling.LANCZOS)
        card.alpha_composite(img,((W-img.width)//2,51+(119-img.height)//2))
        d=ImageDraw.Draw(card)
        d.text((W/2,178),FACES[rank][0],fill=INK,font=font(9),anchor='mm')
    indices(card,rank,name,colour)
    return card

def make_back():
    card=Image.new('RGBA',(W,H),(0,0,0,0));d=ImageDraw.Draw(card)
    d.rounded_rectangle((1,1,W-2,H-2),radius=9,fill=CREAM,outline=INK,width=3)
    d.rounded_rectangle((8,8,W-9,H-9),radius=6,fill=INK,outline=GOLD,width=2)
    d.rounded_rectangle((15,15,W-16,H-16),radius=4,fill='#75ad9c',outline=CREAM,width=2)
    for y in range(32,195,14):
        for x in range(30,131,14):
            d.rectangle((x,y,x+2,y+2),fill='#a4c6b1')
    d.ellipse((38,62,122,146),fill=CREAM,outline=INK,width=3)
    d.polygon([(50,125),(64,98),(80,85),(96,98),(110,125)],fill='#ddb574',outline=INK)
    d.rectangle((53,119,107,129),fill='#eee1b4')
    d.line((45,142,115,142),fill=INK,width=3)
    d.line((52,149,108,149),fill=CREAM,width=3)
    d.text((80,169),'MINATO',font=font(13),fill=CREAM,anchor='mm')
    return card

def build():
    OUT.mkdir(parents=True,exist_ok=True)
    stickers={r:Image.open(ROOT/'camera'/'stickers'/p).convert('RGBA') for r,(_,p) in FACES.items()}
    sheet=Image.new('RGBA',(W*13,H*4),(0,0,0,0))
    for row,name in enumerate(SUITS):
        for rank in range(1,14): sheet.alpha_composite(make_card(rank,name,stickers),((rank-1)*W,row*H))
    sheet.save(OUT/'playing-cards.png',optimize=True)
    make_back().save(OUT/'playing-card-back.png',optimize=True)
    print('Wrote 52 cards and one back to',OUT)

if __name__ == '__main__': build()
