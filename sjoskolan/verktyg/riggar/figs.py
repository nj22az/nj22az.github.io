from svg import *
def no(s,x1,x2,y,label,lab_y=None,c=INK):
    s.line([(x1,y),(x1+14,y)],c); s.line([(x2-14,y),(x2,y)],c); s.line([(x1+14,y),(x2-16,y-14)],c)
    s.dot(x1+14,y,c); s.dot(x2-14,y,c); s.text((x1+x2)/2,(lab_y or y-22),label,12)
def nc(s,x1,x2,y,label,lab_y=None,c=INK):
    s.line([(x1,y),(x1+14,y)],c); s.line([(x2-14,y),(x2,y)],c); s.line([(x1+14,y),(x2-12,y+6)],c); s.line([(x2-14,y),(x2-14,y+10)],c)
    s.dot(x1+14,y,c); s.dot(x2-14,y,c); s.text((x1+x2)/2,(lab_y or y-18),label,12)
def fault(s,x,y,label): s.b.append(f'<rect x="{x-13}" y="{y-10}" width="26" height="20" rx="3" fill="#fff4e5" stroke="#9a4a12" stroke-width="1.5" stroke-dasharray="3 2"/>'); s.text(x,y+4,label,11,'#9a4a12',bold=True)
def coilbox(s,x,y,label): s.b.append(f'<rect x="{x-22}" y="{y-14}" width="44" height="28" fill="#fff" stroke="{INK}" stroke-width="2.5"/>'); s.text(x,y+5,label,13,bold=True)
def inductor(s,x1,x2,y):
    n=4; w=(x2-x1)/n; d=f'M{x1} {y}'+''.join(f' a{w/2} {w/2} 0 0 1 {w} 0' for _ in range(n)); s.b.append(f'<path d="{d}" fill="none" stroke="{INK}" stroke-width="2.5"/>')
def cap(s,x,y): s.line([(x-4,y-14),(x-4,y+14)],INK,3); s.line([(x+4,y-14),(x+4,y+14)],INK,3)

# ---------------- Station A ----------------
A=S(780,300,'Station A: labbnätaggregat 12 V med strömgräns 100 mA matar via säkring F1 och länk P–A två resistorer R1 och R2 i serie mellan P och N. Mätpunkter P, A, B och N. En batteridriven referens 5,000 V med uttagen Ref+ och Ref− är skild från riggen.')
A.box(15,70,130,150,'Labbnät-','aggregat\n12,0 V DC\ngräns 100 mA')
A.b.append(f'<rect x="185" y="35" width="420" height="235" rx="10" fill="none" stroke="{GRAY}" stroke-width="1.5" stroke-dasharray="6 5"/>'); A.text(395,262,'Stationspanel A (SELV)',12,GRAY)
A.line([(145,100),(260,100)],RED); A.fuse(215,100,'F1 T 100 mA'); A.jack(260,100,'P',RED,'below'); A.link(260,100,340,'länk P–A'); A.jack(340,100,'A',INK,'below')
A.line([(340,100),(480,100)]); A.res(410,100,'R1 1 kΩ ±5 %'); A.jack(480,100,'B')
A.line([(480,100),(560,100),(560,200),(145,200)]); A.res(560,150,'R2 2 kΩ\n±5 %',vert=True,lx=490,ly=146); A.jack(340,200,'N',INK,'below')
A.text(150,92,'+',14,RED,'start',True); A.text(150,222,'−',14,INK,'start',True)
A.box(640,70,125,150,'Referens','5,000 V ±0,1 %\nbatteridriven\nskild från riggen'); A.jack(675,190,'Ref+',RED); A.jack(730,190,'Ref−')

# ---------------- Station B, AC ----------------
B=S(1000,330,'Station B, AC: funktionsgenerator och klass D-förstärkare med BTL-utgång, matad från ett 24 V SELV-nätaggregat, ger via säkring F1 spänning till uttagen UT och COM med en last på 100 Ω. M1 true RMS, M2 sinuskalibrerad och en differentialprob till oscilloskopet ansluts parallellt till UT och COM.')
B.box(10,50,130,90,'Funktions-','generator\nsinus, fyrkant,\ntriangel')
B.box(170,40,150,120,'Förstärkare','klass D, BTL\ningen utgång\npå jord')
B.box(170,215,150,75,'Nätaggregat','24 V DC, SELV')
B.line([(140,95),(170,95)]); B.line([(245,160),(245,215)])
B.b.append(f'<rect x="350" y="30" width="210" height="190" rx="10" fill="none" stroke="{GRAY}" stroke-width="1.5" stroke-dasharray="6 5"/>'); B.text(455,212,'Stationspanel B, AC',12,GRAY)
B.line([(320,80),(1000-110,80)],RED); B.fuse(385,80,'F1 T 500 mA'); B.jack(440,80,'UT',RED)
B.line([(320,130),(345,130),(345,170),(1000-110,170)]); B.jack(440,170,'COM',INK,'below')
B.res(495,125,'Rlast\n100 Ω\n10 W',vert=True,lx=510,ly=112); B.dot(495,80,RED); B.dot(495,170)
for x,t,sub in ((590,'M1','true RMS'),(700,'M2','sinuskalibr.'),(810,'Diff.prob','CAT-klassad')):
    B.box(x,100,100,50,t,sub); B.line([(x+50,80),(x+50,100)],RED); B.line([(x+50,150),(x+50,170)]); B.dot(x+50,80,RED); B.dot(x+50,170)
B.box(810,235,100,55,'Oscilloskop','kanal 1'); B.line([(860,150),(860,160)],INK,2,'4 3'); B.text(930,215,'probens utgång → CH1',12,GRAY,'end')
B.line([(910,125),(960,125),(960,262),(910,262)],INK,2)

# ---------------- Station B, trefas ----------------
T=S(900,360,'Station B, trefas: 400 V-matning via jordfelsbrytare och säkringar till en trefas säkerhetstransformator 400 V Δ / 12 V Y med N. På sekundärsidan finns säkringar, strömmätlänkar i L1, L2, L3 och N, lastlänkar och tre laster på 100 Ω i Y med stjärnpunktsuttaget S. N-länken mellan N och S kan brytas.')
T.box(10,70,150,170,'Nätsida 400 V','CEE 16 A, 5-polig\njordfelsbrytare 30 mA\nsäkringar C6\nsluten kapsling\ninstalleras av behörig',fill='#fdecec')
T.box(190,70,130,170,'Säkerhets-','transformator\n400 V Δ / 12 V Yn\n40 VA, 50 Hz\nSS-EN 61558-2-6')
T.b.append(f'<rect x="340" y="40" width="545" height="300" rx="10" fill="none" stroke="{GRAY}" stroke-width="1.5" stroke-dasharray="6 5"/>'); T.text(612,332,'Stationspanel B, trefas (SELV)',12,GRAY)
cols={'L1':BROWN,'L2':'#222222','L3':'#8a8a8a'}
for i,(n,c) in enumerate(cols.items()):
    y=100+45*i
    T.line([(320,y),(640,y)],c); T.fuse(370,y,'T 315 mA' if i==0 else ''); T.link(420,y,460,'mätlänk' if i==0 else ''); T.jack(500,y,n,c)
    T.link(540,y,580,'lastlänk' if i==0 else ''); T.res(640,y,f'R{i+1} 100 Ω',lx=640,ly=y-16); T.line([(664,y),(740,y)],c)
T.line([(740,100),(740,300)]); T.dot(740,145); T.dot(740,190); T.jack(780,245,'S',INK); T.line([(740,245),(773,245)])
T.line([(320,300),(740,300)],NBLUE); T.link(420,300,460,'mätlänk N'); T.jack(500,300,'N',NBLUE,'below'); T.link(640,300,700,'N-länk (kan brytas)')

# ---------------- Station C ----------------
C=S(900,320,'Station C: labbnätaggregat 12 V med strömgräns 200 mA matar via säkring F2 hållkretsen: STOPP S0 (NC), START S1 (NO) parallellt med K1:s hjälpkontakt (NO), reläspolen K1 med släckdiod och returen via en strömmätlänk. Mätpunkter +U, a, b, c och 0 V. Felbrytarna X1–X5 sitter bakom en låst lucka.')
C.box(10,70,120,150,'Labbnät-','aggregat\n12,0 V DC\ngräns 200 mA')
C.b.append(f'<rect x="160" y="25" width="720" height="265" rx="10" fill="none" stroke="{GRAY}" stroke-width="1.5" stroke-dasharray="6 5"/>'); C.text(520,282,'Stationspanel C (SELV)',12,GRAY)
C.line([(130,110),(170,110)],RED); C.fuse(195,110,'F2 T 200 mA'); C.line([(211,110),(240,110)],RED); C.jack(240,110,'+U',RED,'below')
C.line([(240,110),(265,110)]); fault(C,280,110,'X1'); nc(C,293,370,110,'S0 STOPP'); C.jack(395,110,'a'); C.line([(370,110),(420,110)])
C.line([(420,60),(420,160)]); C.line([(420,60),(440,60)]); no(C,440,515,60,'S1 START'); fault(C,530,60,'X2'); C.line([(543,60),(560,60)])
C.line([(420,160),(440,160)]); no(C,440,515,160,'K1 NO',lab_y=190); fault(C,530,160,'X3'); C.line([(543,160),(560,160)])
C.line([(560,60),(560,160)]); C.line([(560,110),(600,110)]); C.jack(600,110,'b')
C.line([(600,110),(620,110)]); fault(C,633,110,'X4'); C.line([(646,110),(660,110)]); coilbox(C,685,110,'K1'); C.line([(707,110),(740,110)])
C.line([(670,110),(670,78),(700,78),(700,110)],INK,1.8); C.b.append('<path d="M679 70 L691 78 L679 86 Z M691 70 V86" fill="#fff" stroke="#163248" stroke-width="1.8"/>'); C.text(685,62,'släckdiod',11,GRAY)
C.jack(740,110,'c'); C.link(760,110,800,'mätlänk'); C.line([(800,110),(840,110),(840,230),(790,230)])
fault(C,775,230,'X5'); C.line([(762,230),(240,230)]); C.jack(240,230,'0 V',INK,'below'); C.line([(240,230),(130,230)])
C.text(135,102,'+',14,RED,'start',True); C.text(135,250,'−',14,INK,'start',True)

# ---------------- Komponentplatta vecka 40 ----------------
K=S(900,280,'Komponentplatta vecka 40: från UT via strömmätlänk och resistorn R 39 Ω till spolen L 100 mH och kondensatorn C 100 µF, var och en med en kortslutningslänk, och via en shunt på 1 Ω tillbaka till COM. Mätuttag 1–4 mellan komponenterna.')
K.b.append(f'<rect x="120" y="30" width="760" height="230" rx="10" fill="none" stroke="{GRAY}" stroke-width="1.5" stroke-dasharray="6 5"/>'); K.text(500,252,'Komponentplatta (SELV, matas från Station B:s förstärkare)',12,GRAY)
K.jack(90,100,'UT',RED); K.jack(90,200,'COM',INK,'below')
K.line([(90,100),(840,100),(840,200),(90,200)])
K.link(140,100,180,'mätlänk'); K.res(250,100,'R 39 Ω 10 W'); K.jack(320,100,'1')
inductor(K,380,460,100); K.text(420,128,'L 100 mH',12); K.link(370,100,470,'kortslutning'.replace('kortslutning','')); K.jack(520,100,'2')
K.b.append('<rect x="566" y="84" width="28" height="32" fill="#fff"/>'); cap(K,580,100); K.text(580,128,'C 100 µF',12); K.jack(640,100,'3')
K.res(760,200,'shunt 1 Ω',lx=760,ly=184); K.jack(700,200,'4',INK,'below')
K.text(420,152,'länk över L: R eller RC',11,GRAY); K.text(590,152,'länk över C: R eller RL',11,GRAY)
K.link(560,100,600,'')
open('figs.html','w').write('\n'.join([A.svg('figA'),B.svg('figB'),T.svg('figT'),C.svg('figC'),K.svg('figK')]))
print('ok')
