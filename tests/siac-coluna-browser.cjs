"use strict";
const assert=require("node:assert/strict");
const cp=require("node:child_process");
const fs=require("node:fs");
const path=require("node:path");
const {chromium}=require("playwright");
(async()=>{
 const servidor=cp.spawn("python3",["-m","http.server","4786","--bind","127.0.0.1"],{
  cwd:path.join(__dirname,".."),stdio:"ignore"
 });
 let navegador;
 try {
  for(let i=0;i<35;i++){
   try {
    const r=await fetch("http://127.0.0.1:4786/previews/coluna-laboratorio.html");
    if(r.ok)break;
   }catch{}
   await new Promise(r=>setTimeout(r,180));
  }
  navegador=await chromium.launch({headless:true});
  for(const width of [320,360,768,1024,1440]){
   const page=await navegador.newPage({viewport:{width,height:900},acceptDownloads:true});
   const erros=[];
   page.on("pageerror",e=>erros.push(e.message));
   await page.goto("http://127.0.0.1:4786/previews/coluna-laboratorio.html",{waitUntil:"networkidle"});
   await page.locator("#frascos button").first().waitFor();
   assert.equal(await page.locator("#frascos button").count(),10);
   assert.match(await page.title(),/SIAC/);
   assert.equal(await page.locator("#estado-tubo").textContent().then(t=>t.includes("sem intervalo")),true);
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
   assert(overflow<3,"Largura "+width+" overflow "+overflow);
   assert.equal(erros.length,0,"Erros de navegador em "+width+": "+erros.join("; "));
   if(width===1440){
    await page.locator("#frascos button").nth(1).click();
    await page.locator("#inicio").fill("1.2");
    await page.locator("#fim").fill("1.7");
    await page.locator('#janela-form button[type=submit]').click();
    assert.match(await page.locator("#estado-tubo").textContent(),/F2/);
    assert.match(await page.locator("#estado-tubo").textContent(),/1,2/);
    await page.locator("#frascos button").nth(2).click();
    const grafico=page.locator("#perfil-svg"),quad=await grafico.boundingBox();
    assert(quad,"Gráfico sem área de interação");
    const y=quad.y+quad.height/2,x=quad.x+quad.width*0.45;
    await page.mouse.move(x,y);
    await page.mouse.down();
    await page.mouse.move(x+50,y,{steps:6});
    await page.mouse.up();
    assert.match(await page.locator("#estado-tubo").textContent(),/F3/);
    assert.doesNotMatch(await page.locator("#estado-tubo").textContent(),/sem intervalo/);
    const botao=page.locator("#executar");
    await botao.click();
    await page.waitForTimeout(600);
    assert.match(await botao.textContent(),/Pausar|concluída/);
    const progresso=await page.locator("#relogio").textContent();
    assert(!progresso.startsWith("0,00"),"Eluição não avançou: "+progresso);
    if(await botao.isEnabled())await botao.click();
    const downloadPromise=page.waitForEvent("download");
    await page.locator("#registrar").click();
    const dl=await downloadPromise;
    assert.match(dl.suggestedFilename(),/siac-coluna-registro.svg/);
    assert.equal(erros.length,0,"Erros após interações: "+erros.join("; "));
    await page.locator("#reiniciar").click();
    const info=await page.locator("#estado-tubo").textContent();
    assert.match(info,/F2/);
    const capturas=path.join(__dirname,"..","docs","evidencias","siac-coluna");
    fs.mkdirSync(capturas,{recursive:true});
    await page.screenshot({path:path.join(capturas,"desktop-1440.png"),fullPage:true});
   }
   if(width===360){
    const capturas=path.join(__dirname,"..","docs","evidencias","siac-coluna");
    fs.mkdirSync(capturas,{recursive:true});
    await page.screenshot({path:path.join(capturas,"mobile-360.png"),fullPage:true});
   }
   await page.close();
  }
  console.log("SIAC coluna: 320, 360, 768, 1024, 1440px; interação F2, animação e relatório SVG aprovados.");
 }finally{
  await navegador?.close();servidor.kill();
 }
})().catch(e=>{console.error(e);process.exitCode=1});
