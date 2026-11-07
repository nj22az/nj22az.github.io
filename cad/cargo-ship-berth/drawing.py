"""Vector general arrangement, in metres; matches the original CAD design inputs."""
from pathlib import Path
from html import escape
R=Path(__file__).resolve().parent
s=['<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1130" viewBox="0 0 1600 1130">',
   '<rect width="1600" height="1130" fill="#f8f7f2"/>',
   '<style>text{font-family:Arial,sans-serif;fill:#203b46} .small{font-size:15px} .note{font-size:17px} .title{font-size:23px;font-weight:bold} .dim{stroke:#567580;stroke-width:1;fill:none} .edge{stroke:#29434b;stroke-width:1.4}</style>',
   '<defs><marker id="a" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto-start-reverse"><path d="M8 1L1 4L8 7" fill="none" stroke="#567580"/></marker></defs>']
def text(x,y,t,cls='small',anchor='start'):
    s.append(f'<text x="{x}" y="{y}" class="{cls}" text-anchor="{anchor}">{escape(t)}</text>')
def line(x1,y1,x2,y2,stroke='#29434b',width=1.4,dash=''):
    s.append(f'<path d="M{x1} {y1}L{x2} {y2}" fill="none" stroke="{stroke}" stroke-width="{width}" stroke-dasharray="{dash}"/>')
def rect(x,y,w,h,fill='#dce4df'):
    s.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{fill}" class="edge"/>')
def poly(pts,fill):
    s.append('<polygon points="'+' '.join(f'{x},{y}' for x,y in pts)+f'" fill="{fill}" class="edge"/>')
def dim(x1,y1,x2,y2,label):
    s.append(f'<path d="M{x1} {y1}L{x2} {y2}" class="dim" marker-start="url(#a)" marker-end="url(#a)"/>')
    if x1==x2:
        s.append(f'<text transform="translate({x1-12} {(y1+y2)/2}) rotate(-90)" class="small" text-anchor="middle">{escape(label)}</text>')
    else:
        text((x1+x2)/2,(y1+y2)/2-8,label,'small','middle')
text(60,51,'COASTAL CARGO SHIP + PILED QUAY','title')
text(60,79,'Original CAD concept • General arrangement • Revision A • 25 October 2026','note')
text(1540,50,'GA–001','title','end')
text(1540,77,'ALL DIMENSIONS IN METRES','small','end')
line(60,95,1540,95)
stations=[(-36,.38),(-35,.64),(-32,.88),(-27,.98),(-20,1),(-10,1),(0,1),(12,.99),(23,.89),(29,.66),(33,.36),(35,.13),(36,.018)]
sc=12.5; X=lambda x:800+x*sc
text(60,128,'01 / SHIP PLAN','title')
cy=265; Y=lambda y:cy-y*sc
outline=[(X(x),Y(-6.75*f)) for x,f in stations]+[(X(x),Y(6.75*f)) for x,f in reversed(stations)]
poly(outline,'#c4d1c6')
line(X(-38),cy,X(39),cy,'#7c969e',1,'8 6')
for x in [-9,11]:
    rect(X(x-8),Y(4.1),16*sc,8.2*sc,'#8398a2')
    for j in range(1,8):line(X(x-8+j*2),Y(4.1),X(x-8+j*2),Y(-4.1),'#536c77',1)
    text(X(x),cy+5,'HOLD 1' if x<0 else 'HOLD 2','small','middle')
rect(X(-32.45),Y(6),10.7*sc,12*sc,'#eeeae0')
rect(X(-30.75),Y(4.45),7.5*sc,8.9*sc,'#dce2df')
rect(X(-31.2),Y(2.7),2.4*sc,2.2*sc,'#9b5547')
text(X(-27),cy+5,'BRIDGE','small','middle')
for x in [-19,1]:
    s.append(f'<circle cx="{X(x)}" cy="{Y(4.9)}" r="10" fill="#c5a557" class="edge"/>')
    line(X(x),Y(4.9),X(x+12.5),Y(4.4),'#bb963b',6)
for x in [-33,26]:
    for y in [-2.8,2.8]:rect(X(x-.65),Y(y+.25),1.3*sc,.5*sc,'#566775')
text(X(29),cy+5,'F’C’SLE','small','middle')
dim(X(-36),160,X(36),160,'72.00 overall length')
for x in [-36,36]:line(X(x),164,X(x),cy,'#9aaeb4',.7)
dim(1285,Y(6.75),1285,Y(-6.75),'13.50 beam')
text(1340,220,'BOW →','note')
text(60,379,'02 / STARBOARD PROFILE','title')
base=559; Z=lambda z:base-z*sc
top=[(X(x),Z(2.4)) for x,_ in stations]
bottom=[(-36,-1.9),(-35,-2.95),(-32,-3.45),(-27,-3.6),(-20,-3.6),(-10,-3.6),(0,-3.6),(12,-3.55),(23,-3.3),(29,-2.7),(33,-1.95),(35,-1.3),(36,-.8)]
poly(top+[(X(x),Z(z)) for x,z in reversed(bottom)],'#9c5b4b')
poly(top+[(X(36),Z(0)),(X(-36),Z(0))],'#3d5664')
line(X(-40),Z(0),X(40),Z(0),'#509ca7',1,'10 5')
text(1330,Z(0)+5,'WATERLINE z = 0','small')
for x in [-9,11]:
    rect(X(x-8),Z(3.64),16*sc,1.24*sc,'#8398a2')
    for j in range(8):line(X(x-8+j*2),Z(3.64),X(x-8+j*2),Z(3.42),'#4c6570',1)
rect(X(-31.5),Z(5.52),9*sc,3*sc,'#eeeee7')
rect(X(-31.7),Z(7.84),8.2*sc,2.15*sc,'#eeeee7')
rect(X(-32.45),Z(8.015),10.7*sc,.19*sc,'#eeeee7')
rect(X(-30.75),Z(9.95),7.5*sc,1.95*sc,'#eeeee7')
rect(X(-31.125),Z(10.17),8.25*sc,.24*sc,'#eeeee7')
rect(X(-31.2),Z(12.65),2.4*sc,2.5*sc,'#b76a54')
rect(X(-31.2),Z(12.65),2.4*sc,.7*sc,'#37434b')
for x in [-29.5,-27.8,-26.1,-24.4]:rect(X(x-.7),Z(9.705),1.4*sc,.93*sc,'#436b7a')
line(X(-25),Z(10.17),X(-25),Z(15.3),'#526973',3)
line(X(31),Z(3.45),X(31),Z(9.2),'#526973',2)
rect(X(23),Z(3.45),12.5*sc,1.05*sc,'#3d5664')
for x in [-19,1]:
    rect(X(x-.65),Z(5.27),1.3*sc,2.75*sc,'#d2b366')
    line(X(x),Z(5.2),X(x),Z(9.7),'#b08c35',4)
    line(X(x+.65),Z(6),X(x+12.5),Z(8.2),'#b08c35',6)
    line(X(x),Z(9.6),X(x+12.5),Z(8.2),'#5b6570',1)
    line(X(x+12.5),Z(8.2),X(x+12.5),Z(4.1),'#5b6570',1)
dim(300,Z(2.4),300,Z(-3.6),'6.00 moulded depth')
text(1330,590,'Draft: 3.60 assumed','small')
text(60,650,'03 / BERTH PLAN','title')
sc=10; X=lambda x:800+x*sc; cy=757; Y=lambda y:cy-y*sc
poly([(X(x),Y(-6.75*f)) for x,f in stations]+[(X(x),Y(6.75*f)) for x,f in reversed(stations)],'#c4d1c6')
rect(X(-50),Y(-7.9),100*sc,18*sc,'#d1cec2')
for x in range(-45,50,5):line(X(x),Y(-7.9),X(x),Y(-25.9),'#aaa99b',.7)
for x in range(-42,43,12):rect(X(x-.925),Y(-7.9+1.15),1.85*sc,.9*sc,'#414c51')
for x in [-44,-33,-22,-11,0,11,22,33,44]:
    s.append(f'<circle cx="{X(x)}" cy="{Y(-9.3)}" r="4" fill="#293c46"/>')
for a,c in [((-33,-3.1),(-44,-9.3)),((26,-3.1),(44,-9.3)),((26,-3.1),(11,-9.3)),((-33,-3.1),(-11,-9.3))]:
    line(X(a[0]),Y(a[1]),X(c[0]),Y(c[1]),'#a48146',2)
rect(X(-22.55),Y(-6.05),1.1*sc,5.25*sc,'#dfe5de')
text(X(-27),cy,'AFT','small','middle');text(X(27),cy,'BOW','small','middle')
text(800,937,'CONCRETE QUAY  /  fenders at 12 m centres  /  bollards at 11 m centres','small','middle')
dim(X(-50),1040,X(50),1040,'100.00 berth length')
dim(1375,Y(-7.9),1375,Y(-25.9),'18.00')
text(70,741,'1.15 nominal gap','small');text(70,763,'from parallel hull','small');text(70,785,'side to quay edge','small')
text(70,838,'Gangway 1.10 × 5.25','small');text(70,860,'Quay top z = +2.10','small');text(70,882,'Pile toe z = −7.50','small')
line(60,1071,1540,1071)
text(60,1103,'CONCEPT ONLY — assumed dimensions; no structural, stability, load or navigation certification. Views schematic; CAD controls.','small')
text(1540,1103,'CAD UNITS: mm  |  GLB UNITS: m','small','end')
s.append('</svg>');(R/'general-arrangement.svg').write_text('\n'.join(s))
