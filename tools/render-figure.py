import os
import bpy, sys, json, math, re
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
opts = dict(a.split("=", 1) for a in argv)
VIEW = opts.get("view", "front")
MODE = opts.get("mode", "probe")
RES_Y = int(opts.get("res", "1200"))
OUT = opts["out"]

scene = bpy.context.scene

def top_collection(name_prefix):
    for c in scene.collection.children:
        if c.name.startswith(name_prefix):
            return c
    return None

MUSCLES = top_collection("4:")
BONES = top_collection("1:")

def all_objects(col):
    seen = set()
    stack = [col]
    while stack:
        c = stack.pop()
        for o in c.objects:
            if o.name not in seen:
                seen.add(o.name)
                yield o
        stack.extend(c.children)

SIDE = re.compile(r"\.(l|r)$")
SKIP = re.compile(r"bursa|sheath|retinaculum|aponeurosis of|fascia", re.I)

muscle_objs = [o for o in all_objects(MUSCLES) if o.type == "MESH" and SIDE.search(o.name) and not SKIP.search(o.name)]
# midline muscles without side suffix (none needed for the groups, but keep for completeness)
bone_objs = [o for o in all_objects(BONES) if o.type == "MESH" and re.search(r"\.(l|r|i|j)$", o.name)]

REGIONS = top_collection("9:")
SKIN_PARTS = re.compile(r"^(Frontal|Parietal|Occipital|Temporal|Orbital|Infra-orbital|Nasal|Oral|Buccal|Zygomatic|Mental|Mastoid|Auricular|Parotideomasseteric) region$|^(Mentolabial sulcus|Nasolabial sulcus|Philtrum|Angle of mouth|Labial commissure|Tubercle of upper lip|Eyebrow|Submental triangle|Helix|Antihelix|Antitragus|Tragus|Lobule of auricle|Scapha|Concha of auricle|Cavity of concha|Cymba conchae|Crura of antihelix|Triangular fossa|Fossa antihelica|Intertragic incisure|Anterior notch of auricle|Apex of auricle|Auricular tubercle|Eminentia conchae|Eminentia fossae triangularis|Eminentia scaphae|Posterior auricular groove|Palm|Dorsum of hand|Dorsal surfaces of digits of hand|Palmar surfaces of digits of hand|Dorsum of foot|Sole|Heel region|Dorsal surfaces of digits of foot|Plantar surfaces of digits of foot|Metatarsal region|Lateral border of foot|Medial border of foot|Distal transverse arch of foot|Proximal transverse arch of foot|Lateral part of longitudinal arch of foot|Medial part of longitudinal arch of foot|Hallucial eminence|Lateral malleolus|Medial malleolus|Lateral retromalleolar region|Medial retromalleolar region|Anterior region of ankle)$")
skin_objs = [o for o in all_objects(REGIONS) if o.type == "MESH" and SKIN_PARTS.search(re.sub(r"\.(l|r)$", "", o.name))] if opts.get("skin", "1") == "1" else []
show = set(o.name for o in muscle_objs) | set(o.name for o in bone_objs) | set(o.name for o in skin_objs)
TENDON = re.compile(r"tendon|fascia|ligament|aponeuro", re.I)

RENDER_COL = bpy.data.collections.new("ss_render")
scene.collection.children.link(RENDER_COL)
linked = set()
for name in show:
    o = bpy.data.objects[name]
    while o is not None and o.name not in linked:
        RENDER_COL.objects.link(o)
        linked.add(o.name)
        if o.name not in show:
            o.hide_render = True
        o = o.parent
if opts.get("cube"):
    bpy.ops.mesh.primitive_cube_add(size=0.2, location=(0, -0.3, 0.9))
    cube = bpy.context.active_object
    for c in list(cube.users_collection):
        c.objects.unlink(cube)
    RENDER_COL.objects.link(cube)
    show.add(cube.name)
for lc in bpy.context.view_layer.layer_collection.children:
    lc.exclude = lc.collection is not RENDER_COL
for lc in bpy.context.view_layer.layer_collection.children:
    if lc.collection is RENDER_COL:
        lc.hide_viewport = False
for o in scene.collection.objects:
    if o.type == "MESH":
        o.hide_render = True

scene.render.use_freestyle = False
scene.render.use_compositing = False
scene.render.use_sequencer = False
scene.render.use_border = False
vl = bpy.context.view_layer
for attr in ("use_solid", "use_sky", "use_strand", "use_volumes", "use_motion_blur"):
    if hasattr(vl, attr):
        setattr(vl, attr, True)
vl.use = True
for other in scene.view_layers:
    other.use = other == vl
info_display = {}
for o in bpy.data.objects:
    vis = o.name in show
    o.hide_render = not vis
    if vis:
        o.hide_viewport = False
        o.hide_set(False)
        info_display[o.display_type] = info_display.get(o.display_type, 0) + 1
        o.display_type = "TEXTURED"
        o.color = (1, 1, 1, 1)
    if o.type in ("LIGHT", "CAMERA"):
        o.hide_render = False

# bounds of the visible muscles
pts = []
for o in muscle_objs:
    for c in o.bound_box:
        pts.append(o.matrix_world @ Vector(c))
mn = Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts)))
mx = Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
centre = (mn + mx) / 2
size = mx - mn
info = {"display": info_display, "muscles": len(muscle_objs), "bones": len(bone_objs), "min": list(mn), "max": list(mx), "size": list(size)}

# camera: Z up assumed; front looks along +Y from -Y (Blender convention) unless overridden
front_axis = opts.get("front", "-y")
cam_data = bpy.data.cameras.new("ss_cam")
cam_data.type = "ORTHO"
height = size.z * 1.04
width = max(size.x, size.y) * 1.1
cam_data.ortho_scale = max(height, width * 2)  # portrait 1:2 frame
cam = bpy.data.objects.new("ss_cam", cam_data)
scene.collection.objects.link(cam)
dist = max(size) * 3
sign = -1 if front_axis.startswith("-") else 1
axis = front_axis[-1]
if VIEW == "back":
    sign = -sign
if axis == "y":
    cam.location = (centre.x, centre.y + sign * dist, centre.z)
    cam.rotation_euler = (math.radians(90), 0, math.radians(0 if sign < 0 else 180))
else:
    cam.location = (centre.x + sign * dist, centre.y, centre.z)
    cam.rotation_euler = (math.radians(90), 0, math.radians(-90 if sign < 0 else 90))
cam_data.clip_end = dist * 4
scene.camera = cam

scene.render.resolution_y = RES_Y
scene.render.resolution_x = RES_Y // 2
scene.render.resolution_percentage = 100
scene.render.film_transparent = True
scene.render.image_settings.file_format = "PNG"
scene.render.image_settings.color_mode = "RGBA"

def workbench(matcap=None, flat=False, single=None):
    scene.render.engine = "BLENDER_WORKBENCH"
    sh = scene.display.shading
    if flat:
        sh.light = "FLAT"
        sh.color_type = "OBJECT"
        sh.show_cavity = False
        sh.show_object_outline = False
        sh.show_specular_highlight = False
        scene.display.render_aa = "OFF"
        scene.view_settings.view_transform = "Standard"
        scene.view_settings.look = "None"
    else:
        sh.light = "MATCAP" if matcap else "STUDIO"
        if matcap:
            sh.studio_light = matcap
        sh.color_type = "SINGLE"
        sh.single_color = single or (0.75, 0.42, 0.36)
        sh.show_cavity = True
        sh.cavity_type = "BOTH"
        sh.show_object_outline = True
        sh.object_outline_color = (0.25, 0.1, 0.08)
        scene.display.render_aa = "16"

if MODE in ("probe", "matcap"):
    workbench(matcap=opts.get("matcap", "clay_studio.exr") if MODE == "matcap" else None)
    scene.display.shading.color_type = "MATERIAL"
    def rgb(s):
        return tuple(float(x) for x in s.split(",")) + (1.0,)
    C_MUSCLE = rgb(opts.get("muscle", "0.66,0.30,0.25"))
    C_TENDON = rgb(opts.get("tendon", "0.86,0.80,0.74"))
    C_BONE = rgb(opts.get("bone", "0.88,0.85,0.78"))
    C_SKIN = rgb(opts.get("skinc", "0.80,0.72,0.67"))
    assigned = {}
    def paint(objs, colour_for):
        for o in objs:
            for s in o.material_slots:
                if s.material and s.material.name not in assigned:
                    assigned[s.material.name] = colour_for(s.material.name)
    paint(skin_objs, lambda n: C_SKIN)
    paint(bone_objs, lambda n: C_BONE)
    paint(muscle_objs, lambda n: C_TENDON if TENDON.search(n) else C_MUSCLE)
    for name, c in assigned.items():
        bpy.data.materials[name].diffuse_color = c
    info["material_colours"] = len(assigned)

elif MODE == "mask":
    groups = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "group-meshes.json")))
    ids = list(groups)
    # well-separated palette, values in sRGB 0..1
    import colorsys
    palette = {}
    for i, gid in enumerate(ids):
        h = (i * 0.618034) % 1.0
        v = 1.0 if i % 2 == 0 else 0.62
        palette[gid] = colorsys.hsv_to_rgb(h, 1.0, v)
    def to_linear(c):
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    base_to_group = {n: gid for gid, names in groups.items() for n in names}
    workbench(flat=True)
    import bmesh
    STRIP_TENDON = {"Latissimus dorsi muscle"}
    # rectus abdominis footprint: max |x| per 1 cm band of height, used to cut the oblique aponeurosis
    band = {}
    for side in ("l", "r"):
        ro = bpy.data.objects[f"Rectus abdominis muscle.{side}"]
        mw = ro.matrix_world
        for v in ro.data.vertices:
            p = mw @ v.co
            k = int(p.z * 100)
            band[k] = max(band.get(k, 0), abs(p.x))
    def rectus_bound(z):
        k = int(z * 100)
        return max(band.get(k, 0), band.get(k - 1, 0), band.get(k + 1, 0))
    matched = {gid: 0 for gid in ids}
    for name in show:
        o = bpy.data.objects[name]
        base = re.sub(r"\.(l|r)$", "", o.name)
        gid = base_to_group.get(base) if o in muscle_objs else None
        cut_rectus = bool(re.search(r"abdominal oblique|transversus abdominis", base))
        if gid or cut_rectus:
            tendon_slots = {i for i, s in enumerate(o.material_slots) if s.material and TENDON.search(s.material.name)} if base in STRIP_TENDON else set()
            if tendon_slots or cut_rectus:
                me = o.data.copy()
                bm = bmesh.new(); bm.from_mesh(me)
                mw = o.matrix_world
                doomed = []
                for f in bm.faces:
                    if f.material_index in tendon_slots:
                        doomed.append(f); continue
                    if cut_rectus:
                        c = mw @ f.calc_center_median()
                        if abs(c.x) <= rectus_bound(c.z) + 0.004:
                            doomed.append(f)
                bmesh.ops.delete(bm, geom=doomed, context="FACES")
                bm.to_mesh(me); bm.free()
                o.data = me
        if gid:
            r, g, b = palette[gid]
            o.color = (to_linear(r), to_linear(g), to_linear(b), 1)
            matched[gid] += 1
        else:
            o.color = (0, 0, 0, 1)
    info["matched_objects"] = matched
    info["palette"] = palette

elif MODE == "cycles":
    scene.render.engine = "CYCLES"
    scene.cycles.samples = int(opts.get("samples", "64"))
    scene.cycles.use_denoising = True
    try:
        prefs = bpy.context.preferences.addons["cycles"].preferences
        prefs.compute_device_type = "METAL"
        prefs.get_devices()
        for d in prefs.devices:
            d.use = True
        scene.cycles.device = "GPU"
    except Exception as e:
        info["gpu"] = str(e)
    scene.view_settings.view_transform = "AgX"
    def mat(name, base, sss=0.0, rough=0.55):
        m = bpy.data.materials.new(name)
        m.use_nodes = True
        b = m.node_tree.nodes.get("Principled BSDF")
        b.inputs["Base Color"].default_value = (*base, 1)
        b.inputs["Roughness"].default_value = rough
        if "Subsurface Weight" in b.inputs:
            b.inputs["Subsurface Weight"].default_value = sss
            b.inputs["Subsurface Radius"].default_value = (0.6, 0.25, 0.15)
        return m
    m_muscle = mat("ss_muscle", (0.42, 0.13, 0.10), sss=0.12, rough=0.45)
    m_bone = mat("ss_bone", (0.72, 0.66, 0.55), rough=0.6)
    for o in muscle_objs:
        o.data.materials.clear(); o.data.materials.append(m_muscle)
    for o in bone_objs:
        o.data.materials.clear(); o.data.materials.append(m_bone)
    for o in bpy.data.objects:
        if o.type == "LIGHT":
            o.hide_render = True
    world = bpy.data.worlds.new("ss_world")
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs[0].default_value = (0.9, 0.9, 0.92, 1)
    world.node_tree.nodes["Background"].inputs[1].default_value = 0.35
    scene.world = world
    def light(name, energy, loc, size):
        ld = bpy.data.lights.new(name, "AREA"); ld.energy = energy; ld.size = size
        lo = bpy.data.objects.new(name, ld); scene.collection.objects.link(lo)
        lo.location = loc
        d = centre - Vector(loc); lo.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()
    # key from viewer's upper left, fill right, rim behind; positions relative to camera side
    cx, cy, cz = cam.location
    side = Vector(cam.matrix_world.to_3x3() @ Vector((1, 0, 0)))
    up = Vector((0, 0, 1))
    fwd = (Vector(cam.location) - centre).normalized()
    light("ss_key", float(opts.get("key", "4000")), centre + fwd * dist * 0.6 - side * dist * 0.5 + up * size.z * 0.6, size.z * 0.5)
    light("ss_fill", float(opts.get("fill", "1200")), centre + fwd * dist * 0.6 + side * dist * 0.5, size.z * 0.8)
    light("ss_rim", float(opts.get("rim", "1500")), centre - fwd * dist * 0.5 + up * size.z * 0.4, size.z * 0.4)
    info["light_dist"] = dist

bpy.context.view_layer.update()
if opts.get("probe_points"):
    dg = bpy.context.evaluated_depsgraph_get()
    hits = []
    for pt in opts["probe_points"].split(";"):
        x, z = (float(t) for t in pt.split(","))
        origin = Vector((x, centre.y - 2, z))
        ok, loc, nrm, idx, obj, mat = scene.ray_cast(dg, origin, Vector((0, 1, 0)))
        hits.append([pt, obj.name if ok else None, round(loc.y, 4) if ok else None])
    info["probe_hits"] = hits
info["visible_get"] = sum(1 for n in show if bpy.data.objects[n].visible_get())
info["render_col_exclude"] = [lc.exclude for lc in bpy.context.view_layer.layer_collection.children if lc.collection is RENDER_COL]
scene.render.filepath = OUT
bpy.ops.render.render(write_still=True)
info["out"] = OUT
if MODE == "mask":
    img = bpy.data.images.load(OUT)
    w, h = img.size
    px = list(img.pixels)
    counts = {gid: 0 for gid in palette}
    sums = {gid: [0, 0] for gid in palette}
    near_miss = 0
    pal = list(palette.items())
    code = {gid: 2 + n for n, (gid, _) in enumerate(pal)}
    grid = bytearray(w * h)  # top-down; 0 background, 1 body outside any group, 2+ group
    for y in range(h):
        row = y * w * 4
        top = (h - 1 - y) * w
        for x in range(w):
            i = row + x * 4
            if px[i + 3] < 0.5:
                continue
            grid[top + x] = 1
            r, g, b = px[i], px[i + 1], px[i + 2]
            if r + g + b < 0.05:
                continue
            best, bd = None, 9
            for gid, (pr, pg, pb) in pal:
                d = (r - pr) ** 2 + (g - pg) ** 2 + (b - pb) ** 2
                if d < bd:
                    best, bd = gid, d
            if bd > 0.003:
                near_miss += 1
                continue
            grid[top + x] = code[best]
            counts[best] += 1
            sums[best][0] += x
            sums[best][1] += y
    info["mask_size"] = [w, h]
    info["pixel_counts"] = counts
    info["centroids"] = {g: [round(s[0] / counts[g]), round(h - 1 - s[1] / counts[g])] if counts[g] else None for g, s in sums.items()}
    info["unmatched_pixels"] = near_miss
    json.dump(info, open(OUT.replace(".png", ".json"), "w"), indent=1)
    runs, prev, n = [], grid[0], 0
    for v in grid:
        if v == prev:
            n += 1
        else:
            runs.append([prev, n]); prev, n = v, 1
    runs.append([prev, n])
    json.dump({"w": w, "h": h, "ids": [gid for gid, _ in pal], "runs": runs}, open(OUT.replace(".png", ".grid.json"), "w"))
print("RENDER_INFO", json.dumps(info))
