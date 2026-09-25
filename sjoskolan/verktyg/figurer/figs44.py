"""Figurer till vecka 44: lågspänningssystem, högspänningssystem, fördjupad mätteknik.
Användning: figs44.py <katalog med figlib.py> <utkatalog>
Regler: rött bara för det som söks (”?”), orange för felström och fara, inga svar på övningsbilder."""
import sys; sys.path.insert(0, sys.argv[1])
import figlib as L
from figlib import *
from matplotlib.patches import FancyBboxPatch, Ellipse
L.OUT = sys.argv[2]
LBLUE = "#DCEBF7"; PALE = "#F3F6F9"; STEEL = "#8C99A6"; HULL = "#9AA7B4"

def S(b, i): return b + r"$_\mathregular{" + i + "}$"
def rbox(ax, x, y, w, h, text, fc="white", ec=INK, fs=14, color=INK, weight="normal", lw=1.6):
    ax.add_patch(FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0,rounding_size=0.06", fc=fc, ec=ec, lw=lw, zorder=2))
    ax.text(x + w / 2, y + h / 2, text, ha="center", va="center", fontsize=fs, color=color, weight=weight, zorder=3)
def harrow(ax, p1, p2, color=INK, lw=1.8, style="-|>"):
    ax.annotate("", xy=p2, xytext=p1, arrowprops=dict(arrowstyle=style, color=color, lw=lw, mutation_scale=14, shrinkA=0, shrinkB=0))
def earth(ax, x, y, color=INK):
    ax.plot([x, x], [y, y - 0.12], color=color, lw=LW)
    for k, w in enumerate((0.18, 0.11, 0.05)): ax.plot([x - w, x + w], [y - 0.12 - 0.06 * k] * 2, color=color, lw=LW)
def fault(ax, x, y, color=ORANGE):
    ax.add_patch(Polygon([(x - 0.05, y + 0.18), (x + 0.08, y + 0.02), (x - 0.01, y + 0.02), (x + 0.07, y - 0.18), (x - 0.09, y - 0.0), (x, y - 0.0)], fc=color, ec="none", zorder=6))
def star(ax, x, y, r=0.28):
    for a in (90, 210, 330): ax.plot([x, x + r * np.cos(np.radians(a))], [y, y + r * np.sin(np.radians(a))], color=INK, lw=LW)
    return [(x + r * np.cos(np.radians(a)), y + r * np.sin(np.radians(a))) for a in (90, 210, 330)]
def loop(ax, pts, label=None, lp=None):
    ax.plot(*zip(*pts), color=ORANGE, lw=3.2, alpha=0.85, zorder=5, solid_capstyle="round")
    if label: ax.text(*lp, label, fontsize=12.5, color=ORANGE, weight="bold")

# ================= v44_01 Lågspänningssystem =================
def source_lines(ax, names, ys, x0=1.0, x1=4.2):
    for n, y in zip(names, ys): ax.plot([x0, x1], [y, y], color=INK, lw=LW); ax.text(x1, y + 0.1, n, ha="right", fontsize=12)
    tips = star(ax, 0.55, 2.6)
    ax.plot([tips[0][0], tips[0][0], x0], [tips[0][1], ys[0], ys[0]], color=INK, lw=LW)
    ax.plot([tips[1][0], tips[1][0], x0], [tips[1][1], ys[2], ys[2]], color=INK, lw=LW)
    ax.plot([tips[2][0], x0], [tips[2][1], ys[1]], color=INK, lw=LW)
    ax.text(0.55, 3.25, "källa", ha="center", fontsize=12, color=GRAY)
def appliance(ax, x=3.0, y=0.55, w=1.1, h=0.95):
    ax.add_patch(Rectangle((x, y), w, h, fc=PALE, ec=INK, lw=2)); ax.text(x + w / 2, y - 0.14, "utsatt del (hölje)", ha="center", va="top", fontsize=11.5)

# s7 TN-S
F = fig(4.3, 3.6); ax = cax(F, (0, 4.3), (-0.2, 3.4))
ys = [3.0, 2.8, 2.6, 2.3, 2.05]; source_lines(ax, ["L1", "L2", "L3"], ys[:3])
ax.plot([0.55, 0.55, 4.2], [2.6, ys[3], ys[3]], color=BLUE, lw=LW); ax.text(4.2, ys[3] + 0.1, "N", ha="right", fontsize=12, color=BLUE)
ax.plot([0.55, 0.55, 4.2], [ys[3], ys[4], ys[4]], color=GREEN, lw=LW); ax.text(4.2, ys[4] + 0.1, "PE", ha="right", fontsize=12, color=GREEN)
ax.plot([0.55, 0.55], [ys[4], 1.55], color=GREEN, lw=LW); earth(ax, 0.55, 1.55)
appliance(ax); ax.plot([3.3, 3.3], [ys[0], 1.2], color=INK, lw=LW); ax.plot([3.9, 3.9], [ys[4], 1.5], color=GREEN, lw=LW); dot(ax, 3.9, ys[4], 0.05)
fault(ax, 3.45, 1.0)
loop(ax, [(0.45, 2.6), (0.45, 3.08), (3.22, 3.08), (3.22, 1.05), (3.55, 0.95), (3.98, 0.95), (3.98, 1.97), (0.47, 1.97), (0.47, 2.55)], S("Z", "s"), (1.6, 1.7))
ax.text(2.15, -0.1, "Felström via PE tillbaka till källan", ha="center", fontsize=12)
save(F, "v44_01_s07_tns")

# s8 TT
F = fig(4.3, 3.6); ax = cax(F, (0, 4.3), (-0.2, 3.4))
ys = [3.0, 2.8, 2.6, 2.3]; source_lines(ax, ["L1", "L2", "L3"], ys[:3])
ax.plot([0.55, 0.55, 4.2], [2.6, ys[3], ys[3]], color=BLUE, lw=LW); ax.text(4.2, ys[3] + 0.1, "N", ha="right", fontsize=12, color=BLUE)
ax.plot([0.55, 0.55], [ys[3], 1.1], color=GREEN, lw=LW); earth(ax, 0.55, 1.1); ax.text(0.8, 0.95, S("R", "B") + " systemjord", fontsize=11.5)
appliance(ax, y=1.0, h=0.8); ax.plot([3.3, 3.3], [ys[0], 1.6], color=INK, lw=LW); fault(ax, 3.45, 1.35)
ax.plot([3.9, 3.9], [1.0, 0.45], color=GREEN, lw=LW); earth(ax, 3.9, 0.45); ax.text(3.65, 0.3, S("R", "A") + " jordtag", ha="right", fontsize=11.5)
ax.plot([0.55, 3.9], [0.02, 0.02], color=GRAY, lw=1.2, ls=(0, (4, 3))); ax.text(2.2, 0.1, "jorden", ha="center", fontsize=11, color=GRAY)
loop(ax, [(0.45, 2.6), (0.45, 3.08), (3.22, 3.08), (3.22, 1.35), (3.55, 1.3), (3.98, 1.3), (3.98, 0.3), (3.9, 0.08), (0.62, 0.08), (0.47, 0.95), (0.47, 2.55)])
ax.text(2.15, 1.55, "felström genom jorden", ha="center", fontsize=12, color=ORANGE, weight="bold")
save(F, "v44_01_s08_tt")

# IT: gemensam ritfunktion för första och andra felet
def it_fig(name, second=False):
    F = fig(4.3, 3.6); ax = cax(F, (0, 4.3), (-0.2, 3.4))
    ys = [3.0, 2.8, 2.6]; source_lines(ax, ["L1", "L2", "L3"], ys)
    ax.add_patch(Rectangle((-0.1, -0.2), 4.5, 0.35, fc=HULL, ec="none")); ax.text(2.15, -0.03, "skrov (jordat)", ha="center", va="center", fontsize=11.5, color="white")
    rbox(ax, 0.2, 1.2, 0.75, 0.5, "IMD", fs=12, fc=LBLUE); ax.plot([0.55, 0.55], [2.6, 1.7], color=GRAY, lw=1.5, ls=(0, (4, 3))); ax.plot([0.55, 0.55], [1.2, 0.15], color=GRAY, lw=1.5)
    ax.text(0.55, 1.0, "isolations-\nvakt", ha="center", va="top", fontsize=10.5, color=GRAY)
    for k, (x, ph) in enumerate(((2.0, 0), (3.3, 1))):
        ax.add_patch(Rectangle((x, 0.45), 0.8, 0.8, fc=PALE, ec=INK, lw=1.8)); ax.plot([x + 0.8, x + 0.8], [0.45, 0.15], color=GREEN, lw=LW)
        ax.plot([x + 0.25, x + 0.25], [ys[ph], 1.1], color=INK, lw=LW)
        if k == 0 or second: fault(ax, x + 0.42, 0.9)
    if second:
        loop(ax, [(2.17, 3.0), (2.17, 0.95), (2.72, 0.85), (2.82, 0.1), (4.08, 0.1), (4.08, 0.85), (3.62, 0.9), (3.47, 1.05), (3.47, 2.8)])
        ax.text(2.15, 1.75, "2:a felet: kortslutning via skrovet", ha="center", fontsize=12, color=ORANGE, weight="bold")
    else:
        ax.text(2.15, 1.75, "1:a felet: liten ström, larm", ha="center", fontsize=12, color=ORANGE, weight="bold")
        ax.text(1.05, 1.45, "larm", fontsize=12, color=RED)
    save(F, name)
it_fig("v44_01_s21_it"); it_fig("v44_01_s22_andra", second=True)

# s24 exempel: felström mot slingimpedans
F = fig(4.3, 3.2); ax = F.add_axes((0.17, 0.2, 0.78, 0.7))
z = np.linspace(0.3, 1.5, 200); ax.plot(z, 230 / z, color=BLUE, lw=2.6)
for zz in (0.575, 1.15): ax.plot([zz], [230 / zz], "o", color=ORANGE, ms=8); ax.plot([zz, zz], [0, 230 / zz], color=ORANGE, lw=1.2, ls=(0, (3, 3)))
ax.text(0.62, 420, "0,575 Ω: 400 A", fontsize=12, color=ORANGE); ax.text(1.2, 220, "1,15 Ω: 200 A", fontsize=12, color=ORANGE)
ax.set_xlim(0.3, 1.5); ax.set_ylim(0, 800)
for s_ in ("top", "right"): ax.spines[s_].set_visible(False)
ax.set_xlabel(S("Z", "s") + " (Ω)", fontsize=12); ax.set_ylabel(S("I", "k") + " (A)", fontsize=12); ax.tick_params(labelsize=11)
ax.set_xticks([0.5, 1.0, 1.5]); ax.set_xticklabels(["0,5", "1,0", "1,5"])
F.text(0.56, 0.93, "Dubbel impedans ger halva felströmmen", ha="center", fontsize=12)
save(F, "v44_01_s24_exempel")

# s26 övning 6: DC-fördelning
F = fig(4.3, 3.0); ax = cax(F, (0, 4.3), (-0.2, 2.8))
ax.plot([0.5, 0.5, 1.2], [0.9, 2.1, 2.1], color=INK, lw=LW); rresistor(ax, (1.2, 2.1), (2.6, 2.1)); ax.plot([2.6, 3.5, 3.5], [2.1, 2.1, 1.7], color=INK, lw=LW)
ax.plot([3.5, 3.5, 0.5, 0.5], [0.9, 0.35, 0.35, 0.5], color=INK, lw=LW)
ax.add_patch(Circle((0.5, 0.7), 0.2, fc="white", ec=INK, lw=LW)); ax.text(0.5, 0.77, "+", ha="center", va="center", fontsize=11); ax.text(0.5, 0.62, "−", ha="center", va="center", fontsize=11)
ax.text(0.8, 0.7, "24 V", fontsize=14, va="center")
ax.text(1.9, 2.42, S("R", "slinga") + " = 0,15 Ω", ha="center", fontsize=13); ax.text(1.9, 1.78, "(fram och retur)", ha="center", fontsize=11, color=GRAY)
rbox(ax, 3.15, 0.9, 0.7, 0.8, "last", fs=13); harrow(ax, (2.8, 2.1), (3.2, 2.1), color=BLUE); ax.text(3.0, 2.3, "6 A", ha="center", fontsize=13, color=BLUE)
ax.text(2.2, 0.0, "ΔU = ?   " + S("U", "last") + " = ?", ha="center", fontsize=15, color=RED)
save(F, "v44_01_s26_ovn6")

# s28 övning 7: felströmsslinga
F = fig(4.3, 3.0); ax = cax(F, (0, 4.3), (-0.2, 2.8))
ax.plot([0.7, 0.7, 3.6, 3.6, 0.7, 0.7], [0.95, 2.2, 2.2, 0.4, 0.4, 0.55], color=INK, lw=LW)
ax.add_patch(Circle((0.7, 0.75), 0.2, fc="white", ec=INK, lw=LW)); ax.text(0.7, 0.75, "~", ha="center", va="center", fontsize=14)
ax.text(1.0, 0.75, S("U", "0") + " = 230 V", fontsize=14, va="center")
rbox(ax, 3.2, 0.9, 0.8, 0.8, S("Z", "s"), fs=15); ax.text(3.1, 1.3, "0,46 Ω", ha="right", fontsize=14, va="center")
harrow(ax, (1.8, 2.2), (2.4, 2.2), color=RED); ax.text(2.1, 2.45, S("I", "k") + " = ?", ha="center", fontsize=15, color=RED)
ax.text(2.15, 0.0, "Förenklad modell: hela slingans impedans", ha="center", fontsize=12, color=GRAY)
save(F, "v44_01_s28_ovn7")

# ================= v44_02 Högspänningssystem =================
# s7 ställverkets apparater
F = fig(4.3, 4.3); ax = cax(F, (0, 4.3), (0, 4.3))
ax.plot([0.4, 3.9], [3.9, 3.9], color=INK, lw=6); ax.text(0.4, 4.08, "samlingsskena", fontsize=12)
x = 1.6
ax.plot([x, x], [3.9, 3.55], color=INK, lw=LW); ax.plot([x, x + 0.22], [3.55, 3.2], color=INK, lw=LW); ax.plot([x - 0.1, x + 0.1], [3.1, 3.1], color=INK, lw=LW); ax.plot([x, x], [3.1, 2.75], color=INK, lw=LW)
ax.text(x + 0.35, 3.35, "frånskiljare", fontsize=12.5, va="center")
ax.add_patch(Rectangle((x - 0.22, 2.3), 0.44, 0.44, fc="white", ec=INK, lw=LW)); ax.plot([x - 0.14, x + 0.14], [2.38, 2.66], color=INK, lw=1.6); ax.plot([x - 0.14, x + 0.14], [2.66, 2.38], color=INK, lw=1.6)
ax.text(x + 0.35, 2.52, "brytare", fontsize=12.5, va="center")
ax.plot([x, x], [2.3, 0.6], color=INK, lw=LW); ax.add_patch(Ellipse((x, 1.85), 0.5, 0.18, fc="none", ec=BLUE, lw=2)); ax.text(x + 0.35, 1.85, "strömtransformator", fontsize=12.5, va="center", color=BLUE)
ax.plot([x, x + 0.9], [1.25, 1.25], color=INK, lw=LW); ax.plot([x + 0.9, x + 1.1], [1.25, 1.05], color=GREEN, lw=LW); ax.plot([x + 1.2, x + 1.2], [1.25, 0.9], color=GREEN, lw=LW); earth(ax, x + 1.2, 0.9, GREEN)
ax.text(x + 1.45, 1.3, "jordnings-\nkopplare", fontsize=12, color=GREEN, va="center")
ax.plot([x - 0.3, x + 0.3], [0.6, 0.6], color=INK, lw=LW); ax.text(x, 0.35, "kabel till förbrukare", ha="center", fontsize=12)
ax.plot([x - 0.45, x - 0.45, x - 0.25], [3.3, 2.52, 2.52], color=GRAY, lw=1.4, ls=(0, (3, 3))); ax.text(x - 0.5, 2.95, "förregling", rotation=90, ha="right", va="center", fontsize=11, color=GRAY)
save(F, "v44_02_s07_stallverk")

# s8 mätning, beslut, bortkoppling
F = fig(4.3, 3.0); ax = cax(F, (0, 4.3), (0, 3.0))
ax.plot([0.2, 4.1], [2.4, 2.4], color=INK, lw=3); ax.add_patch(Ellipse((1.0, 2.4), 0.3, 0.6, fc="none", ec=BLUE, lw=2.4))
ax.add_patch(Rectangle((3.05, 2.2), 0.4, 0.4, fc="white", ec=INK, lw=LW, zorder=3)); ax.plot([3.12, 3.38], [2.27, 2.53], color=INK, lw=1.4, zorder=4); ax.plot([3.12, 3.38], [2.53, 2.27], color=INK, lw=1.4, zorder=4)
rbox(ax, 1.55, 0.7, 1.2, 0.7, "skydds-\nrelä", fs=12.5, fc=LBLUE)
harrow(ax, (1.0, 2.05), (1.5, 1.15), color=BLUE); harrow(ax, (2.8, 1.05), (3.2, 2.15), color=ORANGE)
for x_, t_, c_ in ((1.0, "1. mätning", BLUE), (2.15, "2. beslut", INK), (3.25, "3. bortkoppling", ORANGE)): ax.text(x_, 0.3 if x_ == 2.15 else 2.8, t_, ha="center", fontsize=12.5, color=c_, weight="bold")
ax.text(0.2, 1.6, "signal", fontsize=11, color=BLUE); ax.text(3.2, 1.45, "utlösning", fontsize=11, color=ORANGE)
save(F, "v44_02_s08_skydd")

# s9 exempel: ström vid 5 kV och 500 V
F = fig(4.3, 3.0); ax = F.add_axes((0.18, 0.2, 0.78, 0.68))
ax.bar([0, 1], [72.2, 721.7], width=0.55, color=[LIGHT, LIGHT], edgecolor=INK, lw=1.6)
ax.text(0, 100, "72,2 A", ha="center", fontsize=13); ax.text(1, 740, "721,7 A", ha="center", fontsize=13)
ax.set_xticks([0, 1]); ax.set_xticklabels(["5 kV", "500 V"]); ax.set_ylim(0, 850); ax.tick_params(labelsize=12)
for s_ in ("top", "right"): ax.spines[s_].set_visible(False)
ax.set_ylabel("linjeström (A)", fontsize=12); F.text(0.57, 0.92, "500 kW, PF 0,80", ha="center", fontsize=12, color=GRAY)
save(F, "v44_02_s09_exempel")

def ct(name, ratio, i1, i2):
    F = fig(4.3, 2.8); ax = cax(F, (0, 4.3), (0, 2.8))
    ax.plot([0.2, 4.1], [2.1, 2.1], color=INK, lw=3.5); ax.add_patch(Ellipse((1.6, 2.1), 0.35, 0.8, fc="none", ec=BLUE, lw=3))
    harrow(ax, (0.3, 2.3), (0.9, 2.3), color=BLUE); ax.text(0.6, 2.5, i1, ha="center", fontsize=14, color=BLUE)
    ax.text(1.6, 2.65, ratio, ha="center", fontsize=14, weight="bold")
    ax.plot([1.5, 1.5, 3.2], [1.72, 0.7, 0.7], color=INK, lw=LW); ax.plot([1.7, 1.7, 2.4], [1.72, 1.2, 1.2], color=INK, lw=LW)
    meter(ax, 2.6, 1.2, "A"); ax.plot([2.8, 3.2, 3.2], [1.2, 1.2, 0.7], color=INK, lw=LW)
    ax.text(3.35, 0.95, i2, fontsize=14, color=RED if "?" in i2 else BLUE, va="center")
    ax.text(2.15, 0.2, "Sekundärkretsen får inte brytas under drift", ha="center", fontsize=11.5, color=ORANGE)
    save(F, name)
ct("v44_02_s17_ovn4", "200/5 A", S("I", "1") + " = 120 A", S("I", "2") + " = ?")
ct("v44_02_s24_exempel", "300/5 A", S("I", "1") + " = 150 A", S("I", "2") + " = 2,5 A")

# ================= v44_03 Fördjupad mätteknik =================
# s6 strömtång
F = fig(4.3, 3.0); ax = cax(F, (0, 4.3), (0, 3.0))
for k, (cx, both) in enumerate(((1.05, False), (3.25, True))):
    ax.add_patch(Ellipse((cx, 1.7), 1.2, 1.0, fc="none", ec="#E2B400", lw=6))
    ax.add_patch(Circle((cx - (0.18 if both else 0), 1.7), 0.12, fc=ORANGE, ec=INK)); ax.text(cx - (0.18 if both else 0), 1.7, "·", ha="center", va="center", fontsize=16, color="white")
    if both: ax.add_patch(Circle((cx + 0.18, 1.7), 0.12, fc=BLUE, ec=INK)); ax.text(cx + 0.18, 1.7, "×", ha="center", va="center", fontsize=11, color="white")
    ax.text(cx, 0.85, "fram och retur" if both else "en ledare", ha="center", fontsize=13, weight="bold")
    ax.text(cx, 0.5, "bidragen motverkar\nvarandra" if both else "tången visar lastströmmen", ha="center", va="top", fontsize=11.5)
ax.text(2.15, 2.65, "Tången mäter summan av omslutna strömmar", ha="center", fontsize=12.5)
save(F, "v44_03_s06_tang")

# s7 isolationsmätning
F = fig(4.3, 3.2); ax = cax(F, (0, 4.3), (-0.2, 3.0))
ax.add_patch(Rectangle((-0.1, -0.2), 4.5, 0.35, fc=HULL, ec="none")); ax.text(2.15, -0.03, "skrov / jord", ha="center", va="center", fontsize=11.5, color="white")
rbox(ax, 0.2, 1.4, 1.1, 0.9, "isolations-\nprovare", fs=11.5, fc="#F2C200")
ax.plot([1.3, 3.0], [2.1, 2.1], color=RED, lw=1.8); ax.plot([1.3, 1.6, 1.6], [1.6, 1.6, 0.15], color=INK, lw=1.8)
ax.add_patch(Rectangle((2.9, 1.9), 1.2, 0.4, fc=PALE, ec=INK, lw=2)); ax.text(3.5, 2.45, "kabelns ledare", ha="center", fontsize=11.5)
rresistor(ax, (3.5, 1.9), (3.5, 0.15)); ax.text(3.7, 1.0, S("R", "iso"), fontsize=13, va="center")
harrow(ax, (3.25, 1.6), (3.25, 1.1), color=ORANGE); ax.text(3.15, 1.35, "läckström", ha="right", fontsize=11, color=ORANGE)
ax.text(1.8, 2.3, S("U", "prov"), fontsize=13, color=RED)
ax.text(2.15, 2.85, "Spänningslöst objekt, laster och elektronik bortkopplade", ha="center", fontsize=11)
ax.text(0.75, 0.6, "urladda efteråt", ha="center", fontsize=11, color=ORANGE)
save(F, "v44_03_s07_isolation")

# s17 övning 4: parallell isolation
F = fig(4.3, 3.0); ax = cax(F, (0, 4.3), (-0.2, 2.8))
ax.plot([1.2, 3.1], [2.3, 2.3], color=INK, lw=LW); dot(ax, 2.15, 2.3); ax.text(2.15, 2.5, "aktiv ledare", ha="center", fontsize=12)
for x in (1.2, 3.1): rresistor(ax, (x, 2.3), (x, 0.55)); ax.text(x + 0.2, 1.42, "20 MΩ", fontsize=13, va="center")
ax.add_patch(Rectangle((0.6, 0.2), 3.1, 0.35, fc=HULL, ec="none")); ax.text(2.15, 0.37, "jord", ha="center", va="center", fontsize=11.5, color="white")
ax.text(2.15, -0.05, S("R", "p") + " = ?", ha="center", fontsize=15, color=RED, va="center")
save(F, "v44_03_s17_ovn4")

# s21 oscilloskopets jordade referens
F = fig(4.3, 3.2); ax = cax(F, (0, 4.3), (-0.2, 3.0))
rbox(ax, 0.1, 1.3, 1.4, 1.1, "oscilloskop", fs=12.5, fc=PALE)
ax.plot([0.35, 0.35], [1.3, 0.3], color=GREEN, lw=LW); earth(ax, 0.35, 0.3, GREEN); ax.text(0.5, 0.75, "PE", fontsize=12, color=GREEN)
ax.plot([1.5, 2.6], [2.1, 2.1], color=INK, lw=1.8); ax.plot([1.5, 2.3, 2.3], [1.6, 1.6, 1.25], color=GREEN, lw=1.8)
ax.text(2.4, 1.2, "jordklämma", fontsize=11.5, color=GREEN, va="top")
ax.plot([2.7, 3.9], [2.1, 2.1], color=ORANGE, lw=3); ax.text(3.9, 2.25, "L", ha="right", fontsize=12, color=ORANGE)
ax.plot([2.3, 3.2], [1.25, 1.25], color=ORANGE, lw=3); ax.text(3.3, 1.25, "fel anslutning", fontsize=11.5, color=ORANGE, va="center")
loop(ax, [(3.2, 1.2), (2.3, 1.2), (2.3, 1.55), (0.42, 1.55), (0.42, 0.3)])
ax.text(2.15, 2.75, "Probens jord är förbunden med skyddsjorden", ha="center", fontsize=12)
ax.text(2.15, -0.05, "Flytande mätning: differentialprob", ha="center", fontsize=12, color=BLUE)
save(F, "v44_03_s21_osc")

# s22 osäkerhetsintervall
F = fig(4.3, 2.4); ax = cax(F, (49.25, 50.75), (-0.45, 0.39))
ax.plot([49.35, 50.65], [0, 0], color=GRAY, lw=1.5)
for v in (49.5, 50.0, 50.5): ax.plot([v, v], [-0.03, 0.03], color=GRAY, lw=1.5); ax.text(v, -0.1, f"{v:.2f}".replace(".", ","), ha="center", va="top", fontsize=11, color=GRAY)
ax.add_patch(Rectangle((49.47, -0.05), 1.06, 0.1, fc=LBLUE, ec=BLUE, lw=1.6)); ax.plot([50, 50], [-0.08, 0.08], color=BLUE, lw=2.5)
ax.text(50, 0.16, "visning 50,00 V", ha="center", fontsize=12, color=BLUE); ax.text(49.47, 0.16, "−0,53", ha="center", fontsize=11); ax.text(50.53, 0.16, "+0,53", ha="center", fontsize=11)
ax.text(50, -0.33, "intervall 49,47–50,53 V", ha="center", fontsize=12)
save(F, "v44_03_s22_intervall")

def scope(name, periods_div, amp_div, tb, notes, ask=False):
    F = fig(4.3, 3.2); ax = cax(F, (0, 4.3), (-0.2, 3.0))
    x0, y0, w, h = 0.35, 0.3, 3.6, 2.3; nx, ny = 10, 8
    ax.add_patch(Rectangle((x0, y0), w, h, fc="#10202c", ec=INK, lw=1.5))
    for i in range(1, nx): ax.plot([x0 + i * w / nx] * 2, [y0, y0 + h], color="#3a5566", lw=0.7)
    for j in range(1, ny): ax.plot([x0, x0 + w], [y0 + j * h / ny] * 2, color="#3a5566", lw=0.7)
    t = np.linspace(0, nx, 400); ax.plot(x0 + t * w / nx, y0 + h / 2 + amp_div * (h / ny) * np.sin(2 * np.pi * t / periods_div), color="#FFD24A", lw=2.2)
    ax.text(x0, 2.75, tb, fontsize=12.5, color=INK); ax.text(x0 + w, 2.75, notes, ha="right", fontsize=12.5, color=RED if ask else INK)
    save(F, name)
scope("v44_03_s24_exempel", 5, 1.5, "2 ms/ruta   1 V/ruta", "10:1-prob")
scope("v44_03_s26_ovn6", 4, 2, "5 ms/ruta", "T = ?   f = ?", ask=True)
