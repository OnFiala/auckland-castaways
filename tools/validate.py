#!/usr/bin/env python3
"""Offline integrity checks for the research package. No claims of historical proof."""
import csv,hashlib,json,re,sys
from collections import Counter
from pathlib import Path
from urllib.parse import unquote,urlsplit
R=Path(__file__).resolve().parents[1]
errors=[]
def expect(ok,msg):
 if not ok:errors.append(msg)
def read_csv(p):
 with (R/p).open(encoding='utf-8',newline='') as f:return list(csv.DictReader(f))
sources=json.loads((R/'data/sources.json').read_text());sid={r['source_id'] for r in sources}
evidence=read_csv('data/evidence.csv');eid={r['evidence_id'] for r in evidence}
crew=read_csv('data/crew.csv');claims=read_csv('data/claims.csv');cid={r['claim_id'] for r in claims}
events=json.loads((R/'data/events.json').read_text())['events'];manifest=json.loads((R/'sources/acquisition-manifest.json').read_text())
expect(len(sid)==len(sources),'Duplicate source ID')
expect(len(eid)==len(evidence),'Duplicate evidence ID')
expect(len(cid)==len(claims),'Duplicate claim ID')
expect(len({r['person_id'] for r in crew})==len(crew),'Duplicate person ID')
expect(len({r['event_id'] for r in events})==len(events),'Duplicate event ID')
for r in sources:
 for k in ['url','inspection_status','inspected_scope','rights','dependency_group']:expect(bool(r.get(k)),f'{r["source_id"]}: missing {k}')
 for p in r.get('local_files',[]):expect((R/p).is_file(),f'Missing source file {p}')
for kind,rows in [('evidence',evidence),('crew',crew),('claims',claims)]:
 for r in rows:
  for s in r.get('source_ids','').split(';'):
   if s:expect(s in sid,f'{kind}: unknown source {s}')
  for e in r.get('evidence_ids','').split(';'):
   if e:expect(e in eid,f'{kind}: unknown evidence {e}')
for r in events:
 expect(r['kind'] in {'fiction','composite_fiction','fiction_based_on_event','source_note'},f'{r["event_id"]}: undeclared fiction boundary')
 for s in r['source_ids']:expect(s in sid,f'event unknown {s}')
 for e in r['evidence_ids']:expect(e in eid,f'event unknown {e}')
 for c in r['choices']:expect(bool(c.get('effects')),f'empty choice effects {r["event_id"]}')
expect(sum(x['person_id'].startswith('G') for x in crew)==5,'Grafton roster must have5 provisional IDs')
expect(sum(x['person_id'].startswith('I') for x in crew)==25,'Invercauld roster must have25 provisional IDs')
expect(sum(x['outcome']=='rescued May 1865' for x in crew)==3,'Invercauld rescued roster must have3')
expect(sum('5/5 rescued'==x['outcome'] for x in crew)==5,'Grafton rescued roster must have5')
hashed=0
for item in manifest['items']:
 expect(item['source_id'] in sid,f'manifest unknown source {item["source_id"]}')
 if 'sha256' not in item:continue
 p=R/item['path'];expect(p.is_file(),f'manifest missing file {item["path"]}')
 if p.is_file():
  b=p.read_bytes();expect(len(b)==item['bytes'],f'byte mismatch {item["path"]}');expect(hashlib.sha256(b).hexdigest()==item['sha256'],f'SHA mismatch {item["path"]}');hashed+=1
# Links are checked for local targets; generated GitHub heading slugs are not a parser contract.
links=0
for p in R.rglob('*.md'):
 if '.git' in p.parts:continue
 text=p.read_text()
 for label,target in re.findall(r'\[([^\]]*)\]\(([^\s)]+)\)',text):
  if urlsplit(target).scheme or target.startswith('#'):continue
  target=unquote(target.split('#')[0]);q=(p.parent/target).resolve();links+=1
  expect(q.exists(),f'{p.relative_to(R)}: broken local link {target}')
 for s in re.findall(r'\bS\d{3}\b',text):expect(s in sid,f'{p.relative_to(R)} unknown {s}')
 for e in re.findall(r'\bE\d{3}\b',text):expect(e in eid,f'{p.relative_to(R)} unknown {e}')
 for c in re.findall(r'\bC\d{3}\b',text):expect(c in cid,f'{p.relative_to(R)} unknown {c}')
# Data must not accidentally promote provisional camp coordinates.
geo=json.loads((R/'data/places.geojson').read_text())
for f in geo['features']:
 expect(f['properties']['source_id'] in sid,'GeoJSON unknown source')
 if f['id'] in {'P03','P04','P05','P06'}:expect(f['geometry'] is None,f'{f["id"]}: unverified camp/wreck fix must remain null')
# Scan publishable plain text for credential forms, without ever printing matching values.
patterns=[r'gh[pousr]_[A-Za-z0-9]{30,}',r'github_pat_[A-Za-z0-9_]{30,}',r'-----BEGIN [A-Z ]*PRIVATE KEY-----',r'AKIA[A-Z0-9]{16}']
for p in R.rglob('*'):
 if not p.is_file() or '.git' in p.parts or p.suffix not in {'.md','.json','.csv','.txt','.py','.svg','.geojson'}:continue
 text=p.read_text(encoding='utf-8',errors='replace')
 for pattern in patterns:expect(not re.search(pattern,text),f'Potential credential pattern in {p.relative_to(R)}; inspect privately')
summary={'sources':len(sources),'source_statuses':dict(Counter(r['inspection_status'] for r in sources)),'evidence_entries':len(evidence),'crew_rows':len(crew),'claims':len(claims),'design_events':len(events),'hashed_files':hashed,'local_links_checked':links,'errors':errors}
print(json.dumps(summary,ensure_ascii=False,indent=2))
sys.exit(1 if errors else 0)
