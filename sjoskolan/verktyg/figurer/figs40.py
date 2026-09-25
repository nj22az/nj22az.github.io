import sys; sys.path.insert(0, sys.argv[1])
import figlib as L
from figlib import *
L.OUT=sys.argv[2]
T=np.linspace

# ================= v40_01 Sinus =================
def sine_basic(name,f_hz,tmax,amp,xt,ann):
    F=fig(4.3,3.0); ax=wave_ax(F)
    t=T(0,tmax,600); ax.plot(t,amp*np.sin(2*np.pi*f_hz*t/1000),color=BLUE,lw=2.4)
    ax.set_xlim(0,tmax*1.06); ax.set_ylim(-amp*1.45,amp*1.55)
    ax.set_xticks(xt); ax.set_xticklabels([c(x) for x in xt[:-1]]+[c(xt[-1])+" ms"]); ax.set_yticks([])
    ax.text(-tmax*0.02,amp*1.5,"u",ha="right",va="top",fontsize=14,color=GRAY,style="italic")
    ann(ax); save(F,name)

# s7 period
def a(ax):
    ax.plot([5,5],[0,1],color=GRAY,lw=0.8,ls=":"); ax.plot([25,25],[0,1],color=GRAY,lw=0.8,ls=":")
    bracket(ax,5,25,1.12,"T = 20 ms")
    ax.text(38,-1.35,"f = 50 Hz",ha="right",fontsize=14,color=BLUE)
sine_basic("v40_01_s07_period",50,40,1,[0,10,20,30,40],a)
# s11 Ö1
def a(ax):
    ax.plot([5,5],[0,1],color=GRAY,lw=0.8,ls=":"); ax.plot([25,25],[0,1],color=GRAY,lw=0.8,ls=":")
    bracket(ax,5,25,1.12,"T = ?",color=RED)
    ax.text(40,-1.35,"f = 50 Hz",ha="right",fontsize=14,color=BLUE)
F=fig(4.3,3.0); ax=wave_ax(F); t=T(0,40,600); ax.plot(t,np.sin(2*np.pi*t/20),color=BLUE,lw=2.4)
ax.set_xlim(0,42.4); ax.set_ylim(-1.45,1.55); ax.set_xticks([]); ax.set_yticks([]); a(ax)
ax.text(42.4,-0.12,"t",ha="right",va="top",fontsize=13,color=GRAY,style="italic"); save(F,"v40_01_s11_ovn1")
# s13 Ö2  period 4.0 ms
def a(ax):
    ax.plot([1,1],[0,1],color=GRAY,lw=0.8,ls=":"); ax.plot([5,5],[0,1],color=GRAY,lw=0.8,ls=":")
    bracket(ax,1,5,1.12,"4,0 ms")
    ax.text(8,-1.35,"f = ?",ha="right",fontsize=15,color=RED)
sine_basic("v40_01_s13_ovn2",250,8,1,[0,2,4,6,8],a)

# s8 RMS
F=fig(4.3,3.4); ax=wave_ax(F,(0.16,0.14,0.8,0.8)); t=T(0,20,400); u=325*np.sin(2*np.pi*t/20)
ax.plot(t,u,color=BLUE,lw=2.4); ax.set_xlim(0,21); ax.set_ylim(-400,440); ax.set_yticks([]); ax.set_xticks([0,5,10,15,20]); ax.set_xticklabels(["0","5","10","15","20 ms"])
ax.axhline(230,color=GREEN,lw=1.8,ls="--"); ax.text(20.6,245,"U = 230 V (RMS)",ha="right",va="bottom",color=GREEN,fontsize=14)
ax.plot([5],[325],"o",color=BLUE,ms=5); ax.text(5.6,335,"û ≈ 325 V",color=BLUE,fontsize=14,va="bottom")
save(F,"v40_01_s08_rms")
# s15 Ö3
F=fig(4.3,3.0); ax=wave_ax(F); t=T(0,20,400); ax.plot(t,np.sin(2*np.pi*t/20),color=BLUE,lw=2.4)
ax.set_xlim(0,21); ax.set_ylim(-1.35,1.5); ax.set_xticks([]); ax.set_yticks([])
ax.axhline(0.707,color=GREEN,lw=1.8,ls="--"); ax.text(20.6,0.76,"U = 12,0 V (RMS)",ha="right",va="bottom",color=GREEN,fontsize=14)
ax.plot([5],[1],"o",color=RED,ms=5); ax.text(5.6,1.05,"û = ?",color=RED,fontsize=15,va="bottom")
save(F,"v40_01_s15_ovn3")
# s17 Ö4
F=fig(4.3,3.0); ax=wave_ax(F); ax.plot(t,np.sin(2*np.pi*t/20),color=BLUE,lw=2.4)
ax.set_xlim(0,21); ax.set_ylim(-1.35,1.5); ax.set_xticks([]); ax.set_yticks([])
ax.axhline(0.707,color=RED,lw=1.8,ls="--"); ax.text(20.6,0.76,"U = ?",ha="right",va="bottom",color=RED,fontsize=15)
ax.plot([5],[1],"o",color=BLUE,ms=5); ax.text(5.6,1.05,"û = 34,0 V",color=BLUE,fontsize=14,va="bottom")
save(F,"v40_01_s17_ovn4")
# s19 Ö5 oscilloscope
F=fig(4.3,3.0); ax=F.add_axes((0.03,0.05,0.94,0.9)); ax.set_xlim(0,10); ax.set_ylim(-4,4); ax.set_aspect("auto")
ax.add_patch(Rectangle((0,-4),10,8,fc="#0C1B24",ec=INK,lw=2))
for x in range(1,10): ax.plot([x,x],[-4,4],color="#2E4A55",lw=0.7)
for y in range(-3,4): ax.plot([0,10],[y,y],color="#2E4A55",lw=0.7)
ax.plot([5,5],[-4,4],color="#4F727E",lw=1); ax.plot([0,10],[0,0],color="#4F727E",lw=1)
tt=T(0,10,500); ax.plot(tt,2.5*np.sin(2*np.pi*tt/5),color="#7CF2B0",lw=2.2)
ax.annotate("",xy=(8.75,2.5),xytext=(8.75,-2.5),arrowprops=dict(arrowstyle="<|-|>",color="#FFD166",lw=1.6))
ax.plot([6.25,9.3],[2.5,2.5],color="#FFD166",lw=0.9,ls=":"); ax.plot([3.75,9.3],[-2.5,-2.5],color="#FFD166",lw=0.9,ls=":")
ax.text(0.3,-3.45,"û = ?   U = ?",ha="left",va="center",color="#FF8A8A",fontsize=15,zorder=6); ax.text(5,3.35,"20,0 V topp–topp",ha="center",va="center",color="#FFD166",fontsize=13)
ax.axis("off"); save(F,"v40_01_s19_ovn5")
# s21 medelvärde
F=fig(4.3,3.4); ax=wave_ax(F,(0.08,0.12,0.88,0.82)); t=T(0,20,400); u=np.sin(2*np.pi*t/20)
ax.plot(t,u,color=BLUE,lw=2.4); ax.fill_between(t,u,0,where=u>=0,color=BLUE,alpha=0.18); ax.fill_between(t,u,0,where=u<0,color=RED,alpha=0.18)
ax.text(5,0.4,"+",ha="center",fontsize=28,color=BLUE); ax.text(15,-0.62,"−",ha="center",fontsize=28,color=RED)
ax.set_xlim(0,21); ax.set_ylim(-1.3,1.45); ax.set_xticks([]); ax.set_yticks([])
ax.text(10.5,1.2,"Ytorna tar ut varandra: Umedel = 0",ha="center",fontsize=14)
save(F,"v40_01_s21_medel")
# s22 fasvinkel
F=fig(4.3,3.4); ax=wave_ax(F,(0.08,0.14,0.88,0.8)); t=T(0,25,500)
ax.plot(t,np.sin(2*np.pi*t/20),color=BLUE,lw=2.4,label="u₁"); ax.plot(t,np.sin(2*np.pi*(t-5)/20),color=ORANGE,lw=2.4,label="u₂")
ax.set_xlim(0,26); ax.set_ylim(-1.35,1.6); ax.set_xticks([0,5,10,15,20,25]); ax.set_xticklabels(["0","5","10","15","20","25 ms"]); ax.set_yticks([])
ax.plot([5,5],[0,1],color=GRAY,lw=0.8,ls=":"); ax.plot([10,10],[0,1],color=GRAY,lw=0.8,ls=":")
bracket(ax,5,10,1.1,"Δt = 5 ms")
ax.text(3.2,0.45,"u₁",color=BLUE,fontsize=15); ax.text(13.2,0.95,"u₂",color=ORANGE,fontsize=15)
ax.text(25.8,-1.3,"u₂ släpar u₁ 90° (50 Hz)",ha="right",fontsize=13,color=GRAY)
save(F,"v40_01_s22_fas")
# s23 RMS factor sine vs square
F=fig(4.3,3.4); ax=wave_ax(F,(0.08,0.14,0.88,0.8)); t=T(0,20,800)
ax.plot(t,np.where(np.sin(2*np.pi*t/20)>=0,1,-1),color=ORANGE,lw=2.2,drawstyle="steps-mid")
ax.plot(t,np.sin(2*np.pi*t/20),color=BLUE,lw=2.4)
ax.set_xlim(0,21); ax.set_ylim(-1.35,1.75); ax.set_xticks([]); ax.set_yticks([])
ax.text(0.4,1.4,"Sinus: U = û/√2",color=BLUE,fontsize=14); ax.text(11,1.4,"Fyrkant: U = û",color=ORANGE,fontsize=14)
save(F,"v40_01_s23_vagformer")
# s26 Ö6 / s28 Ö7: bara tidpunkten markeras, inte kurvans värde
for name,tp in (("v40_01_s26_ovn6",5),("v40_01_s28_ovn7",15)):
    F=fig(4.3,3.0); ax=wave_ax(F); t=T(0,20,600); ax.plot(t,np.sin(2*np.pi*t/20),color=BLUE,lw=2.4)
    ax.set_xlim(0,21); ax.set_ylim(-1.45,1.6); ax.set_yticks([]); ax.set_xticks([0,tp,20]); ax.set_xticklabels(["0",f"{tp}","20 ms"])
    ax.axvline(tp,color=RED,lw=1.6,ls="--")
    ax.text(tp+0.6 if tp<10 else tp-0.6,1.45,f"u({tp} ms) = ?",color=RED,fontsize=15,va="top",ha="left" if tp<10 else "right")
    ax.text(20.8,-1.4,"f = 50 Hz",ha="right",fontsize=13,color=BLUE)
    save(F,name)
# s30 Ö8
F=fig(4.3,3.0); ax=wave_ax(F); t=T(0,12,500)
ax.plot(t,np.sin(2*np.pi*t/20),color=BLUE,lw=2.6); ax.plot(t,np.sin(2*np.pi*(t-2)/20),color=ORANGE,lw=2.6)
ax.set_xlim(0,12.5); ax.set_ylim(-1.35,1.75); ax.set_xticks([0,2,4,6,8,10,12]); ax.set_xticklabels(["0","2","4","6","8","10","12 ms"]); ax.set_yticks([])
ax.plot([5,5],[0,1.05],color=GRAY,lw=1,ls=":"); ax.plot([7,7],[0,1.05],color=GRAY,lw=1,ls=":")
bracket(ax,5,7,1.12,"Δt = 2,0 ms"); ax.text(12.3,-1.3,"φ = ?",ha="right",color=RED,fontsize=16); ax.text(0.3,-1.3,"50 Hz",fontsize=13,color=GRAY)
save(F,"v40_01_s30_ovn8")
# s32 Ö9 circuit
F=fig(4.3,3.0); ax=cax(F,(-1.3,3.2),(-0.4,2.75))
wire(ax,(0,0),(0,2),(2.4,2),(2.4,0),(0,0)); ac_source(ax,0,1,"12,0 V\nRMS","l"); resistor(ax,2.4,1,vert=True,label="24 Ω",lpos="r")
arrow(ax,(0.7,2),(1.5,2),label="I",lp=(1.1,2.2),va="bottom"); ax.text(1.2,0.55,"P = ?",ha="center",fontsize=16,color=RED); save(F,"v40_01_s32_ovn9")
# s34 Ö10 two panels
F=fig(4.3,3.0)
for i,(lab,col,sq) in enumerate((("A: sinus",BLUE,False),("B: fyrkant",ORANGE,True))):
    ax=wave_ax(F,(0.13,0.56-0.47*i,0.83,0.38)); t=T(0,20,800); y=np.sin(2*np.pi*t/20)
    ax.plot(t,np.where(y>=0,1,-1) if sq else y,color=col,lw=2.2); ax.set_xlim(0,21); ax.set_ylim(-1.3,1.3)
    ax.set_xticks([]); ax.set_yticks([-1,1]); ax.set_yticklabels(["−12 V","+12 V"],fontsize=11)
    ax.text(20.5,1.0,lab,ha="right",color=col,fontsize=13)
save(F,"v40_01_s34_ovn10")

# ================= v40_02 Reaktans =================
def xf_axes(F,rect=(0.2,0.2,0.74,0.72)):
    ax=F.add_axes(rect)
    for s in ("top","right"): ax.spines[s].set_visible(False)
    for s in ("left","bottom"): ax.spines[s].set_color(GRAY)
    ax.tick_params(colors=GRAY,labelsize=12); return ax
F=fig(4.3,3.4); ax=xf_axes(F); f=T(0,100,200); ax.plot(f,2*np.pi*f*0.1,color=BLUE,lw=2.6)
ax.plot([50,50,0],[0,31.4,31.4],color=GRAY,ls=":",lw=1); ax.plot([50],[31.4],"o",color=BLUE,ms=6)
ax.text(52,29,"31,4 Ω vid 50 Hz",fontsize=13,va="top",color=BLUE); ax.set_xlim(0,105); ax.set_ylim(0,70)
ax.set_xlabel("f (Hz)",color=GRAY,fontsize=12); ax.set_ylabel("Xᴸ (Ω)",color=GRAY,fontsize=12)
ax.text(8,60,"L = 0,10 H\nXᴸ ökar med f",fontsize=14,color=INK,va="top"); save(F,"v40_02_s06_XL")
F=fig(4.3,3.4); ax=xf_axes(F); f=T(8,100,300); ax.plot(f,1/(2*np.pi*f*100e-6),color=GREEN,lw=2.6)
ax.plot([50,50,0],[0,31.8,31.8],color=GRAY,ls=":",lw=1); ax.plot([50],[31.8],"o",color=GREEN,ms=6)
ax.text(52,34,"31,8 Ω vid 50 Hz",fontsize=13,va="bottom",color=GREEN); ax.set_xlim(0,105); ax.set_ylim(0,200)
ax.set_xlabel("f (Hz)",color=GRAY,fontsize=12); ax.set_ylabel("Xᶜ (Ω)",color=GRAY,fontsize=12)
ax.text(40,185,"C = 100 µF\nXᶜ minskar med f",fontsize=14,va="top"); save(F,"v40_02_s07_XC")
F=fig(4.3,3.4); ax=xf_axes(F); f=T(5,120,300); XL=2*np.pi*f*0.1; XC=1/(2*np.pi*f*100e-6); f0=1/(2*np.pi*np.sqrt(0.1*100e-6))
ax.plot(f,XL,color=BLUE,lw=2.4); ax.plot(f,XC,color=GREEN,lw=2.4); ax.set_ylim(0,110); ax.set_xlim(0,125)
ax.plot([f0,f0],[0,97],color=RED,ls="--",lw=1.4); ax.text(f0+2,100,"resonans: Xᴸ = Xᶜ",color=RED,fontsize=13,va="center")
ax.text(100,72,"Xᴸ",color=BLUE,fontsize=15); ax.text(25,85,"Xᶜ",color=GREEN,fontsize=15)
ax.set_xlabel("f (Hz)",color=GRAY,fontsize=12); ax.set_ylabel("X (Ω)",color=GRAY,fontsize=12); save(F,"v40_02_s23_resonans")

def series_circuit(name,src,elems,extra=None,xl=(-1.4,4.5)):
    """elems: list of (kind,label) placed along top wire"""
    F=fig(4.3,3.0); ax=cax(F,xl,(-0.5,2.8)); W=3.4
    wire(ax,(0,0),(0,2),(W,2),(W,0),(0,0)); ac_source(ax,0,1,src,"l")
    n=len(elems); xs=[W*(i+1)/(n+1) for i in range(n)]
    if n==1: xs=[W/2]
    for (k,lab),x in zip(elems,xs):
        {"R":resistor,"L":inductor,"C":capacitor}[k](ax,x,2,label=lab,lpos="t")
    if extra: extra(ax)
    save(F,name)
series_circuit("v40_02_s11_ovn1","50 Hz",[("L","L = 0,10 H")],lambda ax:ax.text(1.7,0.8,"Xᴸ = ?",ha="center",fontsize=16,color=RED))
series_circuit("v40_02_s13_ovn2","50 Hz",[("C","C = 100 µF")],lambda ax:ax.text(1.7,0.8,"Xᶜ = ?",ha="center",fontsize=16,color=RED))
def ex(ax): arrow(ax,(3.4,1.5),(3.4,0.7),label="I = ?",lp=(3.25,1.1),ha="right"); 
series_circuit("v40_02_s17_ovn4","100 V\nRMS",[("R","R\n30 Ω"),("L","Xᴸ\n40 Ω")],ex)
def ex(ax):
    arrow(ax,(3.4,1.5),(3.4,0.7),label="I =\n2,0 A",lp=(3.55,1.1),ha="left")
    for x,t in ((1.13,"Uᴿ = ?"),(2.27,"Uᴸ = ?")): ax.text(x,1.55,t,ha="center",va="top",color=RED,fontsize=14)
    ax.text(1.7,0.55,"U = ?",ha="center",color=RED,fontsize=15)
series_circuit("v40_02_s19_ovn5","",[("R","R\n30 Ω"),("L","Xᴸ\n40 Ω")],ex)
def ex(ax): arrow(ax,(3.4,1.5),(3.4,0.7),label="I = ?",lp=(3.25,1.1),ha="right"); ax.text(1.7,0.55,"|Z| = ?  φ = ?",ha="center",color=RED,fontsize=15)
series_circuit("v40_02_s28_ovn7","200 V\nRMS",[("R","R\n60 Ω"),("C","Xᶜ\n80 Ω")],ex)
def ex(ax): ax.text(1.7,0.95,"50 Hz → 100 Hz",ha="center",fontsize=15,color=BLUE); ax.text(1.7,0.45,"Xᴸ = ?   Xᶜ = ?",ha="center",fontsize=15,color=RED)
series_circuit("v40_02_s30_ovn8","f",[("L","L"),("C","C")],ex)
def ex(ax): arrow(ax,(3.4,1.5),(3.4,0.7),label="I = ?",lp=(3.25,1.1),ha="right"); ax.text(1.7,0.55,"X = ?   |Z| = ?",ha="center",color=RED,fontsize=15)
series_circuit("v40_02_s32_ovn9","100 V\nRMS",[("R","R\n30 Ω"),("L","Xᴸ\n50 Ω"),("C","Xᶜ\n10 Ω")],ex)
def ex(ax): arrow(ax,(3.4,1.5),(3.4,0.7),label="I = ?",lp=(3.25,1.1),ha="right"); ax.text(1.7,0.55,"φ = ?",ha="center",color=RED,fontsize=15)
series_circuit("v40_02_s34_ovn10","100 V\nRMS",[("R","R\n20 Ω"),("L","Xᴸ\n40 Ω"),("C","Xᶜ\n40 Ω")],ex)
F=fig(4.3,3.0); triangle(F,30,40,("R = 30 Ω","Xᴸ = 40 Ω","|Z| = ?"),colors=(BLUE,GREEN,INK),rect=(0.06,0.04,0.9,0.92)); save(F,"v40_02_s15_ovn3")
F=fig(4.3,3.0); triangle(F,30,40,("R = 30 Ω","Xᴸ = 40 Ω","|Z|"),colors=(BLUE,GREEN,INK),angle_label="φ = ?",rect=(0.06,0.04,0.9,0.92)); save(F,"v40_02_s26_ovn6")
# s21 RL and RC triangles
F=fig(4.3,4.4); ax=F.add_axes((0.02,0.02,0.96,0.96)); ax.set_aspect("equal"); ax.axis("off")
for y0,s_,lab,txt in ((5.3,1,"Xᴸ","RL: strömmen släpar, φ > 0"),(3.3,-1,"Xᶜ","RC: strömmen leder, φ < 0")):
    ax.plot([4.8,4.8],[y0,y0+s_*2],color=GREEN,lw=3); ax.plot([0,4.8],[y0,y0+s_*2],color=INK,lw=3); ax.plot([0,4.8],[y0,y0],color=BLUE,lw=3)
    ax.text(2.4,y0-s_*0.12,"R",ha="center",va="top" if s_>0 else "bottom",color=BLUE,fontsize=15)
    ax.text(4.95,y0+s_*1.0,lab,va="center",color=GREEN,fontsize=15)
    ax.text(2.2,y0+s_*1.35,"|Z|",ha="right",va="center",fontsize=15)
    ax.add_patch(Arc((0,y0),1.8,1.8,theta1=0 if s_>0 else -22.62,theta2=22.62 if s_>0 else 0,color=INK,lw=1.3))
    ax.text(1.05,y0+s_*0.2,"φ",va="center",fontsize=15)
    ax.text(0.0,y0+s_*2.9,txt,va="center",fontsize=14)
ax.set_xlim(-0.3,6.2); ax.set_ylim(-0.1,8.7)
save(F,"v40_02_s21_fasvinkel")

# ================= v40_03 Effekt =================
def ptri(name,P,Q,labs,angle="φ",h=3.0,down=False,note=None):
    F=fig(4.3,h); triangle(F,P,abs(Q),labs,angle_label=angle,down=down,rect=(0.06,0.04,0.9,0.92),note=note); save(F,name)
ptri("v40_03_s06_tre",0.85,0.527,("P (W)","Q (var)","S (VA)"),h=3.4,note="cos φ = P/S")
ptri("v40_03_s13_ovn2",0.75,0.6614,("P = ?","Q","S = 920 VA"),note="cos φ = 0,75")
ptri("v40_03_s15_ovn3",600,800,("P = 600 W","Q = 800 var","S = ?"),note="PF = ?")
ptri("v40_03_s17_ovn4",0.8,0.6,("P = ?","Q = ?","S = 2,0 kVA"),note="cos φ = 0,80")
# s7 reactive p(t)
F=fig(4.3,3.4); ax=wave_ax(F,(0.08,0.12,0.88,0.82)); t=T(0,20,500); u=np.sin(2*np.pi*t/20); i=0.7*np.sin(2*np.pi*t/20-np.pi/2); p=u*i*1.4
ax.fill_between(t,p,0,where=p>=0,color=RED,alpha=0.18); ax.fill_between(t,p,0,where=p<0,color=GREEN,alpha=0.22)
ax.plot(t,u,color=BLUE,lw=2.2); ax.plot(t,i,color=ORANGE,lw=2.2); ax.plot(t,p,color=RED,lw=1.6,ls="--")
ax.set_xlim(0,21); ax.set_ylim(-1.3,1.55); ax.set_xticks([]); ax.set_yticks([])
ax.text(0.3,1.25,"u",color=BLUE,fontsize=15); ax.text(2.6,1.25,"i släpar 90°",color=ORANGE,fontsize=15); ax.text(11,1.25,"p = u·i, medel 0",color=RED,fontsize=15)
save(F,"v40_03_s07_reaktiv")
# circuit loads
def load_circ(name,src,loadtxt,extra):
    F=fig(4.3,3.0); ax=cax(F,(-1.4,4.2),(-0.5,2.8)); W=3.4
    wire(ax,(0,0),(0,2),(W,2),(W,0),(0,0)); ac_source(ax,0,1,src,"l"); meter(ax,1.2,2,"A")
    ax.plot([W,W],[0.62,1.38],color="white",lw=6,zorder=2); box(ax,W,1,1.55 if "\n" in loadtxt else 0.95,0.8,loadtxt,fc=LIGHT,fs=12)
    extra(ax); save(F,name)
load_circ("v40_03_s11_ovn1","230 V",  "Last",lambda ax:(ax.text(1.2,2.3,"4,0 A",ha="center",fontsize=14),ax.text(1.5,0.8,"S = ?",ha="center",fontsize=16,color=RED)))
load_circ("v40_03_s26_ovn6","230 V","P = 1 840 W\nPF = 0,80",lambda ax:ax.text(1.2,2.3,"I = ?",ha="center",fontsize=15,color=RED))
# s19 Ö5 energy
F=fig(4.3,3.0); ax=xf_axes(F,(0.2,0.22,0.75,0.7)); ax.fill_between([0,3],[1.6,1.6],color=BLUE,alpha=0.2,step="pre"); ax.plot([0,0,3,3],[0,1.6,1.6,0],color=BLUE,lw=2.4)
ax.set_xlim(0,4); ax.set_ylim(0,2.2); ax.set_xticks([0,1,2,3,4]); ax.set_yticks([0,1.6]); ax.set_yticklabels(["0","1,60"])
ax.set_xlabel("t (h)",color=GRAY,fontsize=12); ax.set_ylabel("P (kW)",color=GRAY,fontsize=12)
ax.text(1.5,0.8,"E = ? kWh",ha="center",fontsize=16,color=RED); ax.text(3.95,2.05,"S = 2,0 kVA",ha="right",fontsize=13,color=GRAY)
save(F,"v40_03_s19_ovn5")
# s21 harmonics / s34 Ö10
def harm(name,extra):
    F=fig(4.3,3.4 if "s21" in name else 3.0); ax=wave_ax(F,(0.08,0.12,0.88,0.8)); t=T(0,20,800); w=2*np.pi*t/20
    ax.plot(t,np.sin(w),color=BLUE,lw=2.2); ax.plot(t,0.75*(np.sin(w-0.3)+0.33*np.sin(3*w)+0.18*np.sin(5*w)),color=ORANGE,lw=2.2)
    ax.set_xlim(0,21); ax.set_ylim(-1.35,1.6); ax.set_xticks([]); ax.set_yticks([]); extra(ax); save(F,name)
harm("v40_03_s21_overtoner",lambda ax:(ax.text(0.3,1.3,"u (sinus)",color=BLUE,fontsize=14),ax.text(8,1.3,"i med övertoner",color=ORANGE,fontsize=14),ax.text(20.7,-1.3,"PF = P/S ≠ cos φ₁",ha="right",fontsize=14),ax.text(0.3,-0.75,"Ombord: frekvens-\nomriktare",fontsize=12,color=GRAY,va="top")))
harm("v40_03_s34_ovn10",lambda ax:(ax.text(0.3,1.3,"u",color=BLUE,fontsize=14),ax.text(2,1.3,"i",color=ORANGE,fontsize=14),ax.text(20.7,1.3,"P = 800 W   S = 1 000 VA",ha="right",fontsize=13),ax.text(20.7,-1.3,"PF = ?",ha="right",fontsize=15,color=RED)))
# s22 compensation / s28 Ö7
def comp(name,P,QL,QC,labs,h=3.4,exercise=False):
    F=fig(4.3,h); ax=F.add_axes((0.04,0.04,0.92,0.92)); ax.set_aspect("equal"); ax.axis("off")
    ax.plot([0,P],[0,0],color=BLUE,lw=3); ax.plot([P,P],[0,QL],color=GREEN,lw=3); ax.plot([0,P],[0,QL],color=INK,lw=3)
    L_=QL*0.5 if exercise else QC
    ax.add_patch(FancyArrowPatch((P+2.2,QL),(P+2.2,QL-L_),arrowstyle="-|>",mutation_scale=16,color=RED if exercise else ORANGE,lw=2.6))
    ax.text(P/2,-0.3,labs[0],ha="center",va="top",color=BLUE,fontsize=15); ax.text(P+0.15,QL*0.3,labs[1],ha="left",va="center",color=GREEN,fontsize=15)
    ax.text(P+2.4,QL-L_/2,labs[2],ha="left",va="center",color=RED if exercise else ORANGE,fontsize=15); ax.text(P*0.38,QL*0.62,labs[3],ha="right",color=INK,fontsize=15)
    if len(labs)>4: ax.text(P*0.5,-0.9,labs[4],ha="center",va="top",color=INK,fontsize=14)
    ax.set_xlim(-2.4,P+4.1); ax.set_ylim(-1.5 if len(labs)>4 else -0.9,QL+0.4); save(F,name)
comp("v40_03_s22_kompensering",3,4,4,("P = 3 kW oförändrad","Qᴸ =\n4 kvar","Qᶜ =\n4 kvar","S före = 5 kVA","S efter = P = 3 kVA"))
comp("v40_03_s28_ovn7",3,4,4,("P = 3 kW","Q =\n+4 kvar","Qᶜ = ?","S före"),h=3.0,exercise=True)
# s30 Ö8 two triangles same P
F=fig(4.3,3.0); ax=F.add_axes((0.03,0.04,0.94,0.92)); ax.set_aspect("equal"); ax.axis("off")
P=3.0
for pf,col,lab,dy in ((0.6,INK,"PF 0,60",0),(0.9,BLUE,"PF 0,90",0)):
    Q=P*np.tan(np.arccos(pf)); ax.plot([0,P,P,0],[0,0,Q,0],color=col,lw=2.6); ax.text(P+0.12,Q,f"{lab}: I = ?",color=RED,fontsize=14,va="center")
ax.text(P/2,-0.25,"P = 1 800 W, 230 V",ha="center",va="top",fontsize=14); ax.set_xlim(-0.2,6.1); ax.set_ylim(-0.8,4.3); save(F,"v40_03_s30_ovn8")
# s32 Ö9 loss bars
F=fig(4.3,3.0); ax=xf_axes(F,(0.14,0.16,0.82,0.66)); ax.bar([0,1],[12,8],color=[BLUE,"#6f9bc6"],width=0.55)
ax.set_xticks([0,1]); ax.set_xticklabels(["före","efter"],fontsize=14,color=INK); ax.set_yticks([]); ax.spines["left"].set_visible(False)
ax.text(0,12.4,"I = 12 A",ha="center",fontsize=14); ax.text(1,8.4,"I = 8 A",ha="center",fontsize=14)
ax.text(1.55,6,"P₂/P₁ = ?",ha="left",fontsize=16,color=RED); ax.set_xlim(-0.5,2.6)
ax.set_ylim(0,15); ax.set_title("Strömmen i samma kabel, Pförlust = I²R",fontsize=13,color=INK); save(F,"v40_03_s32_ovn9")
