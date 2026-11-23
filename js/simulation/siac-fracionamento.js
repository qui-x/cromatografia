"use strict";
/**
 * SIAC — coletor volumétrico seletivo de dez tubos (v0.1).
 * Apenas roteamento físico e balanço de matéria, SEM estimar cinética de coluna.
 * Entrada: perfil de eluato (volume cumulativo e concentrações) fornecido
 * futuramente pelo motor de coluna. O alvo F1/F2 não altera a química.
 *
 * Janelas [início, fim) em mL do volume ELUÍDO na saída da coluna.
 * Fora das janelas o fluxo segue para descarte/recuperação.
 */
(function instalar(raiz, fabricar) {
  const coletor = fabricar();
  if (typeof module === "object" && module.exports) module.exports = coletor;
  if (raiz) {
    raiz.SIAC = raiz.SIAC || {};
    raiz.SIAC.fractionCollector = coletor;
  }
})(typeof globalThis === "object" ? globalThis : null, function fabricar() {
  const VERSAO="0.1.0",EPS=1e-8;
  function erro(s) { throw new RangeError("SIAC coletor: "+s); }
  function numero(x,n,min,max=Infinity) {
    if(typeof x!=="number" || !Number.isFinite(x) || x<min-EPS || x>max+EPS)
      erro(n+" inválido");
    return x;
  }
  function clip(x,a,b) { return Math.max(a,Math.min(b,x)); }
  function valorChave(id) {
    if(typeof id!=="string" || !/^F(?:10|[1-9])$/.test(id)) erro("frasco deve ser F1…F10");
    return Number(id.slice(1));
  }
  function fixar(o) {
    if(o && typeof o==="object" && !Object.isFrozen(o)) {
      Object.values(o).forEach(fixar);
      Object.freeze(o);
    }
    return o;
  }
  function preparar(c={}) {
    if(!c || typeof c!=="object" || Array.isArray(c)) erro("configuração");
    const total=numero(c.volumeTotalMl??10,"volumeTotalMl",0.1);
    const resolucao=numero(c.resolucaoMl??0.1,"resolucaoMl",Number.MIN_VALUE);
    if(total/resolucao<1-EPS)erro("volume total deve conter pelo menos um passo");
    if(!Array.isArray(c.janelas??[]))erro("janelas devem ser uma lista");
    const origem=new Set(),janelas=[];
    for(const j of c.janelas??[]) {
      if(!j || typeof j!=="object")erro("janela deve ser objeto");
      const frasco=j.frasco;
      valorChave(frasco);
      if(origem.has(frasco))erro("janela duplicada para "+frasco);
      origem.add(frasco);
      const inicio=numero(j.inicioMl,frasco+".inicioMl",resolucao,total);
      const fim=numero(j.fimMl,frasco+".fimMl",resolucao,total);
      if(fim-inicio<EPS)erro(frasco+": fim deve exceder início");
      const emGrade=x=>Math.abs(x/resolucao-Math.round(x/resolucao))<1e-7;
      if(!emGrade(inicio) || !emGrade(fim))erro(frasco+": valor não múltiplo da resolução");
      janelas.push({frasco,inicioMl:inicio,fimMl:fim,volumeMl:fim-inicio});
    }
    janelas.sort((a,b)=>a.inicioMl-b.inicioMl || valorChave(a.frasco)-valorChave(b.frasco));
    for(let i=1;i<janelas.length;i++)
      if(janelas[i].inicioMl<janelas[i-1].fimMl-EPS)erro("janelas de coleta sobrepostas");
    const frascos=Array.from({length:10},(_,i)=>{
      const id="F"+(i+1),alvo=janelas.find(j=>j.frasco===id);
      return alvo?{...alvo,ativo:true}:{frasco:id,ativo:false,inicioMl:null,fimMl:null,volumeMl:0};
    });
    const intervalos=[];
    let cursor=0;
    for(const j of janelas) {
      if(j.inicioMl>cursor+EPS) intervalos.push({destino:"descarte",inicioMl:cursor,fimMl:j.inicioMl});
      intervalos.push({destino:j.frasco,inicioMl:j.inicioMl,fimMl:j.fimMl});
      cursor=j.fimMl;
    }
    if(cursor<total-EPS) intervalos.push({destino:"descarte",inicioMl:cursor,fimMl:total});
    return fixar({versao:VERSAO,volumeTotalMl:total,resolucaoMl:resolucao,
      frascos,janelas,intervalos});
  }
  function conferirPlano(plano) {
    if(!plano || plano.versao!==VERSAO || !Array.isArray(plano.janelas))erro("plano incompatível");
    return plano;
  }
  function destinoEm(plano,volumeAcumuladoMl) {
    conferirPlano(plano);
    const x=numero(volumeAcumuladoMl,"volumeAcumuladoMl",0,plano.volumeTotalMl);
    if(x>=plano.volumeTotalMl-EPS)return "concluido";
    const j=plano.janelas.find(v=>x>=v.inicioMl-EPS && x<v.fimMl-EPS);
    return j?j.frasco:"descarte";
  }
  function soma(mapa,id,valor) { mapa[id]=(mapa[id]||0)+valor; }
  function copiarMapa(m) { return Object.fromEntries(Object.entries(m).sort(([a],[b])=>a.localeCompare(b))); }
  /**
   * Trechos do perfil de saída: [{inicioMl,fimMl,concentracoesMgPorMl:{A:...}}].
   * Aproximação por concentração média uniforme em cada trecho.
   * Exige perfil completo, sem lacunas, para balanço de massa verificável.
   */
  function integrar(plano,trechos) {
    conferirPlano(plano);
    if(!Array.isArray(trechos)||!trechos.length)erro("perfil de saída ausente");
    const saida=Array.from({length:10},(_,i)=>({frasco:"F"+(i+1),ativo:false,
      inicioMl:null,fimMl:null,volumeMl:0,componentesMg:{}}));
    const descarte={volumeMl:0,componentesMg:{}};
    const total={volumeMl:plano.volumeTotalMl,componentesMg:{}};
    let fimAnterior=0;
    for(let n=0;n<trechos.length;n++) {
      const t=trechos[n];
      if(!t || typeof t!=="object")erro("trecho "+n+" inválido");
      const inicio=numero(t.inicioMl,"trecho.inicioMl",0,plano.volumeTotalMl);
      const fim=numero(t.fimMl,"trecho.fimMl",0,plano.volumeTotalMl);
      if(Math.abs(inicio-fimAnterior)>EPS)erro("perfil com sobreposição ou lacuna");
      if(fim-inicio<EPS)erro("trecho precisa de largura positiva");
      if(!t.concentracoesMgPorMl || typeof t.concentracoesMgPorMl!=="object" ||
         Array.isArray(t.concentracoesMgPorMl))erro("concentracoesMgPorMl ausentes");
      const conc=t.concentracoesMgPorMl;
      for(const [id,c] of Object.entries(conc)){
        if(!id.trim())erro("identificação de componente vazia");
        numero(c,"concentração de "+id,0);
        soma(total.componentesMg,id,c*(fim-inicio));
      }
      for(const intervalo of plano.intervalos) {
        const overlap=Math.max(0,Math.min(fim,intervalo.fimMl)-Math.max(inicio,intervalo.inicioMl));
        if(overlap<EPS)continue;
        const r=intervalo.destino==="descarte"?descarte:saida[valorChave(intervalo.destino)-1];
        r.volumeMl+=overlap;
        for(const [id,c] of Object.entries(conc))soma(r.componentesMg,id,c*overlap);
      }
      fimAnterior=fim;
    }
    if(Math.abs(fimAnterior-plano.volumeTotalMl)>EPS)erro("perfil incompleto");
    for(const j of plano.janelas){
      const f=saida[valorChave(j.frasco)-1];
      f.ativo=true;f.inicioMl=j.inicioMl;f.fimMl=j.fimMl;
    }
    const arredondar=x=>Math.round(x*1e10)/1e10;
    const serializar=x=>({
      ...x,volumeMl:arredondar(x.volumeMl),
      componentesMg:copiarMapa(Object.fromEntries(
        Object.entries(x.componentesMg).map(([id,m])=>[id,arredondar(m)])))
    });
    const frascos=saida.map(f=>{
      const v=serializar(f);
      v.concentracoesMediasMgPorMl=v.volumeMl>0
        ?copiarMapa(Object.fromEntries(
          Object.entries(v.componentesMg).map(([id,m])=>[id,arredondar(m/v.volumeMl)])))
        :{};
      return v;
    });
    const descarteFinal=serializar(descarte), totalFinal=serializar(total);
    const somaVolumes=frascos.reduce((s,f)=>s+f.volumeMl,descarteFinal.volumeMl);
    if(Math.abs(somaVolumes-plano.volumeTotalMl)>EPS)erro("volume não conservado");
    for(const [id,m] of Object.entries(totalFinal.componentesMg)){
      const atribuido=frascos.reduce((s,f)=>s+(f.componentesMg[id]||0),descarteFinal.componentesMg[id]||0);
      if(Math.abs(atribuido-m)>1e-7*Math.max(1,m))erro("massa não conservada para "+id);
    }
    return fixar({versao:VERSAO,unidades:{volume:"mL",massa:"mg",concentracao:"mg/mL"},
      frascos,descarte:descarteFinal,total:totalFinal,
      limite:"Perfis hipotéticos fornecidos externamente; concentrações médias por trecho; não infere pureza nem identidade."});
  }
  return Object.freeze({versao:VERSAO,prepare:preparar,routeAt:destinoEm,
    integrate:integrar});
});
