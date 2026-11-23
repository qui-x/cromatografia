"use strict";
// SIAC: curadoria científica não pode virar dado simulado sem proveniência.
// Os registros são uma amostra inicial para pesquisa, não homologação de motores.
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=(s)=>JSON.parse(fs.readFileSync(path.join(root,s),"utf8"));
const solvents=read("data/siac/solventes-propriedades.v1.json");
const analytes=read("data/siac/analitos-protocolos.v1.json");
const engines=read("data/siac/motores-fontes.v1.json");
const stationary=read("data/siac/fases-estacionarias.v1.json");

function unique(list,n){
  const ids=list.map(x=>x.id);
  assert.equal(ids.length,new Set(ids).size,n+" duplicados");
}
function url(s){
  assert.equal(typeof s,"string");assert(/^https:\/\/[^ ]+/.test(s),"fonte externa inválida: "+s);
}
unique(solvents.solventes,"solventes");
unique(analytes.candidatos,"analitos");
unique(analytes.protocolos,"protocolos");
unique(engines.motores,"motores");
unique(stationary.fasesEstacionarias,"fases estacionárias");
assert.equal(solvents.status,"PESQUISA_NAO_HOMOLOGADA");
assert.equal(analytes.status,"PESQUISA_NAO_HOMOLOGADA");
assert.equal(engines.status,"candidatos_nao_integrados");
assert.equal(solvents.solventes.length,42);
assert.equal(analytes.candidatos.length,76);
assert.equal(analytes.protocolos.length,29);
assert.equal(engines.motores.length,9);
assert.equal(stationary.status,"PESQUISA_NAO_HOMOLOGADA");
assert.equal(stationary.fasesEstacionarias.length,18);
for(const [id,src] of Object.entries(stationary.fontes))url(src.url);
for(const phase of stationary.fasesEstacionarias){
  assert(phase.sourceId&&stationary.fontes[phase.sourceId],"Sem referência do suporte: "+phase.id);
  assert(phase.estado==="candidato_sem_parametros","Fase não homologada incorretamente: "+phase.id);
  assert(Array.isArray(phase.tecnicas)&&phase.tecnicas.length>0);
  for(const value of Object.values(phase.propriedades))assert.equal(value,null,
    "Parâmetro geral da fase deve permanecer nulo; apenas exemplos de produtos podem ter valores");
}
const g25=stationary.fasesEstacionarias.find(x=>x.id==="column_sephadex_g25");
assert.equal(g25.exemploProduto.tamanhoParticulaUm.min,85);
assert.equal(g25.exemploProduto.tamanhoParticulaUm.max,260);
assert.equal(g25.exemploProduto.limiteExclusaoMassaMolarAproxDa.value,5000);
assert.equal(g25.exemploProduto.fonte,"CYTIVA_G25");
assert(stationary.fasesEstacionarias.some(x=>x.id==="column_porous_graphitic_carbon"));

assert.equal(solvents.paresMiscibilidade.length,41);
for(const [id,v] of Object.entries(solvents.fontes)){url(v.url);assert(v.name,"fonte sem nome: "+id);}
for(const [id,source] of Object.entries(analytes.fontes))url(source);
for(const item of engines.fontes)url(item.url);
const completeDensity=solvents.solventes.filter(s=>s.propriedades.densidade);
assert.equal(completeDensity.length,23);
const nhex=solvents.solventes.find(s=>s.id==="n_hexane");
assert(nhex&&nhex.cas==="110-54-3"&&nhex.tipo==="substancia");
assert.notEqual(nhex.id,"hexanes_mixture");
assert(Object.values(nhex.propriedades).every(v=>v===null),
 "n-hexano não deve herdar propriedades da mistura comercial");
assert.equal(nhex.miscibilidadeComAgua,null);

for(const s of solvents.solventes){
  assert(s.seguranca?.status.includes("revisao"),"Revisão de segurança faltando: "+s.id);
  for(const [prop,obs] of Object.entries(s.propriedades)){
    if(obs===null)continue;
    assert(Number.isFinite(obs.value),"propriedade sem número "+s.id+"."+prop);
    assert(obs.value>=0,"propriedade negativa "+s.id+"."+prop);
    assert(obs.unit&&obs.sourceId&&solvents.fontes[obs.sourceId],"propriedade sem fonte "+s.id+"."+prop);
    if(prop==="densidade"){
      assert(obs.value>0,"densidade zero");
      assert.equal(obs.unit,"g/mL");
      assert(Number.isFinite(obs.temperatureC),"densidade sem temperatura "+s.id);
      assert(["TF25","PUBCHEM_ETHANOL"].includes(obs.sourceId),"fonte inesperada");
    }
    if(prop==="viscosidadeDinamica")assert.equal(obs.temperatureC,20);
  }
  if(s.tipo==="mistura_comercial")assert.equal(s.cas,null,"mistura comercial não deve fingir CAS puro");
}
const ethanol=solvents.solventes.find(s=>s.id==="ethanol");
assert.equal(ethanol.propriedades.densidade.temperatureC,20);
assert.equal(ethanol.propriedades.densidade.value,.7893);
const allSolvents=new Set(solvents.solventes.map(s=>s.id));
const seen=new Set();
for(const p of solvents.paresMiscibilidade){
  assert.equal(p.solventes.length,2);
  const [a,b]=p.solventes;
  assert(a!==b&&allSolvents.has(a)&&allSolvents.has(b),"par miscibilidade inválido");
  assert(["completa","limitada","nao_completa"].includes(p.classificacao));
  const key=[a,b].sort().join("|");
  assert(!seen.has(key),"par duplicado "+key);seen.add(key);
  assert(p.sourceId&&solvents.fontes[p.sourceId],"par sem fonte");
  assert.equal(p.fonteQualitativa,true,"Não tratar matriz de miscibilidade como medição quantitativa");
  assert.equal(p.temperaturaC,null,"Não inventar temperatura de matriz");
}
const candidates=new Set(analytes.candidatos.map(a=>a.id));
assert(analytes.candidatos.every(a=>a.homologacao==="candidato_sem_parametros"));
assert(analytes.candidatos.every(a=>!a.identity.verificadoIndividualmente));
assert(analytes.candidatos.every(a=>a.propriedades.densidade===null));
assert(analytes.candidatos.every(a=>a.retencao.rf.length===0));
let rfs=0;
for(const p of analytes.protocolos){
  assert(analytes.fontes[p.fonte]&&p.tecnica&&p.status,"método sem contexto/URL");
  assert(p.faseEstacionaria&&p.faseMovel,"Rf sem fase móvel ou adsorvente");
  for(const r of p.dadosRf){
    assert(Number.isFinite(r.rf)&&r.rf>=0&&r.rf<=1,"Rf inválido");
    assert(r.fonte&&analytes.fontes[r.fonte],"Rf sem proveniência");
    assert(candidates.has(r.analito)||r.analito.endsWith("_band"),
      "Banda precisa ser um candidato ou fração não identificada: "+r.analito);
    assert(p.status!=="homologado","Protocolo não passou por revisão primária");
    rfs++;
  }
}
assert.equal(rfs,123);
let intervalos=0;
for(const p of analytes.protocolos){
 for(const r of (p.dadosRfIntervalos||[])){
  assert(r.analito&&candidates.has(r.analito),"Rf em intervalo precisa de identidade no catálogo");
  assert(Number.isFinite(r.rfMin)&&Number.isFinite(r.rfMax),"extremos de Rf não numéricos");
  assert(r.rfMin>=0&&r.rfMin<=r.rfMax&&r.rfMax<=1,"Rf intervalo inconsistente");
  assert(analytes.fontes[r.fonte],"intervalo sem fonte própria");
  assert.equal(r.homologado,false,"intervalo em pesquisa não pode estar homologado");
  intervalos++;
 }
}
assert.equal(intervalos,1,"conservar o intervalo original de feofitina b");
const padiyar=analytes.protocolos.find(p=>p.id==="tlc_aminoacids_padiyar2024_butanol_acetic_water_4_1_1");
assert(padiyar&&padiyar.status!=="homologado");
assert.equal(padiyar.dadosRf.length,8);
const jecfa=analytes.protocolos.filter(p=>p.fonte==="fao_jecfa_colours");
const sobanska=analytes.protocolos.filter(p=>p.fonte==="sobanska2017");
assert.equal(jecfa.length,3);
assert.equal(sobanska.length,2);
assert.equal(jecfa.reduce((n,p)=>n+p.dadosRf.length,0),16);
assert.equal(sobanska.reduce((n,p)=>n+p.dadosRf.length,0),8);
const novos=[
 "tlc_hfsa_2026_mph1_hexane_isopropanol",
 "tlc_hfsa_2026_mph2_hexane_isopropanol_water_acetic",
 "tlc_quercetin2010_system1_toluene_ethylacetate_acetic",
 "tlc_quercetin2010_system4_toluene_acetic",
 "tlc_curcumin2017_toluene_ethylacetate_95_5",
 "tlc_curcumin2017_dcm_methanol_95_5",
 "hptlc_green2022_normal_ethylacetate_ethanol_85_15",
 "hptlc_green2022_reverse_ethanol_water_50_50",
 "tlc_ibuprofen2016_chloroform_acetone_8_2",
 "tlc_ibuprofen2016_ethylacetate_pure",
 "tlc_analgesics_stevens_ethyacetate_pure",
 "tlc_analgesics_bentonite2021_mixed_eluent",
 "tlc_carotenoids_yuangsoi2008_petroleumether_diethylether_acetone",
 "tlc_carotenoids_adedoyin2017_acetone_nhexane_30_70"
];
const newMethods=analytes.protocolos.filter(p=>novos.includes(p.id));
assert.equal(newMethods.length,14);
assert.equal(newMethods.reduce((n,p)=>n+p.dadosRf.length,0),25);
assert(newMethods.every(p=>p.status!=="homologado"&&p.faseMovel.homologada===false));
assert(newMethods.every(p=>p.dadosRf.every(x=>x.homologado===false&&analytes.fontes[x.fonte])));
assert(newMethods.some(p=>p.dadosRf.some(x=>Number.isFinite(x.desvioPadraoRf))),
 "conservar desvio padrão de estudo experimental HPTLC");
assert(newMethods.some(p=>p.dadosRf.some(x=>x.identificacaoTentativa)),
 "marcar banda de extrato identificada provisoriamente");
const usedSolvents=new Set(solvents.solventes.map(x=>x.id));
for(const p of analytes.protocolos){
 const mobile=p.faseMovel?.componentes||[];
 for(const reagent of mobile){
  assert(
   usedSolvents.has(reagent.id) || ["aqueous_ammonia_sg0880","sodium_chloride"].includes(reagent.id),
   "solvente químico sem registro no catálogo: "+reagent.id+" em "+p.id);
 }
}

assert(analytes.protocolos.every(p=>p.status!=="homologado"));
assert.equal(
 analytes.protocolos.find(p=>p.id==="tlc_food_dyes_fao_system_10_butanol_acetic_water")
  .dadosRf.find(r=>r.analito==="erythrosine").rf,1);
assert(!jecfa.some(p=>p.dadosRf.some(r=>r.analito==="quinoline_yellow")),
 "mistura de amarelo de quinolina não deve ser tratada como analito molecular singular");

assert.equal(padiyar.dadosRf.find(r=>r.analito==="valine").rf,.52);
assert.equal(padiyar.dadosRf.find(r=>r.analito==="valine").distanciaManchaCm,1.85);
assert(Math.abs(padiyar.dadosRf.find(r=>r.analito==="valine").diferencaRfDistancias)>.005,
 "marcar inconsistência de arredondamento em literatura primária");
for(const id of ["tlc_aminoacids_ukil_2013_propanol_water_70_30","tlc_spinach_dobado_hexane_acetone_7_3",
 "tlc_aminoacids_protechex_etanol96_water_7_3","tlc_aminoacids_protechex_butanol_acetic_water_8_2_2"])
 assert(analytes.protocolos.some(p=>p.id===id&&p.status!=="homologado"),
 "método rastreado sem homologação automática: "+id);
assert.deepEqual(analytes.protocolos.find(x=>x.id==="tlc_aminoacids_amrita_12_3_5").faseMovel.componentes.map(x=>x.partes),[12,3,5]);
assert.deepEqual(analytes.protocolos.find(x=>x.id==="tlc_spinach_quach_2004").faseMovel.componentes.map(x=>x.partes),[60,16,10,10,4]);
for(const model of engines.motores){url(model.url);assert(model.acao&&model.adequacao&&model.license);}
const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
assert(!html.includes("solventes-propriedades.v1.json"),"Não integrar dados não homologados ao runtime");
assert(!html.includes("analitos-protocolos.v1.json"),"Não integrar Rf de pesquisa ao runtime");
console.log("SIAC BANCO — OK:",solvents.solventes.length,"solventes,",completeDensity.length,"densidades,",solvents.paresMiscibilidade.length,
 "pares qualitativos,",analytes.candidatos.length,"analitos,",analytes.protocolos.length,
 "protocolos,",rfs,"Rf condicionais,",engines.motores.length,"motores/fontes candidatos.");
