"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),http=require("node:http"),{spawn}=require("node:child_process");
const {chromium}=require("playwright");
const root=path.join(__dirname,".."),port=4187;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const server=spawn("python3",["-m","http.server",String(port),"--bind","127.0.0.1"],{cwd:root,stdio:"ignore"});
 let browser;
 try{
  let available=false;
  for(let i=0;i<50;i++){
    try{
      available=await new Promise((resolve,reject)=>{
        const req=http.get("http://127.0.0.1:"+port+"/index.html",res=>{
          const ok=res.statusCode===200;res.resume();res.on("end",()=>resolve(ok));
        });req.on("error",reject);req.setTimeout(1500,()=>req.destroy());
      });
      if(available)break;
    }catch{}
    await sleep(150);
  }
  assert(available,"Servidor HTTP indisponível");
  browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
  for(const width of [360,768,1360]){
   const page=await browser.newPage({viewport:{width,height:860}});
   const errors=[];
   page.on("pageerror",e=>errors.push(e.message));
   await page.goto("http://127.0.0.1:"+port+"/index.html#/laboratorio",{waitUntil:"domcontentloaded"});
   await page.waitForFunction(()=>window.SIAC?.laboratorio?.active===true,{timeout:15000});
   // A Montagem é uma doca SIAB e inicia recolhida; abrir pelo botão existente.
   if(await page.locator("#workspace-montagem").isVisible()){
     await page.locator("#workspace-montagem").click();
   }else if(await page.locator("#prepare-btn").isVisible()){
     await page.locator("#prepare-btn").click();
   }else{
     await page.evaluate(()=>SIAB.workspace.open("left"));
   }
   await page.locator("#siac-montagem #siac-seletor button").first().waitFor({timeout:5000});
   assert.equal(await page.locator("#siac-seletor button").count(),10);
   console.log("SIAC DIAGNÓSTICO",width,JSON.stringify(await page.evaluate(()=>({
     snapshot:window.SIAC?.laboratorio?.snapshot,
     estadoMontagem:document.getElementById("siac-montagem-status")?.textContent,
     estadoBancada:document.getElementById("siac-stage-status")?.textContent,
     textoFoco:document.getElementById("focus-tab")?.textContent,
     pane:document.getElementById("controls")?.className,
     rota:window.SIAB?.rota?.nome
   }))),"erros:",errors);
   assert.match(await page.locator("#focus-tab").textContent(),/Coluna em foco/);
   assert.equal(await page.locator("#siac-stage .siac-card").count(),0);
   assert.equal(await page.locator("#siac-stage").isVisible(),true);
   assert.equal(await page.locator("#siac-montagem").isVisible(),true);
   assert.equal(await page.locator("#siac-montagem-status").isVisible(),true);
   const inactive=await page.evaluate(()=>document.body.classList.contains("siac-active"));
   assert(inactive,"A integração não ativou na rota real");
   if(width===1360){
    // Seleção no painel Montagem real, sem abrir página de prévia.
    await page.locator("#siac-seletor [data-fraction=F1]").click({force:true});
    await page.locator("#siac-inicio").fill("0.1");
    await page.locator("#siac-fim").fill("0.5");
    await page.locator("#siac-janela").click({force:true});
    assert.match(await page.locator("#siac-montagem-status").textContent(),/programado/);
    await page.locator("#siac-seletor [data-fraction=F7]").click({force:true});
    await page.locator("#siac-inicio").fill("1.0");
    await page.locator("#siac-fim").fill("1.6");
    await page.locator("#siac-janela").click({force:true});
    // Programação não cria recipientes na bancada.
    await page.locator("#overview-tab").click({force:true});
    assert.match(await page.locator("#overview-tab").textContent(),/Frascos/);
    assert.equal(await page.locator("#siac-stage .siac-card").count(),0);
    await page.locator("#overview-tab").click({force:true});
    assert.match(await page.locator("#overview-tab").textContent(),/Papéis/);
    assert.equal(await page.locator("#siac-stage .siac-card").count(),0);
    await page.locator("#focus-tab").click({force:true});
    assert.match(await page.locator("#focus-tab").textContent(),/Coluna em foco/);
    // A doca Montagem cobre parte da cena em desktop: fechá-la antes de iniciar.
    if(await page.locator("#close-controls").isVisible()){
      await page.locator("#close-controls").click();
    }else{
      await page.evaluate(()=>SIAB.workspace.close("left",false));
    }
    await page.waitForFunction(()=>document.getElementById("controls")?.classList.contains("dock-collapsed"),null,{timeout:3000});
    // O cronômetro deve realmente avançar o volume a partir da vazão.
    // O seletor SIAB substitui o <select> nativo por um controle próprio.
    await page.locator("#siac-velocidade").evaluate(el=>{el.value="120";el.dispatchEvent(new Event("change",{bubbles:true}));});
    await page.locator("#siac-executar").click({force:true});
    await page.waitForTimeout(1300);
    console.log("SIAC APÓS EXECUTAR",JSON.stringify(await page.evaluate(()=>({
      estado:window.SIAC?.laboratorio?.snapshot,
      legenda:document.querySelector("#siac-executar")?.textContent,
      message:document.querySelector("#siac-stage-status")?.textContent,
      acceleration:document.querySelector("#siac-velocidade")?.value,
      visible:!document.querySelector("#siac-stage")?.hidden
    }))),"pageErrors:",errors);
    await page.waitForFunction(()=>window.SIAC?.laboratorio?.snapshot?.volumeMl>1.7,null,{polling:250,timeout:12000});
    await page.locator("#siac-executar").click({force:true});
    const snapshot=await page.evaluate(()=>window.SIAC.laboratorio.snapshot);
    assert(snapshot.preenchidos.includes("F1"));
    assert(snapshot.preenchidos.includes("F7"));
    assert.equal(snapshot.preenchidos.length,2,"Só frascos preenchidos devem estar montados");
    await page.locator("#overview-tab").click({force:true});
    assert.match(await page.locator("#overview-tab").textContent(),/Papéis/);
    assert.equal(await page.locator("#siac-stage .siac-card").count(),2);
    assert.match(await page.locator('#siac-stage [data-open-fraction=F7]').textContent(),/P7/);
    // Clique no papel da visão geral transfere para o papel em foco.
    await page.locator('#siac-stage [data-open-fraction=F7]').click({force:true});
    assert.match(await page.locator("#focus-tab").textContent(),/Amostra em foco/);
    assert.match(await page.locator("#siac-stage").textContent(),/vazio/);
    await page.locator("#focus-tab").click({force:true});
    assert.match(await page.locator("#focus-tab").textContent(),/Coluna em foco/);
    await page.locator("#focus-tab").click({force:true});
    assert.match(await page.locator("#focus-tab").textContent(),/Tubo em foco/);
    await page.locator("#siac-retirar").click({force:true});
    assert.match(await page.locator("#focus-tab").textContent(),/Amostra em foco/);
    await page.locator("#siac-paper-target").click({force:true});
    assert.match(await page.locator("#siac-stage").textContent(),/aplicado/);
    await page.locator("#siac-desenvolver").click({force:true});
    await page.waitForFunction(()=>window.SIAC?.laboratorio?.snapshot?.papeis?.F7==="desenvolvido",null,{polling:250,timeout:20000});
    await page.locator("#siac-uv").click({force:true});
    assert.equal(await page.evaluate(()=>window.SIAC.laboratorio.snapshot.papeis.F7),"revelado");
    await page.locator("#overview-tab").click({force:true});
    assert.equal(await page.locator("#siac-stage .siac-card").count(),2);
    // O botão de alternância deve voltar de Papéis a Frascos.
    await page.locator("#overview-tab").click({force:true});
    assert.match(await page.locator("#overview-tab").textContent(),/Frascos/);
    // Ver contextual não depende da existência de tubos SIAB legados.
    const visible=await page.evaluate(()=>!document.querySelector("#workspace-ver").hidden);
    assert(visible,"O painel Ver deve ser acessível no SIAC");
    assert.equal(await page.locator("#siac-ver [data-module=medir]").count(),1);
    if(await page.locator("#workspace-ver").isVisible())await page.locator("#workspace-ver").click();
    else await page.evaluate(()=>SIAB.workspace.open("right"));
    await page.locator("#siac-ver [data-module=medir]").click({force:true});
    assert.equal(await page.locator("#siac-ver [data-ver=regua]").count(),1);
    await page.locator("#siac-ver [data-module=calcular]").click({force:true});
    assert.equal(await page.locator("#siac-ver [data-ver=rf]").count(),1);
    const folder=path.join(root,"docs/evidencias/siac-laboratorio");
    fs.mkdirSync(folder,{recursive:true});
    await page.screenshot({path:path.join(folder,"desktop.png"),fullPage:true});
   }
   if(width===360){
    const folder=path.join(root,"docs/evidencias/siac-laboratorio");
    fs.mkdirSync(folder,{recursive:true});
    await page.screenshot({path:path.join(folder,"mobile.png"),fullPage:true});
   }
   assert.deepEqual(errors,[],"Falhas JS em "+width+"px: "+errors.join("; "));
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
   assert(overflow<=4,"Rolagem horizontal em "+width+"px: "+overflow);
   await page.close();
  }
  console.log("SIAC integrado: Montagem, F1–F10, tubo/papel, capilar, UV, 3 focos e Ver por módulo OK");
 }finally{await browser?.close();server.kill();}
})().catch(e=>{console.error(e);process.exitCode=1});
