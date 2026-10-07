import { normalizeBase } from '../lib/urls.mjs';

const all = <T extends Element = HTMLElement>(selector: string, parent: ParentNode = document): T[] => [...parent.querySelectorAll<T>(selector)];
const one = <T extends Element = HTMLElement>(selector: string, parent: ParentNode = document): T | null => parent.querySelector<T>(selector);
const root = document.documentElement;
const base = normalizeBase(document.body.dataset.base || '/');
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const prefs = {
  get(key: string): string | null { try { return localStorage.getItem('qc:' + key); } catch { return null; } },
  set(key: string, value: string | null) { try { if (value === null) localStorage.removeItem('qc:' + key); else localStorage.setItem('qc:' + key, value); } catch { /* Storage is an optional preference, not a prerequisite. */ } }
};
const analyticsURL = document.body.dataset.analyticsEndpoint || '';
const privacyAllows = () => Boolean(analyticsURL) && prefs.get('analytics') === 'allowed' && navigator.doNotTrack !== '1' && !(navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl;
function track(name: string, detail: Record<string, string | number | boolean> = {}) {
  if (!privacyAllows()) return;
  const payload = JSON.stringify({ name, path: location.pathname, detail, ts: Date.now() });
  if (navigator.sendBeacon?.(analyticsURL, new Blob([payload], { type: 'application/json' }))) return;
  void fetch(analyticsURL, { method: 'POST', headers: { 'content-type': 'application/json' }, body: payload, keepalive: true, credentials: 'omit' }).catch(() => {});
}
let vitalsStarted = false;
async function startVitals() {
  if (!privacyAllows() || vitalsStarted) return;
  vitalsStarted = true;
  try {
    const { onCLS, onINP, onLCP } = await import('web-vitals');
    const device = matchMedia('(max-width: 820px)').matches ? 'mobile' : 'desktop';
    [onCLS, onINP, onLCP].forEach(register => register(metric => track('web_vital', { metric: metric.name, value: metric.value, device })));
  } catch { vitalsStarted = false; }
}

function initTheme() {
  const system = matchMedia('(prefers-color-scheme: dark)');
  const dark = () => root.dataset.theme === 'dark' || (!root.dataset.theme && system.matches);
  const buttons = all<HTMLButtonElement>('[data-theme-toggle]');
  const update = () => {
    buttons.forEach(button => { button.setAttribute('aria-pressed', String(dark())); button.setAttribute('aria-label', dark() ? 'Switch to light theme' : 'Switch to dark theme'); });
    one('meta[name="theme-color"]')?.setAttribute('content', dark() ? '#111610' : '#f3efe7');
    all<HTMLSelectElement>('[data-theme-select]').forEach(select => { select.value = root.dataset.theme || 'system'; });
  };
  buttons.forEach(button => { button.addEventListener('click', () => { root.dataset.theme = dark() ? 'light' : 'dark'; prefs.set('theme', root.dataset.theme); update(); track('theme_change', { theme: root.dataset.theme }); }); button.hidden = false; });
  all<HTMLSelectElement>('[data-theme-select]').forEach(select => select.addEventListener('change', () => { const value = select.value; if (value === 'light' || value === 'dark') root.dataset.theme = value; else delete root.dataset.theme; prefs.set('theme', root.dataset.theme || null); update(); }));
  system.addEventListener('change', update);
  update();
}

function initMenu() {
  const menu = one<HTMLDetailsElement>('[data-mobile-menu]');
  if (!menu) return;
  document.addEventListener('pointerdown', event => { if (menu.open && event.target instanceof Node && !menu.contains(event.target)) menu.open = false; });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && menu.open) { menu.open = false; one<HTMLElement>('summary', menu)?.focus(); } });
  all<HTMLAnchorElement>('a', menu).forEach(link => link.addEventListener('click', () => { menu.open = false; }));
  matchMedia('(min-width: 1041px)').addEventListener('change', event => { if (event.matches) menu.open = false; });
}

interface SearchData { url: string; excerpt?: string; meta?: { title?: string }; }
interface Pagefind { options(options: { baseUrl: string }): Promise<void>; search(query: string): Promise<{ results: { data(): Promise<SearchData> }[] }>; }
function initSearch() {
  const dialog = one<HTMLDialogElement>('#command-palette');
  const input = one<HTMLInputElement>('#command-input');
  const results = one<HTMLElement>('#search-results');
  const status = one<HTMLElement>('#search-status');
  if (!dialog || !input || !results || !status || typeof dialog.showModal !== 'function') return;
  let lastFocus: HTMLElement | null = null;
  let request = 0;
  let timer: ReturnType<typeof setTimeout>;
  let modulePromise: Promise<Pagefind> | null = null;
  const open = () => {
    if (!dialog.open) { lastFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null; const menu = one<HTMLDetailsElement>('[data-mobile-menu]'); if (menu) menu.open = false; dialog.showModal(); }
    input.focus();
  };
  all<HTMLButtonElement>('[data-command-open]').forEach(button => { button.addEventListener('click', open); button.hidden = false; });
  one<HTMLButtonElement>('[data-command-close]')?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => { request++; clearTimeout(timer); if (lastFocus?.isConnected && lastFocus.getClientRects().length) lastFocus.focus(); });
  dialog.addEventListener('click', event => { if (event.target === dialog) { const box = dialog.getBoundingClientRect(); if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close(); } });
  document.addEventListener('keydown', event => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); open(); } });
  dialog.addEventListener('keydown', event => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    const links = all<HTMLAnchorElement>('#search-results a, #command-results a', dialog);
    if (!links.length) return;
    const index = links.indexOf(document.activeElement as HTMLAnchorElement);
    event.preventDefault();
    links[event.key === 'ArrowDown' ? (index + 1) % links.length : (index <= 0 ? links.length - 1 : index - 1)].focus();
  });
  const runSearch = async (query: string, sequence: number) => {
    status.textContent = 'Searching…'; results.setAttribute('aria-busy', 'true');
    try {
      if (!modulePromise) modulePromise = import(/* @vite-ignore */ base + 'pagefind/pagefind.js').then(async (module: Pagefind) => { await module.options({ baseUrl: base }); return module; });
      const engine = await modulePromise;
      const matches = await engine.search(query);
      const data = await Promise.all(matches.results.slice(0, 6).map(result => result.data()));
      if (sequence !== request) return;
      const fragment = document.createDocumentFragment();
      for (const item of data) {
        const url = new URL(item.url, location.origin);
        if (url.origin !== location.origin || !url.pathname.startsWith(base)) continue;
        const link = document.createElement('a'); link.href = url.href;
        const title = document.createElement('strong'); title.textContent = item.meta?.title || url.pathname;
        const excerpt = document.createElement('small'); excerpt.textContent = (item.excerpt || '').replace(/<[^>]*>/g, '');
        link.append(title, excerpt); fragment.append(link);
      }
      results.replaceChildren(fragment);
      const count = results.childElementCount;
      status.textContent = count ? `${count} result${count === 1 ? '' : 's'} shown. Quick navigation is below.` : 'No matching pages. Try another word, or use quick navigation below.';
      track('search_used', { result_count: count });
    } catch {
      modulePromise = null;
      if (sequence === request) { results.replaceChildren(); status.textContent = 'Search is temporarily unavailable. Navigation is still available below.'; }
    } finally { if (sequence === request) results.removeAttribute('aria-busy'); }
  };
  input.addEventListener('input', () => {
    request++; clearTimeout(timer); const sequence = request; const query = input.value.trim();
    results.replaceChildren(); results.removeAttribute('aria-busy');
    if (!query) { status.textContent = 'Choose a destination below, or type to search.'; return; }
    timer = setTimeout(() => { void runSearch(query, sequence); }, 150);
  });
  status.textContent = 'Choose a destination below, or type to search.';
}

function initFilters() {
  const buttons = all<HTMLButtonElement>('[data-filter]');
  if (!buttons.length) return;
  const cards = all<HTMLElement>('[data-project]');
  const status = one<HTMLElement>('#filter-status');
  const values = new Set(buttons.map(button => button.dataset.filter!));
  const apply = (value: string, push = false) => {
    const active = values.has(value) ? value : 'all';
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === active)));
    let count = 0;
    cards.forEach(card => { card.hidden = active !== 'all' && !(card.dataset.service || '').split(',').includes(active); if (!card.hidden) count++; });
    if (status) status.textContent = `${count} route${count === 1 ? '' : 's'} found`;
    if (push) { const url = new URL(location.href); if (active === 'all') url.searchParams.delete('service'); else url.searchParams.set('service', active); history.pushState(null, '', url); prefs.set('filter-service', active); track('filter_changed', { count }); }
  };
  const params = new URLSearchParams(location.search);
  apply(params.get('service') ?? prefs.get('filter-service') ?? 'all');
  buttons.forEach(button => button.addEventListener('click', () => apply(button.dataset.filter!, true)));
  window.addEventListener('popstate', () => apply(new URLSearchParams(location.search).get('service') || 'all'));
  all<HTMLElement>('[data-filter-tools]').forEach(element => { element.hidden = false; });
}

function initIntent() {
  const buttons = all<HTMLButtonElement>('[data-intent]');
  if (!buttons.length) return;
  const panels = all<HTMLElement>('[data-recommendation]');
  const prompt = one<HTMLElement>('[data-intent-prompt]');
  const status = one<HTMLElement>('[data-intent-status]');
  const values = new Set(buttons.map(button => button.dataset.intent!));
  const apply = (value: string | null, push = false) => {
    const active = value && values.has(value) ? value : null;
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.intent === active)));
    panels.forEach(panel => { panel.hidden = panel.dataset.recommendation !== active; });
    if (prompt) prompt.hidden = Boolean(active);
    if (status) status.textContent = active ? `Recommendation updated for ${active}. The matching study is immediately below.` : 'Choose what you need to see a matching study.';
    if (push) { const url = new URL(location.href); if (active) url.searchParams.set('intent', active); else url.searchParams.delete('intent'); history.pushState(null, '', url); prefs.set('intent', active); if (active) track('intent_selected', { intent: active }); }
  };
  apply(new URLSearchParams(location.search).get('intent') || prefs.get('intent'));
  buttons.forEach(button => button.addEventListener('click', () => apply(button.dataset.intent!, true)));
  one('[data-intent-clear]')?.addEventListener('click', () => apply(null, true));
  window.addEventListener('popstate', () => apply(new URLSearchParams(location.search).get('intent')));
  all<HTMLElement>('[data-intent-tools]').forEach(element => { element.hidden = false; });
}

function initComparisons() {
  all<HTMLElement>('[data-compare]').forEach(box => {
    const range = one<HTMLInputElement>('input[type=range]', box);
    const after = one<HTMLElement>('.after', box);
    const stage = one<HTMLElement>('.comparison-stage', box);
    const output = one<HTMLOutputElement>('output', box);
    if (!range || !after || !stage) return;
    const apply = (value: number) => {
      value = Math.max(0, Math.min(100, value)); range.value = String(value);
      after.style.clipPath = `inset(0 ${100 - value}% 0 0)`; stage.style.setProperty('--compare', value + '%');
      const text = value === 0 ? 'Before design' : value === 100 ? 'After design' : `${value}% after design`;
      range.setAttribute('aria-valuetext', text); if (output) output.textContent = text;
      all<HTMLButtonElement>('[data-compare-snap]', box).forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.compareSnap) === value)));
    };
    range.addEventListener('input', () => apply(Number(range.value)));
    all<HTMLButtonElement>('[data-compare-snap]', box).forEach(button => button.addEventListener('click', () => apply(Number(button.dataset.compareSnap))));
    apply(50);
    const fallback = one<HTMLElement>('[data-comparison-fallback]', box); if (fallback) fallback.hidden = true;
    const enhanced = one<HTMLElement>('[data-comparison-enhanced]', box); if (enhanced) enhanced.hidden = false;
  });
}

function initDiagrams() {
  all<HTMLElement>('[data-diagram]').forEach(box => {
    const buttons = all<HTMLButtonElement>('[data-diagram-node]', box);
    const panels = all<HTMLElement>('[data-diagram-panel]', box);
    const apply = (id: string) => {
      buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.diagramNode === id)));
      panels.forEach(panel => { panel.hidden = panel.id !== id; });
      const status = one<HTMLElement>('[data-diagram-status]', box); if (status) status.textContent = panels.find(panel => panel.id === id)?.dataset.summary || '';
    };
    buttons.forEach(button => button.addEventListener('click', () => apply(button.dataset.diagramNode!)));
    if (buttons[0]) apply(buttons[0].dataset.diagramNode!);
    const controls = one<HTMLElement>('[data-diagram-controls]', box); if (controls) controls.hidden = false;
  });
}

function initContact() {
  const form = one<HTMLFormElement>('#contact-form');
  if (!form) return;
  const status = one<HTMLElement>('#form-status');
  const summary = one<HTMLElement>('#form-errors');
  const submit = one<HTMLButtonElement>('[data-contact-submit]', form);
  const output = one<HTMLTextAreaElement>('#brief-output');
  const started = Date.now();
  const startField = one<HTMLInputElement>('[name=startedAt]', form); if (startField) startField.value = String(started);
  const project = one<HTMLSelectElement>('[name=project]', form);
  const chosenProject = new URLSearchParams(location.search).get('project');
  const projects: Record<string, string> = { Atlas: 'Strategy / systems', Fieldnote: 'Identity / web', Threshold: 'Research / product' };
  if (project && chosenProject && projects[chosenProject]) project.value = projects[chosenProject];
  const value = (name: string) => String(new FormData(form).get(name) || '').trim();
  const brief = () => `Quiet Compass — project brief\n\nName: ${value('name')}\nEmail: ${value('email')}\nProject: ${value('project')}\nTiming: ${value('timing')}\n\n${value('message')}\n\nThis is a local draft, not a sent inquiry.`;
  const revealBrief = () => { const panel = one<HTMLElement>('[data-brief-panel]'); if (panel) panel.hidden = false; if (output) output.value = brief(); };
  one('[data-copy-brief]')?.addEventListener('click', async () => {
    revealBrief();
    try { await navigator.clipboard.writeText(brief()); if (status) status.textContent = 'Brief copied. Nothing has been sent.'; }
    catch { output?.focus(); output?.select(); if (status) status.textContent = 'Your brief is below. Select and copy it; nothing has been sent.'; }
  });
  one('[data-download-brief]')?.addEventListener('click', () => {
    const url = URL.createObjectURL(new Blob([brief()], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = 'quiet-compass-project-brief.txt'; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    if (status) status.textContent = 'Brief saved to your device. Nothing has been sent.';
  });
  all<HTMLElement>('[data-brief-tools]').forEach(element => { element.hidden = false; });
  let pending = false;
  form.noValidate = true;
  form.addEventListener('submit', async event => {
    event.preventDefault(); if (pending) return;
    const endpoint = form.dataset.endpoint || '';
    if (!endpoint) { revealBrief(); if (status) status.textContent = 'Delivery is not connected. You can copy or save this brief; nothing has been sent.'; return; }
    all<HTMLElement>('[data-field-error]', form).forEach(element => { element.textContent = ''; });
    all<HTMLElement>('[aria-invalid]', form).forEach(element => element.removeAttribute('aria-invalid'));
    const errors: [string, string][] = [];
    if (!value('name')) errors.push(['name', 'Enter your name.']);
    const emailInput = one<HTMLInputElement>('[name=email]', form);
    if (!value('email') || !emailInput?.validity.valid) errors.push(['email', 'Enter an email address such as name@example.com.']);
    if (value('message').length < 20 || value('message').length > 4000) errors.push(['message', 'Describe your project in 20 to 4,000 characters.']);
    if (summary) { summary.replaceChildren(); summary.hidden = !errors.length; }
    for (const [field, message] of errors) {
      one(`#${field}`, form)?.setAttribute('aria-invalid', 'true');
      const error = one(`[data-field-error=${field}]`, form); if (error) error.textContent = message;
      const link = document.createElement('a'); link.href = '#' + field; link.textContent = message; link.addEventListener('click', event => { event.preventDefault(); one<HTMLElement>('#' + field)?.focus(); }); summary?.append(link);
    }
    if (errors.length) { summary?.focus(); return; }
    pending = true; if (submit) submit.disabled = true; form.setAttribute('aria-busy', 'true'); if (status) status.textContent = 'Sending your project note…';
    const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(endpoint, { method: 'POST', credentials: 'omit', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: value('name'), email: value('email'), project: value('project'), timing: value('timing'), message: value('message'), website: value('website'), startedAt: started }), signal: controller.signal });
      const result = await response.json().catch(() => null);
      if (!response.ok || result?.ok !== true) throw new Error(response.status === 429 ? 'Please wait a moment, then try again.' : 'Delivery could not be confirmed.');
      if (status) status.textContent = 'Message sent. Your project note was accepted for email delivery.';
      form.reset(); if (startField) startField.value = String(Date.now()); track('contact_succeeded');
    } catch (error) {
      if (status) status.textContent = `${error instanceof Error && error.message.startsWith('Please wait') ? error.message : 'We could not confirm delivery. Please try again.'} Your message is still here. You can also save a copy.`;
      track('contact_failed');
    } finally { clearTimeout(timeout); pending = false; if (submit) submit.disabled = false; form.removeAttribute('aria-busy'); }
  });
}

function initMotion() {
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      if (!motion.matches && entry.target instanceof HTMLElement && 'animate' in entry.target) entry.target.animate([{ transform: 'translateY(8px)' }, { transform: 'none' }], { duration: 360, easing: 'cubic-bezier(.2,.8,.2,1)' });
    }), { threshold: .1 });
    all('[data-reveal]').forEach(element => observer.observe(element));
    const sections = all<HTMLElement>('section[id][data-element]');
    const orient = new IntersectionObserver(entries => { const current = entries.filter(entry => entry.isIntersecting).sort((a,b) => b.intersectionRatio-a.intersectionRatio)[0]; if (!current || !(current.target instanceof HTMLElement)) return; const target = current.target; all<HTMLElement>('.compass').forEach(compass => compass.style.setProperty('--bearing', (target.dataset.bearing || '35') + 'deg')); all<HTMLAnchorElement>('[data-route-link]').forEach(link => { const active = link.hash === '#' + target.id; link.classList.toggle('active', active); if (active) link.setAttribute('aria-current','location'); else link.removeAttribute('aria-current'); }); }, { rootMargin: '-15% 0px -45% 0px', threshold: 0 });
    sections.forEach(section => orient.observe(section));
  }
  if (matchMedia('(pointer:fine)').matches) {
    all<HTMLElement>('.magnetic,[data-tilt]').forEach(element => {
      element.addEventListener('pointermove', event => { if (motion.matches) return; const rect = element.getBoundingClientRect(); const x = (event.clientX - rect.left - rect.width/2) / rect.width; const y = (event.clientY - rect.top - rect.height/2) / rect.height; element.style.transform = element.hasAttribute('data-tilt') ? `perspective(1200px) rotateX(${-y*1.4}deg) rotateY(${x*1.4}deg)` : `translate(${x*3}px,${y*3}px)`; });
      element.addEventListener('pointerleave', () => { element.style.transform = ''; });
    });
  }
  motion.addEventListener('change', () => { if (motion.matches) { document.getAnimations().forEach(animation => animation.cancel()); all<HTMLElement>('.magnetic,[data-tilt]').forEach(element => { element.style.transform = ''; }); } });
}

function initPreferences() {
  all<HTMLSelectElement>('[data-analytics-select]').forEach(select => {
    select.value = prefs.get('analytics') === 'allowed' ? 'allowed' : 'denied';
    select.addEventListener('change', () => { prefs.set('analytics', select.value); void startVitals(); const status = one('[data-preferences-status]'); if (status) status.textContent = select.value === 'allowed' ? (analyticsURL ? 'Anonymous measurement enabled, subject to browser privacy preferences.' : 'Preference saved. No analytics service is connected on this edition.') : 'Anonymous measurement disabled.'; });
  });
  all<HTMLElement>('[data-preferences-tools]').forEach(element => { element.hidden = false; });
  void startVitals();
}

function initWorker() {
  if (!('serviceWorker' in navigator)) return;
  const notice = one<HTMLElement>('[data-update]');
  const hadController = Boolean(navigator.serviceWorker.controller);
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (hadController && notice) notice.hidden = false; });
  one('[data-update-reload]')?.addEventListener('click', () => { const form = one<HTMLFormElement>('#contact-form'); const edited = form && all<HTMLInputElement | HTMLTextAreaElement>('input:not([type=hidden]),textarea', form).some(input => Boolean(input.value)); if (!edited || window.confirm('Reloading will clear the project note on this page. Save a copy first. Reload now?')) location.reload(); });
  one('[data-update-dismiss]')?.addEventListener('click', () => { if (notice) notice.hidden = true; });
  const register = () => { void navigator.serviceWorker.register(base + 'sw.js', { scope: base, updateViaCache: 'none' }).catch(() => { /* Offline browsing is optional; the ordinary site remains usable. */ }); };
  if (document.readyState === 'complete') register(); else window.addEventListener('load', register, { once: true });
}

// Enhancements are isolated: a failed optional module must not hide content or disable another feature.
for (const init of [initTheme, initMenu, initSearch, initFilters, initIntent, initComparisons, initDiagrams, initContact, initMotion, initPreferences, initWorker]) {
  try { init(); } catch (error) { console.warn(`Quiet Compass: ${init.name} could not start`, error); }
}
