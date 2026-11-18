#!/usr/bin/env python3
"""Offline scene-scale composition from production stage metadata and original PNGs.
Run from any directory with Python/Pillow and Node. No browser capture is implied.
"""
import json, subprocess
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[2]
DIST = ROOT / 'dist'
OUT = Path(__file__).resolve().parent
JS = r'''
const E=require('./voyage.js'), S=require('./stage-direction.js'), A=require('./voyage-art.js'), W=require('./voyage-world.js');
const cases=[['beach',1,'rope'],['cabin',2,'kettle'],['forge',3,'leather'],['crossing',5,'bailer'],['return_camp',7,'campTable'],['slipway',4,'resin']];
const data=cases.map(([scene,chapter,action])=>{let state=E.createGame();state.scene=scene;state.chapter=chapter;
 let targets=E.getTargets(state).map(t=>S.stageTarget(scene,t,state));
 return {background:W.background(state)||'assets/'+scene+'.png',scene,chapter,action,targets,profile:S.profile(scene), companions:[...new Set([...targets.filter(t=>t.kind==='person').map(t=>t.id),...S.companions(scene,state)])].map(id=>({id,...S.workStation(scene,id,state)}))};});
console.log(JSON.stringify({data,art:A.props}));
'''
raw = subprocess.check_output(['node', '-e', JS], cwd=DIST)
info = json.loads(raw)
manifest = json.loads((DIST/'assets/work-poses/manifest.json').read_text())['assets']
W,H=840,473
font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',16)
small=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',12)

def target_art(scene,t):
    if t.get('paint') is False or t.get('kind') == 'person': return None
    art=t.get('art') or ({'sail':'canvas'}.get(t['id'])) or (t['id'] if t['id'] in ['rope','pole','prybar','cairn','driftwood'] else None)
    return info['art'].get(art)

def prop(im,t):
    a=target_art('',t)
    if not a: return
    x,y,w,h=a['box']; src=Image.open(DIST/a['file']).convert('RGBA').crop((x,y,x+w,y+h))
    tw=W*t.get('artWidth',t.get('w',8))/100; th=H*t.get('artHeight',t.get('h',12))/100
    src.thumbnail((round(tw),round(th)),Image.Resampling.LANCZOS)
    src=src.rotate(-t.get('artAngle',0),resample=Image.Resampling.BICUBIC,expand=True)
    im.alpha_composite(src,(round(W*t['x']/100-src.width/2),round(H*t['y']/100-src.height/2)))

def height(profile,y):
    lo,hi=profile['walk'][2:4]; p=max(0,min(1,(y-lo)/(hi-lo)))
    return profile['heightFar']+p*(profile['heightNear']-profile['heightFar'])

def person(im,id,pose,x,y,face,profile):
    a=manifest[id]; p=a['poses'][pose if pose in a['poses'] else 'stand']; c=p['crop']; g=p['ground']
    src=Image.open(DIST/a['atlas']).convert('RGBA').crop((c[0],c[1],c[0]+c[2],c[1]+c[3]))
    # Host is heightAt, as in the runtime; pose matches the gait standing height.
    scale=(height(profile,y)*H/100/a['walkView'][1])*(a['walkStandingHeight']/(a['poses']['stand']['ground'][1]-a['poses']['stand']['alphaBounds'][1]))
    src=src.resize((round(src.width*scale),round(src.height*scale)),Image.Resampling.LANCZOS)
    gx=(g[0]-c[0])*scale; gy=(g[1]-c[1])*scale
    if face=='left': src=src.transpose(Image.Transpose.FLIP_LEFT_RIGHT); gx=src.width-gx
    im.alpha_composite(src,(round(W*x/100-gx),round(H*y/100-gy)))

def frame(case):
    im=Image.open(DIST/case['background']).convert('RGBA').resize((W,H),Image.Resampling.LANCZOS)
    for t in case['targets']: prop(im,t)
    # Workstation poses are a static instant. A target approach demonstrates the player action.
    action=next((t for t in case['targets'] if t['id']==case['action']),None)
    entries=[]
    for p in case['companions']:
        if p.get('x') is not None and p.get('y') is not None: entries.append((p['y'],p['id'],p.get('pose','stand'),p['x'],p['y'],p.get('facing','right')))
    if action and action.get('approach'):
        foot=action['approach']; role='musgrave' if case['chapter']>=6 else 'player'
        face='right' if action['x']>=foot['x'] else 'left'
        entries.append((foot['y'],role,action.get('pose','stand'),foot['x'],foot['y'],face))
    for _,id,pose,x,y,face in sorted(entries): person(im,id,pose,x,y,face,case['profile'])
    return im.convert('RGB')

sheet=Image.new('RGB',(W*2+36, (H+44)*3+42),'#e8dfcb'); d=ImageDraw.Draw(sheet)
d.text((12,10),'OFFLINE COMPOSITING PROOF  ·  production coordinates, original paintings and crops',font=font,fill='#332e27')
for i,case in enumerate(info['data']):
    x=12+(i%2)*(W+12); y=38+(i//2)*(H+44)
    sheet.paste(frame(case),(x,y)); d.text((x,y+H+7),f"{case['scene']}  ·  action: {case['action']}  ·  chapter {case['chapter']}",font=small,fill='#332e27')
sheet.save(OUT/'scene-scale-proof.webp','WEBP',quality=84,method=6)
