import { defineConfig, devices } from '@playwright/test';
const base=process.env.GITHUB_ACTIONS==='true'?'/Vetomin/':'/';
const liveBaseURL=process.env.PLAYWRIGHT_BASE_URL;
export default defineConfig({
  testDir:'./tests',
  fullyParallel:true,
  retries:process.env.CI?1:0,
  webServer:liveBaseURL?undefined:{
    command:'npm run build && npm run preview -- --host 127.0.0.1',
    url:'http://127.0.0.1:4321'+base,
    reuseExistingServer:!process.env.CI,
    timeout:120000
  },
  use:{baseURL:liveBaseURL||'http://127.0.0.1:4321'+base,trace:'retain-on-failure'},
  projects:[
    {name:'desktop',use:{...devices['Desktop Chrome']}},
    {name:'mobile',use:{...devices['Pixel 7']}},
    {name:'mobile-safari',use:{...devices['iPhone 13']}}
  ]
});
