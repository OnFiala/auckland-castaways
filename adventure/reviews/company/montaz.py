"""Rastrová kontrola rozvržení. Pouští herní moduly v Node bez prohlížeče."""
import hashlib
import json
import math
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps

OUT = Path(__file__).resolve().parent
DIST = OUT.parents[1] / 'dist'
ASSETS = DIST / 'assets'
LANCZOS = Image.Resampling.LANCZOS
JS = """
const E=require('./voyage'), S=require('./stage-direction'), W=require('./voyage-world'),
      T=require('./voyage-stories'), A=require('./voyage-art');
const cases=[['beach',1],['wreck',1],['slipway',4]];
const rooms=cases.map(([scene,chapter])=>{
 const state={...E.createGame(),scene,chapter}, player={...S.profile(scene).entry.default,id:'player',pose:'stand',facing:'right'};
 const targets=E.getTargets(state).map(t=>S.stageTarget(scene,W.stageTarget(t,state),state));
 const actors=targets.filter(t=>t.kind==='person').map(t=>({id:t.id,...S.workStation(scene,t.id,state)}));
 let turns=scene==='beach'?T.arrival(state):T.conversation('musgrave',state);
 const turn=turns[scene==='beach'?2:0];
 if(scene!=='beach'){
   const other=actors.find(person=>person.id==='musgrave'), side=player.x<other.x?-1:1;
   Object.assign(player,S.groundPoint(scene,other.x+side*S.heightAt(scene,other.y)*.26,other.y+1));
   player.facing=side===1?'left':'right'; other.facing=side===1?'right':'left';
 }
 actors.push(player);
 for(const actor of actors)actor.height=S.heightAt(scene,actor.y);
 return {scene,background:W.background(state),targets,actors,turn,speaker:T.speakerInfo(turn.id,state)};
});
console.log(JSON.stringify({rooms,art:A.props}));
"""
data = json.loads(subprocess.check_output(['node', '-e', JS], cwd=DIST))
sheets = json.loads((ASSETS/'work-poses/manifest.json').read_text())['assets']
rest = json.loads((ASSETS/'shore-rest/manifest.json').read_text())


def render_stage(room, width):
    height = round(width*9/16)
    frame = Image.open(DIST/room['background']).convert('RGBA').resize((width,height),LANCZOS)
    cloth_edge=[]
    head_edge=[]
    for t in room['targets']:
        if t.get('paint') is False or t['kind']=='person' or t.get('artHidden'):
            continue
        key = t.get('art') or {'sail':'canvas'}.get(t['id'],t['id'])
        if key not in data['art'] or not t.get('artWidth'):
            continue
        prop=data['art'][key]
        x,y,w,h=prop['box']
        sprite=Image.open(DIST/prop['file']).convert('RGBA').crop((x,y,x+w,y+h))
        sprite.thumbnail((round(width*t['artWidth']/100),round(height*t['artHeight']/100)),LANCZOS)
        sprite=sprite.rotate(-t.get('artAngle',0),Image.Resampling.BICUBIC,expand=True)
        left=round(width*t['x']/100-sprite.width/2)
        top=round(height*t['y']/100-sprite.height/2)
        frame.alpha_composite(sprite,(left,top))
        if room['scene']=='beach' and t['id']=='sail':
            for yy in range(sprite.height):
                row=[xx for xx in range(sprite.width) if sprite.getpixel((xx,yy))[3]>=128]
                if row: cloth_edge.append((left+min(row),top+yy))

    for actor in sorted(room['actors'],key=lambda a:a['y']):
        sheet=sheets[actor['id']]
        relative_height=height*actor['height']/100
        if room['scene']=='beach' and actor['id']=='raynal':
            assert (actor['x'],actor['y'])==(77.8,72.1) and rest['heightInStandingHeights']==.635
            sprite=Image.open(ASSETS/'shore-rest'/rest['file']).convert('RGBA')
            scale=relative_height*rest['heightInStandingHeights']/sprite.height
            gx,gy=rest['ground']
        else:
            pose=sheet['poses'][actor['pose']]
            x,y,w,h=pose['crop']
            sprite=Image.open(DIST/sheet['atlas']).convert('RGBA').crop((x,y,x+w,y+h))
            scale=relative_height/sheet['walkView'][1]*sheet['walkStandingHeight']/sheet['standingHeight']
            gx,gy=pose['ground'][0]-x,pose['ground'][1]-y
        sprite=sprite.resize((round(sprite.width*scale),round(sprite.height*scale)),LANCZOS)
        gx,gy=gx*scale,gy*scale
        if actor['facing']=='left':
            sprite=ImageOps.mirror(sprite);gx=sprite.width-gx
        left=round(width*actor['x']/100-gx)
        top=round(height*actor['y']/100-gy)
        frame.alpha_composite(sprite,(left,top))
        if room['scene']=='beach' and actor['id']=='player':
            for yy in range(round(sprite.height*.20)):
                row=[xx for xx in range(sprite.width) if sprite.getpixel((xx,yy))[3]>=128]
                if row: head_edge.append((left+max(row),top+yy))
    separation={}
    if room['scene']=='beach':
        assert cloth_edge and head_edge and max(x for x,y in head_edge)<min(x for x,y in cloth_edge)
        separation['cap_to_sail_px']=round(min(math.dist(p,q) for p in head_edge for q in cloth_edge),1)
    return frame.convert('RGB'),separation


def spectral(size,weight):
    return ImageFont.truetype(str(ASSETS/'lettering'/f'spectral-{weight}.woff2'),round(size))


def wrap(text,font,width):
    lines=[]
    for word in text.split():
        if lines and font.getlength(lines[-1]+' '+word)<=width:
            lines[-1]+=' '+word
        else:
            lines.append(word)
    return lines


def rail(room,width):
    narrow=width<=700
    gap=12 if narrow else round(max(12,min(29,.02*width)))
    pad=12 if narrow else round(max(12,min(48,.034*width)))
    portrait=52 if narrow else round(max(52,min(84,.068*width)))
    body=max(16,min(24,.0185*width));name=max(13,min(17,.012*width))
    ctrl=31 if narrow else 110
    textx=pad+portrait+gap
    font=spectral(body,400);head=spectral(name,600)
    maxw=min(width-textx-pad-ctrl-gap,65*font.getlength('0'))
    lines=wrap(room['turn']['text'],font,maxw)
    lead=body*1.27;gap_y=body*.24;head_h=name*1.16
    block=head_h+gap_y+lead*len(lines)
    h=max(107 if narrow else 128,math.ceil(22+max(block,portrait,84 if narrow else 36)))
    tex=Image.open(ASSETS/'ui/materials/canvas.webp').convert('RGB')
    tex=tex.resize((round(tex.width*h/tex.height),h),LANCZOS)
    row=Image.new('RGB',(width,h))
    for x in range(0,width,tex.width):row.paste(tex,(x,0))
    tint=Image.new('RGBA',(width,h))
    d=ImageDraw.Draw(tint)
    stops=[(0,(22,35,42,238)),(.47,(38,48,54,242)),(1,(23,35,40,245))]
    for x in range(width):
        fraction=x/(width-1); (a,c),(b,e)=stops[:2] if fraction<.47 else stops[1:]
        col=tuple(round(v+(u-v)*(fraction-a)/(b-a)) for v,u in zip(c,e))
        d.line((x,0,x,h-1),fill=col)
    row=Image.alpha_composite(row.convert('RGBA'),tint)
    d=ImageDraw.Draw(row);d.line((0,0,width,0),fill='#817565');d.line((0,h-1,width,h-1),fill='#817565')
    face=Image.open(DIST/room['speaker']['portrait']).convert('RGB').resize((portrait,portrait),LANCZOS)
    y=(h-portrait)//2
    mask=Image.new('L',face.size,0);ImageDraw.Draw(mask).rounded_rectangle((0,0,portrait-1,portrait-1),radius=3,fill=255)
    d.rounded_rectangle((pad-1,y-1,pad+portrait,y+portrait),radius=3,outline='#9a9080')
    row.paste(face,(pad,y),mask)
    top=(h-block)/2;d.text((textx,round(top+head_h/2)),room['speaker']['speaker'],font=head,fill='#e6c994',anchor='lm')
    for idx,line in enumerate(lines):
        d.text((textx,round(top+head_h+gap_y+(idx+.5)*lead)),line,font=font,fill='#faf2df',anchor='lm')
    # Same three marks and order as the embedded SVG controls; no live controls in a raster proof.
    for i,paths in enumerate([[[(9,6),(9,18)],[(15,6),(15,18)]],[[(9,5),(16,12),(9,19)]],[[(6,6),(18,18)],[(18,6),(6,18)]]]):
        cx=width-pad-ctrl+(15.5 if narrow else 17+38*i);cy=h/2+(28*(i-1) if narrow else 0)
        for path in paths:
            d.line([(round(cx+(xx-12)*.78),round(cy+(yy-12)*.78)) for xx,yy in path],fill='#eadfc8',width=2)
    assert max(font.getlength(line) for line in lines)<=maxw and block<=h-20
    return row.convert('RGB'),{'columns_px':width,'portrait_px':portrait,'font_px':round(body),'lines':lines,'rail_px':h}


def make(room,width):
    stage,separation=render_stage(room,width);bar,metrics=rail(room,width)
    metrics.update(separation)
    img=Image.new('RGB',(width,stage.height+bar.height));img.paste(stage);img.paste(bar,(0,stage.height))
    return img,metrics


checks=[]
for room in data['rooms']:
    for width in ([1152,390] if room['scene']=='beach' else [960]):
        image,metrics=make(room,width)
        file=f"{room['scene']}-{width}.webp"
        image.save(OUT/file,'WEBP',quality=89,method=6)
        checks.append(dict(file=file,background=room['background'],size=image.size,actors=room['actors'],
                           backdrop_sha256=hashlib.sha256((DIST/room['background']).read_bytes()).hexdigest(),
                           dialogue_portrait=room['speaker']['portrait'],**metrics))
        if room['scene']=='beach':
            companion,player=room['actors']
            assert player['facing']=='right' and companion['facing']=='left'
            assert 8 < companion['x']-player['x'] < 16
            assert not player['y']==companion['y']
(OUT/'mereni.json').write_text(json.dumps(checks,indent=2,ensure_ascii=False)+'\n')
