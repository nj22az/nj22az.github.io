"""Generates wiring_schematic.svg / .pdf for JPVM-2R20 (python3 make_schematic.py)."""
import os
OUT = os.path.dirname(os.path.abspath(__file__))
W, H = 1700, 1150
s = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" font-family="DejaVu Sans, Noto Sans CJK JP, sans-serif">',
     '<rect width="100%" height="100%" fill="white"/>',
     '<defs><marker id="a" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#333"/></marker></defs>']
COL = dict(ac="#c00000", n="#1f4fd0", pe="#2a9d2a", dc24="#e07b00", dc12="#9b59b6", sig="#333333", mdb="#008b8b")

def blk(x, y, w, h, title, lines=(), fill="#f4f6fa"):
    s.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="6" fill="{fill}" stroke="#222" stroke-width="1.5"/>')
    s.append(f'<text x="{x+w/2}" y="{y+18}" font-size="13" font-weight="bold" text-anchor="middle">{title}</text>')
    for i, l in enumerate(lines):
        s.append(f'<text x="{x+8}" y="{y+36+i*14}" font-size="10.5">{l}</text>')
def wire(pts, c, lbl=None, w=2, dash=None, arrow=False):
    d = " ".join(f"{'M' if i==0 else 'L'}{x},{y}" for i, (x, y) in enumerate(pts))
    s.append(f'<path d="{d}" fill="none" stroke="{c}" stroke-width="{w}"' + (f' stroke-dasharray="{dash}"' if dash else "") +
             (' marker-end="url(#a)"' if arrow else "") + "/>")
    if lbl:
        (x0, y0), (x1, y1) = pts[0], pts[1]
        s.append(f'<text x="{(x0+x1)/2+4}" y="{(y0+y1)/2-4}" font-size="9.5" fill="{c}">{lbl}</text>')

s.append('<text x="20" y="32" font-size="22" font-weight="bold">JPVM-2R20 Drink Vending Machine — Electrical Wiring Schematic</text>')
s.append('<text x="20" y="52" font-size="12">AC100V 50/60Hz single phase · 15A branch · Rev A · Drawing VM-E-001 · Tags match vending_machine_metadata.json io_map</text>')

# --- power entry ---
blk(20, 80, 170, 110, "X1 Mains inlet", ["AC100V 15A plug + PE", "Leakage breaker ELB", "30mA / 15A (Q1)", "Line noise filter FL1"], "#ffecec")
blk(20, 230, 170, 90, "Q2 Door interlock", ["Service sw S1 (DI_DOOR_SW)", "Lamp/main on-off SW2"], "#ffecec")
# AC bus
wire([(190, 110), (330, 110)], COL["ac"], "L"); wire([(190, 130), (330, 130)], COL["n"], "N"); wire([(190, 150), (330, 150)], COL["pe"], "PE")
for y, c in ((110, "ac"), (130, "n"), (150, "pe")):
    wire([(330, y), (330 if False else 330, y)], COL[c])
s.append('<line x1="330" y1="100" x2="330" y2="1060" stroke="#c00000" stroke-width="3"/>')
s.append('<line x1="345" y1="120" x2="345" y2="1060" stroke="#1f4fd0" stroke-width="3"/>')
s.append('<line x1="360" y1="140" x2="360" y2="1060" stroke="#2a9d2a" stroke-width="3"/>')
s.append('<text x="300" y="1080" font-size="11">AC bus L / N / PE</text>')
wire([(190, 110), (330, 110)], COL["ac"]); wire([(105, 190), (105, 230)], COL["ac"], "SW", 2)

# --- AC loads via relay board ---
blk(430, 80, 230, 170, "K1 Relay / SSR board", ["K1 Compressor 25A relay (DO_COMP)", "K2 Heater SSR 10A (DO_HEATER)", "K3 Evap fan (DO_FAN_EVAP)",
    "K4 Cond fan (DO_FAN_COND)", "K5 Hot circ fan (DO_HEATER_FAN)", "K6 Defrost heater", "K7 Light (DO_DISPLAY_LIGHT)", "coil 12VDC from main ctrl"], "#fff6e5")
wire([(330, 165), (430, 165)], COL["ac"], "L"); wire([(345, 185), (430, 185)], COL["n"], "N")
loads = [("M1 Compressor", ["R744 rotary 350W", "Start relay + OLP", "Thermal protector"], 300),
         ("E1 Hot heater", ["Sheath 300W 100V", "Thermal fuse TF1 85°C", "Bimetal TS 70°C"], 400),
         ("M2/M3/M4 Fans", ["Evap 10W, Cond 25W", "Hot-zone circ 10W", "shaded-pole AC100V"], 500),
         ("E2 Defrost htr", ["Evap defrost 150W"], 600)]
for i, (t, l, y) in enumerate(loads):
    blk(430, y, 230, 75, t, l, "#ffecec")
    wire([(545, 250), (545, 260)], COL["ac"]) if i == 0 else None
    wire([(660, 120 + i * 30), (700, 120 + i * 30), (700, y + 37), (660, y + 37)], COL["ac"], None, 2)
    wire([(345, y + 55), (430, y + 55)], COL["n"]); wire([(360, y + 68), (430, y + 68)], COL["pe"], None, 1.5)
# PSU
blk(430, 720, 230, 110, "PS1 SMPS", ["In: AC100V", "Out1: 24VDC 6.5A (motors)", "Out2: 12VDC 5A (MDB/ctrl/LED)", "Out3: 5VDC 2A (logic)"], "#eef7ee")
wire([(330, 750), (430, 750)], COL["ac"], "L"); wire([(345, 770), (430, 770)], COL["n"], "N"); wire([(360, 790), (430, 790)], COL["pe"], "PE")
blk(430, 870, 230, 90, "LED backlight", ["LED bars 2×18W, 12VDC", "dim via light sensor LS1", "(K7 / PWM)"], "#eef7ee")

# --- main controller ---
blk(800, 300, 280, 380, "A1 Main Vend Controller (MCU)", [
    "J1  24VDC in  / J2 12VDC in", "J3  Vend motor drv ×10 (low-side MOSFET)", "     DO_VEND_M01..10", "J4  Cam switches DI_CAM_01..10",
    "J5  Sold-out sw DI_EMPTY_01..10", "J6  Drop IR sensor DI_DROP", "J7  Flap sw DI_FLAP_SW, Door DI_DOOR_SW", "J8  Return lever DI_RET_LEVER",
    "J9  NTC TH1 cold / TH2 hot (AI)", "J10 Relay board coils (12V)", "J11 MDB master (9600 8N1+mode)", "J12 HMI board (RS-485 + 12V)",
    "J13 LCD credit display (UART)", "J14 Telemetry / DEX-UCS / LTE-M", "Watchdog, RTC, EEPROM audit", "", "State machine: controller_state_machine.md"], "#e9f0ff")
wire([(660, 750), (740, 750), (740, 330), (800, 330)], COL["dc24"], "24V", 2.5)
wire([(660, 775), (760, 775), (760, 350), (800, 350)], COL["dc12"], "12V", 2.5)
wire([(800, 440), (720, 440), (720, 210), (660, 210)], COL["sig"], "J10 coils", 1.5, "5,3")
wire([(660, 900), (780, 900), (780, 560), (800, 560)], COL["dc12"], None, 1.5)

# --- vend motors ---
blk(1180, 80, 230, 200, "M10..M19 Vend motors ×10", ["24VDC gear motor 0.3A", "Cam micro-sw (NO) per col", "Column 1–7 COLD, 8–10 HOT",
    "Sold-out sw S11..S20 (NC)", "Diode clamp per motor", "", "Drop sensor PH1:", "IR emitter/receiver 12V, chute"], "#fff6e5")
wire([(1080, 330), (1130, 330), (1130, 150), (1180, 150)], COL["dc24"], "DO_VEND_M01..10", 2.5)
wire([(1180, 200), (1110, 200), (1110, 360), (1080, 360)], COL["sig"], "DI_CAM / DI_EMPTY", 1.5, None, True)
# --- payment MDB ---
blk(1180, 320, 230, 90, "A2 Coin changer (MDB 0x08)", ["¥10/50/100/500, 4 tubes", "Return lever → DI_RET_LEVER", "24VDC on MDB"], "#e5f7f7")
blk(1180, 430, 230, 80, "A3 Bill validator (MDB 0x30)", ["¥1000 note, escrow 1", "stacker 300 notes"], "#e5f7f7")
blk(1180, 530, 230, 90, "A4 IC reader (MDB 0x10)", ["Cashless lvl 3, NFC FeliCa", "Suica/PASMO/iD/QUICPay", "LTE-M gateway to host"], "#e5f7f7")
s.append('<line x1="1140" y1="360" x2="1140" y2="580" stroke="#008b8b" stroke-width="4"/>')
wire([(1080, 470), (1140, 470)], COL["mdb"], "MDB bus", 3)
for y in (365, 470, 575): wire([(1140, y), (1180, y)], COL["mdb"], None, 3)
# --- HMI ---
blk(1180, 660, 230, 170, "A5 HMI board (door)", ["20 selection buttons (4×5 matrix)", "DI_SEL_R1C01..R2C10", "20 button LEDs blue/red", "DO_LED_*, 20 sold-out lamps DO_SOLDOUT_*",
    "4-digit LCD (SER_LCD)", "Buzzer", "Door harness: 12-pin, 2 m"], "#f0e9ff")
wire([(1080, 620), (1110, 620), (1110, 740), (1180, 740)], COL["sig"], "RS-485 + 12V", 2)
# --- sensors ---
blk(800, 730, 280, 110, "Sensors", ["TH1 NTC 10k B3435 cold zone", "TH2 NTC 10k B3435 hot zone", "LS1 CdS light sensor (night dim)", "S2 flap sw, S1 door sw"], "#f7f7f7")
wire([(940, 730), (940, 680)], COL["sig"], "AI/DI", 1.5, None, True)
# legend
lx, ly = 1450, 80
s.append(f'<rect x="{lx}" y="{ly}" width="230" height="200" fill="#fff" stroke="#222"/><text x="{lx+10}" y="{ly+20}" font-size="13" font-weight="bold">Legend</text>')
for i, (k, t) in enumerate((("ac", "AC100V Line (L)"), ("n", "Neutral (N)"), ("pe", "Protective earth"), ("dc24", "24VDC motor power"),
                             ("dc12", "12VDC control / LED"), ("mdb", "MDB bus (9-bit serial)"), ("sig", "Signal / sensor"))):
    s.append(f'<line x1="{lx+10}" y1="{ly+40+i*22}" x2="{lx+50}" y2="{ly+40+i*22}" stroke="{COL[k]}" stroke-width="3"/><text x="{lx+60}" y="{ly+44+i*22}" font-size="11">{t}</text>')
blk(1450, 320, 230, 200, "Notes", ["1. All metal parts bonded to PE.", "2. Heater: SSR + TF1 85°C fuse +", "   bimetal in series (hw safety).",
    "3. Compressor: 3-min restart delay", "   in firmware + OLP in hardware.", "4. Motor diodes 1N4007 on each.", "5. Door sw kills vend motor 24V", "   (hardware interlock K8).",
    "6. Wire: AC 1.25sq, DC 0.5sq,", "   MDB 4-core 0.3sq shielded."], "#fffbe6")
s.append('</svg>')
open(os.path.join(OUT, "wiring_schematic.svg"), "w").write("\n".join(s))
try:
    import cairosvg; cairosvg.svg2pdf(url=os.path.join(OUT, "wiring_schematic.svg"), write_to=os.path.join(OUT, "wiring_schematic.pdf"))
    cairosvg.svg2png(url=os.path.join(OUT, "wiring_schematic.svg"), write_to="/tmp/schem.png")
except ImportError: print("cairosvg missing: PDF skipped")
print("ok")
