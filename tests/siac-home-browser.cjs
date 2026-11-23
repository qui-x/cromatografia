"use strict";
const assert=require("node:assert/strict");
const http=require("node:http"),path=require("node:path"),{spawn}=require("node:child_process");
const {chromium}=require("playwright");
const root=path.resolve(__dirname,".."),port=4188;
const delay=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const server=spawn("python3",["-m","http.server",String(port),"--bind","127.0.0.1"],{cwd:root,stdio:"ignore"});
 let browser;
 try {
  let up=false;
  for(let i=0;i<50;i++){
   try{up=await new Promise((resolve,reject)=>{
     const req=http.get("http://127.0.0.1:"+port+"/index.html",res=>{
      const ok=res.statusCode===200;res.resume();res.on("end",()=>resolve(ok));
     });req.on("error",reject);req.setTimeout(1500,()=>req.destroy());
   });if(up)break;}catch{} await delay(150);
  }
  assert(up,"Servidor do SIAC indisponível");
  browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
  for(const [theme,width] of [["dark",1360],["light",390]]){
   const page=await browser.newPage({viewport:{width,height:820}});
   const errors=[];page.on("pageerror",e=>errors.push(e.message));
   await page.goto("http://127.0.0.1:"+port+"/index.html#/inicio",{waitUntil:"domcontentloaded"});
   await page.waitForSelector(".caminho-laboratorio");
   await page.evaluate(theme=>document.documentElement.dataset.theme=theme,theme);
   const state=await page.locator(".caminho-laboratorio").evaluate(el=>{
    const c=getComputedStyle(el),tag=getComputedStyle(document.documentElement);
    return {backgroundImage:c.backgroundImage,backgroundColor:c.backgroundColor,borderColor:c.borderTopColor,
      accent:tag.getPropertyValue("--accent").trim(),title:el.textContent,visible:!!el.getBoundingClientRect().width,
      overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth};
   });
   assert.equal(state.backgroundImage,"none","Halo roxo e gradiente herdado não devem aparecer: "+JSON.stringify(state));
   assert.match(state.title,/Laboratório/);
   assert.match(state.title,/frações cromatográficas/);
   assert(state.visible,"Card Laboratório ausente");
   assert(state.overflow<=4,"Rolagem horizontal inesperada");
   assert.deepEqual(errors,[],"Falhas JavaScript na página inicial");
   console.log("SIAC home",theme,width,state);
   await page.close();
  }
 }finally{await browser?.close();server.kill();}
})().catch(e=>{console.error(e);process.exitCode=1});
