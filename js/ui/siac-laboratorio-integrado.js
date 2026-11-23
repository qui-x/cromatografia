"use strict";
/* SIAC — Integração da cromatografia à bancada principal.
 * Não altera as rotas de missões SIAB legadas. Química de exemplo hipotética;
 * janelas de coleta nunca determinam o perfil de retenção.
 */
window.SIAC=window.SIAC||{};
SIAC.laboratorio=(()=>{
 const C=SIAC.column,F=SIAC.fractionCollector,$=id=>document.getElementById(id);
 const MODELOS=[
  {id:"A",nome:"Componente-modelo azul",cor:"#0072b2",massa:2,deteccao:{visivel:true,uv254:true},rf:.25},
  {id:"B",nome:"Componente-modelo verde",cor:"#009e73",massa:3,deteccao:{visivel:true,uv254:true},rf:.56},
  {id:"C",nome:"Componente-modelo incolor",cor:null,massa:1.5,deteccao:{visivel:false,uv365:true},rf:.78},
  {id:"D",nome:"Componente-modelo âmbar",cor:"#d79b32",massa:2,deteccao:{visivel:true,uv254:true},rf:.43}
 ];
 const RET={
  faseA:{silica:{A:.22,B:1.1,C:2.8,D:1.75},alumina:{A:.5,B:1.6,C:2.2,D:.6}},
  faseB:{silica:{A:.83,B:.34,C:1.4,D:2.2},alumina:{A:1.1,B:.5,C:2.5,D:.3}}
 };
 const VIEWS=["coluna","tubo","amostra"],GROUPS=["frascos","papeis"];
 // A doca Ver adapta a ferramenta ao objeto em foco, sem criar novos controles
 // fora da infraestrutura existente do workspace.
 const MODULES={
  observar:["aparencia","bandas","especies","particulas","uv"],
  medir:["regua","volume","tempo","vazao","janelas","referencias"],
  calcular:["grafico","rf","retencao","recuperacao"]
 };
 const CONTEXT={
  coluna:{observar:["aparencia","bandas","especies"],medir:["tempo","volume","vazao","janelas","regua"],calcular:["grafico","retencao","recuperacao","rf"]},
  tubo:{observar:["aparencia","especies","uv"],medir:["volume","tempo","regua","referencias"],calcular:["recuperacao","rf"]},
  amostra:{observar:["aparencia","bandas","uv"],medir:["regua","volume","referencias"],calcular:["rf","recuperacao"]}
 };
 const availableItems=()=>CONTEXT[focus]?.[module]||MODULES[module];
 let ready=false,enabled=false,col=null,plan=null,volume=0,speed=120,
  running=false,lastFrame=0,view="foco",focus="coluna",group="frascos",
  selected="F1",capillary=null,capillaryLoading=null,development=null,module="observar",
  item="aparencia",papers={},withdrawn={},status="",lastDraw=0,
  catalogMode=true,catalogSelection=null;
 const fmt=(n,d=2)=>Number(n).toLocaleString("pt-BR",{minimumFractionDigits:d,maximumFractionDigits:d});
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 const esc=v=>String(v).replace(/[&<>"']/g,k=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[k]));
 const displaySec=t=>{const sec=Math.floor(Math.max(0,t)),h=Math.floor(sec/3600),m=Math.floor(sec%3600/60),s=sec%60;return [h,m,s].map(x=>String(x).padStart(2,"0")).join(":");};
 function elements(){
  return '<details open><summary>Amostra e solvente</summary>'+
    '<p class="siac-hint">Misturas-modelo hipotéticas; os nomes não são identificações químicas.</p>'+
    '<fieldset class="siac-modelos"><legend>Componentes da mistura</legend>'+
    MODELOS.map(m=>'<label><input type="checkbox" data-siac-comp="'+m.id+'" '+(["A","B","C"].includes(m.id)?"checked":"")+
      '><span class="siac-amostra-cor" style="background:'+(m.cor||"#b0bdc5")+'"></span>'+esc(m.nome)+
      '<input type="number" data-siac-massa="'+m.id+'" min=".01" max="1000" step=".01" value="'+m.massa+'" aria-label="Massa de '+esc(m.nome)+' em mg"></label>').join("")+
    '</fieldset><label>Eluente<select id="siac-eluente"><option value="faseA">Sistema eluente A</option><option value="faseB">Sistema eluente B</option></select></label>'+
    '<label>Fase estacionária<select id="siac-suporte"><option value="silica">Sílica · modelo</option><option value="alumina">Alumina · modelo</option></select></label></details>'+
    '<details><summary>Estrutura da coluna</summary><div class="siac-pares">'+
    [['siac-comprimento','Comprimento (mm)',80,20,2000,1],
     ['siac-diametro','Diâmetro (mm)',8,2,100,1],['siac-porosidade','Porosidade efetiva',.45,.1,.85,.05],
     ['siac-vazao','Vazão (mL/min)',.8,.01,100,.01],['siac-total','Volume de eluição (mL)',9,.1,1000,.1]].map(([id,label,value,min,max,step])=>
     '<label>'+label+'<input id="'+id+'" type="number" value="'+value+'" min="'+min+'" max="'+max+'" step="'+step+'"></label>').join("")+
     '</div><label>Aceleração didática<select id="siac-velocidade">'+
     [1,30,120,600,1800].map(x=>'<option value="'+x+'" '+(x===120?'selected':'')+'>'+x+'×</option>').join("")+
     '</select></label></details><button id="siac-montar" type="button" class="primary-btn">Montar coluna</button>'+
    '<details open><summary>Fracionamento e coleta</summary>'+
     '<p class="siac-hint">A programação dos frascos é independente da montagem da coluna. A coleta só começa durante a eluição.</p>'+
     '<label>Capacidade por frasco (mL)<input id="siac-capacidade" type="number" value="20" min=".1" max="1000" step=".1"></label>'+
     '<div id="siac-seletor" class="siac-seletor" role="group" aria-label="Programar intervalos dos dez frascos"></div>'+
     '<div class="siac-pares"><label>Início (mL)<input id="siac-inicio" type="number" min="0" max="1000" step=".1" placeholder="0,0"></label>'+
     '<label>Fim (mL)<input id="siac-fim" type="number" min=".1" max="1000" step=".1" placeholder="0,1"></label></div>'+
     '<div class="siac-acoes"><button id="siac-janela" class="secondary-btn" type="button">Definir coleta</button>'+
     '<button id="siac-limpar" class="quiet-btn" type="button">Limpar faixa</button></div>'+
     '<p id="siac-montagem-status" class="siac-hint" aria-live="polite"></p></details>';
 }
 function mount(){
  if(ready)return;
  if(!C||!F||!$("experiment")||!$("controls")||!$("ver-panel"))return;
  const left=$("dock-left-content")||$("controls").querySelector(".painel-conteudo");
  const right=$("dock-right-content")||$("ver-panel").querySelector(".painel-conteudo");
  if(!left||!right)return;
  const ui=document.createElement("section");
  ui.id="siac-montagem";ui.className="siac-montagem";
  ui.innerHTML='<h2>Montagem cromatográfica</h2>'+elements();
  left.prepend(ui);
  if(SIAC.catalogo?.interfaceMontagem){
    SIAC.catalogo.interfaceMontagem(ui,selecionado=>{
      catalogSelection=selecionado;
      catalogMode=selecionado.modo==="pesquisa";
      if(catalogMode)running=false;
      ui.classList.toggle("siac-catalogo-ativo",catalogMode);
      if(ready&&enabled)render();
    });
  }
  const ver=document.createElement("section");ver.id="siac-ver";ver.innerHTML=
   '<h2>Ver · Cromatografia</h2><p id="siac-ver-contexto" class="siac-ver-contexto" aria-live="polite"></p><div id="siac-modulos" class="siac-modulos"></div>'+
   '<div id="siac-ver-itens" class="siac-itens"></div><div id="siac-ver-dados" aria-live="polite"></div>';
  right.prepend(ver);
  const dados=document.createElement("section");
  dados.id="siac-dados";
  dados.className="siac-dados";
  dados.setAttribute("aria-label","Dados cromatográficos da investigação");
  right.prepend(dados);
  const stage=document.createElement("section");stage.id="siac-stage";stage.setAttribute("aria-label","Bancada cromatográfica");
  $("experiment").append(stage);
  ui.addEventListener("click",montagemClick);
  ver.addEventListener("click",verClick);
  ver.addEventListener("input",e=>{
   if(!catalogMode||!e.target.matches("[data-siac-medicao]"))return;
   SIAC.verDidatico?.setMedicao(e.target.dataset.siacMedicao,e.target.value);
   const check=SIAC.verDidatico?.validar();
   const feedback=$("siac-medicao-feedback");
   if(feedback&&check)feedback.textContent=check.ok?
    "Distâncias registradas. Abra Calcular → Calcular Rf.":check.motivo;
  });
  stage.addEventListener("click",stageClick);
  // Um capilar visível acompanha o ponteiro dentro da região do papel.
  // O gesto continua independente de mouse: toque e Enter ativam a aplicação.
  stage.addEventListener("pointermove",e=>{
   const target=e.target.closest?.("#siac-paper-target");
   if(!target||!capillary)return;
   const b=target.getBoundingClientRect();
   target.style.setProperty("--siac-capillary-x",
     (100*clamp((e.clientX-b.left)/b.width,.29,.70)).toFixed(1)+"%");
  });
  $("focus-tab").addEventListener("click",e=>{if(!enabled)return;e.stopImmediatePropagation();e.preventDefault();
   if(view==="foco")focus=VIEWS[(VIEWS.indexOf(focus)+1)%3];else view="foco";render();},true);
  $("overview-tab").addEventListener("click",e=>{if(!enabled)return;e.stopImmediatePropagation();e.preventDefault();
   if(view==="geral")group=GROUPS[(GROUPS.indexOf(group)+1)%2];else view="geral";render();},true);
  for(const b of [$("focus-tab"),$("overview-tab")]){
   // O renderizador SIAB legado pode reescrever rótulos e aria após a entrada.
   new MutationObserver(()=>sincronizarAbas())
     .observe(b,{attributes:true,attributeFilter:["disabled","aria-pressed"],
       childList:true,subtree:true,characterData:true});
  }
  $("siac-velocidade").addEventListener("change",()=>{speed=Number($("siac-velocidade").value);render();});
  document.addEventListener("siab:rota",route);
  // A visibilidade de Ver e Dados no SIAC independe de tubo ácido-base.
  // A doca e suas posições são mantidas pelo workspace original do SIAB.
  for(const id of ["workspace-ver","workspace-dados"]){
   const launcher=$(id);
   if(launcher)new MutationObserver(()=>{if(enabled&&launcher.hidden)launcher.hidden=false;})
     .observe(launcher,{attributes:true,attributeFilter:["hidden"]});
  }
  ready=true;
 }
 function route(){
  const available=SIAB.rota?.nome==="laboratorio";
  enabled=available;
  document.body.classList.toggle("siac-active",available);
  if($("controls-title"))$("controls-title").textContent=available?"Montagem":"Prateleira";
  if(available){
   mount();if(!col)build();
   for(const id of ["workspace-ver","workspace-dados","siac-ver","siac-dados"])
    if($(id))$(id).hidden=false;
   render();
  }
  else if(ready){
   // O conteúdo SIAC não deve vazar para docas de rotas legadas do SIAB.
   for(const id of ["siac-ver","siac-dados"])if($(id))$(id).hidden=true;
   // Restaurar rótulos convencionais do SIAB ao sair do laboratório cromatográfico.
   $("focus-tab").textContent="Tubo em foco";
   $("overview-tab").innerHTML='Visão geral <span id="overview-count"></span>';
  }
 }
 function configuration(){
  const comp=MODELOS.filter(x=>uiQuery('[data-siac-comp="'+x.id+'"]').checked).map(x=>({
    id:x.id,nome:x.nome,massaInicialMg:Number(uiQuery('[data-siac-massa="'+x.id+'"]').value),
    corVisivel:x.cor,deteccao:x.deteccao,
    retencao:{modo:"fator",k:RET[$("siac-eluente").value][$("siac-suporte").value][x.id]},
    pratosTeoricos:55,proveniencia:{classe:"hipotetico",fonte:"Cenário didático parametrizado"}
  }));
  if(!comp.length)throw Error("Selecione pelo menos um componente.");
  return {amostra:{id:"mistura-didatica",tipo:"hipotetica"},
   faseMovel:{id:$("siac-eluente").value},faseEstacionaria:{id:$("siac-suporte").value,indicadorFluorescente254:true},
   geometria:{comprimentoMm:Number($("siac-comprimento").value),
    diametroInternoMm:Number($("siac-diametro").value),porosidade:Number($("siac-porosidade").value)},
   vazaoMlMin:Number($("siac-vazao").value),volumeTotalMl:Number($("siac-total").value),componentes:comp};
 }
 const uiQuery=q=>$("siac-montagem").querySelector(q);
 function build(){
  // Montar a coluna altera APENAS o sistema cromatográfico. Uma corrida já
  // iniciada nunca perde amostras e alíquotas por um clique inadvertido.
  if(volume>0||running||development||capillaryLoading){
   status="A corrida contém dados. Para montar outra coluna, reinicie a corrida explicitamente. As janelas de coleta serão preservadas.";
   return;
  }
  try{
   const conf=configuration();
   const prepared=C.prepare(conf);
   // Validar primeiro: se alguma janela exceder o novo volume ou capacidade,
   // não alterar a coluna nem o plano; solicitar ajuste no Fracionamento.
   const updatedPlan=F.prepare({
    volumeTotalMl:conf.volumeTotalMl,
    capacidadeFrascoMl:plan?.capacidadeFrascoMl??Number($("siac-capacidade").value),
    resolucaoMl:plan?.resolucaoMl??.1,
    janelas:plan?.janelas??[]
   });
   col=prepared;plan=updatedPlan;
   // Mantém seleção e campos dos frascos, sem recriar a bancada de coleta.
   $("siac-inicio").max=conf.volumeTotalMl;
   $("siac-fim").max=conf.volumeTotalMl;
   status="Coluna montada. Programação dos frascos preservada ("+plan.janelas.length+" janelas).";
  }catch(e){status="Não foi possível montar a coluna sem alterar os frascos: "+e.message;}
 }
 function montagemClick(e){
  if(e.target.closest("#siac-montar")){
   if(catalogMode){status="Esta seleção possui dados planares de referência, mas não parâmetros de coluna homologados. Use a demonstração separadamente.";render();return;}
   build();render();return;
  }
  const chosen=e.target.closest("[data-fraction]");
  if(chosen){
   selected=chosen.dataset.fraction;
   const j=plan?.janelas.find(x=>x.frasco===selected);
   $("siac-inicio").value=j?.inicioMl??"";
   $("siac-fim").value=j?.fimMl??"";
   render();return;
  }
  if(e.target.closest("#siac-janela")){
   if(volume>0){status="A coleta já iniciou. Reinicie a corrida para editar os intervalos; o plano será preservado.";render();return;}
   try{
    // Capacidade é da vidraria, não da geometria ou do motor da coluna.
    const capacity=Number($("siac-capacidade").value);
    const candidate=F.prepare({volumeTotalMl:plan.volumeTotalMl,resolucaoMl:plan.resolucaoMl,
     capacidadeFrascoMl:capacity,janelas:plan.janelas});
    plan=F.setWindow(candidate,selected,Number($("siac-inicio").value),Number($("siac-fim").value));
    status=selected+" programado. A coleta começará quando a eluição alcançar a janela.";
   }catch(err){status=err.message;}
   render();return;
  }
  if(e.target.closest("#siac-limpar")){
   if(volume>0){status="Janelas bloqueadas durante a corrida.";render();return;}
   try{
    const candidate=F.prepare({volumeTotalMl:plan.volumeTotalMl,resolucaoMl:plan.resolucaoMl,
      capacidadeFrascoMl:Number($("siac-capacidade").value),janelas:plan.janelas});
    plan=F.clearWindow(candidate,selected);$("siac-inicio").value="";$("siac-fim").value="";
    status="Janela de "+selected+" retirada.";}catch(err){status=err.message;}
   render();
  }
 }
 function fraction(id,v=volume){
  const j=plan?.janelas.find(j=>j.frasco===id);
  if(!j||!col||v<=j.inicioMl)return null;
  const end=Math.min(j.fimMl,v);
  if(end<=j.inicioMl)return null;
  const dat=C.massBetween(col,j.inicioMl,end);
  if(dat.volumeMl<1e-9)return null;
  return {id,volumeMl:dat.volumeMl,componentesMg:dat.componentesMg,
   disponivelMl:Math.max(0,dat.volumeMl-(withdrawn[id]||0))};
 }
 function filled(){return Array.from({length:10},(_,i)=>fraction("F"+(i+1))).filter(Boolean);}
 function paper(id){
  return papers[id]||(papers[id]={etapa:"vazio",origem:null,frenteMm:0,tempoS:0,sinais:[],uv:[],aliquotaMg:{}});
 }
 function current(){return fraction(selected);}
 function choose(id,nextFocus){
  selected=id;
  const j=plan?.janelas.find(x=>x.frasco===id);
  $("siac-inicio").value=j?.inicioMl??"";$("siac-fim").value=j?.fimMl??"";
  if(nextFocus){focus=nextFocus;view="foco";}
  render();
 }
 function chromatographySVG(){
  const bands=C.observe(C.advance(col,volume/col.config.vazaoMlMin)).bandasVisiveis;
  let spots="";
  for(const b of bands)for(let i=0;i<b.distribuicao.length;i++){
   const p=b.distribuicao[i],max=Math.max(.00001,...b.distribuicao),rel=p/max;
   if(rel<.03)continue;
   spots+='<rect x="94" y="'+(101+i*206/b.distribuicao.length).toFixed(2)+
     '" width="60" height="'+(210/b.distribuicao.length+1).toFixed(2)+
     '" rx="3" fill="'+b.corVisivel+'" opacity="'+Math.min(.7,.7*Math.sqrt(rel)).toFixed(2)+'"/>';
  }
  return '<svg viewBox="0 0 260 420" role="img" aria-label="Coluna cromatográfica com reservatório, leito, suporte e torneira">'+
   '<defs><linearGradient id="sciac-glass"><stop stop-color="#9bd1dc" stop-opacity=".5"/><stop offset=".4" stop-color="#fff" stop-opacity=".3"/><stop offset="1" stop-color="#46879a" stop-opacity=".4"/></linearGradient>'+
   '<clipPath id="sciac-bed"><rect x="94" y="101" width="60" height="206"/></clipPath></defs>'+
   '<path d="M32 30V396M18 396H90M34 147H92" stroke="#678f9f" stroke-width="5" fill="none"/>'+
   '<path d="M98 24H150V76L141 95H107L98 76Z" fill="url(#sciac-glass)" stroke="#316c7e" stroke-width="3"/>'+
   '<path d="M102 52H146V73H102Z" fill="#a7dedb" opacity=".58"/>'+
   '<path d="M88 91H160V318L142 337H106L88 318Z" fill="#e9e0cd" stroke="#316c7e" stroke-width="4"/>'+
   '<rect x="94" y="101" width="60" height="206" fill="#f5ecdb"/>'+
   '<g clip-path="url(#sciac-bed)">'+spots+'</g>'+
   '<rect x="94" y="310" width="60" height="9" fill="#c8dbd6" stroke="#66979e"/>'+
   '<path d="M104 119V298" stroke="#fff" opacity=".8" stroke-width="3"/>'+
   '<path d="M114 337V357H136V337M126 357V379" stroke="#316c7e" stroke-width="3" fill="none"/>'+
   '<path d="M109 357H142" stroke="#44869b" stroke-width="5"/>'+
   '<text x="179" y="142" fill="#526f7c" font-size="11">Leito</text>'+
   '<text x="179" y="358" fill="#526f7c" font-size="11">Torneira</text>'+
   '</svg>';
 }
 function tubeSVG(f,showLabel=true){
  const available=f?.volumeMl||0,j=plan?.janelas.find(x=>x.frasco===f?.id),capacity=plan?.capacidadeFrascoMl||Math.max(1,available);
  const h=Math.min(110,120*available/capacity),components=f?.componentesMg||{};
  const visible=col.config.componentes.filter(c=>c.corVisivel&&components[c.id]>1e-10);
  const color=visible.length?visible.sort((a,b)=>components[b.id]-components[a.id])[0].corVisivel:"#b8d2dc";
  // O conteúdo do capilar é uma alíquota real do frasco; o comprimento desenhado
  // é didático e não representa uma altura de Jurin calibrada.
  const uptake=capillaryLoading?.id===f?.id?
   '<g class="siac-capillary-uptake" aria-label="Capilar aspirando amostra">'+
    '<path d="M87 4V176M94 4V176" stroke="#4b899a" stroke-width="1.8" fill="none"/>'+
    '<path d="M89 5V173" stroke="#fff" stroke-opacity=".86" stroke-width="1" fill="none"/>'+
    '<rect class="siac-capillary-fluid" x="89" y="122" width="3" height="53" rx="1" fill="'+color+'"/>'+
    '<ellipse cx="90.5" cy="175" rx="3.5" ry="2.5" fill="'+color+'" opacity=".65"/>'+
   '</g>':"";
  return '<svg viewBox="0 0 170 208" role="img" aria-label="Frasco '+esc(f?.id||selected)+' com eluato">'+
   '<defs><clipPath id="sciac-tube"><path d="M50 22V147Q50 177 85 177Q120 177 120 147V22Z"/></clipPath></defs>'+
   '<g clip-path="url(#sciac-tube)"><rect x="52" y="'+(177-h)+'" width="67" height="'+h+'" fill="'+color+'" opacity=".73"/></g>'+
   '<path d="M50 22V147Q50 177 85 177Q120 177 120 147V22M45 22H125" fill="none" stroke="#2c6880" stroke-width="4"/>'+
   uptake+
   (showLabel?'<text x="85" y="199" text-anchor="middle" font-size="15" fill="currentColor">'+esc(f?.id||selected)+'</text>':"")+'</svg>';
 }
 function paperSVG(p,id,large=true){
  const imerso=p.etapa==="desenvolvendo";
  const origemY=204,frenteY=origemY-Math.min(55,p.frenteMm)*1.7;
  const amostra=col.config.componentes.filter(c=>(p.aliquotaMg||{})[c.id]>1e-12);
  const dominante=amostra.filter(c=>c.corVisivel).sort((a,b)=>
   p.aliquotaMg[b.id]-p.aliquotaMg[a.id])[0];
  let marcas="";
  if(p.frenteMm>0){
   // A região úmida começa na base do suporte e cresce até a frente;
   // não surge apenas acima da linha de aplicação.
   marcas+='<rect class="siac-paper-wet" x="58" y="'+frenteY.toFixed(2)+
    '" width="101" height="'+(234-frenteY).toFixed(2)+
    '" fill="#8ebdc4" opacity=".22"/>';
   marcas+='<path d="M62 '+frenteY.toFixed(2)+
    'H156" stroke="#336e7d" stroke-width="1.5" stroke-dasharray="4 4"/>';
  }
  if(p.origem){
   const x=90+p.origem.x*2;
   marcas+='<ellipse class="'+(p.etapa==="aplicado"?"siac-spot-halo":"siac-spot-fixed")+
    '" cx="'+x+'" cy="'+origemY+
    '" rx="9" ry="4" fill="'+(dominante?.corVisivel||"#7f9da5")+'" opacity=".35"/>';
  }
  for(const m of p.sinais){
   marcas+='<ellipse cx="108" cy="'+(origemY-m.distanciaMm*1.7).toFixed(2)+
    '" rx="13" ry="6" fill="'+m.cor+'" opacity=".25"/>';
   marcas+='<ellipse cx="108" cy="'+(origemY-m.distanciaMm*1.7).toFixed(2)+
    '" rx="9" ry="4" fill="'+m.cor+'" opacity=".52"/>';
  }
  for(const m of p.uv){
   marcas+='<ellipse cx="108" cy="'+(origemY-m.distanciaMm*1.7).toFixed(2)+
    '" rx="11" ry="6" fill="#52677b" opacity=".55"/>';
  }
  // Câmara por trás do papel; a face frontal de vidro é desenhada DEPOIS
  // do suporte. A linha de aplicação fica acima do nível do solvente.
  const fundo=imerso?
   '<path d="M37 117H185L178 231Q176 246 160 246H62Q48 246 45 231Z" fill="#badde5" fill-opacity=".18"/>':"";
  const solvente=imerso?
   '<path d="M47 222Q111 218 177 222L174 235Q172 241 160 241H62Q52 241 50 235Z" fill="#69b8c7" opacity=".42"/>'+
   '<path d="M47 222Q111 218 177 222" fill="none" stroke="#368a9c" stroke-width="1.5"/>':"";
  const vidro=imerso?
   '<path d="M42 117L47 230Q48 245 62 246H161Q176 245 178 230L183 117" fill="#d0f3f7" fill-opacity=".12" stroke="#5795a7" stroke-width="3"/>'+
   '<ellipse cx="112.5" cy="117" rx="71" ry="6" fill="none" stroke="#75aab6" stroke-width="2.5"/>'+
   '<path d="M51 130L55 228" stroke="#fff" stroke-opacity=".52" stroke-width="4"/>':"";
  return '<svg viewBox="0 0 220 265" role="img" aria-label="Papel '+esc(id)+
   (imerso?", imerso no béquer com solvente abaixo da linha de origem":", fora da câmara")+
   ', '+esc(p.etapa)+'">'+fundo+
   '<rect x="57" y="19" width="103" height="215" rx="3" fill="'+
    (p.uv.length?"#d9f1e4":"#fff9e9")+'" stroke="#447687" stroke-width="2.5"/>'+
   '<path d="M62 204H156" stroke="#7b929c" stroke-width="2" stroke-dasharray="4 4"/>'+
   marcas+solvente+vidro+
   (large?'<text x="110" y="258" text-anchor="middle" fill="currentColor" font-size="14">'+
   esc(id)+'</text>':"")+'</svg>';
 }
 function drawGraph(){
  if(!col)return "";
  const profile=C.profile(col,{passos:210}).trechos;
  const seen=profile.filter(t=>(t.inicioMl+t.fimMl)/2<=volume+1e-10);
  const signal=t=>col.config.componentes.filter(c=>c.corVisivel&&c.deteccao.visivel)
    .reduce((sum,c)=>sum+(t.concentracoesMgPorMl[c.id]||0),0);
  const largest=Math.max(.01,...seen.map(signal));
  let d="";
  for(const t of seen){
   const x=38+492*(t.inicioMl+t.fimMl)/2/col.config.volumeTotalMl,y=105-90*signal(t)/largest;
   d+=(d?"L":"M")+x.toFixed(1)+" "+y.toFixed(1);
  }
  const windows=plan.janelas.map(j=>'<rect x="'+(38+492*j.inicioMl/col.config.volumeTotalMl)+'" y="11" width="'+(492*j.volumeMl/col.config.volumeTotalMl)+'" height="94" fill="#338f98" opacity=".15"/>').join("");
  return '<svg viewBox="0 0 550 131" role="img" aria-label="Sinal de saída já observado; sem identificação de substâncias">'+
   '<path d="M38 11V105H530" stroke="currentColor" stroke-opacity=".35" stroke-width="1" fill="none"/>'+windows+
   (d?'<path d="'+d+'" stroke="#2090a7" stroke-width="2.5" fill="none"/>':'')+
   '<path d="M'+(38+492*volume/col.config.volumeTotalMl)+' 11V105" stroke="#0b5472" stroke-width="1.5" stroke-dasharray="3 3"/>'+
   '<text x="38" y="123" fill="currentColor" font-size="11">0 mL</text>'+
   '<text x="530" y="123" text-anchor="end" fill="currentColor" font-size="11">'+fmt(col.config.volumeTotalMl,1)+' mL</text></svg>';
 }
 function spotlight(){
  if(focus==="coluna")return '<h2>Coluna em foco</h2><div class="siac-coluna-centro">'+chromatographySVG()+
   '<div class="siac-leituras-rapidas"><span>Volume <strong>'+fmt(volume)+' / '+fmt(col.config.volumeTotalMl,1)+' mL</strong></span>'+
   '<span>Tempo <strong>'+displaySec(volume/col.config.vazaoMlMin*60)+'</strong></span>'+
   '<span>Saída <strong>'+(plan?.janelas.find(j=>volume>=j.inicioMl&&volume<j.fimMl)?.frasco||"Descarte")+'</strong></span></div></div>';
  const f=current();
  if(!f)return '<h2>'+(focus==="tubo"?"Tubo em foco":"Amostra em foco")+'</h2>'+
   '<p class="siac-empty">Ainda não existe frasco montado nesta posição. Aguarde a eluição ou selecione um frasco já preenchido na Visão geral.</p>';
  if(focus==="tubo"){
   const aspirando=capillaryLoading?.id===f.id;
   return '<h2>Tubo em foco · '+f.id+'</h2><div class="siac-lado">'+tubeSVG(f)+
    '<div><p>'+fmt(f.volumeMl)+' mL recolhidos</p><p>'+fmt(f.disponivelMl)+' mL disponíveis</p>'+
    (aspirando?'<p class="siac-capillary-status" role="status">Capilar aspirando 0,01 mL</p>':
     '<p class="siac-hint">O capilar transfere uma alíquota do frasco para o papel.</p>')+
    '<button id="siac-retirar" type="button" class="primary-btn" '+(aspirando?'disabled':'')+
    '>'+(aspirando?'Aspirando…':'Carregar capilar (0,01 mL)')+'</button></div></div>';
  }
  const p=paper(f.id);
  // O aplicador acompanha o ponteiro, mas o suporte também pode ser acionado
  // por toque ou teclado, sem movimentação obrigatória do mouse.
  const presentes=col.config.componentes.filter(c=>
   c.corVisivel&&capillary?.masses?.[c.id]>1e-10).sort((a,b)=>
   capillary.masses[b.id]-capillary.masses[a.id]);
  // Soluções incolores recebem apenas o reflexo neutro do vidro.
  const capCor=presentes[0]?.corVisivel||"#b8d2dc";
  const aplicador=capillary?.id===selected?
   '<svg class="siac-capillary-applicator" viewBox="0 0 48 150" aria-hidden="true">'+
    '<path d="M20 2L21 115Q24 122 27 115L28 2" stroke="#347b92" stroke-width="2.4" fill="#c5eaf0" fill-opacity=".28"/>'+
    '<path d="M23 73V112Q24 117 25 112V73Z" fill="'+capCor+'" opacity=".76"/>'+
    '<path d="M24 117Q18 124 24 129Q30 124 24 117Z" fill="'+capCor+'" opacity=".56"/>'+
   '</svg>':"";
  return '<h2>Amostra em foco · P'+f.id.slice(1)+'</h2><div class="siac-lado">'+
   '<div id="siac-paper-target" tabindex="0" role="button" aria-label="Posicionar capilar na origem do papel" aria-disabled="'+(!capillary)+'">'+
   paperSVG(p,"P"+f.id.slice(1))+aplicador+'</div>'+
   '<div><p>Etapa: <strong>'+p.etapa+'</strong></p>'+
   '<p>'+(capillary?"Capilar carregado: clique na linha de origem do papel ou pressione Enter.":"Selecione o capilar no Tubo em foco.")+'</p>'+
   (p.etapa==="aplicado"?'<button id="siac-desenvolver" class="primary-btn">Mergulhar o papel na câmara e desenvolver</button>':"")+
   (p.etapa==="desenvolvendo"?'<label class="siac-tempo-desenvolvimento">Frente do solvente · '+displaySec(p.tempoS)+' / 00:01:00 (tempo simulado)<progress max="60" value="'+p.tempoS.toFixed(1)+'"></progress></label>':"")+
   (p.etapa==="desenvolvido"||p.etapa==="revelado"?'<button id="siac-uv" class="secondary-btn">Ligar luz UV 254 nm</button>':"")+
   '<p class="siac-hint">A análise só usa componentes que foram efetivamente coletados no frasco.</p></div></div>';
 }
 function overviewMarkup(){
  const fracs=filled();
  return '<div class="siac-overview-scene" aria-label="Visão geral da bancada">'+
   '<h2>Visão geral · '+(group==="frascos"?"Frascos preenchidos":"Papéis correspondentes")+'</h2>'+
  (fracs.length?'<div class="siac-grid" role="group" aria-label="'+
   (group==="frascos"?"Frascos coletados":"Papéis das frações")+'">'+fracs.map(f=>{
   const p=paper(f.id),isPaper=group==="papeis";
   return '<button class="siac-card" type="button" data-open-fraction="'+f.id+'" data-open-focus="'+(isPaper?"amostra":"tubo")+'">'+
     (isPaper?paperSVG(p,"P"+f.id.slice(1),false):tubeSVG(f,false))+
     '<strong>'+(isPaper?"P"+f.id.slice(1):f.id)+'</strong>'+
     '<small>'+(isPaper?esc(p.etapa):fmt(f.volumeMl)+" mL")+'</small></button>';
  }).join("")+'</div>':'<p class="siac-empty">Nenhum frasco preenchido até agora. Os tubos aparecerão conforme o eluato for coletado.</p>')+
  '</div>';
 }
 function sincronizarAbas(){
  if(!enabled)return;
  const a=$("focus-tab"),b=$("overview-tab");
  const focusLabel={coluna:"Coluna em foco",tubo:"Tubo em foco",amostra:"Amostra em foco"}[focus];
  if(a.textContent!==focusLabel)a.textContent=focusLabel;
  const groupLabel="Visão geral · "+(group==="frascos"?"Frascos":"Papéis")+" ";
  let text=[...b.childNodes].find(n=>n.nodeType===3);
  if(!text){text=document.createTextNode("");b.insertBefore(text,b.firstChild);}
  if(text.nodeValue!==groupLabel)text.nodeValue=groupLabel;
  if(!$("overview-count")){
   const span=document.createElement("span");span.id="overview-count";b.append(span);
  }
  if(a.getAttribute("aria-pressed")!==String(view==="foco"))
   a.setAttribute("aria-pressed",String(view==="foco"));
  if(b.getAttribute("aria-pressed")!==String(view==="geral"))
   b.setAttribute("aria-pressed",String(view==="geral"));
  if(a.disabled)a.disabled=false;
  if(b.disabled)b.disabled=false;
 }
 function renderStage(){
  const stage=$("siac-stage");if(!stage||!col)return;
  if(catalogMode){
   const a=catalogSelection?.substancia,m=catalogSelection?.sistema;
   const info=!a?"Escolha uma substância na doca Montagem. A fase móvel ficará disponível após a seleção.":
     !m?"Selecione um sistema eluente relacionado a "+esc(a.nome)+". Se nenhum estiver disponível, faltam condições científicas para sua indicação.":
     "Sistema documentado: "+esc(m.faseMovel)+". "+(m.rf===null?
       "O protocolo não informa Rf individual para esta substância.":
       "Rf bibliográfico "+fmt(m.rf,2)+"; consulte as condições na doca Montagem. A projeção não substitui medição.");
   stage.innerHTML='<section class="siac-catalogo-stage" aria-label="Planejamento científico">'+
    '<h2>'+(a?'Investigar · '+esc(a.nome):'Catálogo científico · 76 substâncias')+'</h2>'+
    '<p>'+info+'</p>'+
    '<p class="siac-hint">Os dados de literatura não são um motor validado de cromatografia em coluna. Nenhuma banda ou amostra real será simulada por suposição.</p>'+
    '<p class="siac-hint">Para estudar a mecânica de coluna e F1–F10 com parâmetros fictícios, selecione Demonstração na doca Montagem.</p></section>';
   return;
  }
  sincronizarAbas();
  const t=volume/col.config.vazaoMlMin*60;
  const all=col.config.tempoTotalMin*60;
  stage.innerHTML=(view==="foco"?spotlight():overviewMarkup())+
   '<div class="siac-relogio" role="group" aria-label="Controle da corrida cromatográfica">'+
   '<button id="siac-executar" class="primary-btn" type="button">'+
    (running?"Pausar":volume>=col.config.volumeTotalMl?"Finalizado":"Iniciar eluição")+'</button>'+
   '<button id="siac-reiniciar" class="secondary-btn" type="button" title="Reiniciar a corrida, preservando as janelas">Reiniciar</button>'+
   '<span aria-label="Tempo simulado de eluição">'+displaySec(t)+' / '+displaySec(all)+'</span></div>'+
   '<p id="siac-stage-status" class="siac-sr-only" role="status" aria-live="polite">'+esc(status)+'</p>';
  $("siac-executar").disabled=volume>=col.config.volumeTotalMl;
 }
 function renderMontagem(){
  if(!plan)return;
  if($("siac-montar"))$("siac-montar").disabled=catalogMode;
  $("siac-seletor").innerHTML=Array.from({length:10},(_,i)=>{
   const id="F"+(i+1),j=plan.janelas.find(x=>x.frasco===id),f=fraction(id);
   return '<button type="button" data-fraction="'+id+'" aria-pressed="'+(id===selected)+'" title="'+
    (j?"Janela "+fmt(j.inicioMl,1)+"–"+fmt(j.fimMl,1)+" mL":"Sem janela")+'">'+id+
    (f?' <small>●</small>':j?' <small>◌</small>':'')+'</button>';
  }).join("");
  $("siac-montagem-status").textContent=status;
  $("siac-janela").disabled=volume>0;$("siac-limpar").disabled=volume>0;
  $("siac-inicio").disabled=volume>0;$("siac-fim").disabled=volume>0;
  $("siac-capacidade").disabled=volume>0;
 }
 function renderVer(){
  const el=$("siac-ver");if(!el)return;
  if(catalogMode){
   const did=SIAC.verDidatico?.render(catalogSelection,SIAC.metrics);
   if(!did){
    $("siac-ver-contexto").textContent="Ferramentas de investigação indisponíveis";
    $("siac-modulos").innerHTML="";
    $("siac-ver-itens").innerHTML="";
    $("siac-ver-dados").textContent="O catálogo didático não foi carregado.";
    return;
   }
   $("siac-ver-contexto").textContent=did.contexto;
   $("siac-modulos").innerHTML=did.modulos;
   $("siac-ver-itens").innerHTML=did.itens;
   $("siac-ver-dados").innerHTML=did.conteudo;
   return;
  }
  const itens=availableItems();
  if(!itens.includes(item))item=itens[0];
  const labels={coluna:"Coluna",tubo:"Tubo "+selected,amostra:"Papel P"+selected.slice(1)};
  $("siac-ver-contexto").textContent=labels[focus]+" · "+({observar:"Observar",medir:"Medir",calcular:"Calcular"}[module]);
  $("siac-modulos").innerHTML=Object.keys(MODULES).map(m=>
   '<button type="button" data-module="'+m+'" aria-pressed="'+(module===m)+'">'+
   m.charAt(0).toUpperCase()+m.slice(1)+'</button>').join("");
  $("siac-ver-itens").innerHTML=itens.map(k=>'<button type="button" data-ver="'+k+
   '" aria-pressed="'+(item===k)+'">'+({
    uv:"Luz UV",referencias:"Padrões",regua:"Régua",especies:"Espécies",
    particulas:"Partículas",grafico:"Perfil de eluição",tempo:"Cronômetro",
    vazao:"Vazão",janelas:"Janelas",retencao:"Retenção",recuperacao:"Recuperação",
    rf:"Fator Rf",volume:"Volume",aparencia:"Aparência",bandas:"Bandas"
   }[k]||k)+'</button>').join("");
  const p=papers[selected];
  const descricoes={
   aparencia:"Observe somente a aparência visível na cena.",
   bandas:"Bandas visíveis no suporte: não confirmam identidades.",
   especies:"Distribuição calculada de componentes-modelo, não observável diretamente.",
   particulas:"Representação didática calculada; não é microscopia experimental.",
   uv:"A observação em UV depende do detector e do suporte utilizado.",
   regua:"Medições da frente, origem e manchas no mesmo suporte.",
   volume:"Volume acumulado durante a eluição.",
   tempo:"Tempo decorrido e previsto da corrida.",
   vazao:"Vazão configurada para o eluente.",
   janelas:"Intervalos definidos para os frascos F1 a F10.",
   referencias:"Compare apenas padrões obtidos em condições compatíveis.",
   rf:"Rf = distância da mancha / distância da frente do solvente.",
   retencao:"Retenção derivada dos parâmetros hipotéticos do modelo.",
   recuperacao:"Recuperação de massa não equivale à pureza.",
   grafico:"Sinal de eluição observado até o volume atual, sem antecipar identidades."
  };
  const box=$("siac-ver-dados");
  let desc=descricoes[item]||"";
  if(item==="grafico"&&focus==="coluna"){
   box.innerHTML='<section class="siac-perfil" aria-label="Gráfico de eluição da coluna">'+
    '<h3>Eluição observada</h3>'+drawGraph()+
    '<p class="siac-ver-hint">'+desc+'</p></section>';
   return;
  }
  if(item==="rf"&&p?.frenteMm>0){
   desc+="\nFrente: "+fmt(p.frenteMm,1)+" mm. "+
    (p.sinais.concat(p.uv).length?p.sinais.concat(p.uv)
     .map(x=>"Rf "+fmt(x.distanciaMm/p.frenteMm,3)).join(" · "):"Nenhuma mancha detectada.");
  }
  if(item==="volume")desc+="\n"+fmt(volume)+" / "+fmt(col.config.volumeTotalMl,1)+" mL.";
  if(item==="tempo")desc+="\n"+displaySec(volume/col.config.vazaoMlMin*60)+" / "+
    displaySec(col.config.tempoTotalMin*60);
  if(item==="vazao")desc+="\n"+fmt(col.config.vazaoMlMin)+" mL/min.";
  if(item==="janelas")desc+="\n"+(plan.janelas.length?plan.janelas.map(j=>
    j.frasco+": "+fmt(j.inicioMl,1)+"–"+fmt(j.fimMl,1)+" mL").join("\n"):"Nenhuma janela programada.");
  box.textContent=desc;
 }

 function renderDados(){
  const el=$("siac-dados");
  if(!el||!col)return;
  if(catalogMode){
   const a=catalogSelection?.substancia,m=catalogSelection?.sistema;
   el.innerHTML='<h2>Dados · investigação</h2>'+
    '<p class="siac-dados-nota">Catálogo preliminar de 76 substâncias. O sistema móvel só é habilitado após a escolha da substância.</p>'+
    (a?'<p><strong>'+esc(a.nome)+'</strong></p>':'<p>Selecione uma substância.</p>')+
    (m?'<p>Fase móvel: '+esc(m.faseMovel)+'</p><p>Fase estacionária: '+esc(m.faseEstacionaria)+'</p>'+
      '<p>Detecção de referência: '+esc(m.detector)+'</p>'+
      '<p>Rf bibliográfico: '+(m.rf===null?'não disponível':fmt(m.rf,3))+'</p>'+
      '<p class="siac-hint">Dados preliminares; não existe fator k de coluna validado para esta associação.</p>':
     '<p>Não há experimento habilitado: o vínculo solvente–composto ainda precisa de revisão.</p>');
   return;
  }
  const c=col.config,p=paper(selected),f=current();
  const focoLabel={coluna:"Coluna cromatográfica",tubo:"Frasco "+selected,
   amostra:"Papel P"+selected.slice(1)}[focus];
  const dadosLinha=linhas=>'<dl class="siac-dados-lista">'+linhas.map(([a,b])=>
   '<div><dt>'+esc(a)+'</dt><dd>'+esc(b)+'</dd></div>').join("")+'</dl>';
  const tempo=displaySec(volume/c.vazaoMlMin*60);
  let html='<h2>Dados · '+esc(focoLabel)+'</h2>'+
   '<p class="siac-dados-nota">Cenário parametrizado hipotético. Valores calculados não constituem identificação química.</p>';
  if(focus==="coluna"){
   html+=dadosLinha([
    ["Volume eluído",fmt(volume)+" / "+fmt(c.volumeTotalMl,1)+" mL"],
    ["Tempo decorrido",tempo],
    ["Vazão configurada",fmt(c.vazaoMlMin)+" mL/min"],
    ["Fase móvel",c.faseMovel.id],
    ["Fase estacionária",c.faseEstacionaria.id],
    ["Leito",fmt(c.geometria.comprimentoMm,1)+" mm"],
    ["Diâmetro interno",fmt(c.geometria.diametroInternoMm,1)+" mm"]
   ]);
   const janelas=plan?.janelas||[];
   html+='<h3>Frações e janelas</h3>';
   html+=janelas.length?'<div class="siac-dados-scroll"><table class="siac-dados-tabela">'+
    '<thead><tr><th>Frasco</th><th>Janela (mL)</th><th>Coletado (mL)</th></tr></thead><tbody>'+
    janelas.map(j=>{
     const fr=fraction(j.frasco);
     return '<tr><th scope="row">'+esc(j.frasco)+'</th><td>'+
      fmt(j.inicioMl,1)+'–'+fmt(j.fimMl,1)+'</td><td>'+fmt(fr?.volumeMl||0)+'</td></tr>';
    }).join("")+'</tbody></table></div>':
    '<p class="siac-dados-vazio">Nenhuma janela programada.</p>';
  }else if(focus==="tubo"){
   html+=dadosLinha([
    ["Frasco",selected],
    ["Volume coletado",fmt(f?.volumeMl||0)+" mL"],
    ["Volume disponível",fmt(f?.disponivelMl||0)+" mL"],
    ["Alíquotas retiradas",fmt(withdrawn[selected]||0)+" mL"],
    ["Faixa de coleta",plan?.janelas.find(j=>j.frasco===selected)?
      fmt(plan.janelas.find(j=>j.frasco===selected).inicioMl,1)+"–"+
      fmt(plan.janelas.find(j=>j.frasco===selected).fimMl,1)+" mL":"Não programada"]
   ]);
   const masses=Object.entries(f?.componentesMg||{}).filter(([,m])=>m>0);
   if(masses.length){
    html+='<h3>Composição do modelo</h3>'+
     '<p class="siac-dados-nota">Estimativas por balanço de massa, sem identificação laboratorial.</p>'+
     '<div class="siac-dados-scroll"><table class="siac-dados-tabela"><thead>'+
     '<tr><th>Componente-modelo</th><th>Massa estimada (mg)</th></tr></thead><tbody>'+
     masses.map(([id,m])=>'<tr><th scope="row">'+esc(id)+'</th><td>'+fmt(m,4)+
     '</td></tr>').join("")+'</tbody></table></div>';
   }
  }else{
   html+=dadosLinha([
    ["Suporte","Papel P"+selected.slice(1)],
    ["Fração de origem",p.origem||selected],
    ["Etapa",p.etapa],
    ["Tempo no desenvolvimento",displaySec(p.tempoS)],
    ["Distância da frente",fmt(p.frenteMm,1)+" mm"]
   ]);
   const manchas=p.sinais.map(x=>({tipo:"Visível",dist:x.distanciaMm}))
    .concat(p.uv.map(x=>({tipo:"UV",dist:x.distanciaMm})));
   if(manchas.length&&p.frenteMm>0){
    html+='<h3>Manchas registradas</h3>'+
     '<div class="siac-dados-scroll"><table class="siac-dados-tabela"><thead><tr>'+
     '<th>Detecção</th><th>Distância (mm)</th><th>Rf do modelo</th></tr></thead><tbody>'+
     manchas.map(x=>'<tr><th scope="row">'+x.tipo+'</th><td>'+fmt(x.dist,1)+
      '</td><td>'+fmt(x.dist/p.frenteMm,3)+'</td></tr>').join("")+
     '</tbody></table></div>';
   }
  }
  el.innerHTML=html;
 }

 function render(){if(!enabled||!col)return;renderMontagem();renderStage();renderVer();renderDados();}
 function verClick(e){
  const m=e.target.closest("[data-module]"),v=e.target.closest("[data-ver]");
  if(catalogMode){
   if(m&&SIAC.verDidatico?.setModulo(m.dataset.module))render();
   else if(v&&SIAC.verDidatico?.setFerramenta(v.dataset.ver))render();
   return;
  }
  if(m&&MODULES[m.dataset.module]){module=m.dataset.module;item=availableItems()[0];render();}
  if(v){item=v.dataset.ver;render();}
 }
 function stageClick(e){
  if(catalogMode)return;
  const btn=e.target.closest("button");
  const pick=btn?.closest("[data-open-fraction]");
  if(pick){choose(pick.dataset.openFraction,pick.dataset.openFocus);return;}
  if(btn?.id==="siac-executar"){running=!running;lastFrame=0;render();return;}
  if(btn?.id==="siac-reiniciar"){running=false;lastFrame=0;volume=0;withdrawn={};papers={};capillary=null;capillaryLoading=null;development=null;
   status="Corrida reiniciada. Janelas preservadas; os frascos começam vazios.";render();return;}
  if(btn?.id==="siac-retirar"){
   if(capillaryLoading)return;
   const f=current();if(!f||f.disponivelMl<.01){status="Aguarde coleta suficiente para carregar o capilar.";render();return;}
   withdrawn[f.id]=(withdrawn[f.id]||0)+.01;
   capillary={id:f.id,volumeMl:.01,masses:Object.fromEntries(Object.entries(f.componentesMg)
    .map(([id,m])=>[id,m*.01/f.volumeMl]))};
   capillaryLoading={id:f.id,start:performance.now()};
   status="Aspirando uma alíquota de "+f.id+" por capilaridade.";render();return;
  }
  if(btn?.id==="siac-desenvolver"){
   const p=paper(selected);if(p.etapa!=="aplicado")return;
   p.etapa="desenvolvendo";p.tempoS=0;development={id:selected};status="Desenvolvimento cromatográfico em andamento.";render();return;}
  if(btn?.id==="siac-uv"){const p=paper(selected);if(!["desenvolvido","revelado"].includes(p.etapa))return;
   p.uv=Object.entries(p.aliquotaMg||{}).filter(([id,m])=>m>1e-12&&
    col.config.componentes.find(c=>c.id===id)?.deteccao.uv254)
    .map(([id,m])=>({distanciaMm:MODELOS.find(c=>c.id===id).rf*p.frenteMm}));
   p.etapa="revelado";status="UV aplicado: sinais hipotéticos, sem identificação confirmada.";render();return;}
  const target=e.target.closest("#siac-paper-target");
  if(target){const b=target.getBoundingClientRect();spotAt(Math.round(clamp((e.clientX-b.left)/b.width,0,1)*30));}
 }
 function spotPointer(e){
  const target=e.target.closest("#siac-paper-target");
  if(!target)return;
  const b=target.getBoundingClientRect();
  const x=clamp((e.clientX-b.left)/b.width,0,1);
  spotAt(Math.round(x*30));
 }
 function spotAt(x){
  if(focus!=="amostra"||!capillary){status="Carregue antes o capilar no Tubo em foco.";render();return;}
  if(capillary.id!==selected){status="Capilar e papel devem corresponder ao mesmo frasco.";render();return;}
  const p=paper(selected);
  if(p.etapa!=="vazio"&&p.etapa!=="aplicado"){status="O papel já foi desenvolvido.";render();return;}
  p.origem={x,tempoS:0};
  for(const [id,m] of Object.entries(capillary.masses))p.aliquotaMg[id]=(p.aliquotaMg[id]||0)+m;
  p.etapa="aplicado";capillary=null;
  status="Amostra aplicada em P"+selected.slice(1)+". Desenvolva para observar as manchas.";render();
 }
 function frame(now){
  if(capillaryLoading&&now-capillaryLoading.start>=1100){
   const id=capillaryLoading.id;capillaryLoading=null;
   if(enabled&&focus==="tubo"&&selected===id){focus="amostra";view="foco";}
   status="Capilar carregado de "+id+". Posicione a ponta na linha de origem.";
   render();
  }
  if(enabled&&col&&(running||development)){
   const dt=lastFrame?Math.min(.15,(now-lastFrame)/1000):0;lastFrame=now;
   if(running){
    const change=dt*speed/60*col.config.vazaoMlMin;
    volume=Math.min(col.config.volumeTotalMl,volume+change);
    if(volume>=col.config.volumeTotalMl){running=false;status="Eluição concluída.";}}
   if(development){
    const p=paper(development.id);
    // O desenvolvimento mantém um tempo didático observável, independente da
    // aceleração muito maior que pode ser usada na coleta da coluna.
    p.tempoS=Math.min(60,p.tempoS+dt*Math.min(speed,6));
    // Progressão visual idealizada proporcional a √t, consistente com a
    // parametrização provisória do motor planar, ainda sem calibração.
    p.frenteMm=55*Math.sqrt(p.tempoS/60);
    p.sinais=Object.entries(p.aliquotaMg||{}).filter(([id,m])=>m>1e-12&&
      col.config.componentes.find(c=>c.id===id)?.deteccao.visivel)
      .map(([id,m])=>({distanciaMm:MODELOS.find(x=>x.id===id).rf*p.frenteMm,
        cor:MODELOS.find(x=>x.id===id).cor}));
    if(p.tempoS>=60){
     p.etapa="desenvolvido";development=null;
     status="Papel retirado do béquer. Desenvolvimento finalizado; as manchas não confirmam identidades.";}}
   if(now-lastDraw>160||!running){
    // Preserva a animação de aspiração mesmo com a coluna ainda eluindo.
    if(!capillaryLoading)renderStage();
    renderVer();renderMontagem();renderDados();lastDraw=now;
   }
  }else lastFrame=0;
  requestAnimationFrame(frame);
 }
 function start(){
  mount();
  if(!ready)return;
  route();
  requestAnimationFrame(frame);
  const paperKeyboard=e=>{
   if(e.target?.id==="siac-paper-target"&&(e.key==="Enter"||e.key===" ")){
    e.preventDefault();spotAt(15);}
  };
  document.addEventListener("keydown",paperKeyboard);
 }
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(start,0));
 else setTimeout(start,0);
 return Object.freeze({get active(){return enabled;},get snapshot(){return {
   volumeMl:volume,visao:view,foco:focus,geral:group,selecionado:selected,
   modo:catalogMode?"pesquisa":"demonstracao",substanciaId:catalogSelection?.substanciaId||null,
   sistemaId:catalogSelection?.sistemaId||null,
   preenchidos:filled().map(f=>f.id),capilar:capillaryLoading?"aspirando":capillary?"carregado":"vazio",
   frenteMm:development?paper(development.id).frenteMm:null,
   preenchidosDetalhe:filled().map(f=>({id:f.id,volumeMl:f.volumeMl})),
   janelas:plan?.janelas.map(j=>({frasco:j.frasco,inicioMl:j.inicioMl,fimMl:j.fimMl}))||[],
   papeis:Object.fromEntries(Object.entries(papers).map(([id,p])=>[id,p.etapa]))
  };},render});
})();
