import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const url = 'file:///home/user/Expense360/index.html';
const b = await chromium.launch();
const p = await b.newPage({ viewport:{width:1440,height:900}, deviceScaleFactor:2, colorScheme:'light' });
import fs from 'fs';
const fcss = fs.readFileSync('fonts/fonts.css','utf8').replace(/url\(([^)]+)\)/g,'url(https://fonts.gstatic.com/x/$1)');
await p.route('https://fonts.googleapis.com/**', r=>r.fulfill({contentType:'text/css', body:fcss}));
await p.route('https://fonts.gstatic.com/x/**', r=>r.fulfill({contentType:'font/woff2', body:fs.readFileSync('fonts/'+r.request().url().split('/').pop())}));
p.on('pageerror', e=>console.log('ERR',e.message));
await p.goto(url); await p.evaluate(()=>document.fonts.ready); await p.waitForTimeout(1500);
const shot = async (n)=>{ await p.waitForTimeout(700); await p.screenshot({path:`assets/${n}.png`}); console.log(n); };
const tab = async (t)=>{ await p.click(`.tab-btn[data-tab="${t}"]`); await p.evaluate(()=>window.scrollTo(0,0)); };
for (const t of ['overview','perdiem','budgets','expenses','forecast','audit','projects']) { await tab(t); await shot(t); }
await tab('perdiem'); const btn = await p.$('[data-open]'); if (btn){ await btn.click(); await shot('perdiem-drawer'); await p.keyboard.press('Escape'); await p.goto(url); await p.waitForTimeout(1200);}
await p.selectOption('#roleSelect','employee'); await p.waitForTimeout(500);
for (const t of ['submit','myperdiem']) { await tab(t); await shot(t); }
await b.close();
