const {chromium}=require('playwright');const fs=require('fs');const NM=require('path').join(__dirname,'..','node_modules')+'/';
const B='http://127.0.0.1:8787';
(async()=>{
const b=await chromium.launch();
const errs=[];
async function mk(vp){const c=await b.newContext({viewport:vp});
  await c.route('**/*',r=>{const u=r.request().url();
    if(u.startsWith(B)||u.includes('fonts.g')||u.includes('amazonaws.com'))return r.continue();
    const f=u.includes('d3@')?'d3/dist/d3.min.js':u.includes('topojson-client')?'topojson-client/dist/topojson-client.min.js':u.includes('qrcode-generator')?'qrcode-generator/dist/qrcode.js':u.includes('world-atlas')?'world-atlas/countries-50m.json':u.includes('geotiff')?'geotiff/dist-browser/geotiff.js':null;
    if(f)return r.fulfill({body:fs.readFileSync(NM+f),contentType:f.endsWith('json')?'application/json':'text/javascript'});
    r.abort();});
  const p=await c.newPage();p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!m.text().includes('ERR_FAILED'))errs.push(m.text())});return p;}
const h=await mk({width:1600,height:900});
await h.goto(B+'/host');await h.waitForSelector('#pin');await h.screenshot({path:'tests/captures/z-gate.png'});if(process.env.QZ)await h.check(`input[value=${process.env.QZ}]`);await h.fill('#pin','test');await h.click('#f button');await h.waitForSelector('.code',{timeout:120000});
const code=(await h.textContent('.code')).trim();console.log('code',code);
const names=['Les Isohypses','Mercator 2.0','Azimut','Équipe Nord','Talweg'];const ps=[];
for(let i=0;i<names.length;i++){const p=await mk(i<2?{width:390,height:800}:{width:900,height:700});await p.goto(B+'/?c='+code);await p.fill('#name',names[i]);await p.click('#f button');await p.waitForSelector('.pulse');ps.push(p);}
await h.waitForTimeout(600);await h.screenshot({path:'tests/captures/h-lobby.png'});await ps[0].screenshot({path:'tests/captures/p-wait.png'});
await h.click('#go');
for(let qi=0;qi<10;qi++){
  await h.waitForSelector('#tm');await h.waitForTimeout(500);
  if(process.env.SHOTS&&process.env.SHOTS.split(',').includes('q'+(qi+1)))await h.screenshot({path:`tests/captures/z-q${qi+1}.png`});
  if(qi===0)await ps[0].screenshot({path:`tests/captures/p-q${qi+1}.png`});
  for(let i=0;i<ps.length;i++){const p=ps[i];
    if(i===4&&qi===2)continue; // une équipe ne répond pas
    if(await p.$('#ok')){const bx=await (await p.$('.fig')).boundingBox();await p.mouse.click(bx.x+Math.min(bx.width,380)*(0.25+0.12*i),bx.y+bx.height*(0.35+0.08*i));await p.click('#ok');}
    else if(await p.$('#rep')){await p.fill('#rep',process.env.QZ==='semio'?'2':process.env.QZ==='topo'?'20':process.env.QZ==='gps'?(qi===2?'46,5':'111'):process.env.QZ==='sat'?'60':process.env.QZ==='projections'?(qi===4?'1,6':'18'):(i%2?'3':(qi===2?'3':'250 000')));await p.click('#f button');}
    else {const o=await p.$$('.opt');await o[i%o.length].click();}
    await p.waitForTimeout(120);}
  if(qi===2)await h.click('#nx');
  await h.waitForSelector('.sol',{timeout:5000}).catch(()=>{});await h.waitForTimeout(1000);if(process.env.SHOTS&&process.env.SHOTS.split(',').includes('r'+(qi+1)))await h.screenshot({path:`tests/captures/z-r${qi+1}.png`});
  
  if(qi===0)await ps[2].screenshot({path:'tests/captures/z-pr1.png'});
  if(process.env.PSHOT){for(let i=0;i<ps.length;i++)await ps[i].screenshot({path:`tests/captures/q${qi+1}-p${i}.png`,clip:{x:0,y:0,width:(i<2?390:900),height:330}})}
  if(process.env.MSGS){const t=[];for(const p of ps){const e=await p.$('.res .disp');t.push(e?await e.textContent():'?')}console.log('q'+(qi+1),t.join(' | '))}
  await h.keyboard.press('ArrowRight');await h.waitForSelector('.board');await h.waitForTimeout(1100);
  if(qi===3)await h.screenshot({path:'tests/captures/h-scores.png'});
  if(qi===3)await ps[1].screenshot({path:'tests/captures/p-scores.png'});
  await h.click('#nx');
}
await h.waitForSelector('.podium');await h.waitForTimeout(1300);await h.screenshot({path:'tests/captures/h-final.png'});
// rechargement d'un joueur : il doit retrouver sa place
await ps[0].reload();await ps[0].waitForSelector('.rank');await ps[0].screenshot({path:'tests/captures/p-final.png'});console.log('rejoin ok',await ps[0].textContent('.rank'));
console.log('errs',errs);await b.close();
})().catch(e=>{console.error(e);process.exit(1)});
