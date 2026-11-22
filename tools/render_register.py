#!/usr/bin/env python3
"""Render source register from curated JSON; never fetch or upgrade reading status."""
import json
from pathlib import Path
R=Path(__file__).resolve().parents[1]
rows=json.loads((R/'data/sources.json').read_text())
last_check = max(row['checked_at'] for row in rows)
lines=['# Registr pramenů','',f'Registr obsahuje {len(rows)} položek. Poslední kontrola vybraných záznamů proběhla {last_check}. ID jsou stabilní a nové prameny se přidávají na konec. Rozsah četby nebo prohlídky uvádíme jednotlivě.','', '**Stavy:** `inspected_text` = uvedený krátký text přečten celý; `inspected_passages` = cílené pasáže; `inspected_indexed_ocr` = text čten přes index, bez kontroly sazby; `inspected_metadata` = jen katalog/anotace; `inspected_image` = celý obraz a jeho knihovní záznam; `inspected_indexed_excerpt` / `inspected_indexed_metadata` = jen indexovaný úryvek / metadata; `discovered_*` = stopa, nikoli přečtený pramen.','', 'Stejná `dependency_group` upozorňuje na sdílené svědectví: přetisky jednoho dopisu nejsou nezávislí svědkové. [Strojová data](../data/sources.json) · [Čtenářské poznámky](notes/READING_NOTES.md) · [Akvizice](ACQUISITION.md).','']
for r in rows:
 lines += [f'## {r["source_id"]} — {r["title"]}','',f'{r["creator"]} · {r["date"]} · `{r["kind"]}`','',f'[Otevřít pramen]({r["url"]})','',f'- Stav: `{r["inspection_status"]}`.',f'- Prohlédnutý rozsah: {r["inspected_scope"]}',f'- Práva: {r["rights"]}',f'- Závislost: `{r["dependency_group"]}`.',f'- Poznámka: {r["notes"] or "—"}']
 for p in r.get('local_files',[]):lines += [f'- Lokálně: [{Path(p).name}](../{p}).']
 lines += ['']
(R/'sources/REGISTER.md').write_text('\n'.join(lines),encoding='utf-8')
print(f'Rendered {len(rows)} sources')
