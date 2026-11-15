#!/usr/bin/env python3
"""Check transport availability of registered URLs; this does not inspect their claims."""
import concurrent.futures,datetime,html,json,re,urllib.request,urllib.error
from pathlib import Path
R=Path(__file__).resolve().parents[1]
def check(row):
 out={'source_id':row['source_id'],'url':row['url'],'checked_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'reading_status_unchanged':row['inspection_status']}
 try:
  req=urllib.request.Request(row['url'],headers={'User-Agent':'AucklandCastawaysResearchLinkCheck/0.1'})
  with urllib.request.urlopen(req,timeout=12) as r:
   out.update(http_status=r.status,final_url=r.url,content_type=r.headers.get('Content-Type',''))
   # Read a bounded prefix for basic page identity, no archival copy of modern text.
   if 'html' in out['content_type']:
    body=r.read(98304).decode('utf-8',errors='replace')
    title=re.search(r'<title[^>]*>(.*?)</title>',body,re.S|re.I)
    if title:out['page_title']=html.unescape(re.sub(r'\s+',' ',title.group(1))).strip()[:250]
    if re.search(r'Access Denied|Oh noes!|Just a moment|Checking your browser|Making sure.*bot|Anubis',body,re.I):out['content_warning']='possible access wall; HTTP success does not establish access to source'
   out['transport_result']='responded'
 except urllib.error.HTTPError as e:out.update(http_status=e.code,transport_result='http_error',error=str(e))
 except Exception as e:out.update(transport_result='request_failed',error=str(e)[:250])
 return out
rows=json.loads((R/'data/sources.json').read_text())
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:results=list(pool.map(check,rows))
report={'purpose':'Transport and identity clues only. Does not change inspection status or prove historical accuracy. 403/iframe/dynamic pages may have been read separately via web search.','checked_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'results':results}
(R/'reports/link-check.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
from collections import Counter
print(json.dumps(dict(Counter(str(x.get('http_status',x['transport_result'])) for x in results)),ensure_ascii=False))
