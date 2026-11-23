"use strict";
const assert=require("node:assert/strict");
const siac=require("../js/simulation/siac-cromatografia.js");

function config() {
  return {
    tecnica:"ccd",
    amostra:{id:"mistura-didatica",nome:"Mistura modelo hipotética"},
    faseEstacionaria:{id:"silica-f254",tipo:"silica",indicadorFluorescente254:true},
    faseMovel:{id:"eluente-modelo",tipo:"mistura",composicao:"não calibrada"},
    geometria:{comprimentoMm:100,origemMm:12,margemSuperiorMm:8},
    frente:{coeficienteCapilarMmPorRaizS:4},
    relacaoFases:1,
    componentes:[
      {id:"a",nome:"Componente A",kDistribuicao:1,larguraInicialMm:1,
        dispersaoMm2PorS:0.005,fracaoRelativa:0.5,
        deteccao:{visivel:true,uv254:true},
        proveniencia:{classe:"hipotetico",fonte:"Exemplo interno"}},
      {id:"b",nome:"Componente B",kDistribuicao:3,larguraInicialMm:1.2,
        dispersaoMm2PorS:0.012,fracaoRelativa:0.6,
        deteccao:{visivel:false,uv254:true,uv365:true},
        proveniencia:{classe:"hipotetico",fonte:"Exemplo interno"}},
      {id:"c",nome:"Componente C",rfReferencia:0.77,
        larguraInicialMm:0.6,dispersaoMm2PorS:0.006,
        deteccao:{visivel:true},
        proveniencia:{classe:"medicao",fonte:"Exemplo de teste",condicoes:"Suporte e eluente de demonstração"}}
    ]
  };
}
assert.equal(siac.versao,"0.1.0");
for(const metodo of ["prepare","advance","observe","measure","calculate","sample"])
  assert.equal(typeof siac[metodo],"function",metodo);
const original=config();
const preparado=siac.prepare(original);
assert.equal(preparado.etapa,"preparado");
assert.equal(preparado.frenteMm,0);
assert.equal(preparado.config.componentes[0].rf,0.5);
assert.equal(preparado.config.componentes[1].rf,0.25);
assert.equal(preparado.config.componentes[2].rf,0.77);
assert(Object.isFrozen(preparado));
assert(Object.isFrozen(preparado.config.componentes));
assert.throws(()=>siac.calculate(preparado),/distância da frente/);
const apos=siac.advance(preparado,100);
assert.equal(apos.tempoS,100);
assert.equal(apos.frenteMm,40);
assert.equal(preparado.frenteMm,0,"imutable");
const emPartes=siac.advance(siac.advance(preparado,30),70);
assert.equal(emPartes.frenteMm,apos.frenteMm,"passos independentes da granularidade");
assert.equal(emPartes.tempoS,apos.tempoS);
const visivel=siac.observe(apos,{detector:"visivel"});
assert.deepEqual(visivel.sinais.map(x=>x.componenteId),["a","c"]);
assert.equal(visivel.sinais[0].distanciaMm,20);
assert.equal(visivel.sinais[1].distanciaMm,30.8);
assert(visivel.sinais[0].sigmaMm>1);
const uv=siac.observe(apos,{detector:"uv254"});
assert.deepEqual(uv.sinais.map(x=>x.componenteId),["a","b"]);
assert(uv.sinais.every(x=>x.tipoSinal==="extincao_indicador"));
const uv365=siac.observe(apos,{detector:"uv365"});
assert.deepEqual(uv365.sinais.map(x=>x.componenteId),["b"]);
const semIndicador=config();semIndicador.faseEstacionaria.indicadorFluorescente254=false;
assert.equal(siac.observe(siac.advance(siac.prepare(semIndicador),100),{detector:"uv254"}).sinais.length,0);
const ruler=siac.measure(apos,{detector:"visivel",resolucaoMm:0.1});
assert.equal(ruler.frenteMm,40);
assert.equal(ruler.manchas.length,2);
const rf=siac.calculate(apos,{medicoes:ruler});
assert.equal(rf.calculos[0].rf,0.5);
assert(Math.abs(rf.calculos[1].rf-0.77)<1e-12);
assert.match(rf.observacoes.join(" "),/não demonstra identidade/);
const simulacao1=siac.sample(apos,{quantidade:150,semente:123,detector:"uv254"});
const simulacao2=siac.sample(apos,{quantidade:150,semente:123,detector:"uv254"});
assert.deepEqual(simulacao1,simulacao2,"Amostragem reproduzível");
const simulacao3=siac.sample(apos,{quantidade:150,semente:124,detector:"uv254"});
assert.notDeepEqual(simulacao1.distribuicoes[0].posicoesMm,simulacao3.distribuicoes[0].posicoesMm);
for(const dist of simulacao1.distribuicoes){
  assert(dist.posicoesMm.every(v=>v>=0 && v<=apos.frenteMm));
  assert(Number.isFinite(dist.desvioPadraoMm));
}
assert.equal(siac.sample(preparado,{quantidade:5}).distribuicoes.length,0);
const cheio=siac.advance(preparado,10000);
assert.equal(cheio.etapa,"finalizado");
assert.equal(cheio.frenteMm,80);
assert.equal(siac.advance(cheio,100).tempoS,cheio.tempoS);
const repeticao=siac.advance(preparado,100);
assert.deepEqual(repeticao,apos,"evolução determinística");
const papel=config();papel.tecnica="papel";
assert.equal(siac.prepare(papel).config.tecnica,"papel");
assert.throws(()=>siac.prepare({...config(),tecnica:"coluna"}),/motor independente/);
assert.throws(()=>siac.prepare({...config(),tecnica:"gas"}),/técnica suportada/);
assert.throws(()=>siac.prepare({...config(),frente:{coeficienteCapilarMmPorRaizS:-1}}),/coeficienteCapilar/);
const beyond=config();beyond.componentes[0].rfReferencia=0.3;
assert.throws(()=>siac.prepare(beyond),/exatamente rfReferencia ou kDistribuicao/);
const noCoef=config();delete noCoef.componentes[0].kDistribuicao;
assert.throws(()=>siac.prepare(noCoef),/exatamente rfReferencia ou kDistribuicao/);
const noRatio=config();delete noRatio.relacaoFases;
assert.throws(()=>siac.prepare(noRatio),/relacaoFases/);
const notMeasured=config();notMeasured.componentes[0].proveniencia.classe="medicao";
assert.throws(()=>siac.prepare(notMeasured),/requer fonte e condições/);
assert.throws(()=>siac.advance(apos,-1),/deltaS/);
assert.throws(()=>siac.measure(apos,{resolucaoMm:0}),/resolucaoMm/);
assert.throws(()=>siac.observe(apos,{detector:"misterioso"}),/detector/);
assert.throws(()=>siac.sample(apos,{quantidade:5001}),/quantidade/);
assert.throws(()=>siac.sample(apos,{semente:-1}),/semente/);
assert.throws(()=>siac.calculate(apos,{medicoes:{frenteMm:10,manchas:[{componenteId:"a",distanciaMm:11}]}}),/além da frente/);
console.log("SIAC ciência v0.1: estado, migração, retenção, detecção, medidas, Rf, Monte Carlo e limites validados.");
