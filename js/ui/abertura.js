"use strict";
/* SIAC — A Identidade das Cores Ocultas | abertura artística v4.
 * Três amostras em três béqueres independentes, com cromatografia planar
 * ilustrativa e encerramento SIAB: símbolo central, assinatura e fade-out.
 * A animação NÃO é o motor científico: as frações de migração são artísticas.
 * Conserva controles de acessibilidade, pular e armazenamento do SIAB.
 */
SIAB.abertura = (() => {
  const CHAVE = "siac_abertura";
  const FIM = 6950, INICIO_MIGRACAO = 1560, FIM_MIGRACAO = 4560;
  const LARGURA = 1060, ALTURA = 515, ORIGEM = 342, FRENTE_MAX = 192;
  const CENTROS = [191, 530, 869];
  const AMOSTRAS = Object.freeze([
    { id:"A", nome:"TINTA", cor:"#334155", frentes:0.98, atraso:0,
      bandas:[
        { rf:.86, cor:"#009E73", nome:"Verde-azulado", larg:29, rastro:.14 },
        { rf:.56, cor:"#0072B2", nome:"Azul", larg:25, rastro:.23 },
        { rf:.29, cor:"#E69F00", nome:"Laranja", larg:25, rastro:.29 }
      ] },
    { id:"B", nome:"PIGMENTOS", cor:"#4D7C0F", frentes:1.00, atraso:90,
      bandas:[
        { rf:.79, cor:"#EA580C", nome:"Carotenos", larg:29, rastro:.15 },
        { rf:.51, cor:"#EAB308", nome:"Xantofilas", larg:25, rastro:.27 },
        { rf:.32, cor:"#15803D", nome:"Clorofila a", larg:28, rastro:.24 },
        { rf:.16, cor:"#4D7C0F", nome:"Clorofila b", larg:24, rastro:.32 }
      ] },
    { id:"C", nome:"CORANTES", cor:"#334155", frentes:1.02, atraso:175,
      bandas:[
        { rf:.89, cor:"#38BDF8", nome:"Ciano", larg:26, rastro:.16 },
        { rf:.64, cor:"#009E73", nome:"Esmeralda", larg:28, rastro:.20 },
        { rf:.38, cor:"#E69F00", nome:"Âmbar", larg:25, rastro:.31 }
      ] }
  ]);
  const tempos = Object.freeze({
    entrada: [0,510], aplicar:[420,1460], imersao:[1390,1790],
    separacao:[INICIO_MIGRACAO,FIM_MIGRACAO], observar:[4530,5160],
    identidade:[5100,6180], saida:FIM
  });
  let caixa = null, svg = null, inicio = 0, frame = 0, fechamento = null;
  let ativa = false, refs = [];
  const clamp = n => Math.max(0,Math.min(1,n));
  const faixa = (t,a,b) => clamp((t-a)/(b-a));
  const suave = v => v*v*(3-2*v);
  const decrescer = v => suave(v); // entrada e saída suaves; sem salto na velocidade
  function ligada() {
    try { return localStorage.getItem(CHAVE) !== "off"; }
    catch (_) { return true; }
  }
  function definir(v) {
    try { localStorage.setItem(CHAVE, v ? "on":"off"); }
    catch (_) { /* armazenamento indisponível */ }
  }
  // Cálculo geométrico independente do relógio e do dispositivo.
  function quadro(tempo) {
    const entrada = suave(faixa(tempo,0,520));
    const imersao = suave(faixa(tempo,1390,1790));
    const revelar = suave(faixa(tempo,5100,5960));
    const assinatura = suave(faixa(tempo,5480,6220));
    return {
      entrada, imersao, revelar, assinatura,
      placas: AMOSTRAS.map(a => {
        const u = faixa(tempo - a.atraso,INICIO_MIGRACAO,FIM_MIGRACAO);
        const desenvolvimento = decrescer(u);
        const avancou = FRENTE_MAX * a.frentes * desenvolvimento;
        const frenteY = ORIGEM-avancou;
        return {
          id:a.id, u, frenteY,
          bandas:a.bandas.map(b => ({
            y:ORIGEM-avancou*b.rf, rf:b.rf, cor:b.cor, largura:b.larg,
            traco:b.rastro, visivel:clamp(u*7), deslocamento:avancou*b.rf
          }))
        };
      })
    };
  }
  function definicoes() {
    // Ampliar a escala tonal de cada analito, sem atribuir uma nova substância
    // a cada tom: o núcleo concentrado dissolve-se na superfície clara.
    const misturar = (cor, alvo, t) => "#" + [1,3,5].map(i =>
      Math.round(parseInt(cor.slice(i,i+2),16)*(1-t) +
        parseInt(alvo.slice(i,i+2),16)*t).toString(16).padStart(2,"0")
    ).join("");
    const pigmentos = AMOSTRAS.flatMap((a,i) =>
      a.bandas.flatMap((b,j) => [
        `<radialGradient id="siac-v4-mancha-${i}-${j}" cx="46%" cy="45%" r="100%" fx="42%" fy="40%" color-interpolation="sRGB">
          <stop offset="0%" stop-color="${misturar(b.cor,"#1A2B30",.12)}" stop-opacity=".74"/>
          <stop offset="10%" stop-color="${b.cor}" stop-opacity=".70"/>
          <stop offset="22%" stop-color="${misturar(b.cor,"#FFFFFF",.08)}" stop-opacity=".62"/>
          <stop offset="36%" stop-color="${misturar(b.cor,"#FFFFFF",.18)}" stop-opacity=".50"/>
          <stop offset="50%" stop-color="${misturar(b.cor,"#FFFFFF",.30)}" stop-opacity=".36"/>
          <stop offset="64%" stop-color="${misturar(b.cor,"#FFFFFF",.46)}" stop-opacity=".23"/>
          <stop offset="78%" stop-color="${misturar(b.cor,"#FFFFFF",.62)}" stop-opacity=".12"/>
          <stop offset="90%" stop-color="${misturar(b.cor,"#FFFFFF",.78)}" stop-opacity=".05"/>
          <stop offset="100%" stop-color="${misturar(b.cor,"#FFFFFF",.90)}" stop-opacity="0"/>
        </radialGradient>`,
        `<linearGradient id="siac-v4-rastro-${i}-${j}" x1="0" x2="0" y1="0" y2="1" color-interpolation="sRGB">
          <stop offset="0%" stop-color="${misturar(b.cor,"#1A2B30",.06)}" stop-opacity=".22"/>
          <stop offset="14%" stop-color="${b.cor}" stop-opacity=".20"/>
          <stop offset="30%" stop-color="${misturar(b.cor,"#FFFFFF",.16)}" stop-opacity=".16"/>
          <stop offset="48%" stop-color="${misturar(b.cor,"#FFFFFF",.32)}" stop-opacity=".11"/>
          <stop offset="66%" stop-color="${misturar(b.cor,"#FFFFFF",.50)}" stop-opacity=".07"/>
          <stop offset="84%" stop-color="${misturar(b.cor,"#FFFFFF",.72)}" stop-opacity=".025"/>
          <stop offset="100%" stop-color="${misturar(b.cor,"#FFFFFF",.88)}" stop-opacity="0"/>
        </linearGradient>`
      ])
    ).join("");
    // O depósito inicial é uma região de concentração difusa, não um círculo.
    // Cada amostra recebe o próprio gradiente, seguindo sua cor de partida.
    const depositos=AMOSTRAS.map((amostra,i)=>`
      <radialGradient id="siac-v4-deposito-${i}" cx="45%" cy="44%" r="82%" fx="40%" fy="39%">
        <stop offset="0%" stop-color="${amostra.cor}" stop-opacity=".48"/>
        <stop offset="19%" stop-color="${amostra.cor}" stop-opacity=".40"/>
        <stop offset="43%" stop-color="${misturar(amostra.cor,"#FFFFFF",.18)}" stop-opacity=".27"/>
        <stop offset="66%" stop-color="${misturar(amostra.cor,"#FFFFFF",.42)}" stop-opacity=".13"/>
        <stop offset="85%" stop-color="${misturar(amostra.cor,"#FFFFFF",.70)}" stop-opacity=".045"/>
        <stop offset="100%" stop-color="${misturar(amostra.cor,"#FFFFFF",.85)}" stop-opacity="0"/>
      </radialGradient>`).join("");
    return `
      <defs>
        <pattern id="siac-v4-papel-fibra" width="17" height="19" patternUnits="userSpaceOnUse">
          <path d="M3 7l4-1M10 14l3-1M12 4l2 1" stroke="#E6E4E0" stroke-width=".48" fill="none"/>
          <circle cx="7" cy="15" r=".6" fill="#E2E0DA"/>
        </pattern>
        <linearGradient id="siac-v4-umidade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#38BDF8" stop-opacity="0"/>
          <stop offset="5%" stop-color="#38BDF8" stop-opacity=".08"/>
          <stop offset="16%" stop-color="#38BDF8" stop-opacity=".16"/>
          <stop offset="48%" stop-color="#BAE6FD" stop-opacity=".19"/>
          <stop offset="100%" stop-color="#38BDF8" stop-opacity=".22"/>
        </linearGradient>
        <linearGradient id="siac-v4-solvente" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#38BDF8" stop-opacity=".72"/>
          <stop offset="44%" stop-color="#168DA7" stop-opacity=".88"/>
          <stop offset="100%" stop-color="#0B5472" stop-opacity=".98"/>
        </linearGradient>
        <filter id="siac-v4-borda-difusa" x="-50%" y="-100%" width="200%" height="300%">
          <feGaussianBlur stdDeviation="3.8"/>
        </filter>
        <filter id="siac-v4-absorvido" x="-25%" y="-75%" width="150%" height="250%">
          <feGaussianBlur stdDeviation="1.15"/>
        </filter>
        ${CENTROS.map((cx,i) => `
          <clipPath id="siac-v4-clip-${i}">
            <rect x="${cx-65}" y="100" width="130" height="289" rx="2"/>
          </clipPath>`).join("")}
        ${pigmentos}
        ${depositos}
      </defs>
    `;
  }
  function construirBanda(cx,i,j,b) {
    // A dispersão é diferente em cada placa, mas sempre reprodutível.
    // O formato acompanha o tamanho da banda, sem elipses uniformes.
    const escala=(b.larg/28).toFixed(3);
    const assimetria=(1+0.045*Math.sin(i*4+j*2)).toFixed(3);
    const inclinacao=((i*3+j*7)%9-4)*.6;
    return `
      <g class="siac-v4-componente" data-banda="${i}-${j}">
        <path class="siac-v4-trilha-nevoa" data-nevoa="${i}-${j}"
          fill="url(#siac-v4-rastro-${i}-${j})" filter="url(#siac-v4-borda-difusa)"/>
        <path class="siac-v4-trilha" data-trilha="${i}-${j}"
          fill="url(#siac-v4-rastro-${i}-${j})"/>
        <g class="siac-v4-manchas" data-mancha="${i}-${j}">
          <g class="siac-v4-forma-organica"
            transform="rotate(${inclinacao}) scale(${escala} ${assimetria})">
          <path class="siac-v4-halo-absorvido"
            d="M-41 -3 C-37 -13 -21 -23 -6 -20 C8 -24 26 -15 37 -8
              C45 0 37 12 25 17 C13 22 -5 17 -15 20
              C-30 15 -42 8 -41 -3Z"
            fill="url(#siac-v4-mancha-${i}-${j})" opacity=".34"
            filter="url(#siac-v4-borda-difusa)"/>
          <path class="siac-v4-pigmento-absorvido"
            d="M-29 -3 C-27 -9 -17 -13 -8 -12 C0 -17 12 -11 21 -8
              C29 -4 30 2 24 8 C15 15 4 10 -5 13
              C-17 10 -28 6 -29 -3Z"
            fill="url(#siac-v4-mancha-${i}-${j})" opacity=".75"
            filter="url(#siac-v4-absorvido)"/>
          </g>
        </g>
      </g>`;
  }
  function construirPlaca(a,i) {
    const x = CENTROS[i], papelX=x-65, len=130;
    const manchas=a.bandas.map((b,j)=>construirBanda(x,i,j,b)).join("");
    return `
      <g class="siac-v4-conjunto" data-placa="${a.id}" style="--siac-papel:${i===1?"#FAF8F5":"#F8FAFC"}">
        <g class="siac-v4-identificacao">
          <text x="${x}" y="41" class="siac-v4-numero">${a.id}</text>
          <text x="${x}" y="61" class="siac-v4-nome">${a.nome}</text>
        </g>
        <g class="siac-v4-bequer">
          <path d="M${x-108} 175h216m-209 1v226a18 18 0 0 0 18 18h164a18 18 0 0 0 18-18V176"
            class="siac-v4-vidro"/>
          <path d="M${x-99} 372h198v29a17 17 0 0 1-17 17h-164a17 17 0 0 1-17-17Z"
            fill="url(#siac-v4-solvente)" class="siac-v4-poco-solvente"/>
          <path d="M${x-98} 372Q${x-51} 370 ${x} 372T${x+98} 372"
            class="siac-v4-menisco"/>
          <path d="M${x-94} 222v139M${x+93} 220v115" class="siac-v4-reflexo-vidro"/>
          <path d="M${x+78} 300h10M${x+78} 323h10M${x+78} 347h10"
            class="siac-v4-graduacao"/>
        </g>
        <g class="siac-v4-papel" data-papel="${i}">
          <rect x="${papelX}" y="98" width="${len}" height="289" rx="3" class="siac-v4-folha"/>
          <g clip-path="url(#siac-v4-clip-${i})">
            <rect x="${papelX+3}" y="101" width="124" height="283" fill="url(#siac-v4-papel-fibra)"/>
            <rect data-umidade="${i}" x="${papelX+3}" y="382" width="124" height="0"
              fill="url(#siac-v4-umidade)"/>
            <path data-frente="${i}" d="" class="siac-v4-frente"/>
            ${manchas}
            <path d="M${papelX+10} ${ORIGEM}h110" class="siac-v4-origem"/>
            <g class="siac-v4-regua">
              ${Array.from({length:8},(_,k)=>`<path d="M${papelX+5} ${138+k*25}h${k%2?4:9}"/>`).join("")}
            </g>
            <g data-deposito="${i}" class="siac-v4-deposito"
              transform="translate(${x} ${ORIGEM})">
              <path d="M-22 -2 C-20 -9 -9 -13 3 -11
                C13 -12 21 -7 23 2 C19 9 8 12 -5 11
                C-14 10 -22 5 -22 -2Z"
                fill="url(#siac-v4-deposito-${i})"
                filter="url(#siac-v4-absorvido)"/>
              <path d="M-29 -1 C-26 -12 -9 -17 6 -15
                C17 -14 29 -8 30 2 C25 14 10 17 -4 15
                C-19 13 -28 8 -29 -1Z"
                fill="url(#siac-v4-deposito-${i})" opacity=".28"
                filter="url(#siac-v4-borda-difusa)"/>
            </g>
          </g>
          <path d="M${papelX+7} 106v6M${papelX+123} 106v6" class="siac-v4-folha-detalhe"/>
        </g>
        <g class="siac-v4-capilar" data-capilar="${i}">
          <path d="M${x-5} 93V${ORIGEM-6}" class="siac-v4-capilar-vidro"/>
          <path d="M${x-5} ${ORIGEM-20}V${ORIGEM-6}" class="siac-v4-capilar-tinta"
            stroke="${a.cor}"/>
          <path d="M${x-13} 89h16" class="siac-v4-capilar-cabeca"/>
        </g>

      </g>`;
  }
  function desenhar(el) {
    svg=el.querySelector(".abertura-tubos");
    if(!svg)return;
    svg.setAttribute("viewBox",`0 0 ${LARGURA} ${ALTURA}`);
    svg.setAttribute("preserveAspectRatio","xMidYMid meet");
    svg.setAttribute("role","img");
    svg.setAttribute("aria-label",
      "Três béqueres independentes com amostras A, B e C. Cada placa desenvolve bandas e rastros cromatográficos distintos.");
    svg.innerHTML = definicoes() + `
      <g class="siac-v4-cena">
        <path d="M41 430H1019" class="siac-v4-bancada"/>
        <path d="M41 439H1019" class="siac-v4-bancada-secundaria"/>
        ${AMOSTRAS.map(construirPlaca).join("")}
        <g class="siac-v4-assinatura-simbolo">
          <rect x="497" y="113" width="66" height="162" rx="5" fill="#F4E9D8" stroke="#1F2D3D" stroke-width="3"/>
          <path d="M503 137H557" stroke="#0B5472" stroke-width="2.5" stroke-dasharray="5 4"/>
          <rect x="506" y="167" width="48" height="13" rx="5" fill="#168DA7"/>
          <rect x="506" y="194" width="48" height="13" rx="5" fill="#D79B32"/>
          <rect x="506" y="221" width="48" height="13" rx="5" fill="#3EAA76"/>
          <path d="M502 254H558" stroke="#1F2D3D" stroke-width="2"/>
          <path d="M476 242v26q0 18 18 18h72q18 0 18-18v-26" fill="none"
            stroke="#81D9CE" stroke-width="5" stroke-linecap="round"/>
        </g>
      </g>
    `;
    refs=AMOSTRAS.map((a,i)=>({
      papel:svg.querySelector(`[data-papel="${i}"]`),
      conjunto:svg.querySelector(`[data-placa="${a.id}"]`),
      frente:svg.querySelector(`[data-frente="${i}"]`),
      molhado:svg.querySelector(`[data-umidade="${i}"]`),
      deposito:svg.querySelector(`[data-deposito="${i}"]`),
      capilar:svg.querySelector(`[data-capilar="${i}"]`),
      bandas:a.bandas.map((_,j)=>({
        grupo:svg.querySelector(`[data-mancha="${i}-${j}"]`),
        rastro:svg.querySelector(`[data-trilha="${i}-${j}"]`),
        nevoa:svg.querySelector(`[data-nevoa="${i}-${j}"]`)
      }))
    }));
  }
  function aplicarTempo(t) {
    if(!caixa||!svg)return;
    const k=quadro(t);
    const corte=suave(faixa(t,5050,5900));
    const entrada=k.entrada;
    refs.forEach((r,i)=>{
      const a=AMOSTRAS[i], p=k.placas[i], cx=CENTROS[i];
      const aplicado=suave(faixa(t,530+i*255,760+i*255));
      
      // Cada placa entra na própria câmara, sem afetar as demais.
      r.papel.setAttribute("transform",`translate(0 ${(-34*(1-k.imersao)).toFixed(2)})`);
      r.conjunto.style.opacity=String(entrada*(1-corte));
      // Aplicação inicial impregnada: crescimento difuso e desaparecimento
      // progressivo à medida que a fase móvel carrega os componentes.
      r.deposito.style.opacity=String(aplicado*(1-suave(faixa(p.u,0,.38))));
      const espalhamento=.76+.24*aplicado;
      r.deposito.setAttribute("transform",
        `translate(${cx} ${ORIGEM}) scale(${espalhamento.toFixed(3)} ${(.82+.18*aplicado).toFixed(3)})`);
      // O capilar se aproxima, toca a linha de origem e sai antes da imersão.
      const entre=faixa(t,410+i*225,880+i*225);
      const inout=entre<.34?suave(entre/.34):1-suave((entre-.34)/.66);
      r.capilar.setAttribute("transform",`translate(0 ${(-73+45*inout).toFixed(2)})`);
      r.capilar.style.opacity=String(inout*.96*(1-corte));
      const frente=p.frenteY;
      // Frente e umidade são ancoradas na mesma coordenada.
      const h=383-frente;
      r.molhado.setAttribute("y",frente.toFixed(2));
      r.molhado.setAttribute("height",Math.max(0,h).toFixed(2));
      r.molhado.style.opacity=String(.68*suave(faixa(p.u,0,.18)));
      const wobble=Math.sin(t/370+i*1.6)*1.05*p.u;
      r.frente.setAttribute("d",`M${(cx-61)} ${(frente+wobble).toFixed(2)}q20 -1.6 40 0t41 0t41 0`);
      r.frente.style.opacity=String(.72*suave(faixa(p.u,0,.20)));
      r.bandas.forEach((b,j)=>{
        const v=p.bandas[j], orig=ORIGEM, y=v.y;
        // A banda permanece abaixo da frente do eluente, mas sua forma não
        // é um círculo rígido. O desvio é leve, determinístico e por analito.
        const leveJitterX=Math.sin(i*1.7+j*2.1)*1.4;
        const leveJitterY=Math.cos(i*1.2+j*1.8)*.8;
        b.grupo.setAttribute("transform",
          `translate(${(cx+leveJitterX).toFixed(2)} ${(y+leveJitterY).toFixed(2)})
          scale(${(.90+.14*suave(faixa(p.u,0,.7))).toFixed(3)}
                ${(.86+.18*suave(faixa(p.u,0,.7))).toFixed(3)})`);
        b.grupo.style.opacity=String(suave(faixa(p.u,0,.42)));

        // A trilha é um vestígio de concentração, não uma haste geométrica.
        // A largura decresce em direção à origem e o contorno se dispersa.
        const startY=Math.min(orig-1,y+5.5);
        const endY=orig-1;
        const trailH=Math.max(0,endY-startY);
        const larguraTopo=Math.max(5.2,v.largura*.30);
        const larguraBase=Math.max(2.0,v.largura*.11);
        const x=cx+leveJitterX;
        const caminho=trailH<.8?"":`
          M ${(x-larguraTopo).toFixed(2)} ${startY.toFixed(2)}
          C ${(x-larguraTopo*.86).toFixed(2)} ${(startY+trailH*.22).toFixed(2)}
            ${(x-larguraBase*1.1).toFixed(2)} ${(startY+trailH*.76).toFixed(2)}
            ${(x-larguraBase).toFixed(2)} ${endY.toFixed(2)}
          Q ${x.toFixed(2)} ${(endY+1.2).toFixed(2)}
            ${(x+larguraBase).toFixed(2)} ${endY.toFixed(2)}
          C ${(x+larguraBase*1.06).toFixed(2)} ${(startY+trailH*.72).toFixed(2)}
            ${(x+larguraTopo*.82).toFixed(2)} ${(startY+trailH*.20).toFixed(2)}
            ${(x+larguraTopo).toFixed(2)} ${startY.toFixed(2)}Z`;
        b.rastro.setAttribute("d",caminho);
        b.nevoa.setAttribute("d",caminho);
        const aparicao=suave(faixa(p.u,.03,.52));
        b.rastro.style.opacity=String((.16+v.traco*.18)*aparicao);
        b.nevoa.style.opacity=String((.12+v.traco*.14)*aparicao);
      });
    });
    // Encerramento ao estilo SIAB: desfazer cena e deixar apenas o símbolo central.
    const simbolo=svg.querySelector(".siac-v4-assinatura-simbolo");
    const aparicao=suave(faixa(t,5240,5700));
    simbolo.style.opacity=String(aparicao);
    const escala=(.82+.18*aparicao).toFixed(3);
    simbolo.setAttribute("transform",`translate(0 ${(55*aparicao).toFixed(2)}) translate(530 196) scale(${escala}) translate(-530 -196)`);
    const bancada=svg.querySelectorAll(".siac-v4-bancada,.siac-v4-bancada-secundaria");
    bancada.forEach(elemento=>elemento.style.opacity=String(1-corte));
    const cam=svg.querySelector(".siac-v4-cena");
    const zoom=1+0.018*suave(faixa(t,1670,4170));
    cam.setAttribute("transform",`translate(530 245) scale(${zoom.toFixed(4)}) translate(-530 -245)`);
    if(t>5500)caixa.classList.add("com-marca");
    else caixa.classList.remove("com-marca");
    caixa.dataset.tempo=String(Math.round(t));
    caixa.dataset.fase=t<1390?"aplicação":t<INICIO_MIGRACAO?"imersão":t<FIM_MIGRACAO?"migração":t<5100?"comparação":t<6170?"revelação":"assinatura";
  }
  function quadroAtual() {
    return caixa ? quadro(Number(caixa.dataset.tempo||0)) : null;
  }
  function limpar() {
    if(frame) cancelAnimationFrame(frame);
    frame=0;
    if(fechamento!==null)clearTimeout(fechamento);
    fechamento=null;
    document.removeEventListener("keydown",pular,true);
    caixa?.removeEventListener("pointerdown",pular);
  }
  function encerrar() {
    if(!ativa)return;
    ativa=false;
    limpar();
    const antigo=caixa;
    caixa=null;svg=null;refs=[];
    if(!antigo){
      document.documentElement.dataset.abertura="fim";
      return;
    }
    // Mesmo encerramento do SIAB: transição .35s; só depois ocultar a abertura.
    antigo.classList.add("saindo");
    setTimeout(()=>{
      antigo.remove();
      document.documentElement.dataset.abertura="fim";
    },350);
  }
  function pular(){encerrar()}
  function iniciar() {
    const el=document.getElementById("abertura");
    if(!el)return;
    const reduzir=Boolean(window.A11Y?.estado?.motion ||
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches);
    if(!ligada()||reduzir||getComputedStyle(el).display==="none"){
      el.remove();
      document.documentElement.dataset.abertura="fim";
      return;
    }
    caixa=el; ativa=true; el.classList.add("siac-v4");
    desenhar(el);
    el.addEventListener("pointerdown",pular);
    document.addEventListener("keydown",pular,true);
    inicio=performance.now();
    function mover(agora){
      if(!ativa)return;
      const t=Math.min(FIM,agora-inicio);
      aplicarTempo(t);
      if(t>=FIM){encerrar();return}
      frame=requestAnimationFrame(mover);
    }
    frame=requestAnimationFrame(mover);
  }
  return Object.freeze({iniciar,encerrar,definir,ligada,tempos,quadro,quadroAtual,AMOSTRAS});
})();
SIAB.abertura.iniciar();
