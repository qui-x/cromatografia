"use strict";
const fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,"..");
const src=path.join(root,"data/siac/analitos-protocolos.v1.json");
const core=require(src),homologacao=require("../js/simulation/siac-homologacao.js");
const report=homologacao.auditarCatalogo(core);
if(report.resumo.catalogados!==76)throw Error("Catálogo de 76 candidatos está incompleto");
if(report.resumo.completamenteHomologados>report.resumo.comDoisMetodosESolventesContrastantes)
 throw Error("Falha na regra de dois protocolos com solventes diferentes");
if(report.resumo.comDoisMetodosESolventesContrastantes>report.resumo.comDoisOuMaisMetodosDeRetencao)
 throw Error("Contraste não pode existir sem dois métodos");
const output={versao:"2.0",geradoDo:"data/siac/analitos-protocolos.v1.json",
  aviso:"Esta auditoria usa apenas dados existentes e NÃO equivale a cruzamento externo completo.",
  ...report};
const filepath=path.join(root,"docs/evidencias/siac-ciencia/matriz-homologacao-76.json");
if(process.argv.includes("--write")){
 fs.mkdirSync(path.dirname(filepath),{recursive:true});
 fs.writeFileSync(filepath,JSON.stringify(output,null,2)+"\n");
 console.log("Matriz científica gerada:",filepath);
}
console.log("SIAC — cobertura sob política de dois métodos:",JSON.stringify(report.resumo));
if(process.argv.includes("--check")&&report.resumo.catalogados!==76)process.exitCode=1;
