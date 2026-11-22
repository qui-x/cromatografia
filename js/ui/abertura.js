"use strict";
/* SIAC: animação inicial de cromatografia planar.
   A cena demonstra separação de forma ilustrativa, não é o motor científico.
   Conserva o fluxo, o controle de movimento e a opção de pular do SIAB. */
SIAB.abertura = (() => {
  const CHAVE = "siac_abertura";
  const TEMPOS = Object.freeze({ desenvolver: 180, marca: 2350, sair: 3300 });
  const timers = [];
  let ativa = false;
  let caixaAtiva = null;

  function ligada() {
    try { return localStorage.getItem(CHAVE) !== "off"; }
    catch (_) { return true; }
  }
  function definir(ligar) {
    try { localStorage.setItem(CHAVE, ligar ? "on" : "off"); }
    catch (_) { /* preferência local indisponível */ }
  }
  function desenhar(caixa) {
    const svg = caixa.querySelector(".abertura-tubos");
    if (!svg) return;
    svg.setAttribute("viewBox", "0 0 400 215");
    svg.setAttribute("aria-label", "Separação ilustrativa de uma amostra em três bandas cromatográficas");
    svg.innerHTML = `<defs>
      <clipPath id="siac-ab-corte"><rect x="177" y="24" width="46" height="154" rx="2"/></clipPath>
    </defs>
    <rect x="174" y="21" width="52" height="158" rx="5" class="ab-crom-papel"/>
    <g clip-path="url(#siac-ab-corte)">
      <rect x="177" y="54" width="46" height="111" class="ab-crom-umida"/>
      <line x1="178" y1="163" x2="222" y2="163" class="ab-crom-frente"/>
      <ellipse cx="200" cy="150" rx="6" ry="4" class="ab-crom-amostra"/>
      <ellipse cx="200" cy="150" rx="16" ry="7" class="ab-crom-banda ab-crom-banda-1"/>
      <ellipse cx="200" cy="150" rx="14" ry="7" class="ab-crom-banda ab-crom-banda-2"/>
      <ellipse cx="200" cy="150" rx="13" ry="6" class="ab-crom-banda ab-crom-banda-3"/>
    </g>
    <line x1="180" y1="160" x2="220" y2="160" class="ab-crom-origem"/>
    <path d="M136 132V183q0 12 12 12h104q12 0 12-12v-51" class="ab-crom-camara"/>
    <path d="M139 170h122v11q0 11-11 11H150q-11 0-11-11Z" class="ab-crom-solvente"/>
    <path d="M143 116V76m-9 10 9-11 9 11" stroke="#81D9CE" fill="none" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="200" y="210" class="ab-crom-legenda">Desenvolvimento cromatográfico</text>`;
  }
  function limpar() {
    timers.splice(0).forEach(clearTimeout);
    document.removeEventListener("keydown", encerrar, true);
    if (caixaAtiva) caixaAtiva.removeEventListener("pointerdown", encerrar);
  }
  function encerrar() {
    if (!ativa) return;
    ativa = false;
    limpar();
    const caixa = caixaAtiva;
    caixaAtiva = null;
    document.documentElement.dataset.abertura = "fim";
    if (!caixa) return;
    caixa.classList.add("saindo");
    setTimeout(() => caixa.remove(), 360);
  }
  function iniciar() {
    const caixa = document.getElementById("abertura");
    if (!caixa) return;
    const reduzir = Boolean(
      window.A11Y?.estado?.motion ||
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches
    );
    if (!ligada() || reduzir || getComputedStyle(caixa).display === "none") {
      caixa.remove();
      document.documentElement.dataset.abertura = "fim";
      return;
    }
    caixaAtiva = caixa;
    ativa = true;
    desenhar(caixa);
    caixa.addEventListener("pointerdown", encerrar);
    document.addEventListener("keydown", encerrar, true);
    timers.push(setTimeout(() => caixa.classList.add("em-desenvolvimento"), TEMPOS.desenvolver));
    timers.push(setTimeout(() => caixa.classList.add("com-marca"), TEMPOS.marca));
    timers.push(setTimeout(encerrar, TEMPOS.sair));
  }
  return Object.freeze({ iniciar, encerrar, definir, ligada, TEMPOS });
})();
SIAB.abertura.iniciar();
