"use strict";
const assert=require("node:assert/strict");
const h=require("../js/simulation/siac-homologacao.js");
const base=require("../data/siac/analitos-protocolos.v1.json");
const report=h.auditarCatalogo(base);
assert.equal(report.resumo.catalogados,76);
assert.equal(report.resumo.comUmOuMaisMetodosDeRetencao,24);
assert.equal(report.resumo.comDoisOuMaisMetodosDeRetencao,22,
  "os 20 candidatos com dois métodos devem ter evidência individual");
assert.equal(report.resumo.comDoisMetodosESolventesContrastantes,22);
assert.equal(report.resumo.completamenteHomologados,0,
  "catálogo experimental ainda não homologado segundo a política de dois métodos");
assert.equal(report.resumo.faltamParaMetaMinima,40);
assert.equal(report.resumo.faltamParaMetaAmpliada,55);
assert(report.candidatos.every(c=>!c.homologacaoCompleta));

const matriz=require("../data/siac/matriz-cobertura-dois-metodos.v2.json");
assert.equal(matriz.resumo.candidatos,report.resumo.catalogados,"matriz e motor divergem: catálogo");
assert.equal(matriz.resumo.comPeloMenosUmRfIndividual,report.resumo.comUmOuMaisMetodosDeRetencao);
assert.equal(matriz.resumo.comDoisMetodosDocumentados,report.resumo.comDoisOuMaisMetodosDeRetencao);
assert.equal(matriz.resumo.comDoisMetodosESolventesDistintos,report.resumo.comDoisMetodosESolventesContrastantes);
assert.equal(matriz.resumo.homologadosNaRegraNova,report.resumo.completamenteHomologados);
assert.equal(matriz.resumo.totaisRegistroRfPontual,
 base.protocolos.reduce((n,p)=>n+(p.dadosRf?.length||0),0));
assert.equal(matriz.resumo.totalRfIntervalos,
 base.protocolos.reduce((n,p)=>n+(p.dadosRfIntervalos?.length||0),0));
assert.equal(matriz.resumo.totaisRegistroRfPontual,74);
assert.equal(matriz.resumo.totalRfIntervalos,1);
assert.deepEqual(
 matriz.candidatos.filter(c=>c.doisSolventesContrastantesEmDoisMetodos).map(c=>c.id).sort(),
 report.candidatos.filter(c=>c.comparacoesPossiveis.length>0).map(c=>c.id).sort(),
 "pares de métodos em pesquisa precisam coincidir entre a matriz publicada e o motor");
assert(matriz.candidatos.every(c=>!c.homologacaoCompleta),
 "não promover tabela didática para homologação");

assert.equal(h.avaliarSubstancia("glycine",base).metodosComRetencaoIndividual,4);
assert.equal(h.avaliarSubstancia("chlorophyll_a",base).metodosComRetencaoIndividual,2);
assert.equal(h.avaliarSubstancia("pheophytin_b",base).metodosComRetencaoIndividual,2);
const pheo=h.avaliarSubstancia("pheophytin_b",base);
assert(pheo.metodos.some(m=>m.registrosRfIntervalos===1),
 "o Rf da fonte deve permanecer como intervalo, não estimativa pontual");
assert.equal(h.avaliarSubstancia("arginine",base).metodosComRetencaoIndividual,2,
 "arginina tem dois sistemas de solventes em pesquisa");
assert.equal(h.avaliarSubstancia("glutamine",base).metodosComRetencaoIndividual,2,
 "glutamina tem dois sistemas de solventes em pesquisa");
assert.equal(h.avaliarSubstancia("caffeine",base).metodosComRetencaoIndividual,0);
assert.throws(()=>h.avaliarSubstancia("inventado",base),RangeError);
const candidate={...base.candidatos.find(c=>c.id==="glycine"),
 identity:{cas:"56-40-6",verificadoIndividualmente:true}};
const method=(id,components,valor,options={})=>({
 id,tecnica:"ccd",status:options.status||"homologado",fonte:"exemplo",
 faseEstacionaria:{classe:"sílica gel 60",detalhamento:"placa de 0,25 mm",
  homologada:true},
 faseMovel:{componentes:components.map(c=>({id:c[0],partes:c[1]})),base:"v/v",
  homologada:true},
 aplicacao:{detector:"ninhidrina",detectorHomologado:true},
 dadosRf:[{analito:"glycine",rf:valor,classe:options.classe||"medido",
  homologado:options.valorHomologado!==false}]
});
const source={candidatos:[candidate],fontes:{exemplo:"https://example.org/dados-experimentais"},
 protocolos:[
  method("protocolo-A",[["water",10],["butanol_1",90]],.23),
  method("protocolo-B",[["ethyl_acetate",70],["methanol",30]],.44)
 ]};
let x=h.auditarCatalogo(source);
assert.equal(x.resumo.completamenteHomologados,1,
 "dois protocolos independentes, solventes diferentes e evidência homologada devem habilitar o candidato de teste");
assert.equal(x.candidatos[0].comparacoesHomologadas.length,1);
source.protocolos[1]=method("protocolo-B",[["water",20],["butanol_1",80]],.44);
x=h.auditarCatalogo(source);
assert.equal(x.resumo.completamenteHomologados,0,
 "mudar apenas a proporção da MESMA mistura não satisfaz a exigência de solventes diferentes");
assert.equal(x.resumo.comDoisMetodosESolventesContrastantes,0);
source.protocolos[1]=method("protocolo-B",[["water",20],["ethyl_acetate",80]],.44);
assert.equal(h.auditarCatalogo(source).resumo.completamenteHomologados,1);
source.protocolos[1].id="protocolo-A";
assert.equal(h.auditarCatalogo(source).resumo.completamenteHomologados,0,
 "dois registros do mesmo protocolo não são dois métodos");
source.protocolos[1].id="protocolo-B";
source.protocolos[1].dadosRf[0].classe="predito";
assert.equal(h.auditarCatalogo(source).resumo.completamenteHomologados,0,
 "predição de Rf não pode servir de única evidência de homologação");
source.protocolos[1].dadosRf[0].classe="medido";
source.protocolos[1].aplicacao.detectorHomologado=false;
assert.equal(h.auditarCatalogo(source).resumo.completamenteHomologados,0,
 "detector precisa ter comprovação");
source.protocolos[1].aplicacao.detectorHomologado=true;
source.candidatos[0].identity.verificadoIndividualmente=false;
assert.equal(h.auditarCatalogo(source).resumo.completamenteHomologados,0,
 "identidade molecular precisa estar conferida");
source.candidatos[0].identity.verificadoIndividualmente=true;
source.protocolos[0].faseMovel.componentes=[{id:"water",partes:60},{id:"sodium_chloride",partes:40}];
source.protocolos[1].faseMovel.componentes=[{id:"water",partes:100}];
assert.equal(h.auditarCatalogo(source).resumo.completamenteHomologados,0,
 "sal de cozinha é aditivo, não um segundo solvente químico");
console.log("SIAC homologação: mínimo dois métodos e solventes contrastantes, dados e identidade homologados — OK");
