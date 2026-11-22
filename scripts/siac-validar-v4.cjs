"use strict";
/* Validação real da animação SIAC v4 em Chromium e em viewport mobile.
 * Confere semântica dos três recipientes, geometria contínua e acessibilidade.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {spawn}=require("node:child_process");
const {chromium}=require("playwright");
const root=path.resolve(__dirname,"..");
const out=path.join(root,"docs","evidencias","siac-abertura");
fs.mkdirSync(out,{recursive:true});
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function main(){
  const server=spawn("python3",["-m","http.server","4173","--bind","127.0.0.1"],{cwd:root,stdio:"ignore"});
  let browser;
  try{
    browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
    const page=await browser.newPage({viewport:{width:1360,height:860},deviceScaleFactor:1});
    const errors=[];
    page.on("pageerror",e=>errors.push(e.message));
    let loaded=false;
    for(let i=0;i<30;i++){
      try{
        await page.goto("http://127.0.0.1:4173/previews/abertura-v4.html",{waitUntil:"domcontentloaded",timeout:1900});
        loaded=true;break;
      }catch(e){await sleep(180)}
    }
    assert(loaded,"Servidor local não iniciou");
    await page.waitForSelector("#abertura .siac-v4-bequer",{timeout:4000});
    assert.equal(await page.locator("#abertura [data-placa]").count(),3);
    assert.equal(await page.locator("#abertura [data-frente]").count(),3);
    assert.equal(await page.locator("#abertura [data-umidade]").count(),3);
    assert.equal(await page.locator("#abertura [data-mancha]").count(),10);
    assert.equal(await page.locator("#abertura [data-trilha]").count(),10);
    assert.equal(await page.locator("#abertura [data-nevoa]").count(),10);
    assert.equal(await page.locator('#abertura radialGradient[id^="siac-v4-mancha"]').count(),10);
    const stops=await page.locator('#siac-v4-mancha-0-0 stop').count();
    assert.equal(stops,6,"O núcleo deve dissolver em seis faixas graduais");
    const trilhaCss=await page.locator('[data-trilha="0-0"]').evaluate(el=>getComputedStyle(el).fill);
    assert.notEqual(trilhaCss,"none","Rastro precisa usar preenchimento degradê");

    assert.equal(await page.locator("#abertura .siac-v4-capilar").count(),3);
    assert.equal(await page.locator('img[src="../assets/siac-icone.svg"]').count(),0,
      "A marca só deve ter o ícone central da cena");
    assert.equal(await page.locator("#abertura .siac-v4-assinatura-simbolo").count(),1);
    assert.equal(await page.locator("#abertura .siac-v4-arcos").count(),0);
    assert.equal(await page.locator("#abertura [data-arco]").count(),0);
    await page.waitForTimeout(340);
    await page.screenshot({path:path.join(out,"01-tres-bequeres.png")});
    await page.waitForTimeout(1000);
    await page.screenshot({path:path.join(out,"02-aplicacao.png")});
    await page.waitForTimeout(1480);
    await page.screenshot({path:path.join(out,"03-subida.png")});
    await page.waitForTimeout(1000);
    await page.screenshot({path:path.join(out,"04-rastros.png")});
    await page.waitForTimeout(1040);
    await page.screenshot({path:path.join(out,"05-separacao.png")});
    await page.waitForFunction(() => document.querySelector("#abertura")?.classList.contains("com-marca"),null,{timeout:1200});
    await page.waitForTimeout(160);
    await page.screenshot({path:path.join(out,"06-identidade.png")});
    assert.equal(await page.locator("#abertura .siac-v4-assinatura-simbolo").count(),1);
    const marcaOpacity = await page.locator("#abertura .siac-v4-assinatura-simbolo")
      .evaluate(el => Number(getComputedStyle(el).opacity));
    assert(marcaOpacity>.2,"O ícone central precisa estar visível no encerramento");
    const model=await page.evaluate(()=>{
      const engine=window.SIAB.abertura;
      return Array.from({length:49},(_,i)=>engine.quadro(1550+i*64));
    });
    assert.equal(model.length,49);
    model.forEach((q,idx)=>{
      assert.equal(q.placas.length,3);
      q.placas.forEach((p,pi)=>{
        assert(Number.isFinite(p.frenteY), "frente não finita");
        assert(p.frenteY<=342+1e-6 && p.frenteY>=140-1e-6,"frente fora do papel");
        for(const b of p.bandas){
          assert(b.y>=p.frenteY-1e-5, "banda acima da frente móvel");
          assert(b.y<=342+1e-5, "banda abaixo da origem");
          assert(b.rf>0 && b.rf<1,"rf artístico inválido");
        }
        if(idx>0)assert(p.frenteY<=model[idx-1].placas[pi].frenteY+1e-6,
          "frente recuou entre quadros");
      });
    });
    const coords=await page.evaluate(()=>{
      const svg=document.querySelector("#abertura svg");
      return {svgWidth:svg.getBoundingClientRect().width,svgHeight:svg.getBoundingClientRect().height};
    });
    assert(coords.svgWidth<=1360+2 && coords.svgWidth>650);

    // Página real: a animação deve usar a mesma cena e o título corrigido.
    const app=await browser.newPage({viewport:{width:1024,height:768},deviceScaleFactor:1});
    await app.goto("http://127.0.0.1:4173/index.html",{waitUntil:"domcontentloaded"});
    await app.waitForSelector("#abertura [data-placa]",{timeout:4000});
    await app.waitForFunction(()=>document.title.endsWith("· SIAC"),null,{timeout:4500});
    assert.match(await app.title(),/· SIAC$/);
    assert.equal(await app.locator("#abertura [data-placa]").count(),3);
    await app.keyboard.press("Escape");
    assert.equal(await app.locator("#abertura.saindo").count(),1,
      "Encerramento SIAB: a classe saindo deve preceder a remoção");
    const duracao = await app.locator("#abertura").evaluate(el=>getComputedStyle(el).transitionDuration);
    assert.match(duracao,/0\.35s|350ms/,"Dissolução do SIAB precisa manter 350 ms");
    await app.waitForTimeout(520);
    assert.equal(await app.locator("#abertura").count(),0,"Escape deve pular abertura");

    // Acessibilidade: movimento reduzido não toca a vinheta.
    const less=await browser.newPage({viewport:{width:390,height:844},reducedMotion:"reduce"});
    await less.goto("http://127.0.0.1:4173/previews/abertura-v4.html",{waitUntil:"domcontentloaded"});
    await less.waitForTimeout(300);
    assert.equal(await less.locator("#abertura").count(),0);

    // Layout mobile com três recipientes visíveis, sem rolagem horizontal.
    const mobile=await browser.newPage({
      viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1
    });
    await mobile.goto("http://127.0.0.1:4173/previews/abertura-v4.html",{waitUntil:"domcontentloaded"});
    await mobile.waitForSelector("#abertura [data-placa]",{timeout:4000});
    await mobile.waitForTimeout(4170);
    await mobile.screenshot({path:path.join(out,"07-mobile.png")});
    const bounds=await mobile.locator("#abertura .abertura-tubos").boundingBox();
    assert(bounds && bounds.width<=392 && bounds.height<=844,"SVG excedeu tela mobile");
    assert.equal(await mobile.locator("#abertura [data-placa]").count(),3);
    assert.deepEqual(errors,[],"Erros JS na prévia: "+errors.join("; "));
    fs.writeFileSync(path.join(out,"relatorio.json"),JSON.stringify({
      estado:"aprovado",versao:"SIAC v4",desktop:{width:1360,height:860},
      mobile:{width:390,height:844},camaras:3,componentes:10,capturas:7,
      motor:"requestAnimationFrame",estadoMotriz:"redução de movimento respeitada",
      geometria:"frente monotônica; cada banda sempre abaixo da frente",
      navegacao:"Início · SIAC; Escape encerra a abertura",
      imagens:["01-tres-bequeres.png","02-aplicacao.png","03-subida.png",
        "04-rastros.png","05-separacao.png","06-identidade.png","07-mobile.png"]
    },null,2));
    console.log("SIAC V4: três câmaras, 10 bandas, geometria, desktop/mobile, título e acessibilidade aprovados.");
  }finally{
    await browser?.close();
    server.kill("SIGTERM");
  }
}
main().catch(err=>{console.error(err);process.exitCode=1});
