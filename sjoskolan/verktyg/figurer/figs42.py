"""Figurer till vecka 42: elektriska risker, regler och arbetsmetoder, riskbedömning och skydd.
Användning: figs42.py <katalog med figlib.py> <utkatalog>
Regler: rött bara för det som söks (”?”), orange för fara, inga svar på övningsbilder."""
import sys; sys.path.insert(0, sys.argv[1])
import figlib as L
from figlib import *
from matplotlib.patches import FancyBboxPatch
L.OUT = sys.argv[2]
LBLUE = "#DCEBF7"; WATER = "#BFDDF2"; STEEL = "#8C99A6"; PALE = "#F3F6F9"

def S(b, i):
    """Storhet med nedsänkt index, t.ex. S('U', 'beröring')."""
    return b + r"$_\mathregular{" + i + "}$"

def person(ax, x, y, s=1.0, arms=((-0.45, 0.15), (0.45, 0.15)), legs=((-0.22, -1.0), (0.22, -1.0)), color=INK, lw=7):
    """Enkel figur: (x, y) är axlarnas mitt. arms/legs är ändpunkter relativt axlar respektive höft."""
    hip = (x, y - 0.75 * s)
    ax.add_patch(Circle((x, y + 0.28 * s), 0.2 * s, fc=color, ec=color, zorder=4))
    ax.plot([x, hip[0]], [y, hip[1]], color=color, lw=lw, solid_capstyle="round", zorder=4)
    for dx, dy in arms: ax.plot([x, x + dx * s], [y, y + dy * s], color=color, lw=lw * 0.8, solid_capstyle="round", zorder=4)
    for dx, dy in legs: ax.plot([hip[0], hip[0] + dx * s], [hip[1], hip[1] + dy * s], color=color, lw=lw * 0.85, solid_capstyle="round", zorder=4)
    return hip

def rbox(ax, x, y, w, h, text, fc="white", ec=INK, fs=14, color=INK, weight="normal", lw=1.6, ha="center"):
    ax.add_patch(FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0,rounding_size=0.08", fc=fc, ec=ec, lw=lw, zorder=2))
    tx = x + w / 2 if ha == "center" else x + 0.15
    ax.text(tx, y + h / 2, text, ha=ha, va="center", fontsize=fs, color=color, weight=weight, zorder=3)

def harrow(ax, p1, p2, color=INK, lw=1.8, style="-|>", ls="-"):
    ax.annotate("", xy=p2, xytext=p1, arrowprops=dict(arrowstyle=style, color=color, lw=lw, mutation_scale=14, shrinkA=0, shrinkB=0, linestyle=ls))

def earth(ax, x, y, color=INK):
    ax.plot([x, x], [y, y - 0.15], color=color, lw=LW)
    for k, w in enumerate((0.22, 0.14, 0.06)): ax.plot([x - w, x + w], [y - 0.15 - 0.07 * k] * 2, color=color, lw=LW)

def switch(ax, x, y, closed, label=None, L=0.6, color=INK, above=True):
    """Liggande brytare/frånskiljare."""
    ax.plot([x - L / 2 - 0.15, x - L / 2], [y, y], color=color, lw=LW); ax.plot([x + L / 2, x + L / 2 + 0.15], [y, y], color=color, lw=LW)
    end = (x + L / 2, y) if closed else (x + L / 2 - 0.05, y + 0.32)
    ax.plot([x - L / 2, end[0]], [y, end[1]], color=color, lw=LW)
    dot(ax, x - L / 2, y, 0.04); dot(ax, x + L / 2, y, 0.04)
    if label: ax.text(x, y + (0.45 if above else -0.35), label, ha="center", va="bottom" if above else "top", fontsize=13)

# ================= v42_01 Elektriska risker =================
# s6: strömmens väg genom kroppen
F = fig(4.3, 4.2); ax = cax(F, (-2.15, 2.15), (-2.3, 1.9))
hip = person(ax, 0, 0.7, 1.35, arms=((-0.95, -0.25), (0.95, -0.25)), legs=((-0.35, -1.05), (0.35, -1.05)), color="#C7D2DC", lw=16)
ax.add_patch(Circle((0.12, 0.35), 0.13, fc=RED, ec=RED, alpha=0.85, zorder=5)); ax.text(-0.08, 0.6, "hjärtat", fontsize=12, color=RED, zorder=6, ha="right")
hl, hr = (-1.28, 0.36), (1.28, 0.36); fl = (-0.47, -1.37)
ax.plot([hl[0], -0.3, 0.3, hr[0]], [hl[1], 0.3, 0.3, hr[1]], color=ORANGE, lw=3.2, zorder=6)
ax.plot([hr[0] - 0.02, 0.55, 0.22, 0.0, -0.1, -0.3, fl[0]], [hr[1] - 0.08, 0.22, 0.18, -0.2, -0.75, -1.05, fl[1]], color=BLUE, lw=3.2, zorder=6, ls=(0, (4, 2)))
for p in (hl, hr, fl): ax.add_patch(Circle(p, 0.08, fc="white", ec=INK, lw=1.6, zorder=7))
ax.text(-2.1, 1.65, "hand–hand", color=ORANGE, fontsize=14, weight="bold"); ax.text(-2.1, 1.35, "genom", color=ORANGE, fontsize=13); ax.text(-2.1, 1.1, "bröstkorgen", color=ORANGE, fontsize=13)
ax.text(2.1, 1.65, "hand–fot", color=BLUE, fontsize=14, weight="bold", ha="right"); ax.text(2.1, 1.35, "också genom", color=BLUE, fontsize=13, ha="right"); ax.text(2.1, 1.1, "bröstkorgen", color=BLUE, fontsize=13, ha="right")
ax.text(0, -2.05, "Allvaret beror på ström, tid och strömväg", ha="center", fontsize=14)
save(F, "v42_01_s06_stromvag")

# s7: beröringsspänning vid isolationsfel
F = fig(4.3, 4.2); ax = cax(F, (-0.2, 4.1), (-0.3, 3.9))
ax.add_patch(Rectangle((-0.2, -0.3), 4.3, 0.45, fc=STEEL, ec="none")); ax.text(3.95, -0.08, "ledande stålskrov/däck", ha="right", va="center", fontsize=12, color="white")
ax.add_patch(Rectangle((0.0, 0.15), 1.4, 1.7, fc=PALE, ec=INK, lw=2)); ax.text(0.7, 1.95, "metallhölje", ha="center", fontsize=13)
ax.plot([0.0, 0.55, 0.55], [1.45, 1.45, 1.0], color=ORANGE, lw=2.2); ax.text(0.1, 1.55, "L", color=ORANGE, fontsize=13)
ax.plot([0.55, 0.7, 0.5, 0.75, 1.4], [1.0, 0.85, 0.72, 0.58, 0.58], color=ORANGE, lw=2.2)
ax.text(0.7, 0.33, "isolationsfel", ha="center", fontsize=12, color=ORANGE)
ax.plot([0.35, 0.35], [0.15, 0.02], color=GREEN, lw=2); ax.plot([0.35, 0.35], [-0.12, -0.05], color=GREEN, lw=2)
ax.text(0.45, -0.1, "PE bruten", fontsize=11, color="white", va="center")
person(ax, 2.4, 2.05, 1.0, arms=((-0.95, -0.35), (0.4, -0.55)), legs=((-0.2, -1.03), (0.25, -1.03)))
ax.add_patch(Circle((1.45, 1.7), 0.07, fc="white", ec=INK, lw=1.5, zorder=6))
ax.text(0.7, 2.4, S("V", "A"), ha="center", fontsize=15, color=BLUE)
ax.text(3.05, 0.4, S("V", "B"), ha="center", fontsize=15, color=BLUE, zorder=6)
harrow(ax, (3.45, 0.2), (3.45, 1.7), color=BLUE, style="<|-|>")
ax.text(3.45, 2.05, S("U", "beröring"), ha="center", fontsize=15, color=BLUE)
ax.text(1.95, 3.45, S("U", "beröring") + " = |" + S("V", "A") + " − " + S("V", "B") + "|", ha="center", fontsize=16, color=BLUE)
save(F, "v42_01_s07_berorings")

# s8: ljusbågens följder
F = fig(4.3, 3.6); ax = cax(F, (-2.15, 2.15), (-1.8, 1.8))
ax.add_patch(Rectangle((-1.2, -0.25), 0.9, 0.5, fc=STEEL, ec=INK, lw=1.5)); ax.add_patch(Rectangle((0.3, -0.25), 0.9, 0.5, fc=STEEL, ec=INK, lw=1.5))
star = [(np.cos(a) * (0.42 if k % 2 == 0 else 0.18), np.sin(a) * (0.42 if k % 2 == 0 else 0.18)) for k, a in enumerate(np.linspace(0, 2 * np.pi, 17)[:-1])]
ax.add_patch(Polygon(star, fc="#FFD27A", ec=ORANGE, lw=2, zorder=5))
for (dx, dy, t) in ((-1.2, 1.1, "värme"), (1.2, 1.1, "tryckvåg"), (-1.2, -1.1, "starkt ljus"), (1.2, -1.1, "splitter")):
    harrow(ax, (dx * 0.35, dy * 0.35), (dx * 0.9, dy * 0.9), color=ORANGE, lw=2.2)
    ax.text(dx * 1.12, dy * 1.12, t, ha="center", va="center", fontsize=15, color=ORANGE, weight="bold")
ax.text(0, 1.62, "Skada utan ström genom kroppen", ha="center", fontsize=13)
ax.text(0, -1.68, "även giftiga gaser och buller", ha="center", fontsize=12, color=GRAY)
save(F, "v42_01_s08_ljusbage")

# s9: exempel skadad skarvkabel i vatten
F = fig(4.3, 3.2); ax = cax(F, (0, 4.3), (0, 3.2))
ax.add_patch(Rectangle((0, 0), 4.3, 0.5, fc=STEEL, ec="none"))
ax.add_patch(matplotlib.patches.Ellipse((2.4, 0.55), 2.4, 0.35, fc=WATER, ec="#6FA8D6", lw=1.2, zorder=2)); ax.text(3.2, 1.0, "vatten på däck", ha="center", fontsize=13, color="#2F6E9E")
xs = np.linspace(0.2, 4.1, 60); ys = 0.62 + 0.08 * np.sin(xs * 2.2)
ax.plot(xs[xs < 2.2], ys[xs < 2.2], color=INK, lw=6, solid_capstyle="round", zorder=3); ax.plot(xs[xs > 2.5], ys[xs > 2.5], color=INK, lw=6, solid_capstyle="round", zorder=3)
ax.plot([2.2, 2.5], [0.66, 0.6], color="#B87333", lw=2.2, zorder=3); ax.plot([2.22, 2.48], [0.6, 0.66], color="#B87333", lw=2.2, zorder=3)
harrow(ax, (1.7, 1.75), (2.3, 0.85), color=ORANGE); ax.text(1.65, 1.95, "synlig skada på isolationen", ha="center", fontsize=13, color=ORANGE)
ax.plot([0.3, 0.3], [0.5, 2.6], color=GRAY, lw=2); ax.plot([4.0, 4.0], [0.5, 2.6], color=GRAY, lw=2)
for k in range(6): ax.add_patch(Rectangle((0.3 + k * 0.62, 2.45), 0.31, 0.15, fc="#E2B400", ec="none"))
ax.text(2.15, 2.85, "Avspärrat tills vidare beslut", ha="center", fontsize=13)
save(F, "v42_01_s09_exempel")

# s14 stöd 3: beröringspunkter
F = fig(4.3, 3.6); ax = cax(F, (-0.1, 4.2), (-0.3, 3.3))
ax.add_patch(Rectangle((0.1, 0.4), 1.2, 1.4, fc=PALE, ec=INK, lw=2)); ax.text(0.7, 1.95, "hölje", ha="center", fontsize=13)
ax.add_patch(Rectangle((3.0, 0.0), 0.35, 2.6, fc=STEEL, ec=INK, lw=1.5)); ax.text(3.17, 2.75, "ledande struktur", ha="center", fontsize=13)
person(ax, 2.15, 1.55, 0.9, arms=((-0.85, -0.2), (0.9, -0.1)), legs=((-0.2, -0.95), (0.2, -0.95)))
ax.plot([-0.1, 4.2], [-0.15, -0.15], color=GRAY, lw=1.5)
ax.text(0.7, 1.25, "60 V över", ha="center", fontsize=12, color=BLUE); ax.text(0.7, 0.98, "strukturen", ha="center", fontsize=12, color=BLUE)
ax.text(1.1, 3.0, S("U", "beröring") + " = ?", ha="center", fontsize=16, color=RED)
for (px, py, t) in ((1.3, 1.37, "A"), (3.0, 1.45, "B")): ax.add_patch(Circle((px, py), 0.07, fc="white", ec=INK, lw=1.5, zorder=6)); ax.text(px + (0.2 if t == "A" else 0.1), py + 0.22, t, fontsize=14, weight="bold", ha="center", color=BLUE)
save(F, "v42_01_s14_stod3")

# s16 stöd 4: räknemodell
F = fig(4.3, 3.2); ax = cax(F, (-0.2, 4.1), (-1.0, 2.2))
ax.plot([0.9, 0.9, 3.5, 3.5, 0.9, 0.9], [0.87, 1.5, 1.5, -0.2, -0.2, 0.43], color=INK, lw=LW)
ax.add_patch(Circle((0.9, 0.65), 0.22, fc="white", ec=INK, lw=LW)); ax.text(0.9, 0.73, "+", ha="center", va="center", fontsize=12); ax.text(0.9, 0.56, "−", ha="center", va="center", fontsize=12)
ax.text(0.6, 0.65, "24 V", ha="right", va="center", fontsize=14)
rresistor(ax, (3.5, 1.5), (3.5, -0.2), None); ax.text(3.3, 0.8, "R = 2 000 Ω", ha="right", fontsize=14); ax.text(3.3, 0.5, "(antagande)", ha="right", fontsize=12, color=GRAY)
meter(ax, 2.2, 1.5, "A"); ax.text(2.2, 1.82, "I = ?", ha="center", fontsize=15, color=RED)
ax.text(2.0, -0.65, "Räknemodell: en verklig kropp är ingen fast resistans", ha="center", fontsize=13)
save(F, "v42_01_s16_stod4")

# s18 stöd 5: STOPP och frånskiljning
F = fig(4.3, 3.6); ax = cax(F, (-0.2, 4.1), (-0.2, 3.4))
ax.text(-0.1, 2.9, "Matning", fontsize=13, va="center"); ax.plot([0.75, 1.1], [2.9, 2.9], color=INK, lw=LW)
ax.plot([0.95, 1.25], [2.9, 2.9], color=INK, lw=LW); ax.plot([1.85, 2.15], [2.9, 2.9], color=INK, lw=LW)
ax.plot([1.25, 1.8], [2.9, 3.12], color=GRAY, lw=LW, ls=(0, (4, 3))); ax.plot([1.85, 1.85], [2.8, 3.0], color=INK, lw=LW)
ax.text(1.55, 2.55, "frånskiljare: läge okänt", ha="center", va="top", fontsize=12.5)
ax.plot([2.15, 2.6], [2.9, 2.9], color=INK, lw=LW); rbox(ax, 2.6, 2.6, 0.7, 0.6, "K1"); ax.plot([3.3, 3.55], [2.9, 2.9], color=INK, lw=LW)
ax.add_patch(Circle((3.8, 2.9), 0.25, fc="white", ec=INK, lw=LW)); ax.text(3.8, 2.9, "M", ha="center", va="center", fontsize=14)
ax.text(0.3, 1.85, "styrkrets", fontsize=13, ha="left", color=GRAY)
ax.plot([0.3, 1.2], [1.5, 1.5], color=INK, lw=LW); switch(ax, 1.6, 1.5, False, "STOPP: från", above=False); ax.plot([2.05, 2.95, 2.95], [1.5, 1.5, 2.6], color=INK, lw=LW, ls=(0, (4, 3)))
rbox(ax, 0.1, 0.1, 1.5, 0.75, "Panel: släckt", fc="#2B3440", color="white", ec=INK)
ax.text(3.0, 0.5, "Spänningslöst?", ha="center", fontsize=16, color=RED)
save(F, "v42_01_s18_stod5")

# s21 flera energikällor ombord
F = fig(4.3, 3.6); ax = cax(F, (-0.05, 4.25), (-0.1, 3.5))
rbox(ax, 1.4, 1.25, 1.4, 0.75, "Fördelning", fc=LBLUE, fs=15, weight="bold")
top = ((0.0, "Generator"), (1.4, "Nödgenerator\n(autostart)"), (2.8, "Landanslutning"))
for x, t in top: rbox(ax, x, 2.35, 1.35, 0.62, t, fs=11.5)
for x, t in ((0.3, "Batteri"), (2.6, "UPS")): rbox(ax, x, 0.0, 1.35, 0.55, t, fs=12.5)
for x in (0.68, 2.1, 3.48): harrow(ax, (x, 2.35), (2.1 + (x - 2.1) * 0.35, 2.0), color=BLUE)
harrow(ax, (1.0, 0.55), (1.65, 1.25), color=BLUE); harrow(ax, (3.2, 0.55), (2.55, 1.25), color=BLUE)
ax.text(2.1, 3.25, "Varje matningsväg kartläggs", ha="center", fontsize=13)
save(F, "v42_01_s21_kallor")

# s22 vid en elolycka
F = fig(4.3, 4.4); ax = cax(F, (0, 4.3), (0, 4.4))
steps = ["Skydda dig själv", "Bryt strömmen om det går säkert", "Larma enligt nödinstruktionen", "När platsen är säker: andning, HLR", "Medicinsk rådgivning, även utan skada"]
for k, t in enumerate(steps):
    y = 3.8 - k * 0.72
    rbox(ax, 0.55, y, 3.7, 0.54, t, fs=12.5, ha="left", ec=ORANGE if k == 0 else INK, lw=2.2 if k == 0 else 1.6)
    ax.add_patch(Circle((0.25, y + 0.27), 0.19, fc=BLUE, ec="none")); ax.text(0.25, y + 0.27, str(k + 1), ha="center", va="center", color="white", fontsize=13, weight="bold")
ax.text(2.15, 0.33, "Till sjöss: TMAS via JRCC. I hamn: 112.", ha="center", fontsize=12, color=BLUE)
ax.text(2.15, 0.06, "Högspänning: avstånd tills behörig säkrat platsen", ha="center", fontsize=11.5, color=ORANGE)
save(F, "v42_01_s22_olycka")

# s25 stöd 6: batteriets kortslutning
F = fig(4.3, 3.2); ax = cax(F, (-0.2, 4.1), (-0.3, 2.9))
ax.add_patch(Rectangle((0.3, 0.3), 2.0, 1.2, fc=PALE, ec=INK, lw=2)); ax.text(1.3, 0.9, "24 V", ha="center", va="center", fontsize=18, weight="bold")
for x, t in ((0.7, "+"), (1.9, "−")): ax.add_patch(Rectangle((x - 0.15, 1.5), 0.3, 0.2, fc=STEEL, ec=INK)); ax.text(x, 1.9, t, ha="center", fontsize=15)
ax.add_patch(Rectangle((0.5, 1.72), 1.6, 0.14, fc=STEEL, ec=INK, lw=1.5, angle=0)); ax.text(1.3, 2.05, "verktyg", ha="center", fontsize=12)
ax.text(2.6, 1.25, S("I", "fel") + " ≈ U/" + S("R", "slinga"), fontsize=15, color=BLUE)
ax.text(2.6, 0.8, S("R", "slinga") + " liten:", fontsize=13); ax.text(2.6, 0.5, "stor ström", fontsize=13, color=ORANGE); ax.text(2.6, 0.22, "och värme", fontsize=13, color=ORANGE)
ax.text(1.95, 2.6, "Kortslutning", ha="center", fontsize=14, color=ORANGE, weight="bold")
ax.text(1.95, -0.15, "Isolerade verktyg, inga ringar. Blybatterier: vätgas.", ha="center", fontsize=11, color=GRAY)
save(F, "v42_01_s25_stod6")

# ================= v42_02 Regler, ansvar och arbetsmetoder =================
# s7: arbetsmetoder och områden
F = fig(4.3, 4.6); ax = cax(F, (-2.15, 2.15), (-2.55, 2.05))
ax.add_patch(Circle((0, 0), 1.95, fc=PALE, ec=GRAY, lw=1.4, ls=(0, (4, 3))))
ax.add_patch(Circle((0, 0), 1.3, fc="#FBE6D4", ec=ORANGE, lw=1.6))
ax.add_patch(Circle((0, 0), 0.7, fc="#F4C39A", ec=ORANGE, lw=1.6))
ax.add_patch(Rectangle((-0.22, -0.12), 0.44, 0.24, fc=ORANGE, ec=INK, lw=1.2, zorder=4))
ax.text(0, -0.34, "spänningssatt del", ha="center", fontsize=10)
ax.text(0, 0.36, "riskområde", ha="center", fontsize=12, weight="bold")
ax.text(0, 0.92, "närområde", ha="center", fontsize=13, weight="bold")
ax.text(0, 1.55, "utanför närområdet", ha="center", fontsize=13, color=GRAY)
ax.text(0, -2.2, "Med spänning: arbete i riskområdet", ha="center", fontsize=12, color=ORANGE)
ax.text(0, -2.47, "Utan spänning: efter de fem säkerhetsåtgärderna", ha="center", fontsize=12, color=BLUE)
save(F, "v42_02_s07_metoder")

# s8: fem säkerhetsåtgärder
F = fig(4.3, 4.4); ax = cax(F, (0, 4.3), (0, 4.4))
steps = ["Frånskilj fullständigt", "Skydda mot återinkoppling", "Kontrollera spänningslöshet", "Jorda och kortslut", "Skydda mot närliggande\nspänningssatta delar"]
for k, t in enumerate(steps):
    y = 3.7 - k * 0.8; h = 0.62
    rbox(ax, 0.6, y, 3.6, h, t, fs=14, ha="left")
    ax.add_patch(Circle((0.28, y + h / 2), 0.22, fc=BLUE, ec="none")); ax.text(0.28, y + h / 2, str(k + 1), ha="center", va="center", color="white", fontsize=14, weight="bold")
ax.text(2.15, 0.18, "Tillämpning bedöms för anläggning och arbete", ha="center", fontsize=11.5, color=GRAY)
save(F, "v42_02_s08_fem")

# s21: roller och kommunikation
F = fig(4.3, 3.6); ax = cax(F, (0, 4.3), (0, 3.6))
rbox(ax, 0.1, 2.5, 1.7, 0.75, "Drift-\norganisation", fs=13.5, fc=LBLUE)
rbox(ax, 2.5, 2.5, 1.7, 0.75, "Elsäkerhets-\nledare", fs=13.5, fc=LBLUE)
rbox(ax, 2.5, 0.55, 1.7, 0.75, "Arbetslag", fs=13.5)
harrow(ax, (1.85, 3.0), (2.45, 3.0), color=BLUE); harrow(ax, (2.45, 2.72), (1.85, 2.72), color=GRAY)
ax.text(2.15, 3.35, "kopplingsbesked", ha="center", fontsize=11, color=BLUE)
ax.text(2.15, 2.28, "återlämning", ha="center", fontsize=11, color=GRAY)
harrow(ax, (3.2, 2.45), (3.2, 1.35), color=BLUE); harrow(ax, (3.5, 1.35), (3.5, 2.45), color=GRAY)
ax.text(3.08, 1.9, "startbesked", ha="right", fontsize=11, color=BLUE); ax.text(3.62, 1.9, "klart", ha="left", fontsize=11, color=GRAY)
ax.text(0.95, 1.2, "Varje besked:", ha="center", fontsize=13, weight="bold")
ax.text(0.95, 0.9, "objekt, gräns,", ha="center", fontsize=12); ax.text(0.95, 0.65, "kontroller, namn,", ha="center", fontsize=12); ax.text(0.95, 0.4, "repeteras och kvitteras", ha="center", fontsize=12)
ax.text(2.15, 0.05, "Ombord: C/E eller ETO enligt SMS och arbetstillstånd", ha="center", fontsize=11.5, color=GRAY)
save(F, "v42_02_s21_roller")

# två matningsvägar, gemensam ritfunktion
def two_feeds(name, a, b, target, b_label, b_color, b_q=False, note=None):
    F = fig(4.3, 3.4); ax = cax(F, (0, 4.3), (0, 3.4))
    rbox(ax, 0.05, 2.35, 1.6, 0.6, a, fs=12.5); rbox(ax, 0.05, 0.55, 1.6, 0.6, b, fs=12.5)
    rbox(ax, 2.8, 1.4, 1.35, 0.7, target, fs=15, weight="bold", fc=LBLUE)
    ax.plot([1.65, 2.2, 2.2, 2.8], [2.65, 2.65, 1.9, 1.9], color=INK, lw=LW)
    ax.plot([1.65, 2.2, 2.2, 2.8], [0.85, 0.85, 1.6, 1.6], color=b_color, lw=LW, ls=(0, (5, 3)))
    ax.text(0.8, 3.05, "i planen", ha="center", fontsize=12, color=GREEN)
    ax.text(0.05, 0.3, b_label, ha="left", fontsize=12 if not b_q else 14, color=RED if b_q else b_color)
    if note: ax.text(2.15, 3.25, note, ha="center", fontsize=12)
    save(F, name)
two_feeds("v42_02_s24_exempel", "Landanslutning", "UPS", "K3", "i ritningen, inte i planen", ORANGE)
two_feeds("v42_02_s31_stod9", "Landanslutning", "Generator", "Fördelning", "i planen: ?", INK, b_q=True)

# ================= v42_03 Riskbedömning och skydd =================
# s7: prioritering av skydd
F = fig(4.3, 4.2); ax = cax(F, (0, 4.3), (0, 4.2))
rows = [("Ta bort faran", "arbete utan spänning"), ("Ersätt", "lägre spänning, säkrare utrustning"), ("Tekniska skydd", "avskärmning, isolering"), ("Organisatoriska", "beredning, instruktion, behörighet"), ("Personlig skyddsutrustning", "kompletterar")]
cols = [BLUE, "#1F5F9B", "#2F6FA8", "#6E9CC6", "#B3CBE2"]
for k, (t, d) in enumerate(rows):
    w = 4.2 - k * 0.3; x = (4.3 - w) / 2; y = 3.15 - k * 0.76
    rbox(ax, x, y, w, 0.66, "", fc=cols[k], ec="none")
    ax.text(2.15, y + 0.44, t, ha="center", va="center", fontsize=13.5, weight="bold", color="white" if k < 4 else INK)
    ax.text(2.15, y + 0.18, d, ha="center", va="center", fontsize=11, color="white" if k < 4 else INK)
ax.text(0.1, 4.0, "mest effektivt först", fontsize=12, color=GRAY, va="center")
save(F, "v42_03_s07_prioritering")

# s8: prova – mät – prova
F = fig(4.3, 3.4); ax = cax(F, (0, 4.3), (0, 3.4))
for k, (t, d) in enumerate((("1. Prova", "mot känd källa"), ("2. Mät", "alla ledare, mot PE"), ("3. Prova igen", "mot känd källa"))):
    x = 0.1 + k * 1.43
    rbox(ax, x, 1.3, 1.25, 1.4, "", fc=PALE)
    ax.add_patch(Rectangle((x + 0.45, 1.75), 0.35, 0.65, fc="#F2C200", ec=INK, lw=1.4, zorder=4)); ax.add_patch(Rectangle((x + 0.52, 2.05), 0.21, 0.22, fc="#2B3440", ec="none", zorder=5))
    ax.plot([x + 0.55, x + 0.4], [1.75, 1.45], color=INK, lw=1.4, zorder=4); ax.plot([x + 0.7, x + 0.85], [1.75, 1.45], color=INK, lw=1.4, zorder=4)
    ax.text(x + 0.62, 1.0, t, ha="center", fontsize=13, weight="bold"); ax.text(x + 0.62, 0.72, d, ha="center", fontsize=11.5)
    if k < 2: harrow(ax, (x + 1.28, 2.0), (x + 1.42, 2.0), color=GRAY, lw=1.4)
ax.text(2.15, 3.1, "Tvåpolig spänningsprovare för systemet", ha="center", fontsize=13)
ax.text(2.15, 0.25, "Visar provaren fel: ta den ur bruk", ha="center", fontsize=12, color=ORANGE)
save(F, "v42_03_s08_prova")

# s16 stöd 4: bara skylt
F = fig(4.3, 3.4); ax = cax(F, (0, 4.3), (0, 3.4))
x = 1.25
ax.add_patch(Rectangle((x, 1.0), 1.8, 1.9, fc=PALE, ec=INK, lw=1.8))
ax.add_patch(Rectangle((x + 0.75, 1.95), 0.3, 0.6, fc="#2B3440", ec=INK)); ax.text(x + 0.9, 2.65, "0", ha="center", fontsize=12)
ax.add_patch(Rectangle((x + 0.2, 1.15), 1.4, 0.6, fc="#FFE9A8", ec=ORANGE, lw=1.4))
ax.text(x + 0.9, 1.55, "Arbete pågår", ha="center", va="center", fontsize=11, weight="bold"); ax.text(x + 0.9, 1.3, "N.N., tel. 123", ha="center", va="center", fontsize=9.5)
ax.text(2.15, 0.55, "Hindrar skylten återinkoppling?", ha="center", fontsize=14, color=RED)
save(F, "v42_03_s16_stod4")

# s21: jordning och kortslutning
F = fig(4.3, 3.6); ax = cax(F, (-0.1, 4.2), (-0.2, 3.4))
for k, n in enumerate(("L1", "L2", "L3")):
    y = 2.6 - k * 0.45; ax.text(-0.05, y, n, fontsize=13, va="center")
    ax.plot([0.3, 0.6], [y, y], color=INK, lw=LW); ax.plot([0.6, 0.95], [y, y + 0.2], color=INK, lw=LW); ax.plot([1.0, 4.1], [y, y], color=INK, lw=LW)
    dot(ax, 2.3, y, 0.05)
ax.text(0.75, 1.45, "frånskilt", ha="center", fontsize=12)
ax.plot([2.3, 2.3], [2.6, 1.2], color=GREEN, lw=3); earth(ax, 2.3, 1.2, color=GREEN)
ax.text(2.1, 0.75, "jordning och\nkortslutning", fontsize=12, color=GREEN, va="top", ha="right")
ax.add_patch(Rectangle((3.25, 1.4), 0.8, 1.45, fc="none", ec=BLUE, lw=1.6, ls=(0, (4, 3)))); ax.text(3.65, 1.2, "arbets-\nställe", ha="center", va="top", fontsize=12, color=BLUE)
ax.text(2.0, 3.15, "Nära arbetsstället, synligt därifrån", ha="center", fontsize=13)
ax.text(2.0, -0.12, "Jordledaren ansluts först och tas bort sist", ha="center", fontsize=11.5, color=GRAY)
save(F, "v42_03_s21_jordning")

# s24: riskmatris utan godkännandegräns
F = fig(4.3, 4.3); ax = cax(F, (-1.0, 5.6), (-1.2, 5.4))
for i in range(5):
    for j in range(5):
        ax.add_patch(Rectangle((i, j), 1, 1, fc="white", ec="#B9C6D2", lw=1)); ax.text(i + 0.5, j + 0.42, str((i + 1) * (j + 1)), ha="center", va="center", fontsize=11, color=GRAY)
for k in range(5): ax.text(k + 0.5, -0.25, str(k + 1), ha="center", va="top", fontsize=12); ax.text(-0.2, k + 0.5, str(k + 1), ha="right", va="center", fontsize=12)
ax.text(2.5, -0.7, "sannolikhet", ha="center", va="top", fontsize=13); ax.text(-0.75, 2.5, "konsekvens", rotation=90, ha="center", va="center", fontsize=13)
for (i, j, t, col) in ((4, 2, "före", ORANGE), (2, 2, "efter", BLUE)):
    ax.add_patch(Rectangle((i - 1 + 0.08, j - 1 + 0.08), 0.84, 0.84, fc="none", ec=col, lw=3, zorder=5))
    ax.text(i - 0.5, j - 1 + 0.78, t, ha="center", va="center", fontsize=9.5, color=col, weight="bold", zorder=6)
harrow(ax, (3.1, 1.2), (2.0, 1.2), color=GRAY)
ax.text(2.5, 5.1, "Ingen tillåten gräns given", ha="center", va="bottom", fontsize=12, color=GRAY)
save(F, "v42_03_s24_matris")
