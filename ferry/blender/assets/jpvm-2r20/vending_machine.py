"""
Japanese 2-row drink vending machine (jidouhanbaiki) - procedural Blender model.
Run:  blender -b -P vending_machine.py -- [outdir]      (or: python3 vending_machine.py [outdir] with pip bpy)
Units: metres. Origin = floor, front-centre. +Y = toward the back, -Y = front (customer side).
Naming: VM_<Subsystem>_<Part>[_<Row><Col>]   e.g. VM_HMI_Button_R1C03
Outputs: vending_machine.blend, vending_machine.glb, preview_front.png, preview_open.png
"""
import bpy, math, sys, os, json, random
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else sys.argv[1:]
OUT = os.path.abspath(argv[0]) if argv else os.path.dirname(os.path.abspath(__file__))
os.makedirs(OUT, exist_ok=True)
random.seed(7)

# ---------------- dimensions (typical full-size JP drink VM) ----------------
W, D, H = 1.000, 0.700, 1.830          # body
ROWS, COLS = 2, 10                       # 20 selections
HOT_COLS = {(1, 7), (1, 8), (1, 9), (1, 10)}   # row1 right 4 "あったか～い", rest "つめた～い"
PRICES = [[110, 130, 130, 160, 150, 130, 140, 160, 180, 200],
          [160, 160, 120, 130, 150, 170, 180, 130, 140, 160]]

bpy.ops.wm.read_factory_settings(use_empty=True)
scn = bpy.context.scene

# ---------------- helpers ----------------
def coll(name, parent=None):
    c = bpy.data.collections.new(name)
    (parent or scn.collection).children.link(c)
    return c

def mat(name, base, metal=0.0, rough=0.5, emit=None, estr=0.0, trans=0.0, ior=1.45, alpha=1.0, coat=0.0):
    m = bpy.data.materials.get(name)
    if m: return m
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*base, 1)
    b.inputs["Metallic"].default_value = metal
    b.inputs["Roughness"].default_value = rough
    b.inputs["IOR"].default_value = ior
    b.inputs["Transmission Weight"].default_value = trans
    b.inputs["Coat Weight"].default_value = coat
    b.inputs["Alpha"].default_value = alpha
    if emit:
        b.inputs["Emission Color"].default_value = (*emit, 1)
        b.inputs["Emission Strength"].default_value = estr
    if alpha < 1 or trans > 0:
        try: m.surface_render_method = "BLENDED"
        except Exception: pass
    return m

def box(name, size, loc, m, c, bevel=0.0, parent=None):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    o = bpy.context.active_object; o.name = name; o.data.name = name + "_mesh"
    o.scale = size; bpy.ops.object.transform_apply(scale=True)
    if bevel:
        bv = o.modifiers.new("Bevel", "BEVEL"); bv.width = bevel; bv.segments = 3
        bv.limit_method = "ANGLE"
        o.modifiers.new("WN", "WEIGHTED_NORMAL")
    o.data.materials.append(m); relink(o, c)
    if parent: setparent(o, parent)
    return o

def cyl(name, r, depth, loc, m, c, rot=(0, 0, 0), verts=32, parent=None):
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=depth, location=loc, rotation=rot, vertices=verts)
    o = bpy.context.active_object; o.name = name; o.data.name = name + "_mesh"
    bpy.ops.object.shade_smooth()
    o.data.materials.append(m); relink(o, c)
    if parent: setparent(o, parent)
    return o

def relink(o, c):
    for cc in o.users_collection: cc.objects.unlink(o)
    c.objects.link(o)

def setparent(o, p):
    mw = o.matrix_world.copy(); o.parent = p; o.matrix_world = mw

def empty(name, loc, c, parent=None, kind="PLAIN_AXES", size=0.05):
    o = bpy.data.objects.new(name, None); o.empty_display_type = kind
    o.empty_display_size = size; o.location = loc; c.objects.link(o)
    if parent: setparent(o, parent)
    return o

def text(name, body, loc, size, m, c, parent=None, align="CENTER"):
    cu = bpy.data.curves.new(name + "_crv", "FONT"); cu.body = body; cu.size = size
    cu.align_x = align; cu.align_y = "CENTER"; cu.extrude = 0.0003
    o = bpy.data.objects.new(name, cu); o.location = loc
    o.rotation_euler = (math.radians(90), 0, 0); c.objects.link(o)
    cu.materials.append(m)
    if JPFONT: cu.font = JPFONT
    if parent: setparent(o, parent)
    return o

import glob as _g
_FONTS = [f for f in (_g.glob("/usr/share/fonts/**/NotoSansCJK-Bold.ttc", recursive=True) + _g.glob("/usr/share/fonts/**/*CJK*.tt*", recursive=True)
          + _g.glob("C:/Windows/Fonts/meiryo.ttc") + _g.glob("/System/Library/Fonts/*Gothic*.tt*"))]
JPFONT = bpy.data.fonts.load(_FONTS[0]) if _FONTS else None

def tag(o, **kw):
    for k, v in kw.items(): o[k] = v

# ---------------- materials (PBR) ----------------
M = dict(
    body=mat("MAT_Body_PaintRed", (0.55, 0.02, 0.02), rough=0.32, coat=0.6),
    white=mat("MAT_Body_PaintWhite", (0.85, 0.85, 0.83), rough=0.35, coat=0.5),
    steel=mat("MAT_Steel_Brushed", (0.62, 0.62, 0.62), metal=1, rough=0.35),
    chrome=mat("MAT_Chrome", (0.9, 0.9, 0.9), metal=1, rough=0.08),
    black=mat("MAT_Plastic_Black", (0.015, 0.015, 0.015), rough=0.45),
    grey=mat("MAT_Plastic_Grey", (0.18, 0.18, 0.19), rough=0.5),
    glass=mat("MAT_Glass_Display", (0.95, 0.97, 1.0), rough=0.02, trans=1.0, ior=1.5),
    acryl=mat("MAT_Acrylic_Flap", (0.15, 0.15, 0.17), rough=0.1, trans=0.6, ior=1.49),
    backlit=mat("MAT_Backlight_Panel", (1, 1, 1), emit=(1.0, 0.98, 0.93), estr=2.5),
    led_blue=mat("MAT_LED_Cold", (0.0, 0.2, 1.0), emit=(0.05, 0.35, 1.0), estr=12),
    led_red=mat("MAT_LED_Hot", (1.0, 0.05, 0.0), emit=(1.0, 0.08, 0.02), estr=12),
    led_off=mat("MAT_LED_Off", (0.25, 0.25, 0.25), rough=0.2),
    soldout=mat("MAT_SoldOut_Lamp", (0.6, 0.0, 0.0), emit=(1, 0.05, 0.05), estr=0.0),
    lcd=mat("MAT_LCD_7seg", (0.02, 0.06, 0.02), emit=(0.25, 1.0, 0.35), estr=4.0),
    label_w=mat("MAT_Label_White", (0.95, 0.95, 0.95), rough=0.4),
    label_txt=mat("MAT_Label_Text", (0.02, 0.02, 0.02), rough=0.5),
    cold_txt=mat("MAT_Label_ColdBlue", (0.0, 0.25, 0.9), rough=0.4),
    hot_txt=mat("MAT_Label_HotRed", (0.9, 0.05, 0.02), rough=0.4),
    rubber=mat("MAT_Rubber", (0.02, 0.02, 0.02), rough=0.9),
    copper=mat("MAT_Copper", (0.85, 0.45, 0.25), metal=1, rough=0.3),
    insul=mat("MAT_Foam_Insulation", (0.8, 0.78, 0.6), rough=0.95),
    ic=mat("MAT_IC_Reader", (0.05, 0.05, 0.06), emit=(0.1, 0.6, 1.0), estr=1.5, rough=0.2),
)
CAN_COLORS = [(0.9, 0.1, 0.1), (0.05, 0.2, 0.7), (0.95, 0.75, 0.1), (0.1, 0.5, 0.2), (0.95, 0.95, 0.95),
              (0.35, 0.18, 0.08), (0.9, 0.45, 0.05), (0.05, 0.05, 0.05), (0.6, 0.8, 0.95), (0.5, 0.1, 0.5)]
CAN_M = [mat(f"MAT_Can_{i:02d}", c, metal=0.6, rough=0.25, coat=0.8) for i, c in enumerate(CAN_COLORS)]
PET_M = mat("MAT_PET_Bottle", (0.85, 0.95, 0.9), rough=0.05, trans=0.9, ior=1.57)

# ---------------- collections / hierarchy ----------------
C_ROOT = coll("VM_Asset")
C_CAB, C_DOOR, C_HMI, C_PAY, C_DISP = (coll(n, C_ROOT) for n in
    ("VM_Cabinet", "VM_Door", "VM_HMI", "VM_Payment", "VM_Dispense"))
C_INT, C_THERM, C_RIG = (coll(n, C_ROOT) for n in ("VM_Internals", "VM_Thermal", "VM_Rig"))

ROOT = empty("VM_Root", (0, 0, 0), C_RIG, kind="ARROWS", size=0.3)
tag(ROOT, asset_id="JPVM-2R20-001", asset_type="DrinkVendingMachine", manufacturer_ref="generic (Fuji/Sanden class)",
    selections=ROWS * COLS, rows=ROWS, cols=COLS, units="m", up_axis="Z", front_axis="-Y",
    rated_voltage="AC100V 50/60Hz", rated_power_W=600, refrigerant="R744(CO2)", schema="vm-dt/1.0")
# state controls (drive animation; mirrored by digital-twin runtime)
for k, v in dict(door_open=0.0, flap_open=0.0, coin_return=0.0, vend_drop=0.0, credit_yen=0,
                 state="IDLE", selected=0, cold_setpoint_C=5.0, hot_setpoint_C=55.0).items():
    ROOT[k] = v
for k in ("door_open", "flap_open", "coin_return", "vend_drop"):
    ui = ROOT.id_properties_ui(k); ui.update(min=0.0, max=1.0, soft_min=0.0, soft_max=1.0)

# ---------------- cabinet (fixed body) ----------------
t = 0.02
CAB = box("VM_Cabinet_Shell_Back", (W, t, H), (0, D - t / 2, H / 2), M["body"], C_CAB, 0.004, ROOT)
box("VM_Cabinet_Shell_SideL", (t, D, H), (-W / 2 + t / 2, D / 2, H / 2), M["body"], C_CAB, 0.006, ROOT)
box("VM_Cabinet_Shell_SideR", (t, D, H), (W / 2 - t / 2, D / 2, H / 2), M["body"], C_CAB, 0.006, ROOT)
box("VM_Cabinet_Shell_Top", (W, D, t), (0, D / 2, H - t / 2), M["body"], C_CAB, 0.006, ROOT)
box("VM_Cabinet_Base_Plinth", (W - 0.01, D - 0.02, 0.06), (0, D / 2, 0.03), M["black"], C_CAB, 0.003, ROOT)
for i, x in enumerate((-W / 2 + 0.08, W / 2 - 0.08)):
    for j, y in enumerate((0.08, D - 0.08)):
        cyl(f"VM_Cabinet_LevelFoot_{i}{j}", 0.025, 0.02, (x, y, 0.01), M["steel"], C_CAB, parent=ROOT)
box("VM_Cabinet_Liner_Insulation", (W - 0.08, 0.03, H - 0.2), (0, D - 0.05, H / 2 + 0.05), M["insul"], C_INT, parent=ROOT)

# ---------------- outer door (hinged on left, 0..100deg) ----------------
DOOR_PIV = empty("VM_Door_Hinge", (-W / 2, -0.005, 0.06), C_RIG, ROOT, kind="SINGLE_ARROW", size=0.2)
DOOR_PIV.rotation_mode = "XYZ"
dz0, dth = 0.06, 0.06              # door bottom, door thickness
def dbox(n, s, loc, m, bev=0.0, c=C_DOOR): return box(n, s, loc, m, c, bev, DOOR_PIV)
DH = H - 0.03 - dz0
dy = -dth / 2
# door frame pieces (leaving openings for display window, payment panel, dispense port)
win_x0, win_x1 = -W / 2 + 0.04, W / 2 - 0.26      # display window spans left 70%
win_z0, win_z1 = 0.80, 1.74
pay_x0, pay_x1 = W / 2 - 0.24, W / 2 - 0.03
dbox("VM_Door_Frame_Top", (W, dth, H - 0.0 - win_z1 - 0.02), (0, dy, (win_z1 + H - 0.02) / 2), M["body"], 0.008)
dbox("VM_Door_Frame_Left", (win_x0 + W / 2, dth, win_z1 - win_z0), (( -W / 2 + win_x0) / 2, dy, (win_z0 + win_z1) / 2), M["body"], 0.004)
dbox("VM_Door_Frame_Mid", (pay_x0 - win_x1, dth, win_z1 - win_z0), ((win_x1 + pay_x0) / 2, dy, (win_z0 + win_z1) / 2), M["body"], 0.004)
dbox("VM_Door_Frame_RightPanel", (W / 2 - pay_x0, dth, win_z1 - dz0), ((pay_x0 + W / 2) / 2, dy, (dz0 + win_z1) / 2), M["body"], 0.006)
dbox("VM_Door_Frame_LowerPanel", (pay_x0 + W / 2, dth, win_z0 - 0.38), ((-W / 2 + pay_x0) / 2, dy, (win_z0 + 0.38) / 2), M["white"], 0.004)
dbox("VM_Door_Frame_Kick", (pay_x0 + W / 2, dth, 0.12 - dz0), ((-W / 2 + pay_x0) / 2, dy, (dz0 + 0.12) / 2), M["body"], 0.004)
# brand header (backlit)
box("VM_Door_Header_Lightbox", (W - 0.06, 0.004, 0.05), (0, -dth - 0.002, 1.785), M["backlit"], C_DOOR, parent=DOOR_PIV)
text("VM_Door_Header_Text", "DRINK  つめた～い / あったか～い", (0, -dth - 0.0045, 1.785), 0.03, M["label_txt"], C_DOOR, DOOR_PIV)
# display window glass + chrome trim
dbox("VM_Door_DisplayGlass", (win_x1 - win_x0, 0.006, win_z1 - win_z0), ((win_x0 + win_x1) / 2, -dth + 0.004, (win_z0 + win_z1) / 2), M["glass"])
for n, s, l in (("T", (win_x1 - win_x0 + 0.02, 0.01, 0.01), ((win_x0 + win_x1) / 2, -dth - 0.002, win_z1)),
                ("B", (win_x1 - win_x0 + 0.02, 0.01, 0.01), ((win_x0 + win_x1) / 2, -dth - 0.002, win_z0)),
                ("L", (0.01, 0.01, win_z1 - win_z0), (win_x0, -dth - 0.002, (win_z0 + win_z1) / 2)),
                ("R", (0.01, 0.01, win_z1 - win_z0), (win_x1, -dth - 0.002, (win_z0 + win_z1) / 2))):
    dbox(f"VM_Door_WindowTrim_{n}", s, l, M["chrome"], 0.002)
# backlight panel behind dummies
dbox("VM_Door_DisplayBacklight", (win_x1 - win_x0, 0.005, win_z1 - win_z0), ((win_x0 + win_x1) / 2, -0.004, (win_z0 + win_z1) / 2), M["backlit"])

# ---------------- display rows: dummies, price labels, buttons, sold-out lamps ----------------
pitch = (win_x1 - win_x0) / COLS
row_z = {1: 1.43, 2: 1.06}          # dummy base heights
HMI = {}
for r in (1, 2):
    zb = row_z[r]
    dbox(f"VM_HMI_Shelf_R{r}", (win_x1 - win_x0, 0.10, 0.012), ((win_x0 + win_x1) / 2, -0.05, zb - 0.006), M["white"])
    for cidx in range(1, COLS + 1):
        x = win_x0 + pitch * (cidx - 0.5)
        hot = (r, cidx) in HOT_COLS
        sid = f"R{r}C{cidx:02d}"
        # product dummy: can (r1) or PET bottle (r2)
        if r == 1:
            o = cyl(f"VM_Display_Dummy_{sid}", 0.033, 0.122, (x, -0.045, zb + 0.061), CAN_M[(cidx + 3) % 10], C_DOOR, parent=DOOR_PIV)
            cyl(f"VM_Display_DummyLid_{sid}", 0.029, 0.004, (x, -0.045, zb + 0.124), M["steel"], C_DOOR, parent=DOOR_PIV)
        else:
            o = cyl(f"VM_Display_Dummy_{sid}", 0.034, 0.17, (x, -0.045, zb + 0.085), PET_M, C_DOOR, parent=DOOR_PIV)
            cyl(f"VM_Display_DummyWrap_{sid}", 0.0345, 0.07, (x, -0.045, zb + 0.07), CAN_M[cidx % 10], C_DOOR, parent=DOOR_PIV)
            cyl(f"VM_Display_DummyCap_{sid}", 0.015, 0.02, (x, -0.045, zb + 0.18), CAN_M[(cidx + 5) % 10], C_DOOR, parent=DOOR_PIV)
        tag(o, selection=sid, zone="HOT" if hot else "COLD", price_yen=PRICES[r - 1][cidx - 1])
        # price/label strip below glass row (on the shelf front lip, outside glass)
        lz = zb - 0.035
        dbox(f"VM_HMI_PriceLabel_{sid}", (pitch - 0.008, 0.004, 0.035), (x, -dth - 0.003, lz), M["label_w"])
        text(f"VM_HMI_PriceText_{sid}", f"¥{PRICES[r-1][cidx-1]}", (x, -dth - 0.0055, lz + 0.006), 0.016, M["label_txt"], C_DOOR, DOOR_PIV)
        text(f"VM_HMI_ZoneText_{sid}", "あったか～い" if hot else "つめた～い", (x, -dth - 0.0055, lz - 0.010), 0.0075,
             M["hot_txt"] if hot else M["cold_txt"], C_DOOR, DOOR_PIV)
        # push button (rigged: travels 3mm in +Y)
        bz = zb - 0.068
        bpiv = empty(f"VM_HMI_ButtonPivot_{sid}", (x, -dth, bz), C_RIG, DOOR_PIV, size=0.01)
        btn = box(f"VM_HMI_Button_{sid}", (pitch - 0.02, 0.012, 0.018), (x, -dth - 0.006, bz), M["led_red"] if hot else M["led_blue"], C_HMI, 0.003, bpiv)
        tag(btn, selection=sid, io_input=f"DI_SEL_{sid}", io_led=f"DO_LED_{sid}")
        # sold-out lamp (売切)
        so = box(f"VM_HMI_SoldOutLamp_{sid}", (0.022, 0.004, 0.009), (x, -dth - 0.003, bz - 0.019), M["soldout"], C_HMI, parent=DOOR_PIV)
        text(f"VM_HMI_SoldOutText_{sid}", "売切", (x, -dth - 0.0052, bz - 0.019), 0.007, M["white"], C_HMI, DOOR_PIV)
        tag(so, io_output=f"DO_SOLDOUT_{sid}")
        HMI[sid] = bpiv

# ---------------- payment panel (right column) ----------------
px = (pay_x0 + pay_x1) / 2
fy = -dth - 0.002
pp = lambda n, s, z, m, bev=0.002, dx=0.0: box(n, s, (px + dx, fy - s[1] / 2 + 0.002, z), m, C_PAY, bev, DOOR_PIV)
pp("VM_Pay_Bezel", (0.20, 0.006, 0.80), 1.28, M["grey"], 0.004)
lcd_b = pp("VM_Pay_LCD_Bezel", (0.14, 0.008, 0.05), 1.62, M["black"])
lcd = pp("VM_Pay_LCD_Credit", (0.12, 0.010, 0.032), 1.62, M["lcd"], 0.0)
tag(lcd, io_output="SER_LCD", function="credit/price display, 4-digit 7-seg")
text("VM_Pay_LCD_Text", "   0", (px, fy - 0.0105, 1.62), 0.024, M["black"], C_PAY, DOOR_PIV)
icr = pp("VM_Pay_ICReader", (0.12, 0.014, 0.09), 1.50, M["ic"], 0.006)
tag(icr, module="e-money R/W (Suica/PASMO/iD/QUICPay) NFC-F/A/B", bus="RS-232C/MDB-cashless")
text("VM_Pay_ICReader_Text", "IC ))) タッチ", (px, fy - 0.0145, 1.50), 0.014, M["white"], C_PAY, DOOR_PIV)
pp("VM_Pay_CoinSlot_Bezel", (0.07, 0.012, 0.07), 1.38, M["chrome"], 0.004)
pp("VM_Pay_CoinSlot", (0.006, 0.016, 0.030), 1.38, M["black"], 0.0)
text("VM_Pay_CoinText", "硬貨 10 50 100 500", (px, fy - 0.009, 1.335), 0.008, M["white"], C_PAY, DOOR_PIV)
pp("VM_Pay_BillAcceptor_Bezel", (0.13, 0.02, 0.06), 1.25, M["black"], 0.005)
pp("VM_Pay_BillSlot", (0.085, 0.024, 0.004), 1.25, M["chrome"], 0.0)
text("VM_Pay_BillText", "千円札", (px, fy - 0.0215, 1.21), 0.010, M["white"], C_PAY, DOOR_PIV)
# coin return lever (rigged: rotates about X, 25deg)
LEV_P = empty("VM_Pay_ReturnLever_Pivot", (px, fy - 0.01, 1.14), C_RIG, DOOR_PIV, size=0.02)
LEV_P.rotation_mode = "XYZ"
pp("VM_Pay_ReturnLever_Base", (0.08, 0.008, 0.05), 1.14, M["chrome"], 0.003)
lev = box("VM_Pay_ReturnLever", (0.06, 0.018, 0.016), (px, fy - 0.017, 1.13), M["grey"], C_PAY, 0.004, LEV_P)
text("VM_Pay_ReturnText", "おつり レバー", (px, fy - 0.0062, 1.105), 0.008, M["white"], C_PAY, DOOR_PIV)
# change return cup (coin return)
pp("VM_Pay_ChangeCup_Frame", (0.11, 0.01, 0.08), 0.95, M["chrome"], 0.004)
pp("VM_Pay_ChangeCup_Cavity", (0.09, 0.012, 0.06), 0.95, M["black"], 0.0)
CR_P = empty("VM_Pay_ChangeFlap_Pivot", (px, fy - 0.012, 0.98), C_RIG, DOOR_PIV, size=0.02)
CR_P.rotation_mode = "XYZ"
box("VM_Pay_ChangeFlap", (0.088, 0.004, 0.058), (px, fy - 0.014, 0.951), M["acryl"], C_PAY, 0.001, CR_P)
text("VM_Pay_ChangeText", "おつり", (px, fy - 0.007, 0.90), 0.012, M["white"], C_PAY, DOOR_PIV)
# lock & key cylinder (T-handle)
cyl("VM_Door_TLock", 0.018, 0.02, (px, fy - 0.01, 0.62), M["chrome"], C_DOOR, rot=(math.pi / 2, 0, 0), parent=DOOR_PIV)
# recycle notice plate
pp("VM_Door_InfoPlate", (0.16, 0.004, 0.10), 0.45, M["label_w"], 0.002)
text("VM_Door_InfoText", "空き缶は\nリサイクル\nボックスへ", (px, fy - 0.004, 0.45), 0.013, M["label_txt"], C_DOOR, DOOR_PIV)

# ---------------- dispense port (取出口) with push-in flap ----------------
dp_w, dp_z0, dp_z1 = 0.56, 0.12, 0.38
dp_x = (-W / 2 + pay_x0) / 2
for n, s, l in (("L", ((pay_x0 + W / 2 - dp_w) / 2, dth, dp_z1 - dp_z0), (-W / 2 + (pay_x0 + W / 2 - dp_w) / 4, dy, (dp_z0 + dp_z1) / 2)),
                ("R", ((pay_x0 + W / 2 - dp_w) / 2, dth, dp_z1 - dp_z0), (pay_x0 - (pay_x0 + W / 2 - dp_w) / 4, dy, (dp_z0 + dp_z1) / 2))):
    dbox(f"VM_Dispense_Frame_{n}", s, l, M["white"], 0.003)
box("VM_Dispense_Bin", (dp_w, 0.20, 0.012), (dp_x, 0.07, dp_z0 + 0.006), M["rubber"], C_DISP, 0.0, DOOR_PIV)
box("VM_Dispense_BinBack", (dp_w, 0.012, dp_z1 - dp_z0), (dp_x, 0.17, (dp_z0 + dp_z1) / 2), M["grey"], C_DISP, 0.0, DOOR_PIV)
box("VM_Dispense_Chute", (dp_w, 0.30, 0.012), (dp_x, 0.29, dp_z1 + 0.03), M["steel"], C_DISP, 0.0, DOOR_PIV).rotation_euler.x = math.radians(-20)
box("VM_Dispense_PortTrim", (dp_w + 0.02, 0.012, 0.012), (dp_x, -dth - 0.004, dp_z1 + 0.006), M["chrome"], C_DISP, 0.002, DOOR_PIV)
text("VM_Dispense_Text", "取出口  PUSH", (dp_x, -dth - 0.001, dp_z1 + 0.035), 0.022, M["label_txt"], C_DISP, DOOR_PIV)
FLAP_P = empty("VM_Dispense_Flap_Hinge", (dp_x, -dth + 0.004, dp_z1), C_RIG, DOOR_PIV, kind="SINGLE_ARROW", size=0.08)
FLAP_P.rotation_mode = "XYZ"
flap = box("VM_Dispense_Flap", (dp_w - 0.006, 0.006, dp_z1 - dp_z0 - 0.006), (dp_x, -dth + 0.004, (dp_z0 + dp_z1) / 2), M["acryl"], C_DISP, 0.002, FLAP_P)
tag(flap, io_input="DI_FLAP_SW", function="theft-prevention push-in flap, gravity return")
# product in transit (animated drop)
PROD = cyl("VM_Dispense_ProductInTransit", 0.033, 0.122, (dp_x, 0.10, 0.9), CAN_M[0], C_DISP, rot=(0, math.pi / 2, 0), parent=ROOT)

# ---------------- internals: inner door, columns (serpentine racks), vend motors ----------------
box("VM_Internal_InnerDoor_Insulated", (W - 0.06, 0.05, 0.08), (0, 0.04, 0.48), M["insul"], C_INT, parent=ROOT)
box("VM_Internal_ZoneDivider", (0.008, D - 0.12, 1.10), (W * 0.18, 0.37, 1.0), M["insul"], C_THERM, parent=ROOT)
NCOL = 10
cw = (W - 0.10) / NCOL
for i in range(NCOL):
    x = -W / 2 + 0.05 + cw * (i + 0.5)
    hot = i >= 7
    zone = "HOT" if hot else "COLD"
    rack = box(f"VM_Internal_Column_{i+1:02d}", (cw - 0.01, 0.42, 1.05), (x, 0.36, 1.03), M["steel"], C_INT, 0.002, ROOT)
    tag(rack, zone=zone, capacity_cans=34, column=i + 1)
    m = cyl(f"VM_Internal_VendMotor_{i+1:02d}", 0.02, 0.05, (x, 0.12, 0.47), M["black"], C_INT, rot=(0, math.pi / 2, 0), parent=ROOT)
    tag(m, part="DC24V vend motor + cam switch", io_output=f"DO_VEND_M{i+1:02d}", io_input=f"DI_CAM_{i+1:02d}")
    s = box(f"VM_Internal_SoldOutSwitch_{i+1:02d}", (0.02, 0.02, 0.012), (x, 0.58, 0.55), M["black"], C_INT, parent=ROOT)
    tag(s, io_input=f"DI_EMPTY_{i+1:02d}")
    for k in range(6):   # stacked stock visible inside rack
        cyl(f"VM_Internal_Stock_{i+1:02d}_{k}", 0.033, cw - 0.02, (x, 0.24 + (k % 2) * 0.24, 0.62 + k * 0.13), CAN_M[i % 10], C_INT, rot=(0, math.pi / 2, 0), verts=16, parent=ROOT)
# controller / payment boxes
box("VM_Internal_MainController", (0.18, 0.05, 0.25), (W / 2 - 0.15, 0.30, 1.5), M["grey"], C_INT, 0.004, ROOT)
box("VM_Internal_CoinMech", (0.14, 0.12, 0.22), (W / 2 - 0.13, 0.10, 1.30), M["grey"], C_PAY, 0.004, ROOT)
box("VM_Internal_BillValidator", (0.12, 0.25, 0.10), (W / 2 - 0.13, 0.16, 1.20), M["black"], C_PAY, 0.004, ROOT)
box("VM_Internal_PSU", (0.15, 0.10, 0.06), (W / 2 - 0.15, 0.45, 1.75), M["steel"], C_INT, 0.003, ROOT)
# thermal: compressor, condenser, evaporator, heater
cyl("VM_Thermal_Compressor", 0.09, 0.22, (-0.15, 0.45, 0.18), M["black"], C_THERM, parent=ROOT)
box("VM_Thermal_Condenser", (0.45, 0.05, 0.22), (0.15, 0.62, 0.20), M["copper"], C_THERM, parent=ROOT)
cyl("VM_Thermal_CondenserFan", 0.09, 0.03, (0.15, 0.56, 0.20), M["grey"], C_THERM, rot=(math.pi / 2, 0, 0), parent=ROOT)
box("VM_Thermal_Evaporator_Cold", (0.5, 0.04, 0.14), (-0.15, 0.55, 0.45), M["copper"], C_THERM, parent=ROOT)
box("VM_Thermal_Heater_Hot", (0.22, 0.04, 0.14), (0.38, 0.55, 0.45), M["hot_txt"], C_THERM, parent=ROOT)
for n, x in (("Cold", -0.15), ("Hot", 0.38)):
    cyl(f"VM_Thermal_CircFan_{n}", 0.06, 0.025, (x, 0.50, 0.45), M["grey"], C_THERM, rot=(math.pi / 2, 0, 0), parent=ROOT)
    box(f"VM_Thermal_TempSensor_{n}", (0.015, 0.015, 0.03), (x, 0.30, 0.8), M["black"], C_THERM, parent=ROOT)

# ---------------- drivers: ROOT custom props -> rig ----------------
def drv(obj, path, idx, expr, var="v", prop="door_open", target=ROOT):
    fc = obj.driver_add(path, idx); d = fc.driver; d.type = "SCRIPTED"
    v = d.variables.new(); v.name = var; v.type = "SINGLE_PROP"
    v.targets[0].id = target; v.targets[0].data_path = f'["{prop}"]'
    d.expression = expr
drv(DOOR_PIV, "rotation_euler", 2, "-v*1.75", prop="door_open")         # 0..100 deg
drv(FLAP_P, "rotation_euler", 0, "-v*1.31", prop="flap_open")           # pushes inward 75 deg
drv(LEV_P, "rotation_euler", 0, "v*0.44", prop="coin_return")           # 25 deg
drv(CR_P, "rotation_euler", 0, "-v*0.9", prop="coin_return")
drv(PROD, "location", 2, "0.9 - v*0.72", prop="vend_drop")              # falls into bin
drv(PROD, "location", 1, "0.10 - v*0.02", prop="vend_drop")
# sold-out lamp emission driven by property on a demo selection
ROOT["soldout_R1C01"] = 1.0
so_node = M["soldout"].node_tree.nodes["Principled BSDF"].inputs["Emission Strength"]
fc = so_node.driver_add("default_value"); fc.driver.type = "SCRIPTED"
v = fc.driver.variables.new(); v.name = "v"; v.targets[0].id = ROOT; v.targets[0].data_path = '["soldout_R1C01"]'
fc.driver.expression = "v*8"

# ---------------- animation: one vend cycle (frames 1..240) ----------------
scn.frame_start, scn.frame_end, scn.render.fps = 1, 240, 24
def key(prop, f, v):
    ROOT[prop] = v; ROOT.keyframe_insert(f'["{prop}"]', frame=f)
for f, v in ((1, 0), (60, 0), (90, 1), (100, 1)): key("vend_drop", f, v)
for f, v in ((1, 0), (110, 0), (130, 1), (170, 1), (190, 0)): key("flap_open", f, v)
for f, v in ((1, 0), (195, 0), (205, 1), (215, 0)): key("coin_return", f, v)
for f, v in ((1, 0), (240, 0)): key("door_open", f, v)
for f, v in ((1, 0), (20, 0), (30, 1), (240, 1)): key("credit_yen", f, v * 500)
# button press R1C04 at frame 45
bp = HMI["R1C04"]
for f, y in ((40, -dth), (45, -dth + 0.003), (50, -dth)):
    bp.location.y = y; bp.keyframe_insert("location", index=1, frame=f)
ROOT["vend_drop"] = ROOT["flap_open"] = ROOT["coin_return"] = 0.0

# ---------------- scene: lighting, camera, render ----------------
bpy.ops.mesh.primitive_plane_add(size=12, location=(0, 0, 0))
fl = bpy.context.active_object; fl.name = "ENV_Floor"
fl.data.materials.append(mat("MAT_Env_Concrete", (0.35, 0.34, 0.32), rough=0.85))
bpy.ops.mesh.primitive_plane_add(size=12, location=(0, 1.6, 3), rotation=(math.pi / 2, 0, 0))
wl = bpy.context.active_object; wl.name = "ENV_Wall"; wl.data.materials.append(mat("MAT_Env_Wall", (0.25, 0.27, 0.3), rough=0.9))
world = bpy.data.worlds.new("World"); scn.world = world; world.use_nodes = True
world.node_tree.nodes["Background"].inputs[0].default_value = (0.08, 0.09, 0.12, 1)
world.node_tree.nodes["Background"].inputs[1].default_value = 0.6
def light(n, kind, loc, rot, e, size=1.0):
    L = bpy.data.lights.new(n, kind); L.energy = e
    if kind == "AREA": L.size = size
    o = bpy.data.objects.new(n, L); o.location = loc; o.rotation_euler = rot; scn.collection.objects.link(o)
light("ENV_Key", "AREA", (-2.2, -2.8, 2.8), (math.radians(60), 0, math.radians(-38)), 900, 2.0)
light("ENV_Fill", "AREA", (2.5, -2.2, 1.4), (math.radians(75), 0, math.radians(48)), 250, 2.0)
light("ENV_Rim", "AREA", (0.5, 1.2, 3.2), (math.radians(-30), 0, 0), 300, 1.5)
cam = bpy.data.objects.new("ENV_Camera", bpy.data.cameras.new("ENV_Camera")); scn.collection.objects.link(cam)
cam.data.lens = 40; scn.camera = cam
def aim(loc, tgt=(0, 0, 0.95)):
    cam.location = loc
    cam.rotation_euler = (Vector(tgt) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
r = scn.render; r.engine = "CYCLES"; scn.cycles.device = "CPU"
scn.cycles.samples = int(os.environ.get("VM_SAMPLES", 48)); scn.cycles.use_denoising = True
scn.view_settings.exposure = -1.3
r.resolution_x, r.resolution_y = 900, 1200
scn.view_settings.view_transform = "AgX" if "AgX" in [i.identifier for i in scn.view_settings.bl_rna.properties["view_transform"].enum_items] else "Filmic"

bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT, "vending_machine.blend"))

# ---------------- export glTF (asset only) ----------------
for o in bpy.data.objects: o.select_set(o.name.startswith("VM_"))
bpy.ops.export_scene.gltf(filepath=os.path.join(OUT, "vending_machine.glb"), export_format="GLB",
                          use_selection=True, export_extras=True, export_apply=True, export_animations=False)
meta = {k: ROOT[k] for k in ROOT.keys() if not k.startswith("_") and isinstance(ROOT[k], (int, float, str))}
meta["objects"] = sorted(o.name for o in bpy.data.objects if o.name.startswith("VM_"))
meta["io_map"] = {o.name: {k: o[k] for k in o.keys() if k.startswith("io_")} for o in bpy.data.objects if any(k.startswith("io_") for k in o.keys())}
json.dump(meta, open(os.path.join(OUT, "vending_machine_metadata.json"), "w"), ensure_ascii=False, indent=1)

# ---------------- previews ----------------
if os.environ.get("VM_RENDER", "1") == "1":
    aim((1.5, -3.2, 1.35)); r.filepath = os.path.join(OUT, "preview_front.png"); bpy.ops.render.render(write_still=True)
    ROOT.animation_data_clear()   # preview pose only (file already saved with animation)
    ROOT["door_open"] = 0.55; ROOT["flap_open"] = 1.0; ROOT["vend_drop"] = 1.0
    DOOR_PIV.rotation_euler.z = -0.55 * 1.75; FLAP_P.rotation_euler.x = -1.31; PROD.location.z = 0.18
    bpy.context.view_layer.update()
    aim((2.0, -2.6, 1.6), (0.0, 0.2, 0.9)); r.filepath = os.path.join(OUT, "preview_open.png"); bpy.ops.render.render(write_still=True)
print("VM BUILD OK ->", OUT)
