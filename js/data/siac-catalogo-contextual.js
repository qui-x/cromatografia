"use strict";
/* SIAC: catálogo contextual para Montagem; cópia versionada de dados de pesquisa.
 * NÃO calcula k de coluna nem deduz Rf de densidade, polaridade ou solubilidade.
 * Direitos e condições dos protocolos permanecem pendentes de homologação.
 */
(function(raiz,fabrica){const api=fabrica();if(typeof module==="object"&&module.exports)module.exports=api;if(raiz){raiz.SIAC=raiz.SIAC||{};raiz.SIAC.catalogo=api;}})(typeof globalThis==="object"?globalThis:null,function(){
const DADOS={
  "versao": "0.1-catalogo-contextual-2026-11-23",
  "origem": "data/siac/analitos-protocolos.v1.json — pesquisa, NÃO homologado",
  "candidatos": [
    {
      "id": "tartrazina",
      "nome": "Tartrazina (FD&C Yellow 5)",
      "grupo": "corantes_alimenticios"
    },
    {
      "id": "sunset_yellow_fcf",
      "nome": "Amarelo crepúsculo FCF (Yellow 6)",
      "grupo": "corantes_alimenticios"
    },
    {
      "id": "allura_red_ac",
      "nome": "Vermelho Allura AC (Red 40)",
      "grupo": "corantes_alimenticios"
    },
    {
      "id": "brilliant_blue_fcf",
      "nome": "Azul brilhante FCF (Blue 1)",
      "grupo": "corantes_alimenticios"
    },
    {
      "id": "indigotine",
      "nome": "Indigotina (Blue 2)",
      "grupo": "corantes_alimenticios"
    },
    {
      "id": "erythrosine",
      "nome": "Eritrosina (Red 3)",
      "grupo": "corantes_alimenticios"
    },
    {
      "id": "fast_green_fcf",
      "nome": "Verde rápido FCF (Green 3)",
      "grupo": "corantes_alimenticios"
    },
    {
      "id": "ponceau_4r",
      "nome": "Ponceau 4R",
      "grupo": "corantes_alimenticios"
    },
    {
      "id": "amaranth",
      "nome": "Amaranto (corante azo)",
      "grupo": "corantes_alimenticios"
    },
    {
      "id": "patent_blue_v",
      "nome": "Azul patente V",
      "grupo": "corantes_alimenticios"
    },
    {
      "id": "quinoline_yellow",
      "nome": "Amarelo de quinolina",
      "grupo": "corantes_alimenticios"
    },
    {
      "id": "chlorophyll_a",
      "nome": "Clorofila a",
      "grupo": "pigmentos_vegetais"
    },
    {
      "id": "chlorophyll_b",
      "nome": "Clorofila b",
      "grupo": "pigmentos_vegetais"
    },
    {
      "id": "pheophytin_a",
      "nome": "Feofitina a",
      "grupo": "pigmentos_vegetais"
    },
    {
      "id": "pheophytin_b",
      "nome": "Feofitina b",
      "grupo": "pigmentos_vegetais"
    },
    {
      "id": "beta_carotene",
      "nome": "β-caroteno",
      "grupo": "pigmentos_vegetais"
    },
    {
      "id": "alpha_carotene",
      "nome": "α-caroteno",
      "grupo": "pigmentos_vegetais"
    },
    {
      "id": "lutein",
      "nome": "Luteína",
      "grupo": "pigmentos_vegetais"
    },
    {
      "id": "zeaxanthin",
      "nome": "Zeaxantina",
      "grupo": "pigmentos_vegetais"
    },
    {
      "id": "lycopene",
      "nome": "Licopeno",
      "grupo": "pigmentos_vegetais"
    },
    {
      "id": "violaxanthin",
      "nome": "Violaxantina",
      "grupo": "pigmentos_vegetais"
    },
    {
      "id": "neoxanthin",
      "nome": "Neoxantina",
      "grupo": "pigmentos_vegetais"
    },
    {
      "id": "beta_cryptoxanthin",
      "nome": "β-criptoxantina",
      "grupo": "pigmentos_vegetais"
    },
    {
      "id": "cyanidin_3_glucoside",
      "nome": "Cianidina-3-O-glicosídeo",
      "grupo": "pigmentos_vegetais"
    },
    {
      "id": "delphinidin_3_glucoside",
      "nome": "Delfinidina-3-O-glicosídeo",
      "grupo": "pigmentos_vegetais"
    },
    {
      "id": "quercetin",
      "nome": "Quercetina",
      "grupo": "pigmentos_vegetais"
    },
    {
      "id": "rutin",
      "nome": "Rutina",
      "grupo": "pigmentos_vegetais"
    },
    {
      "id": "curcumin",
      "nome": "Curcumina",
      "grupo": "pigmentos_vegetais"
    },
    {
      "id": "capsanthin",
      "nome": "Capsantina",
      "grupo": "pigmentos_vegetais"
    },
    {
      "id": "bixin",
      "nome": "Bixina",
      "grupo": "pigmentos_vegetais"
    },
    {
      "id": "norbixin",
      "nome": "Norbixina",
      "grupo": "pigmentos_vegetais"
    },
    {
      "id": "alanine",
      "nome": "Alanina",
      "grupo": "aminoacidos"
    },
    {
      "id": "arginine",
      "nome": "Arginina",
      "grupo": "aminoacidos"
    },
    {
      "id": "asparagine",
      "nome": "Asparagina",
      "grupo": "aminoacidos"
    },
    {
      "id": "aspartic_acid",
      "nome": "Ácido aspártico",
      "grupo": "aminoacidos"
    },
    {
      "id": "cysteine",
      "nome": "Cisteína",
      "grupo": "aminoacidos"
    },
    {
      "id": "glutamic_acid",
      "nome": "Ácido glutâmico",
      "grupo": "aminoacidos"
    },
    {
      "id": "glutamine",
      "nome": "Glutamina",
      "grupo": "aminoacidos"
    },
    {
      "id": "glycine",
      "nome": "Glicina",
      "grupo": "aminoacidos"
    },
    {
      "id": "histidine",
      "nome": "Histidina",
      "grupo": "aminoacidos"
    },
    {
      "id": "isoleucine",
      "nome": "Isoleucina",
      "grupo": "aminoacidos"
    },
    {
      "id": "leucine",
      "nome": "Leucina",
      "grupo": "aminoacidos"
    },
    {
      "id": "lysine",
      "nome": "Lisina",
      "grupo": "aminoacidos"
    },
    {
      "id": "methionine",
      "nome": "Metionina",
      "grupo": "aminoacidos"
    },
    {
      "id": "phenylalanine",
      "nome": "Fenilalanina",
      "grupo": "aminoacidos"
    },
    {
      "id": "proline",
      "nome": "Prolina",
      "grupo": "aminoacidos"
    },
    {
      "id": "serine",
      "nome": "Serina",
      "grupo": "aminoacidos"
    },
    {
      "id": "threonine",
      "nome": "Treonina",
      "grupo": "aminoacidos"
    },
    {
      "id": "tryptophan",
      "nome": "Triptofano",
      "grupo": "aminoacidos"
    },
    {
      "id": "tyrosine",
      "nome": "Tirosina",
      "grupo": "aminoacidos"
    },
    {
      "id": "valine",
      "nome": "Valina",
      "grupo": "aminoacidos"
    },
    {
      "id": "caffeine",
      "nome": "Cafeína",
      "grupo": "farmacos_e_organicos"
    },
    {
      "id": "theobromine",
      "nome": "Teobromina",
      "grupo": "farmacos_e_organicos"
    },
    {
      "id": "paracetamol",
      "nome": "Paracetamol",
      "grupo": "farmacos_e_organicos"
    },
    {
      "id": "acetylsalicylic_acid",
      "nome": "Ácido acetilsalicílico",
      "grupo": "farmacos_e_organicos"
    },
    {
      "id": "salicylic_acid",
      "nome": "Ácido salicílico",
      "grupo": "farmacos_e_organicos"
    },
    {
      "id": "ibuprofen",
      "nome": "Ibuprofeno",
      "grupo": "farmacos_e_organicos"
    },
    {
      "id": "naproxen",
      "nome": "Naproxeno",
      "grupo": "farmacos_e_organicos"
    },
    {
      "id": "benzoic_acid",
      "nome": "Ácido benzoico",
      "grupo": "farmacos_e_organicos"
    },
    {
      "id": "vanillin",
      "nome": "Vanilina",
      "grupo": "farmacos_e_organicos"
    },
    {
      "id": "ethyl_vanillin",
      "nome": "Etilvanilina",
      "grupo": "farmacos_e_organicos"
    },
    {
      "id": "coumarin",
      "nome": "Cumarina",
      "grupo": "farmacos_e_organicos"
    },
    {
      "id": "nicotinamide",
      "nome": "Nicotinamida",
      "grupo": "farmacos_e_organicos"
    },
    {
      "id": "riboflavin",
      "nome": "Riboflavina",
      "grupo": "farmacos_e_organicos"
    },
    {
      "id": "ascorbic_acid",
      "nome": "Ácido ascórbico",
      "grupo": "farmacos_e_organicos"
    },
    {
      "id": "fluorescein",
      "nome": "Fluoresceína",
      "grupo": "indicadores_e_traçadores"
    },
    {
      "id": "eosin_y",
      "nome": "Eosina Y",
      "grupo": "indicadores_e_traçadores"
    },
    {
      "id": "rhodamine_b",
      "nome": "Rodamina B",
      "grupo": "indicadores_e_traçadores"
    },
    {
      "id": "methylene_blue",
      "nome": "Azul de metileno",
      "grupo": "indicadores_e_traçadores"
    },
    {
      "id": "methyl_orange",
      "nome": "Alaranjado de metila",
      "grupo": "indicadores_e_traçadores"
    },
    {
      "id": "methyl_red",
      "nome": "Vermelho de metila",
      "grupo": "indicadores_e_traçadores"
    },
    {
      "id": "bromothymol_blue",
      "nome": "Azul de bromotimol",
      "grupo": "indicadores_e_traçadores"
    },
    {
      "id": "phenolphthalein",
      "nome": "Fenolftaleína",
      "grupo": "indicadores_e_traçadores"
    },
    {
      "id": "crystal_violet",
      "nome": "Violeta cristal",
      "grupo": "indicadores_e_traçadores"
    },
    {
      "id": "sudan_iii",
      "nome": "Sudan III",
      "grupo": "indicadores_e_traçadores"
    },
    {
      "id": "sudan_iv",
      "nome": "Sudan IV",
      "grupo": "indicadores_e_traçadores"
    }
  ],
  "protocolos": [
    {
      "id": "tlc_aminoacids_amrita_12_3_5",
      "tecnica": "ccd",
      "grupo": "aminoacidos",
      "status": "referencia_didatica_com_rf_compilado",
      "fonte": "amrita",
      "suporte": "placa_TLC",
      "detalhamento": "não informado no trecho consultado",
      "detector": "ninhidrina pós-desenvolvimento",
      "preTratamento": null,
      "faseMovel": {
        "componentes": [
          {
            "id": "butanol_1",
            "partes": 12
          },
          {
            "id": "acetic_acid",
            "partes": 3
          },
          {
            "id": "water",
            "partes": 5
          }
        ],
        "base": "v/v",
        "mistura": "descrita pelo guia",
        "solventeReal": "consultar fonte"
      },
      "rf": [
        {
          "id": "alanine",
          "rf": 0.24,
          "classe": "reportado_no_guia",
          "fonte": "amrita"
        },
        {
          "id": "glutamic_acid",
          "rf": 0.25,
          "classe": "reportado_no_guia",
          "fonte": "amrita"
        },
        {
          "id": "glycine",
          "rf": 0.2,
          "classe": "reportado_no_guia",
          "fonte": "amrita"
        },
        {
          "id": "leucine",
          "rf": 0.58,
          "classe": "reportado_no_guia",
          "fonte": "amrita"
        },
        {
          "id": "valine",
          "rf": 0.4,
          "classe": "reportado_no_guia",
          "fonte": "amrita"
        },
        {
          "id": "lysine",
          "rf": 0.58,
          "classe": "reportado_no_guia",
          "fonte": "amrita"
        },
        {
          "id": "tyrosine",
          "rf": 0.42,
          "classe": "reportado_no_guia",
          "fonte": "amrita"
        }
      ],
      "nota": "Valores relatados para o sistema mencionado no guia, não universais; qualidade e condições completas de placa e amostra precisam de conferência antes da homologação."
    },
    {
      "id": "tlc_spinach_quach_2004",
      "tecnica": "ccd",
      "grupo": "pigmentos_vegetais",
      "status": "relato_de_literatura_pendente_de_conferencia_no_original",
      "fonte": "quach",
      "suporte": "sílica gel sobre suporte poliéster",
      "detalhamento": "indicador fluorescente citado no método",
      "detector": "visível",
      "preTratamento": null,
      "faseMovel": {
        "componentes": [
          {
            "id": "petroleum_ether_mixture",
            "partes": 60
          },
          {
            "id": "cyclohexane",
            "partes": 16
          },
          {
            "id": "ethyl_acetate",
            "partes": 10
          },
          {
            "id": "acetone",
            "partes": 10
          },
          {
            "id": "methanol",
            "partes": 4
          }
        ],
        "base": "v/v",
        "mistura": "soma 100 partes"
      },
      "rf": [
        {
          "id": "carotene_band",
          "rf": 0.95,
          "classe": "transcricao_de_publicacao",
          "fonte": "quachTranscript"
        },
        {
          "id": "chlorophyll_a",
          "rf": 0.44,
          "classe": "transcricao_de_publicacao",
          "fonte": "quachTranscript"
        },
        {
          "id": "chlorophyll_b",
          "rf": 0.32,
          "classe": "transcricao_de_publicacao",
          "fonte": "quachTranscript"
        },
        {
          "id": "xanthophyll_band",
          "rf": 0.16,
          "classe": "transcricao_de_publicacao",
          "fonte": "quachTranscript"
        }
      ],
      "nota": "Bandas 'caroteno' e 'xantofila' não identificam molécula única; conferir Rf no artigo original antes de validação. Resultados dependem de fase/suporte e da integridade do pigmento."
    },
    {
      "id": "tlc_spinach_pheophytin_quach_2004",
      "tecnica": "ccd",
      "grupo": "pigmentos_vegetais",
      "status": "relato_secundario_pendente_conferencia",
      "fonte": "quach",
      "suporte": "sílica gel sobre poliéster",
      "detalhamento": "conforme mesmo método da separação principal",
      "detector": "visível",
      "preTratamento": "desmetalização de clorofilas por resina ácida (procedimento descrito pelo artigo)",
      "faseMovel": {
        "herdadaDe": "tlc_spinach_quach_2004"
      },
      "rf": [
        {
          "id": "pheophytin_a",
          "rf": 0.6,
          "classe": "transcricao_de_publicacao",
          "fonte": "quachTranscript"
        },
        {
          "id": "pheophytin_b",
          "rf": 0.49,
          "classe": "transcricao_de_publicacao",
          "fonte": "quachTranscript"
        }
      ],
      "nota": "Não transferir estes valores à amostra fresca sem desmetalização ou a outra fase."
    },
    {
      "id": "paper_food_dyes_basf",
      "tecnica": "papel",
      "grupo": "corantes_alimenticios",
      "status": "procedimento_didatico_sem_rf",
      "fonte": "basf",
      "suporte": "papel de filtro",
      "detalhamento": null,
      "detector": "visível",
      "preTratamento": null,
      "faseMovel": {
        "componentes": [
          {
            "id": "water",
            "partes": null
          },
          {
            "id": "sodium_chloride",
            "partes": null
          }
        ],
        "base": "solução aquosa salina, concentração não extraída"
      },
      "rf": [],
      "nota": "Cores e formulações comerciais não autorizam atribuição de identidade aos componentes nem coeficientes de retenção."
    }
  ]
};
const FAMILIAS=Object.freeze({
 corantes_alimenticios:"Corantes alimentícios",
 pigmentos_vegetais:"Pigmentos vegetais",
 aminoacidos:"Aminoácidos",
 farmacos_e_organicos:"Fármacos e moléculas orgânicas",
 indicadores_e_traçadores:"Indicadores e traçadores"
});
const NOMES=Object.freeze({butanol_1:"1-butanol",acetic_acid:"ácido acético",water:"água",petroleum_ether_mixture:"éter de petróleo (mistura)",
 cyclohexane:"ciclo-hexano",ethyl_acetate:"acetato de etila",acetone:"acetona",methanol:"metanol",sodium_chloride:"cloreto de sódio"});
const ID_TO_PROTOCOL=Object.freeze(Object.fromEntries(DADOS.protocolos.map(p=>[p.id,p])));
function substantia(id){return DADOS.candidatos.find(x=>x.id===id)||null;}
function grupos(){return Object.keys(FAMILIAS).map(id=>({id,nome:FAMILIAS[id],total:DADOS.candidatos.filter(x=>x.grupo===id).length}));}
function candidatos(grupo="",busca=""){
 const q=String(busca||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase("pt-BR");
 return DADOS.candidatos.filter(x=>(!grupo||x.grupo===grupo)&&
  (x.nome+" "+x.id).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase("pt-BR").includes(q));
}
function faseMovelDo(p){
 if(p.faseMovel?.herdadaDe)return ID_TO_PROTOCOL[p.faseMovel.herdadaDe]?.faseMovel||null;
 return p.faseMovel||null;
}
function nomeFase(p){
 const m=faseMovelDo(p);
 if(!m?.componentes?.length)return "Fase móvel não identificada";
 const partes=m.componentes.map(x=>{
  const n=NOMES[x.id]||x.id;
  return x.partes===null?n:n+" ("+x.partes+")";
 }).join(" + ");
 return partes+(m.base?.includes("v/v")?" · proporção v/v":"");
}
function sistemasPara(id){
 const a=substantia(id);if(!a)return [];
 const out=[];
 for(const p of DADOS.protocolos){
  const dado=p.rf.find(x=>x.id===id);
  const generico=p.id==="paper_food_dyes_basf"&&a.grupo==="corantes_alimenticios";
  if(!dado&&!generico)continue;
  out.push(Object.freeze({
   id:p.id,tecnica:p.tecnica,faseMovel:nomeFase(p),faseEstacionaria:p.suporte,
   detector:p.detector,preTratamento:p.preTratamento,
   rf:dado?dado.rf:null,
   origemRf:dado?dado.classe:null,
   evidencia:generico?"procedimento_de_familia":p.status,
   condicoesIncompletas:true,
   permiteSimulacaoColuna:false,
   fonte:p.fonte,
   nota:p.nota
  }));
 }
 return out;
}
function projetarDistancia(id,sistemaId,frenteMm){
 const a=substantia(id),p=sistemasPara(id).find(x=>x.id===sistemaId);
 if(!a||!p||p.rf===null)return null;
 if(!Number.isFinite(frenteMm)||frenteMm<=0||frenteMm>1000)return null;
 return Object.freeze({rfBibliografico:p.rf,frenteMm,distanciaMm:p.rf*frenteMm,
  classe:"projecao_geometrica_de_rf_bibliografico",
  aviso:"Não é previsão independente de Rf nem medição. Só aproxima a posição se as condições reproduzirem o protocolo."});
}
function escapeHTML(v){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function interfaceMontagem(container,onMode){
 if(!container||typeof container.prepend!=="function")throw new Error("Montagem ausente");
 const card=document.createElement("section");card.id="siac-catalogo";card.className="siac-catalogo";
 card.innerHTML='<div class="siac-catalogo-modos" role="group" aria-label="Tipo de investigação">'+
   '<button type="button" data-siac-modo="pesquisa" aria-pressed="true">Substâncias (76)</button>'+
   '<button type="button" data-siac-modo="demo" aria-pressed="false">Demonstração</button></div>'+
   '<div id="siac-catalogo-pesquisa"><p class="siac-hint">As substâncias são candidatas em pesquisa. Eluentes e Rf só aparecem quando há vínculo documentado.</p>'+
   '<label>Família<select id="siac-catalogo-familia"><option value="">Todas as famílias (76)</option>'+
    grupos().map(x=>'<option value="'+escapeHTML(x.id)+'">'+escapeHTML(x.nome)+' ('+x.total+')</option>').join("")+
   '</select></label>'+
   '<label>Buscar substância<input id="siac-catalogo-busca" type="search" autocomplete="off" placeholder="Nome ou identificador"></label>'+
   '<label>Substância<select id="siac-catalogo-substancia"><option value="">Escolha uma substância</option></select></label>'+
   '<label>Solvente / sistema móvel<select id="siac-catalogo-solvente" disabled><option value="">Primeiro selecione a substância</option></select></label>'+
   '<div id="siac-catalogo-dados" class="siac-catalogo-dados" aria-live="polite"></div>'+
   '</div>';
 container.prepend(card);
 let state={modo:"pesquisa",substanciaId:"",sistemaId:""};
 const $=id=>card.querySelector("#"+id);
 const choose=$("siac-catalogo-substancia"),solvent=$("siac-catalogo-solvente");
 function updateCandidates(){
  const opts=candidatos($("siac-catalogo-familia").value,$("siac-catalogo-busca").value);
  choose.innerHTML='<option value="">Escolha uma substância ('+opts.length+')</option>'+
   opts.map(a=>'<option value="'+escapeHTML(a.id)+'">'+escapeHTML(a.nome)+'</option>').join("");
  if(opts.some(x=>x.id===state.substanciaId))choose.value=state.substanciaId;
  else state.substanciaId="";
  updateSystems();
 }
 function updateSystems(){
  const methods=sistemasPara(state.substanciaId);
  solvent.disabled=!state.substanciaId||!methods.length;
  solvent.innerHTML='<option value="">'+(!state.substanciaId?"Primeiro selecione a substância":!methods.length?
    "Nenhum sistema documentado para este composto":"Escolha um sistema ("+methods.length+")")+'</option>'+
   methods.map(x=>'<option value="'+escapeHTML(x.id)+'">'+escapeHTML(x.faseMovel)+'</option>').join("");
  state.sistemaId="";
  updateInfo();
  // O SIAB substitui selects nativos por botões temáticos; atualizar
  // disabled/rótulo quando o catálogo alterar as opções dependentes.
  if(typeof globalThis==="object")globalThis.SIAB?.refreshSelects?.();
 }
 function updateInfo(){
  const a=substantia(state.substanciaId),options=sistemasPara(state.substanciaId),p=options.find(x=>x.id===state.sistemaId);
  if(!a){$("siac-catalogo-dados").innerHTML='<p>Selecione um composto para consultar seus métodos.</p>';return;}
  const comRf=options.filter(x=>x.rf!==null).length;
  const cobertura='<p class="siac-hint"><strong>Cobertura científica: '+comRf+
   '/2 métodos com retenção individual.</strong> Homologação exige dois métodos independentes com sistemas de solventes quimicamente diferentes, identidade e condições conferidas. Nenhum desses candidatos está homologado para simulação quantitativa real nesta base.</p>';
  if(!options.length){
   const temHptlc=a.id==="caffeine"||a.id==="paracetamol";
   const atalho=temHptlc?
    '<p>Dois métodos HPTLC homologados cientificamente para condições específicas. A cena atual permite consultar somente as referências, não medir a amostra.</p>'+
    '<button type="button" data-siac-open-hptlc="'+escapeHTML(a.id)+'" class="secondary-btn">Consultar métodos HPTLC</button>':"";
   $("siac-catalogo-dados").innerHTML='<p><strong>'+escapeHTML(a.nome)+'</strong> · '+escapeHTML(FAMILIAS[a.grupo])+
    '</p><p>Não há sistema eluente individual documentado no catálogo contextual atual. Não é permitido atribuir um solvente ou estimar Rf por suposição.</p>'+atalho+cobertura;return;
  }
  if(!p){$("siac-catalogo-dados").innerHTML='<p><strong>'+escapeHTML(a.nome)+'</strong> · '+options.length+
   ' sistema(s) associado(s) em literatura. Escolha a fase móvel para consultar as condições.</p>'+cobertura;return;}
  const rf=p.rf===null?'<p>Rf: ainda não documentado para este composto.</p>':
   '<p><strong>Rf bibliográfico: '+p.rf.toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:3})+
   '</strong> · <span>não é valor medido no SIAC. Use a régua e o cálculo na doca Ver.</span></p>';
  $("siac-catalogo-dados").innerHTML='<p><strong>'+escapeHTML(a.nome)+'</strong> · '+escapeHTML(p.tecnica.toUpperCase())+'</p>'+
   '<p>Suporte: '+escapeHTML(p.faseEstacionaria)+' · Detecção: '+escapeHTML(p.detector)+'</p>'+
   (p.preTratamento?'<p>Pré-tratamento: '+escapeHTML(p.preTratamento)+'</p>':"")+
   rf+'<p class="siac-hint">Fonte: '+escapeHTML(p.fonte)+' · Evidência: '+escapeHTML(p.evidencia)+
   '. Condições experimentais incompletas; não permite simular retenção em coluna ou confirmar identidade.</p>'+cobertura;
 }
 function notify(){onMode?.({...state,substancia:substantia(state.substanciaId),sistema:sistemasPara(state.substanciaId).find(x=>x.id===state.sistemaId)||null});}
 card.addEventListener("click",ev=>{
  const mode=ev.target.closest("[data-siac-modo]");if(!mode)return;
  state.modo=mode.dataset.siacModo;
  card.querySelectorAll("[data-siac-modo]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.siacModo===state.modo)));
  $("siac-catalogo-pesquisa").hidden=state.modo!=="pesquisa";
  notify();
 });
 card.addEventListener("input",ev=>{
  if(ev.target.id==="siac-catalogo-busca"){updateCandidates();notify();}

 });
 card.addEventListener("change",ev=>{
  if(ev.target.id==="siac-catalogo-familia"){updateCandidates();notify();}
  if(ev.target.id==="siac-catalogo-substancia"){state.substanciaId=choose.value;updateSystems();notify();}
  if(ev.target.id==="siac-catalogo-solvente"){state.sistemaId=solvent.value;updateInfo();notify();}
 });
 updateCandidates();notify();
 return Object.freeze({get state(){return {...state,substancia:substantia(state.substanciaId),sistema:sistemasPara(state.substanciaId).find(x=>x.id===state.sistemaId)||null};}});
}
return Object.freeze({dados:DADOS,grupos,candidatos,substancia:substantia,sistemasPara,projetarDistancia,interfaceMontagem});
});
