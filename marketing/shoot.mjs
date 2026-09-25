// Captures retina screenshots of every Expense360 screen into assets/.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'fs';
const url = 'file://' + new URL('../index.html', import.meta.url).pathname;
const fcss = fs.readFileSync(new URL('fonts/fonts.css', import.meta.url),'utf8').replace(/url\(([^)]+)\)/g,'url(https://fonts.gstatic.com/x/$1)');
const b = await chromium.launch();
const ctx = await b.newContext({ viewport:{width:1440,height:900}, deviceScaleFactor:2, colorScheme:'light' });
// Serve Google Fonts from the bundled copies so renders don't depend on the network.
await ctx.route('https://fonts.googleapis.com/**', r=>r.fulfill({contentType:'text/css', body:fcss}));
await ctx.route('https://fonts.gstatic.com/x/**', r=>r.fulfill({contentType:'font/woff2', body:fs.readFileSync(new URL('fonts/'+r.request().url().split('/').pop(), import.meta.url))}));
const p = await ctx.newPage();
p.on('pageerror', e=>console.log('ERR',e.message));
const shot = async (n)=>{ await p.waitForTimeout(700); await p.screenshot({path:`assets/${n}.png`}); console.log(n); };
const tab = async (t)=>{ await p.click(`.tab-btn[data-tab="${t}"]`); await p.evaluate(()=>window.scrollTo(0,0)); };
const signIn = async (name, role)=>{
  await p.goto(url); await p.evaluate(()=>document.fonts.ready); await p.waitForTimeout(1200);
  await p.fill('#login-name', name); await p.selectOption('#login-role', role);
  await p.click('#loginSubmitBtn'); await p.waitForSelector('#appShell:not([hidden])'); await p.waitForTimeout(800);
};
const ask = async (q)=>{ await p.fill('#policy-input', q); await p.press('#policy-input','Enter'); await p.waitForTimeout(400); };

await p.goto(url); await p.evaluate(()=>document.fonts.ready); await p.waitForTimeout(1500);
await shot('login');

await signIn('Finance Team','finance');
for (const t of ['overview','digest','perdiem','budgets','expenses','forecast','audit','projects']) { await tab(t); await shot(t); }
await tab('policy'); await ask("What's the per-diem for Tokyo?"); await ask('How much budget does Sales have left?'); await shot('policy');
await tab('perdiem'); await p.click('[data-open]'); await shot('perdiem-drawer'); await p.click('#drawerClose'); await p.waitForTimeout(400);
await p.click('.theme-btn[data-theme-choice="dark"]'); await tab('overview'); await shot('overview-dark');
await p.click('.theme-btn[data-theme-choice="light"]');

await p.click('#signOutBtn'); await p.waitForTimeout(500);
await signIn('Ankita Bansal','employee');
for (const t of ['submit','myperdiem']) { await tab(t); await shot(t); }
await b.close();
