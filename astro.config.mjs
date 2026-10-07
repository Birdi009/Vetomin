import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { normalizeBase } from './src/lib/urls.mjs';

const repo = process.env.GITHUB_REPOSITORY?.split('/')[1] || 'Vetomin';
const pages = process.env.GITHUB_ACTIONS === 'true' && !process.env.PUBLIC_SITE_URL;
const site = process.env.PUBLIC_SITE_URL || 'https://birdi009.github.io';
const base = normalizeBase(process.env.PUBLIC_BASE_PATH ?? (pages ? `/${repo}/` : '/'));
export default defineConfig({
  site: new URL(site).origin,
  base,
  trailingSlash: 'always',
  output: 'static',
  integrations: [mdx(), sitemap({ filter: page => !page.endsWith('/404/') })],
  build: { format: 'directory' },
  vite: { build: { sourcemap: false } }
});
