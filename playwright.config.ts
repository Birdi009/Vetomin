import { defineConfig, devices } from '@playwright/test';
import { normalizeBase } from './src/lib/urls.mjs';
const base=normalizeBase(process.env.PUBLIC_BASE_PATH ?? (process.env.GITHUB_ACTIONS==='true'&&!process.env.PUBLIC_SITE_URL?'/Vetomin/':'/'));
const live=process.env.PLAYWRIGHT_BASE_URL;
export default defineConfig({
 testDir:'./tests',testMatch:'**/*.spec.ts',fullyParallel:true,workers:2,retries:process.env.CI?1:0,failOnFlakyTests:Boolean(process.env.CI),timeout:60000,
 reporter:[['list'],['html',{open:'never'}],['json',{outputFile:'test-results/results.json'}]],
 webServer:live?undefined:{command:'npm run preview -- --host 127.0.0.1',url:'http://127.0.0.1:4321'+base,reuseExistingServer:!process.env.CI,timeout:120000},
 use:{baseURL:live||'http://127.0.0.1:4321'+base,trace:'retain-on-failure',screenshot:'only-on-failure',serviceWorkers:'block'},
 projects:[{name:'desktop',use:{...devices['Desktop Chrome'],viewport:{width:1440,height:900}}},{name:'mobile',use:{...devices['Pixel 7']}},{name:'mobile-safari',use:{...devices['iPhone 13']}}]
});
