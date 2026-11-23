"use strict";
const assert=require("node:assert/strict");
const {spawn}=require("node:child_process");
const path=require("node:path");
const fs=require("node:fs");
const {chromium}=require("playwright");
const root=path.join(__dirname,".."),port=4798;
const origin="http://127.0.0.1:"+port+"/previews/siac-alternancia-foco.html";
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
(async()=>{
 const server=spawn("python3",["-m","http.server",String(port),"--bind","127.0.0.1"],{
  cwd:root,stdio:"ignore"
 });
 let browser=null;
 try{
  let ok=false;
  for(let i=0;i<50;i++){try{if((await fetch(origin)).ok){ok=true;break;}}catch{}await delay(120);}
  if(!ok)throw Error("HTTP server did not start");
  browser=await chromium.launch({headless:true});
  for(const width of [320,360,375,414,768,1024,1440]){
   const page=await browser.newPage({viewport:{width,height:850},acceptDownloads:true});
   const errors=[];page.on("pageerror",e=>errors.push(e.message));
   await page.goto(origin,{waitUntil:"networkidle"});
   await page.locator("#grade-frascos button").first().waitFor();
   assert.equal(await page.locator("#grade-frascos button").count(),10);
   assert.match(await page.locator("#focus-tab").textContent(),/Coluna em foco/);
   assert.match(await page.locator("#etapa-papel").textContent(),/P1: vazio/);
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
   assert(overflow<=2,"Horizontal overflow: "+width+" / "+overflow);
   assert.deepEqual(errors,[],"Page errors at "+width);
   if(width===1440){
    await page.locator("#focus-tab").click();
    assert.match(await page.locator("#focus-tab").textContent(),/Tubo em foco/);
    await page.locator("#focus-tab").click();
    assert.match(await page.locator("#focus-tab").textContent(),/Amostra em foco/);
    await page.locator("#focus-tab").click();
    assert.match(await page.locator("#focus-tab").textContent(),/Coluna em foco/);
    await page.locator("#overview-tab").click();
    assert.match(await page.locator("#overview-tab").textContent(),/Frascos/);
    await page.locator("#overview-tab").click();
    assert.match(await page.locator("#overview-tab").textContent(),/Papéis/);
    assert.equal(await page.locator("#scene .fracao-card").count(),10);
    assert.match(await page.locator("#scene [data-pick=F7]").textContent(),/P7/);
    assert.match(await page.locator("#scene [data-pick=F7]").textContent(),/vazio/);
    await page.locator("#grade-frascos [data-f=F7]").click();
    assert.match(await page.locator("#nome-selecao").textContent(),/F7 ↔ P7/);
    await page.locator("#coletar-demo").click();
    assert.match(await page.locator("#resumo-frasco").textContent(),/0,40 mL/);
    // Ainda vazio, apesar da coleta no frasco.
    assert.match(await page.locator("#scene [data-pick=F7]").textContent(),/vazio/);
    await page.locator("#carregar-capilar").click();
    assert.match(await page.locator("#focus-tab").textContent(),/Amostra em foco/);
    assert.match(await page.locator("#status").textContent(),/Capilar do F7 carregado/);
    await page.locator("#papel-interativo").click({position:{x:145,y:230}});
    assert.match(await page.locator("#etapa-papel").textContent(),/P7: aplicado/);
    await page.locator("#desenvolver").click();
    assert.match(await page.locator("#etapa-papel").textContent(),/P7: desenvolvido/);
    await page.locator("#ver-itens [data-item=uv]").click();
    await page.locator("#uv254").click();
    assert.match(await page.locator("#etapa-papel").textContent(),/P7: revelado/);
    await page.locator("#modulos [data-mod=medir]").click();
    assert.equal(await page.locator("#ver-itens [data-item=regua]").count(),1);
    await page.locator("#modulos [data-mod=calcular]").click();
    assert.equal(await page.locator("#ver-itens [data-item=rf]").count(),1);
    assert.match(await page.locator("#ver-conteudo").textContent(),/0,327/);
    await page.locator("#overview-tab").click();
    await page.locator("#overview-tab").click();
    assert.match(await page.locator("#scene [data-pick=F7]").textContent(),/revelado/);
    assert.match(await page.locator("#scene [data-pick=F8]").textContent(),/vazio/);
    await page.locator("#focus-tab").click();
    assert.match(await page.locator("#focus-tab").textContent(),/Amostra em foco/);
    const promise=page.waitForEvent("download");
    await page.locator("#registro-svg").click();
    const dl=await promise;
    assert.equal(dl.suggestedFilename(),"siac-P7-registro.svg");
    assert.deepEqual(errors,[],"Page errors after interactions");
    const imgdir=path.join(root,"docs","evidencias","siac-visualizacao");
    fs.mkdirSync(imgdir,{recursive:true});
    await page.screenshot({path:path.join(imgdir,"desktop-1440.png"),fullPage:true});
   }
   if(width===360){
    const imgdir=path.join(root,"docs","evidencias","siac-visualizacao");
    fs.mkdirSync(imgdir,{recursive:true});
    await page.screenshot({path:path.join(imgdir,"mobile-360.png"),fullPage:true});
   }
   await page.close();
  }
  console.log("SIAC: 7 resoluções, ciclos de foco/geral, F7-P7, capilar, UV, Ver e relatório SVG OK");
 }finally{
  await browser?.close();server.kill();
 }
})().catch(e=>{console.error(e);process.exitCode=1;});
