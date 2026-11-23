"use strict";
/* SIAC — motor de coluna v0.1 (modelo didático de pratos teóricos em série).
 * Sistema isocrático, vazão constante, retenção linear e pulso de aplicação estreito.
 * Não converte nomes de substâncias/solventes automaticamente em fatores k.
 * NÃO reutiliza Rf de cromatografia planar.
 */
(function instalar(raiz,fabrica) {
  const motor=fabrica();
  if(typeof module==="object"&&module.exports)module.exports=motor;
  if(raiz){
    raiz.SIAC=raiz.SIAC||{};
    raiz.SIAC.column=motor;
  }
})(typeof globalThis==="object"?globalThis:null,function criar() {
  const VERSAO="0.1.0",EPS=1e-11,MODOS=["visivel","uv254","uv365"];
  function erro(msg){throw new RangeError("SIAC coluna: "+msg);}
  function numero(x,n,min,max=Infinity){
    if(typeof x!=="number"||!Number.isFinite(x)||x<min||x>max)erro(n+" inválido");
    return x;
  }
  function objeto(x,n){
    if(!x||typeof x!=="object"||Array.isArray(x))erro(n+" deve ser objeto");
    return x;
  }
  function texto(x,n){
    if(typeof x!=="string"||!x.trim())erro(n+" deve ser texto não vazio");
    return x.trim();
  }
  function copiar(x){return JSON.parse(JSON.stringify(x));}
  function congelar(x){
    if(x&&typeof x==="object"&&!Object.isFrozen(x)){
      Object.values(x).forEach(congelar);Object.freeze(x);
    }
    return x;
  }
  const limitar=(x,a,b)=>Math.max(a,Math.min(b,x));
  function checarEstado(s){
    if(!s||s.versao!==VERSAO||!s.config||!Array.isArray(s.config.componentes))erro("estado incompatível");
    return s;
  }
  function fatorRetencao(m){
    const p=objeto(m.retencao,"retencao de "+m.id);
    if(p.modo!=="fator" && p.modo!=="particao")erro(m.id+": modelo de retenção desconhecido");
    if(p.modo==="fator")return numero(p.k,m.id+".k",0,1000);
    const kdistribuicao=numero(p.kDistribuicao,m.id+".kDistribuicao",0,1e6);
    const razao=numero(p.relacaoFases,m.id+".relacaoFases",Number.MIN_VALUE,1e6);
    return numero(kdistribuicao*razao,m.id+".k calculado",0,1000);
  }
  function preparar(entrada) {
    const c=objeto(entrada,"configuração");
    const geometria=objeto(c.geometria,"geometria");
    const comprimentoMm=numero(geometria.comprimentoMm,"comprimentoMm",1,2000);
    const diametroInternoMm=numero(geometria.diametroInternoMm,"diametroInternoMm",0.1,100);
    const porosidade=numero(geometria.porosidade,"porosidade",0.01,0.95);
    const volumeGeometricoMl=Math.PI*(diametroInternoMm/2)**2*comprimentoMm/1000;
    const volumeMortoMl=volumeGeometricoMl*porosidade;
    const vazaoMlMin=numero(c.vazaoMlMin,"vazaoMlMin",0.001,100);
    const volumeTotalMl=numero(c.volumeTotalMl,"volumeTotalMl",0.1,10);
    const amostra=c.amostra?objeto(c.amostra,"amostra"):null;
    if(!amostra)erro("amostra obrigatória");
    texto(amostra.id,"amostra.id");
    const suporte=objeto(c.faseEstacionaria,"faseEstacionaria");
    const solvente=objeto(c.faseMovel,"faseMovel");
    texto(suporte.id,"faseEstacionaria.id");
    texto(solvente.id,"faseMovel.id");
    if(!Array.isArray(c.componentes)||!c.componentes.length||c.componentes.length>15)
      erro("componentes: entre 1 e 15");
    const ja=new Set(),alertas=[
      "Modelo didático idealizado de pratos em série, fluxo constante e retenção linear.",
      "Sem calibração, nenhum valor representa uma previsão experimental de substância real."
    ];
    const componentes=c.componentes.map((entrada,i)=>{
      const m=objeto(entrada,"componente "+i),id=texto(m.id,"componente.id");
      if(ja.has(id))erro("identificador duplicado: "+id);
      ja.add(id);
      const massaInicialMg=numero(m.massaInicialMg,id+".massaInicialMg",0,1000);
      const k=fatorRetencao(m),pratosTeoricos=numero(m.pratosTeoricos,id+".pratosTeoricos",4,160);
      if(!Number.isInteger(pratosTeoricos))erro(id+": pratosTeoricos deve ser inteiro");
      const detector=objeto(m.deteccao||{},id+".deteccao");
      for(const modo of MODOS)if(detector[modo]!==undefined&&typeof detector[modo]!=="boolean")
        erro(id+": deteccao."+modo+" deve ser booleano");
      const cor=m.corVisivel??null;
      if(cor!==null && (typeof cor!=="string"||!/^#[0-9a-f]{6}$/i.test(cor)))
        erro(id+": corVisivel deve ser uma cor hexadecimal");
      const proveniencia=objeto(m.proveniencia||{classe:"hipotetico",fonte:"Exemplo matemático"},
        id+".proveniencia");
      if(!["medicao","estimativa","hipotetico"].includes(proveniencia.classe))
        erro(id+": proveniencia.classe desconhecida");
      if(proveniencia.classe==="medicao"&&(!proveniencia.fonte||!proveniencia.condicoes))
        erro(id+": medicao precisa de fonte e condições");
      if(proveniencia.classe!=="medicao")
        alertas.push(id+": parâmetro de retenção estimado ou hipotético.");
      // V_R = V_M(1+k), para soluto em equilíbrio linear com ambas as fases.
      const volumeRetencaoMl=volumeMortoMl*(1+k);
      return {id,nome:m.nome||id,massaInicialMg,k,pratosTeoricos,
        volumeRetencaoMl,tempoRetencaoMin:volumeRetencaoMl/vazaoMlMin,
        corVisivel:cor,deteccao:copiar(detector),proveniencia:copiar(proveniencia),
        logFatorial:logFatoriais(pratosTeoricos)};
    });
    const config=congelar({amostra:copiar(amostra),faseEstacionaria:copiar(suporte),
      faseMovel:copiar(solvente),
      geometria:{comprimentoMm,diametroInternoMm,porosidade,volumeGeometricoMl,volumeMortoMl},
      vazaoMlMin,volumeTotalMl,tempoTotalMin:volumeTotalMl/vazaoMlMin,
      temperaturaC:c.temperaturaC===undefined?null:numero(c.temperaturaC,"temperaturaC",-273.14,200),
      componentes,alertas});
    return congelar({versao:VERSAO,config,tempoMin:0,volumeEluidoMl:0,etapa:"preparado",
      eventos:[{tipo:"preparo",tempoMin:0,volumeMl:0}]});
  }
  function logFatoriais(n) {
    const a=[0];for(let i=1;i<=n;i++)a.push(a[i-1]+Math.log(i));return a;
  }
  function probEstagio(j,z,logs){
    if(z===0)return j===0?1:0;
    return Math.exp(-z+j*Math.log(z)-logs[j]);
  }
  function fracaoEluida(componente,volume){
    if(volume<=0||componente.massaInicialMg===0)return 0;
    // P(N,z) = 1 - P(Poisson(z) < N), válido em pratos em série/Erlang.
    const n=componente.pratosTeoricos,z=n*volume/componente.volumeRetencaoMl;
    let dentro=0;
    for(let j=0;j<n;j++)dentro+=probEstagio(j,z,componente.logFatorial);
    return limitar(1-dentro,0,1);
  }
  function estadoBanda(componente,volume,bins=30){
    const n=componente.pratosTeoricos,z=n*volume/componente.volumeRetencaoMl;
    const perf=Array(bins).fill(0);
    let restante=0,somaPos=0;
    for(let j=0;j<n;j++){
      const p=probEstagio(j,z,componente.logFatorial);
      restante+=p;
      const pos=j/n;
      perf[Math.min(bins-1,Math.floor(pos*bins))]+=p;
      somaPos+=p*pos;
    }
    // Fração ainda no leito e intensidade por segmento, nunca identidade artificial.
    return {id:componente.id,nome:componente.nome,
      corVisivel:componente.corVisivel,
      massaRestanteMg:componente.massaInicialMg*limitar(restante,0,1),
      centroFracaoColuna:restante>EPS?somaPos/restante:null,
      distribuicao:perf.map(x=>x*componente.massaInicialMg),
      massaEluidaMg:componente.massaInicialMg*fracaoEluida(componente,volume)};
  }
  function sinalPara(c,modo,estacionaria) {
    if(modo==="visivel")return c.deteccao.visivel&&c.corVisivel?"cor_visivel":null;
    if(modo==="uv254")return estacionaria.indicadorFluorescente254&&c.deteccao.uv254
      ?"extincao_indicador":null;
    return c.deteccao.uv365?"fluorescencia":null;
  }
  function modoValido(m){
    if(!MODOS.includes(m))erro("modo de detecção inválido");
    return m;
  }
  function avancar(estado,deltaMin){
    checarEstado(estado);
    numero(deltaMin,"deltaMin",0,1e9);
    const config=estado.config;
    const t=limitar(estado.tempoMin+deltaMin,0,config.tempoTotalMin);
    const v=Math.min(config.volumeTotalMl,t*config.vazaoMlMin);
    const etapa=v>=config.volumeTotalMl-EPS?"finalizado":v>0?"eluindo":"preparado";
    return congelar({versao:VERSAO,config,tempoMin:t,volumeEluidoMl:v,etapa,
      eventos:estado.eventos.concat([{tipo:"avanco",tempoMin:t,volumeMl:v}])});
  }
  function observar(estado,opcoes={}){
    checarEstado(estado);
    const modo=modoValido(opcoes.detector||"visivel");
    const bins=numero(opcoes.segmentos??30,"segmentos",5,80);
    if(!Number.isInteger(bins))erro("segmentos inteiros obrigatórios");
    const bandas=estado.config.componentes.map(c=>{
      const total=estadoBanda(c,estado.volumeEluidoMl,bins);
      return {...total,sinal:sinalPara(c,modo,estado.config.faseEstacionaria)};
    });
    return {tecnica:"coluna",etapa:estado.etapa,detector:modo,
      tempoMin:estado.tempoMin,volumeEluidoMl:estado.volumeEluidoMl,
      volumeMortoMl:estado.config.geometria.volumeMortoMl,
      vazaoMlMin:estado.config.vazaoMlMin,bandas,
      bandasVisiveis:bandas.filter(b=>b.sinal),
      alertasModelo:estado.config.alertas.slice(),
      observacao:"Zonas internas são calculadas por distribuição entre pratos; detectabilidade e aparência são independentes da composição."};
  }
  function perfil(estado,opcoes={}){
    checarEstado(estado);
    const total=numero(opcoes.ateVolumeMl??estado.config.volumeTotalMl,
      "ateVolumeMl",Number.MIN_VALUE,estado.config.volumeTotalMl);
    const passos=numero(opcoes.passos??200,"passos",5,1000);
    if(!Number.isInteger(passos))erro("passos precisa ser inteiro");
    const c=estado.config.componentes,trechos=[];
    for(let i=0;i<passos;i++){
      const inicio=total*i/passos,fim=total*(i+1)/passos;
      const concentracoesMgPorMl={};
      for(const x of c){
        const massa=x.massaInicialMg*(fracaoEluida(x,fim)-fracaoEluida(x,inicio));
        concentracoesMgPorMl[x.id]=Math.max(0,massa/(fim-inicio));
      }
      trechos.push({inicioMl:inicio,fimMl:fim,concentracoesMgPorMl});
    }
    const recuperado={},restante={};
    for(const x of c){
      recuperado[x.id]=x.massaInicialMg*fracaoEluida(x,total);
      restante[x.id]=x.massaInicialMg-recuperado[x.id];
    }
    return {tecnica:"coluna",volumeTotalMl:total,vazaoMlMin:estado.config.vazaoMlMin,
      unidadeVolume:"mL",unidadeConcentracao:"mg/mL",
      trechos,recuperadoMg:recuperado,restanteMg:restante,
      avisos:["Retenção e eficiência fornecidas por parâmetros do sistema, não por correspondência fixa entre substância e volume."]};
  }
  function avaliarSaida(estado,volumeMl,opcoes={}){
    checarEstado(estado);
    numero(volumeMl,"volumeMl",0,estado.config.volumeTotalMl);
    const delta=numero(opcoes.deltaMl??0.01,"deltaMl",Number.MIN_VALUE);
    const inicio=Math.max(0,volumeMl-delta/2),fim=Math.min(estado.config.volumeTotalMl,volumeMl+delta/2);
    const concentracoesMgPorMl={};
    for(const c of estado.config.componentes){
      concentracoesMgPorMl[c.id]=fim>inicio
        ?c.massaInicialMg*(fracaoEluida(c,fim)-fracaoEluida(c,inicio))/(fim-inicio):0;
    }
    return {volumeMl,concentracoesMgPorMl,tempoMin:volumeMl/estado.config.vazaoMlMin};
  }
  return Object.freeze({versao:VERSAO,prepare:preparar,advance:avancar,
    observe:observar,profile:perfil,outlet:avaliarSaida});
});
