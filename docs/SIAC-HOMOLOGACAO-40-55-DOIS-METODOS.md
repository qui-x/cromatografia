# SIAC — Homologação científica de 40–55 substâncias
**Decisão do responsável em 23/11/2026:** catálogo candidato de 76 substâncias; selecionar **40 como mínimo**, **55 como meta ampliada**, e exigir **pelo menos dois métodos cromatográficos documentados e pelo menos dois solventes diferentes, com sistemas eluentes contrastantes**, por substância.

## O que significa uma substância completa
1. Identidade química individual conferida (sal/forma de ionização, isomeria, pureza, CID/CAS/InChIKey conforme aplicável). Misturas comerciais precisam de composição especificada, não CID de uma molécula parecida.
2. **Método A**: amostra específica, técnica, suporte/fase estacionária descrito, solvente(s) com proporções, temperatura/pH quando pertinentes, forma de detecção demonstrada, Rf individual ou grandeza de retenção própria da técnica, fonte e condição de validade.
3. **Método B**: **um segundo método real e identificável**, não repetição de uma medição, troca de detector ou duplicação do registro A. Deve incluir os mesmos dados de qualidade e **outro sistema de solventes**, com pelo menos um componente químico de solvente distinto entre A e B.
4. Uma **única mistura ternária** com 1-butanol, água e ácido acético **não conta como três métodos**, nem basta para cumprir o requisito de dois métodos. Uma mudança **somente da proporção** de uma mesma lista de solventes, sem alteração dos componentes, é insuficiente para esta regra restritiva.
5. Os dois ensaios devem apresentar dados de retenção **para o composto identificado**. Sinais de mistura genérica ou duas bandas coletivas não são ensaios de composto puro.
6. Classe de evidência: **medido e revisado** ou valor bibliográfico comparado ao artigo primário, com condições experimentais suficientes. Estimativa por regressão/ML pode ser exibida como *predição*, mas **não substitui os dois métodos experimentais homologados**.
7. Validar distinção de detecção: cor/UV 254/UV 366/ninhidrina dependem da amostra e da fase; cor comercial não comprova espectro. Diferenciar solventes dos aditivos (por exemplo NaCl não é um segundo solvente).
8. O fato de cumprir a cobertura da substância não autoriza automaticamente qualquer técnica. Cada técnica recebe disponibilidade com base nos parâmetros experimentais **da própria técnica**. Rf planar não pode fornecer k, `V_R`, resolução, N, H, massas ou tempo em coluna por conversão direta.

## Interpretação em Montagem, Ver e Dados
- **Montagem:** mostra 76 candidatos separados por grupo; só permite selecionar sistemas com vínculo conhecido. Não habilita corridas quantitativas reais ainda incompletas.
- **Ver / Observar:** revela suporte, método, cromaticidade e detector sob condições; hipóteses didáticas identificadas.
- **Ver / Medir:** régua, frente e manchas com origem comum, resolução e variabilidade; ou coluna com vazão e volume medidos.
- **Ver / Calcular:** Rf por distâncias observadas, comparação de padrões somente sob condições compatíveis; para coluna, k e métricas somente com dados de retenção e largura/volume apropriados.
- **Dados:** por composto, exibir **Método 1 / Método 2**, solventes com composição, origem e grau de confirmação, técnica, detector, retenção e limitações.

## Situação da base local — atualização da pesquisa de 23/11/2026
- **76** compostos candidatos (catálogo estável; nenhum candidato novo por nome aproximado).
- **15 protocolos** cadastrados, incluindo 10 métodos adicionais incorporados nesta rodada de pesquisa.
- **98 registros pontuais de Rf** e **um intervalo de Rf** preservado como intervalo original (feofitina b: 0,47–0,54). Quantidade de linhas ≠ quantidade de substâncias.
- **32 substâncias** com pelo menos um método de retenção individual reportado: 20 aminoácidos, 8 corantes alimentícios e 4 pigmentos vegetais.
- **30 substâncias** com pelo menos dois métodos individuais e sistemas de solventes realmente diferentes: **18 aminoácidos + 8 corantes alimentícios + 4 pigmentos**.
- **Zero substâncias homologadas** pela regra estrita, pois os registros ainda não têm identidade individual e condição experimental homologadas. Especialmente, valores de uma **tabela comercial de referência didática** não equivalem a medições primárias verificadas.
- O quadro abaixo informa **cobertura bibliográfica preliminar**, não autorização automática para o motor. Cada protocolo continua com `status != homologado`.
- Projeções geométricas e bancos de solubilidade não completam lacunas de retenção.

### Fontes e métodos incorporados
1. **Ukil, Samanta & Laskar (2013)**, *Oriental Journal of Chemistry*, [artigo primário](https://www.orientjchem.org/vol29no2/identification-of-amino-acids-on-thin-layer-chromatography-plates-with-a-new-reagent/): CCD de sílica gel G (0,1 mm), **1-propanol/água 70:30**, revelação por 4-dimetilaminobenzaldeído e isatina após aquecimento; 20 aminoácidos do SIAC possuem Rf na Tabela 1.
2. **Dobado (rev. 2024)**, [protocolo didático de pigmentos](https://www.chemistry-online.com/lab/experiments/separation-pigments-spinach-leaf/): sílica gel 60F em alumínio, **hexano/acetona 7:3**, leitura visível; Rf de clorofilas a/b e feofitinas a/b, esta última como intervalo. A natureza do extrato e a variabilidade importam.
3. **Pro-Techex**, [quadro de kit didático, p. 5](https://5.imimg.com/data5/SELLER/Doc/2025/6/518306737/JX/IU/GS/9824300/pro-techex-thin-layer-chromatography-teaching-kit.pdf): dois eluentes independentes, **etanol 96%/água 7:3** e **1-butanol/ácido acético/água 8:2:2**, com valores tabulados para 15 aminoácidos do catálogo. **Não tratar como artigo primário nem homologa-lo sem conferir placa, incerteza, condições originais e origem dos valores.**

**Limitação do protocolo com 1-butanol:** variar apenas as proporções de 12:3:5 (Amrita) para 8:2:2 (kit) **não** satisfaz a regra de dois solventes diferentes entre esses dois métodos isoladamente; a comparação com etanol/água ou 1-propanol/água oferece diferença real de componentes.

4. **Padiyar et al. (2024)**, [artigo com distâncias da corrida](https://www.ijpsjournal.com/article/enhanced-thin-layer-chromatography-of-amino-acids-using-mixed-hydrotropic-solutions): sílica gel 60 F254, **1-butanol/ácido acético glacial/água 4:1:1**, ninhidrina e **oito pares distância da mancha / distância da frente**. A fonte usa uma solução de ninhidrina cuja preparação é descrita de forma contraditória (etanol versus água), e a valina apresenta **Rf publicado 0,52** diante de **1,85/3,5 = 0,5286**, que arredondaria a 0,53 a duas casas. Registramos a divergência e **não homologamos** até conferência independente.

5. **FAO/JECFA**, [Combined Compendium, FOOD COLOURS: Identification by chromatography](https://www.fao.org/4/a0691e/A0691E07.htm): tabela histórica reimpressa (Pearson 1973/IARC 1981) com **valores esperados de Rf** em dez eluentes para corantes alimentícios. Foram cadastrados **sistemas 1, 7 e 10** para oito corantes do SIAC, em sílica gel G. Os números entre parênteses são **manchas subsidiárias de menor intensidade** (não são Rf da molécula principal); `quinoline_yellow` permanece sem valor individual por ser mistura de composição variável. Corantes como eritrosina aparecem com **Rf 1,00 em certas condições**, valor na frente do solvente e pouco discriminatório. Fonte de compêndio, **não medições primárias reprocessadas**, exigindo padrão.
6. **Sobańska et al. (2017)**, [artigo primário](https://onlinelibrary.wiley.com/doi/10.1155/2017/9528472), *Journal of Analytical Methods in Chemistry*: otimização com 20 sistemas de fase móvel, dos quais cadastramos dois para tartrazina, amarelo crepúsculo FCF, Ponceau 4R e azul brilhante FCF: **metanol/tolueno 11:9** e **acetato de etila/2-propanol/água 75:35:30**. Valores da triagem não recebem automaticamente as condições do **protocolo analítico final**, que usa outra fase móvel.

**Cobertura por grupo na matriz atual:** 18/20 aminoácidos com dois métodos; 8/11 corantes alimentícios com dois; 4/20 pigmentos vegetais com dois; 0/14 fármacos e orgânicos, 0/11 indicadores e traçadores. Essa distribuição indica onde priorizar as próximas buscas, mas **nenhum dos 30 está totalmente homologado**.

A matriz auditável em `data/siac/matriz-cobertura-dois-metodos.v2.json` identifica, por candidato, quais métodos, sistemas eluentes, fontes, números e intervalos estão disponíveis e as pendências antes da homologação.

## Auditoria executável
- Motor: `js/simulation/siac-homologacao.js`.
- Testes: `tests/siac-homologacao.test.cjs` (inclusive casos de contraste real, mesma mistura em proporções diferentes, aditivo NaCl, predição de Rf, detector e identidade não homologados).
- `node scripts/siac-auditar-homologacao.cjs --write --check` gera relatório para os 76 em `docs/evidencias/siac-ciencia/matriz-homologacao-76.json`.
- Manter somente `main`, `feat/siac-experiencia-didatica` e `feat/siac-motor-cromatografico`. A `main` recebe somente implementações validadas em CI.

## Roteiro de ampliação
1. Buscar ensaios por identidade molecular, não só pelo nome comercial; investigar primeira e segunda condição de eluente para cada composto.
2. Selecionar métodos reproduzíveis e representar **duas fichas completas e independentes** por composto.
3. Converter resultados para formato estruturado **com proveniência, fonte original e condições**, nunca inventar Rf.
4. Auditar a matriz de cobertura e elevar o número `completamenteHomologados` progressivamente em direção a 40 e, em seguida, 55.
5. Validar individualmente o que está disponível por técnica e testar regressões de Montagem/Ver/Dados e módulos do laboratório.

**Regra operacional:** dois métodos completos + duas fases móveis com solventes quimicamente diferentes, identidade e dados conferidos. Menos que isso permanece “em pesquisa”, ainda que o composto apareça no catálogo.
