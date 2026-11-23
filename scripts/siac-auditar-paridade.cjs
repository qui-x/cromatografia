#!/usr/bin/env node
"use strict";
const fs=require("node:fs");
const path=require("node:path");
const cp=require("node:child_process");
const base=path.resolve(__dirname,"..");
const manifest=JSON.parse(fs.readFileSync(path.join(base,"docs/SIAC-INVENTARIO-BASE.json"),"utf8"));
const rules=JSON.parse(fs.readFileSync(path.join(base,"docs/SIAC-SUBSTITUICOES.json"),"utf8"));
let ok=0,changed=0,fail=[];
for(const f of manifest.arquivos){
  const r=rules[f.origem]||{estado:"preservado"};
  if(!["preservado","adaptado","substituido","arquivado"].includes(r.estado)){
    fail.push(f.origem+": estado desconhecido");continue;
  }
  const mapped=r.destino||f.destino;
  const full=path.join(base,mapped);
  if(!fs.existsSync(full)){
    fail.push(f.origem+": ausente, esperado em "+mapped);continue;
  }
  const actual=cp.execFileSync("git",["hash-object","--",full],{encoding:"utf8"}).trim();
  if(r.estado==="preservado"||r.estado==="arquivado"){
    if(actual!==f.sha){fail.push(f.origem+": SHA modificado sem mapeamento de adaptação");continue}
  } else {
    if(!r.motivo||!r.teste){fail.push(f.origem+": alteração sem motivo e teste registrados");continue}
    changed++;
  }
  ok++;
}
console.log("SIAC — paridade:",ok+"/"+manifest.arquivos.length,"arquivos auditados;",changed,"mudanças mapeadas.");
if(fail.length){for(const s of fail)console.error("ERRO:",s);process.exitCode=1}
