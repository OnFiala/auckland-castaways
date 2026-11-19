#!/usr/bin/env python3
"""Bake registered 2.5D materials and two diffuse exchanges into offline PNGs."""
import base64
import hashlib
import io
import json
import subprocess
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw
from scipy.ndimage import distance_transform_edt, gaussian_filter as blur, map_coordinates

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "artwork/materials"
DIST = ROOT / "dist"
WIDTH, HEIGHT = 256, 144
SIZE = WIDTH, HEIGHT
Y, X = np.mgrid[0:HEIGHT, 0:WIDTH].astype(float)
ROOMS = json.loads((SOURCE / "rooms.json").read_text())
VARIANTS = json.loads((SOURCE / "variants.json").read_text())

# Microfacet roughness, metallic, planar wetness, relative occluding height,
# brushstroke slope strength, diffuse exchange, opaque surface participation.
MATERIALS = {
    "air":     (1.00, 0, 0,    0,    0,    0,    0),
    "distant": (.98,  0, 0,    .04,  .06,  .23,  .28),
    "glass":   (.18,  0, 0,    .06,  .04,  .08,  .17),
    "sand":    (.88,  0, 0,    .18,  .29,  .52,  1),
    "wetSand": (.26,  0, .56,  .13,  .14,  .34,  1),
    "water":   (.18,  0, .87,  .05,  .24,  .20,  .92),
    "earth":   (.94,  0, 0,    .21,  .47,  .48,  1),
    "damp":    (.58,  0, .16,  .18,  .29,  .35,  1),
    "stone":   (.81,  0, 0,    .70,  .97,  .49,  1),
    "leaves":  (.89,  0, 0,    .62,  .41,  .52,  1),
    "wood":    (.71,  0, 0,    .50,  .82,  .53,  1),
    "wetWood": (.38,  0, .43,  .47,  .52,  .44,  1),
    "iron":    (.39, .86, 0,   .62,  .74,  .09,  1),
    "rope":    (.93,  0, 0,    .53,  .50,  .53,  1),
    "cloth":   (.93,  0, 0,    .47,  .48,  .62,  1),
    "leather": (.68,  0, 0,    .66,  .56,  .45,  1),
    "paper":   (.91,  0, 0,    .49,  .36,  .74,  1),
    "cavity":  (.98,  0, 0,    .02,  .15,  .20,  1),
}
# Sky chromaticity (sRGB appearance) and projected direction to the key.
SKIES = {
    "austral": ("c2d1dc", -0.65, -0.65),
    "dusk": ("e0c4a8", -0.38, -0.8),
    "canopy": ("b9d4e4", 0.15, -0.84),
    "window": ("b7cde0", -0.86, -0.38),
    "interiorDusk": ("cfb8aa", -0.86, -0.38),
    "workshop": ("b8ccd9", -0.94, -0.30),
    "storm": ("9caec7", -0.73, -0.47),
    "sunset": ("f1bc93", -0.92, -0.30),
    "roomgold": ("e8cdaa", -0.86, -0.35),
}
INDOORS = {"forge", "cabin", "return_camp", "chartroom"}
LUMA = np.array([0.2126, 0.7152, 0.0722])


def linear(value):
    return np.where(value <= 0.04045, value / 12.92, ((value + .055) / 1.055) ** 2.4)


def srgb(value):
    return np.where(value <= .0031308, 12.92 * value, 1.055 * value**(1/2.4) - .055)


def hue(hex_string):
    rgb = linear(np.frombuffer(bytes.fromhex(hex_string), dtype=np.uint8) / 255)
    return rgb / (rgb @ LUMA)


def matte(points, holes=()):
    """Antialiased polygon with absolute cut-outs, in top-left plate percent."""
    s = 3
    def xy(poly):
        if isinstance(poly, str):
            poly = [pair.split(",") for pair in poly.split()]
        return [(round(float(x)*WIDTH*s/100), round(float(y)*HEIGHT*s/100)) for x,y in poly]
    img = Image.new("L", (WIDTH*s, HEIGHT*s))
    draw = ImageDraw.Draw(img)
    draw.polygon(xy(points), fill=255)
    for hole in holes:
        draw.polygon(xy(hole), fill=0)
    return np.asarray(img.resize(SIZE, Image.Resampling.BOX)) / 255


def source_states():
    """Ask the actual room registry for background and the landscape for shorelines."""
    states = []
    for scene, rules in VARIANTS["layouts"].items():
        for rule in rules:
            key, *flags = rule
            if any(row["key"] == key for row in states):
                continue
            state = {"key":key, "scene":scene, "flags":dict.fromkeys(flags, True)}
            # Use the chronology of the repaired boat even for an old/inconsistent save.
            if key == "crossing-safe":
                state["flags"]["boatDry"] = True
            states.append(state)
    program = """
const fs = require('node:fs');
const world = require('./dist/voyage-world.js');
const land = require('./dist/landscape.js');
const result = JSON.parse(fs.readFileSync(0,'utf8')).map(s => ({
  ...s, plate:world.background(s), marks:land.describe(s)
}));
process.stdout.write(JSON.stringify(result));
"""
    run = subprocess.run(["node", "-e", program], cwd=ROOT, input=json.dumps(states),
                         check=True, text=True, capture_output=True)
    return json.loads(run.stdout)


def definition(scene):
    room = ROOMS[scene]
    if "use" not in room:
        return room
    base = definition(room["use"])
    return {**base, **room, "layers":base["layers"] + room.get("layers", [])}


def author_surfaces(room, state):
    height, width = HEIGHT, WIDTH
    names = list(MATERIALS)
    weights = np.zeros((height, width, len(names)))
    weights[:, :, names.index(room["ground"])] = 1
    def layer(name, mask):
        weights[:] *= 1 - mask[:, :, None]
        weights[:, :, names.index(name)] += mask
    key = state["key"]
    details = VARIANTS["details"]
    def paint_shapes(shapes):
        for kind, label, components in shapes:
            if label not in room.get("omit", []):
                for contour in components.split("|"):
                    layer(kind, matte(contour))
    paint_shapes(room["layers"])
    # Existing shoreline mattes register to the same final plate. Keep interiors
    # of holes intact. Glass showing distant water is a window, not a wet floor.
    for mark in state["marks"]:
        if mark["kind"] == "run" or (mark["kind"] == "water" and mark.get("style") != "glass"):
            layer("water", matte(mark["points"], mark.get("holes", [])))
    # Changed physical foreground objects must occlude the base room water,
    # e.g. the raised chest lid stands in front of the gap beyond the stern.
    paint_shapes(details.get(VARIANTS["inheritDetails"].get(key), []) + details.get(key, []))
    def weight(name):
        return weights[:, :, names.index(name)]
    return weights @ np.array(list(MATERIALS.values())), weight


def sample(field, x, y):
    if field.ndim == 2:
        return map_coordinates(field, [y, x], order=1, mode="nearest")
    return np.stack([sample(channel, x, y) for channel in field.transpose(2,0,1)], axis=2)


def visibility(z, other_x, other_y, other_z, clearance):
    """Horizon test in the depth proxy. z and clearance are bake-pixel units."""
    obstruction = np.zeros_like(z)
    for t in (.13, .28, .44, .61, .78, .9):
        intercept = sample(z, X + (other_x-X)*t, Y + (other_y-Y)*t)
        ray = z + (other_z-z)*t + clearance
        obstruction = np.maximum(obstruction, intercept - ray)
    return np.exp(-.51*obstruction)


def diffuse_exchanges(albedo, diffuse_direct, z):
    """Two truncated Lambertian radiosity gathers on the painted depth proxy.

    Each ring represents its area in a disk kernel. Geometric attenuation and
    occlusion apply to each link, including the second surface-to-surface hop.
    The available field of view ends at the plate boundary.
    """
    links = []
    for radius, energy, offset in [(3.5,.40,0), (12,.37,.24), (29,.23,.48)]:
        for a in np.arange(8) * np.pi/4 + offset:
            x = X + radius*np.cos(a)
            y = Y + radius*np.sin(a)
            neighbour_z = sample(z, x, y)
            visible = visibility(z, x, y, neighbour_z, .62)
            solid_angle = energy/8 / (1 + ((neighbour_z-z)/radius)**2)
            on_plate = (x>=0)&(y>=0)&(x<WIDTH-1)&(y<HEIGHT-1)
            links.append((x, y, (solid_angle*visible*on_plate)[:,:,None]))
    def gather(outgoing):
        return sum(sample(outgoing,x,y)*weight for x,y,weight in links)
    first = gather(albedo * diffuse_direct)
    return first + gather(albedo * first)


def quantize(values, step):
    return np.clip(np.rint(values*255/step)*step,0,255).astype("uint8")


def bake(state):
    scene, key, path = state["scene"], state["key"], state["plate"]
    plate_key = VARIANTS["plates"].get(key, key)
    if Path(path).stem != plate_key:
        raise ValueError(f"{key} source is {path}, expected {plate_key}")
    full_plate = Image.open(DIST/path).convert("RGB")
    source = np.asarray(full_plate.resize(SIZE, Image.Resampling.LANCZOS)) / 255
    room = definition(scene)
    properties, weight = author_surfaces(room, state)
    rough, metal, wet, macro_height, bump, diffuse, solid = properties.transpose(2,0,1)
    rgb = linear(source)
    luminance = source @ LUMA
    small = blur(luminance, .62)
    medium = blur(small, 2.6)
    micro = np.clip((small-medium)*1.46 + .47*(medium-blur(medium,6.0)), -.28,.28)
    wood_stone = weight("wood") + weight("stone") + weight("wetWood")
    # The tide leaves a gradual drying edge on sand and damp boards. Resolve
    # these on the inward side only; water and bilge edges stay registered.
    for material in ("wetSand", "wetWood", "damp"):
        coverage = weight(material)
        distance = distance_transform_edt(coverage > .5)
        feather = np.clip(distance / 5, 0, 1) * np.clip(.72 + .42*luminance, .62, 1)
        wet = wet - coverage*MATERIALS[material][2]*(1-feather)
    roughness = np.clip(rough + bump*(.20*micro - .04), .08,1)
    relief = np.clip(.124 + micro*.34 + .038*(medium-.38), .035,.26)
    # Keep the height gate exactly neutral on sky, cloth, metal and water.
    height = 128/255 + wood_stone*relief
    z = blur(macro_height, .55)*8 + small*1.6*bump
    dz_dy, dz_dx = np.gradient(small + .33*(medium-blur(medium,7)))
    # X right, Y up, Z towards viewer (array rows increase down the plate).
    nx = -dz_dx * bump * 4.8
    ny = dz_dy * bump * 4.8
    norm = np.sqrt(1+nx*nx+ny*ny)
    surface = np.dstack([quantize(.5+.5*nx/norm,4), quantize(.5+.5*ny/norm,4),
                         quantize(height,2),quantize(roughness,4)])

    sky_color, dx, dy = SKIES[room["sky"]]
    horizon = np.zeros_like(z)
    for r in (2, 5, 11, 21):
        horizon = np.maximum(horizon, (sample(z, X+r*dx,Y+r*dy)-z)/r)
    day_visibility = np.exp(-1.4*horizon)
    cavity = np.maximum(0, blur(z,3.2)-z)
    ao = np.clip((1-.11*np.minimum(cavity,4))*(.78+.22*day_visibility)
                 - weight("cavity")*.34, .30,1)
    ao = 1 - (1-ao)*solid
    sky = hue(sky_color)
    key_level = .37 if scene in INDOORS else .77
    incident = ((.18 + key_level*ao*day_visibility)[:,:,None] * sky)
    emissive = np.zeros_like(z)
    for kind, px, py, radius, power, color in room.get("lamps",[])+VARIANTS["lamps"].get(key,[]):
        lx, ly = WIDTH*px/100, HEIGHT*py/100
        radius_px = WIDTH*radius/100
        r2 = ((X-lx)**2 + (Y-ly)**2)/radius_px**2
        source_z = 9 if kind=="window" else z[round(ly),round(lx)] + 3
        clear = visibility(z,lx,ly,source_z,1.1)
        incident += (power*clear/(1+11*r2)**1.34)[:,:,None]*hue(color)
        if kind == "window":
            continue
        sx, sy = {"flame":(2.7,3.7), "coals":(5.0,2.95),
                  "overlayFire":(1.72,2.1), "lantern":(.58,1.14)}[kind]
        d2 = ((100*X/WIDTH-px)/sx)**2+((100*Y/HEIGHT-py)/sy)**2
        spot = np.exp(-.96*d2)
        if kind in ("flame","coals"):
            # Actual glowing brushstrokes inside the registered mouth.
            warm_stroke = np.clip((source[:,:,0]-source[:,:,2]-.09)*2.1,0,1)
            spot *= warm_stroke * np.clip(luminance*1.7+.21,0,1)
        emissive = np.maximum(emissive,spot)
        incident += (1.85*spot)[:,:,None]*hue(color)
    # Approximate diffuse reflectance by a low-frequency, exposure-normalized
    # sample of the painted material. Chromaticity and luminance both survive.
    paint = blur(rgb,(1.55,1.55,0))
    albedo = np.clip((paint+.022) / ((paint@LUMA)[:,:,None]+.054),.24,1.74)
    albedo *= (diffuse*(.69 + .23*medium))[:,:,None]
    bounce = diffuse_exchanges(albedo,incident,z)
    # Linear illumination relative to .214 (display code .5). Unpaintable sky
    # is neutral in RGB even where an authored atmospheric shaft overlays it.
    ambient_floor = (.086 + .025*ao)[:,:,None]*(.86 + .14*sky)
    local_light = ambient_floor + .30*bounce
    radiance = .214041 + solid[:,:,None]*(local_light-.214041)
    shafts = np.zeros_like(z)
    for contour, density in VARIANTS["shafts"][scene]:
        shafts = np.maximum(shafts, blur(matte(contour),1.7)*density)
    shafts *= (.59+.41*day_visibility) * (1-.80*weight("cavity")) * (1-.67*metal)
    # The near door beam passes behind the fitted bellows, not through them.
    shafts *= 1 - .95*weight("leather")
    light = np.dstack([quantize(srgb(np.clip(radiance,0,1)),2),quantize(shafts,2)])
    medium_map = np.dstack([quantize(metal,4),quantize(wet,4),quantize(ao,4),quantize(emissive,2)])
    return surface, medium_map, light, source


def png(pixels):
    buf = io.BytesIO()
    Image.fromarray(pixels).save(buf, format="PNG", compress_level=9)
    return buf.getvalue()


def sha(data):
    return hashlib.sha256(data).hexdigest()


def main():
    pool, ids, layouts, records, proofs = [], {}, {}, {}, []
    for state in source_states():
        surface, medium, light, source = bake(state)
        fields = {}
        hashes = {}
        for name, array in [("surface",surface),("medium",medium),("light",light)]:
            data = png(array)
            h = sha(data)
            if h not in ids:
                ids[h] = len(pool)
                pool.append("data:image/png;base64," + base64.b64encode(data).decode("ascii"))
            fields[name] = ids[h]
            hashes[name] = h
        key, plate = state["key"], state["plate"]
        layouts[key] = [plate, fields["surface"], fields["medium"], fields["light"]]
        records[key] = {"scene":state["scene"], "plate":plate, "plate_sha256":sha((DIST/plate).read_bytes()),
                        "png_sha256":hashes}
        # Every plate has an overview. Tint only gated receivers and relief.
        overlay = source * .62
        overlay[:,:,1] += medium[:,:,1]/255 * .73
        overlay[:,:,2] += medium[:,:,1]/255 * .65
        overlay[:,:,0] += medium[:,:,0]/255 * .95
        overlay[:,:,0] += medium[:,:,3]/255
        overlay[:,:,2] += medium[:,:,0]/255 * .79
        overlay[:,:,0] += np.maximum(surface[:,:,2].astype(float)-128,0)/255*.95
        thumb = Image.fromarray(quantize(np.clip(overlay,0,1),1))
        proofs.append((key,thumb))
    compact = dict(separators=(",",":"))
    js = """// Generated by adventure/tools/bake_materials.py. Packed RGBA data, unpremultiplied.
(function (root, factory) {
  const atlas = factory();
  if (typeof module === 'object' && module.exports) module.exports = atlas;
  else root.CastawayMaterialAtlas = atlas;
})(typeof window === 'undefined' ? globalThis : window, function () {
  'use strict';
  const images = IMAGES;
  const layouts = LAYOUTS;
  const rules = RULES;
  const cache = new Map();
  function get(sceneId, flags = {}) {
    if (!Object.prototype.hasOwnProperty.call(rules, sceneId)) return null;
    const [key] = rules[sceneId].find(([, ...needed]) => needed.every(flag => flags && flags[flag]));
    if (!cache.has(key)) {
      const [plate, s, m, l] = layouts[key];
      cache.set(key, Object.freeze({key, plate, width: 256, height: 144, surface: images[s], medium: images[m], light: images[l]}));
    }
    return cache.get(key);
  }
  return Object.freeze({get});
});
""".replace("LAYOUTS",json.dumps(layouts,**compact)).replace("RULES",json.dumps(VARIANTS["layouts"],**compact)).replace("IMAGES",json.dumps(pool,**compact))
    destination = DIST / "material-atlas.js"
    destination.write_text(js)
    manifest = {"format":1, "canvas_px":SIZE, "png_count":len(pool),
                "atlas_bytes":len(js.encode()), "atlas_sha256":sha(js.encode()), "layouts":records}
    (DIST/"assets/materials").mkdir(exist_ok=True)
    (DIST/"assets/materials/manifest.json").write_text(json.dumps(manifest, indent=2)+"\n")
    columns = 4
    preview = Image.new("RGB",(columns*WIDTH, (HEIGHT+20)*((len(proofs)+columns-1)//columns)),(29,33,34))
    for i,(key,thumb) in enumerate(proofs):
        x,y=(i%columns)*WIDTH,(i//columns)*(HEIGHT+20)
        preview.paste(thumb,(x,y))
        ImageDraw.Draw(preview).text((x+5,y+HEIGHT+2),key,fill=(242,234,210))
    preview.save(SOURCE/"registrace.webp",quality=79,method=6)
    print(f"{len(layouts)} layouts, {len(pool)} unique PNGs, {len(js.encode()):,} bytes, sha256 {manifest['atlas_sha256']}")


if __name__ == "__main__":
    main()
