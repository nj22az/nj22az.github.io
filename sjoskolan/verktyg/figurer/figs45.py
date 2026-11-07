"""Figurer till vecka 45: systematisk felsökning, analys av mätresultat, repetition.
Användning: figs45.py <katalog med figlib.py> <utkatalog>
Regler: rött bara för det som söks (”?”), inga svar på övningsbilder."""
import sys; sys.path.insert(0, sys.argv[1])
import figlib as L
from figlib import *
from matplotlib.patches import FancyBboxPatch
L.OUT = sys.argv[2]
LBLUE = "#DCEBF7"; PALE = "#F3F6F9"

def S(b, i): return b + r"$_\mathregular{" + i + "}$"
def col(t): return RED if "?" in t else BLUE
def harrow(ax, p1, p2, color=INK, lw=1.8):
    ax.annotate("", xy=p2, xytext=p1, arrowprops=dict(arrowstyle="-|>", color=color, lw=lw, mutation_scale=14, shrinkA=0, shrinkB=0))
def dcsrc(ax, x, y, label):
    ax.add_patch(Circle((x, y), 0.22, fc="white", ec=INK, lw=LW, zorder=3)); ax.text(x, y + 0.08, "+", ha="center", va="center", fontsize=11, zorder=4); ax.text(x, y - 0.08, "−", ha="center", va="center", fontsize=11, zorder=4)
    ax.text(x + 0.32, y, label, fontsize=14, va="center")
def load(ax, x, y0, y1, label="last"):
    ax.add_patch(Rectangle((x - 0.3, y0), 0.6, y1 - y0, fc=PALE, ec=INK, lw=LW, zorder=3)); ax.text(x, (y0 + y1) / 2, label, ha="center", va="center", fontsize=12.5, zorder=4)

# ================= v45_01 =================
# s8 halveringsmetoden
F = fig(4.3, 2.8); ax = cax(F, (0, 4.3), (0, 2.8))
xs = [0.5, 1.0, 1.6, 2.2, 2.8, 3.4]
ax.plot([0.5, 3.9], [1.7, 1.7], color=INK, lw=LW); ax.plot([0.5, 3.9], [0.7, 0.7], color=INK, lw=LW)
dcsrc(ax, 0.5, 1.2, ""); ax.plot([0.5, 0.5], [1.42, 1.7], color=INK, lw=LW); ax.plot([0.5, 0.5], [0.98, 0.7], color=INK, lw=LW)
load(ax, 3.9, 0.9, 1.5); ax.plot([3.9, 3.9], [1.7, 1.5], color=INK, lw=LW); ax.plot([3.9, 3.9], [0.9, 0.7], color=INK, lw=LW)
for x, n in zip(xs[1:], "ABCDE"): dot(ax, x, 1.7, 0.05); ax.text(x, 1.88, n, ha="center", fontsize=13, weight="bold", color=BLUE)
ax.text(2.2, 2.5, "Mät först mitt i kedjan", ha="center", fontsize=13)
harrow(ax, (2.2, 2.3), (2.2, 2.05), color=BLUE)
ax.text(2.2, 0.38, "rätt värde vid C: sök mellan C och lasten", ha="center", fontsize=11, color=GRAY); ax.text(2.2, 0.12, "fel värde vid C: sök mellan källan och C", ha="center", fontsize=11, color=GRAY)
save(F, "v45_01_s08_halvering")

def series(name, src, top_items, load_label, ann=(), ret=None, cur=None):
    """Enkel seriekrets: källa vänster, element i överledningen, last höger, valfritt element i returen."""
    F = fig(4.3, 3.0); ax = cax(F, (0, 4.3), (-0.2, 2.8))
    ax.plot([0.5, 0.5, 1.1], [0.9, 2.1, 2.1], color=INK, lw=LW); ax.plot([3.1, 3.7, 3.7], [2.1, 2.1, 1.7], color=INK, lw=LW)
    ax.plot([3.7, 3.7], [0.9, 0.35], color=INK, lw=LW); ax.plot([0.5, 0.5], [0.5, 0.35], color=INK, lw=LW)
    dcsrc(ax, 0.5, 0.7, src)
    x = 1.1
    for kind, lab in top_items:
        if kind == "R": rresistor(ax, (x, 2.1), (x + 1.0, 2.1)); ax.text(x + 0.5, 2.4, lab, ha="center", fontsize=13, color=col(lab) if "?" in lab or "=" in lab else INK)
        elif kind == "K": contact(ax, x + 0.5, 2.1, False, None); ax.plot([x, x + 0.2], [2.1, 2.1], color=INK, lw=LW); ax.plot([x + 0.8, x + 1.0], [2.1, 2.1], color=INK, lw=LW); ax.text(x + 0.5, 2.55, lab, ha="center", fontsize=13, color=col(lab))
        x += 1.0
    ax.plot([x, 3.1], [2.1, 2.1], color=INK, lw=LW)
    if load_label is None: ax.plot([3.7, 3.7], [1.7, 0.9], color=INK, lw=LW)
    else: load(ax, 3.7, 0.9, 1.7, load_label)
    if ret: rresistor(ax, (3.7, 0.35), (1.3, 0.35)); ax.plot([1.3, 0.5], [0.35, 0.35], color=INK, lw=LW); ax.text(2.5, 0.05, ret, ha="center", fontsize=13, color=col(ret))
    else: ax.plot([3.7, 0.5], [0.35, 0.35], color=INK, lw=LW)
    if cur: harrow(ax, (3.15, 2.1), (3.55, 2.1), color=col(cur)); ax.text(3.35, 2.35, cur, ha="center", fontsize=13, color=col(cur))
    for (x_, y_, t) in ann: ax.text(x_, y_, t, fontsize=13, color=col(t), ha="center")
    save(F, name)

series("v45_01_s17_ovn4", "24 V", [("R", "R"), ("K", "öppen")], None, ann=((2.1, 1.25, "I = ?"), (2.1, 0.85, S("U", "kontakt") + " = ?")))
series("v45_01_s24_exempel", "12 V", [("R", S("R", "extra") + " = 1 Ω")], "10 V", cur="2 A")
series("v45_01_s28_ovn7", "24 V", [("R", S("R", "extra") + " = ?")], "18 V", cur="3 A", ann=((2.1, 1.1, "källan håller 24 V"),))

# ================= v45_02 =================
def interval(name, req, meas, title, lo, hi):
    F = fig(4.3, 2.6); ax = F.add_axes((0.03, 0.02, 0.94, 0.96)); ax.set_xlim(lo, hi); ax.set_ylim(0, 1); ax.axis("off")
    f = lambda v: f"{v:.2f}".replace(".", ",")
    ax.add_patch(Rectangle((req[0], 0.55), req[1] - req[0], 0.18, fc="#DDEFE6", ec=GREEN, lw=1.6))
    ax.text((req[0] + req[1]) / 2, 0.64, "krav", ha="center", va="center", fontsize=12, color=GREEN)
    for v in req: ax.text(v, 0.78, f(v), ha="center", fontsize=11, color=GREEN)
    m0, m1 = meas[0] - meas[1], meas[0] + meas[1]
    ax.add_patch(Rectangle((m0, 0.3), m1 - m0, 0.16, fc=LBLUE, ec=BLUE, lw=1.6)); ax.plot([meas[0]] * 2, [0.27, 0.49], color=BLUE, lw=2.4)
    ax.text(m0, 0.17, f(m0), ha="right", fontsize=11, color=BLUE); ax.text(m1, 0.17, f(m1), ha="left", fontsize=11, color=BLUE)
    ax.text((lo + hi) / 2, 0.04, "mätning ± felgräns", ha="center", fontsize=12, color=BLUE)
    ax.text((lo + hi) / 2, 0.92, title, ha="center", fontsize=12.5)
    save(F, name)
interval("v45_02_s07_krav", (23.0, 25.0), (24.90, 0.15), "Mätintervallet går över kravets övre gräns", 22.6, 25.4)
interval("v45_02_s09_exempel", (19.60, 20.40), (19.80, 0.15), "Hela mätintervallet ligger inom kravet", 19.35, 20.65)

def fram_retur(name, src, last, cur, fram, retur):
    F = fig(4.3, 3.0); ax = cax(F, (0, 4.3), (-0.2, 2.8))
    ax.plot([0.5, 0.5, 1.1], [0.9, 2.1, 2.1], color=INK, lw=LW); rresistor(ax, (1.1, 2.1), (2.9, 2.1)); ax.plot([2.9, 3.7, 3.7], [2.1, 2.1, 1.7], color=INK, lw=LW)
    ax.plot([3.7, 3.7, 2.9], [0.9, 0.35, 0.35], color=INK, lw=LW); rresistor(ax, (2.9, 0.35), (1.1, 0.35)); ax.plot([1.1, 0.5, 0.5], [0.35, 0.35, 0.5], color=INK, lw=LW)
    dcsrc(ax, 0.5, 0.7, src); load(ax, 3.7, 0.9, 1.7, last)
    ax.text(2.0, 2.42, "framledning: " + fram, ha="center", fontsize=12.5, color=col(fram)); ax.text(2.0, 0.02, "retur: " + retur, ha="center", fontsize=12.5, color=col(retur))
    harrow(ax, (3.0, 2.1), (3.4, 2.1), color=BLUE); ax.text(3.2, 1.88, cur, ha="center", fontsize=12.5, color=BLUE)
    save(F, name)
fram_retur("v45_02_s17_ovn4", "24 V", "20 V", "2 A", "ΔU = ?", "ΔU = 1 V")
fram_retur("v45_02_s24_exempel", "12 V", "9 V", "1,5 A", "ΔU = 2,1 V", "ΔU = 0,9 V")

# ================= v45_03 =================
def divider(name, uin, r1, r2, rl, uut):
    F = fig(4.3, 3.0); ax = cax(F, (0, 4.3), (-0.2, 2.8))
    ax.plot([0.5, 0.5, 1.6], [0.9, 2.3, 2.3], color=INK, lw=LW); rresistor(ax, (1.6, 2.3), (1.6, 1.3)); ax.text(1.85, 1.8, r1, fontsize=13, va="center")
    rresistor(ax, (1.6, 1.3), (1.6, 0.35)); ax.text(1.85, 0.82, r2, fontsize=13, va="center")
    ax.plot([1.6, 3.2], [1.3, 1.3], color=INK, lw=LW); dot(ax, 1.6, 1.3, 0.05); rresistor(ax, (3.2, 1.3), (3.2, 0.35)); ax.text(3.45, 0.82, rl, fontsize=13, va="center")
    ax.plot([3.2, 0.5, 0.5], [0.35, 0.35, 0.5], color=INK, lw=LW); dot(ax, 1.6, 0.35, 0.05)
    dcsrc(ax, 0.5, 0.7, uin)
    ax.text(3.1, 1.55, uut, ha="center", fontsize=13.5, color=col(uut))
    save(F, name)
divider("v45_03_s09_exempel", "18 V", "2 kΩ", "2 kΩ", "last 2 kΩ", S("U", "ut") + " = 6 V")
divider("v45_03_s15_ovn3", "24 V", S("R", "1") + " = 2 kΩ", S("R", "2") + " = 4 kΩ", "last 4 kΩ", S("U", "ut") + " = ?")

# s13 nodlag
F = fig(4.3, 2.8); ax = cax(F, (-2.15, 2.15), (-1.4, 1.4))
dot(ax, 0, 0, 0.09)
for ang, lab, inward in ((150, "4,0 A", True), (210, "1,5 A", True), (30, "2,0 A", False), (-30, S("I", "x") + " = ?", False)):
    x, y = 1.5 * np.cos(np.radians(ang)), 1.0 * np.sin(np.radians(ang))
    ax.plot([0, x], [0, y], color=INK, lw=LW)
    p1, p2 = ((x * 0.8, y * 0.8), (x * 0.35, y * 0.35)) if inward else ((x * 0.35, y * 0.35), (x * 0.8, y * 0.8))
    harrow(ax, p1, p2, color=col(lab)); ax.text(x * 1.18, y * 1.18, lab, ha="center", va="center", fontsize=14, color=col(lab))
ax.text(0, 1.2, "in till vänster, ut till höger", ha="center", fontsize=11.5, color=GRAY)
save(F, "v45_03_s13_ovn2")

# s19 RL i serie
F = fig(4.3, 2.8); ax = cax(F, (0, 4.3), (0, 2.8))
ax.plot([0.5, 0.5, 1.0], [0.9, 2.1, 2.1], color=INK, lw=LW); resistor(ax, 1.5, 2.1, label="R = 30 Ω"); ax.plot([1.85, 2.3], [2.1, 2.1], color=INK, lw=LW)
inductor(ax, 2.7, 2.1, label=S("X", "L") + " = 40 Ω"); ax.plot([3.1, 3.7, 3.7, 0.5, 0.5], [2.1, 2.1, 0.35, 0.35, 0.5], color=INK, lw=LW)
ac_source(ax, 0.5, 0.7); ax.text(0.85, 0.7, "100 V RMS", fontsize=13, va="center")
ax.text(2.6, 1.2, "I = ?   cos φ = ?", ha="center", fontsize=14, color=RED)
save(F, "v45_03_s19_ovn5")

series("v45_03_s34_ovn10", "24 V", [("R", S("R", "slinga") + " = ?")], "last", cur="4 A", ann=((2.1, 1.25, "före: 20 V vid lasten"), (2.1, 0.85, "efter: 23,6 V")))
