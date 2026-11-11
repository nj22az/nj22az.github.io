"""Chief Engineer's Suite - Blender model (bpy). Units metres. Origin = aft/corridor corner of suite at FFL.
X = forward, Y = from corridor bulkhead towards ship side (STBD), Z = up (0 = finished floor level)."""
import bpy, math, sys
sys.path.insert(0, "/work")
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.unit_settings.system = "METRIC"; sc.unit_settings.scale_length = 1.0
LX, LY, CH, DK = 7.2, 5.0, 2.30, 2.85

MATS = {}
def mat(name, rgba, rough=0.6, metal=0.0, emit=None):
    if name in MATS: return MATS[name]
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = rgba; b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    if rgba[3] < 1: b.inputs["Alpha"].default_value = rgba[3]
    if emit:
        b.inputs["Emission Color"].default_value = emit; b.inputs["Emission Strength"].default_value = 5
    m.diffuse_color = rgba; MATS[name] = m; return m

M = dict(steel=mat("M_Steel_Painted", (0.55, 0.58, 0.6, 1), 0.5, 0.6),
         panel=mat("M_Joiner_Panel", (0.92, 0.91, 0.87, 1), 0.7), floor=mat("M_Vinyl_Floor", (0.35, 0.3, 0.25, 1), 0.5),
         ceiling=mat("M_Ceiling_Panel", (0.96, 0.96, 0.96, 1)), wood=mat("M_Wood_Veneer", (0.45, 0.28, 0.15, 1), 0.4),
         fabric=mat("M_Fabric_Blue", (0.12, 0.2, 0.4, 1), 0.9), glass=mat("M_Glass", (0.6, 0.8, 0.9, 0.3), 0.05),
         white=mat("M_Sanitary_Ceramic", (0.98, 0.98, 0.98, 1), 0.15), tile=mat("M_Wet_Tile", (0.8, 0.85, 0.88, 1), 0.3),
         chrome=mat("M_Chrome", (0.9, 0.9, 0.9, 1), 0.1, 1.0), insul=mat("M_Mineral_Wool", (0.85, 0.75, 0.4, 1), 1.0),
         CW=mat("M_Pipe_CW_Blue", (0.0, 0.3, 0.8, 1), 0.4, 0.5), HW=mat("M_Pipe_HW_Orange", (0.95, 0.45, 0.05, 1), 0.4, 0.5),
         GW=mat("M_Pipe_GreyWater_Green", (0.15, 0.6, 0.15, 1)), BW=mat("M_Pipe_BlackWater_Brown", (0.4, 0.25, 0.1, 1)),
         cable=mat("M_Cable_LSZH_Red", (0.8, 0.05, 0.05, 1)), emcable=mat("M_Cable_EM_Magenta", (0.8, 0.0, 0.8, 1)),
         tray=mat("M_Cable_Tray_Galv", (0.7, 0.7, 0.72, 1), 0.4, 0.8), duct=mat("M_Duct_Galv", (0.75, 0.75, 0.78, 1), 0.35, 0.9),
         device=mat("M_Elec_Device_White", (0.95, 0.95, 0.95, 1), 0.4), lamp=mat("M_LED_Emissive", (1, 1, 0.95, 1), 0.3, 0, (1, 0.97, 0.9, 1)),
         red=mat("M_Alarm_Red", (0.85, 0.05, 0.05, 1), 0.4), db=mat("M_DB_Grey", (0.6, 0.62, 0.65, 1), 0.4, 0.3))

def coll(name, parent=None):
    c = bpy.data.collections.new(name); (parent or sc.collection).children.link(c); return c

def link(o, c):
    for uc in o.users_collection: uc.objects.unlink(o)
    c.objects.link(o); return o

def empty(name, c, loc=(0, 0, 0), parent=None):
    e = bpy.data.objects.new(name, None); e.location = loc; c.objects.link(e)
    if parent: e.parent = parent
    return e

def box(name, c, x0, y0, z0, x1, y1, z1, m, parent=None, pivot="min"):
    """Axis-aligned box from min to max corners. Origin at pivot ('min' corner, 'base' = bottom centre)."""
    import bmesh
    dx, dy, dz = x1 - x0, y1 - y0, z1 - z0
    me = bpy.data.meshes.new(name); bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        v.co.x = (v.co.x + 0.5) * dx; v.co.y = (v.co.y + 0.5) * dy; v.co.z = (v.co.z + 0.5) * dz
        if pivot == "base": v.co.x -= dx / 2; v.co.y -= dy / 2
    bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(name, me); c.objects.link(o)
    o.location = (x0 + (dx / 2 if pivot == "base" else 0), y0 + (dy / 2 if pivot == "base" else 0), z0)
    me.materials.append(m)
    if parent: o.parent = parent
    return o

def cyl(name, c, x, y, z, r, h, m, parent=None, axis="Z", verts=24):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=r, depth=h, location=(0, 0, 0))
    o = bpy.context.active_object; o.name = name; o.data.name = name
    bpy.ops.transform.translate(value=(0, 0, h / 2)); bpy.ops.object.transform_apply(location=True)
    o.data.vertices.foreach_set  # noqa
    for v in o.data.vertices: v.co.z -= 0  # origin at base
    if axis == "X": o.rotation_euler = (0, math.radians(90), 0)
    if axis == "Y": o.rotation_euler = (math.radians(-90), 0, 0)
    o.location = (x, y, z); o.data.materials.append(m); link(o, c)
    if parent: o.parent = parent
    return o

def ortho(pts):
    out = [pts[0]]
    for b in pts[1:]:
        a = out[-1]
        if abs(a[0] - b[0]) > 1e-6 and abs(a[1] - b[1]) > 1e-6: out.append((b[0], a[1], a[2]))
        out.append(b)
    return out

def run(name, c, pts, radius, m, parent=None, orth=False):
    if orth: pts = ortho(pts)
    """Pipe / cable run as a bevelled poly curve, converted to mesh (simulator friendly)."""
    cu = bpy.data.curves.new(name, "CURVE"); cu.dimensions = "3D"
    sp = cu.splines.new("POLY"); sp.points.add(len(pts) - 1)
    for p, co in zip(sp.points, pts): p.co = (*co, 1)
    cu.bevel_depth = radius; cu.bevel_resolution = 2; cu.use_fill_caps = True
    o = bpy.data.objects.new(name, cu); c.objects.link(o); o.data.materials.append(m)
    bpy.context.view_layer.objects.active = o
    for ob in bpy.context.selected_objects: ob.select_set(False)
    o.select_set(True); bpy.ops.object.convert(target="MESH")
    o = bpy.context.active_object; o.name = name
    o.data.name = name
    if parent: o.parent = parent
    # origin at first point (logical start = take-off)
    sc.cursor.location = pts[0]; bpy.ops.object.origin_set(type="ORIGIN_CURSOR"); sc.cursor.location = (0, 0, 0)
    return o

root_c = coll("CE_Suite")
ROOT = empty("CE_Suite_ROOT", root_c)
C = {k: coll(k, root_c) for k in ["01_Structure", "02_Joinery_Bulkheads", "03_Doors_Windows", "04_Furniture",
                                   "05_Sanitary", "06_Electrical", "07_Plumbing", "08_HVAC", "09_Lighting"]}
G = {k: empty(f"GRP_{k[3:]}", C[k], parent=ROOT) for k in C}

# ---- 01 Structure (steel) ----
box("STR_Deck_12mm", C["01_Structure"], -0.3, -0.3, -0.072, LX + 0.3, LY + 0.3, -0.06, M["steel"], G["01_Structure"])
box("STR_Deck_Above_12mm", C["01_Structure"], -0.3, -0.3, DK - 0.06, LX + 0.3, LY + 0.3, DK - 0.048, M["steel"], G["01_Structure"])
box("STR_Shell_STBD_8mm", C["01_Structure"], -0.3, LY + 0.242, -0.072, LX + 0.3, LY + 0.25, DK - 0.048, M["steel"], G["01_Structure"])
for i in range(11):
    fx = 0.1 + i * 0.7
    if fx > LX: break
    box(f"STR_Frame_Fr{120 + i}_HP160", C["01_Structure"], fx - 0.005, LY + 0.08, -0.06, fx + 0.005, LY + 0.242, DK - 0.06, M["steel"], G["01_Structure"])
for i, yy in enumerate([0.7, 1.4, 2.1, 2.8, 3.5, 4.2]):
    box(f"STR_Deck_Beam_{i + 1}_T300", C["01_Structure"], -0.3, yy - 0.005, DK - 0.36, LX + 0.3, yy + 0.005, DK - 0.06, M["steel"], G["01_Structure"])
box("STR_Floating_Floor_60mm", C["01_Structure"], 0, 0, -0.06, LX, LY, 0, M["floor"], G["01_Structure"])
box("INS_Shell_Lining_75mm_MW", C["01_Structure"], -0.1, LY + 0.08, 0, LX + 0.1, LY + 0.155, DK - 0.06, M["insul"], G["01_Structure"])

# ---- 02 Joinery bulkheads (B-15 50 mm) with openings ----
J = C["02_Joinery_Bulkheads"]; gJ = G["02_Joinery_Bulkheads"]
def wall_x(name, y, xs, x_end, openings, h=CH, t=0.05):
    """Wall running along X at line y; openings = [(x0, x1, head_h)]"""
    cur = xs; k = 0
    for a, b, hh in sorted(openings):
        if a > cur: box(f"{name}_{k}", J, cur, y - t / 2, 0, a, y + t / 2, h, M["panel"], gJ); k += 1
        box(f"{name}_{k}_Header", J, a, y - t / 2, hh, b, y + t / 2, h, M["panel"], gJ); k += 1; cur = b
    if cur < x_end: box(f"{name}_{k}", J, cur, y - t / 2, 0, x_end, y + t / 2, h, M["panel"], gJ)
def wall_y(name, x, ys, y_end, openings, h=CH, t=0.05):
    cur = ys; k = 0
    for a, b, hh in sorted(openings):
        if a > cur: box(f"{name}_{k}", J, x - t / 2, cur, 0, x + t / 2, a, h, M["panel"], gJ); k += 1
        box(f"{name}_{k}_Header", J, x - t / 2, a, hh, x + t / 2, b, h, M["panel"], gJ); k += 1; cur = b
    if cur < y_end: box(f"{name}_{k}", J, x - t / 2, cur, 0, x + t / 2, y_end, h, M["panel"], gJ)
wall_x("BHD_Corridor_B15", -0.03, -0.1, LX + 0.1, [(1.0, 1.8, 2.0)], t=0.06)
wall_y("BHD_Aft_B15", -0.05, 0, LY, [])
wall_y("BHD_Fwd_B15", LX + 0.05, 0, LY, [])
wall_y("BHD_DayRoom_Bedroom", 3.6, 0, LY, [(2.6, 3.4, 2.0)])
wall_x("BHD_Bedroom_Bath", 1.9, 3.6, LX, [(4.0, 4.7, 2.0), (5.6, 6.3, 2.0)])
wall_y("BHD_Store_Bath", 5.0, 0, 1.9, [])
# lining on ship side with window openings
wall_x("LIN_ShipSide", LY + 0.03, 0, LX, [(0.8, 2.0, 0.9), (2.2, 3.4, 0.9), (5.0, 6.2, 0.9)], t=0.03)
for i, (a, b) in enumerate([(0.8, 2.0), (2.2, 3.4), (5.0, 6.2)]):
    box(f"LIN_Window_Sill_{i + 1}", J, a, LY, 0, b, LY + 0.05, 0.9, M["panel"], gJ)
box("CEIL_Panels_Dayroom", J, 0, 0, CH, 3.575, LY, CH + 0.025, M["ceiling"], gJ)
box("CEIL_Panels_Bedroom_Bath", J, 3.625, 0, CH, LX, LY, CH + 0.025, M["ceiling"], gJ)
box("BATH_Wet_Floor_Tray", J, 5.025, 0, 0, LX, 1.875, 0.01, M["tile"], gJ)
box("BATH_Pipe_Duct_Casing", J, 7.0, 0, 0, LX, 0.5, CH, M["tile"], gJ)

# ---- 03 Doors (origin at hinge -> rotate Z to open) + windows ----
D = C["03_Doors_Windows"]; gD = G["03_Doors_Windows"]
def door(name, hx, hy, w, axis, sign, open_deg):
    piv = empty(f"{name}_HINGE", D, (hx, hy, 0), gD)
    if axis == "x": leaf = box(name, D, 0, -0.02, 0, w, 0.02, 2.0, M["wood"], piv)
    else: leaf = box(name, D, -0.02, 0, 0, 0.02, w, 2.0, M["wood"], piv)
    hx2, hy2 = (w - 0.07, 0.05) if axis == "x" else (0.05, w - 0.07)
    cyl(f"{name}_Handle", D, hx2, hy2 * (1 if axis == "x" else 1), 1.0, 0.012, 0.12, M["chrome"], leaf, "Z" if False else "Y")
    # open/close animation frames 1-48-96
    piv.rotation_euler = (0, 0, 0); piv.keyframe_insert("rotation_euler", frame=1)
    piv.rotation_euler = (0, 0, math.radians(sign * open_deg)); piv.keyframe_insert("rotation_euler", frame=48)
    piv.rotation_euler = (0, 0, 0); piv.keyframe_insert("rotation_euler", frame=96)
    piv["door_type"] = name; piv["open_angle_deg"] = open_deg
    return piv
door("DOOR_D1_Entrance_B15_800", 1.0, 0.0, 0.8, "x", 1, 90)
door("DOOR_D2_Bedroom_700", 3.6, 2.6, 0.8, "y", -1, 90)
door("DOOR_D3_Bath_700", 5.6, 1.9, 0.7, "x", -1, 90)
door("DOOR_D4_Store_700", 4.0, 1.9, 0.7, "x", -1, 90)
box("DOOR_D1_Closer", D, 1.55, 0.03, 2.02, 1.75, 0.08, 2.07, M["chrome"], gD)
for i, (a, b) in enumerate([(0.8, 2.0), (2.2, 3.4), (5.0, 6.2)]):
    box(f"WIN_{i + 1}_Frame_1200x900", D, a, LY + 0.05, 0.9, b, LY + 0.242, 1.8, M["steel"], gD).display_type = "WIRE"
    box(f"WIN_{i + 1}_Glass_Toughened", D, a + 0.04, LY + 0.2, 0.94, b - 0.04, LY + 0.215, 1.76, M["glass"], gD)

# ---- 04 Furniture ----
F = C["04_Furniture"]; gF = G["04_Furniture"]
box("FUR_Desk", F, 0.3, 4.3, 0.72, 2.1, 5.0, 0.76, M["wood"], gF)
box("FUR_Desk_Pedestal", F, 1.65, 4.35, 0, 2.08, 4.98, 0.72, M["wood"], gF)
box("FUR_Chair_Seat", F, 1.0, 3.7, 0.45, 1.5, 4.2, 0.5, M["fabric"], gF); box("FUR_Chair_Back", F, 1.0, 3.65, 0.5, 1.5, 3.7, 0.95, M["fabric"], gF)
cyl("FUR_Chair_Column", F, 1.25, 3.95, 0, 0.03, 0.45, M["chrome"], gF)
box("FUR_Sofa_Base", F, 0.1, 1.0, 0, 0.9, 3.0, 0.42, M["fabric"], gF); box("FUR_Sofa_Back", F, 0.0, 1.0, 0.42, 0.25, 3.0, 0.85, M["fabric"], gF)
box("FUR_Coffee_Table", F, 1.2, 1.5, 0.45, 2.0, 2.3, 0.48, M["wood"], gF); cyl("FUR_Coffee_Table_Leg", F, 1.6, 1.9, 0, 0.04, 0.45, M["chrome"], gF)
box("FUR_Fridge_Mini", F, 2.9, 0.1, 0, 3.5, 0.7, 0.85, M["white"], gF)
box("FUR_Bookcase_Files", F, 2.2, 0.1, 0, 2.85, 0.5, 2.0, M["wood"], gF)
box("FUR_Bed_Frame_2000x1400", F, 5.0, 3.5, 0, 7.0, 4.9, 0.35, M["wood"], gF)
box("FUR_Bed_Mattress", F, 5.03, 3.53, 0.35, 6.97, 4.87, 0.55, M["white"], gF)
box("FUR_Bed_Headboard", F, 6.98, 3.5, 0, 7.15, 4.9, 1.0, M["wood"], gF)
box("FUR_Bedside_Table", F, 6.55, 4.9, 0, 7.15, 4.98, 0.0001 + 0.5, M["wood"], gF) if False else None
box("FUR_Wardrobe", F, 3.7, 4.35, 0, 4.9, 4.95, 2.1, M["wood"], gF)
box("FUR_Store_Locker", F, 3.7, 0.1, 0, 4.9, 0.7, 2.1, M["wood"], gF)
for i, (a, b) in enumerate([(0.8, 2.0), (2.2, 3.4), (5.0, 6.2)]):
    box(f"FUR_Curtain_{i + 1}", F, a - 0.1, LY - 0.06, 0.8, a + 0.1, LY - 0.02, 2.25, M["fabric"], gF)

# ---- 05 Sanitary ----
S = C["05_Sanitary"]; gS = G["05_Sanitary"]
box("SAN_Shower_Tray_900", S, 6.25, 0.05, 0, 7.0, 0.95, 0.04, M["white"], gS)
box("SAN_Shower_Screen_Glass", S, 6.25, 0.93, 0.04, 7.0, 0.95, 2.0, M["glass"], gS)
box("SAN_Shower_Screen_Side", S, 6.23, 0.05, 0.04, 6.25, 0.95, 2.0, M["glass"], gS)
cyl("SAN_Shower_Mixer_Thermostatic", S, 6.98, 0.5, 1.0, 0.04, 0.03, M["chrome"], gS, "X")
cyl("SAN_Shower_Head", S, 6.7, 0.5, 2.0, 0.09, 0.02, M["chrome"], gS)
run("SAN_Shower_Riser", S, [(6.98, 0.5, 1.0), (6.98, 0.5, 2.05), (6.7, 0.5, 2.05)], 0.01, M["chrome"], gS)
box("SAN_WC_Bowl", S, 5.15, 0.25, 0, 5.55, 0.75, 0.4, M["white"], gS)
box("SAN_WC_Cistern_Concealed_Panel", S, 5.1, 0.03, 0, 5.6, 0.25, 1.1, M["tile"], gS)
box("SAN_Basin", S, 5.9, 1.35, 0.72, 6.45, 1.85, 0.85, M["white"], gS)
box("SAN_Vanity_Unit", S, 5.9, 1.4, 0, 6.45, 1.85, 0.72, M["wood"], gS)
cyl("SAN_Basin_Mixer", S, 6.17, 1.78, 0.85, 0.02, 0.18, M["chrome"], gS)
box("SAN_Mirror_Cabinet", S, 5.9, 1.82, 1.2, 6.45, 1.87, 1.9, M["glass"], gS)
cyl("SAN_Floor_Gully_FG1", S, 5.75, 1.0, 0.0, 0.07, 0.012, M["chrome"], gS)

# ---- 06 Electrical ----
E = C["06_Electrical"]; gE = G["06_Electrical"]
box("ELE_DB_CE_Local_Panel", E, 0.15, 0.0, 1.4, 0.45, 0.1, 1.9, M["db"], gE)
box("ELE_Cable_Tray_200", E, 0.1, 0.25, 2.44, LX - 0.3, 0.45, 2.46, M["tray"], gE)
devs = {"Socket": [(0.35, 4.95, 0.3), (2.0, 4.95, 0.9), (3.55, 1.2, 0.3), (3.65, 4.1, 0.3), (7.12, 3.3, 0.6), (7.12, 4.7, 0.6), (3.25, 0.05, 0.3)],
        "Switch": [(0.85, 0.03, 1.2), (3.63, 2.45, 1.2), (5.45, 1.87, 1.2), (4.85, 1.87, 1.2)],
        "Shaver_Socket_IEC61558": [(6.5, 1.87, 1.5)], "Telephone": [(0.3, 4.95, 0.9)], "Eng_Alarm_Panel_EAP": [(2.8, 4.95, 1.4)]}
pts_dev = {}
for k, L in devs.items():
    for i, (x, y, z) in enumerate(L):
        w = 0.08 if "Socket" in k or "Switch" in k else 0.2
        box(f"ELE_{k}_{i + 1}", E, x - w / 2, y - 0.02, z - 0.04, x + w / 2, y + 0.02, z + (0.04 if w < 0.1 else 0.14), M["red" if "Alarm" in k else "device"], gE)
box("ELE_General_Alarm_Bell", E, 0.1, 0.0, 2.0, 0.3, 0.08, 2.2, M["red"], gE)
for i, (x, y) in enumerate([(1.8, 2.5), (5.4, 4.2)]):
    cyl(f"ELE_Smoke_Detector_{i + 1}", E, x, y, CH - 0.05, 0.05, 0.05, M["device"], gE)
for i, (x, y) in enumerate([(1.8, 3.4), (6.2, 2.6)]):
    cyl(f"ELE_PA_Speaker_{i + 1}", E, x, y, CH - 0.03, 0.09, 0.03, M["device"], gE)
# cable runs (ceiling void at z=2.45; drops behind joiner panels)
zc = 2.47
runs = {
 "CAB_Feeder_3x2.5_ACC-DB-03": ([(0.3, -0.5, zc), (0.3, 0.05, zc), (0.3, 0.05, 1.9)], M["cable"]),
 "CAB_L1_Lighting_DayRoom_3x1.5": ([(0.3, 0.05, 1.9), (0.3, 0.05, zc), (1.0, 0.4, zc), (1.0, 2.5, zc), (2.6, 2.5, zc), (1.0, 2.5, zc), (1.0, 4.0, zc), (1.2, 4.0, zc)], M["cable"]),
 "CAB_L1_Switch_Drop": ([(0.85, 0.4, zc), (0.85, 0.05, zc), (0.85, 0.05, 1.2)], M["cable"]),
 "CAB_L2_Lighting_Bed_Bath_3x1.5": ([(0.3, 0.05, zc), (3.3, 0.4, zc), (3.3, 2.2, zc), (5.6, 2.2, zc), (5.6, 3.2, zc), (6.6, 3.2, zc)], M["cable"]),
 "CAB_L2_Bath_Store_Branch": ([(4.3, 2.2, zc), (4.3, 0.95, zc)], M["cable"]),
 "CAB_L2_Bath_Branch": ([(5.6, 2.2, zc), (6.0, 2.2, zc), (6.0, 0.95, zc)], M["cable"]),
 "CAB_S1_Sockets_DayRoom_3x2.5": ([(0.3, 0.05, 1.4), (0.15, 0.05, 0.3), (0.15, 4.95, 0.3), (3.4, 4.95, 0.3), (3.8, 4.95, 0.3), (3.8, 4.1, 0.3)], M["cable"]),
 "CAB_S2_Sockets_Bedroom_3x2.5": ([(3.8, 4.97, 0.3), (7.13, 4.97, 0.3), (7.13, 3.3, 0.6)], M["cable"]),
 "CAB_S1_Corridor_Wall": ([(0.3, 0.05, 1.4), (0.3, 0.06, 0.3), (3.55, 0.06, 0.3), (3.55, 1.2, 0.3)], M["cable"]),
 "CAB_Shaver_3x1.5": ([(5.0, 2.2, zc), (6.5, 2.05, zc), (6.5, 1.87, 1.5)], M["cable"]),
 "CAB_EM_Light_2x1.5_24VDC": ([(0.5, -0.5, zc), (0.5, 0.2, zc), (1.8, 0.2, zc), (1.8, 1.0, zc), (1.8, 3.2, zc), (4.3, 3.2, zc), (4.3, 3.4, zc)], M["emcable"]),
}
for n, (p, m) in runs.items():
    run(n, E, p, 0.006, m, gE, orth=True)

# ---- 07 Plumbing ----
Pc = C["07_Plumbing"]; gP = G["07_Plumbing"]
zb = 0.6
plumb = {
 "PIP_CW_Riser_DN15_Cu": ([(7.08, 0.1, -0.5), (7.08, 0.1, DK + 0.3)], 0.008, M["CW"]),
 "PIP_CW_Branch_Basin": ([(7.08, 0.1, zb), (7.08, 1.0, zb), (6.45, 1.0, zb), (6.45, 1.55, zb), (6.2, 1.75, 0.55)], 0.008, M["CW"]),
 "PIP_CW_Branch_Shower": ([(7.08, 0.5, zb), (7.08, 0.5, 1.0), (6.99, 0.5, 1.0)], 0.008, M["CW"]),
 "PIP_CW_Branch_WC_Cistern": ([(6.45, 1.0, zb), (5.35, 1.0, zb), (5.35, 0.15, zb), (5.35, 0.15, 0.9)], 0.008, M["CW"]),
 "PIP_HW_Supply_Riser_DN15_Cu_Insul": ([(7.14, 0.1, -0.5), (7.14, 0.1, DK + 0.3)], 0.019, M["HW"]),
 "PIP_HW_Return_Riser_DN15": ([(7.18, 0.25, -0.5), (7.18, 0.25, DK + 0.3)], 0.012, M["HW"]),
 "PIP_HW_Branch_Basin": ([(7.14, 0.1, zb + 0.08), (7.14, 1.1, zb + 0.08), (6.55, 1.1, zb + 0.08), (6.55, 1.6, zb + 0.08), (6.25, 1.75, 0.55)], 0.008, M["HW"]),
 "PIP_HW_Branch_Shower": ([(7.14, 0.55, zb + 0.08), (7.14, 0.55, 1.0), (6.99, 0.52, 1.0)], 0.008, M["HW"]),
 "PIP_GW_Shower_Drain_DN50": ([(6.7, 0.5, -0.01), (6.7, 0.25, -0.02), (7.02, 0.25, -0.03), (7.02, 0.25, -0.6)], 0.025, M["GW"]),
 "PIP_GW_Basin_Drain_DN40": ([(6.17, 1.6, 0.6), (6.17, 1.6, -0.02), (6.17, 1.2, -0.02), (6.9, 1.2, -0.03), (6.9, 0.25, -0.04), (7.02, 0.25, -0.04)], 0.02, M["GW"]),
 "PIP_GW_Floor_Gully_DN50": ([(5.75, 1.0, -0.01), (5.75, 0.15, -0.02), (7.02, 0.15, -0.035), (7.02, 0.15, -0.6)], 0.025, M["GW"]),
 "PIP_GW_FCU_Condensate_DN20": ([(3.0, 0.9, 2.35), (3.0, 0.9, 0.05), (3.0, 0.15, -0.01), (5.75, 0.15, -0.015), (5.75, 0.9, -0.015)], 0.01, M["GW"]),
 "PIP_BW_WC_Soil_DN100": ([(5.35, 0.5, 0.1), (5.35, 0.4, -0.02), (7.04, 0.4, -0.04), (7.04, 0.4, -0.6)], 0.05, M["BW"]),
}
for n, (p, r, m) in plumb.items():
    run(n, Pc, p, r, m, gP)
for n, (x, y, z, m) in {"VLV_CW_Isolation_Ball_DN15": (7.08, 0.25, zb, M["CW"]), "VLV_HW_Isolation_Ball_DN15": (7.14, 0.3, zb + 0.08, M["HW"]),
                        "VLV_HW_Return_Balancing": (7.18, 0.25, 0.3, M["HW"])}.items():
    o = box(n, Pc, x - 0.02, y - 0.02, z - 0.03, x + 0.02, y + 0.02, z + 0.03, m, gP)
    o["safety_note"] = "Lockable; HW return balanced for ≥50°C (Legionella control)"
for n, (x, y, z) in {"PEN_A60_Deck_Sleeve_CW_HW": (7.13, 0.15, -0.072), "PEN_A60_Deck_Sleeve_GW": (7.02, 0.2, -0.072), "PEN_A60_Deck_Sleeve_BW": (7.04, 0.4, -0.072)}.items():
    cyl(n, Pc, x, y, z - 0.1, 0.07, 0.2, M["steel"], gP)

# ---- 08 HVAC ----
Hc = C["08_HVAC"]; gH = G["08_HVAC"]
box("HVC_FCU_Ceiling_Cassette", Hc, 2.6, 0.5, 2.33, 3.4, 1.3, 2.6, M["duct"], gH)
zd = 2.41  # duct centreline between ceiling (2.325) and deck beams (2.49)
run("HVC_SA_Duct_D160_from_AHU2", Hc, [(3.0, -0.6, zd), (3.0, 0.5, zd)], 0.08, M["duct"], gH)
run("HVC_SA_Duct_D125_Branch_DayRoom", Hc, [(3.0, 1.3, zd), (3.0, 1.8, zd), (1.8, 1.8, zd)], 0.0625, M["duct"], gH)
run("HVC_SA_Duct_D125_Branch_Desk", Hc, [(3.0, 1.8, zd), (3.0, 3.6, zd), (2.6, 3.6, zd)], 0.0625, M["duct"], gH)
run("HVC_SA_Duct_D125_Branch_Bedroom", Hc, [(3.0, 3.6, zd), (3.0, 3.9, zd), (5.9, 3.9, zd)], 0.0625, M["duct"], gH)
run("HVC_EA_Duct_D100_Bath", Hc, [(6.0, 0.6, 2.33), (6.0, 0.6, zd), (6.0, -0.6, zd)], 0.05, M["duct"], gH)
for i, (x, y) in enumerate([(1.8, 1.8), (2.6, 3.6), (5.9, 3.9)]):
    box(f"HVC_SA_Diffuser_{i + 1}", Hc, x - 0.15, y - 0.15, CH - 0.01, x + 0.15, y + 0.15, CH + 0.02, M["device"], gH)
box("HVC_EA_Valve_Bath", Hc, 5.92, 0.52, CH - 0.01, 6.08, 0.68, CH + 0.02, M["device"], gH)

# ---- 09 Lighting (fixtures + Blender lights) ----
Lc = C["09_Lighting"]; gL = G["09_Lighting"]
for i, (x, y) in enumerate([(1.0, 2.5), (2.6, 2.5), (1.2, 4.0), (5.6, 3.2), (6.6, 3.2), (6.0, 0.95), (4.3, 0.95)]):
    f = cyl(f"LGT_LED_Downlight_{i + 1}", Lc, x, y, CH - 0.02, 0.1, 0.02, M["lamp"], gL)
    ld = bpy.data.lights.new(f"LGT_Point_{i + 1}", "POINT"); ld.energy = 60; ld.shadow_soft_size = 0.1
    lo = bpy.data.objects.new(f"LGT_Point_{i + 1}", ld); lo.location = (0, 0, -0.05); Lc.objects.link(lo); lo.parent = f
for i, (x, y) in enumerate([(1.8, 1.0), (4.3, 3.4)]):
    cyl(f"LGT_Emergency_24VDC_{i + 1}", Lc, x, y, CH - 0.03, 0.08, 0.03, M["red"], gL)

# Metadata
ROOT["project"] = "Chief Engineer's Suite - DWG CE-SUITE-GA-001 Rev A"
ROOT["units"] = "metres"; ROOT["axes"] = "X fwd, Y corridor->STBD shell, Z up, 0 = FFL"
sc.frame_start, sc.frame_end = 1, 96

# camera for review
cam = bpy.data.objects.new("CAM_Review", bpy.data.cameras.new("CAM_Review")); sc.collection.objects.link(cam)
cam.location = (-3.5, -4.5, 6.5); cam.rotation_euler = (math.radians(55), 0, math.radians(-38)); sc.camera = cam
sun = bpy.data.objects.new("SUN", bpy.data.lights.new("SUN", "SUN")); sun.data.energy = 3; sun.rotation_euler = (0.6, 0.2, 0.5); sc.collection.objects.link(sun)

# clean meshes
for o in bpy.data.objects:
    if o.type == "MESH":
        import bmesh
        bm = bmesh.new(); bm.from_mesh(o.data)
        bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5); bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
        bm.to_mesh(o.data); bm.free()

bpy.ops.wm.save_as_mainfile(filepath="/mnt/session/outputs/CE_Suite.blend")
bpy.ops.export_scene.gltf(filepath="/mnt/session/outputs/CE_Suite.glb", export_animations=True, export_lights=True)
try:
    bpy.ops.export_scene.fbx(filepath="/mnt/session/outputs/CE_Suite.fbx", global_scale=1.0, apply_unit_scale=True, bake_anim=True)
except Exception as e:
    print("FBX export failed", e)

# preview render (ceiling + deck above hidden)
for o in bpy.data.objects:
    if o.name.startswith(("CEIL_", "STR_Deck_Above", "STR_Deck_Beam")): o.hide_render = True
sc.frame_set(30)
sc.render.engine = "BLENDER_WORKBENCH"; sc.display.shading.light = "STUDIO"; sc.display.shading.color_type = "MATERIAL"
sc.render.resolution_x, sc.render.resolution_y = 1600, 1000
sc.render.filepath = "/work/render.png"; bpy.ops.render.render(write_still=True)
cam.location = (3.6, 2.5, 14); cam.rotation_euler = (0, 0, 0); cam.data.type = "ORTHO"; cam.data.ortho_scale = 8.5
sc.render.filepath = "/work/render_top.png"; bpy.ops.render.render(write_still=True)
print("objects:", len(bpy.data.objects))
