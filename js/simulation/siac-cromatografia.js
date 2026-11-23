"use strict";
/* SIAC — motor cromatográfico planar isolado v0.1
 * Não usa nem substitui ainda o motor legado SIAB; não executa no index.html.
 * Modelo de equilíbrio linear idealizado parametrizado, não calibração universal.
 * Probabilidade = dispersão/replicatas, NÃO sorteio arbitrário da química.
 */
(function instalar(raiz, fabricar) {
  const motor = fabricar();
  if (typeof module === "object" && module.exports) module.exports = motor;
  if (raiz) {
    raiz.SIAC = raiz.SIAC || {};
    raiz.SIAC.chromatography = motor;
  }
})(typeof globalThis === "object" ? globalThis : null, function criarMotor() {
  const VERSION = "0.1.0";
  const TECNICAS = ["papel", "ccd"];
  const DETECTORES = ["visivel", "uv254", "uv365"];
  function falhar(mensagem) { throw new RangeError("SIAC: " + mensagem); }
  function numero(x, rotulo, minimo, maximo = Infinity) {
    if (typeof x !== "number" || !Number.isFinite(x) || x < minimo || x > maximo) {
      falhar(rotulo + " fora dos limites [" + minimo + ", " + maximo + "]");
    }
    return x;
  }
  function identificacao(x, rotulo) {
    if (typeof x !== "string" || !x.trim()) falhar(rotulo + " deve ser texto não vazio");
    return x.trim();
  }
  function objeto(x, rotulo) {
    if (!x || typeof x !== "object" || Array.isArray(x)) falhar(rotulo + " deve ser um objeto");
    return x;
  }
  const fixar = x => {
    if (x && typeof x === "object" && !Object.isFrozen(x)) {
      Object.values(x).forEach(fixar);
      Object.freeze(x);
    }
    return x;
  };
  const copiar = x => JSON.parse(JSON.stringify(x));
  const limitar = (x,a,b) => Math.max(a, Math.min(b,x));
  function conferirEstado(estado) {
    objeto(estado,"estado");
    if (estado.versao !== VERSION || !estado.config || !Array.isArray(estado.config.componentes)) {
      falhar("estado incompatível com o motor planar v" + VERSION);
    }
    return estado;
  }
  function preparar(entrada) {
    const c = objeto(entrada,"configuração");
    const tecnica = identificacao(c.tecnica,"técnica").toLowerCase();
    if (tecnica === "coluna") falhar("coluna exige um motor independente; Rf planar não se aplica");
    if (!TECNICAS.includes(tecnica)) falhar("técnica suportada: papel ou ccd");
    const amostra = objeto(c.amostra,"amostra");
    identificacao(amostra.id,"amostra.id");
    const suporte = objeto(c.faseEstacionaria,"fase estacionária");
    const eluente = objeto(c.faseMovel,"fase móvel");
    identificacao(suporte.id,"faseEstacionaria.id");
    identificacao(eluente.id,"faseMovel.id");
    const geometria = objeto(c.geometria,"geometria");
    const comprimento = numero(geometria.comprimentoMm,"comprimentoMm",1);
    const origem = numero(geometria.origemMm,"origemMm",0);
    const margem = numero(geometria.margemSuperiorMm,"margemSuperiorMm",0);
    if (origem + margem >= comprimento) falhar("não há extensão útil acima da origem");
    const frente = objeto(c.frente,"frente");
    const capilaridade = numero(frente.coeficienteCapilarMmPorRaizS,
      "coeficienteCapilarMmPorRaizS",Number.MIN_VALUE);
    const maximo = comprimento - origem - margem;
    const relacaoFases = c.relacaoFases === undefined ? null :
      numero(c.relacaoFases,"relacaoFases",Number.MIN_VALUE);
    if (!Array.isArray(c.componentes) || !c.componentes.length) falhar("componentes obrigatórios");
    const ids = new Set();
    const avisos = ["Modelo planar didático idealizado; parâmetros não calibrados não são previsões experimentais."];
    const componentes = c.componentes.map((v,i) => {
      objeto(v,"componente " + i);
      const id = identificacao(v.id,"componentes[" + i + "].id");
      if (ids.has(id)) falhar("componente duplicado: " + id);
      ids.add(id);
      const temReferencia = v.rfReferencia !== undefined;
      const temParticao = v.kDistribuicao !== undefined;
      if (temReferencia === temParticao) {
        falhar("componente " + id + ": escolha exatamente rfReferencia ou kDistribuicao");
      }
      let rf, mecanismo;
      if (temReferencia) {
        rf=numero(v.rfReferencia, id + ".rfReferencia", Number.MIN_VALUE, 0.999999);
        mecanismo="referencia_planar";
      } else {
        const k=numero(v.kDistribuicao,id + ".kDistribuicao",0);
        if (relacaoFases === null) falhar("relacaoFases é exigida no modelo de partição");
        rf=1/(1+k*relacaoFases);
        if (!(rf>0 && rf<1)) falhar(id + ": parâmetros sem retenção finita");
        mecanismo="particao_linear_idealizada";
      }
      const sigma=numero(v.larguraInicialMm ?? 0.5,id + ".larguraInicialMm",0);
      const d=numero(v.dispersaoMm2PorS ?? 0,id + ".dispersaoMm2PorS",0);
      const teor=numero(v.fracaoRelativa ?? 1,id + ".fracaoRelativa",0,1);
      const det=objeto(v.deteccao || {},"deteccao de "+id);
      for (const modo of DETECTORES) {
        if (det[modo]!==undefined && typeof det[modo]!=="boolean") {
          falhar(id + ": deteccao." + modo + " deve ser booleano");
        }
      }
      const prov = v.proveniencia ? copiar(objeto(v.proveniencia,"proveniência de "+id)) :
        {classe:"hipotetico",fonte:"Parâmetro fornecido na configuração"};
      if (!["medicao","estimativa","hipotetico"].includes(prov.classe)) {
        falhar(id + ": proveniencia.classe inválida");
      }
      if (prov.classe === "medicao" && (!prov.fonte || !prov.condicoes)) {
        falhar(id + ": medição requer fonte e condições experimentais");
      }
      if (prov.classe !== "medicao") avisos.push(id + ": retenção hipotética/estimada; não tratar como medida.");
      if (v.dispersaoMm2PorS === undefined) avisos.push(id + ": dispersão não parametrizada; largura só inicial.");
      return {id, nome:v.nome || id, rf, mecanismo, larguraInicialMm:sigma,
        dispersaoMm2PorS:d, fracaoRelativa:teor, deteccao:copiar(det),
        proveniencia:prov};
    });
    const config = fixar({
      tecnica, amostra:copiar(amostra), faseEstacionaria:copiar(suporte),
      faseMovel:copiar(eluente), geometria:{comprimentoMm:comprimento,
        origemMm:origem,margemSuperiorMm:margem},
      frente:{coeficienteCapilarMmPorRaizS:capilaridade,limiteMm:maximo},
      temperaturaC:c.temperaturaC===undefined ? null :
        numero(c.temperaturaC,"temperaturaC",-273.15,300),
      relacaoFases,componentes,avisos
    });
    return fixar({versao:VERSION,etapa:"preparado",tempoS:0,frenteMm:0,
      config,eventos:[{tipo:"preparo",tempoS:0}]});
  }
  function avancar(estado,deltaS) {
    conferirEstado(estado);
    numero(deltaS,"deltaS",0);
    const c=estado.config;
    const vmax=c.frente.limiteMm;
    const a=c.frente.coeficienteCapilarMmPorRaizS;
    const tMax=(vmax/a)**2;
    const t=Math.min(tMax,estado.tempoS+deltaS);
    const frente=Math.min(vmax,a*Math.sqrt(t));
    const etapa=t>=tMax ? "finalizado" : t>0 ? "desenvolvendo" : "preparado";
    const eventos=estado.eventos.concat([{tipo:"avanco",tempoS:t,deltaEfetivoS:t-estado.tempoS}]);
    return fixar({versao:VERSION,etapa,tempoS:t,frenteMm:frente,config:c,eventos});
  }
  function tipoSinal(c,detector,estacionaria) {
    if (detector==="visivel") return c.deteccao.visivel ? "cor_visivel" : null;
    if (detector==="uv254") {
      if (!estacionaria.indicadorFluorescente254) return null;
      return c.deteccao.uv254 ? "extincao_indicador" : null;
    }
    return c.deteccao.uv365 ? "fluorescencia" : null;
  }
  function conferirDetector(detector) {
    if (!DETECTORES.includes(detector)) falhar("detector inválido");
    return detector;
  }
  function observar(estado,opcoes={}) {
    conferirEstado(estado);
    const detector=conferirDetector(opcoes.detector || "visivel");
    const f=estado.frenteMm;
    const sinais=estado.config.componentes.flatMap(c=>{
      const sinal=tipoSinal(c,detector,estado.config.faseEstacionaria);
      if (!sinal || f<=0 || c.fracaoRelativa<=0) return [];
      const pos=f*c.rf;
      const sigma=Math.sqrt(c.larguraInicialMm**2 + 2*c.dispersaoMm2PorS*estado.tempoS);
      return [{componenteId:c.id,nome:c.nome,distanciaMm:pos,rfIdeal:c.rf,
        sigmaMm:sigma,amplitudeRelativa:c.fracaoRelativa,
        tipoSinal:sinal,proveniencia:c.proveniencia}];
    });
    const sobreposicoes=[];
    for(let i=0;i<sinais.length;i++)for(let j=i+1;j<sinais.length;j++){
      const a=sinais[i],b=sinais[j];
      if(Math.abs(a.distanciaMm-b.distanciaMm)<2*(a.sigmaMm+b.sigmaMm)){
        sobreposicoes.push([a.componenteId,b.componenteId]);
      }
    }
    return {tecnica:estado.config.tecnica,detector,tempoS:estado.tempoS,
      frenteMm:f, unidade:"mm",sinais, sobreposicoes,
      observacoes:sobreposicoes.length ? ["Possível coeluição/sobreposição: não inferir identificação por cor ou Rf."] : [],
      alertasModelo:estado.config.avisos.slice()};
  }
  function medir(estado,instrumento={}) {
    const res=numero(instrumento.resolucaoMm ?? 0.1,"resolucaoMm",Number.MIN_VALUE);
    const observado=observar(estado,{detector:instrumento.detector || "visivel"});
    const quantizar=x=>Math.round(x/res)*res;
    const frente=quantizar(observado.frenteMm);
    return {instrumento:"regua",detector:observado.detector,unidade:"mm",
      resolucaoMm:res,frenteMm:frente,
      manchas:observado.sinais.map(s=>({componenteId:s.componenteId,
        distanciaMm:quantizar(s.distanciaMm),larguraAproximadaMm:quantizar(2*s.sigmaMm)})),
      avisos:frente===0?["A frente não avançou o suficiente para determinar Rf."]:[]};
  }
  function calcular(estado,parametros={}) {
    conferirEstado(estado);
    const m=parametros.medicoes || medir(estado,parametros.instrumento || {});
    objeto(m,"medicoes");
    const frente=numero(m.frenteMm,"distância da frente",Number.MIN_VALUE);
    if (!Array.isArray(m.manchas)) falhar("medições precisam incluir manchas");
    const calculos=m.manchas.map(s=>{
      const distancia=numero(s.distanciaMm,"distância da mancha",0);
      if (distancia>frente) falhar("mancha além da frente do solvente");
      return {componenteId:s.componenteId,distanciaMm:distancia,frenteMm:frente,
        rf:distancia/frente,unidade:"adimensional"};
    });
    return {tecnica:estado.config.tecnica,calculos,
      observacoes:["Rf é condicionado ao suporte, eluente, temperatura e método de leitura.",
        "Coincidência de Rf isoladamente não demonstra identidade química."],
      proveniencia:estado.config.componentes.map(c=>({id:c.id,origem:c.proveniencia}))};
  }
  function gerador(semente) {
    let a=(semente>>>0)||0x6d2b79f5;
    return function() {
      a=(a+0x6d2b79f5)|0;
      let t=Math.imul(a^(a>>>15),1|a);
      t^=t+Math.imul(t^(t>>>7),61|t);
      return ((t^(t>>>14))>>>0)/4294967296;
    };
  }
  function normal(rng) {
    return Math.sqrt(-2*Math.log(Math.max(Number.MIN_VALUE,rng())))*
      Math.cos(2*Math.PI*rng());
  }
  function amostrar(estado,opcoes={}) {
    const n=numero(opcoes.quantidade ?? 200,"quantidade",1,5000);
    if (!Number.isInteger(n)) falhar("quantidade precisa ser inteira");
    const seed=numero(opcoes.semente ?? 1,"semente",0,4294967295);
    if (!Number.isInteger(seed)) falhar("semente precisa ser inteira");
    const observado=observar(estado,{detector:opcoes.detector || "visivel"});
    const rng=gerador(seed);
    const distribuicoes=observado.sinais.map(s=>{
      const posicoesMm=Array.from({length:n},()=>limitar(
        s.distanciaMm+s.sigmaMm*normal(rng),0,observado.frenteMm));
      const mediaMm=posicoesMm.reduce((a,b)=>a+b,0)/n;
      const varianciaMm2=posicoesMm.reduce((a,b)=>a+(b-mediaMm)**2,0)/n;
      return {componenteId:s.componenteId,mediaMm,desvioPadraoMm:Math.sqrt(varianciaMm2),
        posicoesMm};
    });
    return {semente:seed,quantidade:n,detector:observado.detector,
      distribuicoes,hipotese:"Amostragem Monte Carlo de dispersão gaussiana truncada à frente; não altera o Rf ideal."};
  }
  return Object.freeze({versao:VERSION,prepare:preparar,advance:avancar,
    observe:observar,measure:medir,calculate:calcular,sample:amostrar});
});
