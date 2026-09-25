import numpy as np, matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle, Circle, Arc, Polygon, FancyArrowPatch
from matplotlib import font_manager
for f in font_manager.findSystemFonts():
    if "Carlito" in f: font_manager.fontManager.addfont(f)
plt.rcParams.update({"font.family":"Carlito","font.size":15,"axes.linewidth":1.2,
    "mathtext.fontset":"custom","mathtext.rm":"Carlito","mathtext.it":"Carlito:italic"})
# Index skrivs som riktiga nedsänkta tecken (X_L, U_R, Q_C, U_F) i stället för upphöjda bokstäver.
_SUB={"ᴸ":"L","ᶜ":"C","ᴿ":"R","ꜰ":"F"}
def sub(t):
    if not isinstance(t,str): return t
    for k,v in _SUB.items(): t=t.replace(k,r"$_\mathregular{"+v+"}$")
    return t
import matplotlib.axes, matplotlib.figure
_at=matplotlib.axes.Axes.text; _ft=matplotlib.figure.Figure.text
matplotlib.axes.Axes.text=lambda self,x,y,s,*a,**k:_at(self,x,y,sub(s),*a,**k)
matplotlib.figure.Figure.text=lambda self,x,y,s,*a,**k:_ft(self,x,y,sub(s),*a,**k)
for _n in ("set_xlabel","set_ylabel","set_title"):
    _o=getattr(matplotlib.axes.Axes,_n)
    setattr(matplotlib.axes.Axes,_n,(lambda o:lambda self,t,*a,**k:o(self,sub(t),*a,**k))(_o))
_xl=matplotlib.axes.Axes.set_xticklabels
matplotlib.axes.Axes.set_xticklabels=lambda self,labels,*a,**k:_xl(self,[sub(l) for l in labels],*a,**k)
BLUE="#064F91"; GREEN="#0E7C5A"; RED="#B8323C"; ORANGE="#C8641E"; INK="#111111"; GRAY="#6B6B6B"; LIGHT="#D9E3EE"
OUT=None
K=1.25
def fig(w=4.3,h=3.0):
    f=plt.figure(figsize=(w/K,h/K)); return f
def save(f,name):
    f.savefig(f"{OUT}/{name}.png",dpi=int(250*1.25),transparent=True); plt.close(f)
def c(x):  # swedish decimal
    return str(x).replace(".",",")

# ---------- waveform axes ----------
def wave_ax(f,rect=(0.13,0.16,0.83,0.78)):
    ax=f.add_axes(rect)
    for s in ("top","right"): ax.spines[s].set_visible(False)
    ax.spines["left"].set_color(GRAY); ax.spines["bottom"].set_color(GRAY)
    ax.axhline(0,color=GRAY,lw=1.0,zorder=1)
    ax.tick_params(colors=GRAY,labelsize=12,length=3)
    return ax
def bracket(ax,x1,x2,y,text,color=INK,above=True,fs=14):
    ax.annotate("",xy=(x1,y),xytext=(x2,y),arrowprops=dict(arrowstyle="<|-|>",color=color,lw=1.4,mutation_scale=12,shrinkA=0,shrinkB=0))
    ax.text((x1+x2)/2,y+(1 if above else -1)*0.06*(ax.get_ylim()[1]-ax.get_ylim()[0]),text,ha="center",va="bottom" if above else "top",color=color,fontsize=fs)

# ---------- circuit primitives (drawn in a data-space axes, units ~ inches) ----------
def cax(f,xlim,ylim):
    ax=f.add_axes((0,0,1,1)); ax.set_xlim(*xlim); ax.set_ylim(*ylim); ax.set_aspect("equal"); ax.axis("off"); return ax
LW=2.0
def wire(ax,*pts,color=INK):
    xs,ys=zip(*pts); ax.plot(xs,ys,color=color,lw=LW,solid_capstyle="round",solid_joinstyle="round")
def resistor(ax,x,y,vert=False,label=None,lpos=None,color=INK,L=0.7,W=0.24):
    if vert:
        ax.add_patch(Rectangle((x-W/2,y-L/2),W,L,fc="white",ec=color,lw=LW,zorder=3))
    else:
        ax.add_patch(Rectangle((x-L/2,y-W/2),L,W,fc="white",ec=color,lw=LW,zorder=3))
    if label: _lab(ax,x,y,label,vert,lpos)
def inductor(ax,x,y,vert=False,label=None,lpos=None,n=4,L=0.8,color=INK):
    r=L/(2*n)
    # white-out the wire under the coil
    if vert: ax.plot([x,x],[y-L/2,y+L/2],color="white",lw=LW*2,zorder=2)
    else: ax.plot([x-L/2,x+L/2],[y,y],color="white",lw=LW*2,zorder=2)
    for i in range(n):
        cc=-L/2+r+2*r*i
        if vert: ax.add_patch(Arc((x,y+cc),2*r,2*r,theta1=-90,theta2=90,color=color,lw=LW,zorder=3))
        else: ax.add_patch(Arc((x+cc,y),2*r,2*r,theta1=0,theta2=180,color=color,lw=LW,zorder=3))
    if label: _lab(ax,x,y,label,vert,lpos)
def capacitor(ax,x,y,vert=False,label=None,lpos=None,color=INK,gap=0.1,P=0.36):
    if vert:
        ax.plot([x,x],[y-gap/2,y+gap/2],color="white",lw=LW*3,zorder=2)
        for d in (-gap/2,gap/2): ax.plot([x-P/2,x+P/2],[y+d,y+d],color=color,lw=LW*1.3,zorder=3)
    else:
        ax.plot([x-gap/2,x+gap/2],[y,y],color="white",lw=LW*3,zorder=2)
        for d in (-gap/2,gap/2): ax.plot([x+d,x+d],[y-P/2,y+P/2],color=color,lw=LW*1.3,zorder=3)
    if label: _lab(ax,x,y,label,vert,lpos)
def ac_source(ax,x,y,label=None,lpos="l",R=0.26):
    ax.add_patch(Circle((x,y),R,fc="white",ec=INK,lw=LW,zorder=3))
    t=np.linspace(-1,1,50); ax.plot(x+t*R*0.6,y+0.35*R*np.sin(np.pi*t),color=INK,lw=1.6,zorder=4)
    if label: _lab(ax,x,y,label,True,lpos,off=R+0.12)
def meter(ax,x,y,sym,label=None,lpos=None,vert=False,R=0.2):
    ax.add_patch(Circle((x,y),R,fc="white",ec=INK,lw=LW,zorder=3))
    ax.text(x,y,sym,ha="center",va="center",fontsize=13,zorder=4,fontweight="bold")
    if label: _lab(ax,x,y,label,vert,lpos,off=R+0.1)
def box(ax,x,y,w,h,text,fc="white",ec=INK,fs=14):
    ax.add_patch(Rectangle((x-w/2,y-h/2),w,h,fc=fc,ec=ec,lw=LW,zorder=3)); ax.text(x,y,text,ha="center",va="center",fontsize=fs,zorder=4)
def _lab(ax,x,y,label,vert,lpos,off=0.28):
    if lpos is None: lpos="r" if vert else "t"
    d={"t":(0,off,"center","bottom"),"b":(0,-off,"center","top"),"l":(-off,0,"right","center"),"r":(off,0,"left","center")}[lpos]
    ax.text(x+d[0],y+d[1],label,ha=d[2],va=d[3],fontsize=14,color=INK,linespacing=1.15)
def arrow(ax,p1,p2,color=BLUE,lw=1.8,ms=14,label=None,lp=None,ha="center",va="center",fs=14):
    if label and "?" in label: color=RED
    ax.add_patch(FancyArrowPatch(p1,p2,arrowstyle="-|>",mutation_scale=ms,color=color,lw=lw,zorder=5,shrinkA=0,shrinkB=0))
    if label: ax.text(*(lp or ((p1[0]+p2[0])/2,(p1[1]+p2[1])/2)),label,color=color,ha=ha,va=va,fontsize=fs)

# ---------- triangle (effekt/impedans) ----------
def triangle(f,a,b,labels,colors=(BLUE,GREEN,INK),angle_label=None,down=False,rect=(0.02,0.02,0.96,0.96),pad=None,note=None):
    """a=horizontal leg, b=vertical leg (data units, proportional). labels=(horiz,vert,hyp)."""
    ax=f.add_axes(rect); ax.set_aspect("equal"); ax.axis("off")
    s=-1 if down else 1
    P0=(0,0);P1=(a,0);P2=(a,s*b)
    ax.plot([0,a],[0,0],color=colors[0],lw=3,solid_capstyle="round")
    ax.plot([a,a],[0,s*b],color=colors[1],lw=3,solid_capstyle="round")
    ax.plot([0,a],[0,s*b],color=colors[2],lw=3,solid_capstyle="round")
    m=max(a,b)*0.07
    ax.plot([a-m,a-m,a],[0,s*m,s*m],color=GRAY,lw=1)
    lc=[RED if "?" in l else c_ for l,c_ in zip(labels,colors)]
    ax.text(a/2,-s*m*1.2,labels[0],ha="center",va="top" if not down else "bottom",color=lc[0],fontsize=15)
    ax.text(a+m*1.2,s*b/2,labels[1],ha="left",va="center",color=lc[1],fontsize=15)
    ang=np.degrees(np.arctan2(b,a))
    ax.text(a/2-m*1.2*np.sin(np.radians(ang)),s*(b/2+m*1.2*np.cos(np.radians(ang))),labels[2],ha="right",va="bottom" if not down else "top",color=lc[2],fontsize=15,rotation=0)
    if note: ax.text(-max(a,b)*0.1,s*(b+max(a,b)*0.32),note,ha="left",va="top" if not down else "bottom",fontsize=15,color=RED if "?" in note else INK)
    if angle_label:
        r=a*0.28
        t1,t2=(0,ang) if not down else (-ang,0)
        ax.add_patch(Arc((0,0),2*r,2*r,theta1=t1,theta2=t2,color=INK,lw=1.3))
        am=np.radians(s*ang/2); ax.text(r*1.12*np.cos(am),r*1.12*np.sin(am),angle_label,ha="left",va="center",fontsize=15,color=RED if "?" in angle_label else INK)
    W=a+ (pad or max(a,b)*0.75); ax.set_xlim(-max(a,b)*0.12, W)
    lo,hi=(-m*4, b+m*2+(max(a,b)*0.3 if note else 0)) if not down else (-b-m*2, m*4)
    ax.set_ylim(lo,hi)
    return ax

# ---------- trefas och styrkretsar (vecka 41) ----------
def rresistor(ax,p1,p2,label=None,loff=0.3,color=INK,frac=0.42,W=0.2,lcolor=None,fs=14):
    """Resistor längs linjen p1→p2 (ledning + rektangel)."""
    p1=np.array(p1,float); p2=np.array(p2,float); d=p2-p1; L_=np.linalg.norm(d); u=d/L_; n=np.array([-u[1],u[0]])
    m=(p1+p2)/2; h=L_*frac/2
    ax.plot(*zip(p1,p2),color=color,lw=LW,zorder=2)
    corners=[m-u*h-n*W/2,m+u*h-n*W/2,m+u*h+n*W/2,m-u*h+n*W/2]
    ax.add_patch(Polygon(corners,closed=True,fc="white",ec=color,lw=LW,zorder=3))
    if label:
        q=m+n*loff; ax.text(*q,label,ha="center",va="center",fontsize=fs,color=lcolor or color)
def dot(ax,x,y,r=0.06,color=INK):
    ax.add_patch(Circle((x,y),r,fc=color,ec=color,zorder=4))
def vmark(ax,p1,p2,label,color=BLUE,off=(0.12,0),ha="left",fs=14):
    """Dubbelpil för en spänning mellan två punkter."""
    ax.add_patch(FancyArrowPatch(p1,p2,arrowstyle="<|-|>",mutation_scale=13,color=color,lw=1.6,zorder=5,shrinkA=2,shrinkB=2))
    ax.text((p1[0]+p2[0])/2+off[0],(p1[1]+p2[1])/2+off[1],label,ha=ha,va="center",color=RED if "?" in label else color,fontsize=fs)
def phasor(ax,ang,length,color,label=None,origin=(0,0),lr=1.12,fs=15,lw=2.6,lcolor=None):
    a=np.radians(ang); x0,y0=origin; x1,y1=x0+length*np.cos(a),y0+length*np.sin(a)
    ax.add_patch(FancyArrowPatch((x0,y0),(x1,y1),arrowstyle="-|>",mutation_scale=18,color=color,lw=lw,zorder=4,shrinkA=0,shrinkB=0))
    if label: ax.text(x0+length*lr*np.cos(a),y0+length*lr*np.sin(a),label,ha="center",va="center",fontsize=fs,color=lcolor or (RED if "?" in label else color))
    return (x1,y1)
def contact(ax,x,y,closed,label=None,nc=False,L=0.6,color=INK,unknown=False):
    """Kontakt i horisontell ledning. closed: sluten. nc: normalt sluten (markeras med hake)."""
    ax.plot([x-L/2,x+L/2],[y,y],color="white",lw=LW*3,zorder=2)
    dot(ax,x-L/2,y,0.045,color); dot(ax,x+L/2,y,0.045,color)
    c=GRAY if unknown else color; ls="--" if unknown else "-"
    if closed: ax.plot([x-L/2,x+L/2+0.03],[y,y+0.02],color=c,lw=LW,zorder=3,ls=ls)
    else: ax.plot([x-L/2,x+L/2*0.9],[y,y+0.28],color=c,lw=LW,zorder=3,ls=ls)
    if nc: ax.plot([x+L/2,x+L/2],[y,y+0.2],color=color,lw=LW,zorder=3)
    if label: ax.text(x,y-0.2,label,ha="center",va="top",fontsize=13,color=color)
def coil(ax,x,y,label="K1",on=False,w=0.55,h=0.34):
    ax.plot([x-w/2,x+w/2],[y,y],color="white",lw=LW*3,zorder=2)
    ax.add_patch(Rectangle((x-w/2,y-h/2),w,h,fc="#FFE08A" if on else "white",ec=INK,lw=LW,zorder=3))
    ax.text(x,y,label,ha="center",va="center",fontsize=13,zorder=4)
