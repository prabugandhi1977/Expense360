// Captures retina screenshots of the current Expense360 (Budget Command Center) into assets/.
import { chromium } from 'playwright';
import fs from 'fs';
import { fileURLToPath } from 'url';
const url = fileURLToPath(new URL('../index.html', import.meta.url));
const fileUrl = 'file:///' + url.replace(/\\/g, '/') + '?demo=overrun';
const fcss = fs.readFileSync(new URL('fonts/fonts.css', import.meta.url),'utf8').replace(/url\(([^)]+)\)/g,'url(https://fonts.gstatic.com/x/$1)');
const b = await chromium.launch();
const ctx = await b.newContext({ viewport:{width:1440,height:900}, deviceScaleFactor:2, colorScheme:'light' });
// Serve Google Fonts from the bundled copies so renders don't depend on the network.
await ctx.route('https://fonts.googleapis.com/**', r=>r.fulfill({contentType:'text/css', body:fcss}));
await ctx.route('https://fonts.gstatic.com/x/**', r=>r.fulfill({contentType:'font/woff2', body:fs.readFileSync(new URL('fonts/'+r.request().url().split('/').pop(), import.meta.url))}));
const p = await ctx.newPage();
p.on('pageerror', e=>console.log('ERR',e.message));
const shot = async (n)=>{ await p.waitForTimeout(800); await p.screenshot({path:`assets/${n}.png`}); console.log(n); };
const tab = async (t)=>{ await p.click(`.tab-btn[data-tab="${t}"]`); await p.evaluate(()=>window.scrollTo(0,0)); };

await p.goto(fileUrl); await p.evaluate(()=>document.fonts.ready); await p.waitForTimeout(2000);
await shot('landing');
await p.evaluate(()=>document.getElementById('ld-features-h').scrollIntoView());
await shot('landing-features');
await p.evaluate(()=>window.scrollTo(0,0));
await p.click('.ld-meta [data-ld-enter]'); await p.waitForTimeout(600);
await shot('login');
await p.fill('#login-name', 'Finance Team'); await p.selectOption('#login-role', 'finance');
await p.click('#loginSubmitBtn'); await p.waitForSelector('#appShell:not([hidden])'); await p.waitForTimeout(1200);

await tab('overview'); await shot('overview');
await tab('policy');
await p.fill('#policy-input', 'Which business is likely to exceed budget this quarter?'); await p.press('#policy-input','Enter'); await p.waitForTimeout(600);
await shot('copilot');
await tab('overview');
await p.click('[data-drill-bu="engineering"]').catch(()=>console.log('no drill row')); await p.waitForTimeout(500);
await p.evaluate(()=>{ const e=document.getElementById('ov-drill')||document.querySelector('.crumbs'); if(e) e.scrollIntoView({block:'center'}); });
await shot('drill-bu');
await p.click('[data-drill-cat]').catch(()=>console.log('no cat row')); await shot('drill-cat');
await tab('realloc'); await shot('realloc');
await p.click('[data-re-ok]'); await p.waitForTimeout(600); await shot('realloc-done');
for (const t of ['digest','budgets','forecast','audit']) { await tab(t); await shot(t); }
await p.click('.theme-btn[data-theme-choice="dark"]'); await tab('overview'); await shot('overview-dark');
await b.close();
