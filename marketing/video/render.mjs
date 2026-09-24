import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { spawn } from 'child_process';
const [,, mode, arg] = process.argv;   // mode: stills "t1,t2" | video out.mp4
const b = await chromium.launch();
const p = await b.newPage({ viewport:{width:1920,height:1080} });
p.on('pageerror', e=>console.log('ERR',e.message));
await p.goto('file://'+process.cwd()+'/composition.html');
await p.evaluate(()=>document.fonts.ready); await p.waitForTimeout(800);
if (mode==='stills'){
  for (const t of arg.split(',')){ await p.evaluate(t=>render(+t), t); await p.screenshot({path:`still-${t}.png`}); }
} else {
  const FPS=30, dur=await p.evaluate(()=>window.DURATION), N=Math.round(dur*FPS);
  const ff = spawn(process.env.FFMPEG, ['-y','-loglevel','error','-f','image2pipe','-framerate',String(FPS),'-c:v','mjpeg','-i','-',
    '-c:v','libx264','-pix_fmt','yuv420p','-crf','18','-preset','medium','-movflags','+faststart', arg], {stdio:['pipe','inherit','inherit']});
  for (let i=0;i<N;i++){
    await p.evaluate(t=>render(t), i/FPS);
    const buf = await p.screenshot({type:'jpeg', quality:94});
    if(!ff.stdin.write(buf)) await new Promise(r=>ff.stdin.once('drain',r));
    if(i%150===0) console.log(`frame ${i}/${N}`);
  }
  ff.stdin.end(); await new Promise(r=>ff.on('close',r));
}
await b.close();
