"use strict";
/* SIAC — funções analíticas independentes v0.1
 * Cálculos APENAS sobre medições documentadas; não identificam
 * substâncias por cor, Rf ou detector sem padrão e corroboradores.
 */
(function instalar(g,criar){
 const api=criar();
 if(typeof module==="object"&&module.exports)module.exports=api;
 if(g){g.SIAC=g.SIAC||{};g.SIAC.metrics=api;}
})(typeof globalThis==="object"?globalThis:null,function(){
 const V="0.1.0";
 function erro(s){throw new RangeError("SIAC métricas: "+s);}
 function num(x,k,min,max=Infinity) {
  if(typeof x!=="number"||!Number.isFinite(x)||x<min||x>max)erro(k+" inválido");
  return x;
 }
 function obj(x,k){if(!x||typeof x!=="object"||Array.isArray(x))erro(k+" deve ser objeto");return x;}
 function txt(x,k){if(typeof x!=="string"||!x.trim())erro(k+" deve ser texto não vazio");return x.trim();}
 function freeze(x){if(x&&typeof x==="object"&&!Object.isFrozen(x)){Object.values(x).forEach(freeze);Object.freeze(x);}return x;}
 function planar(o){
  const d=obj(o,"medição planar");
  const front=num(d.frenteMm,"frenteMm",Number.MIN_VALUE);
  const manchas=d.manchas;
  if(!Array.isArray(manchas))erro("manchas devem ser um array");
  const ids=new Set();
  const valores=manchas.map((s,i)=>{
   obj(s,"mancha "+i);
   const id=txt(s.id,"mancha.id");
   if(ids.has(id))erro("id de mancha duplicado");ids.add(id);
   const distancia=num(s.distanciaMm,"distanciaMm",0,front);
   const rf=distancia/front;
   return{id,distanciaMm:distancia,rf,unidade:"adimensional",evidencia:"medida no mesmo suporte e desenvolvimento"};
  });
  return freeze({tecnica:"papel/ccd",frenteMm:front,manchas:valores,
   observacao:"Rf é condicionado ao suporte, eluente e procedimento; Rf isolado não confirma identidade."});
 }
 function comparacaoPadroes(o){
  const p=obj(o,"comparação de padrões");
  const med=planar(p.medicoes);
  const cond=obj(p.condicoes,"condições");
  for(const ch of ["faseEstacionariaId","faseMovelId","detector"])
   txt(cond[ch],"condicoes."+ch);
  const lim=num(p.toleranciaRf,"toleranciaRf",Number.MIN_VALUE,1);
  if(!Array.isArray(p.padroes))erro("padrões devem ser lista");
  const excluidos=[],comparacoes=[];
  for(const std of p.padroes){
   obj(std,"padrão");
   const id=txt(std.id,"padrão.id");
   const referRf=num(std.rf,"padrão.rf",0,1);
   const condP=obj(std.condicoes,"condições do padrão");
   const mesmo=["faseEstacionariaId","faseMovelId","detector"]
     .every(ch=>cond[ch]===condP[ch]);
   if(!mesmo){excluidos.push({id,motivo:"condições não equivalentes"});continue;}
   for(const m of med.manchas){
    const delta=Math.abs(m.rf-referRf);
    comparacoes.push({manchaId:m.id,padraoId:id,rfMedido:m.rf,rfPadrao:referRf,
     diferencaAbsolutaRf:delta,compatibilidade:delta<=lim?"compativel":"nao_compativel"});
   }
  }
  return freeze({tecnica:med.tecnica,toleranciaRf:lim,comparacoes,excluidos,
   conclusao:"Compatibilidade de Rf com padrão nas condições declaradas é indício, NÃO identificação definitiva."});
 }
 function coluna(o){
  const c=obj(o,"medição de coluna");
  const vm=num(c.volumeMortoMl,"volumeMortoMl",Number.MIN_VALUE);
  const comprimento=num(c.comprimentoMm,"comprimentoMm",Number.MIN_VALUE);
  if(!Array.isArray(c.picos))erro("picos devem ser lista");
  const picos=c.picos.map((x,i)=>{
   obj(x,"pico "+i);
   const id=txt(x.id,"pico.id"),v=num(x.volumeRetencaoMl,id+".volumeRetencaoMl",vm);
   const largura=x.larguraBaseMl===undefined?null:num(x.larguraBaseMl,id+".larguraBaseMl",Number.MIN_VALUE);
   const k=(v-vm)/vm;
   const n=largura===null?null:16*(v/largura)**2;
   return{id,volumeRetencaoMl:v,tempoRetencaoMin:c.vazaoMlMin===undefined?null:v/num(c.vazaoMlMin,"vazaoMlMin",Number.MIN_VALUE),
    larguraBaseMl:largura,fatorRetencao:k,pratosAproximados:n,alturaPratoMm:n===null?null:comprimento/n};
  });
  const pares=[];
  for(let i=0;i<picos.length;i++)for(let j=i+1;j<picos.length;j++){
   const [a,b]=[picos[i],picos[j]].sort((x,y)=>x.volumeRetencaoMl-y.volumeRetencaoMl);
   const alfa=a.fatorRetencao>0?b.fatorRetencao/a.fatorRetencao:null;
   const rs=a.larguraBaseMl!==null&&b.larguraBaseMl!==null?
    2*(b.volumeRetencaoMl-a.volumeRetencaoMl)/(a.larguraBaseMl+b.larguraBaseMl):null;
   pares.push({pico1:a.id,pico2:b.id,seletividade:alfa,resolucao:rs});
  }
  return freeze({tecnica:"coluna",volumeMortoMl:vm,picos,pares,
   observacao:"N aproximado pressupõe largura de base e comportamento de pico quase gaussiano; medições precisam ter origem e incerteza."});
 }
 function recuperacao(o){
  const x=obj(o,"balanço"),inicial=num(x.massaInicialMg,"massaInicialMg",Number.MIN_VALUE);
  if(!Array.isArray(x.frascos))erro("frascos devem ser lista");
  const frascos=x.frascos.map((t,i)=>{
   obj(t,"frasco "+i);
   const id=txt(t.id,"frasco.id");
   const massa=num(t.massaMg,"massaMg",0);
   return{id,massaMg:massa,percentualDaMassaInicial:100*massa/inicial};
  });
  const coletada=frascos.reduce((n,f)=>n+f.massaMg,0);
  if(coletada>inicial+1e-9)erro("mais massa coletada do que introduzida");
  const descarte=x.massaDescartadaMg===undefined?null:num(x.massaDescartadaMg,"massaDescartadaMg",0);
  const leito=x.massaRetidaNoLeitoMg===undefined?null:num(x.massaRetidaNoLeitoMg,"massaRetidaNoLeitoMg",0);
  const conhecido=coletada+(descarte??0)+(leito??0);
  if(conhecido>inicial+1e-9)erro("balanço de massa excede a massa inicial");
  return freeze({massaInicialMg:inicial,massaColetadaMg:coletada,
   percentualRecuperado:100*coletada/inicial,frascos,
   massaDescartadaMg:descarte,massaRetidaNoLeitoMg:leito,
   massaNaoAtribuidaMg:inicial-conhecido,
   observacao:"Percentual recuperado não é pureza da fração. Sem calibração, massas são apenas valores do modelo."});
 }
 return Object.freeze({versao:V,planarRf:planar,compareStandards:comparacaoPadroes,
  columnMetrics:coluna,massRecovery:recuperacao});
});
