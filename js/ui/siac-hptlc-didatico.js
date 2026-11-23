"use strict";
/* SIAC — consulta interativa de métodos HPTLC homologados na literatura.
 * Os marcadores de posição usam Rf experimentais de Alam et al. (2022),
 * NÃO são pixels de uma placa medida no SIAC, nem picos de absorbância.
 * UI puramente didática; não calcula concentração, intensidade, cinética,
 * largura de mancha ou dados de amostras de composição desconhecida.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==="object"&&module.exports)module.exports=api;
 if(root){root.SIAC=root.SIAC||{};root.SIAC.hptlcDidatico=api;}
})(typeof globalThis==="object"?globalThis:null,function(){
 const SOURCE="https://doi.org/10.3390/molecules27020405";
 const METHODS=Object.freeze({
  np:Object.freeze({id:"np",name:"Fase normal",short:"NP-HPTLC",solvent:"Acetato de etila/etanol 85:15 (v/v)",
   stationary:"Sílica gel 60 F254S, fase normal, placa de vidro",detector:"Densitometria em absorbância a 260 nm",
   rangeNg:[50,500],rows:Object.freeze({
    caffeine:Object.freeze({rf:.40,sd:.01,n:3}),
    paracetamol:Object.freeze({rf:.59,sd:.02,n:3})
   })}),
  rp:Object.freeze({id:"rp",name:"Fase reversa",short:"RP-HPTLC",solvent:"Etanol/água 50:50 (v/v)",
   stationary:"Sílica de fase reversa 60 F254S, placa de vidro; ligante C18 não comprovado",
   detector:"Densitometria em absorbância a 260 nm",rangeNg:[25,800],
   rows:Object.freeze({
    caffeine:Object.freeze({rf:.43,sd:.01,n:3}),
    paracetamol:Object.freeze({rf:.57,sd:.02,n:3})
   })})
 });
 const ANALYTES=Object.freeze({
  caffeine:Object.freeze({label:"Cafeína",cid:2519,cas:"58-08-2"}),
  paracetamol:Object.freeze({label:"Paracetamol",cid:1983,cas:"103-90-2"})
 });
 const TOOLS=Object.freeze({
  observar:[["metodo","Método"],["placa","Placa"],["leitura","Leitura 260 nm"]],
  medir:[["rf","Rf publicado"],["variabilidade","Repetibilidade"]],
  calcular:[["posicoes","Posições de referência"],["limites","Limitações"]]
 });
 let state={phase:"np",sample:"both",step:0,focus:"both",view:"placa",module:"observar",tool:"metodo"};
 const escape=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 const fmt=(v,d=2)=>Number(v).toLocaleString("pt-BR",{minimumFractionDigits:d,maximumFractionDigits:d});
 const chosen=()=>state.sample==="both"?["caffeine","paracetamol"]:[state.sample];
 function method(){return METHODS[state.phase];}
 function change(phase,sample){
  if(!Object.hasOwn(METHODS,phase)||!["both","caffeine","paracetamol"].includes(sample))return false;
  const changed=state.phase!==phase||state.sample!==sample;
  state.phase=phase;state.sample=sample;
  if(changed){state.step=0;state.focus="both";}
  return true;
 }
 function next(){if(state.step>=2)return false;state.step++;return true;}
 function restart(){state.step=0;state.focus="both";return true;}
 function focus(id){if(id!=="both"&&!chosen().includes(id))return false;state.focus=id;return true;}
 function view(mode){if(!["placa","comparar"].includes(mode))return false;state.view=mode;return true;}
 function setModule(module){
  if(!Object.hasOwn(TOOLS,module))return false;
  state.module=module;state.tool=TOOLS[module][0][0];return true;
 }
 function setTool(tool){if(!TOOLS[state.module].some(x=>x[0]===tool))return false;state.tool=tool;return true;}
 function details(){return chosen().map(id=>({id,nome:ANALYTES[id].label,...method().rows[id]}));}
 function allStates(){return Object.freeze({...state,method:method().id,selected:chosen(),details:details()});}
 function controlsHTML(){
  return '<section id="siac-hptlc-controls" aria-label="Seleção do método HPTLC" hidden>'+
   '<p class="siac-hint"><strong>Referência experimental conferida.</strong> Posições ilustrativas, não medidas nesta bancada.</p>'+
   '<label>Fase estacionária e eluente<select id="siac-hptlc-phase">'+
   '<option value="np">Fase normal · acetato de etila/etanol 85:15</option>'+
   '<option value="rp">Fase reversa · etanol/água 50:50</option></select></label>'+
   '<label>Padrões em investigação<select id="siac-hptlc-sample">'+
   '<option value="both">Cafeína + paracetamol</option>'+
   '<option value="caffeine">Cafeína</option><option value="paracetamol">Paracetamol</option>'+
   '</select></label><div class="siac-hptlc-actions">'+
   '<button type="button" id="siac-hptlc-next" class="primary-btn">Aplicar padrões</button>'+
   '<button type="button" id="siac-hptlc-restart" class="secondary-btn">Reiniciar</button></div>'+
   '<p id="siac-hptlc-stage-note" class="siac-hint" role="status" aria-live="polite"></p>'+
   '</section>';
 }
 function syncControls(container){
  if(!container)return;
  const s=container.querySelector("#siac-hptlc-controls");if(!s)return;
  s.querySelector("#siac-hptlc-phase").value=state.phase;
  s.querySelector("#siac-hptlc-sample").value=state.sample;
  const next=s.querySelector("#siac-hptlc-next");
  next.textContent=["Aplicar padrões","Desenvolver placa","Leitura de referência consultada"][state.step];
  next.disabled=state.step===2;
  s.querySelector("#siac-hptlc-stage-note").textContent=[
   "Pronto para representar a aplicação de padrões (sem corrida real).",
   "Padrões indicados na origem. Avance para posições de Rf publicadas.",
   "Posições bibliográficas indicadas. Consulte Ver → Leitura 260 nm."
  ][state.step];
 }
 function mountIntoCatalog(container,onUpdate){
  const card=container?.querySelector("#siac-catalogo");
  if(!card)throw Error("Catálogo científico SIAC ausente");
  if(card.querySelector('[data-siac-modo="hptlc"]'))return false;
  const btn=document.createElement("button");
  btn.type="button";btn.dataset.siacModo="hptlc";btn.setAttribute("aria-pressed","false");
  btn.textContent="HPTLC · referência";
  card.querySelector(".siac-catalogo-modos").append(btn);
  card.insertAdjacentHTML("beforeend",controlsHTML());
  card.addEventListener("click",e=>{
   if(e.target.closest("[data-siac-modo]")){
    card.querySelector("#siac-hptlc-controls").hidden=
      !card.querySelector('[data-siac-modo="hptlc"][aria-pressed="true"]');
   }
   if(e.target.closest("#siac-hptlc-next")){next();syncControls(card);onUpdate?.();}
   if(e.target.closest("#siac-hptlc-restart")){restart();syncControls(card);onUpdate?.();}
  });
  card.addEventListener("change",e=>{
   if(e.target.id==="siac-hptlc-phase"){change(e.target.value,state.sample);syncControls(card);onUpdate?.();}
   if(e.target.id==="siac-hptlc-sample"){change(state.phase,e.target.value);syncControls(card);onUpdate?.();}
  });
  syncControls(card);
  return true;
 }
 function plateFor(id,phase=state.phase){
  const p=METHODS[phase],row=p.rows[id],selected=state.focus===id;
  // Relative position is computed from published Rf, not new simulated kinetics.
  const bottom=(12+row.rf*74).toFixed(2);
  return '<div class="siac-hptlc-lane'+(selected?' is-focused':'')+'">'+
   '<strong class="siac-hptlc-lane-name">'+escape(ANALYTES[id].label)+'</strong>'+
   '<div class="siac-hptlc-glass" role="group" aria-label="Trilha HPTLC ilustrativa de '+escape(ANALYTES[id].label)+'">'+
   '<span class="siac-hptlc-origin" aria-label="Linha de origem"></span>'+
   (state.step>=2?'<span class="siac-hptlc-front" aria-label="Frente de solvente publicada como geometria ilustrativa"></span>':'')+
   (state.step>=1?'<span class="siac-hptlc-applied" aria-hidden="true"></span>':'')+
   (state.step>=2?'<button type="button" class="siac-hptlc-band" data-hptlc-focus="'+id+
    '" style="bottom:'+bottom+'%;" aria-label="Destacar '+escape(ANALYTES[id].label)+
    ', Rf de referência '+fmt(row.rf)+'" title="Rf '+fmt(row.rf)+' ± '+fmt(row.sd)+'">'+
    '<span class="siac-hptlc-band-mark"></span></button>':'')+
   '</div><small>Rf '+fmt(row.rf)+' ± '+fmt(row.sd)+' (n='+row.n+')</small>'+
   '</div>';
 }
 function chartMarkup(){
  return '<div class="siac-hptlc-profile" aria-label="Posições de Rf no eixo 0 a 1, sem intensidade instrumental">'+
   '<div class="siac-hptlc-axis"><span>0,0</span><span>0,2</span><span>0,4</span><span>0,6</span><span>0,8</span><span>1,0</span></div>'+
   '<div class="siac-hptlc-track">'+chosen().map(id=>{
    const item=method().rows[id];
    return '<button type="button" class="siac-hptlc-marker" data-hptlc-focus="'+id+'" style="left:'+(item.rf*100).toFixed(2)+
      '%;" aria-label="Rf '+fmt(item.rf)+' de '+escape(ANALYTES[id].label)+'" title="'+escape(ANALYTES[id].label)+' · '+fmt(item.rf)+'"></button>';
   }).join("")+'</div><p class="siac-hptlc-hint">Marcas na escala de Rf; <strong>não representam sinais de absorbância nem alturas de picos medidas</strong>.</p></div>';
 }
 function scene(){
  const p=method(),comparison=state.view==="comparar";
  return '<section class="siac-hptlc-scene" aria-label="Representação HPTLC dos dados da literatura">'+
   '<div class="siac-hptlc-heading"><div><h2>HPTLC · '+escape(p.name)+'</h2>'+
   '<p>Eluente: '+escape(p.solvent)+' · detector 260 nm</p></div>'+
   '<small>Referência publicada · não é uma corrida no SIAC</small></div>'+
   (comparison?'<div class="siac-hptlc-comparison">'+
    ["np","rp"].map(key=>'<article><h3>'+escape(METHODS[key].name)+'</h3><p>'+escape(METHODS[key].solvent)+'</p>'+
      '<div class="siac-hptlc-comparison-values">'+chosen().map(id=>'<p>'+escape(ANALYTES[id].label)+
      ': <strong>Rf '+fmt(METHODS[key].rows[id].rf)+'</strong></p>').join("")+'</div></article>').join("")+
    '</div><p class="siac-hptlc-hint">A fase estacionária também muda entre NP e RP. A comparação não isola o efeito do solvente.</p>':
    '<div class="siac-hptlc-bench"><div class="siac-hptlc-unit">'+
    '<div class="siac-hptlc-unit-head"><span class="siac-hptlc-light"></span>Leitura densitométrica · 260 nm</div>'+
    '<div class="siac-hptlc-plate">'+chosen().map(id=>plateFor(id)).join("")+'</div>'+
    '<p class="siac-hptlc-hint">Placa esquemática; posições derivadas do Rf publicado, não observações instrumentais.</p></div>'+
    '<div class="siac-hptlc-side"><h3>'+["Preparação","Padrões aplicados","Consulta da referência"][state.step]+'</h3>'+
    '<p>'+["Selecione fase e padrões na Montagem. Não há desenvolvimento físico ainda.",
      "Indicação da aplicação na linha de origem. Sem simulação de difusão ou velocidade.",
      "Rf dos padrões já publicados. A posição é apenas representação proporcional."][state.step]+'</p>'+
    (state.step>=2?chartMarkup():'<div class="siac-hptlc-waiting">O eixo de Rf será apresentado após consultar a referência.</div>')+
    '</div></div>')+
   '<p class="siac-hptlc-source">Fonte: <a href="'+SOURCE+'" target="_blank" rel="noopener noreferrer">Alam et al. (2022), DOI 10.3390/molecules27020405</a></p></section>';
 }
 function renderVer(){
  const p=method(),keys=chosen();
  const nav=Object.keys(TOOLS).map(m=>'<button type="button" data-module="'+m+'" aria-pressed="'+(m===state.module)+'">'+
    m[0].toUpperCase()+m.slice(1)+'</button>').join("");
  const tools=TOOLS[state.module].map(([id,name])=>'<button type="button" data-ver="'+id+'" aria-pressed="'+(state.tool===id)+'">'+name+'</button>').join("");
  let body="";
  if(state.module==="observar"){
   if(state.tool==="metodo")body='<p><strong>'+escape(p.short)+'</strong></p><p>Suporte: '+escape(p.stationary)+'</p>'+
     '<p>Fase móvel: '+escape(p.solvent)+'</p><p>Detector: '+escape(p.detector)+'</p>';
   else if(state.tool==="placa")body='<p>A posição da banda é desenhada a partir do <strong>Rf publicado</strong>, sem largura de banda, velocidade de migração ou efeito da concentração fabricados.</p>'+
    '<p>Origem e frente são referências geométricas de visualização.</p>';
   else body='<p>O estudo utiliza <strong>densitometria em absorbância a 260 nm</strong>. O SIAC ainda não reproduz um densitômetro nem calcula absorbância real.</p>'+
    '<p>O gráfico da bancada marca somente posições de Rf. Não há alturas de pico, área ou curva de calibração simuladas.</p>';
  }else if(state.module==="medir"){
   if(state.tool==="rf")body='<table class="siac-hptlc-tabela"><thead><tr><th>Padrão</th><th>Rf experimental</th></tr></thead><tbody>'+
    keys.map(id=>'<tr><th scope="row">'+escape(ANALYTES[id].label)+'</th><td>'+fmt(p.rows[id].rf)+' ± '+fmt(p.rows[id].sd)+'</td></tr>').join("")+'</tbody></table>'+
    '<p class="siac-hptlc-hint">Valores transcritos da fonte, não medidos na cena. Não há régua de medição instrumental nesta representação.</p>';
   else body='<p>Os Rf apresentados são média ± desvio-padrão para <strong>n = 3</strong> no estudo de adequação do sistema.</p>'+
    '<p>Desvio-padrão não é largura espacial de banda, limite de confiança ou intensidade. Nenhum ruído experimental é gerado.</p>';
  }else if(state.tool==="posicoes"){
   body='<p>Como leitura geométrica, a posição equivalente é <strong>Rf × distância da frente</strong>. Essa relação não é uma previsão físico-química.</p>'+
    '<p>Não há distâncias da amostra medidas nesta cena nem parâmetros de coluna para calcular k, N ou concentração.</p>';
  }else{
   body='<p>Homologação científica restrita aos dois métodos HPTLC com suportes e eluentes específicos. A bancada atual apresenta uma <strong>referência interativa</strong>, não uma medição.</p>'+
    '<p>Não comparar Rf de fases diferentes como se o suporte fosse constante. Não atribuir massas, pureza ou identidade a amostras desconhecidas.</p>';
  }
  return {contexto:"HPTLC · "+p.name+" · "+state.module,modulos:nav,itens:tools,
   conteudo:body+'<p class="siac-hptlc-source"><a href="'+SOURCE+'" target="_blank" rel="noopener noreferrer">Artigo e condições originais</a></p>'};
 }
 function renderDados(){
  const p=method();
  return '<h2>Dados · HPTLC</h2><p><strong>Homologação científica condicionada</strong> · representação didática, não medição</p>'+
   '<dl class="siac-hptlc-dl"><div><dt>Método</dt><dd>'+escape(p.short)+'</dd></div>'+
   '<div><dt>Fase móvel</dt><dd>'+escape(p.solvent)+'</dd></div>'+
   '<div><dt>Suporte</dt><dd>'+escape(p.stationary)+'</dd></div>'+
   '<div><dt>Detector</dt><dd>Absorbância a 260 nm (não implementada fisicamente)</dd></div>'+
   '<div><dt>Faixa de calibração publicada</dt><dd>'+p.rangeNg[0]+'–'+p.rangeNg[1]+' ng/banda; apenas referência</dd></div></dl>'+
   '<table class="siac-hptlc-tabela"><thead><tr><th>Substância</th><th>Rf ± DP</th><th>n</th></tr></thead><tbody>'+
   chosen().map(id=>'<tr><th scope="row">'+escape(ANALYTES[id].label)+'</th><td>'+fmt(p.rows[id].rf)+' ± '+fmt(p.rows[id].sd)+'</td><td>'+p.rows[id].n+'</td></tr>').join("")+
   '</tbody></table><p class="siac-hptlc-hint">Não autorizado: estimar área de pico, massa, concentração ou efeito de solventes não documentados. Os padrões não são misturas desconhecidas.</p>'+
   '<p><a href="'+SOURCE+'" target="_blank" rel="noopener noreferrer">Fonte original: Alam et al. (2022)</a></p>';
 }
 return Object.freeze({methods:METHODS,analytes:ANALYTES,source:SOURCE,controlsHTML,mountIntoCatalog,
  change,next,restart,focus,view,setModule,setTool,syncControls,scene,renderVer,renderDados,
  get snapshot(){return allStates();}});
});
