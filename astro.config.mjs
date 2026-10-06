import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

const repo = process.env.GITHUB_REPOSITORY?.split('/')[1] || 'Vetomin';
const isPages = process.env.GITHUB_ACTIONS === 'true' && !process.env.PUBLIC_SITE_URL;
const site = process.env.PUBLIC_SITE_URL || (isPages ? `https://birdi009.github.io/${repo}/` : 'http://localhost:4321/');
const base = isPages ? `/${repo}` : '/';

export default defineConfig({
  site,
  base,
  output: 'static',
  integrations: [mdx(), sitemap()],
  build: { format: 'directory' }
});