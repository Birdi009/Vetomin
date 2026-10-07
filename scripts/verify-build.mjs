import {readFileSync,writeFileSync,readdirSync,existsSync,mkdirSync} from 'node:fs';
import {join,extname} from 'node:path';
import {gzipSync} from 'node:zlib';
import {parse} from 'parse5';
const walk=(dir)=>readdirSync(dir,{withFileTypes:true}).flatMap(x=>x.isDirectory()?walk(join(dir,x.name)):[join(dir,x.name)]);
const files=walk('dist');const html=files.filter(x=>x.endsWith('.html'));
const documents=new Map();
function nodes(node,output=[]){output.push(node);for(const child of node.childNodes||[])nodes(child,output);return output;}
for(const file of html)documents.set(file,nodes(parse(readFileSync(file,'utf8'))));
const attrs=node=>Object.fromEntries((node.attrs||[]).map(x=>[x.name,x.value]));
const home=documents.get('dist/index.html');if(!home)throw new Error('Home page missing');
const base=attrs(home.find(n=>n.tagName==='body'))['data-base'];if(!base.startsWith('/')||!base.endsWith('/'))throw new Error('Base must be slash-terminated');
const canonical=home.find(n=>n.tagName==='link'&&attrs(n).rel==='canonical');const origin=new URL(attrs(canonical).href).origin;
const sha=process.env.PUBLIC_BUILD_SHA||process.env.GITHUB_SHA||'development';
if(process.env.REQUIRE_LIVE_CONTACT==='true'&&!process.env.PUBLIC_CONTACT_ENDPOINT)throw new Error('Live contact required, but endpoint is not configured');
for(const key of ['PUBLIC_CONTACT_ENDPOINT','PUBLIC_ANALYTICS_ENDPOINT'])if(process.env[key]){const u=new URL(process.env[key]);if(u.protocol!=='https:'||u.username||u.password)throw new Error(`${key} must be a public HTTPS endpoint without credentials`);}
writeFileSync('dist/manifest.webmanifest',JSON.stringify({name:'Quiet Compass',short_name:'Quiet Compass',id:base,start_url:base,scope:base,display:'standalone',background_color:'#f3efe7',theme_color:'#f3efe7',icons:[{src:base+'icon.svg',sizes:'any',type:'image/svg+xml'}]},null,2));
writeFileSync('dist/robots.txt',`User-agent: *\nAllow: /\nSitemap: ${origin}${base}sitemap-index.xml\n`);
writeFileSync('dist/sw.js',readFileSync('dist/sw.js','utf8').replace('__BUILD__',sha));
let checked=0;const failures=[];
function validate(value,from,fragment=true){
  if(!value||value.startsWith('data:')||value.startsWith('mailto:')||value.startsWith('tel:'))return;
  const current=base+from.replace(/^dist\//,'').replace(/index\.html$/,'');const u=new URL(value,new URL(current,origin));
  if(u.origin!==origin)return;
  if(!u.pathname.startsWith(base)){failures.push(`${from}: escapes base ${value}`);return;}
  const relative=decodeURIComponent(u.pathname.slice(base.length));let target=join('dist',relative);if(u.pathname.endsWith('/'))target=join(target,'index.html');
  if(!existsSync(target)){failures.push(`${from}: missing ${value}`);return;}checked++;
  if(fragment&&u.hash&&target.endsWith('.html')){const id=decodeURIComponent(u.hash.slice(1));const doc=documents.get(target);if(!doc?.some(n=>attrs(n).id===id))failures.push(`${from}: missing fragment ${value}`);}
}
for(const [file,doc]of documents){
  if(!doc.some(n=>n.tagName==='h1'))failures.push(`${file}: missing h1`);
  for(const node of doc){const a=attrs(node);for(const key of ['href','src'])if(a[key])validate(a[key],file);if(a.srcset)for(const candidate of a.srcset.split(','))validate(candidate.trim().split(/\s+/)[0],file,false);if(a.property==='og:image')validate(a.content,file,false);}
}
for(const file of files.filter(x=>x.endsWith('.css'))){for(const match of readFileSync(file,'utf8').matchAll(/url\(['"]?([^)'"\s]+)['"]?\)/g))validate(match[1],file,false);}
const resources=files.filter(x=>/\.(?:js|css|woff2|webp|avif|png|svg|webmanifest|xml)$/.test(x)).map(x=>base+x.replace(/^dist\//,''));
const routes=html.filter(x=>!x.endsWith('/404.html')).map(x=>base+x.replace(/^dist\//,'').replace(/index\.html$/,''));
const javascript=files.filter(x=>x.includes('/_astro/')&&x.endsWith('.js')).reduce((sum,x)=>sum+gzipSync(readFileSync(x)).byteLength,0);
const fonts=files.filter(x=>x.endsWith('.woff2')).reduce((sum,x)=>sum+readFileSync(x).byteLength,0);
if(javascript>60000)failures.push(`Bundled JavaScript budget exceeded: ${javascript} gzip bytes`);
if(fonts>200000)failures.push(`Font budget exceeded: ${fonts} bytes`);
const release={sha,base,routes,resources,contactConfigured:!!process.env.PUBLIC_CONTACT_ENDPOINT,analyticsConfigured:!!process.env.PUBLIC_ANALYTICS_ENDPOINT,checkedReferences:checked,javascriptGzipBytes:javascript,fontBytes:fonts};
writeFileSync('dist/release.json',JSON.stringify(release,null,2));mkdirSync('.quality',{recursive:true});writeFileSync('.quality/build-report.json',JSON.stringify({...release,failures},null,2));
if(failures.length)throw new Error(failures.join('\n'));
console.log(`Verified ${checked} internal references, ${routes.length} pages, ${resources.length} assets. JS ${javascript} gzip bytes; fonts ${fonts} bytes. Base: ${base}`);
