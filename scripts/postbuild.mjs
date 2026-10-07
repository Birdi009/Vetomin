import { readFile, writeFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { normalizeBase } from '../src/lib/urls.mjs';
const base = normalizeBase(process.env.PUBLIC_BASE_PATH ?? (process.env.GITHUB_ACTIONS === 'true' && !process.env.PUBLIC_SITE_URL ? '/' + (process.env.GITHUB_REPOSITORY?.split('/')[1] || 'Vetomin') + '/' : '/'));
async function files(dir) { return (await Promise.all((await readdir(dir,{withFileTypes:true})).map(entry => entry.isDirectory() ? files(join(dir,entry.name)) : join(dir,entry.name)))).flat(); }
const pages = (await files('dist')).filter(path => path.endsWith('.html')).sort();
const hash = createHash('sha256');
for (const file of pages) hash.update(await readFile(file));
const contentHash = hash.digest('hex').slice(0,16);
const release = { commit: process.env.GITHUB_SHA || 'local', contentHash, base, builtAt: new Date().toISOString(), contactConfigured: Boolean(process.env.PUBLIC_CONTACT_ENDPOINT), analyticsConfigured: Boolean(process.env.PUBLIC_ANALYTICS_ENDPOINT), pages: pages.filter(file=>!file.endsWith('404.html')).map(file => base + file.slice(5).replace(/index\.html$/, '')) };
await writeFile('dist/release.json', JSON.stringify(release, null, 2));
const worker = await readFile('dist/sw.js', 'utf8');
await writeFile('dist/sw.js', worker.replaceAll('__QC_BUILD__', contentHash));
const origin = new URL(process.env.PUBLIC_SITE_URL || 'https://birdi009.github.io').origin;
await writeFile('dist/robots.txt', `User-agent: *\nAllow: /\nSitemap: ${origin}${base}sitemap-index.xml\n`);
console.log('Release manifest:', release.commit, contentHash, base, `${pages.length} HTML documents`);
