import sys; sys.path.insert(0, sys.argv[1])
import figlib as L
from figlib import *
L.OUT=sys.argv[2]
T=np.linspace
PH=[BLUE,"#1f1f1f",GRAY]           # L1, L2, L3 som i kursens tidsdiagram
PHC=[BLUE,ORANGE,GREEN]            # visare L1, L2, L3

def pax(F,rect=(0.02,0.02,0.96,0.96),lim=1.5,xl=None,yl=None):
    ax=F.add_axes(rect); ax.set_aspect("equal"); ax.axis("off")
    ax.set_xlim(*(xl or (-lim,lim))); ax.set_ylim(*(yl or (-lim,lim))); return ax

def lines(ax,x0,x1,ys,names=("L1","L2","L3","N")):
    for y,n in zip(ys,names):
        ax.plot([x0,x1],[y,y],color=INK,lw=LW); ax.text(x0-0.1,y,n,ha="right",va="center",fontsize=14)

def yload(ax,cx,cy,r,labels=("","",""),tlabels=("L1","L2","L3"),neutral=False,lcol=INK):
    pts=[]
    for k,a in enumerate((90,210,330)):
        e=(cx+r*np.cos(np.radians(a)),cy+r*np.sin(np.radians(a))); pts.append(e)
        rresistor(ax,(cx,cy),e,labels[k],loff=0.32 if k==0 else -0.32,lcolor=lcol)
        dot(ax,*e); ax.text(e[0]+0.18*np.cos(np.radians(a)),e[1]+0.18*np.sin(np.radians(a)),tlabels[k],ha="center",va="center",fontsize=14)
    dot(ax,cx,cy)
    if neutral: ax.text(cx+0.12,cy-0.18,"N",fontsize=13,color=GRAY)
    return pts

def dload(ax,cx,cy,r,labels=("","",""),tlabels=("L1","L2","L3")):
    V=[(cx+r*np.cos(np.radians(a)),cy+r*np.sin(np.radians(a))) for a in (90,210,330)]
    for k,(i,j) in enumerate(((0,1),(1,2),(2,0))):
        rresistor(ax,V[i],V[j],labels[k],loff=-0.32 if k!=1 else -0.3)
    for k,v in enumerate(V):
        dot(ax,*v); a=np.radians((90,210,330)[k]); ax.text(v[0]+0.22*np.cos(a),v[1]+0.22*np.sin(a),tlabels[k],ha="center",va="center",fontsize=14)
    return V

# ================= v41_01 Trefassystemets grunder =================
# s7 teori: fas- och linjespänning som visare
F=fig(4.3,3.6); ax=pax(F,lim=1.55)
tips=[phasor(ax,a,1.0,c,l,lr=1.2) for a,c,l in ((90,PHC[0],"U₁N"),(210,PHC[1],"U₂N"),(330,PHC[2],"U₃N"))]
ax.plot(*zip(tips[0],tips[1]),color=RED,lw=2.2,ls="--"); ax.text((tips[0][0]+tips[1][0])/2-0.1,(tips[0][1]+tips[1][1])/2+0.05,"U₁₂",color=RED,fontsize=15,ha="right")
ax.text(0.08,-0.2,"N",fontsize=13,color=GRAY); dot(ax,0,0)
ax.text(1.5,-1.45,"Uᴸ = √3 · Uꜰ",ha="right",fontsize=15)
save(F,"v41_01_s07_fas_linje")
# s8 teori: skillnaden mellan två visare
F=fig(4.3,3.6); ax=pax(F,xl=(-1.4,1.6),yl=(-1.2,1.5))
a1=phasor(ax,90,1.0,PHC[0],"U₁N",lr=1.15); a2=phasor(ax,210,1.0,PHC[1],"U₂N",lr=1.2)
ax.add_patch(FancyArrowPatch(a2,a1,arrowstyle="-|>",mutation_scale=18,color=RED,lw=2.6))
ax.text(-0.72,0.35,"U₁₂ = U₁N − U₂N",color=RED,fontsize=14,ha="right")
ax.add_patch(Arc((0,0),0.6,0.6,theta1=90,theta2=210,color=INK,lw=1.3)); ax.text(-0.36,0.26,"120°",fontsize=13,ha="right")
ax.text(1.55,-1.1,"|U₁₂| = √3 · Uꜰ",ha="right",fontsize=15)
save(F,"v41_01_s08_rot3")
# s11 Ö1: vinkeln mellan faserna
F=fig(4.3,3.0); ax=pax(F,lim=1.45)
for a,c,l in ((90,PHC[0],"L1"),(210,PHC[1],"L2"),(330,PHC[2],"L3")): phasor(ax,a,1.0,c,l,lr=1.2)
ax.add_patch(Arc((0,0),0.7,0.7,theta1=90,theta2=210,color=RED,lw=1.6)); ax.text(-0.45,0.32,"? °",color=RED,fontsize=16,ha="right")
save(F,"v41_01_s11_ovn1")
# s13 Ö2: tre sinus, tidsförskjutning okänd
F=fig(4.3,3.0); ax=wave_ax(F); t=T(0,30,600)
for k,c in enumerate(PHC): ax.plot(t,np.sin(2*np.pi*(t-k*20/3)/20),color=c,lw=2.2)
ax.set_xlim(0,31); ax.set_ylim(-1.35,1.7); ax.set_xticks([]); ax.set_yticks([])
ax.plot([5,5],[0,1.05],color=GRAY,lw=1,ls=":"); ax.plot([5+20/3,5+20/3],[0,1.05],color=GRAY,lw=1,ls=":")
bracket(ax,5,5+20/3,1.12,"Δt = ?",color=RED)
ax.text(1,1.25,"L1",color=PHC[0],fontsize=14); ax.text(30.5,-1.3,"f = 50 Hz",ha="right",fontsize=13,color=BLUE)
save(F,"v41_01_s13_ovn2")
# s15 Ö3 / s17 Ö4: spänningar mellan ledare
def supply(name,lab12,lab1n):
    F=fig(4.3,3.0); ax=cax(F,(-0.6,4.4),(-0.4,3.1)); ys=(2.6,1.8,1.0,0.2)
    lines(ax,0.2,4.2,ys)
    for y in ys: dot(ax,1.6,y,0.05) if y in (2.6,1.8) else None
    dot(ax,3.0,2.6,0.05); dot(ax,3.0,0.2,0.05)
    vmark(ax,(1.6,2.6),(1.6,1.8),lab12,off=(0.12,0))
    vmark(ax,(3.0,2.6),(3.0,0.2),lab1n,off=(0.12,-0.4))
    save(F,name)
supply("v41_01_s15_ovn3","Uᴸ = 400 V","Uꜰ = ?")
supply("v41_01_s17_ovn4","Uᴸ = ?","Uꜰ = 120 V")
# s19 Ö5: Y-last på trefastränaren
F=fig(4.3,3.0); ax=cax(F,(-1.6,2.6),(-1.1,1.75)); V=yload(ax,0,0,1.15)
vmark(ax,V[1],V[2],"Uᴸ = 12,0 V",off=(0,-0.28),ha="center")
ax.text(1.0,0.75,"Ugren = ?",color=RED,fontsize=15)
save(F,"v41_01_s19_ovn5")
# s21 teori: symmetriska strömmar summerar till noll
F=fig(4.3,3.6); ax=pax(F,xl=(-0.6,2.0),yl=(-1.1,1.4))
p=(0,0); pts=[p]
for a,c,l in ((90,PHC[0],"I₁"),(-30,PHC[1],"I₂"),(210,PHC[2],"I₃")):
    q=(p[0]+np.cos(np.radians(a)),p[1]+np.sin(np.radians(a)))
    ax.add_patch(FancyArrowPatch(p,q,arrowstyle="-|>",mutation_scale=18,color=c,lw=2.6)); m=((p[0]+q[0])/2,(p[1]+q[1])/2)
    ax.text(m[0]+(-0.18 if a==90 else 0.2 if a==-30 else 0),m[1]+(0 if a!=210 else -0.2),l,color=c,fontsize=15,ha="center",va="center"); p=q
ax.text(0.5,1.25,"Visarna sluter en triangel:",fontsize=13,ha="center"); ax.text(0.5,-0.85,"I⃗N = 0 vid symmetri",fontsize=15,ha="center")
save(F,"v41_01_s21_symmetri")
# s22 teori: osymmetri ger neutralström
F=fig(4.3,3.6); ax=pax(F,xl=(-0.7,2.0),yl=(-1.1,1.45))
p=(0,0)
for a,c,l,Lg in ((90,PHC[0],"10 A",1.0),(-30,PHC[1],"10 A",1.0),(210,PHC[2],"4 A",0.4)):
    q=(p[0]+Lg*np.cos(np.radians(a)),p[1]+Lg*np.sin(np.radians(a)))
    ax.add_patch(FancyArrowPatch(p,q,arrowstyle="-|>",mutation_scale=18,color=c,lw=2.6)); m=((p[0]+q[0])/2,(p[1]+q[1])/2)
    ax.text(m[0]+(-0.25 if a==90 else 0.28 if a==-30 else 0),m[1]+(0 if a!=210 else -0.2),l,color=c,fontsize=14,ha="center",va="center"); p=q
ax.add_patch(FancyArrowPatch(p,(0,0),arrowstyle="-|>",mutation_scale=18,color=INK,lw=2.4,ls="--"))
ax.text(p[0]/2-0.05,p[1]/2+0.1,"I⃗N",fontsize=15,ha="right")
ax.text(0.65,1.3,"Olika faslaster: triangeln sluts av I⃗N",fontsize=13,ha="center")
save(F,"v41_01_s22_osymmetri")
# s23 teori: mätpunkter
F=fig(4.3,3.4); ax=cax(F,(-0.6,4.4),(-0.4,3.3)); ys=(2.8,2.0,1.2,0.3); lines(ax,0.2,4.2,ys)
for x,(y1,y2),lab in ((1.1,(2.8,2.0),"U₁₂"),(1.9,(2.0,1.2),"U₂₃"),(2.7,(2.8,1.2),"U₃₁"),(3.6,(2.8,0.3),"U₁N")):
    dot(ax,x,y1,0.05); dot(ax,x,y2,0.05); vmark(ax,(x,y1),(x,y2),lab,off=(0.1,0),color=BLUE if lab!="U₁N" else ORANGE)
save(F,"v41_01_s23_matpunkter")
# s26 Ö6: tre lika strömmar
F=fig(4.3,3.0); ax=pax(F,lim=1.45)
for a,c,l in ((90,PHC[0],"8,0 A"),(210,PHC[1],"8,0 A"),(330,PHC[2],"8,0 A")): phasor(ax,a,1.0,c,l,lr=1.25,fs=14)
ax.text(1.4,-1.35,"IN = ?",ha="right",color=RED,fontsize=16)
save(F,"v41_01_s26_ovn6")
# s28 Ö7: en fas–neutral-last
F=fig(4.3,3.0); ax=cax(F,(-0.7,4.3),(-0.4,3.1)); ys=(2.6,1.9,1.2,0.3); lines(ax,0.2,2.2,ys)
ax.plot([2.2,3.3],[2.6,2.6],color=INK,lw=LW); rresistor(ax,(3.3,2.6),(3.3,0.3),"Last",loff=0.55)
ax.plot([2.2,3.3],[0.3,0.3],color=INK,lw=LW)
arrow(ax,(2.35,2.6),(3.0,2.6),label="5,0 A",lp=(2.7,2.85),va="bottom"); arrow(ax,(3.0,0.3),(2.35,0.3),label="IN = ?",lp=(2.7,0.55),va="bottom")
save(F,"v41_01_s28_ovn7")
# s30 Ö8: två strömmar med 120°
F=fig(4.3,3.0); ax=pax(F,lim=1.45)
phasor(ax,90,1.0,PHC[0],"10 A",lr=1.2,fs=14); phasor(ax,210,1.0,PHC[1],"10 A",lr=1.25,fs=14)
ax.add_patch(Arc((0,0),0.6,0.6,theta1=90,theta2=210,color=INK,lw=1.3)); ax.text(-0.38,0.28,"120°",fontsize=13,ha="right")
ax.text(1.1,-0.6,"I₃ = 0",fontsize=14,color=GRAY); ax.text(1.4,-1.35,"|IN| = ?",ha="right",color=RED,fontsize=16)
save(F,"v41_01_s30_ovn8")
# s32 Ö9: tre linjespänningar
F=fig(4.3,3.0); ax=F.add_axes((0.14,0.16,0.82,0.74))
for sp in ("top","right"): ax.spines[sp].set_visible(False)
vals=(400,402,398); ax.bar([0,1,2],[v-394 for v in vals],bottom=394,color=[BLUE,"#4f7fb0","#8fb0d3"],width=0.55)
for k,v in enumerate(vals): ax.text(k,v+0.3,f"{v} V",ha="center",fontsize=14)
ax.set_xticks([0,1,2]); ax.set_xticklabels(["U₁₂","U₂₃","U₃₁"],fontsize=14); ax.set_ylim(394,405); ax.set_yticks([395,400,405]); ax.tick_params(labelsize=11,colors=GRAY)
ax.text(2.45,404.3,"Umedel = ?   avvikelse = ? %",ha="right",color=RED,fontsize=14)
ax.text(-0.45,394.6,"axeln börjar vid 394 V",fontsize=10,color=GRAY)
save(F,"v41_01_s32_ovn9")
# s34 Ö10: bruten neutralledare
F=fig(4.3,3.0); ax=cax(F,(-0.7,4.4),(-0.5,3.1)); ys=(2.6,1.9,1.2,0.3); lines(ax,0.2,1.6,ys)
for y in (2.6,1.9): ax.plot([1.6,2.4 if y==2.6 else 3.4],[y,y],color=INK,lw=LW)
ax.plot([1.6,2.2],[0.3,0.3],color=INK,lw=LW)
rresistor(ax,(2.4,2.6),(2.4,1.05),"Ra",loff=-0.4); rresistor(ax,(3.4,1.9),(3.4,1.05),"Rb",loff=0.4)
ax.plot([2.4,3.4],[1.05,1.05],color=INK,lw=LW); dot(ax,2.9,1.05); ax.plot([2.9,2.9],[1.05,0.3],color=INK,lw=LW); ax.plot([2.2,2.9],[0.3,0.3],color=INK,lw=LW,ls=":")
ax.plot([2.45,2.65],[0.18,0.42],color=RED,lw=3); ax.plot([2.45,2.65],[0.42,0.18],color=RED,lw=3); ax.text(2.55,-0.05,"brott",color=RED,fontsize=13,ha="center",va="top")
ax.text(4.35,2.25,"Ua = ?\nUb = ?",ha="right",color=RED,fontsize=14,va="center")
save(F,"v41_01_s34_ovn10")

# ================= v41_02 Y, Δ och trefaseffekt =================
# s7 teori: linje- och grenström i Δ
F=fig(4.3,3.6); ax=cax(F,(-2.1,2.3),(-1.4,2.2)); V=dload(ax,0,0,1.25)
arrow(ax,(V[0][0],V[0][1]+0.75),(V[0][0],V[0][1]+0.25),color=RED,label=None); ax.text(V[0][0]+0.12,V[0][1]+0.55,"Iᴸ",color=RED,fontsize=15)
m=((V[0][0]+V[1][0])/2,(V[0][1]+V[1][1])/2); ax.text(m[0]-0.55,m[1]+0.25,"Igren",color=BLUE,fontsize=15,ha="right")
ax.text(2.25,-1.3,"Iᴸ = √3 · Igren",ha="right",fontsize=15)
save(F,"v41_02_s07_delta_strom")
# s11 Ö1 / s13 Ö2: Y-last
def ytask(name,labels,extra):
    F=fig(4.3,3.0); ax=cax(F,(-1.7,2.7),(-1.1,1.75)); V=yload(ax,0,0,1.15,labels=labels)
    vmark(ax,V[1],V[2],"Uᴸ = 400 V",off=(0,-0.28),ha="center"); extra(ax,V); save(F,name)
ytask("v41_02_s11_ovn1",("40 Ω","40 Ω","40 Ω"),lambda ax,V:ax.text(1.0,0.8,"Ugren = ?",color=RED,fontsize=15))
ytask("v41_02_s13_ovn2",("40 Ω","40 Ω","40 Ω"),lambda ax,V:(arrow(ax,(V[0][0],V[0][1]+0.5),(V[0][0],V[0][1]+0.08),label="Iᴸ = ?",lp=(V[0][0]+0.15,V[0][1]+0.3),ha="left"),ax.text(1.0,0.2,"Igren = ?",color=RED,fontsize=15)))
# s15 Ö3: Δ-last
F=fig(4.3,3.0); ax=cax(F,(-2.1,2.8),(-1.15,1.9)); V=dload(ax,0,0,1.15,labels=("40 Ω","40 Ω","40 Ω"))
vmark(ax,(V[1][0],V[1][1]-0.35),(V[2][0],V[2][1]-0.35),"Uᴸ = 400 V",off=(0,-0.25),ha="center")
arrow(ax,(V[0][0],V[0][1]+0.55),(V[0][0],V[0][1]+0.12),label="Iᴸ = ?",lp=(V[0][0]+0.15,V[0][1]+0.35),ha="left"); ax.text(1.1,0.75,"Igren = ?",color=RED,fontsize=15)
save(F,"v41_02_s15_ovn3")
# s17 Ö4: trefaslast
def motor(ax,x,y,txt="M\n3~",r=0.5):
    ax.add_patch(Circle((x,y),r,fc="white",ec=INK,lw=LW,zorder=3)); ax.text(x,y,txt,ha="center",va="center",fontsize=14,zorder=4)
def threeline(ax,x0,x1,y0,dy=0.3):
    for k,n in enumerate(("L1","L2","L3")):
        y=y0-k*dy; ax.plot([x0,x1],[y,y],color=INK,lw=LW); ax.text(x0-0.1,y,n,ha="right",va="center",fontsize=13)
F=fig(4.3,3.0); ax=cax(F,(-0.6,4.4),(-0.3,2.9)); threeline(ax,0.2,2.6,2.2)
for k in range(3): ax.plot([2.6,3.3-0.2+k*0.2],[2.2-k*0.3,1.35],color=INK,lw=LW)
motor(ax,3.3,0.9); arrow(ax,(0.6,2.2),(1.3,2.2),label="Iᴸ = 10 A",lp=(0.95,2.45),va="bottom")
vmark(ax,(1.9,2.2),(1.9,1.6),"Uᴸ = 400 V",off=(0.12,-0.45))
ax.text(0.2,0.4,"cos φ = 0,80",fontsize=14); ax.text(4.35,2.6,"P = ?",ha="right",color=RED,fontsize=16)
save(F,"v41_02_s17_ovn4")
# s19 Ö5: triangel utan P-värde
F=fig(4.3,3.0); triangle(F,0.8,0.6,("P","Q = ?","S = ?"),rect=(0.06,0.04,0.9,0.92),angle_label="φ",note="cos φ = 0,80, induktiv"); save(F,"v41_02_s19_ovn5")
# s21 teori: motorns kopplingsplint Y och Δ
def plint(ax,x0,y0,mode,title,q=False):
    tops=("W2","U2","V2"); bots=("U1","V1","W1"); dx=0.62
    ax.add_patch(Rectangle((x0-0.35,y0-0.35),dx*2+0.7,1.25,fc="#f4f7fa",ec=GRAY,lw=1.2))
    for k in range(3):
        for (yy,lab) in ((y0+0.55,tops[k]),(y0,bots[k])):
            ax.add_patch(Circle((x0+k*dx,yy),0.1,fc="white",ec=INK,lw=1.6,zorder=3)); ax.text(x0+k*dx,yy+(0.2 if yy>y0 else -0.2),lab,ha="center",va="center",fontsize=11)
    c=RED if q else INK
    if mode=="Y": ax.plot([x0,x0+2*dx],[y0+0.55,y0+0.55],color=c,lw=4,solid_capstyle="round",zorder=2)
    if mode=="D":
        for k in range(3): ax.plot([x0+k*dx,x0+k*dx],[y0,y0+0.55],color=c,lw=4,solid_capstyle="round",zorder=2)
    for k,n in enumerate(("L1","L2","L3")): ax.plot([x0+k*dx,x0+k*dx],[y0-0.1,y0-0.55],color=INK,lw=1.6); ax.text(x0+k*dx,y0-0.72,n,ha="center",fontsize=11)
    ax.text(x0+dx,y0+1.05,title,ha="center",fontsize=15,color=c)
F=fig(4.3,3.4); ax=cax(F,(-0.5,4.2),(-1.0,2.3)); plint(ax,0.0,0.3,"Y","Y (stjärna)"); plint(ax,2.35,0.3,"D","Δ (triangel)")
save(F,"v41_02_s21_plint")
# s22 teori: effektflöde i motorn
F=fig(4.3,3.0); ax=cax(F,(-0.2,4.4),(-0.6,2.5))
ax.add_patch(Polygon([(0,1.6),(2.6,1.6),(3.6,1.15),(2.6,0.7),(0,0.7)],closed=True,fc=BLUE,alpha=0.25,ec=BLUE,lw=1.5))
ax.add_patch(Polygon([(2.0,0.7),(2.35,0.7),(2.35,-0.2),(2.2,-0.4),(2.0,-0.2)],closed=True,fc=RED,alpha=0.25,ec=RED,lw=1.5))
ax.text(0.2,1.15,"Pᵢₙ elektrisk",fontsize=15,va="center"); ax.text(3.65,1.15,"Paxel",fontsize=15,va="center"); ax.text(2.5,-0.2,"förluster",fontsize=14,color=RED,va="center")
ax.text(2.2,2.1,"η = Paxel / Pᵢₙ",fontsize=15,ha="center")
save(F,"v41_02_s22_effektflode")
# s26 Ö6 / s28 Ö7: märkning och plint
def plate_task(name,plate):
    F=fig(4.3,3.0); ax=cax(F,(-0.5,4.2),(-1.05,2.75))
    ax.add_patch(Rectangle((0.6,1.75),2.6,0.85,fc="#eef2f5",ec=INK,lw=1.6)); ax.text(1.9,2.35,"3~ motor",ha="center",fontsize=13); ax.text(1.9,1.98,plate,ha="center",fontsize=15,fontweight="bold")
    plint(ax,0.0,0.05,"Y","Y ?",q=True); plint(ax,2.35,0.05,"D","Δ ?",q=True)
    ax.text(4.15,1.75,"Nät: 400 V",ha="right",fontsize=12,color=BLUE) if False else None
    save(F,name)
plate_task("v41_02_s26_ovn6","Δ/Y 230/400 V"); plate_task("v41_02_s28_ovn7","Δ/Y 400/690 V")
# s30 Ö8: motor med axeleffekt
F=fig(4.3,3.0); ax=cax(F,(-0.6,4.4),(-0.4,2.9)); threeline(ax,0.2,1.8,2.2)
for k in range(3): ax.plot([1.8,2.3-0.2+k*0.2],[2.2-k*0.3,1.4],color=INK,lw=LW)
motor(ax,2.3,0.95); ax.plot([2.8,3.6],[0.95,0.95],color=INK,lw=5); ax.text(3.7,0.95,"Paxel\n5,5 kW",fontsize=13,va="center")
ax.text(0.2,1.2,"Uᴸ = 400 V\nη = 0,88\nPF = 0,80",fontsize=13,va="top")
ax.text(1.0,2.55,"Pᵢₙ = ?   Iᴸ = ?",color=RED,fontsize=15,ha="center")
save(F,"v41_02_s30_ovn8")
# s32 Ö9: transformator
F=fig(4.3,3.0); ax=cax(F,(-0.3,4.5),(-0.2,2.8))
ax.add_patch(Circle((1.9,1.3),0.55,fc="none",ec=INK,lw=LW)); ax.add_patch(Circle((2.6,1.3),0.55,fc="none",ec=INK,lw=LW))
ax.plot([0.2,1.35],[1.3,1.3],color=INK,lw=LW); ax.plot([3.15,4.3],[1.3,1.3],color=INK,lw=LW)
for x in (0.6,3.8): [ax.plot([x-0.06+k*0.08,x+0.06+k*0.08],[1.2,1.4],color=INK,lw=1.4) for k in range(3)]
ax.text(0.5,1.55,"10 kV",fontsize=14,ha="center",va="bottom"); ax.text(3.9,1.55,"400 V",fontsize=14,ha="center",va="bottom")
ax.text(2.25,2.2,"100 kVA",fontsize=15,ha="center"); arrow(ax,(3.3,0.95),(4.1,0.95),label="I₂ = ?",lp=(3.7,0.7),va="top")
save(F,"v41_02_s32_ovn9")
# s34 Ö10: tre olika faseffekter
F=fig(4.3,3.0); ax=F.add_axes((0.12,0.16,0.84,0.72))
for sp in ("top","right","left"): ax.spines[sp].set_visible(False)
vals=(1.2,1.5,0.9); ax.bar([0,1,2],vals,color=PHC,width=0.55,alpha=0.9)
for k,v in enumerate(vals): ax.text(k,v+0.05,f"{c(v)} kW",ha="center",fontsize=14)
ax.set_xticks([0,1,2]); ax.set_xticklabels(["P₁","P₂","P₃"],fontsize=14); ax.set_yticks([]); ax.set_ylim(0,2.1)
ax.text(2.4,1.9,"Ptotal = ?",ha="right",color=RED,fontsize=16)
save(F,"v41_02_s34_ovn10")

# ================= v41_03 Fysisk träff och mätning =================
def divider(name,labels,extra=lambda ax:None,src="12 V"):
    F=fig(4.3,3.0); ax=cax(F,(-1.3,3.6),(-0.4,2.8))
    wire(ax,(0,0),(0,2.2),(2.2,2.2),(2.2,0),(0,0))
    ax.add_patch(Circle((0,1.1),0.26,fc="white",ec=INK,lw=LW,zorder=3)); ax.text(0,1.18,"+",ha="center",fontsize=12,zorder=4); ax.text(0,0.95,"−",ha="center",fontsize=12,zorder=4)
    ax.text(-0.36,1.1,src,ha="right",va="center",fontsize=14)
    resistor(ax,2.2,1.6,vert=True,label=labels[0],lpos="r"); resistor(ax,2.2,0.6,vert=True,label=labels[1],lpos="r")
    extra(ax); save(F,name)
divider("v41_03_s07_stationA",("R₁ = 1 kΩ","R₂ = 2 kΩ"),lambda ax:ax.text(1.1,1.1,"I = U/(R₁ + R₂)",ha="center",fontsize=14))
divider("v41_03_s13_ovn2",("R₁\n1 kΩ","R₂\n2 kΩ"),lambda ax:(ax.text(1.1,1.35,"I = ?",ha="center",fontsize=15,color=RED),ax.text(1.1,0.75,"U₂ = ?",ha="center",fontsize=15,color=RED)))
def meas(ax):
    vmark(ax,(2.7,2.1),(2.7,1.12),"3,98 V",off=(0.1,0)); vmark(ax,(2.7,1.08),(2.7,0.1),"7,96 V",off=(0.1,0))
    ax.text(1.1,1.35,"summa = ?",ha="center",fontsize=15,color=RED)
F=None
def divider_meas(name):
    F=fig(4.3,3.0); ax=cax(F,(-1.5,3.9),(-0.4,2.8)); wire(ax,(0,0),(0,2.2),(2.2,2.2),(2.2,0),(0,0))
    ax.add_patch(Circle((0,1.1),0.26,fc="white",ec=INK,lw=LW,zorder=3)); ax.text(0,1.18,"+",ha="center",fontsize=12,zorder=4); ax.text(0,0.95,"−",ha="center",fontsize=12,zorder=4)
    ax.text(-0.36,1.1,"11,94 V",ha="right",va="center",fontsize=14); resistor(ax,2.2,1.6,vert=True,label="R₁",lpos="l"); resistor(ax,2.2,0.6,vert=True,label="R₂",lpos="l")
    meas(ax); save(F,name)
divider_meas("v41_03_s15_ovn3"); divider_meas("v41_03_s34_ovn10")
# s8 teori: trefastränare i Y
F=fig(4.3,3.4); ax=cax(F,(-1.7,2.7),(-1.1,1.8)); V=yload(ax,0,0,1.15)
vmark(ax,V[1],V[2],"Uᴸ = 12 V",off=(0,-0.28),ha="center"); ax.text(0.95,0.75,"Ugren = Uᴸ/√3",fontsize=14)
save(F,"v41_03_s08_stationB")
# s17 Ö4: tränarens toppvärde
F=fig(4.3,3.0); ax=wave_ax(F); t=T(0,20,400); ax.plot(t,np.sin(2*np.pi*t/20),color=BLUE,lw=2.4)
ax.set_xlim(0,21); ax.set_ylim(-1.35,1.5); ax.set_xticks([]); ax.set_yticks([])
ax.axhline(0.707,color=GREEN,lw=1.8,ls="--"); ax.text(20.6,0.76,"U = 12,1 V (RMS)",ha="right",va="bottom",color=GREEN,fontsize=14)
ax.plot([5],[1],"o",color=RED,ms=5); ax.text(5.6,1.05,"û = ?",color=RED,fontsize=15,va="bottom")
save(F,"v41_03_s17_ovn4")
# s19 Ö5: uppmätt grenspänning
F=fig(4.3,3.0); ax=cax(F,(-1.7,2.9),(-1.1,1.75)); V=yload(ax,0,0,1.15)
vmark(ax,V[1],V[2],"Uᴸ = 12,0 V",off=(0,-0.28),ha="center")
ax.text(0.95,0.85,"uppmätt 6,90 V",fontsize=14,color=BLUE); ax.text(0.95,0.45,"förväntat = ?",fontsize=15,color=RED)
save(F,"v41_03_s19_ovn5")
# hållkrets
def latch(name,s0=True,s1=False,k1=False,coil_on=False,k1_unknown=False,note=None,timing=False,h=3.0):
    F=fig(4.3,h); top=0.42 if timing else 0.0
    ax=F.add_axes((0.0,top,1.0,1-top)); ax.set_xlim(-0.4,5.0); ax.set_ylim(-0.9,1.6); ax.set_aspect("equal"); ax.axis("off")
    y=0.9; yl=0.0
    ax.plot([0,4.6],[y,y],color=INK,lw=LW); ax.text(-0.05,y+0.25,"+12 V",fontsize=12,ha="left"); ax.text(4.6,y+0.25,"0 V",fontsize=12,ha="right")
    contact(ax,0.8,y,s0,"S0 NC",nc=True)
    dot(ax,1.5,y,0.05); dot(ax,3.1,y,0.05)
    contact(ax,2.3,y,s1,"S1 NO")
    ax.plot([1.5,1.5,3.1,3.1],[y,yl,yl,y],color=INK,lw=LW)
    contact(ax,2.3,yl,k1,"K1 NO" if not k1_unknown else "K1 NO: ?",unknown=k1_unknown)
    coil(ax,3.85,y,"K1",on=coil_on)
    if note: ax.text(2.3,1.45,note,ha="center",fontsize=13,color=RED if "?" in note else INK)
    if timing:
        a2=F.add_axes((0.14,0.04,0.82,0.34)); a2.set_xlim(0,10); a2.set_ylim(-0.3,2.6); a2.axis("off")
        for k,(lab,seq) in enumerate((("START",[(0,0),(2,0),(2,1),(5,1),(5,0),(10,0)]),("K1",[(0,0),(2.2,0),(2.2,1),(5.1,1),(5.1,0),(10,0)]))):
            yy=1.5-1.4*k; xs,ys_=zip(*seq); a2.plot(xs,[yy+0.8*v for v in ys_],color=BLUE if k==0 else ORANGE,lw=2.4)
            a2.text(-0.2,yy+0.3,lab,ha="right",va="center",fontsize=12)
        a2.text(5.3,2.4,"START släpps → K1 släpper",fontsize=12,color=INK)
    save(F,name)
latch("v41_03_s26_ovn6",s0=True,s1=False,k1=False,note="Sluten väg till K1-spolen?")
latch("v41_03_s28_ovn7",s0=True,s1=True,k1=False,coil_on=True,k1_unknown=True,note="START intryckt, K1 drar")
latch("v41_03_s30_ovn8",s0=True,s1=True,k1=False,note="Felhypotes = ?",timing=True,h=4.0)
# s32 Ö9: toleransgränser
F=fig(4.3,3.0); ax=F.add_axes((0.06,0.3,0.88,0.4)); ax.set_xlim(0.9,1.1); ax.set_ylim(-1,1); ax.axis("off")
ax.plot([0.92,1.08],[0,0],color=GRAY,lw=1.5); ax.add_patch(Rectangle((0.95,-0.25),0.10,0.5,fc=GREEN,alpha=0.15,ec=GREEN,lw=1.5))
ax.plot([1,1],[-0.35,0.35],color=INK,lw=2); ax.text(1,0.5,"Rnom = 1 kΩ",ha="center",fontsize=14)
ax.text(0.95,-0.45,"Rmin = ?",ha="center",va="top",color=RED,fontsize=14); ax.text(1.05,-0.45,"Rmax = ?",ha="center",va="top",color=RED,fontsize=14)
ax.text(0.95,0.5,"−5 %",ha="center",fontsize=13,color=GREEN); ax.text(1.05,0.5,"+5 %",ha="center",fontsize=13,color=GREEN)
F.text(0.5,0.12,"Uppmätt: 1,03 kΩ",ha="center",fontsize=15,color=BLUE)
save(F,"v41_03_s32_ovn9")
