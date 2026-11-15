#!/usr/bin/env python3
"""Render dated evidence without inventing precision for approximate dates."""
import csv,re
from pathlib import Path
R=Path(__file__).resolve().parents[1]
with (R/'data/evidence.csv').open(newline='',encoding='utf-8') as f:rows=list(csv.DictReader(f))
def key(r):
 m=re.match(r'(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?',r['date'])
 return tuple(int(x or 0) for x in m.groups())+(r['evidence_id'],)
rows.sort(key=key)
lines=['# Chronologický evidenční deník','', 'Každá položka je tvrzení s konkrétní oporou. Řazení používá nejranější udanou časovou hranici; záznamy s přesností jen na rok stojí na začátku příslušného roku a **neznamená to**, že se staly před přesně datovanými lednovými událostmi. Rozsahy se mohou překrývat. Datum zápisu či vydání není automaticky datem popisované události. Stabilní ID se při doplnění nepřečíslovávají.','', '`well_supported` neznamená nezávislost všech citací. [Strojová data](../data/evidence.csv) · [Prameny](../sources/REGISTER.md) · [Rozpory](CONFLICTS.md).','']
for r in rows:
 lines += [f'## {r["evidence_id"]} — {r["date"]}: {r["group"]}','',r['claim_cs'],'',f'- Opora: {r["source_ids"]}; {r["locator"]}.',f'- Posouzení: `{r["assessment"]}`; přesnost data: `{r["date_precision"]}`.',f'- Omezení: {r["qualification"]}',f'- Scénář: {r["story_nodes"] or "bez herního uzlu"}.','']
(R/'research/CHRONOLOGY.md').write_text('\n'.join(lines),encoding='utf-8')
print(f'Rendered {len(rows)} evidence entries chronologically by reported lower bound')
