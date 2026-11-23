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
 const VIEWS=["coluna","tubo","amostra"],GROUPS=["frascos","papeis"],
 MODULES={explorar:["aparencia","bandas","especies","particulas","uv"],
  medir:["regua","volume","referencias"],calcular:["rf","retencao","recuperacao"]};
 let ready=false,enabled=false,col=null,plan=null,volume=0,speed=120,
  running=false,lastFrame=0,view="foco",focus="coluna",group="frascos",
  selected="F1",capillary=null,development=null,module="explorar",
  item="aparencia",papers={},withdrawn={},status="",lastDraw=0;
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
     ['siac-vazao','Vazão (mL/min)',.8,.01,100,.01],['siac-total','Volume de eluição (mL)',9,.1,1000,.1],
     ['siac-capacidade','Capacidade/fr. (mL)',20,.1,1000,.1]].map(([id,label,value,min,max,step])=>
     '<label>'+label+'<input id="'+id+'" type="number" value="'+value+'" min="'+min+'" max="'+max+'" step="'+step+'"></label>').join("")+
     '</div><label>Aceleração didática<select id="siac-velocidade">'+
     [1,30,120,600,1800].map(x=>'<option value="'+x+'" '+(x===120?'selected':'')+'>'+x+'×</option>').join("")+
     '</select></label></details><button id="siac-montar" type="button" class="primary-btn">Montar coluna</button>'+
    '<details open><summary>Fracionamento e coleta</summary>'+
     '<p class="siac-hint">Escolha os intervalos de F1 a F10. Os tubos só aparecem na bancada quando receberem eluato.</p>'+
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
  const ver=document.createElement("section");ver.id="siac-ver";ver.innerHTML=
   '<h2>Ver · Cromatografia</h2><div id="siac-modulos" class="siac-modulos"></div>'+
   '<div id="siac-ver-itens" class="siac-itens"></div><div id="siac-ver-dados" aria-live="polite"></div>';
  right.prepend(ver);
  const stage=document.createElement("section");stage.id="siac-stage";stage.setAttribute("aria-label","Bancada cromatográfica");
  $("experiment").append(stage);
  ui.addEventListener("click",montagemClick);
  ver.addEventListener("click",verClick);
  stage.addEventListener("click",stageClick);
  stage.addEventListener("pointerdown",spotPointer);
  $("focus-tab").addEventListener("click",e=>{if(!enabled)return;e.stopImmediatePropagation();e.preventDefault();
   if(view==="foco")focus=VIEWS[(VIEWS.indexOf(focus)+1)%3];else view="foco";render();},true);
  $("overview-tab").addEventListener("click",e=>{if(!enabled)return;e.stopImmediatePropagation();e.preventDefault();
   if(view==="geral")group=GROUPS[(GROUPS.indexOf(group)+1)%2];else view="geral";render();},true);
  for(const b of [$("focus-tab"),$("overview-tab")]){
   new MutationObserver(()=>{if(enabled&&b.disabled)b.disabled=false;}).observe(b,{attributes:true,attributeFilter:["disabled"]});
  }
  $("siac-velocidade").addEventListener("change",()=>{speed=Number($("siac-velocidade").value);render();});
  document.addEventListener("siab:rota",route);
  ready=true;
 }
 function route(){
  const available=SIAB.rota?.nome==="laboratorio";
  enabled=available;
  document.body.classList.toggle("siac-active",available);
  if(available){mount();if(!col)build();render();}
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
  running=false;lastFrame=0;
  try{
   const conf=configuration();const prepared=C.prepare(conf);
   const p=F.prepare({volumeTotalMl:conf.volumeTotalMl,capacidadeFrascoMl:Number($("siac-capacidade").value),resolucaoMl:.1});
   col=prepared;plan=p;volume=0;papers={};withdrawn={};capillary=null;development=null;
   view="foco";focus="coluna";selected="F1";
   $("siac-inicio").value="";$("siac-fim").value="";
   $("siac-inicio").max=conf.volumeTotalMl;$("siac-fim").max=conf.volumeTotalMl;
   status="Coluna montada. Defina as janelas de F1 a F10 em Montagem.";
  }catch(e){status=e.message;}
 }
 function montagemClick(e){
  if(e.target.closest("#siac-montar")){build();render();return;}
  const chosen=e.target.closest("[data-fraction]");
  if(chosen){
   selected=chosen.dataset.fraction;
   const j=plan?.janelas.find(x=>x.frasco===selected);
   $("siac-inicio").value=j?.inicioMl??"";
   $("siac-fim").value=j?.fimMl??"";
   render();return;
  }
  if(e.target.closest("#siac-janela")){
   if(volume>0){status="Para mudar as janelas após iniciar, monte uma nova corrida.";render();return;}
   try{
    plan=F.setWindow(plan,selected,Number($("siac-inicio").value),Number($("siac-fim").value));
    status=selected+" programado. A coleta começará quando a eluição alcançar a janela.";
   }catch(err){status=err.message;}
   render();return;
  }
  if(e.target.closest("#siac-limpar")){
   if(volume>0){status="Janelas bloqueadas durante a corrida.";render();return;}
   try{plan=F.clearWindow(plan,selected);$("siac-inicio").value="";$("siac-fim").value="";
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
  return papers[id]||(papers[id]={etapa:"vazio",origem:null,frenteMm:0,tempoS:0,sinais:[],uv:[]});
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
 function tubeSVG(f){
  const available=f?.volumeMl||0,j=plan?.janelas.find(x=>x.frasco===f?.id),capacity=plan?.capacidadeFrascoMl||Math.max(1,available);
  const h=Math.min(110,120*available/capacity),components=f?.componentesMg||{};
  const visible=col.config.componentes.filter(c=>c.corVisivel&&components[c.id]>1e-10);
  const color=visible.length?visible.sort((a,b)=>components[b.id]-components[a.id])[0].corVisivel:"#b8d2dc";
  return '<svg viewBox="0 0 170 208" role="img" aria-label="Frasco '+esc(f?.id||selected)+' com eluato">'+
   '<defs><clipPath id="sciac-tube"><path d="M50 22V147Q50 177 85 177Q120 177 120 147V22Z"/></clipPath></defs>'+
   '<g clip-path="url(#sciac-tube)"><rect x="52" y="'+(177-h)+'" width="67" height="'+h+'" fill="'+color+'" opacity=".73"/></g>'+
   '<path d="M50 22V147Q50 177 85 177Q120 177 120 147V22M45 22H125" fill="none" stroke="#2c6880" stroke-width="4"/>'+
   '<text x="85" y="199" text-anchor="middle" font-size="15" fill="currentColor">'+esc(f?.id||selected)+'</text></svg>';
 }
 function paperSVG(p,id,large=true){
  let marks='';
  if(p.origem)marks+='<ellipse cx="'+(90+p.origem.x*2)+'" cy="204" rx="5" ry="3" fill="#829aa1" opacity=".25"/>';
  if(p.frenteMm>0)marks+='<path d="M62 '+(204-p.frenteMm*1.7)+'H156" stroke="#336e7d" stroke-width="1.5" stroke-dasharray="4 4"/>';
  for(const m of p.sinais){marks+='<ellipse cx="108" cy="'+(204-m.distanciaMm*1.7)+'" rx="12" ry="5" fill="'+m.cor+'" opacity=".72"/>';}
  for(const m of p.uv){marks+='<ellipse cx="108" cy="'+(204-m.distanciaMm*1.7)+'" rx="11" ry="6" fill="#52677b" opacity=".58"/>';}
  return '<svg viewBox="0 0 220 265" role="img" aria-label="Papel '+id+' '+p.etapa+'">'+
   '<rect x="57" y="19" width="103" height="215" rx="3" fill="'+(p.uv.length?"#d9f1e4":"#fff9e9")+'" stroke="#447687" stroke-width="3"/>'+
   '<path d="M62 204H156" stroke="#7b929c" stroke-width="2" stroke-dasharray="4 4"/>'+marks+
   '<text x="110" y="252" text-anchor="middle" fill="currentColor" font-size="14">'+id+'</text></svg>';
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
   '<div><p>Volume eluído: <strong>'+fmt(volume)+' mL</strong> / '+fmt(col.config.volumeTotalMl,1)+' mL</p>'+
   '<p>Tempo de eluição: '+displaySec(volume/col.config.vazaoMlMin*60)+'</p>'+
   '<p>Saída agora: '+(plan?.janelas.find(j=>volume>=j.inicioMl&&volume<j.fimMl)?.frasco||"descarte")+'</p>'+
   '<p class="siac-hint">Programe as janelas e o frasco na Montagem.</p></div></div>';
  const f=current();
  if(!f)return '<h2>'+(focus==="tubo"?"Tubo em foco":"Amostra em foco")+'</h2>'+
   '<p class="siac-empty">Ainda não existe frasco montado nesta posição. Aguarde a eluição ou selecione um frasco já preenchido na Visão geral.</p>';
  if(focus==="tubo")return '<h2>Tubo em foco · '+f.id+'</h2><div class="siac-lado">'+tubeSVG(f)+
   '<div><p>'+fmt(f.volumeMl)+' mL recolhidos</p><p>'+fmt(f.disponivelMl)+' mL disponíveis</p>'+
   '<p class="siac-hint">O conteúdo é derivado do eluato que chegou ao frasco, sem identificar a substância.</p>'+
   '<button id="siac-retirar" type="button" class="primary-btn">Carregar capilar (0,01 mL)</button></div></div>';
  const p=paper(f.id);
  return '<h2>Amostra em foco · P'+f.id.slice(1)+'</h2><div class="siac-lado">'+
   '<div id="siac-paper-target" tabindex="0" role="button" aria-label="Posicionar capilar na origem do papel" aria-disabled="'+(!capillary)+'">'+
   paperSVG(p,"P"+f.id.slice(1))+'</div>'+
   '<div><p>Etapa: <strong>'+p.etapa+'</strong></p>'+
   '<p>'+(capillary?"Capilar carregado: clique na linha de origem do papel ou pressione Enter.":"Selecione o capilar no Tubo em foco.")+'</p>'+
   (p.etapa==="aplicado"||p.etapa==="desenvolvendo"?'<button id="siac-desenvolver" class="primary-btn">Desenvolver por 60 s (modelo)</button>':"")+
   (p.etapa==="desenvolvido"||p.etapa==="revelado"?'<button id="siac-uv" class="secondary-btn">Ligar luz UV 254 nm</button>':"")+
   '<p class="siac-hint">A análise só usa componentes que foram efetivamente coletados no frasco.</p></div></div>';
 }
 function overviewMarkup(){
  const fracs=filled();
  return '<h2>Visão geral · '+(group==="frascos"?"Frascos preenchidos":"Papéis correspondentes")+'</h2>'+
  (fracs.length?'<div class="siac-grid">'+fracs.map(f=>{
   const p=paper(f.id),isPaper=group==="papeis";
   return '<button class="siac-card" type="button" data-open-fraction="'+f.id+'" data-open-focus="'+(isPaper?"amostra":"tubo")+'">'+
     (isPaper?paperSVG(p,"P"+f.id.slice(1),false):tubeSVG(f))+
     '<strong>'+(isPaper?"P"+f.id.slice(1):f.id)+'</strong>'+
     '<small>'+(isPaper?esc(p.etapa):fmt(f.volumeMl)+" mL")+'</small></button>';
  }).join("")+'</div>':'<p class="siac-empty">Nenhum frasco preenchido até agora. Os tubos aparecerão conforme o eluato for coletado.</p>');
 }
 function renderStage(){
  const stage=$("siac-stage");if(!stage||!col)return;
  $("focus-tab").disabled=false;$("overview-tab").disabled=false;
  $("focus-tab").textContent={coluna:"Coluna em foco",tubo:"Tubo em foco",amostra:"Amostra em foco"}[focus];
  $("overview-tab").textContent="Visão geral · "+(group==="frascos"?"Frascos":"Papéis");
  $("focus-tab").setAttribute("aria-pressed",String(view==="foco"));
  $("overview-tab").setAttribute("aria-pressed",String(view==="geral"));
  const fracs=filled();
  if(fracs.length&&!fraction(selected)){selected=fracs[0].id;}
  const t=volume/col.config.vazaoMlMin*60,all=col.config.tempoTotalMin*60;
  stage.innerHTML='<header class="siac-stage-head"><span>Investigação cromatográfica · '+(view==="foco"?"Foco":"Visão geral")+'</span>'+
   '<strong>'+fmt(volume)+' / '+fmt(col.config.volumeTotalMl,1)+' mL</strong></header>'+
   (view==="foco"?spotlight():overviewMarkup())+
   '<section class="siac-perfil"><h3>Sinal de eluição observado</h3>'+drawGraph()+
   '<p class="siac-hint">Sinal óptico combinado do modelo. Nenhuma identidade ou pico futuro é revelado.</p></section>'+
   '<div class="siac-relogio"><button id="siac-executar" class="primary-btn" type="button">'+
    (running?"Pausar":volume>=col.config.volumeTotalMl?"Finalizado":"Iniciar eluição")+'</button>'+
   '<button id="siac-reiniciar" class="secondary-btn" type="button">Reiniciar corrida</button>'+
   '<span>Tempo simulado '+displaySec(t)+' / '+displaySec(all)+' · '+speed+'×</span></div>'+
   '<p id="siac-stage-status" role="status" aria-live="polite">'+esc(status)+'</p>';
  $("siac-executar").disabled=volume>=col.config.volumeTotalMl;
 }
 function renderMontagem(){
  if(!plan)return;
  $("siac-seletor").innerHTML=Array.from({length:10},(_,i)=>{
   const id="F"+(i+1),j=plan.janelas.find(x=>x.frasco===id),f=fraction(id);
   return '<button type="button" data-fraction="'+id+'" aria-pressed="'+(id===selected)+'" title="'+
    (j?"Janela "+fmt(j.inicioMl,1)+"–"+fmt(j.fimMl,1)+" mL":"Sem janela")+'">'+id+
    (f?' <small>●</small>':j?' <small>◌</small>':'')+'</button>';
  }).join("");
  $("siac-montagem-status").textContent=status;
  $("siac-janela").disabled=volume>0;$("siac-limpar").disabled=volume>0;
  $("siac-inicio").disabled=volume>0;$("siac-fim").disabled=volume>0;
 }
 function renderVer(){
  const el=$("siac-ver");if(!el)return;
  $("siac-modulos").innerHTML=Object.keys(MODULES).map(m=>'<button type="button" data-module="'+m+
   '" aria-pressed="'+(module===m)+'">'+m.charAt(0).toUpperCase()+m.slice(1)+'</button>').join("");
  $("siac-ver-itens").innerHTML=MODULES[module].map(k=>'<button type="button" data-ver="'+k+
    '" aria-pressed="'+(item===k)+'">'+({uv:"Luz UV",referencias:"Padrões",regua:"Régua",especies:"Espécies",particulas:"Partículas"}[k]||k)+'</button>').join("");
  const p=papers[selected];
  let desc={
   aparencia:"Aparência da coluna, do eluato e do papel: somente o que é visível.",
   bandas:"Bandas cromáticas visíveis e sua evolução no leito. Não equivalem a identificação.",
   especies:"Distribuição interna prevista das espécies-modelo. Não observável a olho nu.",
   particulas:"Representação calculada das partículas: não é uma imagem microscópica medida.",
   uv:"A detecção UV depende do papel desenvolvido e das propriedades declaradas.",
   regua:"Medição da origem, da frente do solvente e das manchas no mesmo suporte.",
   volume:"Vazão, volume acumulado e tempo do experimento.",
   referencias:"Comparações precisam de padrões equivalentes. Rf isolado não identifica substâncias.",
   rf:"Rf = distância da mancha ÷ distância da frente. Disponível apenas após revelação.",
   retencao:"Volume morto e fator de retenção calculado a partir dos parâmetros do modelo.",
   recuperacao:"Recuperação: massa coletada / massa inicial × 100. Não é pureza."
  }[item];
  if(item==="rf"&&p?.frenteMm>0)desc+="\nFrente: "+fmt(p.frenteMm,1)+" mm. "+
   (p.sinais.concat(p.uv).length?p.sinais.concat(p.uv).map(x=>"Rf "+fmt(x.distanciaMm/p.frenteMm,3)).join(" · "):"Nenhuma mancha detectada.");
  if(item==="volume")desc+="\n"+fmt(volume)+" mL em "+displaySec(volume/col.config.vazaoMlMin*60)+
   " · vazão "+fmt(col.config.vazaoMlMin)+" mL/min.";
  $("siac-ver-dados").textContent=desc;
 }
 function render(){if(!enabled||!col)return;renderMontagem();renderStage();renderVer();}
 function verClick(e){
  const m=e.target.closest("[data-module]"),v=e.target.closest("[data-ver]");
  if(m){module=m.dataset.module;item=MODULES[module][0];render();}
  if(v){item=v.dataset.ver;render();}
 }
 function stageClick(e){
  const btn=e.target.closest("button");
  const pick=btn?.closest("[data-open-fraction]");
  if(pick){choose(pick.dataset.openFraction,pick.dataset.openFocus);return;}
  if(btn?.id==="siac-executar"){running=!running;lastFrame=0;render();return;}
  if(btn?.id==="siac-reiniciar"){running=false;lastFrame=0;volume=0;withdrawn={};papers={};capillary=null;development=null;
   status="Corrida reiniciada. Janelas preservadas; os frascos começam vazios.";render();return;}
  if(btn?.id==="siac-retirar"){const f=current();if(!f||f.disponivelMl<.01){status="Aguarde coleta suficiente para carregar o capilar.";render();return;}
   withdrawn[f.id]=(withdrawn[f.id]||0)+.01;capillary={id:f.id,volumeMl:.01,masses:f.componentesMg};
   focus="amostra";render();return;}
  if(btn?.id==="siac-desenvolver"){
   const p=paper(selected);if(p.etapa!=="aplicado")return;
   p.etapa="desenvolvendo";p.tempoS=0;development={id:selected};status="Desenvolvimento cromatográfico em andamento.";render();return;}
  if(btn?.id==="siac-uv"){const p=paper(selected);if(!["desenvolvido","revelado"].includes(p.etapa))return;
   const f=current(),all=Object.entries(f?.componentesMg||{});
   p.uv=all.filter(([id,m])=>m>1e-9&&col.config.componentes.find(c=>c.id===id)?.deteccao.uv254)
    .map(([id,m])=>({distanciaMm:MODELOS.find(c=>c.id===id).rf*p.frenteMm}));
   p.etapa="revelado";status="UV aplicado: sinais hipotéticos, sem identificação confirmada.";render();return;}
  if(e.target.closest("#siac-paper-target"))spotAt(15);
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
  p.origem={x,tempoS:0};p.etapa="aplicado";capillary=null;
  status="Amostra aplicada em P"+selected.slice(1)+". Desenvolva para observar as manchas.";render();
 }
 function frame(now){
  if(enabled&&col&&(running||development)){
   const dt=lastFrame?Math.min(.15,(now-lastFrame)/1000):0;lastFrame=now;
   if(running){
    const change=dt*speed/60*col.config.vazaoMlMin;
    volume=Math.min(col.config.volumeTotalMl,volume+change);
    if(volume>=col.config.volumeTotalMl){running=false;status="Eluição concluída.";}}
   if(development){
    const p=paper(development.id);
    p.tempoS=Math.min(60,p.tempoS+dt*speed);
    p.frenteMm=55*p.tempoS/60;
    if(p.tempoS>=60){
     p.etapa="desenvolvido";development=null;
     const f=fraction(selected);
     p.sinais=Object.entries(f?.componentesMg||{}).filter(([id,m])=>m>1e-9&&col.config.componentes.find(c=>c.id===id)?.deteccao.visivel)
      .map(([id,m])=>({distanciaMm:MODELOS.find(x=>x.id===id).rf*p.frenteMm,cor:MODELOS.find(x=>x.id===id).cor}));
     status="Desenvolvimento finalizado; manchas visíveis não identificam espécies.";}}
   if(now-lastDraw>160||!running){renderStage();renderVer();renderMontagem();lastDraw=now;}
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
   preenchidos:filled().map(f=>f.id),papeis:Object.fromEntries(Object.entries(papers).map(([id,p])=>[id,p.etapa]))
  };},render});
})();
