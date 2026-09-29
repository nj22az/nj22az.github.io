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
        rresistor(ax,(cx,cy),e,labels[k],loff=(0.45,-0.42,0.42)[k],lcolor=lcol)
        dot(ax,*e); ax.text(e[0]+0.18*np.cos(np.radians(a)),e[1]+0.18*np.sin(np.radians(a)),tlabels[k],ha="center",va="center",fontsize=14)
    dot(ax,cx,cy)
    if neutral: ax.text(cx+0.12,cy-0.18,"N",fontsize=13,color=GRAY)
    return pts

def dload(ax,cx,cy,r,labels=("","",""),tlabels=("L1","L2","L3")):
    V=[(cx+r*np.cos(np.radians(a)),cy+r*np.sin(np.radians(a))) for a in (90,210,330)]
    for k,(i,j) in enumerate(((0,1),(1,2),(2,0))):
        rresistor(ax,V[i],V[j],None)
        if labels[k]:
            m=np.array([(V[i][0]+V[j][0])/2,(V[i][1]+V[j][1])/2]); o=m-np.array([cx,cy]); o=o/np.linalg.norm(o)
            q=m+o*(0.42 if k!=1 else -0.3); ax.text(*q,labels[k],ha="center",va="center",fontsize=14)
    for k,v in enumerate(V):
        dot(ax,*v); a=np.radians((90,210,330)[k]); ax.text(v[0]+0.22*np.cos(a),v[1]+0.22*np.sin(a),tlabels[k],ha="center",va="center",fontsize=14)
    return V

def lead(ax,V0,label):
    ax.plot([V0[0],V0[0]],[V0[1],V0[1]+0.65],color=INK,lw=LW); ax.text(V0[0]-0.12,V0[1]+0.6,"L1",ha="right",va="center",fontsize=14)
    arrow(ax,(V0[0],V0[1]+0.62),(V0[0],V0[1]+0.2),label=label,lp=(V0[0]+0.14,V0[1]+0.42),ha="left",color=RED if "?" in label else BLUE)

# ================= v41_01 Trefassystemets grunder =================
# s7 teori: fas- och linjespänning som visare
F=fig(4.3,3.6); ax=pax(F,lim=1.55)
tips=[phasor(ax,a,1.0,col,l,lr=1.2) for a,col,l in ((90,PHC[0],"U$_\\mathregular{1N}$"),(330,PHC[1],"U$_\\mathregular{2N}$"),(210,PHC[2],"U$_\\mathregular{3N}$"))]
ax.plot(*zip(tips[0],tips[1]),color=INK,lw=2.2,ls="--"); ax.text((tips[0][0]+tips[1][0])/2+0.1,(tips[0][1]+tips[1][1])/2+0.05,"U₁₂",color=INK,fontsize=15,ha="left")
ax.text(0.08,-0.2,"N",fontsize=13,color=GRAY); dot(ax,0,0)
save(F,"v41_01_s07_fas_linje")
# s8 teori: skillnaden mellan två visare
F=fig(4.3,3.6); ax=pax(F,xl=(-1.6,1.6),yl=(-1.2,1.5))
a1=phasor(ax,90,1.0,PHC[0],"U$_\\mathregular{1N}$",lr=1.15); a2=phasor(ax,330,1.0,PHC[1],"U$_\\mathregular{2N}$",lr=1.2)
ax.add_patch(FancyArrowPatch(a2,a1,arrowstyle="-|>",mutation_scale=18,color=INK,lw=2.6))
ax.text(-1.55,0.55,"U₁₂ = U$_\\mathregular{1N}$ − U$_\\mathregular{2N}$",color=INK,fontsize=14,ha="left")
ax.add_patch(Arc((0,0),0.5,0.5,theta1=-30,theta2=90,color=INK,lw=1.3))
ax.text(1.55,-0.95,"120° mellan fasvisarna",ha="right",fontsize=13,color=GRAY); ax.text(1.55,-1.15,"|U₁₂| = √3 · U_{F}",ha="right",fontsize=15)
save(F,"v41_01_s08_rot3")
# s11 Ö1: vinkeln mellan faserna
F=fig(4.3,3.0); ax=pax(F,lim=1.45)
for a,col,l in ((90,PHC[0],"L1"),(330,PHC[1],"L2"),(210,PHC[2],"L3")): phasor(ax,a,1.0,col,l,lr=1.2)
ax.add_patch(Arc((0,0),0.7,0.7,theta1=-30,theta2=90,color=RED,lw=1.6)); ax.text(0.45,0.32,"? °",color=RED,fontsize=16,ha="left")
save(F,"v41_01_s11_ovn1")
# s13 Ö2: tre sinus, tidsförskjutning okänd
F=fig(4.3,3.0); ax=wave_ax(F); t=T(0,30,600)
for k,col in enumerate(PHC): ax.plot(t,np.sin(2*np.pi*(t-k*20/3)/20),color=col,lw=2.2)
ax.set_xlim(0,31); ax.set_ylim(-1.35,1.7); ax.set_xticks([]); ax.set_yticks([])
ax.plot([5,5],[0,1.05],color=GRAY,lw=1,ls=":"); ax.plot([5+20/3,5+20/3],[0,1.05],color=GRAY,lw=1,ls=":")
bracket(ax,5,5+20/3,1.12,"Δt = ?",color=RED)
ax.text(1,1.25,"L1",color=PHC[0],fontsize=14); ax.text(5+20/3+0.9,0.95,"L2",color=PHC[1],fontsize=14); ax.text(30.5,-1.3,"f = 50 Hz",ha="right",fontsize=13,color=BLUE)
save(F,"v41_01_s13_ovn2")
# s15 Ö3 / s17 Ö4: spänningar mellan ledare
def supply(name,lab12,lab1n):
    F=fig(4.3,3.0); ax=cax(F,(-0.6,4.4),(-0.4,3.1)); ys=(2.6,1.8,1.0,0.2)
    lines(ax,0.2,4.2,ys)
    for y in ys: dot(ax,1.6,y,0.05) if y in (2.6,1.8) else None
    dot(ax,3.0,2.6,0.05); dot(ax,3.0,0.2,0.05)
    vmark(ax,(1.6,2.6),(1.6,1.8),lab12,off=(0.12,0))
    vmark(ax,(3.0,2.6),(3.0,0.2),lab1n,off=(0.12,0))
    save(F,name)
supply("v41_01_s15_ovn3","U_{L} = 400 V","U_{F} = ?")
supply("v41_01_s17_ovn4","U_{L} = ?","U_{F} = 120 V")
# s19 Ö5: Y-last på trefasriggen
F=fig(4.3,3.0); ax=cax(F,(-1.6,2.6),(-1.4,1.75)); V=yload(ax,0,0,1.15)
vmark(ax,(V[1][0],V[1][1]-0.32),(V[2][0],V[2][1]-0.32),"U_{L} = 12,0 V",off=(0,-0.25),ha="center")
ax.text(1.0,0.75,"U_{gren} = ?",color=RED,fontsize=15)
save(F,"v41_01_s19_ovn5")
# s21 teori: symmetriska strömmar summerar till noll
F=fig(4.3,3.6); ax=pax(F,xl=(-0.6,2.0),yl=(-1.1,1.4))
p=(0,0); pts=[p]
for a,col,l in ((90,PHC[0],"I₁"),(-30,PHC[1],"I₂"),(210,PHC[2],"I₃")):
    q=(p[0]+np.cos(np.radians(a)),p[1]+np.sin(np.radians(a)))
    ax.add_patch(FancyArrowPatch(p,q,arrowstyle="-|>",mutation_scale=18,color=col,lw=2.6)); m=((p[0]+q[0])/2,(p[1]+q[1])/2)
    ax.text(m[0]+(-0.18 if a==90 else 0.2 if a==-30 else 0),m[1]+(0 if a!=210 else -0.2),l,color=col,fontsize=15,ha="center",va="center"); p=q
ax.text(0.5,1.25,"Visarna sluter en triangel:",fontsize=13,ha="center"); ax.text(0.5,-0.85,"I$_\\mathregular{N}$ = 0 vid symmetri",fontsize=15,ha="center")
save(F,"v41_01_s21_symmetri")
# s22 teori: osymmetri ger neutralström
F=fig(4.3,3.6); ax=pax(F,xl=(-0.7,2.0),yl=(-1.1,1.45))
p=(0,0)
for a,col,l,Lg in ((90,PHC[0],"10 A",1.0),(-30,PHC[1],"10 A",1.0),(210,PHC[2],"4 A",0.4)):
    q=(p[0]+Lg*np.cos(np.radians(a)),p[1]+Lg*np.sin(np.radians(a)))
    ax.add_patch(FancyArrowPatch(p,q,arrowstyle="-|>",mutation_scale=18,color=col,lw=2.6)); m=((p[0]+q[0])/2,(p[1]+q[1])/2)
    ax.text(m[0]+(-0.25 if a==90 else 0.28 if a==-30 else 0),m[1]+(0 if a!=210 else -0.2),l,color=col,fontsize=14,ha="center",va="center"); p=q
ax.add_patch(FancyArrowPatch(p,(0,0),arrowstyle="-|>",mutation_scale=18,color=INK,lw=2.4,ls="--"))
ax.text(p[0]/2-0.05,p[1]/2+0.1,"I$_\\mathregular{N}$",fontsize=15,ha="right")
ax.text(0.65,1.3,"Olika faslaster: I$_\\mathregular{N}$ sluter triangeln",fontsize=13,ha="center")
save(F,"v41_01_s22_osymmetri")
# s23 teori: mätpunkter
F=fig(4.3,3.4); ax=cax(F,(-0.6,4.4),(-0.4,3.3)); ys=(2.8,2.0,1.2,0.3); lines(ax,0.2,4.2,ys)
for x,(y1,y2),lab in ((1.1,(2.8,2.0),"U₁₂"),(1.9,(2.0,1.2),"U₂₃"),(2.7,(2.8,1.2),"U₃₁"),(3.6,(2.8,0.3),"U$_\\mathregular{1N}$")):
    dot(ax,x,y1,0.05); dot(ax,x,y2,0.05); vmark(ax,(x,y1),(x,y2),lab,off=(0.1,0.4 if lab=="U₃₁" else 0),color=BLUE if "1N" not in lab else ORANGE)
save(F,"v41_01_s23_matpunkter")
# s26 Ö6: tre lika strömmar
F=fig(4.3,3.0); ax=pax(F,lim=1.45)
for a,col,l in ((90,PHC[0],"8,0 A"),(330,PHC[1],"8,0 A"),(210,PHC[2],"8,0 A")): phasor(ax,a,1.0,col,l,lr=1.25,fs=14)
ax.text(1.4,-1.35,"I$_\\mathregular{N}$ = ?",ha="right",color=RED,fontsize=16)
save(F,"v41_01_s26_ovn6")
# s28 Ö7: en fas–neutral-last
F=fig(4.3,3.0); ax=cax(F,(-0.7,4.3),(-0.4,3.3)); ys=(2.6,1.9,1.2,0.3); lines(ax,0.2,2.2,ys)
ax.plot([2.2,3.3],[2.6,2.6],color=INK,lw=LW); rresistor(ax,(3.3,2.6),(3.3,0.3),"Last",loff=0.55)
ax.plot([2.2,3.3],[0.3,0.3],color=INK,lw=LW)
arrow(ax,(2.35,2.6),(3.0,2.6),label="5,0 A",lp=(2.7,2.85),va="bottom"); arrow(ax,(3.0,0.3),(2.35,0.3),label="I$_\\mathregular{N}$ = ?",lp=(2.7,0.55),va="bottom")
save(F,"v41_01_s28_ovn7")
# s30 Ö8: två strömmar med 120°
F=fig(4.3,3.0); ax=pax(F,lim=1.45)
phasor(ax,90,1.0,PHC[0],"10 A",lr=1.2,fs=14); phasor(ax,330,1.0,PHC[1],"10 A",lr=1.25,fs=14)
ax.add_patch(Arc((0,0),0.6,0.6,theta1=-30,theta2=90,color=INK,lw=1.3)); ax.text(0.38,0.28,"120°",fontsize=13,ha="left")
ax.text(-1.3,-0.6,"I₃ = 0",fontsize=14,color=GRAY); ax.text(1.4,-1.35,"|I$_\\mathregular{N}$| = ?",ha="right",color=RED,fontsize=16)
save(F,"v41_01_s30_ovn8")
# s32 Ö9: tre linjespänningar
F=fig(4.3,3.0); ax=F.add_axes((0.14,0.16,0.82,0.74))
for sp in ("top","right"): ax.spines[sp].set_visible(False)
vals=(400,402,398); ax.bar([0,1,2],[v-394 for v in vals],bottom=394,color=[BLUE,"#4f7fb0","#8fb0d3"],width=0.55)
for k,v in enumerate(vals): ax.text(k,v+0.3,f"{v} V",ha="center",fontsize=14)
ax.set_xticks([0,1,2]); ax.set_xticklabels(["U₁₂","U₂₃","U₃₁"],fontsize=14); ax.set_ylim(394,405); ax.set_yticks([395,400,405]); ax.tick_params(labelsize=11,colors=GRAY)
ax.text(2.45,404.3,"U_{medel} = ?   avvikelse = ? %",ha="right",color=RED,fontsize=14); F.text(0.98,0.01,"Obs: axeln börjar vid 394 V",ha="right",fontsize=10,color=GRAY)
save(F,"v41_01_s32_ovn9")
# s34 Ö10: bruten neutralledare
F=fig(4.3,3.0); ax=cax(F,(-0.7,4.4),(-0.5,3.1)); ys=(2.6,1.9,1.2,0.3); lines(ax,0.2,1.4,ys)
ax.plot([1.4,3.0],[2.6,2.6],color=INK,lw=LW); ax.plot([1.4,2.0],[1.9,1.9],color=INK,lw=LW); ax.plot([1.4,2.0],[0.3,0.3],color=INK,lw=LW)
rresistor(ax,(3.0,2.6),(3.0,0.95),"Ra",loff=0.4); rresistor(ax,(2.0,1.9),(2.0,0.95),"Rb",loff=-0.4)
ax.plot([2.0,3.0],[0.95,0.95],color=INK,lw=LW); dot(ax,2.5,0.95); ax.plot([2.5,2.5],[0.95,0.3],color=INK,lw=LW); ax.plot([2.0,2.5],[0.3,0.3],color=INK,lw=LW,ls=":")
ax.plot([2.15,2.35],[0.18,0.42],color=ORANGE,lw=3); ax.plot([2.15,2.35],[0.42,0.18],color=ORANGE,lw=3); ax.text(2.25,-0.05,"brott",color=ORANGE,fontsize=13,ha="center",va="top")
ax.text(4.35,2.2,"Ua och Ub\nändras – varför?",ha="right",color=RED,fontsize=13,va="center")
save(F,"v41_01_s34_ovn10")

# ================= v41_02 Y, Δ och trefaseffekt =================
# s7 teori: linje- och grenström i Δ. Linjeströmmen är den vektoriella skillnaden av två grenströmmar (visarbilden till höger).
F=fig(5.2,3.6); ax=cax(F,(-2.0,4.9),(-1.55,2.25)); V=dload(ax,0,0,1.2,tlabels=("","L2","L3"))
lead(ax,V[0],"I_{L1}")
def along(P,Q,t0,t1,lab,rev=False):
    """Strömpil utanför grenen P–Q, riktad från P mot Q (eller tvärtom)."""
    P,Q=np.array(P),np.array(Q); u=(Q-P)/np.linalg.norm(Q-P); m=(P+Q)/2; n=m/np.linalg.norm(m); L=np.linalg.norm(Q-P)
    p0=P+u*L*t0+n*0.28; p1=P+u*L*t1+n*0.28
    if rev: p0,p1=p1,p0
    ax.add_patch(FancyArrowPatch(tuple(p0),tuple(p1),arrowstyle="-|>",mutation_scale=15,color=BLUE,lw=2,zorder=5,shrinkA=0,shrinkB=0))
    c=P+u*L*(t0+t1)/2+n*0.62; ax.text(*c,lab,color=BLUE,fontsize=14,ha="center",va="center")
along(V[0],V[1],0.08,0.3,"I_{12}")
along(V[0],V[2],0.08,0.3,"I_{31}",rev=True)
# visarbild: I_{12} + (−I_{31}) = I_{L1}, längd √3 · I_{gren}
o=np.array([2.2,0.9]); k=1.2
e1=o+k*np.array([1,0]); e2=e1+k*np.array([np.cos(np.radians(-60)),np.sin(np.radians(-60))])
ax.add_patch(FancyArrowPatch(tuple(o),tuple(e1),arrowstyle="-|>",mutation_scale=16,color=BLUE,lw=2.4,shrinkA=0,shrinkB=0))
ax.add_patch(FancyArrowPatch(tuple(e1),tuple(e2),arrowstyle="-|>",mutation_scale=16,color=ORANGE,lw=2.4,shrinkA=0,shrinkB=0))
ax.add_patch(FancyArrowPatch(tuple(o),tuple(e2),arrowstyle="-|>",mutation_scale=18,color=INK,lw=2.8,shrinkA=0,shrinkB=0))
ax.text(*(o+e1)/2+np.array([0,0.16]),"I_{12}",color=BLUE,fontsize=14,ha="center")
ax.text(*(e1+e2)/2+np.array([0.14,0.05]),"−I_{31}",color=ORANGE,fontsize=14,ha="left")
ax.text(*(o+e2)/2+np.array([-0.12,-0.14]),"I_{L1}",color=INK,fontsize=14,ha="right",va="top")
ax.text(3.35,-0.95,"I_{L1} = I_{12} − I_{31}",ha="center",fontsize=14)
ax.text(3.35,-1.4,"|I_{L1}| = √3 · I_{gren}",ha="center",fontsize=14)
save(F,"v41_02_s07_delta_strom")
# s11 Ö1 / s13 Ö2: Y-last
def ytask(name,labels,extra,tl=("L1","L2","L3")):
    F=fig(4.3,3.0); ax=cax(F,(-1.7,2.7),(-1.4,2.0)); V=yload(ax,0,0,1.15,labels=labels,tlabels=tl)
    vmark(ax,(V[1][0],V[1][1]-0.32),(V[2][0],V[2][1]-0.32),"U_{L} = 400 V",off=(0,-0.25),ha="center"); extra(ax,V); save(F,name)
ytask("v41_02_s11_ovn1",("40 Ω","40 Ω","40 Ω"),lambda ax,V:ax.text(1.0,0.8,"U_{gren} = ?",color=RED,fontsize=15))
ytask("v41_02_s13_ovn2",("40 Ω","40 Ω","40 Ω"),lambda ax,V:(lead(ax,V[0],"I_{L} = ?"),ax.text(0.95,1.0,"I_{gren} = ?",color=RED,fontsize=15)),tl=("","L2","L3"))
# s15 Ö3: Δ-last
F=fig(4.3,3.0); ax=cax(F,(-2.1,2.8),(-1.15,2.0)); V=dload(ax,0,0,1.15,labels=("40 Ω","40 Ω","40 Ω"),tlabels=("","L2","L3"))
vmark(ax,(V[1][0],V[1][1]-0.35),(V[2][0],V[2][1]-0.35),"U_{L} = 400 V",off=(0,-0.25),ha="center")
lead(ax,V[0],"I_{L} = ?"); ax.text(1.1,0.75,"I_{gren} = ?",color=RED,fontsize=15)
save(F,"v41_02_s15_ovn3")
# s17 Ö4: trefaslast
def motor(ax,x,y,txt="M\n3~",r=0.5):
    ax.add_patch(Circle((x,y),r,fc="white",ec=INK,lw=LW,zorder=3)); ax.text(x,y,txt,ha="center",va="center",fontsize=14,zorder=4)
def threeline(ax,x0,x1,y0,dy=0.3):
    for k,n in enumerate(("L1","L2","L3")):
        y=y0-k*dy; ax.plot([x0,x1],[y,y],color=INK,lw=LW); ax.text(x0-0.1,y,n,ha="right",va="center",fontsize=13)
def feed(ax,xm=3.35,ym=0.85,r=0.5,x0=0.2):
    for k in range(3):
        y=2.2-k*0.3; xe=xm-0.25+k*0.25; ax.plot([x0,xe,xe],[y,y,ym+np.sqrt(r*r-(xe-xm)**2)],color=INK,lw=LW)
        ax.text(x0-0.1,y,("L1","L2","L3")[k],ha="right",va="center",fontsize=13)
    motor(ax,xm,ym,r=r)
F=fig(4.3,3.0); ax=cax(F,(-0.6,4.4),(-0.3,2.9)); feed(ax)
arrow(ax,(0.6,2.2),(1.3,2.2),label="I_{L} = 10 A",lp=(0.95,2.45),va="bottom")
ax.text(0.2,1.2,"U_{L} = 400 V\ncos φ = 0,80",fontsize=14,va="top"); ax.text(4.35,2.6,"P = ?",ha="right",color=RED,fontsize=16)
save(F,"v41_02_s17_ovn4")
# s19 Ö5: triangel utan P-värde
F=fig(4.3,3.0); triangle(F,0.8,0.6,("P","Q = ?","S = ?"),rect=(0.06,0.04,0.9,0.92),angle_label="φ",note="cos φ = 0,80, induktiv"); save(F,"v41_02_s19_ovn5")
# s21 teori: motorns kopplingsplint Y och Δ
def plint(ax,x0,y0,mode,title,q=False):
    tops=("W2","U2","V2"); bots=("U1","V1","W1"); dx=0.62
    ax.add_patch(Rectangle((x0-0.35,y0-0.35),dx*2+0.7,1.25,fc="#f4f7fa",ec=GRAY,lw=1.2))
    for k in range(3):
        for (yy,lab) in ((y0+0.55,tops[k]),(y0,bots[k])):
            ax.add_patch(Circle((x0+k*dx,yy),0.1,fc="white",ec=INK,lw=1.6,zorder=3)); ax.text(x0+k*dx+(0 if yy>y0 else 0.14),yy+(0.2 if yy>y0 else -0.12),lab,ha="center" if yy>y0 else "left",va="center",fontsize=11)
    c=RED if q else INK
    if mode=="Y": ax.plot([x0,x0+2*dx],[y0+0.55,y0+0.55],color=c,lw=4,solid_capstyle="round",zorder=2)
    if mode=="D":
        for k in range(3): ax.plot([x0+k*dx,x0+k*dx],[y0,y0+0.55],color=c,lw=4,solid_capstyle="round",zorder=2)
    for k,n in enumerate(("L1","L2","L3")): ax.plot([x0+k*dx,x0+k*dx],[y0-0.1,y0-0.55],color=INK,lw=1.6); ax.text(x0+k*dx,y0-0.72,n,ha="center",fontsize=11)
    ax.text(x0+dx,y0+1.05,title,ha="center",fontsize=15,color=c)
F=fig(4.3,3.6); ax=cax(F,(-0.5,4.2),(-1.45,2.3)); plint(ax,0.0,0.3,"Y","Y (stjärna)"); plint(ax,2.35,0.3,"D","Δ (triangel)")
ax.text(0.62,-0.95,"lindning: U_{L}/√3",ha="center",fontsize=13,color=BLUE); ax.text(2.97,-0.95,"lindning: U_{L}",ha="center",fontsize=13,color=BLUE)
save(F,"v41_02_s21_plint")
# s22 teori: effektflöde i motorn
F=fig(4.3,3.0); ax=cax(F,(-0.2,4.4),(-0.6,2.5))
ax.add_patch(Polygon([(0,1.6),(2.6,1.6),(3.6,1.15),(2.6,0.7),(0,0.7)],closed=True,fc=BLUE,alpha=0.25,ec=BLUE,lw=1.5))
ax.add_patch(Polygon([(2.0,0.7),(2.35,0.7),(2.35,-0.2),(2.2,-0.4),(2.0,-0.2)],closed=True,fc=ORANGE,alpha=0.25,ec=ORANGE,lw=1.5))
ax.text(0.2,1.15,"P_{in} elektrisk",fontsize=15,va="center"); ax.text(3.65,1.15,"P_{axel}",fontsize=15,va="center"); ax.text(2.5,-0.2,"förluster",fontsize=14,color=ORANGE,va="center")
ax.text(2.2,2.1,"η = P_{axel} / P_{in}",fontsize=15,ha="center")
save(F,"v41_02_s22_effektflode")
# s26 Ö6 / s28 Ö7: märkning och plint
def plate_task(name,plate):
    F=fig(4.3,3.0); ax=cax(F,(-0.5,4.2),(-1.05,2.75))
    ax.add_patch(Rectangle((0.6,1.75),2.6,0.85,fc="#eef2f5",ec=INK,lw=1.6)); ax.text(1.9,2.35,"3~ motor",ha="center",fontsize=13); ax.text(1.9,1.98,plate,ha="center",fontsize=15,fontweight="bold")
    plint(ax,0.0,0.05,"Y","Y ?",q=True); plint(ax,2.35,0.05,"D","Δ ?",q=True)
    ax.text(4.15,2.2,"Nät:\n400 V",ha="right",va="center",fontsize=13,color=BLUE)
    save(F,name)
plate_task("v41_02_s26_ovn6","Δ/Y 230/400 V"); plate_task("v41_02_s28_ovn7","Δ/Y 400/690 V")
# s30 Ö8: motor med axeleffekt
F=fig(4.3,3.0); ax=cax(F,(-0.6,4.4),(-0.6,2.9)); feed(ax,xm=2.6)
ax.plot([3.1,3.9],[0.85,0.85],color=INK,lw=5); ax.text(3.5,0.55,"P_{axel}\n5,5 kW",fontsize=13,va="top",ha="center")
ax.text(0.2,1.2,"U_{L} = 400 V\nη = 0,88\nPF = 0,80",fontsize=13,va="top")
ax.text(4.35,2.6,"P_{in} = ?   I_{L} = ?",color=RED,fontsize=15,ha="right")
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
ax.text(2.4,1.9,"P_{total} = ?",ha="right",color=RED,fontsize=16)
save(F,"v41_02_s34_ovn10")

# ================= v41_03 Fysisk träff: motorn, startaren och tången =================
# Motorn och startaren är övningsobjekt som aldrig ansluts. Figurerna visar delar, plint och mätningar.
def motor_side(ax,labels=True):
    """Trefasmotor från sidan: stomme med flänsar, fläktkåpa, lagersköldar, axel, fötter, kopplingslåda, märkskylt."""
    ax.add_patch(Rectangle((0.9,0.5),2.6,1.3,fc="#e6ecf1",ec=INK,lw=LW))                 # stomme
    for k in range(9): ax.plot([1.0+k*0.28,1.0+k*0.28],[0.55,1.75],color=GRAY,lw=0.8)       # kylflänsar
    ax.add_patch(Rectangle((3.5,0.58),0.18,1.14,fc="#cfd9e2",ec=INK,lw=1.4))                 # lagersköld fram
    ax.add_patch(Rectangle((0.72,0.58),0.18,1.14,fc="#cfd9e2",ec=INK,lw=1.4))                # lagersköld bak
    ax.add_patch(Polygon([(0.72,0.62),(0.25,0.72),(0.25,1.58),(0.72,1.68)],closed=True,fc="#dde4ea",ec=INK,lw=1.4))  # fläktkåpa
    for k in range(4): ax.plot([0.3,0.68],[0.85+k*0.22,0.85+k*0.22],color=GRAY,lw=0.8)
    ax.add_patch(Rectangle((3.68,1.07),0.62,0.16,fc="#b9c3cc",ec=INK,lw=1.4))                # axel
    ax.add_patch(Rectangle((3.9,1.21),0.3,0.05,fc="white",ec=INK,lw=1.0))                    # kil
    ax.add_patch(Rectangle((1.9,1.8),0.8,0.42,fc="#e6ecf1",ec=INK,lw=LW))                   # kopplingslåda
    ax.add_patch(Rectangle((1.25,0.85),0.5,0.32,fc="white",ec=INK,lw=1.2))                   # märkskylt
    for k in range(3): ax.plot([1.3,1.7],[1.08-k*0.08,1.08-k*0.08],color=GRAY,lw=0.8)
    for x in (1.1,3.0): ax.add_patch(Rectangle((x,0.28),0.45,0.22,fc="#cfd9e2",ec=INK,lw=1.4))  # fötter
    if labels:
        for (tx,ty,px,py,t) in ((2.3,2.62,2.3,2.2,"kopplingslåda med plint"),(0.75,2.25,0.5,1.6,"fläktkåpa med fläkt"),
                               (3.1,2.25,3.2,1.72,"stomme med kylflänsar"),(1.5,-0.12,1.5,0.85,"märkskylt"),
                               (4.3,0.55,4.05,1.07,"axel med kil"),(3.9,2.0,3.6,1.7,"lagersköld")):
            ax.plot([tx,px],[ty-0.08 if ty>py else ty+0.1,py],color=GRAY,lw=0.9); ax.text(tx,ty,t,ha="center",va="bottom" if ty>py else "top",fontsize=12)
F=fig(4.6,3.0); ax=cax(F,(-0.1,4.8),(-0.45,2.95)); motor_side(ax); save(F,"v41_03_s06_motor")

def plint6(ax,x0,y0,dx=0.7,dy=0.75,tl=("W2","U2","V2"),bl=("U1","V1","W1"),windings=True,bleck=None):
    """Plint 2 × 3: övre rad W2 U2 V2, undre U1 V1 W1. windings: streckade lindningar U1–U2, V1–V2, W1–W2."""
    ax.add_patch(Rectangle((x0-0.4,y0-0.4),2*dx+0.8,dy+0.8,fc="#f4f7fa",ec=GRAY,lw=1.2))
    P={}
    for k in range(3):
        P[tl[k]]=(x0+k*dx,y0+dy); P[bl[k]]=(x0+k*dx,y0)
    if windings:
        for a,b_,col in (("U1","U2",PHC[0]),("V1","V2",PHC[1]),("W1","W2",PHC[2])):
            (xa,ya),(xb,yb)=P[a],P[b_]
            ax.plot([xa,(xa+xb)/2+0.12,xb],[ya,(ya+yb)/2,yb],color=col,lw=2,ls="--",zorder=2)
    for n,(x,y) in P.items():
        ax.add_patch(Circle((x,y),0.1,fc="white",ec=INK,lw=1.6,zorder=4)); ax.text(x+0.14,y+(0.2 if y>y0 else -0.2),n,fontsize=12,va="center")
    for a,b_ in (bleck or []):
        (xa,ya),(xb,yb)=P[a],P[b_]; ax.plot([xa,xb],[ya,yb],color=INK,lw=5,solid_capstyle="round",zorder=3)
    return P
F=fig(4.3,3.0); ax=cax(F,(-0.7,3.9),(-0.9,2.1)); P=plint6(ax,0.2,0.2)
ax.add_patch(Circle((3.15,0.9),0.32,fc="white",ec=BLUE,lw=2)); ax.text(3.15,0.9,"Ω",ha="center",va="center",fontsize=18,color=BLUE)
ax.plot([P["U1"][0],P["U1"][0],2.83],[P["U1"][1],-0.55,0.8],color=BLUE,lw=1.4); ax.plot([P["U2"][0],P["U2"][0]+0.0,2.95],[P["U2"][1],1.75,1.15],color=BLUE,lw=1.4)
ax.text(1.6,-0.78,"U1–U2 är samma lindning",ha="center",fontsize=12,color=BLUE)
save(F,"v41_03_s07_plint")

def rnet(ax,cx,cy,r,mode,lab,hl=True,q=None):
    """Y eller Δ av tre lika lindningar R. Vägen U1–V1 markeras."""
    V=[(cx+r*np.cos(np.radians(a)),cy+r*np.sin(np.radians(a))) for a in (150,30,270)]
    names=("U1","V1","W1")
    if mode=="Y":
        for k,v in enumerate(V): rresistor(ax,v,(cx,cy),"R",color=BLUE if hl and k<2 else INK,lcolor=GRAY,fs=12)
        dot(ax,cx,cy)
    else:
        for k,(i,j) in enumerate(((0,1),(1,2),(2,0))): rresistor(ax,V[i],V[j],"R",color=BLUE if hl and k==0 else ORANGE if hl else INK,lcolor=GRAY,fs=12)
    for k,v in enumerate(V):
        dot(ax,*v); a=np.radians((150,30,270)[k]); ax.text(v[0]+0.3*np.cos(a),v[1]+0.3*np.sin(a),names[k],ha="center",va="center",fontsize=13,fontweight="bold")
    ax.text(cx,cy-r-0.55,lab,ha="center",va="top",fontsize=14,color=RED if q else INK)
F=fig(4.6,3.2); ax=cax(F,(-1.6,5.0),(-2.45,1.9))
rnet(ax,0,0,1.1,"Y","Y: R + R = 2R"); rnet(ax,3.3,0,1.1,"D","Δ: R parallellt med 2R\n= (2/3) · R")
ax.text(1.65,1.65,"mellan U1 och V1",ha="center",fontsize=13,color=BLUE)
save(F,"v41_03_s08_ydelta_r")

def startare(ax,q=None,meter=None):
    """Kontaktor K1 (spole A1–A2, huvudkontakter 1–2, 3–4, 5–6, hjälpkontakt 13–14) och överlastrelä F2 (95–96)."""
    ax.add_patch(Rectangle((0.2,1.6),0.7,0.45,fc="white",ec=INK,lw=LW)); ax.text(0.55,1.825,"K1",ha="center",va="center",fontsize=13)
    ax.text(0.1,1.95,"A1",ha="right",fontsize=11); ax.text(0.1,1.62,"A2",ha="right",fontsize=11)
    ax.plot([0.55,0.55],[2.05,2.35],color=INK,lw=1.4); ax.plot([0.55,0.55],[1.6,1.3],color=INK,lw=1.4)
    for k,(a,b_) in enumerate((("1","2"),("3","4"),("5","6"))):
        x=1.4+k*0.45; ax.plot([x,x],[2.35,2.0],color=INK,lw=1.6); ax.plot([x,x+0.18],[1.72,2.0],color=INK,lw=1.6); ax.plot([x,x],[1.72,1.35],color=INK,lw=1.6)
        ax.text(x+0.05,2.3,a,fontsize=10); ax.text(x+0.05,1.38,b_,fontsize=10)
    ax.plot([1.35,2.35],[1.86,1.86],color=GRAY,lw=1,ls=":")
    x=2.75; ax.plot([x,x],[2.35,2.0],color=INK,lw=1.6); ax.plot([x,x+0.18],[1.72,2.0],color=INK,lw=1.6); ax.plot([x,x],[1.72,1.35],color=INK,lw=1.6)
    ax.text(x+0.07,2.3,"13",fontsize=10); ax.text(x+0.07,1.38,"14",fontsize=10); ax.text(x+0.28,1.8,"NO",fontsize=11,color=GRAY)
    ax.add_patch(Rectangle((3.35,1.55),0.9,0.55,fc="#f4f7fa",ec=INK,lw=LW)); ax.text(3.8,1.82,"F2",ha="center",va="center",fontsize=13)
    x=4.7; ax.plot([x,x],[2.35,2.0],color=INK,lw=1.6); ax.plot([x,x-0.2],[1.72,2.02],color=INK,lw=1.6); ax.plot([x-0.2,x],[2.02,2.02],color=INK,lw=1.6); ax.plot([x,x],[1.72,1.35],color=INK,lw=1.6)
    ax.text(x+0.07,2.3,"95",fontsize=10); ax.text(x+0.07,1.38,"96",fontsize=10); ax.text(x+0.1,1.8,"NC",fontsize=11,color=GRAY)
    ax.plot([4.25,4.5],[1.82,1.86],color=GRAY,lw=1,ls=":")
    ax.text(0.55,1.1,"spole",ha="center",fontsize=11,color=GRAY); ax.text(1.85,1.1,"huvudkontakter",ha="center",fontsize=11,color=GRAY); ax.text(3.8,1.1,"överlastrelä",ha="center",fontsize=11,color=GRAY)
    if meter:
        for (x,t) in meter: ax.text(x,0.62,t,ha="center",fontsize=14,color=BLUE)
    if q: ax.text(2.6,0.2,q,ha="center",fontsize=14,color=RED)
F=fig(4.6,2.3); ax=cax(F,(-0.3,5.2),(0.85,2.6)); startare(ax); save(F,"v41_03_s21_startare")

def clamp(ax,x,y,n_in=1,hair=False,lab=None,q=False,r=0.42):
    """Strömtångens käft (ring) sedd framifrån med ledarna som passerar: × in, • ut."""
    ax.add_patch(Circle((x,y),r,fc="none",ec=INK,lw=4))
    ax.add_patch(Rectangle((x-0.12,y-r-0.55),0.24,0.5,fc="#dde4ea",ec=INK,lw=1.4))
    pts=[]
    if hair: pts=[(x-0.13,y,"×"),(x+0.13,y,"•")]
    else: pts=[(x+(k-(n_in-1)/2)*0.24,y,"×") for k in range(n_in)]
    for (px,py,m) in pts:
        ax.add_patch(Circle((px,py),0.1,fc="white",ec=ORANGE,lw=1.6)); ax.text(px,py,m,ha="center",va="center",fontsize=11,color=ORANGE)
    if lab: ax.text(x,y+r+0.18,lab,ha="center",fontsize=13,color=RED if q else INK)
F=fig(4.6,2.4); ax=cax(F,(-0.5,5.1),(-0.95,1.35))
clamp(ax,0.6,0.3,1,lab="en gång: I"); clamp(ax,2.3,0.3,2,lab="två varv: 2 · I"); clamp(ax,4.0,0.3,hair=True,lab="hårnål: 0")
ax.text(2.3,-0.85,"× ström in i bilden   • ström ut ur bilden",ha="center",fontsize=11,color=GRAY)
save(F,"v41_03_s22_tang")

# Övningar
def plate_net(name,plate,nat):
    F=fig(4.3,3.0); ax=cax(F,(-0.5,4.2),(-1.05,2.75))
    ax.add_patch(Rectangle((0.2,1.75),2.8,0.85,fc="#eef2f5",ec=INK,lw=1.6)); ax.text(1.6,2.35,"3~ motor",ha="center",fontsize=13); ax.text(1.6,1.98,plate,ha="center",fontsize=12.5,fontweight="bold")
    plint(ax,0.0,0.05,"Y","Y ?",q=True); plint(ax,2.35,0.05,"D","Δ ?",q=True)
    ax.text(4.15,2.2,nat,ha="right",va="center",fontsize=13,color=BLUE)
    save(F,name)
plate_net("v41_03_s11_ovn1","Δ/Y 254/440 V · 60 Hz","Ombord:\n440 V\n60 Hz")
F=fig(4.3,3.0); ax=cax(F,(-0.7,4.1),(-0.9,2.1)); plint6(ax,0.2,0.2)
for k,t in enumerate(("U1–U2: 4,1 Ω","V1–V2: 4,0 Ω","W1–W2: 4,2 Ω","sladdar: 0,3 Ω")): ax.text(2.35,1.45-k*0.36,t,fontsize=13,color=BLUE if k<3 else GRAY)
ax.text(1.6,-0.78,"R_{lindning} = ?",ha="center",fontsize=15,color=RED); save(F,"v41_03_s13_ovn2")
F=fig(4.6,3.0); ax=cax(F,(-1.6,5.0),(-2.1,1.9))
rnet(ax,0,0,1.1,"Y","R_{Y} = ?",hl=False,q=True); rnet(ax,3.3,0,1.1,"D","R_{Δ} = ?",hl=False,q=True)
ax.text(1.65,1.65,"R = 3,6 Ω per lindning",ha="center",fontsize=13,color=BLUE); save(F,"v41_03_s15_ovn3")
F=fig(4.6,3.0); ax=cax(F,(-0.1,4.8),(-0.45,2.95)); motor_side(ax,labels=False)
ax.text(2.4,2.6,"Vilken del öppnas? Vilka uppgifter avgör?",ha="center",fontsize=13,color=RED); save(F,"v41_03_s17_ovn4")
def rbars(name,labels,vals,ymax,q):
    F=fig(4.3,3.0); ax=F.add_axes((0.12,0.16,0.84,0.7))
    for sp in ("top","right","left"): ax.spines[sp].set_visible(False)
    ax.bar(range(len(vals)),vals,color=[BLUE,"#4f7fb0","#8fb0d3"][:len(vals)],width=0.55)
    for k,v in enumerate(vals): ax.text(k,v+ymax*0.02,f"{c(v)} Ω",ha="center",fontsize=14)
    ax.set_xticks(range(len(vals))); ax.set_xticklabels(labels,fontsize=13); ax.set_yticks([]); ax.set_ylim(0,ymax)
    F.text(0.97,0.92,q,ha="right",color=RED,fontsize=14); save(F,name)
rbars("v41_03_s19_ovn5",["U1–V1 i Y","U1–V1 i Δ"],[8.1,2.8],10,"R_{Y}/R_{Δ} = ?")
rbars("v41_03_s26_ovn6",["U1–V1","V1–W1","W1–U1"],[4.2,4.2,8.4],10,"Δ-koppling: vilket bleck saknas?")
F=fig(4.6,2.4); ax=cax(F,(-0.3,5.2),(0.0,2.6)); startare(ax,q="95–96 efter testknappen = ?",meter=[(2.75,"OL"),(4.7,"0,1 Ω")]); save(F,"v41_03_s28_ovn7")
F=fig(4.3,3.0); ax=cax(F,(-0.3,4.3),(-0.3,2.9))
ax.add_patch(Rectangle((0.0,1.0),2.8,1.6,fc="#eef2f5",ec=INK,lw=1.6))
for k,t in enumerate(("3~ motor  1,5 kW","Δ/Y 230/400 V","5,9/3,4 A","50 Hz")): ax.text(0.15,2.35-k*0.36,t,fontsize=13,fontweight="bold" if k==1 else "normal")
ax.text(4.2,2.3,"Landnät\n400 V, 50 Hz",ha="right",va="center",fontsize=13,color=BLUE)
ax.text(0.0,0.55,"Koppling = ?",fontsize=15,color=RED); ax.text(0.0,0.05,"Överlastrelä = ? A",fontsize=15,color=RED); save(F,"v41_03_s30_ovn8")
F=fig(4.3,2.8); ax=cax(F,(-0.3,4.1),(-1.25,1.6))
clamp(ax,0.9,0.3,2,lab="två varv: ?",q=True); clamp(ax,3.0,0.3,hair=True,lab="hårnål: ?",q=True)
ax.text(1.95,-1.12,"I = 1,8 A genom sladden",ha="center",fontsize=13,color=BLUE); save(F,"v41_03_s32_ovn9")
F=fig(4.3,3.0); ax=cax(F,(-0.3,4.4),(-0.3,2.9))
for k in range(3): ax.plot([0.2,2.9],[1.55+k*0.1,1.55+k*0.1],color=PHC[k],lw=2)
ax.add_patch(Rectangle((0.2,1.45),2.7,0.4,fc="none",ec=INK,lw=1.4))
ax.add_patch(Circle((1.35,1.65),0.38,fc="none",ec=INK,lw=4)); ax.add_patch(Rectangle((1.23,0.72),0.24,0.55,fc="#dde4ea",ec=INK,lw=1.4))
ax.add_patch(Circle((3.55,1.65),0.5,fc="white",ec=INK,lw=LW)); ax.text(3.55,1.65,"M\n3~",ha="center",va="center",fontsize=13); ax.plot([2.9,3.05],[1.65,1.65],color=INK,lw=2)
ax.text(1.35,0.45,"0,2 A",ha="center",fontsize=15,color=BLUE); ax.text(0.2,2.35,"Ombord 440 V, 60 Hz, motorn går",fontsize=13,color=BLUE)
ax.text(2.2,0.0,"Varför så lite? Hur mäts fasströmmen?",ha="center",fontsize=13,color=RED); save(F,"v41_03_s34_ovn10")
