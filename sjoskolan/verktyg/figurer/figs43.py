"""Figurer till vecka 43: komponenter och skydd, transformatorer och motorer, elscheman.
Användning: figs43.py <katalog med figlib.py> <utkatalog>
Regler: rött bara för det som söks (”?”), inga svar på övningsbilder, fartygsvärden där det passar."""
import sys; sys.path.insert(0, sys.argv[1])
import figlib as L
from figlib import *
from matplotlib.patches import FancyBboxPatch
L.OUT = sys.argv[2]
LBLUE = "#DCEBF7"; PALE = "#F3F6F9"; CORE = "#9AA7B4"

def S(b, i): return b + r"$_\mathregular{" + i + "}$"
def rbox(ax, x, y, w, h, text, fc="white", ec=INK, fs=14, color=INK, weight="normal", lw=1.6):
    ax.add_patch(FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0,rounding_size=0.08", fc=fc, ec=ec, lw=lw, zorder=2))
    ax.text(x + w / 2, y + h / 2, text, ha="center", va="center", fontsize=fs, color=color, weight=weight, zorder=3)
def harrow(ax, p1, p2, color=INK, lw=1.8, style="-|>"):
    ax.annotate("", xy=p2, xytext=p1, arrowprops=dict(arrowstyle=style, color=color, lw=lw, mutation_scale=14, shrinkA=0, shrinkB=0))

# ================= v43_01 Komponenter och skydd =================
# s7: ström–tidskurva för en dvärgbrytare (principskiss)
F = fig(4.3, 3.6); ax = F.add_axes((0.17, 0.17, 0.78, 0.72))
x = np.logspace(0.02, 3, 400)
t_th = np.where(x < 4, 60 / (x - 1) ** 2, np.nan)
ax.loglog(x[x < 4], t_th[x < 4], color=BLUE, lw=2.6); ax.plot([4, 4], [60 / 9, 0.01], color=BLUE, lw=2.6); ax.plot([4, 1000], [0.01, 0.01], color=BLUE, lw=2.6)
ax.set_xlim(0.8, 1000); ax.set_ylim(0.004, 3000)
for s_ in ("top", "right"): ax.spines[s_].set_visible(False)
ax.tick_params(labelsize=11, colors=GRAY); ax.set_xticks([1, 10, 100, 1000]); ax.set_xticklabels(["1", "10", "100", "1 000"])
ax.set_yticks([0.01, 1, 100]); ax.set_yticklabels(["0,01", "1", "100"])
ax.set_xlabel("ström / märkström", fontsize=12); ax.set_ylabel("tid (s)", fontsize=12)
ax.text(6, 40, "överlast:\nlångsam", fontsize=12, color=ORANGE); ax.text(12, 0.04, "kortslutning: snabb", fontsize=12, color=ORANGE)
F.text(0.55, 0.94, "Principskiss, inte ett verkligt skydd", ha="center", fontsize=12, color=GRAY)
save(F, "v43_01_s07_kurva")

# jordfelsbrytare: gemensam ritfunktion
def rcd(name, iut, iret, idelta, leak=True, note=None, idcol=BLUE):
    F = fig(4.3, 3.4); ax = cax(F, (0, 4.3), (0, 3.4))
    for y, n in ((2.55, "L"), (1.85, "N")): ax.text(0.1, y, n, fontsize=14, va="center", weight="bold"); ax.plot([0.35, 3.3], [y, y], color=INK, lw=LW)
    ax.add_patch(matplotlib.patches.Ellipse((1.55, 2.2), 0.45, 1.15, fc="none", ec=CORE, lw=7, zorder=3))
    ax.text(0.75, 1.35, "summaström-\ntransformator", ha="center", va="center", fontsize=10, color=GRAY)
    rbox(ax, 3.3, 1.65, 0.85, 1.1, "last", fs=14)
    harrow(ax, (2.2, 2.72), (2.9, 2.72), color=BLUE); ax.text(2.55, 2.85, iut, ha="center", fontsize=13, color=BLUE)
    harrow(ax, (2.9, 1.68), (2.2, 1.68), color=BLUE); ax.text(2.55, 1.35, iret, ha="center", fontsize=13, color=BLUE)
    if leak:
        ax.plot([3.72, 3.72, 3.2], [1.65, 0.75, 0.75], color=ORANGE, lw=2.2, ls=(0, (4, 3)))
        ax.plot([3.1, 3.3], [0.75, 0.75], color=ORANGE, lw=2.2); [ax.plot([3.2 - w, 3.2 + w], [0.62 - 0.08 * k] * 2, color=ORANGE, lw=2) for k, w in enumerate((0.16, 0.1, 0.04))]
        ax.text(3.0, 0.9, "läckström", ha="right", fontsize=12, color=ORANGE)
    ax.plot([1.55, 1.55], [1.62, 0.9], color=GRAY, lw=1.5); rbox(ax, 0.9, 0.35, 1.3, 0.55, "utlösare", fs=12)
    ax.text(0.2, 0.08, S("I", "Δ") + (" " if idelta.startswith("≈") else " = ") + idelta, fontsize=14, color=RED if "?" in idelta else idcol)
    if note: ax.text(2.4, 0.08, note, fontsize=12, color=ORANGE)
    save(F, name)
rcd("v43_01_s08_jordfel", S("I", "ut"), S("I", "retur"), "|" + S("I", "ut") + " − " + S("I", "retur") + "|")
rcd("v43_01_s09_exempel", "2,000 A", "1,985 A", "15 mA")
rcd("v43_01_s16_stod4", "5,000 A", "4,970 A", "?")
rcd("v43_01_s18_stod5", "för stor ström", "samma ström", "≈ 0", leak=False, note="överlast ≠ jordfel")

# s21: kontaktor och relä
F = fig(4.3, 3.2); ax = cax(F, (0, 4.3), (0, 3.2))
coil(ax, 0.9, 1.6, "K1", w=0.7, h=0.45); ax.plot([0.9, 0.9], [2.4, 1.83], color=INK, lw=LW); ax.plot([0.9, 0.9], [1.37, 0.8], color=INK, lw=LW)
ax.text(0.9, 0.55, "spole", ha="center", fontsize=12)
contact(ax, 2.6, 2.3, False, "NO (13–14)"); contact(ax, 2.6, 1.0, True, "NC (21–22)", nc=True)
for y in (2.3, 1.0): ax.plot([1.9, 2.3], [y, y], color=INK, lw=LW); ax.plot([2.9, 3.4], [y, y], color=INK, lw=LW)
ax.plot([1.25, 2.55], [1.6, 1.6], color=GRAY, lw=1.4, ls=(0, (4, 3))); ax.plot([2.55, 2.55], [1.1, 2.4], color=GRAY, lw=1.4, ls=(0, (4, 3)))
ax.text(2.15, 2.9, "Opåverkat läge", ha="center", fontsize=13, weight="bold")
ax.text(3.5, 2.3, "öppen", fontsize=12, va="center", color=BLUE); ax.text(3.5, 1.0, "sluten", fontsize=12, va="center", color=BLUE)
save(F, "v43_01_s21_kontaktor")

# s23: selektivitet
F = fig(4.3, 3.6); ax = cax(F, (0, 4.3), (0, 3.6))
rbox(ax, 1.5, 2.65, 1.3, 0.55, "huvudskydd", fs=12.5, fc=LBLUE); ax.text(2.9, 2.92, "i drift", ha="left", va="center", fontsize=11, color=GREEN)
for k, (x, t) in enumerate(((0.15, "grupp A"), (1.5, "grupp B"), (2.85, "grupp C"))):
    ax.plot([2.15, 2.15, x + 0.65, x + 0.65], [2.65, 2.3, 2.3, 1.95], color=INK, lw=LW)
    tripped = k == 1
    rbox(ax, x, 1.4, 1.3, 0.55, t, fs=12.5, ec=ORANGE if tripped else INK, lw=2.4 if tripped else 1.6)
    ax.plot([x + 0.65, x + 0.65], [1.4, 0.75], color=GRAY if tripped else INK, lw=LW)
    ax.text(x + 0.72, 1.2, "löser" if tripped else "i drift", ha="left", fontsize=11, color=ORANGE if tripped else GREEN)
ax.add_patch(Polygon([(2.1, 0.75), (2.3, 0.45), (2.17, 0.45), (2.3, 0.15), (2.02, 0.5), (2.15, 0.5)], fc=ORANGE, ec="none"))
ax.text(2.4, 0.35, "fel", fontsize=12, color=ORANGE)
ax.text(2.15, 3.52, "Bara skyddet närmast felet löser", ha="center", fontsize=12.5, va="top")
save(F, "v43_01_s23_selektivitet")

# s24: exempel brytförmåga
F = fig(4.3, 3.2); ax = F.add_axes((0.19, 0.18, 0.77, 0.72))
ax.bar([0, 1], [4.5, 10], width=0.55, color=[LIGHT, LIGHT], edgecolor=[INK, INK], lw=1.6)
ax.axhline(7, color=ORANGE, lw=2.2, ls=(0, (5, 3))); ax.text(-0.45, 7.35, "möjlig felström 7 kA", ha="left", fontsize=12, color=ORANGE)
ax.set_xticks([0, 1]); ax.set_xticklabels(["skydd A", "skydd B"]); ax.set_ylim(0, 12); ax.set_xlim(-0.5, 1.5)
ax.set_yticks([0, 2.5, 5, 7.5, 10]); ax.set_yticklabels(["0", "2,5", "5", "7,5", "10"])
for s_ in ("top", "right"): ax.spines[s_].set_visible(False)
ax.tick_params(labelsize=12); ax.set_ylabel("brytförmåga (kA)", fontsize=12)
ax.text(0, 4.8, "4,5", ha="center", fontsize=13); ax.text(1, 10.3, "10", ha="center", fontsize=13)
save(F, "v43_01_s24_exempel")

# ================= v43_02 Transformatorer och motorer =================
def trafo(name, n1, n2, u1, u2, i1=None, i2=None, load=False):
    F = fig(4.3, 3.0); ax = cax(F, (0, 4.3), (0, 3.0))
    ax.add_patch(Rectangle((1.45, 0.55), 1.4, 1.9, fc="none", ec=CORE, lw=14))
    for x0, sgn in ((1.45, -1), (2.85, 1)):
        for k in range(5): ax.add_patch(Arc((x0, 0.9 + k * 0.3), 0.5, 0.3, theta1=90 if sgn < 0 else -90, theta2=270 if sgn < 0 else 90, color=BLUE, lw=2.2, zorder=4))
    ax.plot([0.35, 1.2, 1.2], [2.3, 2.3, 2.1], color=INK, lw=LW); ax.plot([0.35, 1.2, 1.2], [0.7, 0.7, 0.9], color=INK, lw=LW)
    ax.plot([3.95, 3.1, 3.1], [2.3, 2.3, 2.1], color=INK, lw=LW); ax.plot([3.95, 3.1, 3.1], [0.7, 0.7, 0.9], color=INK, lw=LW)
    ax.text(1.15, 0.33, n1, ha="center", va="center", fontsize=13, color=BLUE); ax.text(3.15, 0.33, n2, ha="center", va="center", fontsize=13, color=BLUE)
    vmark(ax, (0.35, 2.2), (0.35, 0.8), "", color=INK); ax.text(0.12, 2.65, u1, fontsize=14, color=RED if "?" in u1 else INK)
    if load:
        rresistor(ax, (3.95, 2.3), (3.95, 0.7)); ax.text(4.2, 2.65, u2, fontsize=14, ha="right", color=RED if "?" in u2 else INK)
    else:
        vmark(ax, (3.95, 2.2), (3.95, 0.8), "", color=INK); ax.text(4.2, 2.65, u2, fontsize=14, ha="right", color=RED if "?" in u2 else INK)
    if i1: harrow(ax, (0.5, 2.3), (0.95, 2.3), color=RED if "?" in i1 else BLUE); ax.text(0.78, 2.05, i1, ha="center", fontsize=13, color=RED if "?" in i1 else BLUE)
    if i2: harrow(ax, (3.35, 2.3), (3.8, 2.3), color=BLUE); ax.text(3.5, 2.05, i2, ha="center", fontsize=13, color=BLUE)
    ax.text(2.15, 2.75, "ideal", ha="center", fontsize=12, color=GRAY)
    save(F, name)
trafo("v43_02_s06_trafo", "N₁", "N₂", "440 V", "110 V")
trafo("v43_02_s11_ovn1", "N₁ = 1 000", "N₂ = 100", "U₁ = 230 V", "U₂ = ?")
trafo("v43_02_s13_ovn2", "N₁", "N₂", "U₁ = 240 V", "U₂ = 24 V", i1="I₁ = ?", i2="I₂ = 3 A", load=True)

# s8: fält och rotor, eftersläpning
F = fig(4.3, 3.9); ax = cax(F, (-2.15, 2.15), (-1.95, 1.95))
ax.add_patch(Circle((0, 0), 1.45, fc="none", ec=CORE, lw=16))
for k, (a, t) in enumerate(((90, "N"), (180, "S"), (270, "N"), (0, "S"))):
    ax.text(1.05 * np.cos(np.radians(a)), 1.05 * np.sin(np.radians(a)), t, ha="center", va="center", fontsize=13, weight="bold", color=GRAY)
ax.add_patch(Circle((0, 0), 0.62, fc=PALE, ec=INK, lw=1.8)); ax.text(0, 0, "rotor", ha="center", va="center", fontsize=12)
ax.add_patch(Arc((0, 0), 2.5, 2.5, theta1=20, theta2=75, color=BLUE, lw=3)); harrow(ax, (0.38, 1.2), (0.28, 1.22), color=BLUE, lw=3)
ax.add_patch(Arc((0, 0), 1.6, 1.6, theta1=25, theta2=60, color=ORANGE, lw=3)); harrow(ax, (0.43, 0.68), (0.36, 0.72), color=ORANGE, lw=3)
ax.text(0, 1.8, "fält: " + S("n", "s") + " = 1 800 r/min", ha="center", fontsize=12.5, color=BLUE)
ax.text(-2.1, -1.65, "rotor: n = 1 746 r/min", fontsize=12.5, color=ORANGE)
ax.text(2.1, -1.65, "4 poler, 60 Hz", fontsize=12.5, ha="right", color=GRAY)
save(F, "v43_02_s08_slip")

# s21: startström, principskiss
F = fig(4.3, 3.2); ax = F.add_axes((0.14, 0.18, 0.82, 0.7))
t = np.linspace(0, 6, 400)
dol = np.where(t < 3.0, 7.0 - 0.5 * t, np.maximum(1, 5.5 - 3.5 * (t - 3.0)))
yd = np.where(t < 3.8, 2.3 - 0.35 * t, np.where(t < 4.0, 5.0, np.maximum(1, 5.0 - 5 * (t - 4.0))))
ax.plot(t, dol, color=ORANGE, lw=2.6, label="direktstart"); ax.plot(t, yd, color=BLUE, lw=2.6, label="Y/Δ-start")
ax.set_ylim(0, 8); ax.set_xlim(0, 6); ax.set_yticks([0, 1, 4, 7]); ax.set_xticks([])
for s_ in ("top", "right"): ax.spines[s_].set_visible(False)
ax.set_ylabel("ström / märkström", fontsize=12); ax.set_xlabel("tid", fontsize=12); ax.tick_params(labelsize=11)
ax.annotate("omkoppling Y → Δ", xy=(3.85, 4.8), xytext=(1.0, 3.7), fontsize=11, color=BLUE, arrowprops=dict(arrowstyle="-|>", color=BLUE, lw=1.2)); ax.legend(frameon=False, fontsize=12, loc="upper right")
F.text(0.55, 0.93, "Principskiss: verkliga värden enligt motordata", ha="center", fontsize=11.5, color=GRAY)
save(F, "v43_02_s21_start")

# s22: frekvensomriktarens delar
F = fig(4.3, 3.2); ax = cax(F, (0, 4.3), (0, 3.2))
blocks = [(0.05, "Likriktare"), (1.5, "DC-\nmellanled"), (2.95, "Växel-\nriktare")]
for x, t in blocks: rbox(ax, x, 1.55, 1.2, 0.8, t, fs=12.5, fc=LBLUE)
harrow(ax, (1.25, 1.95), (1.5, 1.95)); harrow(ax, (2.7, 1.95), (2.95, 1.95))
tt = np.linspace(0, 1, 80)
ax.plot(0.2 + 0.9 * tt, 1.05 + 0.25 * np.sin(2 * np.pi * 2 * tt), color=BLUE, lw=1.8)
ax.plot([1.65, 2.55], [1.2, 1.2], color=BLUE, lw=1.8)
pw = np.sign(np.sin(2 * np.pi * 14 * tt)) * (np.abs(np.sin(2 * np.pi * 14 * tt)) > np.abs(np.sin(np.pi * 2 * tt)) * 0.1) * np.sign(np.sin(2 * np.pi * tt + 0.01))
ax.step(3.1 + 0.9 * tt, 1.05 + 0.22 * np.where(np.abs(np.sin(2 * np.pi * 14 * tt)) < np.abs(np.sin(2 * np.pi * tt)), np.sign(np.sin(2 * np.pi * tt)), 0), color=BLUE, lw=1.4, where="mid")
ax.text(0.65, 0.55, "nät-AC", ha="center", fontsize=12); ax.text(2.1, 0.55, "DC, lagrad energi", ha="center", fontsize=12, color=ORANGE); ax.text(3.55, 0.55, "pulsad utgång", ha="center", fontsize=12)
ax.text(2.15, 2.85, "Nät  →  omriktare  →  motor", ha="center", fontsize=13)
save(F, "v43_02_s22_omriktare")

# ================= v43_03 Elscheman och dokumentation =================
# s24: spänning över ett avbrott (exempel)
F = fig(4.3, 3.0); ax = cax(F, (0, 4.3), (-0.2, 2.8))
ax.plot([0.5, 0.5, 1.3], [0.85, 2.1, 2.1], color=INK, lw=LW); ax.plot([1.9, 3.5, 3.5], [2.1, 2.1, 1.5], color=INK, lw=LW)
ax.plot([3.5, 3.5, 0.5, 0.5], [0.7, 0.3, 0.3, 0.45], color=INK, lw=LW)
ax.add_patch(Circle((0.5, 0.65), 0.2, fc="white", ec=INK, lw=LW)); ax.text(0.5, 0.72, "+", ha="center", va="center", fontsize=11); ax.text(0.5, 0.57, "−", ha="center", va="center", fontsize=11)
ax.text(0.8, 0.65, "9 V", ha="left", va="center", fontsize=14)
contact(ax, 1.6, 2.1, False, "öppen")
rresistor(ax, (3.5, 1.5), (3.5, 0.7)); ax.text(3.75, 1.1, "last", fontsize=12, va="center")
vmark(ax, (1.3, 2.45), (1.9, 2.45), "", color=BLUE); ax.text(1.6, 2.62, S("U", "kontakt") + " = 9 V", ha="center", fontsize=13, color=BLUE)
ax.text(2.6, 1.1, S("U", "last") + " = 0 V", fontsize=13, color=BLUE, ha="center"); ax.text(2.6, 0.8, "I = 0", fontsize=13, color=BLUE, ha="center")
save(F, "v43_03_s24_exempel")

# hållkretsen i 12 V med spänningsfråga
def latch(name, s0=True, s1=False, k1=False, coil_on=False, vq=None, note=None):
    F = fig(4.3, 3.0); ax = F.add_axes((0.0, 0.0, 1.0, 1.0)); ax.set_xlim(-0.4, 5.0); ax.set_ylim(-0.9, 2.85); ax.set_aspect("equal"); ax.axis("off")
    y = 0.9; yl = 0.0
    ax.plot([0, 4.6], [y, y], color=INK, lw=LW); ax.text(-0.05, y + 0.25, "+12 V", fontsize=12, ha="left"); ax.text(4.6, y + 0.25, "0 V", fontsize=12, ha="right")
    contact(ax, 0.8, y, s0, "S0 NC", nc=True); dot(ax, 1.5, y, 0.05); dot(ax, 3.1, y, 0.05)
    contact(ax, 2.3, y, s1, "S1 NO"); ax.plot([1.5, 1.5, 3.1, 3.1], [y, yl, yl, y], color=INK, lw=LW)
    contact(ax, 2.3, yl, k1, "K1 NO"); coil(ax, 3.85, y, "K1", on=coil_on)
    if vq == "spole": vmark(ax, (3.55, y + 0.45), (4.15, y + 0.45), "", color=RED); ax.text(3.85, y + 0.7, S("U", "spole") + " = ?", ha="center", fontsize=14, color=RED)
    if vq == "stopp": vmark(ax, (0.5, y + 0.55), (1.1, y + 0.55), "", color=RED); ax.text(0.8, y + 0.8, S("U", "S0") + " = ?", ha="center", fontsize=14, color=RED)
    if note: ax.text(2.3, 2.45, note, ha="center", fontsize=13)
    save(F, name)
latch("v43_03_s26_ovn6", vq="spole", note="Vila: S0 sluten, S1 öppen")
latch("v43_03_s28_ovn7", s1=True, vq="spole", note="Start: S1 hålls sluten")
latch("v43_03_s30_ovn8", s0=False, s1=True, vq="stopp", note="S1 hålls sluten, S0 öppnas")
