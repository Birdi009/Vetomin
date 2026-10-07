#!/usr/bin/env python3
"""Crawl the generated artifact, not source templates. No third-party packages required."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urljoin, urlsplit, unquote
import json, re, gzip, sys, xml.etree.ElementTree as ET
root=Path('dist').resolve()
release=json.loads((root/'release.json').read_text())
base=release['base']; origin='https://birdi009.github.io'
errors=[]; checked=set(); documents={}
class Page(HTMLParser):
 def __init__(self,text):
  super().__init__(convert_charrefs=True);self.links=[];self.ids=set();self.meta={};self.canonical=None;self.h1=0;self.transitions=[];self.feed(text)
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if a.get('id'):self.ids.add(a['id'])
  if tag=='h1':self.h1+=1
  if tag=='meta':self.meta[a.get('name',a.get('property',''))]=a.get('content','')
  if tag=='link' and a.get('rel')=='canonical':self.canonical=a.get('href')
  for key in ('href','src','poster'):
   if a.get(key):self.links.append((tag,key,a[key]))
  if a.get('srcset'):
   self.links.extend((tag,'srcset',part.strip().split()[0]) for part in a['srcset'].split(',') if part.strip())
  if a.get('style'):self.transitions.extend(re.findall(r'view-transition-name:\s*([\w-]+)',a['style']))
for path in root.rglob('*.html'):
 route=base+str(path.relative_to(root)).replace('index.html','')
 documents[route]=Page(path.read_text())
 if documents[route].canonical:origin=urlsplit(documents[route].canonical).scheme+'://'+urlsplit(documents[route].canonical).netloc

def resolve(raw,current,check_anchor=True):
 if raw.startswith(('data:','mailto:','tel:','javascript:')):
  if raw.startswith('javascript:'):errors.append(f'{current}: javascript URL')
  return
 url=urlsplit(urljoin(origin+current,raw))
 if url.netloc!=urlsplit(origin).netloc:return
 if not url.path.startswith(base):errors.append(f'{current}: resource escapes base: {raw}');return
 relative=unquote(url.path[len(base):]);file=root/relative
 if url.path.endswith('/'):file=file/'index.html'
 if not file.is_file():errors.append(f'{current}: missing {raw}');return
 checked.add(str(file.relative_to(root)))
 if check_anchor and url.fragment and url.path in documents and unquote(url.fragment) not in documents[url.path].ids:errors.append(f'{current}: missing anchor {raw}')
for route,page in documents.items():
 if page.h1!=1:errors.append(f'{route}: expected one h1, got {page.h1}')
 if not page.meta.get('description'):errors.append(f'{route}: no description')
 if not page.canonical or urlsplit(page.canonical).query:errors.append(f'{route}: missing or queried canonical')
 for tag,key,url in page.links:resolve(url,route)
 for key in ('og:image','og:url'):
  if not page.meta.get(key):errors.append(f'{route}: missing {key}')
  else:resolve(page.meta[key],route,False)
 if len(page.transitions)!=len(set(page.transitions)):errors.append(f'{route}: duplicate view-transition name')
for path in root.rglob('*.css'):
 for url in re.findall(r'url\([\s\"\']*([^\)\"\']+)',path.read_text()):resolve(url,base+str(path.relative_to(root)),False)
manifest=json.loads((root/'manifest.webmanifest').read_text())
for icon in manifest.get('icons',[]):resolve(icon['src'],base+'manifest.webmanifest',False)
for path in root.glob('sitemap*.xml'):
 for node in ET.fromstring(path.read_text()).iter():
  if node.tag.endswith('loc') and node.text:resolve(node.text,base,False)
for route in release['pages']:
 if route not in documents:errors.append(f'release inventory missing HTML: {route}')
js=[path for path in (root/'_astro').glob('*.js')]
for path in js:
 size=len(gzip.compress(path.read_bytes()))
 if size>40000:errors.append(f'JS budget exceeded: {path.name} = {size} gzip bytes')
for path in root.rglob('*.woff2'):
 if path.stat().st_size>160000:errors.append(f'font budget exceeded: {path.name}')
report={'pages':len(documents),'resources':len(checked),'base':base,'errors':errors}
Path('build-audit.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report,indent=2))
if errors:sys.exit(1)
