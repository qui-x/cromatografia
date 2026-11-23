"use strict";
const assert=require("node:assert/strict");
const M=require("../js/simulation/siac-metricas.js");
const perto=(a,b)=>assert(Math.abs(a-b)<1e-9,String(a)+" != "+String(b));
const p=M.planarRf({frenteMm:50,manchas:[{id:"m1",distanciaMm:10},{id:"m2",distanciaMm:35}]});
assert.equal(p.manchas.length,2);perto(p.manchas[0].rf,.2);perto(p.manchas[1].rf,.7);
assert(Object.isFrozen(p.manchas[0]));
assert.throws(()=>M.planarRf({frenteMm:0,manchas:[]}),/frenteMm/);
assert.throws(()=>M.planarRf({frenteMm:30,manchas:[{id:"m",distanciaMm:31}]}),/distanciaMm/);
assert.throws(()=>M.planarRf({frenteMm:30,manchas:[{id:"m",distanciaMm:1},{id:"m",distanciaMm:2}]}),/duplicado/);
const cond={faseEstacionariaId:"silica-F254",faseMovelId:"solvente-70:30",detector:"uv254"};
const comp=M.compareStandards({
 medicoes:{frenteMm:50,manchas:[{id:"x",distanciaMm:10}]},
 condicoes:cond,toleranciaRf:.03,
 padroes:[
  {id:"A",rf:.21,condicoes:cond},
  {id:"B",rf:.65,condicoes:cond},
  {id:"C",rf:.2,condicoes:{...cond,faseMovelId:"outro solvente"}}
 ]
});
assert.equal(comp.comparacoes.length,2);
assert.equal(comp.comparacoes[0].compatibilidade,"compativel");
assert.equal(comp.comparacoes[1].compatibilidade,"nao_compativel");
assert.equal(comp.excluidos.length,1);
assert.match(comp.conclusao,/NÃO identificação/);
assert.throws(()=>M.compareStandards({
 medicoes:{frenteMm:50,manchas:[]},condicoes:cond,
 padroes:[],toleranciaRf:-1}),/toleranciaRf/);
const c=M.columnMetrics({volumeMortoMl:.8,comprimentoMm:100,vazaoMlMin:.4,
 picos:[{id:"A",volumeRetencaoMl:1.6,larguraBaseMl:.4},
 {id:"B",volumeRetencaoMl:3.2,larguraBaseMl:.5}]});
assert.equal(c.picos.length,2);perto(c.picos[0].fatorRetencao,1);
perto(c.picos[1].fatorRetencao,3);
perto(c.picos[0].tempoRetencaoMin,4);
perto(c.picos[0].pratosAproximados,256);
perto(c.picos[0].alturaPratoMm,100/256);
perto(c.pares[0].seletividade,3);
perto(c.pares[0].resolucao,2*(3.2-1.6)/(.4+.5));
const withoutWidth=M.columnMetrics({volumeMortoMl:.8,comprimentoMm:100,
 picos:[{id:"A",volumeRetencaoMl:1.6},{id:"B",volumeRetencaoMl:2.0}]});
assert.equal(withoutWidth.picos[0].pratosAproximados,null);
assert.equal(withoutWidth.pares[0].resolucao,null);
assert.throws(()=>M.columnMetrics({volumeMortoMl:.8,comprimentoMm:100,
 picos:[{id:"A",volumeRetencaoMl:.7}]}),/volumeRetencaoMl/);
const r=M.massRecovery({massaInicialMg:10,
 frascos:[{id:"F1",massaMg:3},{id:"F2",massaMg:2}],
 massaDescartadaMg:4,massaRetidaNoLeitoMg:1});
perto(r.massaColetadaMg,5);perto(r.percentualRecuperado,50);
perto(r.massaNaoAtribuidaMg,0);
assert.match(r.observacao,/não é pureza/);
assert.throws(()=>M.massRecovery({massaInicialMg:5,frascos:[{id:"F1",massaMg:6}]}),/mais massa/);
assert.throws(()=>M.massRecovery({massaInicialMg:5,frascos:[{id:"F1",massaMg:2}],
 massaDescartadaMg:4}),/excede/);
console.log("SIAC métricas: Rf, candidatos por padrão, k, alpha, Rs, N, H e recuperação OK.");
