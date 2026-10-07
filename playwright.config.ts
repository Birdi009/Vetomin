import { defineConfig, devices } from '@playwright/test';
const requested=process.env.PUBLIC_BASE_PATH ?? (process.env.GITHUB_ACTIONS==='true'?'/Vetomin/':'/');
const base=`/${requested.replace(/^\/+|\/+$/g,'')}/`.replace(/\/{2,}/g,'/');
const live=process.env.PLAYWRIGHT_BASE_URL;
export default defineConfig({
  testDir:'./tests',fullyParallel:true,retries:process.env.CI?1:0,workers:process.env.CI?2:undefined,timeout:60000,
  reporter:[['list'],['html',{open:'never'}],['json',{outputFile:'.quality/browser-results.json'}]],
  webServer:live?undefined:{command:'npm run build && npm run preview -- --host 127.0.0.1',url:'http://127.0.0.1:4321'+base,reuseExistingServer:!process.env.CI,timeout:180000},
  use:{baseURL:live||'http://127.0.0.1:4321'+base,trace:'retain-on-failure',screenshot:'only-on-failure',serviceWorkers:'block'},
  projects:[{name:'desktop',use:{...devices['Desktop Chrome']}},{name:'mobile',use:{...devices['Pixel 7']}},{name:'mobile-safari',use:{...devices['iPhone 13']}}]
});
