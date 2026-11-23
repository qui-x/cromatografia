"use strict";
/* Playwright: inventário por tela e teste real de docas do SIAC. */
const fs=require("node:fs"),path=require("node:path"),http=require("node:http"),{spawn}=require("node:child_process");
const {chromium,firefox,webkit}=require("playwright");
const root=path.resolve(__dirname,".."),port=4192,engine=process.env.SIAC_BROWSER||"chromium";
const widths=(process.env.SIAC_WIDTHS||"360,768,1360").split(",").map(Number);
const routes=["inicio","aprender","missoes","roteiros","laboratorio","caderno","manual","professor"];
const directory=path.join(root,"docs/evidencias/siac-auditoria-telas",engine);
const report={browser:engine,widths,routes:[],docas:[],issues:[],critical:0,warnings:0};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const mark=(screen,width,level,msg,detail)=>{
 report.issues.push({screen,width,level,msg,detail:String(detail||"").slice(0,900)});
 if(level==="critical")report.critical++;else report.warnings++;
};
async function photo(page,width,name){
 const dir=path.join(directory,String(width));fs.mkdirSync(dir,{recursive:true});
 try{await page.screenshot({path:path.join(dir,name+".png"),fullPage:false,timeout:12000})}
 catch(e){mark(name,width,"warning","Falha na captura",e.message)}
}
async function serverReady(){
 for(let i=0;i<75;i++){
  try{const ok=await new Promise((resolve,reject)=>{
   const req=http.get("http://127.0.0.1:"+port+"/index.html",res=>{
    const valid=res.statusCode===200;res.resume();res.on("end",()=>resolve(valid));
   });req.on("error",reject);req.setTimeout(1000,()=>req.destroy());
  });if(ok)return}catch(_){}
  await sleep(150);
 }
 throw Error("Servidor local indisponível");
}
async function visit(page,width,screen){
 const errors=[],handler=e=>errors.push(e.message);
 page.on("pageerror",handler);
 try{
  await page.goto("http://127.0.0.1:"+port+"/index.html#/"+screen,
   {waitUntil:"domcontentloaded",timeout:20000});
  await page.waitForFunction(s=>document.body?.dataset.rota===s,screen,{timeout:12000});
  await page.waitForTimeout(200);
  const info=await page.evaluate(()=>{
   const visible=[...document.querySelectorAll("main > [data-tela]")].filter(el=>!el.hidden);
   const text=visible.map(el=>el.textContent||"").join(" "),box=visible[0]?.getBoundingClientRect();
   return {route:document.body.dataset.rota,title:document.title,
    sections:visible.map(el=>el.dataset.tela),content:text.trim().length,
    visible:!!box&&box.width>0&&box.height>0,
    overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
    legacy:/\bSIAB\b|indicador ácido.base|medir pH/i.test(text)};
  });
  if(!info.visible)mark(screen,width,"critical","Tela não renderizada",JSON.stringify(info));
  if(info.overflow>6)mark(screen,width,"critical","Rolagem horizontal",info.overflow);
  if(errors.length)mark(screen,width,"critical","Erros JavaScript",errors.join(" ; "));
  if(info.legacy)mark(screen,width,"warning","Conteúdo SIAB ainda visível");
  if(info.content<25)mark(screen,width,"warning","Conteúdo pouco preenchido");
  if(screen==="inicio"&&await page.locator('a[href*="previews/coluna-laboratorio.html"]').count())
   mark(screen,width,"critical","Página oficial ainda apresenta prévia experimental");
  if(!info.title.includes("SIAC"))mark(screen,width,"warning","Título sem SIAC");
  report.routes.push({screen,width,...info,errors});
  await photo(page,width,screen);
 }catch(e){mark(screen,width,"critical","Falha ao acessar tela",e.message);await photo(page,width,screen+"-falha")}
 finally{page.off("pageerror",handler)}
}
async function open(page,id){
 const b=page.locator("#"+id);
 if(await b.getAttribute("aria-expanded")!=="true")await b.click({force:true});
 await page.waitForFunction(id=>document.getElementById(id)?.getAttribute("aria-expanded")==="true",
  id,{timeout:4000});
}
async function geometry(page){
 return page.evaluate(()=>{
  const el=id=>document.getElementById(id),box=x=>{
   if(!x)return null;const r=x.getBoundingClientRect();
   return {x:r.x,right:r.right,y:r.y,width:r.width,height:r.height};
  };
  const stage=el("siac-stage"),r=box(stage),c=stage&&getComputedStyle(stage);
  const item=stage?.querySelector(".siac-coluna-centro,.siac-lado,.siac-grid");
  return {stage:r,art:box(item),left:box(el("controls")),right:box(el("ver-panel")),
   content:r&&{x:r.x+(parseFloat(c.paddingLeft)||0),right:r.right-(parseFloat(c.paddingRight)||0)},
   overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
   source:el("ver-panel")?.dataset.source,
   leftOpen:el("workspace-montagem")?.getAttribute("aria-expanded"),
   rightOpen:el("workspace-dados")?.getAttribute("aria-expanded")};
 });
}
async function inspectDock(page,width){
 try{
  await page.goto("http://127.0.0.1:"+port+"/index.html#/laboratorio",
   {waitUntil:"domcontentloaded",timeout:20000});
  await page.waitForFunction(()=>window.SIAC?.laboratorio?.active===true,null,{timeout:12000});
  // A experiência atual começa no catálogo científico (sem simulações reais).
  // O diagnóstico de coluna/frascos/papéis só é válido após optar pela
  // Demonstração hipotética. Não alterar o modo padrão da aplicação.
  const initialMode=await page.evaluate(()=>window.SIAC?.laboratorio?.snapshot?.modo);
  if(initialMode!=="pesquisa")mark("laboratorio",width,"critical","O catálogo deve iniciar como pesquisa",initialMode);
  await photo(page,width,"catalogo-cientifico");
  await page.locator('[data-siac-modo="demo"]').evaluate(el=>el.click());
  await page.waitForFunction(()=>window.SIAC?.laboratorio?.snapshot?.modo==="demonstracao",
    null,{timeout:4000});
  for(const id of ["workspace-montagem","workspace-ver","workspace-dados"])
   if(await page.locator("#"+id).isHidden())mark("docas",width,"critical","Lançador oculto",id);
  await photo(page,width,"bancada-coluna");
  await open(page,"workspace-montagem");
  await photo(page,width,"montagem-aberta");
  // Em mobile a doca é uma bottom sheet modal: fechar Montagem antes de
  // tocar Dados. Dois painéis simultâneos só fazem sentido em desktop largo.
  if(width<1280){
   const close=page.locator("#close-controls");
   if(await close.isVisible())await close.click({force:true});
   else await page.keyboard.press("Escape");
   await page.waitForFunction(()=>
    document.getElementById("workspace-montagem")?.getAttribute("aria-expanded")==="false",
    null,{timeout:4000});
  }
  await open(page,"workspace-dados");
  const g=await geometry(page);
  const data=page.locator("#siac-dados");
  if(!(await data.isVisible()))mark("dados",width,"critical","Doca Dados invisível");
  const txt=await data.textContent();
  if(!/Dados · Coluna cromatográfica/.test(txt))
   mark("dados",width,"critical","Dados não refletem a coluna",txt.slice(0,180));
  if(/\bpH\b|Ácido.Base/i.test(txt))
   mark("dados",width,"critical","Dados ácido-base vazaram ao SIAC");
  if(g.overflow>6)mark("docas",width,"critical","Rolagem horizontal com docas",JSON.stringify(g));
  if(width>=1280&&g.content&&g.art&&
      (g.art.x<g.content.x-8||g.art.right>g.content.right+8))
   mark("docas",width,"critical","Arte ultrapassa espaço útil entre docas",JSON.stringify(g));
  report.docas.push({width,context:"montagem+dados",geometry:g});
  await photo(page,width,"montagem-e-dados");
  // Bottom sheets tornam a cena inerte: alterar o foco exige primeiro
  // fechar a doca, trocar o objeto e reabrir Dados. Em desktop, foco direto.
  const closeRight=async()=>{
   await page.locator("#dock-close-right").click({force:true});
   await page.waitForFunction(()=>
    document.getElementById("ver-panel")?.classList.contains("dock-collapsed"),
    null,{timeout:4000});
  };
  const focusNext=async()=>{
   if(width<=900)await closeRight();
   await page.locator("#focus-tab").click({force:true});
   if(width<=900)await open(page,"workspace-dados");
  };
  await focusNext();
  if(!/Frasco F1/.test(await data.textContent()))
   mark("dados",width,"critical","Dados não seguem Tubo em foco");
  await photo(page,width,"dados-tubo");
  await focusNext();
  if(!/Papel P1/.test(await data.textContent()))
   mark("dados",width,"critical","Dados não seguem Papel em foco");
  await photo(page,width,"dados-papel");
  await focusNext();
  if(width<=900)await closeRight();
  await open(page,"workspace-ver");
  if(!(await page.locator("#siac-ver").isVisible())||await data.isVisible())
   mark("ver",width,"critical","Ver não substitui Dados corretamente");
  await photo(page,width,"ver-aberto");
  if(width<=900)await closeRight();
  await page.locator("#overview-tab").click({force:true});
  await photo(page,width,"visao-geral-frascos");
  await page.locator("#overview-tab").click({force:true});
  await photo(page,width,"visao-geral-papeis");
  if(width<=900){
   await page.keyboard.press("Escape");await sleep(120);
   const after=await geometry(page);
   if(after.overflow>6)mark("docas",width,"critical","Escape causou overflow",JSON.stringify(after));
  }
 }catch(e){
  mark("docas",width,"critical","Falha ao percorrer Montagem/Ver/Dados",e.stack||e.message);
  await photo(page,width,"docas-falha");
 }
}
(async()=>{
 fs.mkdirSync(directory,{recursive:true});
 const server=spawn("python3",["-m","http.server",String(port),"--bind","127.0.0.1"],
  {cwd:root,stdio:"ignore"});
 let browser;
 try{
  await serverReady();
  browser=await ({chromium,firefox,webkit}[engine]).launch({headless:true});
  for(const width of widths){
   const context=await browser.newContext({viewport:{width,height:width<450?780:860},
    reducedMotion:"reduce",serviceWorkers:"block"});
   const page=await context.newPage();
   for(const route of routes)await visit(page,width,route);
   await inspectDock(page,width);
   await context.close();
  }
 }catch(e){mark("infraestrutura",0,"critical","Falha geral",e.stack||e.message)}
 finally{
  await browser?.close();server.kill();
  fs.writeFileSync(path.join(directory,"auditoria.json"),JSON.stringify(report,null,2)+"\n");
  console.log("SIAC tela a tela",engine,"telas",report.routes.length,
   "docas",report.docas.length,"críticas",report.critical,"alertas",report.warnings);
  for(const i of report.issues.slice(0,35))console.log(i.level,i.screen,i.width,i.msg,i.detail);
  if(report.critical)process.exitCode=1;
 }
})().catch(e=>{console.error(e);process.exitCode=1});
