"use strict";
const assert=require("node:assert/strict");
const coluna=require("../js/simulation/siac-coluna.js");
const coletor=require("../js/simulation/siac-fracionamento.js");
const perto=(a,b,eps=1e-8)=>assert(Math.abs(a-b)<=eps,String(a)+" != "+String(b));
function config(){
 return {
  amostra:{id:"mistura-teste",tipo:"hipotetica"},
  faseEstacionaria:{id:"silica-teste",tipo:"silica",indicadorFluorescente254:false},
  faseMovel:{id:"eluente-teste",composicao:"parametrizada"},
  geometria:{comprimentoMm:80,diametroInternoMm:8,porosidade:0.45},
  vazaoMlMin:0.8,volumeTotalMl:9,
  componentes:[
   {id:"A",massaInicialMg:2,retencao:{modo:"fator",k:0.15},
    pratosTeoricos:45,corVisivel:"#0072b2",deteccao:{visivel:true},
    proveniencia:{classe:"hipotetico",fonte:"teste"}},
   {id:"B",massaInicialMg:3,retencao:{modo:"fator",k:1.5},
    pratosTeoricos:55,corVisivel:"#009e73",deteccao:{visivel:true},
    proveniencia:{classe:"hipotetico",fonte:"teste"}},
   {id:"C",massaInicialMg:1,retencao:{modo:"particao",kDistribuicao:1.5,relacaoFases:2},
    pratosTeoricos:60,corVisivel:null,deteccao:{visivel:false,uv365:true},
    proveniencia:{classe:"hipotetico",fonte:"teste"}}
  ]
 };
}
const origem=coluna.prepare(config());
assert.equal(coluna.versao,"0.1.0");
assert.equal(origem.etapa,"preparado");
assert.equal(origem.volumeEluidoMl,0);
assert(Object.isFrozen(origem.config.componentes));
const vm=Math.PI*4*4*80/1000*0.45;
perto(origem.config.geometria.volumeMortoMl,vm);
perto(origem.config.componentes[0].volumeRetencaoMl,vm*1.15);
perto(origem.config.componentes[1].volumeRetencaoMl,vm*2.5);
perto(origem.config.componentes[2].volumeRetencaoMl,vm*4);
const av=coluna.advance(origem,4);
perto(av.volumeEluidoMl,3.2);
perto(av.tempoMin,4);
assert.equal(av.etapa,"eluindo");
assert.equal(origem.tempoMin,0);
const b=coluna.advance(coluna.advance(origem,1),3);
perto(b.volumeEluidoMl,av.volumeEluidoMl);
assert.deepEqual(b.config,av.config);
const antes=coluna.observe(origem);
assert.equal(antes.bandasVisiveis.length,2);
assert(antes.bandas.every(x=>x.massaEluidaMg===0));
const durante=coluna.observe(av,{segmentos:48});
assert.equal(durante.bandas.length,3);
assert.equal(durante.bandasVisiveis.length,2);
assert.equal(durante.bandas[0].distribuicao.length,48);
for(let i=0;i<3;i++){
 const x=durante.bandas[i];
 assert(x.massaRestanteMg>=0);
 assert(x.massaEluidaMg>=0);
 perto(x.massaRestanteMg+x.massaEluidaMg,origem.config.componentes[i].massaInicialMg);
 perto(x.distribuicao.reduce((a,b)=>a+b,0),x.massaRestanteMg);
}
assert(durante.bandas[0].massaEluidaMg>durante.bandas[2].massaEluidaMg);
const uv=coluna.observe(av,{detector:"uv365"});
assert.deepEqual(uv.bandasVisiveis.map(x=>x.id),["C"]);
assert.throws(()=>coluna.observe(av,{detector:"IR"}),/detecção/);
const completo=coluna.advance(origem,100);
assert.equal(completo.etapa,"finalizado");
perto(completo.volumeEluidoMl,9);
perto(completo.tempoMin,9/0.8);
const perfil=coluna.profile(completo,{passos:360});
assert.equal(perfil.trechos.length,360);
perto(perfil.trechos[0].inicioMl,0);
perto(perfil.trechos[359].fimMl,9);
const massas={A:0,B:0,C:0};
for(const t of perfil.trechos){
 const dv=t.fimMl-t.inicioMl;
 for(const id of Object.keys(massas)){
  assert(t.concentracoesMgPorMl[id]>=0);
  massas[id]+=dv*t.concentracoesMgPorMl[id];
 }
}
for(const c of origem.config.componentes){
 perto(perfil.recuperadoMg[c.id],massas[c.id]);
 perto(perfil.recuperadoMg[c.id]+perfil.restanteMg[c.id],c.massaInicialMg);
}
const plano=coletor.prepare({volumeTotalMl:9,resolucaoMl:0.1,janelas:[
 {frasco:"F9",inicioMl:1.8,fimMl:2.8},
 {frasco:"F2",inicioMl:4.2,fimMl:5.2},
 {frasco:"F5",inicioMl:7.3,fimMl:8.3}
]});
const fracionado=coletor.integrate(plano,perfil.trechos);
perto(fracionado.total.volumeMl,9);
assert(fracionado.descarte.volumeMl>0);
for(const c of origem.config.componentes)
 perto(fracionado.total.componentesMg[c.id],perfil.recuperadoMg[c.id]);
assert(fracionado.frascos[8].componentesMg.A>fracionado.frascos[8].componentesMg.C);
assert(fracionado.frascos[4].componentesMg.C>fracionado.frascos[8].componentesMg.C);
assert(fracionado.frascos[1].componentesMg.B>fracionado.frascos[8].componentesMg.B);
const movido=coletor.setWindow(plano,"F9",6,7);
const recolhido=coletor.integrate(movido,perfil.trechos);
assert(recolhido.frascos[8].componentesMg.A<fracionado.frascos[8].componentesMg.A);
const x1=coluna.outlet(av,2.2),x2=coluna.outlet(av,4.5);
assert(x1.concentracoesMgPorMl.A>x2.concentracoesMgPorMl.A);
assert(x2.concentracoesMgPorMl.B>x1.concentracoesMgPorMl.B);
const rapido=config();rapido.componentes[0].retencao.k=3;
assert(coluna.prepare(rapido).config.componentes[0].volumeRetencaoMl>origem.config.componentes[0].volumeRetencaoMl);
const outro=config();outro.faseMovel.id="nome-mudado-sem-parametro";
perto(coluna.prepare(outro).config.componentes[0].volumeRetencaoMl,origem.config.componentes[0].volumeRetencaoMl);
assert.throws(()=>coluna.prepare({...config(),volumeTotalMl:0}),/volumeTotalMl/);
// Maior domínio volumétrico: retenção depende dos parâmetros, não da janela de coleta.
const escalaGrande=config();
escalaGrande.volumeTotalMl=1000;
escalaGrande.geometria={comprimentoMm:400,diametroInternoMm:50,porosidade:0.5};
escalaGrande.vazaoMlMin=5;
const colunaGrande=coluna.prepare(escalaGrande);
assert.equal(colunaGrande.config.volumeTotalMl,1000);
const corridaGrande=coluna.advance(colunaGrande,200);
assert.equal(corridaGrande.volumeEluidoMl,1000);
const curvaGrande=coluna.profile(corridaGrande,{passos:1000});
const janelaGrande=coletor.prepare({volumeTotalMl:1000,resolucaoMl:0.1,
 janelas:[{frasco:"F4",inicioMl:300,fimMl:350}]});
const saidaGrande=coletor.integrate(janelaGrande,curvaGrande.trechos);
assert(Math.abs(saidaGrande.frascos[3].volumeMl-50)<1e-8);
assert(Math.abs(saidaGrande.descarte.volumeMl-950)<1e-8);
assert.throws(()=>coluna.prepare({...config(),volumeTotalMl:1000.1}),/volumeTotalMl/);
assert.throws(()=>coluna.prepare({...config(),vazaoMlMin:0}),/vazaoMlMin/);
const errado=config();errado.componentes[0].retencao.k=-1;
assert.throws(()=>coluna.prepare(errado),/\.k/);
const massaNeg=config();massaNeg.componentes[0].massaInicialMg=-1;
assert.throws(()=>coluna.prepare(massaNeg),/massaInicialMg/);
const nErrado=config();nErrado.componentes[0].pratosTeoricos=7.2;
assert.throws(()=>coluna.prepare(nErrado),/inteiro/);
assert.throws(()=>coluna.advance(av,-1),/deltaMin/);
assert.throws(()=>coluna.profile(completo,{passos:1}),/passos/);
assert.throws(()=>coluna.outlet(origem,10),/volumeMl/);
console.log("SIAC coluna: retenção, bandas, detecção, perfil, coleta F1-F10 e conservação OK.");
