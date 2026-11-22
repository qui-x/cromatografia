"use strict";
/* Inspeção automatizada da vinheta real do SIAC em Chromium.
 * Captura etapas para revisão humana. Executada em CI, sem modificar o app.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");
const { chromium } = require("playwright");
const root = path.resolve(__dirname,"..");
const out = path.join(root,"docs","evidencias","siac-abertura");
fs.mkdirSync(out,{recursive:true});

async function main() {
  const server = spawn("python3",["-m","http.server","4173","--bind","127.0.0.1"],{
    cwd:root, stdio:"ignore"
  });
  let browser;
  try {
    browser = await chromium.launch({headless:true, args:["--no-sandbox"]});
    const page = await browser.newPage({ viewport:{width:1280,height:800}, deviceScaleFactor:1 });
    const failures = [];
    page.on("pageerror", e => {
      // O SIAB legado ainda possui módulos não migrados; registrar erros para revisão
      // sem atribuí-los automaticamente à abertura.
      failures.push(e.message);
    });
    for(let tries=0;tries<35;tries++){
      try { await page.goto("http://127.0.0.1:4173/index.html", {waitUntil:"domcontentloaded", timeout:1800}); break; }
      catch(e) { if(tries===34) throw e; await new Promise(r=>setTimeout(r,120)); }
    }
    await page.waitForSelector("#abertura .siac-ab-papel-grupo",{timeout:4000});
    assert.equal(await page.locator("#abertura .siac-ab-trilha").count(),3);
    assert.equal(await page.locator("#abertura .siac-ab-faixa").count(),9);
    assert(await page.locator('#abertura .abertura-marca img[src="assets/siac-icone.svg"]').count()>0);
    await page.screenshot({path:path.join(out,"01-aplicacao.png")});
    await page.waitForTimeout(1250);
    assert(await page.locator("#abertura").evaluate(el=>el.classList.contains("siac-ab-imersa"))===false ||
      await page.locator("#abertura").evaluate(el=>el.classList.contains("siac-ab-aplicando")));
    await page.screenshot({path:path.join(out,"02-amostras.png")});
    await page.waitForTimeout(1850);
    assert(await page.locator("#abertura").evaluate(el=>el.classList.contains("siac-ab-desenvolvendo")));
    await page.screenshot({path:path.join(out,"03-ascensao.png")});
    await page.waitForTimeout(1850);
    await page.screenshot({path:path.join(out,"04-bandas-e-marca.png")});
    await page.waitForTimeout(1000);
    await page.screenshot({path:path.join(out,"05-identidade.png")});
    // Pular a vinheta deve dispensar o restante sem bloquear a página.
    await page.keyboard.press("Escape");
    await page.waitForTimeout(420);
    assert.equal(await page.locator("#abertura").count(),0);
    const less = await browser.newPage({
      viewport:{width:375,height:740},
      reducedMotion:"reduce"
    });
    await less.goto("http://127.0.0.1:4173/index.html",{waitUntil:"domcontentloaded"});
    await less.waitForTimeout(300);
    assert.equal(await less.locator("#abertura").count(),0);
    // Celular no modo padrão: cena deve caber no viewport.
    const mobile=await browser.newPage({viewport:{width:375,height:740},isMobile:true,hasTouch:true});
    await mobile.goto("http://127.0.0.1:4173/index.html",{waitUntil:"domcontentloaded"});
    await mobile.waitForSelector("#abertura .siac-ab-papel-grupo");
    await mobile.waitForTimeout(5200);
    await mobile.screenshot({path:path.join(out,"06-mobile.png")});
    const dim=await mobile.locator(".abertura-tubos").boundingBox();
    assert(dim && dim.width<=375+1 && dim.height<=740+1, "Vinheta fora da tela mobile");
    fs.writeFileSync(path.join(out,"relatorio.json"),JSON.stringify({
      desktop:{width:1280,height:800},mobile:{width:375,height:740},
      trilhas:3, bandas:9, movimentoReduzido:"respeitado",
      pular:"validado", imagens:6, errosPaginaLegado:failures
    },null,2));
    console.log("SIAC: vinheta validada em Chromium; 3 trilhas, 9 bandas e 6 capturas.");
  } finally {
    await browser?.close();
    server.kill("SIGTERM");
  }
}
main().catch(e=>{console.error(e);process.exitCode=1});
