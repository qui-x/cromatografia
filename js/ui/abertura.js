"use strict";
/* SIAC — A Identidade das Cores Ocultas.
 * Vinheta: aplicação de amostras -> imersão -> ascensão do solvente ->
 * separação das bandas -> assinatura da marca.
 * Uma representação artística, não uma simulação quantitativa.
 * Mantém as preferências e o comportamento de pular do SIAB.
 */
SIAB.abertura = (() => {
  const CHAVE = "siac_abertura";
  const TEMPOS = Object.freeze({
    aplicar: 320, pontos: [580, 870, 1150], imergir: 1480,
    desenvolver: 1810, revelar: 4510, marca: 4940, sair: 6890
  });
  const timers = [];
  const amostras = Object.freeze([
    { x: 310, rotulo: "A", bandas: [
      { dist: 162, largo: 22, cor: "#16839A", atraso: 130 },
      { dist: 98, largo: 20, cor: "#D96C1F", atraso: 200 },
      { dist: 46, largo: 18, cor: "#2E9B8F", atraso: 270 }
    ] },
    { x: 378, rotulo: "B", bandas: [
      { dist: 188, largo: 21, cor: "#16839A", atraso: 230 },
      { dist: 114, largo: 19, cor: "#2E9B8F", atraso: 290 },
      { dist: 67, largo: 18, cor: "#D96C1F", atraso: 370 }
    ] },
    { x: 446, rotulo: "?", bandas: [
      { dist: 171, largo: 21, cor: "#16839A", atraso: 170 },
      { dist: 133, largo: 19, cor: "#D96C1F", atraso: 240 },
      { dist: 74, largo: 18, cor: "#2E9B8F", atraso: 320 }
    ] }
  ]);
  let ativa = false, elemento = null;

  function ligada() {
    try { return localStorage.getItem(CHAVE) !== "off"; }
    catch (_) { return true; }
  }
  function definir(ligar) {
    try { localStorage.setItem(CHAVE, ligar ? "on" : "off"); }
    catch (_) { /* ausência de armazenamento: preferência da visita */ }
  }
  function desenhar(caixa) {
    const svg = caixa.querySelector(".abertura-tubos");
    if (!svg) return;
    svg.setAttribute("viewBox", "0 0 760 455");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "Três amostras são depositadas no papel. O solvente sobe e os componentes se separam em bandas.");
    const trilhas = amostras.map((amostra, i) => {
      const bandas = amostra.bandas.map(b => `
        <g class="siac-ab-faixa" style="--ascensao:-${b.dist}px;--atraso:${b.atraso}ms">
          <ellipse cx="${amostra.x}" cy="322" rx="${b.largo+5}" ry="10" fill="${b.cor}" class="siac-ab-pigmento-nuvem"/>
          <path d="M${amostra.x-b.largo} 322
            Q${amostra.x-b.largo+3} 314 ${amostra.x} 315
            Q${amostra.x+b.largo-3} 314 ${amostra.x+b.largo} 322
            Q${amostra.x+b.largo-3} 330 ${amostra.x} 329
            Q${amostra.x-b.largo+3} 330 ${amostra.x-b.largo} 322Z"
            fill="${b.cor}" class="siac-ab-pigmento"/>
        </g>`).join("");
      return `<g class="siac-ab-trilha siac-ab-trilha-${i+1}">
        <text x="${amostra.x}" y="66" class="siac-ab-amostra-rotulo">${amostra.rotulo}</text>
        <circle cx="${amostra.x}" cy="322" r="6" class="siac-ab-ponto"/>
        ${bandas}
      </g>`;
    }).join("");
    const marcas = Array.from({length:8},(_,i) =>
      `<path d="M${270-(i%2?3:8)} ${96+i*30}h${i%2?4:9}" class="siac-ab-regua"/>`
    ).join("");
    svg.innerHTML = `
    <defs>
      <clipPath id="siac-ab-corte-papel"><rect x="274" y="74" width="208" height="303" rx="2"/></clipPath>
      <pattern id="siac-ab-fibras" width="21" height="19" patternUnits="userSpaceOnUse">
        <path d="M3 13l5-2M14 4l4 2" stroke="#D4C5AC" stroke-width=".6"/>
        <circle cx="11" cy="16" r=".65" fill="#D4C5AC"/>
      </pattern>
      <filter id="siac-ab-difusao" x="-30%" y="-80%" width="160%" height="260%">
        <feGaussianBlur stdDeviation="2.9"/>
      </filter>
    </defs>
    <rect x="16" y="16" width="728" height="419" rx="16" class="siac-ab-moldura"/>
    <path d="M40 402H720" class="siac-ab-mesa"/>
    <path d="M40 412H720" class="siac-ab-mesa-fina"/>
    <path d="M54 54h35M54 54v35M706 54h-35M706 54v35" class="siac-ab-cantoneira"/>
    <g class="siac-ab-frascos">
      <path d="M93 248v104a10 10 0 0 0 10 10h54a10 10 0 0 0 10-10V248" class="siac-ab-vidro"/>
      <path d="M88 248h84" class="siac-ab-vidro"/>
      <rect x="99" y="294" width="62" height="62" rx="5" fill="#16839A"/>
      <path d="M108 271h42M108 279h31" class="siac-ab-risco"/>
      <text x="130" y="387" class="siac-ab-legenda-menor">AMOSTRA</text>
      <rect x="83" y="119" width="96" height="66" rx="8" class="siac-ab-pote"/>
      <path d="M95 137h70M95 148h51M95 159h59" class="siac-ab-risco"/>
      <text x="131" y="111" class="siac-ab-legenda-menor">MISTURA</text>
    </g>
    <g class="siac-ab-coluna-lateral">
      <path d="M564 108h132M564 120h96" class="siac-ab-risco"/>
      <text x="565" y="94" class="siac-ab-legenda">FASE ESTACIONÁRIA</text>
      <path d="M564 265h132M564 277h96" class="siac-ab-risco"/>
      <text x="565" y="251" class="siac-ab-legenda">FASE MÓVEL</text>
      <text x="566" y="342" class="siac-ab-legenda-menor">SEPARAÇÃO</text>
      <text x="566" y="362" class="siac-ab-legenda-menor">POR AFINIDADE</text>
    </g>
    <g class="siac-ab-camara-fundo">
      <path d="M244 275v98a19 19 0 0 0 19 19h233a19 19 0 0 0 19-19v-98" class="siac-ab-contorno"/>
      <path d="M245 351h269v22a18 18 0 0 1-18 18H263a18 18 0 0 1-18-18Z" class="siac-ab-banho"/>
      <path d="M248 351h263" class="siac-ab-superficie"/>
    </g>
    <g class="siac-ab-papel-grupo">
      <rect x="271" y="71" width="214" height="311" rx="5" class="siac-ab-papel"/>
      <g clip-path="url(#siac-ab-corte-papel)">
        <rect x="274" y="74" width="208" height="303" fill="url(#siac-ab-fibras)"/>
        <rect x="275" y="110" width="206" height="241" class="siac-ab-umidade"/>
        ${trilhas}
        <path d="M284 322H472" class="siac-ab-origem"/>
        <path d="M278 322H478" class="siac-ab-frente"/>
        <g class="siac-ab-marcas">${marcas}</g>
      </g>
    </g>
    <g class="siac-ab-camara-frente">
      <path d="M242 275H517" class="siac-ab-borda-camara"/>
      <path d="M246 351H514" class="siac-ab-superficie"/>
    </g>
    <g class="siac-ab-capilar">
      <path d="M310 203V310" class="siac-ab-capilar-vidro"/>
      <path d="M310 281V310" class="siac-ab-capilar-amostra"/>
      <path d="M310 203v-16" class="siac-ab-capilar-tampa"/>
      <path d="M299 193h22" class="siac-ab-capilar-aro"/>
    </g>
    <g class="siac-ab-anotacoes">
      <path d="M494 133h49l16-12" class="siac-ab-anotacao-linha"/>
      <text x="562" y="120" class="siac-ab-anotacao-texto">FRENTE</text>
      <path d="M494 322h49l16 12" class="siac-ab-anotacao-linha"/>
      <text x="562" y="335" class="siac-ab-anotacao-texto">ORIGEM</text>
    </g>`;
  }
  function limpar() {
    timers.splice(0).forEach(clearTimeout);
    document.removeEventListener("keydown", encerrar, true);
    if (elemento) elemento.removeEventListener("pointerdown", encerrar);
  }
  function encerrar() {
    if (!ativa) return;
    ativa = false;
    limpar();
    const caixa = elemento;
    elemento = null;
    document.documentElement.dataset.abertura = "fim";
    if (!caixa) return;
    caixa.classList.add("saindo");
    setTimeout(() => caixa.remove(), 370);
  }
  function iniciar() {
    const caixa = document.getElementById("abertura");
    if (!caixa) return;
    const reduzir = Boolean(window.A11Y?.estado?.motion ||
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches);
    if (!ligada() || reduzir || getComputedStyle(caixa).display === "none") {
      caixa.remove();
      document.documentElement.dataset.abertura = "fim";
      return;
    }
    elemento = caixa;
    ativa = true;
    desenhar(caixa);
    caixa.addEventListener("pointerdown", encerrar);
    document.addEventListener("keydown", encerrar, true);
    timers.push(setTimeout(() => caixa.classList.add("siac-ab-aplicando"), TEMPOS.aplicar));
    TEMPOS.pontos.forEach((ms,i) => timers.push(setTimeout(() =>
      caixa.querySelector(`.siac-ab-trilha-${i+1}`)?.classList.add("siac-ab-aplicada"), ms)));
    timers.push(setTimeout(() => caixa.classList.add("siac-ab-imersa"), TEMPOS.imergir));
    timers.push(setTimeout(() => caixa.classList.add("siac-ab-desenvolvendo"), TEMPOS.desenvolver));
    timers.push(setTimeout(() => caixa.classList.add("siac-ab-revelada"), TEMPOS.revelar));
    timers.push(setTimeout(() => caixa.classList.add("com-marca"), TEMPOS.marca));
    timers.push(setTimeout(encerrar, TEMPOS.sair));
  }
  return Object.freeze({ iniciar, encerrar, definir, ligada, TEMPOS, amostras });
})();
SIAB.abertura.iniciar();
