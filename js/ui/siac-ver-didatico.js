"use strict";
/* Ferramentas didáticas na doca Ver. O modo pesquisa NÃO produz sinais
 * experimentais: interpreta métodos, registra medições informadas e usa
 * SIAC.metrics para calcular Rf somente com as distâncias válidas.
 */
(function(raiz,fabrica){
 const api=fabrica();
 if(typeof module==="object"&&module.exports)module.exports=api;
 if(raiz){raiz.SIAC=raiz.SIAC||{};raiz.SIAC.verDidatico=api;}
})(typeof globalThis==="object"?globalThis:null,function(){
 const MODULOS=Object.freeze(["observar","medir","calcular"]);
 const FERRAMENTAS=Object.freeze({
  observar:[["metodo","Método"],["visivel","Luz visível"],["uv254","UV 254"],["uv366","UV 366"],["ninhidrina","Ninhidrina"]],
  medir:[["regua","Régua"],["condicoes","Condições"]],
  calcular:[["rf","Calcular Rf"],["comparar","Referência"],["coluna","Coluna"]]
 });
 const EXPLICACAO=Object.freeze({
  visivel:"A cor própria da substância só permite observar uma zona se ela estiver visível nas condições do ensaio. Não é prova de identidade.",
  uv254:"UV 254 nm: em placas com indicador F254, substâncias que absorvem nessa região podem apagar localmente a fluorescência da placa. É necessário confirmar placa e resposta do analito.",
  uv366:"UV 366 nm: algumas espécies fluorescem nessa excitação; outras continuam invisíveis. O resultado depende do suporte, do composto e das condições.",
  ninhidrina:"Ninhidrina é um reagente revelador para diversas substâncias com grupos amino. A placa deve ser desenvolvida e seca; a resposta e a cor dependem do analito e das condições.",
 });
 const FONTES=Object.freeze({
  rf:"https://goldbook.iupac.org/terms/view/R05353/html",
  detection:"https://www.merckmillipore.com/AT/de/analytics-sample-preparation/learning-center-thin-layer-chromatography/tlc-process/TLC-Evaluation/4tab.qB.RXkAAAFVN.VDx07e%2Cnav",
  ninhidrina:"https://vlab.amrita.edu/index.php/images/theme/theme/amrita/MEC/?brch=63&cnt=2&sim=154&sub=3"
 });
 let modulo="observar",ferramenta="metodo",chave="",frente="",mancha="";
 const escape=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 const fmt=(v,d=3)=>Number(v).toLocaleString("pt-BR",{maximumFractionDigits:d});
 function method(selected){return selected?.sistema||null;}
 function sincronizar(selected){
  const next=(selected?.substanciaId||"")+"|"+(selected?.sistemaId||"");
  if(next!==chave){chave=next;frente="";mancha="";ferramenta=FERRAMENTAS[modulo][0][0];}
 }
 function setModulo(m){if(!MODULOS.includes(m))return false;modulo=m;ferramenta=FERRAMENTAS[m][0][0];return true;}
 function setFerramenta(t){if(!FERRAMENTAS[modulo].some(x=>x[0]===t))return false;ferramenta=t;return true;}
 function setMedicao(tipo,texto){
  if(tipo!=="frente"&&tipo!=="mancha")return false;
  if(tipo==="frente")frente=String(texto).trim();else mancha=String(texto).trim();
  return true;
 }
 function validar(){
  if(!frente||!mancha)return {ok:false,motivo:"Informe as duas distâncias medidas desde a mesma origem."};
  const a=Number(frente),b=Number(mancha);
  if(!Number.isFinite(a)||!Number.isFinite(b)||a<=0||a>1000||b<0||b>a)
   return {ok:false,motivo:"A frente deve ser maior que zero e a mancha deve estar entre a origem e a frente, em milímetros."};
  return {ok:true,frenteMm:a,manchaMm:b};
 }
 function calcular(metrics){
  const v=validar();
  if(!v.ok)return v;
  if(!metrics?.planarRf)return {ok:false,motivo:"Motor de métricas indisponível: cálculo não executado."};
  try{
   const saida=metrics.planarRf({frenteMm:v.frenteMm,manchas:[{id:"mancha-manual",distanciaMm:v.manchaMm}]});
   return {ok:true,frenteMm:v.frenteMm,manchaMm:v.manchaMm,rf:saida.manchas[0].rf,
    origem:"distancias_informadas_pelo_usuario",evidencia:"exercicio_de_leitura_sem_observacao_instrumentada"};
  }catch(e){return {ok:false,motivo:e.message};}
 }
 function evidencia(m,tipo){
  if(!m)return false;
  const d=String(m.detector||"").toLowerCase();
  if(tipo==="visivel")return /vis[ií]vel/.test(d);
  if(tipo==="ninhidrina")return d.includes("ninhidrina");
  if(tipo==="uv254")return /uv.?254/.test(d);
  if(tipo==="uv366")return /uv.?36[56]/.test(d);
  return false;
 }
 function corpo(selected,metrics){
  const s=selected?.substancia,m=method(selected);
  if(!s)return '<p>Selecione uma substância na Montagem para iniciar a investigação.</p>';
  if(!m)return '<p>Os instrumentos são apresentados após a escolha de um sistema eluente documentado na Montagem. Sem um método, não há retenção ou detector que possa ser atribuído ao composto.</p>';
  if(modulo==="observar"){
   if(ferramenta==="metodo")return '<p><strong>'+escape(s.nome)+'</strong></p>'+
    '<p>Suporte documentado: '+escape(m.faseEstacionaria)+'</p>'+
    '<p>Fase móvel: '+escape(m.faseMovel)+'</p>'+
    '<p>Detector relatado: '+escape(m.detector)+'</p>'+
    (m.preTratamento?'<p>Pré-tratamento: '+escape(m.preTratamento)+'</p>':"")+
    '<p>O protocolo é referência bibliográfica em revisão; não constitui observação produzida nesta bancada.</p>';
   const confirmed=evidencia(m,ferramenta);
   const source=ferramenta==="ninhidrina"?FONTES.ninhidrina:FONTES.detection;
   return '<p>'+escape(EXPLICACAO[ferramenta])+'</p>'+
    '<p><strong>'+ (confirmed?"Técnica descrita no método selecionado.":"Técnica não confirmada para este método.")+'</strong></p>'+
    '<p>'+ (confirmed?
     "O protocolo cita esse detector, mas o SIAC ainda não dispõe de sinal experimental homologado para reproduzir a mancha.":
     "Conteúdo explicativo: a seleção não significa que o composto responda ao detector nem que a placa seja compatível.")+'</p>'+
    '<p><a href="'+escape(source)+'" target="_blank" rel="noopener noreferrer">Referência técnica do procedimento</a></p>';
  }
  if(modulo==="medir"){
   if(ferramenta==="condicoes")return '<p><strong>Condições da referência</strong></p>'+
    '<p>Eluente: '+escape(m.faseMovel)+'</p>'+
    '<p>Suporte: '+escape(m.faseEstacionaria)+'</p>'+
    '<p>Detecção: '+escape(m.detector)+'</p>'+
    '<p>Estado: '+escape(m.evidencia)+'. A geometria da aplicação e as condições completas ainda precisam ser conferidas.</p>';
   return '<p>Régua didática: registre duas distâncias obtidas de uma <strong>mesma origem</strong>. Aqui não há detecção instrumental automática.</p>'+
    '<label>Frente do solvente (mm)<input data-siac-medicao="frente" type="number" min="0.01" max="1000" step="any" value="'+escape(frente)+'" placeholder="Ex.: 50"></label>'+
    '<label>Centro da mancha (mm)<input data-siac-medicao="mancha" type="number" min="0" max="1000" step="any" value="'+escape(mancha)+'" placeholder="Ex.: 20"></label>'+
    '<p id="siac-medicao-feedback" role="status">'+escape(validar().ok?
       "Distâncias registradas. Abra Calcular → Calcular Rf.":validar().motivo)+'</p>'+
    '<p class="siac-ver-hint">Valores digitados são exercício de leitura; não são medidas realizadas na cena.</p>';
  }
  if(ferramenta==="coluna")return '<p><strong>Fator de retenção de coluna</strong></p>'+
   '<p>Exige volume morto Vₘ, volume de retenção Vᵣ e uma coluna caracterizada: k = (Vᵣ − Vₘ)/Vₘ.</p>'+
   '<p>O método selecionado é planar. Rf não pode ser convertido automaticamente em k ou em volume de eluição. Sem dados de coluna, o cálculo permanece indisponível.</p>';
  const calc=calcular(metrics);
  if(ferramenta==="rf")return '<p>Rf = distância do centro da mancha ÷ distância da frente, ambas medidas desde a origem.</p>'+
   (calc.ok?'<p><strong>Rf do exercício: '+fmt(calc.rf)+'</strong></p><p>'+
    fmt(calc.manchaMm)+' mm ÷ '+fmt(calc.frenteMm)+' mm = '+fmt(calc.rf)+'</p>':
    '<p>'+escape(calc.motivo)+' Use Medir → Régua para registrar as distâncias.</p>')+
   '<p class="siac-ver-hint">O cálculo usa os valores informados pelo estudante, não uma identificação automática de composto.</p>'+
   '<p><a href="'+FONTES.rf+'" target="_blank" rel="noopener noreferrer">Definição IUPAC</a></p>';
  if(m.rf===null)return '<p>O protocolo documenta uma técnica de separação, mas não oferece Rf individual para <strong>'+
   escape(s.nome)+'</strong>. Comparação numérica indisponível.</p>';
  return '<p>Rf bibliográfico condicionado ao método: <strong>'+fmt(m.rf)+'</strong>.</p>'+
   (calc.ok?'<p>Rf do exercício: '+fmt(calc.rf)+'. Diferença absoluta: <strong>'+
     fmt(Math.abs(calc.rf-m.rf))+'</strong>.</p>':
    '<p>'+escape(calc.motivo)+' Registre as distâncias em Medir → Régua.</p>')+
   '<p>Uma diferença pequena, isoladamente, <strong>não confirma identidade</strong>. Antes de comparar amostras, confira suporte, solvente, revelação, temperatura e tolerância fundamentada.</p>';
 }
 function render(selected,metrics){
  sincronizar(selected);
  const m=method(selected);
  const mods=MODULOS.map(v=>'<button type="button" data-module="'+v+'" aria-pressed="'+(v===modulo)+'">'+
   v.charAt(0).toUpperCase()+v.slice(1)+'</button>').join("");
  const tools=FERRAMENTAS[modulo].map(([id,label])=>{
   const evidence=modulo==="observar"&&id!=="metodo"&&m?evidencia(m,id):null;
   return '<button type="button" data-ver="'+id+'" aria-pressed="'+(id===ferramenta)+'">'+
    label+(evidence===false?' · guia':'')+'</button>';
  }).join("");
  const title=(selected?.substancia?.nome||"Escolha uma substância")+" · "+modulo.charAt(0).toUpperCase()+modulo.slice(1);
  return {contexto:title,modulos:mods,itens:tools,conteudo:corpo(selected,metrics)};
 }
 return Object.freeze({render,setModulo,setFerramenta,setMedicao,validar,calcular,evidencia,
  get snapshot(){return {modulo,ferramenta,frente,mancha,chave};}});
});
