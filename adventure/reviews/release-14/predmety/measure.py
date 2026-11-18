"""Recheck native asset bounds against production geometry and draw annotated plates."""
import json
import math
import re
import subprocess
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFont, ImageOps

HERE = Path(__file__).resolve().parent
DIST = HERE.parents[2] / "dist"
register = r"""
const E=require('./voyage'), Stage=require('./stage-direction'), W=require('./voyage-world'), A=require('./voyage-art');
const vm=require('node:vm'),fs=require('node:fs'),host={};
vm.runInNewContext(fs.readFileSync('stage-life.js','utf8'),{window:host});
const rooms={};
for(const scene of E.SCENES) {
 const state={...E.createGame(),chapter:scene.chapter,scene:scene.id};
 const entries=E.getTargets(state).map(original=>{
   const t=Stage.stageTarget(scene.id,W.stageTarget(original,state),state);
   return {...t,source:t.artWidth?A.props[t.art||t.id]:null};
 });
 rooms[scene.id]=Object.fromEntries(entries.map(t=>[t.id,t]));
}
rooms.wreck.open=Stage.stageTarget('wreck',{id:'crate',kind:'puzzle'},{flags:{crateOpen:true}});
rooms.wreck.block=host.CastawayLife.features({scene:'wreck',flags:{}})[0];
console.log(JSON.stringify(rooms));
"""
rooms = json.loads(subprocess.check_output(["node", "-e", register], cwd=DIST))
css = (DIST / "stage.css").read_text()
ink = (135, 249, 205)
px = 1600
py = 900


def shape(selector):
    rule = css[css.rindex(selector):]
    pairs = re.search(r"clip-path:\s*polygon\(([^)]+)\)", rule)[1].split(",")
    return [tuple(float(v.strip("%")) / 100 for v in pair.split()) for pair in pairs]


def asset(target):
    source = target["source"]
    x, y, w, h = source["box"]
    with Image.open(DIST / source["file"]) as atlas:
        return atlas.crop((x, y, x+w, y+h)).convert("RGBA")


def guide(canvas, points):
    ImageDraw.Draw(canvas).line(points + [points[0]], fill=ink, width=3, joint="curve")


def outline(plate, t, points=None):
    points = points or [(0,0), (1,0), (1,1), (0,1)]
    guide(plate, [((t["x"] + (u-.5)*t["w"])*px/100,
                   (t["y"] + (v-.5)*t["h"])*py/100) for u, v in points])


def plate(name):
    with Image.open(DIST/"assets/tidepaint"/(name+".webp")) as background:
        return background.convert("RGB").resize((px,py), Image.Resampling.LANCZOS)


def draw_prop(canvas, t):
    prop = asset(t)
    scale = min(t["artWidth"]*px/100/prop.width,t["artHeight"]*py/100/prop.height)
    prop = prop.resize(tuple(round(v*scale) for v in prop.size),Image.Resampling.LANCZOS)
    prop = prop.rotate(-t.get("artAngle",0),Image.Resampling.BICUBIC,expand=True)
    xy = (round(t["x"]*px/100-prop.width/2),round(t["y"]*py/100-prop.height/2))
    canvas.paste(prop,xy,prop)
    outline(canvas,t)


def check_silhouette(alpha, points):
    mask = Image.new("L", alpha.size)
    ImageDraw.Draw(mask).polygon([(u*mask.width,v*mask.height) for u,v in points], fill=255)
    solid = alpha.point(lambda a: 255 if a>=12 else 0)
    assert ImageChops.subtract(solid,mask).getbbox() is None, "An inked pixel lies beyond the hit contour"


count = 0
for room in rooms.values():
    for t in room.values():
        if not t.get("source"):
            continue
        count += 1
        prop = asset(t)
        angle = math.radians(t.get("artAngle",0))
        scale = min(t["artWidth"]*px/100/prop.width,t["artHeight"]*py/100/prop.height)
        # For each inked scanline the extreme transformed points are its two ends.
        solid = prop.getchannel("A").point(lambda a: 255 if a>=64 else 0)
        cos, sin = math.cos(angle), math.sin(angle)
        for row in range(prop.height):
            bounds = solid.crop((0,row,prop.width,row+1)).getbbox()
            if not bounds:
                continue
            for col in (bounds[0], bounds[2]-1):
                x = (col + .5 - prop.width/2)*scale
                y = (row + .5 - prop.height/2)*scale
                assert abs(cos*x - sin*y)<=t["w"]*px/200, t["id"]
                assert abs(sin*x + cos*y)<=t["h"]*py/200, t["id"]

beach = plate("beach")
for key in ("driftwood","rope","pole","sail"):
    draw_prop(beach,rooms["beach"][key])
raynal = rooms["beach"]["raynal"]
meta = json.loads((DIST/"assets/shore-rest/manifest.json").read_text())
rest = Image.open(DIST/"assets/shore-rest/raynal.webp").convert("RGBA")
rest_shape = shape(".staged .shore-rest img {")
check_silhouette(rest.getchannel("A"), rest_shape)
height = py*raynal["h"]/100*meta["heightInStandingHeights"]
scale = height/rest.height
left = px*raynal["x"]/100-(rest.width-meta["ground"][0])*scale
top = py*raynal["groundY"]/100-meta["ground"][1]*scale
width = rest.width*scale
rest = ImageOps.mirror(rest.resize((round(width),round(height)),Image.Resampling.LANCZOS))
beach.paste(rest, (round(left),round(top)),rest)
guide(beach,[(left+(1-u)*width,top+v*height) for u,v in rest_shape])

wreck = plate("wreck-open")
draw_prop(wreck,rooms["wreck"]["prybar"])
open_shape = shape('[data-target="crate"]::before {\n  clip-path')
outline(wreck,rooms["wreck"]["open"],open_shape)
t = rooms["wreck"]["block"]
strip = Image.open(DIST/"assets/tactile/reeved-block.webp").convert("RGBA")
size = strip.width//9
block = strip.crop((0,0,size,strip.height))
block_shape = shape('[data-target="wreck_hawser"]::before {\n  clip-path')
for i in range(9):
    check_silhouette(strip.getchannel("A").crop((i*size,0,(i+1)*size,strip.height)),block_shape)
x,y,w,h = t["materialBox"]
block = block.resize((round(px*w/100),round(py*h/100)),Image.Resampling.LANCZOS)
wreck.paste(block,(round(x*px/100),round(y*py/100)),block)
outline(wreck,t,block_shape)

harbour,landing = plate("harbour"),plate("landing")
for scene,canvas,target in [("harbour",harbour,"rescueCutter"),("landing",landing,"rescueBoat")]:
    outline(canvas,rooms[scene][target],shape(f'[data-target="{target}"]::before {{\n  clip-path'))
draw_prop(landing,rooms["landing"]["rescueLine"])

font = ImageFont.truetype("DejaVuSans.ttf", 17)
small = ImageFont.truetype("DejaVuSans.ttf", 15)
panels = [
    (beach,(275,248,1390,727),"Pláž · poleno, lano, tyč, plachta a sedící Raynal"),
    (wreck,(265,272,1320,767),"Vrak · vedení kladky, páčidlo a otevřená truhla"),
    (harbour,(120,415,920,652),"Přístav · Flying Scud a nástupní lávka"),
    (landing,(266,378,923,595),"Návrat · člun a smotané přistávací lano"),
]
proof = Image.new("RGB",(1040,660),"#14282b")
draw = ImageDraw.Draw(proof)
for i,(canvas,box,title) in enumerate(panels):
    left,top = 12+(i%2)*514,15+(i//2)*310
    crop = canvas.crop(box)
    crop.thumbnail((500,250), Image.Resampling.LANCZOS)
    proof.paste(crop,(left,top+34+(250-crop.height)//2))
    draw.text((left,top),title,fill="white",font=font)
draw.text((12,630),"Měření nad původními malbami  •  zelená = aktivní obrys  •  nejde o snímek prohlížeče",font=small,fill=ink)
proof.save(HERE/"obrysy.webp",quality=90,method=6)
print(f"{count} atlas registrations in {len(rooms)} rooms; seated Raynal and 9 pulley poses match their pointer contours.")
