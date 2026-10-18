// Captures the AI-focused screenshots used by the v4 promo and the pitch deck into assets-ai/.
// Run from marketing/:  node shoot-ai.mjs
// Needs Playwright (npm i, or a global install) and npm on PATH. CDN files the app loads on
// demand (the Tesseract OCR engine, its language data) come from the npm registry instead.
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(here, 'assets-ai');
const cache = path.join(here, '.cache');
fs.mkdirSync(out, { recursive: true }); fs.mkdirSync(cache, { recursive: true });
const appUrl = 'file://' + path.join(here, '..', 'index.html') + '?demo=overrun';
const fcss = fs.readFileSync(path.join(here, 'fonts/fonts.css'), 'utf8').replace(/url\(([^)]+)\)/g, 'url(https://fonts.gstatic.com/x/$1)');

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, colorScheme: 'light' });
await ctx.route('https://fonts.googleapis.com/**', r => r.fulfill({ contentType: 'text/css', body: fcss }));
await ctx.route('https://fonts.gstatic.com/x/**', r => r.fulfill({ contentType: 'font/woff2', body: fs.readFileSync(path.join(here, 'fonts', r.request().url().split('/').pop())) }));
// Live FX rates: the app falls back to fixed rates; answer at once so nothing waits on a timeout.
await ctx.route('https://open.er-api.com/**', r => r.abort());
// OCR engine + language data: jsdelivr's /npm/<pkg>@<ver>/<file> URLs are served from the same
// package fetched off the npm registry (npm pack), cached and unpacked in .cache/.
const fromNpm = async r => {
  const u = new URL(r.request().url());
  const m = u.pathname.match(/^\/npm\/((?:@[^/]+\/)?[^@/]+)(?:@([^/]+))?\/(.*)$/);
  if (!m) return r.abort();
  const [, pkg, ver = 'latest', file] = m;
  const dir = path.join(cache, (pkg + '@' + ver.replace(/^v/, '')).replace(/[/@]/g, '_'));
  if (!fs.existsSync(dir)) {
    const tgz = execFileSync('npm', ['pack', `${pkg}@${ver.replace(/^v/, '')}`, '--silent', '--pack-destination', cache]).toString().trim().split('\n').pop();
    fs.mkdirSync(dir); execFileSync('tar', ['-xzf', path.join(cache, tgz), '-C', dir, '--strip-components=1']);
  }
  const f = path.join(dir, file);
  if (!fs.existsSync(f)) { console.log('missing in package:', u.href); return r.abort(); }
  const type = f.endsWith('.js') ? 'application/javascript' : f.endsWith('.wasm') ? 'application/wasm' : 'application/octet-stream';
  await r.fulfill({ body: fs.readFileSync(f), contentType: type, headers: { 'access-control-allow-origin': '*' } });
};
await ctx.route('https://cdn.jsdelivr.net/npm/**', fromNpm);

const p = await ctx.newPage();
p.on('pageerror', e => console.log('ERR', e.message));
const shot = async (n) => { await p.waitForTimeout(800); await p.screenshot({ path: `${out}/${n}.png` }); console.log(n); };
const tab = async (t) => { await p.click(`.tab-btn[data-tab="${t}"]`); await p.evaluate(() => window.scrollTo(0, 0)); };
const scrollTo = async (sel, block = 'start') => { await p.evaluate(([s, b]) => { const e = document.querySelector(s); const card = e && (e.closest('.card') || e); card && card.scrollIntoView({ block: b }); window.scrollBy(0, -24); }, [sel, block]); };
const ask = async (q) => { await p.fill('#policy-input', q); await p.press('#policy-input', 'Enter'); await p.waitForTimeout(500); };
const signIn = async (name, role) => {
  await p.goto(appUrl); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500);
  await p.evaluate(() => { const b = document.querySelector('[data-ld-enter]'); b && b.click(); }); await p.waitForTimeout(500);
  await p.fill('#login-name', name); await p.selectOption('#login-role', role);
  await p.click('#loginSubmitBtn'); await p.waitForSelector('#appShell:not([hidden])'); await p.waitForTimeout(1200);
};

// Landing page
await p.goto(appUrl); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(2000);
await shot('landing');

// Finance: insights, drill-down, per-diem reasoning, reallocation, copilot, anomalies, forecast
await signIn('Finance Team', 'finance');
await tab('overview'); await shot('overview');
await scrollTo('#ov-insights'); await shot('insights');
await p.click('[data-drill-bu="engineering"]').catch(() => console.log('no drill row')); await p.waitForTimeout(500);
await p.click('[data-drill-cat]').catch(() => console.log('no cat row')); await scrollTo('#ov-drill'); await shot('drill');
await tab('perdiem'); await p.click('[data-open]'); await shot('perdiem-why');
await p.click('#drawerClose'); await p.waitForTimeout(400);
await tab('realloc'); await shot('realloc');
await tab('policy');
await ask('Which business is likely to exceed budget this quarter?');
await ask('What is driving Engineering spend?');
await ask('Where can we reallocate budget?');
await shot('copilot');
await tab('budgets'); await scrollTo('.alert-feed, #alert-feed, #bud-alerts', 'start'); await shot('alerts');
await tab('forecast'); await shot('forecast');
await tab('realloc'); await p.click('[data-re-ok]').catch(() => console.log('no move')); await p.waitForTimeout(600); await tab('audit'); await shot('audit');

// Employee: live receipt scan. The employee form's Amount box currently shares a grid cell with
// the currency picker and collapses to ~44px, showing only the first digit of the scanned value;
// give it room in the shot so the real extracted amount reads.
await p.click('#signOutBtn'); await p.waitForTimeout(500);
await signIn('Ankita Bansal', 'employee');
await tab('submit');
const rp = await ctx.newPage();
await rp.setViewportSize({ width: 560, height: 900 });
await rp.goto('file://' + path.join(here, 'receipt.html')); await rp.waitForTimeout(300);
await rp.screenshot({ path: path.join(cache, 'receipt.png') }); await rp.close();
await p.setInputFiles('#empexp-receipt', path.join(cache, 'receipt.png'));
await p.waitForFunction(() => { const s = document.getElementById('empexp-receipt-status'); return s && /fill|review|detected|done|extracted/i.test(s.textContent); }, null, { timeout: 120000 })
  .catch(() => console.log('OCR status:', 'timed out'));
await p.waitForTimeout(800);
console.log('OCR status:', await p.textContent('#empexp-receipt-status'));
// The itemized-lines panel currently renders with collapsed fields in the redesigned theme;
// keep it out of the marketing shot so the frame shows the extracted fields.
await p.evaluate(() => { const w = document.getElementById('empexp-items-wrap'); if (w) w.style.display = 'none'; });
await p.evaluate(() => { const f = document.getElementById('empexp-amount')?.closest('.field'); if (f) f.style.gridColumn = 'span 2'; });
await shot('receipt-scan');
await b.close();
