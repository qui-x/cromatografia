"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.join(__dirname,"..");
const catalog=require("../js/data/siac-catalogo-contextual.js");
assert.equal(catalog.dados.candidatos.length,76,"todos os 76 analitos devem estar presentes");
assert.deepEqual(catalog.grupos().map(g=>g.total),[11,20,20,14,11],"grupos são os mesmos do registro científico");
assert.equal(new Set(catalog.dados.candidatos.map(a=>a.id)).size,76,"identificadores únicos");
assert.equal(catalog.candidatos("","").length,76);
assert(catalog.candidatos("","glicina").some(a=>a.id==="glycine"));
assert(catalog.candidatos("corantes_alimenticios").length===11);
assert.deepEqual(catalog.sistemasPara(""),[],"solventes exigem substância");
assert.deepEqual(catalog.sistemasPara("caffeine"),[],"ausência de dados não cria solvente");
assert.equal(catalog.sistemasPara("glycine").length,1);
assert.equal(catalog.sistemasPara("glycine")[0].rf,0.2);
assert.match(catalog.sistemasPara("glycine")[0].faseMovel,/butanol/i);
assert.equal(catalog.sistemasPara("pheophytin_a")[0].rf,0.6);
assert.match(catalog.sistemasPara("pheophytin_a")[0].faseMovel,/éter de petróleo/i);
assert.equal(catalog.sistemasPara("tartrazina")[0].rf,null,"procedimento de família não cria Rf");
assert.equal(catalog.sistemasPara("tartrazina")[0].evidencia,"procedimento_de_familia");
assert.equal(catalog.projetarDistancia("glycine",catalog.sistemasPara("glycine")[0].id,50).distanciaMm,10);
assert.equal(catalog.projetarDistancia("caffeine","qualquer",50),null);
assert.equal(catalog.projetarDistancia("glycine",catalog.sistemasPara("glycine")[0].id,-1),null);
const m=new Map(catalog.dados.candidatos.map(a=>[a.id,catalog.sistemasPara(a.id)]));
assert.equal([...m.values()].filter(v=>v.some(x=>x.rf!==null)).length,11,
  "apenas 11 compostos com Rf individual do banco original");
assert.equal([...m.values()].filter(v=>v.length>0).length,22,
  "outros 11 corantes possuem indicação de procedimento da família, não Rf individual");
assert([...m.values()].flat().every(x=>x.permiteSimulacaoColuna===false),
  "referência planar não pode ativar motor de coluna");
const index=fs.readFileSync(path.join(root,"index.html"),"utf8");
assert(index.indexOf("js/data/siac-catalogo-contextual.js")<index.indexOf("js/ui/siac-laboratorio-integrado.js"),
  "o catálogo deve carregar antes da bancada");
const ui=fs.readFileSync(path.join(root,"js/ui/siac-laboratorio-integrado.js"),"utf8");
assert(ui.includes("if(catalogMode)return;"),"modo científico deve bloquear interações do modelo hipotético");
console.log("SIAC Catálogo: 76 candidatos, 5 famílias, 11 Rf de referência, 11 procedimentos de classe, 54 sem vínculo individual/familiar documentado.");
