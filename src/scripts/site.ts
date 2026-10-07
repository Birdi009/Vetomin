import { withBase, navigation, publicEndpoint } from '../lib/urls';
import type { Decision } from '../data/cases';

const root=document.documentElement;
const base=withBase('',document.body.dataset.base || '/');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const fine=matchMedia('(pointer:fine)');
const $=<T extends Element=HTMLElement>(selector:string,parent:ParentNode=document)=>parent.querySelector<T>(selector);
const $$=<T extends Element=HTMLElement>(selector:string,parent:ParentNode=document)=>Array.from(parent.querySelectorAll<T>(selector));
const prefs={get(key:string){try{return localStorage.getItem('qc:'+key)}catch{return null}},set(key:string,value:string){try{localStorage.setItem('qc:'+key,value)}catch{/* Storage is optional. */}}};
function query(name:string,value:string){const url=new URL(location.href);value?url.searchParams.set(name,value):url.searchParams.delete(name);history.replaceState(null,'',url);}
function text(selector:string,value:string,parent:ParentNode=document){const el=$(selector,parent);if(el)el.textContent=value;}
const analytics=publicEndpoint(import.meta.env.PUBLIC_ANALYTICS_ENDPOINT);
function track(name:string,detail:Record<string,string|number>={}){
  // Explicit opt-in; never transmit inquiry contents, email addresses or search strings.
  if(!analytics||prefs.get('analytics')!=='yes'||navigator.doNotTrack==='1'||(navigator as Navigator & {globalPrivacyControl?:boolean}).globalPrivacyControl)return;
  const body=JSON.stringify({name,path:location.pathname,detail,ts:Date.now()});
  void fetch(analytics,{method:'POST',headers:{'content-type':'application/json'},body,keepalive:true,credentials:'omit'}).catch(()=>{});
}
function initTheme(){
  const controls=$$<HTMLButtonElement>('[data-theme-toggle]');
  const dark=()=>root.dataset.theme?root.dataset.theme==='dark':matchMedia('(prefers-color-scheme:dark)').matches;
  const label=()=>controls.forEach(b=>b.setAttribute('aria-label',dark()?'Switch to light theme':'Switch to dark theme'));
  controls.forEach(b=>{b.hidden=false;b.addEventListener('click',()=>{const next=dark()?'light':'dark';root.dataset.theme=next;prefs.set('theme',next);label();track('theme_change',{theme:next});});});label();
}
function initMenu(){
  const menu=$<HTMLDetailsElement>('.mobile-menu');if(!menu)return;
  const summary=$<HTMLElement>('summary',menu);
  const close=(restore=false)=>{menu.open=false;if(restore)summary?.focus();};
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.open)close(true);});
  document.addEventListener('click',e=>{if(menu.open&&e.target instanceof Node&&!menu.contains(e.target))close();});
  $$('a',menu).forEach(a=>a.addEventListener('click',()=>close()));
  menu.addEventListener('focusout',()=>setTimeout(()=>{if(menu.open&&!menu.contains(document.activeElement))close();},0));
  matchMedia('(min-width:1001px)').addEventListener('change',e=>{if(e.matches)close();});
}
interface SearchResult{url:string;meta?:{title?:string};excerpt?:string;plain_excerpt?:string;}
interface Pagefind{options:(options:Record<string,string>)=>Promise<void>;search:(q:string)=>Promise<{results:{data:()=>Promise<SearchResult>}[]}>;}
let pagefindPromise:Promise<Pagefind>|undefined;
function getSearch(){
  if(!pagefindPromise)pagefindPromise=(async()=>{const pf=await import(/* @vite-ignore */ withBase('pagefind/pagefind.js',base)) as Pagefind;await pf.options({baseUrl:base,metaCacheTag:document.body.dataset.build||'local'});return pf;})().catch(error=>{pagefindPromise=undefined;throw error;});
  return pagefindPromise;
}
const destinations=[...navigation,['Atlas','projects/atlas/'],['Fieldnote','projects/fieldnote/'],['Threshold','projects/threshold/'],['Colophon','colophon/']] as readonly (readonly string[])[];
function resultLink(result:SearchResult):HTMLAnchorElement|null{
  const url=new URL(result.url,location.origin);
  if(url.origin!==location.origin||!url.pathname.startsWith(base))return null;
  const a=document.createElement('a');a.href=url.href;
  const strong=document.createElement('strong');strong.textContent=result.meta?.title||url.pathname;a.append(strong);
  if(result.plain_excerpt||result.excerpt){const small=document.createElement('small');const parsed=new DOMParser().parseFromString(result.plain_excerpt||result.excerpt||'','text/html');small.textContent=parsed.body.textContent||'';a.append(small);}
  return a;
}
function initSearch(){
  const dialog=$<HTMLDialogElement>('#command-palette');const input=$<HTMLInputElement>('#command-input');const results=$('#command-results');const status=$('#search-status');
  if(!dialog||!input||!results||!status)return;
  let lastFocus:HTMLElement|null=null;let generation=0;let timer:ReturnType<typeof setTimeout>;
  const defaults=()=>{results.replaceChildren(...destinations.map(([name,to])=>{const a=document.createElement('a');a.href=withBase(to,base);a.textContent=name;return a;}));status.textContent='Choose a page or type to search.';};
  const run=async(value:string)=>{const ticket=++generation;clearTimeout(timer);const term=value.trim().slice(0,120);if(!term){defaults();return;}status.textContent='Searching…';results.setAttribute('aria-busy','true');
    try{const pf=await getSearch();const found=await pf.search(term);const data=await Promise.all(found.results.slice(0,8).map(x=>x.data()));if(ticket!==generation)return;const links=data.map(resultLink).filter((x):x is HTMLAnchorElement=>!!x);results.replaceChildren(...links);status.textContent=links.length?`${links.length} result${links.length===1?'':'s'} found.`:'No results. Try another word or use the navigation below.';track('search_used',{query_length:term.length,result_count:links.length});}
    catch{if(ticket!==generation)return;defaults();status.textContent='Search is temporarily unavailable. Navigation is still available below.';}
    finally{if(ticket===generation)results.removeAttribute('aria-busy');}
  };
  const open=()=>{if(!dialog.open){lastFocus=document.activeElement instanceof HTMLElement?document.activeElement:null;dialog.showModal();defaults();input.value='';}input.focus();};
  $$<HTMLAnchorElement>('[data-command-open]').forEach(a=>a.addEventListener('click',e=>{if(!e.ctrlKey&&!e.metaKey&&!e.shiftKey&&typeof dialog.showModal==='function'){e.preventDefault();open();}}));
  $('[data-command-close]')?.addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>{generation++;clearTimeout(timer);results.removeAttribute('aria-busy');lastFocus?.focus();});
  document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();open();}});
  input.addEventListener('input',()=>{generation++;clearTimeout(timer);timer=setTimeout(()=>void run(input.value),140);if(!input.value)void run('');});
  const pageInput=$<HTMLInputElement>('[data-page-search]');const pageButton=$<HTMLButtonElement>('[data-page-search-open]');
  if(pageInput&&pageButton){pageButton.hidden=false;pageButton.addEventListener('click',()=>{open();input.value=pageInput.value;void run(input.value);});}
  if(location.pathname===withBase('search/',base)){const q=new URL(location.href).searchParams.get('q');if(q){open();input.value=q;void run(q);}}
}
function initFilters(){
  const buttons=$$<HTMLButtonElement>('[data-filter]');if(!buttons.length)return;
  const projects=$$('[data-project]');const choices=new Set(buttons.map(b=>b.dataset.filter));
  const apply=(value:string,persist=false)=>{const v=choices.has(value)?value:'all';let count=0;buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===v)));projects.forEach(p=>{p.hidden=v!=='all'&&!(p.dataset.service||'').split(',').includes(v);if(!p.hidden)count++;});text('#filter-status',`${count} route${count===1?'':'s'} found`);const empty=$('[data-filter-empty]');if(empty)empty.hidden=count>0;if(persist)query('service',v==='all'?'':v);track('filter_changed',{count});};
  buttons.forEach(b=>b.addEventListener('click',()=>apply(b.dataset.filter||'all',true)));$('[data-reset-filter]')?.addEventListener('click',()=>apply('all',true));
  const restore=()=>apply(new URL(location.href).searchParams.get('service')||'all');restore();window.addEventListener('popstate',restore);const controls=$('[data-filter-controls]');if(controls)controls.hidden=false;
}
interface Recommendation{value:string;name:string;copy:string;url:string;}
function initRecommendations(){
  $$('[data-recommender]').forEach(el=>{const data=$('script[data-recommend-data]',el)?.textContent;if(!data)return;const rows=JSON.parse(data) as Recommendation[];const buttons=$$<HTMLButtonElement>('[data-intent]',el);
    const apply=(value:string,persist=false)=>{const row=rows.find(r=>r.value===value)||rows[0];buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.intent===row.value)));text('[data-recommend-title]',`Start with ${row.name}`,el);text('[data-recommend-copy]',row.copy,el);const a=$<HTMLAnchorElement>('[data-recommend-link]',el);if(a){a.href=row.url;a.textContent=`Explore ${row.name} →`;}if(persist){query('intent',row.value);track('intent_selected',{intent:row.value});}};
    buttons.forEach(b=>b.addEventListener('click',()=>apply(b.dataset.intent||'strategy',true)));const restore=()=>apply(new URL(location.href).searchParams.get('intent')||'strategy');restore();window.addEventListener('popstate',restore);const controls=$('[data-intent-controls]',el);if(controls)controls.hidden=false;
  });
}
function initComparisons(){
  $$('[data-comparison]').forEach(box=>{const input=$<HTMLInputElement>('input[type=range]',box);const after=$('.after',box);const frame=$('[data-before-after]',box);if(!input||!after||!frame)return;
    const render=()=>{const value=Math.max(0,Math.min(100,Number(input.value)));after.style.clipPath=`inset(0 ${100-value}% 0 0)`;frame.style.setProperty('--compare',`${value}%`);input.setAttribute('aria-valuetext',`${value}% redesigned interface`);$$('[data-compare-value]',box).forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.compareValue)===value)));text('[data-compare-status]',value===0?'Showing the complete starting concept.':value===100?'Showing the complete redesigned concept.':`Showing ${value}% of the redesigned concept.`,box);};
    input.addEventListener('input',render);$$('[data-compare-value]',box).forEach(b=>b.addEventListener('click',()=>{input.value=b.dataset.compareValue||'50';render();}));render();$$('[data-enhancement]',box).forEach(x=>x.hidden=false);
  });
}
function initDiagrams(){
  $$('[data-diagram]').forEach(box=>{const data=$('script[data-decision-data]',box)?.textContent;if(!data)return;const rows=JSON.parse(data) as Decision[];
    $$('[data-diagram-step]',box).forEach(b=>b.addEventListener('click',()=>{const index=Number(b.dataset.diagramStep);const row=rows[index];if(!row)return;$$('[data-diagram-step]',box).forEach(x=>x.setAttribute('aria-pressed',String(x===b)));text('[data-decision-title]',row.title,box);text('[data-decision-observation]',row.observation,box);text('[data-decision-choice]',row.choice,box);text('[data-decision-effect]',row.effect,box);}));$$('[data-enhancement]',box).forEach(x=>x.hidden=false);
  });
}
function initContact(){
  const form=$<HTMLFormElement>('#contact-form');if(!form)return;
  const status=$('#form-status',form);const summary=$('#form-errors',form);const endpoint=publicEndpoint(form.dataset.endpoint);const send=$<HTMLButtonElement>('[data-send]',form);const preview=$<HTMLTextAreaElement>('[data-draft-preview]',form);const previewBox=$('[data-draft-box]',form);let sending=false;let started=Date.now();
  const get=(name:string)=>$<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>(`[name="${name}"]`,form);
  const project=new URL(location.href).searchParams.get('project');const mapping:Record<string,string>={Atlas:'Strategy / systems',Fieldnote:'Identity / web',Threshold:'Research / product'};if(project&&mapping[project]){const field=get('project');if(field)field.value=mapping[project];}
  const validate=()=>{let first:HTMLElement|null=null;const errors:string[]=[];['name','email','message'].forEach(name=>{const field=get(name);if(!field)return;const value=field.value.trim();let error='';if(name==='name'&&!value)error='Please enter your name.';if(name==='email'&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))error='Enter an email address such as name@example.com.';if(name==='message'&&value.length<20)error='Describe the change in at least 20 characters.';field.setAttribute('aria-invalid',String(!!error));text(`#${name}-error`,error,form);if(error){errors.push(error);first??=field;}});if(summary){summary.hidden=!errors.length;summary.textContent=errors.length?`Please correct ${errors.length} field${errors.length===1?'':'s'} below. ${errors.join(' ')}`:'';}if(first)first.focus();return !errors.length;};
  const draft=()=>`Quiet Compass project brief\n\nName: ${get('name')?.value||''}\nEmail: ${get('email')?.value||''}\nProject: ${get('project')?.value||''}\nTiming: ${get('timing')?.value||''}\n\n${get('message')?.value||''}`;
  $('[data-prepare]',form)?.addEventListener('click',()=>{if(preview&&previewBox){preview.value=draft();previewBox.hidden=false;preview.focus();if(status)status.textContent='Draft prepared on this device. Nothing has been sent.';}});
  $('[data-copy]',form)?.addEventListener('click',async()=>{if(!preview)return;preview.value=draft();try{await navigator.clipboard.writeText(preview.value);if(status)status.textContent='Draft copied. Nothing has been sent.';}catch{preview.focus();preview.select();if(status)status.textContent='Copy is unavailable. The draft is selected so you can copy it manually.';}});
  $('[data-download]',form)?.addEventListener('click',()=>{const url=URL.createObjectURL(new Blob([draft()],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='quiet-compass-project-brief.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);if(status)status.textContent='Draft saved on your device. Nothing has been sent.';});
  form.addEventListener('submit',async event=>{event.preventDefault();if(sending||!validate())return;if(!endpoint){if(status)status.textContent='Online delivery is not enabled. You can prepare, copy, or save your draft below.';return;}if(Date.now()-started<1200){if(status)status.textContent='Please take a moment to review your note, then send it.';return;}
    sending=true;if(send)send.disabled=true;form.setAttribute('aria-busy','true');if(status)status.textContent='Sending your project note…';const payload=Object.fromEntries(new FormData(form));const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),15000);
    try{const response=await fetch(endpoint,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({...payload,startedAt:started}),signal:controller.signal,credentials:'omit'});const result=await response.json();if(!response.ok||result.ok!==true)throw new Error(response.status===429?'Please wait a little before trying again.':'The inquiry service could not accept this message.');if(status)status.textContent='Message accepted by the inquiry service. Thank you for the project note.';form.reset();if(previewBox)previewBox.hidden=true;started=Date.now();track('contact_succeeded');}
    catch(error){if(status)status.textContent=`${error instanceof Error&&error.name==='AbortError'?'The request timed out.':error instanceof Error?error.message:'Could not send.'} Your message is still here. Retry, or save a copy.`;track('contact_failed');}
    finally{clearTimeout(timeout);sending=false;if(send)send.disabled=false;form.removeAttribute('aria-busy');}
  });
  form.noValidate=true;$$('[data-enhancement]',form).forEach(x=>x.hidden=false);if(send)send.hidden=!endpoint;
}
function initMotion(){
  let scheduled=false;const paint=()=>{scheduled=false;const height=root.scrollHeight-innerHeight;root.style.setProperty('--progress',`${height>0?Math.min(100,100*scrollY/height):0}%`);};window.addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(paint);}},{passive:true});paint();
  if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>{const entry=entries.filter(x=>x.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(!entry)return;const target=entry.target as HTMLElement;$$('.compass').forEach(c=>c.style.setProperty('--bearing',`${target.dataset.bearing||0}deg`));$$<HTMLAnchorElement>('[data-route-link]').forEach(a=>{if(a.hash==='#'+target.id)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});},{rootMargin:'-15% 0px -55% 0px',threshold:0});$$('section[id]').forEach(s=>observer.observe(s));}
  $$('.magnetic,[data-tilt]').forEach(el=>{el.addEventListener('pointermove',event=>{if(reduced.matches||!fine.matches)return;const e=event as PointerEvent;const box=el.getBoundingClientRect();const x=(e.clientX-box.left-box.width/2)*.025;const y=(e.clientY-box.top-box.height/2)*.025;el.style.transform=`translate(${x}px,${y}px)`;});el.addEventListener('pointerleave',()=>el.style.transform='');});reduced.addEventListener('change',()=>$$('.magnetic,[data-tilt]').forEach(el=>el.style.transform=''));
}
function initAnalytics(){
  $$<HTMLButtonElement>('[data-analytics-consent]').forEach(b=>{b.hidden=!analytics;b.setAttribute('aria-pressed',String(prefs.get('analytics')==='yes'));b.addEventListener('click',()=>{const enabled=prefs.get('analytics')!=='yes';prefs.set('analytics',enabled?'yes':'no');b.setAttribute('aria-pressed',String(enabled));text('[data-analytics-status]',enabled?'Optional performance sharing enabled.':'Optional performance sharing disabled.');if(enabled)loadVitals();});});
  const loadVitals=()=>{if(!analytics||prefs.get('analytics')!=='yes')return;void import('web-vitals').then(({onCLS,onINP,onLCP})=>{[onCLS,onINP,onLCP].forEach(fn=>fn(metric=>track('web_vital',{name:metric.name,value:metric.value,rating:metric.rating})));}).catch(()=>{});};loadVitals();
}
function initOffline(){
  if(!('serviceWorker'in navigator)||!isSecureContext)return;
  const register=()=>{void navigator.serviceWorker.register(withBase('sw.js',base),{scope:base,updateViaCache:'none'}).catch(()=>{document.body.dataset.offline='unavailable';});};
  if(document.readyState==='complete')register();else window.addEventListener('load',register,{once:true});
}
// An optional feature failing must never stop navigation, reading or the form.
for(const initialize of [initTheme,initMenu,initSearch,initFilters,initRecommendations,initComparisons,initDiagrams,initContact,initMotion,initAnalytics,initOffline]){try{initialize();}catch(error){console.warn(`Quiet Compass: ${initialize.name} unavailable`,error);}}
