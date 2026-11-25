"use strict";
/* SIAC — regra de homologação de substâncias para dados quantitativos.
 * Dois métodos documentados + sistemas eluentes quimicamente distintos.
 * Não inferir Rf, detector ou identidade a partir de bancos auxiliares.
 * A análise é por substância E técnica. Mistura de vários solventes em um
 * mesmo protocolo continua sendo apenas um método.
 */
(function(raiz,fabrica){
 const api=fabrica();
 if(typeof module==="object"&&module.exports)module.exports=api;
 if(raiz){raiz.SIAC=raiz.SIAC||{};raiz.SIAC.homologacao=api;}
})(typeof globalThis==="object"?globalThis:null,function(){
 const POLITICA=Object.freeze({
  versao:"2.2.0",
  metaMinimaSubstancias:40,
  metaAmpliadaSubstancias:55,
  minimoMetodosIndependentes:2,
  minimoSolventesQuimicosDistintos:2,
  sistemasDevemCompartilharComponentesExatamenteIguais:false,
  precisaTrocaRealDeSolventeEntreMetodos:true,
  exigeRetencaoIndividual:true,
  exigeProveniencia:true,
  exigeIdentidadeConferida:true,
  exigeSuporteCaracterizado:true,
  exigeDetectorConferido:true,
  proibeHomologacaoPorPrevisaoRf:true
 });
 const ADITIVOS=new Set(["sodium_chloride","nacl","sodium_acetate","acido_fosforico_sal","aqueous_ammonia_sg0880","aqueous_ammonia_25pct","aqueous_ammonia_unspecified"]);
 function indexar(protocolos){
  return new Map((Array.isArray(protocolos)?protocolos:[]).map(p=>[p.id,p]));
 }
 function faseMovel(p,porId,visitados=new Set()){
  if(!p||!p.faseMovel)return null;
  const fm=p.faseMovel;
  if(fm.herdadaDe){
   if(visitados.has(fm.herdadaDe))return null;
   visitados.add(fm.herdadaDe);
   return faseMovel(porId.get(fm.herdadaDe),porId,visitados);
  }
  return fm;
 }
 function solventes(fm){
  if(!fm||!Array.isArray(fm.componentes))return [];
  return [...new Set(fm.componentes.map(c=>c?.id).filter(
   id=>typeof id==="string"&&id.trim()&&!ADITIVOS.has(id)
  ))].sort();
 }
 function sistemaBemDescrito(fm){
  if(!fm||!Array.isArray(fm.componentes)||!fm.componentes.length)return false;
  const items=fm.componentes;
  if(items.some(c=>!c||typeof c.id!=="string"||!c.id.trim()))return false;
  if(items.length>1&&items.some(c=>typeof c.partes!=="number"||!Number.isFinite(c.partes)||c.partes<=0))return false;
  return solventes(fm).length>0;
 }
 function compostoEspecifico(analito,metodo){
  const individual=(metodo?.dadosRf||[]).filter(d=>d.analito===analito&&
   typeof d.rf==="number"&&Number.isFinite(d.rf)&&d.rf>=0&&d.rf<=1);
  const coluna=(metodo?.dadosColuna||[]).filter(d=>d.analito===analito&&
   typeof d.volumeRetencaoMl==="number"&&d.volumeRetencaoMl>0&&
   typeof d.volumeMortoMl==="number"&&d.volumeMortoMl>0&&
   d.volumeRetencaoMl>=d.volumeMortoMl);
  const intervalos=(metodo?.dadosRfIntervalos||[]).filter(d=>d.analito===analito&&
   Number.isFinite(d.rfMin)&&Number.isFinite(d.rfMax)&&
   d.rfMin>=0&&d.rfMin<=d.rfMax&&d.rfMax<=1);
  return {rf:individual,intervalos,coluna};
 }
 function metodoCandidato(analito,p,porId,fonteCatalogo){
  const fm=faseMovel(p,porId);
  const medida=compostoEspecifico(analito,p);
  const configuracao=solventes(fm);
  const deficits=[];
  if(!medida.rf.length&&!medida.intervalos.length&&!medida.coluna.length)deficits.push("sem_retencao_individual");
  if(!sistemaBemDescrito(fm))deficits.push("fase_movel_incompleta");
  if(!p.faseEstacionaria?.classe||
     !p.faseEstacionaria?.detalhamento||
     /não informado|nao informado|indefinid/i.test(p.faseEstacionaria.detalhamento))
   deficits.push("fase_estacionaria_incompleta");
  if(!p.aplicacao?.detector||/não informado|nao informado/i.test(p.aplicacao.detector))
   deficits.push("detector_incompleto");
  if(!p.fonte||!fonteCatalogo?.[p.fonte])deficits.push("fonte_sem_url");
  if(p.status==="homologado"&&(
    typeof p.auditoriaCientifica?.fontePrimaria!=="string"||
    p.auditoriaCientifica.fontePrimaria!==fonteCatalogo[p.fonte]||
    !p.auditoriaCientifica.secoesConferidas||
    !/^\d{4}-\d{2}-\d{2}$/.test(p.auditoriaCientifica.dataConferencia||"")
  ))deficits.push("auditoria_primaria_incompleta");
  if(p.status!=="homologado")deficits.push("protocolo_nao_homologado");
  if(p.faseEstacionaria?.homologada!==true)deficits.push("suporte_nao_homologado");
  if(fm?.homologada!==true)deficits.push("eluente_nao_homologado");
  if(p.aplicacao?.detectorHomologado!==true)deficits.push("detector_nao_homologado");
  const naoPredito=x=>x.homologado===true&&
   x.classe!=="estimado"&&x.classe!=="predito"&&x.classe!=="simulado";
  if(!medida.rf.some(naoPredito)&&!medida.intervalos.some(naoPredito)&&
     !medida.coluna.some(naoPredito))
   deficits.push("retencao_nao_homologada");
  return {
   protocoloId:p.id,
   tecnica:p.tecnica,
   fonte:p.fonte,
   solventes:configuracao,
   sistemaDescrito:sistemaBemDescrito(fm),
   registrosRf:medida.rf.length,
   registrosRfIntervalos:medida.intervalos.length,
   registrosColuna:medida.coluna.length,
   prontoComoMetodo:deficits.length===0,
   habilitadoNoMotor:deficits.length===0&&p.disponibilidadeSimulador?.habilitarCenaQuantitativa===true,
   pendencias:deficits
  };
 }
 function existeContrasteDeSolventes(a,b){
  const A=new Set(a.solventes),B=new Set(b.solventes);
  const total=new Set([...A,...B]);
  if(total.size<POLITICA.minimoSolventesQuimicosDistintos)return false;
  if(!a.solventes.length||!b.solventes.length)return false;
  // Proíbe contar apenas duas receitas de proporções distintas da MESMA
  // lista de solventes como evidência de solventes diferentes.
  return [...A].some(s=>!B.has(s))||[...B].some(s=>!A.has(s));
 }
 function contrastes(metodos,requireReady=false){
  const out=[];
  for(let i=0;i<metodos.length;i++)for(let j=i+1;j<metodos.length;j++){
   const a=metodos[i],b=metodos[j];
   if(a.protocoloId===b.protocoloId)continue;
   if(requireReady&&(!a.prontoComoMetodo||!b.prontoComoMetodo))continue;
   if(!existeContrasteDeSolventes(a,b))continue;
   out.push({metodos:[a.protocoloId,b.protocoloId],
    solventesA:a.solventes,solventesB:b.solventes});
  }
  return out;
 }
 function avaliarSubstancia(analito,base){
  if(!base||!Array.isArray(base.candidatos)||!Array.isArray(base.protocolos))
   throw new TypeError("Catálogo de analitos/protocolos necessário");
  const found=base.candidatos.find(c=>c.id===analito);
  if(!found)throw new RangeError("Analito não pertence ao catálogo: "+analito);
  const porId=indexar(base.protocolos);
  const metodos=base.protocolos.filter(p=>{
   const m=compostoEspecifico(analito,p);
   return m.rf.length+m.intervalos.length+m.coluna.length>0;
  }).map(p=>metodoCandidato(analito,p,porId,base.fontes||{}));
  const candidatosComContraste=contrastes(metodos,false);
  const homologadosComContraste=contrastes(metodos,true);
  const identidadeConferida=found.identity?.verificadoIndividualmente===true &&
   Boolean(found.identity?.cas||found.identity?.pubchemCID||found.identity?.inchiKey);
  const apto=identidadeConferida&&homologadosComContraste.length>0;
  const paraCena=identidadeConferida&&contrastes(metodos.filter(m=>m.habilitadoNoMotor),true).length>0;
  const pendencias=[];
  if(!identidadeConferida)pendencias.push("identidade_quimica_nao_conferida");
  if(metodos.length<2)pendencias.push("menos_de_dois_metodos_com_retencao_individual");
  if(!candidatosComContraste.length)pendencias.push("ausencia_de_dois_sistemas_com_solventes_realmente_distintos");
  if(!homologadosComContraste.length)pendencias.push("metodos_e_condicoes_nao_homologados");
  return {id:found.id,nome:found.nome,grupo:found.grupo,
    identidadeConferida,metodosComRetencaoIndividual:metodos.length,
    metodosComCondicoesHomologadas:metodos.filter(m=>m.prontoComoMetodo).length,
    comparacoesPossiveis:candidatosComContraste,
    comparacoesHomologadas:homologadosComContraste,
    metodos,homologacaoCompleta:apto,
    disponibilidadeSimulacaoReal:paraCena,
    pendencias};
 }
 function auditarCatalogo(base){
  if(!base||!Array.isArray(base.candidatos))throw new TypeError("Catálogo necessário");
  const linhas=base.candidatos.map(c=>avaliarSubstancia(c.id,base));
  const elegiveis=linhas.filter(c=>c.homologacaoCompleta);
  return {politica:POLITICA,resumo:{
   catalogados:linhas.length,
   comUmOuMaisMetodosDeRetencao:linhas.filter(c=>c.metodosComRetencaoIndividual>0).length,
   comDoisOuMaisMetodosDeRetencao:linhas.filter(c=>c.metodosComRetencaoIndividual>=2).length,
   comDoisMetodosESolventesContrastantes:linhas.filter(c=>c.comparacoesPossiveis.length>0).length,
   completamenteHomologados:elegiveis.length,
   liberadosParaSimulacaoReal:linhas.filter(x=>x.disponibilidadeSimulacaoReal).length,
   faltamParaMetaMinima:Math.max(0,POLITICA.metaMinimaSubstancias-elegiveis.length),
   faltamParaMetaAmpliada:Math.max(0,POLITICA.metaAmpliadaSubstancias-elegiveis.length)
  },candidatos:linhas};
 }
 return Object.freeze({politica:POLITICA,faseMovel,solventes,sistemaBemDescrito,
  existeContrasteDeSolventes,avaliarSubstancia,auditarCatalogo});
});
