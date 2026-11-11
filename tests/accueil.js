const {chromium}=require('playwright');const fs=require('fs');const NM=require('path').join(__dirname,'..','node_modules')+'/';const B='http://127.0.0.1:8787';
(async()=>{const b=await chromium.launch();const errs=[];
async function mk(vp){const c=await b.newContext({viewport:vp});await c.route('**/*',r=>{const u=r.request().url();if(u.startsWith(B)||u.includes('fonts.g'))return r.continue();
 const f=u.includes('d3@')?'d3/dist/d3.min.js':u.includes('topojson-client')?'topojson-client/dist/topojson-client.min.js':u.includes('qrcode-generator')?'qrcode-generator/dist/qrcode.js':u.includes('world-atlas')?'world-atlas/countries-50m.json':null;
 if(f)return r.fulfill({body:fs.readFileSync(NM+f),contentType:f.endsWith('json')?'application/json':'text/javascript'});r.abort();});
 const p=await c.newPage();p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());return p;}
const h=await mk({width:1600,height:900});await h.goto(B+'/host');await h.waitForSelector('#pin');console.log('gate home hidden',await h.isHidden('#home'));
await h.fill('#pin','test');await h.click('#f button');await h.waitForSelector('.code');const code=(await h.textContent('.code')).trim();
const p=await mk({width:390,height:800});await p.goto(B+'/?c='+code);await p.fill('#name','Test');await p.click('#f button');await p.waitForSelector('.pulse');
await h.waitForTimeout(500);await h.click('#go');await h.waitForSelector('#tm');await p.waitForSelector('#quit');await h.screenshot({path:'tests/captures/home-q.png'});await p.screenshot({path:'tests/captures/quit-q.png'});
await h.click('#home');await h.waitForSelector('#pin');console.log('host back to gate ok, hidden',await h.isHidden('#home'));
await h.reload();await h.waitForSelector('#pin');console.log('reload stays on gate');
await p.click('#quit');await p.waitForSelector('#code');console.log('player back to join ok');
console.log('errs',errs);await b.close();})().catch(e=>{console.error(e);process.exit(1)});
