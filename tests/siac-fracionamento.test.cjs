"use strict";
const assert=require("node:assert/strict");
const coletor=require("../js/simulation/siac-fracionamento.js");
const perto=(a,b,m="")=>assert(Math.abs(a-b)<1e-9,m||a+" ≠ "+b);
assert.equal(coletor.versao,"0.1.0");
const p=coletor.prepare({volumeTotalMl:10,resolucaoMl:0.1,janelas:[
  {frasco:"F1",inicioMl:0.6,fimMl:0.8},
  {frasco:"F2",inicioMl:3.5,fimMl:3.7},
  {frasco:"F10",inicioMl:9.7,fimMl:10}
]});
assert(Object.isFrozen(p));
assert(Object.isFrozen(p.frascos));
assert.equal(p.frascos.length,10);
assert.equal(p.janelas.length,3);
assert(p.frascos[2].ativo===false);
assert(p.frascos[9].ativo===true);
perto(p.frascos[0].volumeMl,0.2);
perto(p.frascos[1].volumeMl,0.2);
assert.equal(coletor.routeAt(p,0),"descarte");
assert.equal(coletor.routeAt(p,0.6),"F1");
assert.equal(coletor.routeAt(p,0.79),"F1");
assert.equal(coletor.routeAt(p,0.8),"descarte");
assert.equal(coletor.routeAt(p,3.49),"descarte");
assert.equal(coletor.routeAt(p,3.5),"F2");
assert.equal(coletor.routeAt(p,3.7),"descarte");
assert.equal(coletor.routeAt(p,9.9),"F10");
assert.equal(coletor.routeAt(p,10),"concluido");
const perfil=[
  {inicioMl:0,fimMl:1,concentracoesMgPorMl:{a:2,b:0}},
  {inicioMl:1,fimMl:3,concentracoesMgPorMl:{a:1,b:1}},
  {inicioMl:3,fimMl:4,concentracoesMgPorMl:{a:0,b:5}},
  {inicioMl:4,fimMl:10,concentracoesMgPorMl:{a:0.1,b:0.2}}
];
const saida=coletor.integrate(p,perfil);
assert.equal(saida.frascos.length,10);
perto(saida.frascos[0].volumeMl,.2);
perto(saida.frascos[0].componentesMg.a,.4);
perto(saida.frascos[0].concentracoesMediasMgPorMl.a,2);
perto(saida.frascos[1].volumeMl,.2);
perto(saida.frascos[1].componentesMg.b,1);
perto(saida.frascos[9].volumeMl,.3);
perto(saida.frascos[9].componentesMg.a,.03);
perto(saida.frascos[9].componentesMg.b,.06);
assert.equal(saida.frascos[4].ativo,false);
assert.deepEqual(saida.frascos[4].componentesMg,{});
perto(saida.descarte.volumeMl,9.3);
perto(saida.total.volumeMl,10);
perto(saida.total.componentesMg.a,4.6);
perto(saida.total.componentesMg.b,8.2);
for(const id of Object.keys(saida.total.componentesMg)){
  const coletado=saida.frascos.reduce((s,f)=>s+(f.componentesMg[id]||0),0);
  perto(coletado+(saida.descarte.componentesMg[id]||0),saida.total.componentesMg[id]);
}
const ordenacao=coletor.prepare({janelas:[
  {frasco:"F2",inicioMl:3.5,fimMl:3.7},
  {frasco:"F1",inicioMl:0.6,fimMl:0.8}
]});
assert.deepEqual(ordenacao.janelas.map(j=>j.frasco),["F1","F2"]);
assert.equal(ordenacao.frascos.length,10);
const semColeta=coletor.prepare({});
assert.equal(semColeta.frascos.filter(f=>f.ativo).length,0);
assert.equal(coletor.routeAt(semColeta,5),"descarte");
const soSolvente=coletor.integrate(semColeta,[{inicioMl:0,fimMl:10,concentracoesMgPorMl:{}}]);
perto(soSolvente.descarte.volumeMl,10);
assert.equal(soSolvente.frascos.every(f=>f.volumeMl===0),true);
const coeluicao=coletor.integrate(coletor.prepare({janelas:[{frasco:"F3",inicioMl:1,fimMl:2}]}),
  [{inicioMl:0,fimMl:10,concentracoesMgPorMl:{a:1,b:1}}]);
assert.equal(coeluicao.frascos[2].componentesMg.a,1);
assert.equal(coeluicao.frascos[2].componentesMg.b,1);
assert.match(coeluicao.limite,/não infere pureza/);
assert.throws(()=>coletor.prepare({volumeTotalMl:0}),/volumeTotalMl/);
assert.throws(()=>coletor.prepare({resolucaoMl:0}),/resolucaoMl/);
assert.throws(()=>coletor.prepare({janelas:[{frasco:"F11",inicioMl:1,fimMl:2}]}),/frasco deve ser/);
assert.throws(()=>coletor.prepare({janelas:[{frasco:"F1",inicioMl:0.1,fimMl:0.1}]}),/fim deve exceder/);
assert.throws(()=>coletor.prepare({janelas:[{frasco:"F1",inicioMl:0.15,fimMl:0.3}]}),/múltiplo/);
assert.throws(()=>coletor.prepare({janelas:[{frasco:"F1",inicioMl:0.6,fimMl:10.1}]}),/fimMl/);
assert.throws(()=>coletor.prepare({janelas:[
  {frasco:"F1",inicioMl:1,fimMl:2},
  {frasco:"F2",inicioMl:1.9,fimMl:3}
]}),/sobrepostas/);
assert.throws(()=>coletor.prepare({janelas:[
  {frasco:"F1",inicioMl:1,fimMl:2},
  {frasco:"F1",inicioMl:3,fimMl:4}
]}),/duplicada/);
assert.throws(()=>coletor.routeAt(p,10.01),/volumeAcumuladoMl/);
assert.throws(()=>coletor.integrate(p,[{inicioMl:0,fimMl:5,concentracoesMgPorMl:{a:1}}]),/incompleto/);
assert.throws(()=>coletor.integrate(p,[{inicioMl:.1,fimMl:10,concentracoesMgPorMl:{a:1}}]),/lacuna/);
assert.throws(()=>coletor.integrate(p,[{inicioMl:0,fimMl:10,concentracoesMgPorMl:{a:-1}}]),/concentração/);
assert.throws(()=>coletor.integrate(p,[{inicioMl:0,fimMl:10,concentracoesMgPorMl:null}]),/ausentes/);
console.log("SIAC fracionamento: F1-F10 independentes, janelas, descarte, mistura, massa e validações OK.");
