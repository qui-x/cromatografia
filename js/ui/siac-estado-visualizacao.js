"use strict";
/*
 * SIAC — estados de visualização e amostragem (protótipo isolado v0.2).
 * Não executa química nem retém ligação com o SIAB legado.
 * Dados de bandas/detectores devem vir dos motores físicos ou experimentos.
 */
(function instalar(raiz,criar) {
  const api=criar();
  if(typeof module==="object"&&module.exports)module.exports=api;
  if(raiz){raiz.SIAC=raiz.SIAC||{};raiz.SIAC.visualizacao=api;}
})(typeof globalThis==="object"?globalThis:null,function(){
  const VERSAO="0.2.0",FOCOS=["coluna","tubo","amostra"],GERAIS=["frascos","papeis"];
  const SECOES=Object.freeze({
    explorar:Object.freeze(["aparencia","uv","bandas","particulas","especies","trajetoria"]),
    medir:Object.freeze(["regua","bandas","volume-tempo","comparar-padroes"]),
    calcular:Object.freeze(["rf","retencao","eficiencia","resolucao","recuperacao"])
  });
  function falhar(s){throw new RangeError("SIAC visualização: "+s);}
  function numero(x,s,min,max=Infinity){
    if(typeof x!=="number"||!Number.isFinite(x)||x<min||x>max)falhar(s+" inválido");
    return x;
  }
  function objeto(x,s){if(!x||typeof x!=="object"||Array.isArray(x))falhar(s+" deve ser objeto");return x;}
  function idValido(id){
    if(typeof id!=="string"||!/^F(?:10|[1-9])$/.test(id))falhar("frasco inválido, escolha F1–F10");
    return id;
  }
  function congelar(o){
    if(o&&typeof o==="object"&&!Object.isFrozen(o)){
      Object.values(o).forEach(congelar);Object.freeze(o);
    }return o;
  }
  function cópia(o){return JSON.parse(JSON.stringify(o));}
  function conferir(s){
    if(!s||s.versao!==VERSAO||!s.papeis||!s.frascos)falhar("estado incompatível");
    return s;
  }
  function criarEstado(){
    const frascos={},papeis={};
    for(let i=1;i<=10;i++){
      const id="F"+i;
      frascos[id]={id,volumeColetadoMl:0,volumeDisponivelMl:0,
        componentesMg:{},corObservada:null,proveniencia:null};
      papeis[id]={id:"P"+i,frascoOrigem:id,etapa:"vazio",aplicacoes:[],
        frenteMm:null,tempoS:0,sinaisVisiveis:[],modoRevelacao:null,
        sinaisRevelados:[],proveniencia:null};
    }
    return congelar({versao:VERSAO,visao:"foco",foco:"coluna",geral:"frascos",
      modulo:"explorar",ver:"aparencia",frascoSelecionado:"F1",frascos,papeis,
      capilar:null,eventos:[]});
  }
  function atualizar(s,patch,tipo,dados={}){
    conferir(s);
    return congelar({...s,...patch,eventos:s.eventos.concat([{
      tipo,dados:cópia(dados),sequencia:s.eventos.length+1
    }])});
  }
  function clicarFoco(s){
    conferir(s);
    if(s.visao!=="foco")return atualizar(s,{visao:"foco"},"abrir-foco",{foco:s.foco});
    const foco=FOCOS[(FOCOS.indexOf(s.foco)+1)%FOCOS.length];
    return atualizar(s,{foco},"alternar-foco",{foco});
  }
  function clicarGeral(s){
    conferir(s);
    if(s.visao!=="geral")return atualizar(s,{visao:"geral"},"abrir-geral",{geral:s.geral});
    const geral=GERAIS[(GERAIS.indexOf(s.geral)+1)%GERAIS.length];
    return atualizar(s,{geral},"alternar-geral",{geral});
  }
  function selecionarFrasco(s,id){
    conferir(s);idValido(id);
    return atualizar(s,{frascoSelecionado:id},"selecionar-frasco",{id});
  }
  function modulo(s,id){
    conferir(s);
    if(!Object.hasOwn(SECOES,id))falhar("módulo desconhecido");
    return atualizar(s,{modulo:id,ver:SECOES[id][0]},"mudar-modulo",{id});
  }
  function ver(s,item){
    conferir(s);
    if(!SECOES[s.modulo].includes(item))falhar("ferramenta indisponível neste módulo");
    return atualizar(s,{ver:item},"mudar-ver",{modulo:s.modulo,item});
  }
  function registrarFracao(s,amostra){
    conferir(s);
    const a=objeto(amostra,"fração recebida do motor"),id=idValido(a.frasco);
    const v=numero(a.volumeMl,"volume coletado",0);
    if(v===0)falhar("registro de coleta requer volume positivo");
    const massas=objeto(a.componentesMg,"componentesMg");
    for(const [k,m] of Object.entries(massas)){
      if(!k.trim())falhar("identificador de componente vazio");
      numero(m,"massa do componente "+k,0);
    }
    if(a.corObservada!==null&&a.corObservada!==undefined &&
      (typeof a.corObservada!=="string"||!/^#[0-9a-f]{6}$/i.test(a.corObservada)))
      falhar("corObservada não é uma cor hexadecimal válida");
    if(typeof a.proveniencia!=="string"||!a.proveniencia.trim())
      falhar("proveniência explícita da coleta obrigatória");
    const prev=s.frascos[id];
    const componentesMg={...prev.componentesMg};
    for(const [k,m] of Object.entries(massas))componentesMg[k]=(componentesMg[k]||0)+m;
    return atualizar(s,{
      frascos:{...s.frascos,[id]:{
        ...prev,volumeColetadoMl:prev.volumeColetadoMl+v,
        volumeDisponivelMl:prev.volumeDisponivelMl+v,componentesMg,
        corObservada:a.corObservada??prev.corObservada,
        proveniencia:a.proveniencia
      }}
    },"registrar-coleta",{id,volumeMl:v,proveniencia:a.proveniencia});
  }
  function carregarCapilar(s,aliquotaMl){
    conferir(s);
    if(s.capilar)falhar("capilar já contém uma alíquota");
    const id=s.frascoSelecionado,frasco=s.frascos[id];
    numero(aliquotaMl,"volume da alíquota",Number.MIN_VALUE);
    if(aliquotaMl>frasco.volumeDisponivelMl+1e-12)falhar("fração insuficiente no tubo");
    return atualizar(s,{
      frascos:{...s.frascos,[id]:{
        ...frasco,volumeDisponivelMl:frasco.volumeDisponivelMl-aliquotaMl
      }},
      capilar:{frascoOrigem:id,volumeMl:aliquotaMl,corObservada:frasco.corObservada,
        proveniencia:frasco.proveniencia}
    },"carregar-capilar",{frasco:id,volumeMl:aliquotaMl});
  }
  function devolverCapilar(s){
    conferir(s);if(!s.capilar)falhar("capilar vazio");
    const id=s.capilar.frascoOrigem,f=s.frascos[id];
    return atualizar(s,{
      capilar:null,frascos:{...s.frascos,
        [id]:{...f,volumeDisponivelMl:f.volumeDisponivelMl+s.capilar.volumeMl}}
    },"devolver-capilar",{frasco:id});
  }
  function aplicarCapilar(s,opcoes){
    conferir(s);if(!s.capilar)falhar("capilar vazio: colete uma alíquota antes");
    const o=objeto(opcoes,"posição de aplicação");
    const id=s.frascoSelecionado,cap=s.capilar;
    if(id!==cap.frascoOrigem)falhar("selecione o frasco de origem para aplicar em seu papel");
    const origemMm=numero(o.origemMm,"origemMm",0);
    const larguraMm=numero(o.larguraMm??1,"larguraMm",Number.MIN_VALUE);
    const tempoS=numero(o.tempoS??0,"tempoS",0);
    const papel=s.papeis[id];
    if(papel.etapa==="desenvolvendo"||papel.etapa==="desenvolvido"||papel.etapa==="revelado")
      falhar("não aplicar novamente em suporte já desenvolvido");
    const aplicacao={origemMm,larguraMm,tempoS,frascoOrigem:id,volumeMl:cap.volumeMl,
      corObservada:cap.corObservada,proveniencia:cap.proveniencia};
    return atualizar(s,{
      papeis:{...s.papeis,[id]:{...papel,etapa:"aplicado",
        aplicacoes:papel.aplicacoes.concat([aplicacao]),
        proveniencia:cap.proveniencia}},
      capilar:null
    },"aplicar-capilar",{id,origemMm,larguraMm,tempoS});
  }
  // Só evolui com uma medição/cálculo entregue pelo motor planar, não sorteia manchas.
  function desenvolver(s,medicoes){
    conferir(s);
    const o=objeto(medicoes,"dados do desenvolvimento"),id=s.frascoSelecionado;
    const p=s.papeis[id];
    if(!["aplicado","desenvolvendo"].includes(p.etapa))
      falhar("papel sem amostra aplicada ou já desenvolvido");
    const frenteMm=numero(o.frenteMm,"frenteMm",Number.MIN_VALUE);
    const tempoS=numero(o.tempoS,"tempoS",0);
    if(p.frenteMm!==null&&frenteMm<p.frenteMm-1e-10)falhar("frente não pode recuar");
    if(tempoS<p.tempoS)falhar("tempo não pode recuar");
    if(typeof o.completo!=="boolean")falhar("completo deve ser booleano");
    if(!Array.isArray(o.sinaisVisiveis))falhar("sinaisVisiveis precisa vir do motor");
    for(const m of o.sinaisVisiveis){
      objeto(m,"sinal visível");
      numero(m.distanciaMm,"distanciaMm",0,frenteMm);
      if(m.cor!==undefined&&m.cor!==null&&
        (typeof m.cor!=="string"||!/^#[0-9a-f]{6}$/i.test(m.cor)))
        falhar("cor de sinal inválida");
    }
    if(typeof o.proveniencia!=="string"||!o.proveniencia.trim())
      falhar("desenvolvimento precisa de proveniência");
    return atualizar(s,{
      papeis:{...s.papeis,[id]:{...p,etapa:o.completo?"desenvolvido":"desenvolvendo",
        frenteMm,tempoS,sinaisVisiveis:cópia(o.sinaisVisiveis),
        proveniencia:o.proveniencia}}
    },"desenvolver-papel",{id,tempoS,frenteMm,completo:o.completo});
  }
  function revelar(s,o){
    conferir(s);
    const a=objeto(o,"resultado de detecção"),id=s.frascoSelecionado,p=s.papeis[id];
    if(!["desenvolvido","revelado"].includes(p.etapa))
      falhar("desenvolva o papel antes de usar revelação UV");
    if(!["uv254","uv365"].includes(a.detector))falhar("detector UV desconhecido");
    if(!Array.isArray(a.sinaisDetectados))falhar("sinaisDetectados devem vir do motor");
    for(const m of a.sinaisDetectados){
      objeto(m,"sinal detectado");numero(m.distanciaMm,"distanciaMm",0,p.frenteMm);
      if(!["extincao","fluorescencia"].includes(m.tipo))falhar("tipo de sinal desconhecido");
    }
    if(typeof a.proveniencia!=="string"||!a.proveniencia.trim())
      falhar("revelação precisa de proveniência");
    return atualizar(s,{
      papeis:{...s.papeis,[id]:{...p,etapa:"revelado",modoRevelacao:a.detector,
        sinaisRevelados:cópia(a.sinaisDetectados),proveniencia:a.proveniencia}}
    },"revelar-papel",{id,detector:a.detector,quantidade:a.sinaisDetectados.length});
  }
  return Object.freeze({versao:VERSAO,focos:FOCOS,gerais:GERAIS,secoes:SECOES,
    create:criarEstado,clickFocus:clicarFoco,clickOverview:clicarGeral,
    selectFraction:selecionarFrasco,setModule:modulo,setVer:ver,
    receiveFraction:registrarFracao,loadCapillary:carregarCapilar,
    returnCapillary:devolverCapilar,spot:aplicarCapilar,
    develop:desenvolver,reveal:revelar});
});
