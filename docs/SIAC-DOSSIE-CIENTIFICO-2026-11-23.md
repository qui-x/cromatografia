# SIAC — Dossiê científico de substâncias, eluentes e motores físico-químicos (Pesquisa I)

**Data da pesquisa:** 23/11/2026  
**Situação:** PESQUISA ESTRUTURADA, NÃO HOMOLOGADA PARA PREDIÇÃO DE EXPERIMENTOS  
**Branch de trabalho:** feat/siac-motor-cromatografico — nenhuma nova branch foi criada.  
**Escopo:** cromatografia em papel, camada delgada (CCD/HPTLC) e coluna líquida com coleta fracionada.

## 1. Resultado verificável desta etapa

Arquivos da pesquisa, independentes da execução da bancada:
- data/siac/solventes-propriedades.v1.json: **41 solventes/sistemas candidatos**, **23 entradas com densidade numérica** (22 no guia Thermo Fisher, uma entrada de etanol via PubChem), **41 pares de miscibilidade categórica**, **11 referências associadas**.
- data/siac/analitos-protocolos.v1.json: **76 substâncias candidatas**, 5 protocolos/referências de técnica e **13 registros de Rf**, todos vinculados ao método que os originou.
- data/siac/motores-fontes.v1.json: **9 ferramentas ou bases de dados** e **22 referências científicas/técnicas**, com proposta de integração e limitações.

**Contagens não são cobertura homologada.** Os 76 analitos ainda não receberam CAS/CID individuais conferidos ou densidades, pois seria incorreto criar números ou identidades estruturais a partir de nomes e classes.

## 2. Regra físico-química central

O ponto fundamental é separar cinco níveis de informação:

1. **Substância pura**: identidade química inequívoca, estado e pureza; densidade ρ(T,P), viscosidade η(T,P), pressão de vapor, tensão superficial γ(T), constante dielétrica, solubilidade, pKa quando pertinente.
2. **Mistura de solventes**: composição explícita em frações molares/mássicas/volumétricas, temperatura, pressão, atividade, densidade e viscosidade da mistura; **não usar soma linear automática de densidades** nem assumir que polaridade representa miscibilidade.
3. **Suporte/fase estacionária**: sílica (normal ou modificada), alumina, celulose, C18, granulometria, porosidade, superfície, espessura, tratamento e potencial de troca.
4. **Experimento cromatográfico**: pares/trios de soluto–eluente–suporte, fase, composição, temperatura, pH, taxa de fluxo, método de aplicação e revelação; somente aqui faz sentido registrar Rf, fator k, coeficientes de partição, isotermas e parâmetros cinéticos.
5. **Observação**: o que efetivamente pode ser visto com luz branca, UV 254/365 ou reagentes; cor nunca identifica substância isoladamente.

A IUPAC define o fator de retenção em coluna a partir dos volumes/tempos ajustados e do hold-up; o Rf planar é uma medida distinta. NÃO reutilizar um Rf como k de coluna, nem inferir k/Rf a partir de densidade ou da cor.

Fontes: https://goldbook.iupac.org/terms/view/R05359 ; https://goldbook.iupac.org/terms/view/D01814

## 3. Banco numérico de solventes — início de cobertura rastreável

### Condições e significado

A tabela **Fisher Chemical High Purity Solvents Selection Guide**, página impressa 10, expõe densidade a **25 °C**, viscosidade dinâmica a **20 °C**, ponto de ebulição e corte UV. Esses valores foram copiados conservando as condições e não foram convertidos à CNTP. Não são medidas do SIAC: são uma **compilação de fabricante** sujeita a revisão posterior com NIST ou publicações primárias.

| Entrada | Densidade (g/mL a 25 °C) | Viscosidade (cP a 20 °C) | Ebulição (°C) | Corte UV (nm) |
|---|---:|---:|---:|---:|
| Acetona | 0,7857 | 0,36 | 56,1 | 330 |
| Acetonitrila | 0,7780 | 0,36 | 81,6 | 190 |
| 1-Butanol | 0,8098 | 2,98 | 117,7 | 215 |
| Clorofórmio | 1,4840 | 0,58 | 61,7 | 245 |
| Ciclo-hexano | 0,7740 | 0,90 | 80,7 | 202 |
| Dimetilformamida (DMF) | 0,9440 | 0,92 | 153,0 | 268 |
| Dimetilsulfóxido (DMSO) | 1,1014 | 2,24 | 189,0 | 262 |
| Acetato de etila | 0,8940 | 0,45 | 77,1 | 255 |
| Éter dietílico | 0,7134 | 0,24 | 34,6 | 218 |
| Glicerol | 1,2613 | não informado | 290,0 | 205 |
| n-Heptano | 0,6838 | 0,40 | 98,4 | 197 |
| Hexanos comerciais (mistura) | 0,6630 | 0,31 | 69,0 | 195 |
| Iso-octano | 0,6919 | 0,50 | 99,2 | 205 |
| Metanol | 0,7915 | 0,55 | 64,7 | 205 |
| Diclorometano | 1,3180 | 0,30 | 39,5 | 233 |
| N-Metil-2-pirrolidona | 1,0300 | 1,67 | 202,2 | 275 |
| n-Pentano | 0,6264 | 0,22 | 36,1 | 190 |
| Éter de petróleo (mistura) | 0,6400 | não informado | faixa 35–60 | não informado |
| 2-Propanol | 0,7855 | 2,40 | 82,3 | 205 |
| Tetraidrofurano | 0,8892 | 0,55 | 66,1 | 210 |
| Tolueno | 0,8660 | 0,59 | 110,6 | 285 |
| Água | 0,9982 | 1,00 | 100,0 | não informado |

**Etanol, fonte distinta:** PubChem CID 702 registra **0,7893 g/cm³ a 20 °C**; sua viscosidade de referência está em tabela Merck (1,20 cP a 20 °C). O objeto JSON identifica a origem por campo, não coloca etanol a 25 °C por extrapolação.

**Alertas da própria tabela:** “Hexanes” e “Petroleum Ether” são misturas comerciais com composição variável; os dados não identificam um composto puro específico. Fontes diferentes podem discordar levemente sobre viscosidade, densidade e corte UV por método/pureza; não fazer médias não justificadas. O cutoff UV corresponde à condição óptica definida pela fonte, não à garantia de detecção de qualquer substância.

Fonte da tabela: https://assets.thermofisher.com/TFS-Assets/ANZ/Application-Notes/chromatography-solvent-application-guide.pdf (página 10 impressa; captura visual conferida). Dados de referência complementar: https://www.sigmaaldrich.com/ST/en/technical-documents/technical-article/analytical-chemistry/small-molecule-hplc/hplc-troubleshooting-guide

### Variáveis que ainda exigem investigação por solvente

Tensão superficial γ(T), solubilidade quantitativa de cada soluto, pKa e especiação, densidade e viscosidade de misturas, constante dielétrica, solubilidade em água por composição, parâmetros Hansen, parâmetros de UNIFAC/NRTL, estabilidade e interações com adsorvente. Para vários analitos sólidos, a densidade depende de fase polimórfica e a solubilidade na fase móvel é muito mais relevante que um único valor de densidade do sólido.

Fontes complementares para ampliar com dados:
- PubChem (identidades, fontes de anotações): https://pubchem.ncbi.nlm.nih.gov/docs/pug-view
- PubChem PUG-REST (identificadores e propriedades): https://pubchem.ncbi.nlm.nih.gov/docs/pug-rest
- NIST Chemistry WebBook (dados termofísicos de **cobertura variável**, não universais): https://webbook.nist.gov/chemistry/

## 4. Miscibilidade: dados binários com cautela

O arquivo registra **41 pares qualitativos**; categorias:
- **completa**: solução de uma fase no domínio qualitativo indicado pela referência;
- **limitada**: existência de solubilidade limitada ou região em que surgem duas fases;
- **nao_completa**: não é garantida miscibilidade total na faixa de composição;
- **desconhecida**: sem suporte verificado, deve permanecer nula.

Exemplos já conferidos:
- Água com metanol, etanol, acetonitrila, acetona, 2-propanol, THF, DMSO e DMF: miscibilidade completa nas referências consultadas.
- Água com hexano, heptano, tolueno, ciclo-hexano ou diclorometano: não completamente miscíveis.
- Água com acetato de etila ou 1-butanol: solubilidade limitada; **não** tratar como “zero solubilidade”.
- Acetonitrila com hexano/heptano/isooctano: **não completamente miscível** na matriz qualitativa.
- Hexanos com acetato de etila, hexanos com tolueno: pareamento indicado como miscível na matriz qualitativa.

As classificações não possuem temperatura, curva binodal, tie-lines ou quantidades dissolvidas. Não devem alimentar um solver de equilíbrio sem parâmetros adicionais.

**Atenção à fonte:** a extração textual automática do PDF MilliporeSigma forneceu pares evidentemente inconsistentes (por exemplo, água + acetonitrila). Por isso, a matriz foi conferida pela **imagem visual original**, complementada por tabelas Merck/Waters. O JSON mantém o status de pesquisa e exige revisão independente antes da publicação como resultado científico.

Fontes:
- https://www.sigmaaldrich.com/deepweb/assets/sigmaaldrich/marketing/global/documents/solvent-miscibility-rules-chart-ms.pdf
- https://help.waters.com/help/en/product-support/alliance-is-system-support/715008450/27BE872.html
- https://www.sigmaaldrich.com/ST/en/technical-documents/technical-article/analytical-chemistry/small-molecule-hplc/hplc-troubleshooting-guide

## 5. Catálogo inicial de analitos — 76 candidatos, não 76 homologações

| Família de investigação | Candidatos | Exemplos |
|---|---:|---|
| Corantes alimentícios | 11 | tartrazina, azul brilhante FCF, vermelho Allura AC, indigotina |
| Pigmentos vegetais | 20 | clorofilas a/b, feofitinas, carotenos, luteína, cianidinas |
| Aminoácidos | 20 | glicina, alanina, valina, tirosina, leucina e demais proteinogênicos |
| Fármacos e pequenas moléculas orgânicas | 14 | cafeína, paracetamol, ibuprofeno, ácidos orgânicos |
| Indicadores e traçadores | 11 | fluoresceína, eosina, azul de metileno e outros |

A identificação molecular individual (CAS/CID/InChIKey), cor, densidade, espectro, solubilidade e retenção dos 76 itens permanece **nula quando não foi conferida**. Isso é proposital: uma formulação comercial vermelha, azul ou verde pode conter vários corantes, e uma banda de “xantofila” não é uma identificação molecular por si só.

## 6. Protocolos e valores de Rf com condições

### 6.1 Aminoácidos — placa CCD, sistema Amrita

Fonte didática: Amrita Vishwa Vidyapeetham, **fase móvel n-butanol:ácido acético:água 12:3:5 (v/v)**, soluções de aminoácidos descritas como 2%, capilar, ambiente da câmara saturado, revelação com ninhidrina. O tipo específico de adsorvente não está suficientemente descrito no trecho consultado.

| Analito | Rf informado |
|---|---:|
| Glicina | 0,20 |
| Alanina | 0,24 |
| Ácido glutâmico | 0,25 |
| Valina | 0,40 |
| Tirosina | 0,42 |
| Leucina | 0,58 |
| Lisina | 0,58 |

A coincidência dos Rf de leucina e lisina demonstra por que esse número **não é identificação inequívoca**. Esses valores são de um protocolo didático: não devem ser tratados como medições nossas ou transferidos para outro suporte.

Fonte: https://vlab.amrita.edu/index.php/images/theme/theme/amrita/MEC/?brch=63&cnt=2&sim=154&sub=3

### 6.2 Pigmentos do espinafre — Quach, Steeper e Griffin (2004)

Artigo: **An Improved Method for the Extraction and Thin-Layer Chromatography of Chlorophyll a and b from Spinach**, Journal of Chemical Education 81(3), 385–387, doi:10.1021/ed081p385.

Método descrito: sílica sobre suporte poliéster; eluente **éter de petróleo:ciclo-hexano:acetato de etila:acetona:metanol = 60:16:10:10:4 (v/v)**.

| Banda atribuída pelo trabalho | Rf transcrito |
|---|---:|
| Fração de caroteno | 0,95 |
| Clorofila a | 0,44 |
| Clorofila b | 0,32 |
| Fração de xantofila | 0,16 |
| Feofitina a, após tratamento ácido | 0,60 |
| Feofitina b, após tratamento ácido | 0,49 |

**Nível da evidência:** a existência do artigo/DOI foi confirmada no registro do editor, mas estes seis números foram extraídos de uma reprodução didática do artigo; por isso, permanecem **pendentes de conferência do PDF primário** antes de serem homologados. Os dois valores de feofitina não representam diretamente o extrato fresco. A variação do suporte e a degradação dos pigmentos alteram o cromatograma.

Fonte primária: https://doi.org/10.1021/ed081p385  
Transcrição didática: https://gradebuddy.com/doc/98524/an-improved-method-for-the-extraction/

### 6.3 Corantes alimentícios em papel

BASF apresenta separação didática de soluções de corantes usando papel de filtro e solução salina. É um bom ponto de partida para a experiência visual de aspiração/aplicação no SIAC, mas a concentração precisa da solução e a composição dos corantes comerciais ainda não foram homologadas no registro. **Nenhum Rf foi inventado** para esse sistema.

Fonte: https://agriculture.basf.us/content/dam/cxm/agriculture/community-relations/kids-labs/Food_Dye_Chromatography_Student_Guide.pdf

### 6.4 Atlas internacional de HPTLC

A HPTLC Association disponibiliza métodos de identificação de materiais botânicos e compara fingerprints com protocolos de referência. A plataforma usa placas HPTLC de sílica 60 F254 (vidro), mas downloads específicos exigem acesso por cadastro. Registramos **metadados e URL**, não imagens ou Rf sem autorização/consulta ao método.

Fonte: https://www.hptlc-association.org/atlas/about-hptlc-atlas.cfm

## 7. Modelos físicos que devem conversar com os dados

### 7.1 Capilar de vidro e papel

O modelo de Lucas–Washburn para um capilar cilíndrico ideal considera distância de penetração proporcional à raiz do tempo, governada por **viscosidade dinâmica, tensão superficial, raio do capilar e ângulo de contato**. A densidade ganha relevância quando gravidade/hidrostática não puderem ser desprezadas. Em papel real, poros têm distribuição, fibra absorve líquido, há evaporação e molhamento parcial.

**Desenvolvimento sugerido:** continuar com a mecânica de arraste/precisão invisível na cena (gesto do usuário) e, em outro módulo, calcular o menisco e a frente úmida com parâmetros físicos do sistema. **Não igualar precisão gestual a propriedade química nem inventar viscosidade/tensão superficial.**

Revisão: https://pmc.ncbi.nlm.nih.gov/articles/PMC8143474/

### 7.2 Coluna cromatográfica

A hidrodinâmica precisa de vazão, permeabilidade do leito, viscosidade, porosidade, diâmetro, temperatura e queda de pressão. Para retenção e separação, acrescentar equilíbrio de adsorção/partição e dispersão, possivelmente cinética de transferência de massa.

O motor atual do SIAC (pratos teóricos em série, retenção k declarada) é útil para **simulação didática idealizada** e para mass balance em F1–F10, mas não resolve de modo universal modelos de coluna com isotermas não lineares. Variar a densidade do solvente sem conhecer suas interações com a sílica não permite prever a ordem de eluição.

Revisão hidrodinâmica: https://www.sciencedirect.com/science/article/abs/pii/S0021967399004823

### 7.3 Misturas e solubilidade

Para misturas, testar modelos de atividade como UNIFAC e NRTL com **parâmetros e conjuntos de grupos adequados**. Miscibilidade de solventes ajuda a prever coexistência de fases, mas é etapa separada da partição do analito entre fase móvel e estacionária.

Revisão comparativa de UNIFAC e COSMO-SAC: https://scispace.com/papers/prediction-of-infinite-dilution-activity-coefficients-using-5e27sydv3c

## 8. Ferramentas e motores de terceiros: decisão técnica

| Sistema | Papel no SIAC | Estado |
|---|---|---|
| chemicals (Python/ChEDL) | propriedades puras: ρ(T), μ(T), γ(T), pressão de vapor | **Primeira prova de conceito**, offline via exportação estática |
| thermo (Python/ChEDL) | coeficientes de atividade e fases (UNIFAC, NRTL, UNIQUAC) | **Primeira prova de conceito**, exige parâmetros |
| CADET-Core (C++) | transporte, adsorção e modelagem mecanística de coluna | **Segunda etapa**; demanda modelo calibrado e verificação GPL/AGPL por arquivo |
| pyGAPS (Python) | ajustar isotermas de adsorção a dados experimentais | somente quando houver curvas medidas |
| OpenChrom (Java) | análise/visualização de cromatogramas e picos | referência para módulos Medir/Calcular; não é motor de retenção |
| PubChem PUG | resolver entidades químicas e metadados, com depositante e proveniência | integração de curadoria |
| NIST WebBook | conferência termodinâmica e faixas de validade | integração de curadoria |
| HPTLC Atlas | protocolos de comparação/fingerprints | consultar condições e direitos |

**Licenciamento:** CADET-Core mistura GPL-3.0+ e AGPL-3.0+ dependendo do arquivo. Isso precisa de análise jurídica/técnica antes de reutilizar código na aplicação GPL do SIAC. Bibliotecas Python MIT podem gerar parâmetros em um pipeline de pesquisa, sem inclusão de runtime ou requisitos de servidor na versão GitHub Pages. As permissões de dados de PubChem, NIST e Atlas são distintas de licenças de software.

Links:
- https://github.com/CalebBell/chemicals
- https://thermo.readthedocs.io/
- https://github.com/cadet/CADET-Core
- https://pygaps.readthedocs.io/
- https://github.com/OpenChrom/openchrom

## 9. Arquitetura de ingestão proposta

### Coleta e curadoria

Cada propriedade deve ter campos mínimos: valor, unidade, temperatura, pressão, pureza/fase, identificação química inequívoca, fonte, tipo (medição, compilação, cálculo, previsão), método, data de acesso, versão e ressalvas. Quando a fonte não informa pressão ou pureza, manter o campo ausente; não preencher 1 atm ou 100% por suposição.

1. Resolver identidade molecular com PubChem CID/InChIKey, preservando sinônimos e a fonte.
2. Baixar anotações físico-químicas com texto, unidades, temperatura e depositante.
3. Conferir valores com NIST e manuais de fabricante. Não converter automaticamente para CNTP.
4. Inserir pares de miscibilidade com intervalo de composição/temperatura quando houver.
5. Relacionar cada medida de retenção a uma receita de experimento e a uma fase estacionária específica.
6. Marcar números vindos de modelos com método, parâmetros, software, versão e incerteza/limite de extrapolação.
7. Publicar no programa somente o subconjunto revisado e homologado; itens restantes podem aparecer no painel científico como lacunas **sem resultados artificiais**.

### Integração por etapas

**Fase A — registro e proveniência:** estrutura JSON, validação de esquema, documentação e referências; sem mudanças na interface publicada. **Esta etapa foi iniciada aqui.**

**Fase B — propriedades puras:** exportador Python chemicals/thermo isolado, 10–15 solventes bem documentados; comparação 3 fontes e faixas de temperatura.

**Fase C — miscibilidade e mistura:** 6 pares de comportamento contrastante: água–etanol, água–acetonitrila, água–hexano, água–acetato de etila, acetonitrila–hexano e hexano–acetato de etila. Testar equilíbrio em T declarada, sem extrapolação para outras misturas.

**Fase D — cromatografia planar:** reproduzir Rf dos protocolos Amrita/Quach somente com condições corretas, permitindo que variem por sistema. Calibrar capilaridade com coeficiente medido, nunca apenas nome do solvente.

**Fase E — coluna:** usar balanço do motor atual como baseline e comparar um sistema parametrizado com CADET-Core. Exigir conservação de massa, sobreposição, vazão, resposta por frações e sensibilidade aos parâmetros.

## 10. Critérios de homologação futuros

- **Identidade**: CAS/CID/InChIKey e pureza/origem conferidos para substância específica (misturas com composição declarada).
- **Dado físico**: valor + unidade + T/P + fonte. “Densidade desconhecida” continua nula.
- **Miscibilidade**: não contradizer tabela fabricante, registrar temperatura e composição quando houver dados quantitativos.
- **Rf/k**: fase móvel, proporção, adsorvente, detector, geometria, condição, classe do dado e documentação obrigatórias.
- **Motor**: limites, versão, consistência de unidades, conservação de massa, teste de reprodutibilidade e confronto com experimento.
- **Segurança**: nenhum solvente de alto risco deve ser oferecido como procedimento físico para alunos por padrão. Exibir SDS/FISPQ e condições de laboratório antes de permitir roteiros presenciais.
- **Software**: manter o limite **exatamente três branches**; não renomear nem alterar o standalone SIAB como prova de paridade.
- **Rastreabilidade**: manter links e identificadores científicos, mas não copiar tabelas inteiras de terceiros para publicação comercial sem conferir direitos de uso.

## 11. Próximas lacunas científicas priorizadas

1. Confirmar 23 densidades com fonte primária extra e acrescentar ρ(T) onde aplicável; registrar discrepâncias.
2. Completar γ(T), μ(T), água em misturas e molhabilidade em papel, sílica e vidro — parâmetros necessários para o capilar dinâmico.
3. Identificar individualmente por CID/CAS os 76 analitos e suas propriedades e riscos.
4. Expandir de 41 para todos os pares úteis de solventes com marcação explícita da região de composição e limites de miscibilidade.
5. Extrair sistemas experimentais com Rf de artigos primários, conferindo fase estacionária, detector e temperatura.
6. Calibrar 3 exemplos de coluna com parâmetros k e dispersão publicados, sem transportar Rf planar.
7. Construir exportador de resultados de químicos em CSV/JSON com proveniência para validação e versionamento.

---

**Natureza deste registro:** resultado de pesquisa e curadoria preliminar com valores e fontes explicitamente documentados; não significa que os compostos estejam disponíveis na interface, nem que a simulação já seja preditiva.
