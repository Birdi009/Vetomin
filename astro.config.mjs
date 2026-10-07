import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

const repo = process.env.GITHUB_REPOSITORY?.split('/')[1] || 'Vetomin';
const pages = process.env.GITHUB_ACTIONS === 'true';
const site = new URL(process.env.PUBLIC_SITE_URL || (pages ? 'https://birdi009.github.io' : 'http://localhost:4321'));
const base = process.env.PUBLIC_BASE_PATH ?? (process.env.PUBLIC_SITE_URL ? site.pathname : pages ? `/${repo}/` : '/');
export default defineConfig({
  site: site.origin,
  base: `/${base.replace(/^\/+|\/+$/g, '')}/`.replace(/\/{2,}/g, '/'),
  trailingSlash: 'always',
  output: 'static',
  integrations: [mdx(), sitemap({ filter: page => !page.endsWith('/404/') })],
  build: { format: 'directory' }
});
