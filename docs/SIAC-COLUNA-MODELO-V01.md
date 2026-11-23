# SIAC — Especificação físico-química e visual da coluna v0.1

**Implementado em desenvolvimento, sem publicação na main:** `js/simulation/siac-coluna.js` e `previews/coluna-laboratorio.html`.

**Contrato:** motor matemático de coluna isocrática e coletor `siac-fracionamento.js` são módulos separados. O primeiro gera o estado e a distribuição de analitos na saída; o segundo encaminha volumes efetivamente eluídos para F1–F10 ou descarte segundo as janelas escolhidas pelo usuário.

## Montagem do experimento

A doca **Montagem** já conhecida do SIAB/SIAC serve de origem para a experiência. A composição é:

| Variável | Unidade | Uso científico |
|---|---|---|
| `amostra.id`, `componentes[]` | identificador, mg | origem e massa carregada de cada espécie |
| `faseEstacionaria.id` | identificador | seleção do adsorvente/leito |
| `faseMovel.id` | identificador | sistema eluente especificado |
| `comprimentoMm` e `diametroInternoMm` | mm | geometria do leito |
| `porosidade` | fração 0–1 | estimativa da porção móvel da coluna; é uma **porosidade efetiva de modelo** |
| `vazaoMlMin` | mL/min | fluxo volumétrico constante na corrida |
| `volumeTotalMl` | mL, 0,1–10 nesta etapa | domínio de eluição e de coleta, **configurável** |
| `retencao` | fator `k` ou `K×relação de fases` | retenção por analito, declarada para as condições experimentais |
| `pratosTeoricos` | inteiro | alargamento modelado de bandas e perfis |
| `deteccao` e `corVisivel` | modos, cor opcional | descrição observacional, **não determina retenção** |
| `proveniencia` | medição/estimativa/hipótese | evita confundir a demonstração com resultado experimental |

A geometria produz o volume efetivo de fase móvel `V_M = π(d/2)² L ε/1000` (mm³ para mL). Em regime de retenção linear, `V_R=V_M(1+k)`, `t_R=V_R/Q`. O solvente e o adsorvente **não geram automaticamente um k** a partir do nome: seu conjunto de parâmetros precisa ser fornecido de um banco científico ou de um cenário didático explicitamente hipotético.

## Evolução das bandas e do eluato

Adotou-se um modelo de **N pratos teóricos em série**, equivalente a uma cadeia idealizada de etapas com taxa de transferência constante em volume eluído. Para a espécie i, com N pratos e volume médio de retenção `V_R,i`, o parâmetro `z=N×V/V_R,i` determina a probabilidade de permanência no prato j:

`p_j(V) = exp(-z)×z^j/j!`, j = 0…N−1.

A fração cumulativa que saiu da coluna é a probabilidade complementar:

`F_i(V) = 1 - Σ(j=0…N−1) p_j(V)`.

Desse modo, **a soma da massa presente em todos os pratos e da massa eluída é igual à massa inicial**. O eixo do perfil de saída é o volume acumulado V. A concentração média em qualquer trecho [V0,V1] é `M_i [F_i(V1)-F_i(V0)] / (V1-V0)`.

- `prepare(config)`: valida a coluna e declara as condições; o estado original é imutável.
- `advance(state,deltaMin)`: evolui tempo e volume a partir da vazão informada.
- `observe(state,{detector,segmentos})`: informa intensidade calculada nas regiões do leito e somente as bandas **detectáveis** no modo escolhido.
- `profile(state,{passos})`: gera um perfil contínuo discretizado por trechos, com unidades e massa recuperada/restante.
- `outlet(state,volumeMl)`: consulta as concentrações calculadas próximas de um volume de eluição.

**A eficiência por pratos é uma aproximação útil**, não um tratamento completo de isoterma não linear, difusão intrapartícula ou cinética de transferência de massa. Um modelo realista avançado exigirá, além disso, validação de perdas e efeitos extracoluna, condições de empacotamento, saturação, sobrecarga, vazão dependente de viscosidade, compatibilidade e evaporação, quando aplicáveis. A massa é conservada no cálculo idealizado; reações químicas/destruição do analito e volumes mortos extracoluna não são simulados.

## Ligação com os dez frascos

O coletor aceita **janelas livres e independentes**, escolhidas **antes** da corrida na escala atual da coluna. Os números usados em testes são exemplos arbitrários: **não há posição fixa para F1/F2 nem substância predeterminada para um volume**.

Para a corrida, o motor fornece `profile(...).trechos`. Esse array é integrado por `SIAC.fractionCollector.integrate(plano,trechos)`, contabilizando o volume e as massas que chegaram a F1–F10 e o volume/massa descartados. Tubos sem janelas permanecem vazios. Janelas que cruzam picos podem conter misturas, não substâncias puras.

O aluno poderá indicar a banda como referência de investigação, mas **a distância dentro da coluna não é igual ao volume da saída**. A seleção efetiva por volume deve considerar a frente de eluição calculada no fim do leito.

## Direção visual da Montagem

A prévia em `previews/coluna-laboratorio.html` é **uma página de teste interativa**, não a interface final publicada:

- **Esquerda, Montagem:** escolher mistura, fase móvel, adsorvente e, em detalhes, comprimento, diâmetro, porosidade, vazão e escala; montar a coluna.
- **Centro, cena:** coluna vertical, leito e bandas visíveis renderizados de forma irregular/difusa, e saída indicando frasco ou descarte. Nenhuma mancha geométrica perfeita nem coloração artificial de componentes incolores.
- **Abaixo da cena:** perfil de eluição calculado por volume, janelas F1–F10 e marcador de avanço. A curva de um componente incolor aparece tracejada **como informação do modelo** e não como sinal que o olho vê na coluna.
- **Montagem, coleta:** dez tubos selecionáveis e somente dois campos de janela para o frasco ativo; sem menu contextual, sem dez sliders permanentes. Cada frasco inicia **sem janela predefinida**.
- **Direita, Dados:** volume morto, vazão, escala e fração atual; exportação de **registro gráfico SVG** com coluna, perfil e janelas. Os dados são hipotéticos, não fotografias do laboratório.
- **Futuro:** o capilar retira **uma alíquota do frasco coletado**, leva ao papel/CCD e permite desenvolvimento, revelação UV ou outro método pertinente. A coleta direta por perfuração do leito não é apresentada como prática ordinária.

### Gates e limitações

- A prévia usa duas misturas-modelo e dois sistemas solvente×suporte com **fatores k declarados, hipotéticos e sem atribuição a espécies reais**. São somente fixtures interativas para validar a resposta do motor.
- O coletor conserva massa/volume idealizados mas não considera atrasos de válvula.
- A fase inicial assume aplicação como pulso estreito, fluxo e temperatura constantes, sem reação química, sem saturação e sem vazão variável.
- A revelação UV não está implementada na transferência para CCD. Compostos invisíveis não podem ser mostrados dentro da coluna como manchas visíveis na cena comum.
- O perfil completo calculado é conhecido pelo **motor**, não pelo estudante como uma detecção física de todas as espécies; a versão didática definitiva precisará oferecer distinção clara entre previsão/modelo e medição observada.
- Para validar o comportamento de substâncias reais, é obrigatório acrescentar um catálogo com dados experimentais (k, N e condições de referência) e comparação quantitativa de eluições.
- A prévia ainda não substitui `index.html` nem os módulos Explorar/Medir/Calcular do SIAB.

## Referências metodológicas

- IUPAC Gold Book — **Retention factor**: https://goldbook.iupac.org/terms/view/R05359
- IUPAC Gold Book — **Hold-up volume**: https://goldbook.iupac.org/terms/view/H02833
- IUPAC Gold Book — **Total retention volume**: https://goldbook.iupac.org/terms/view/T06413
- Chemistry LibreTexts — **General Theory of Column Chromatography**: https://chem.libretexts.org/Courses/Cornell_College/CHM_411%3A_Advanced_Analytical_Chemistry/02%3A_Chromatographic_and_Electrophoretic_Methods/2.02%3A_General_Theory_of_Column_Chromatography
- Chemistry Teaching Labs, University of York — **Loading, running & identifying fractions**: https://chemtl.york.ac.uk/techniques/purification/flash-columns/loading-running-identifying-fractions

**Importante:** as equações do sistema de pratos em série e a parametrização dos exemplos são **escolhas explícitas deste modelo didático**, não resultados experimentais atribuídos a essas fontes.


## Integração das funções Medir e Calcular

O arquivo \`js/simulation/siac-metricas.js\` formaliza o contrato de análise quantitativa **sem criar medidas**. A interface só pode chamar cada função quando as observações e os dados de origem forem suficientes. Há quatro APIs independentes:

| API | Entradas exigidas | Resultados | Quando NÃO executar |
|---|---|---|---|
| \`planarRf\` | distâncias em mm da frente e do centro das manchas, medidas da mesma origem | Rf adimensional | papel não desenvolvido, frente nula, nenhuma mancha detectada |
| \`compareStandards\` | Rf medido, padrões com Rf, mesma fase estacionária, mesma fase móvel e detector, tolerância **declarada** | comparação de compatibilidade e diferenças | condições não comparáveis, nenhum padrão, tolerância não fundamentada |
| \`columnMetrics\` | V_M, comprimento e volumes de retenção; largura na base se disponível | k, seletividade, Rs, N/H aproximados, tempo de retenção se vazão informada | ausência de picos, ausência de volume morto, falta de largura para Rs e N |
| \`massRecovery\` | massa introduzida e massas coletadas nos tubos; descarte/leito se conhecidos | massa recuperada, fração percentual, massa não atribuída | massa introduzida desconhecida; nunca confundir recuperação com pureza |

### Instrumentos no módulo Medir

**Régua:** marca o início da aplicação, a frente da fase móvel e o centro das manchas no papel. **Cronômetro e volumetria:** leitura de intervalo de eluição, vazão, tempo de retenção. **Largura:** extensão de bandas e picos do cromatograma, com resolução/condições. **Padrões:** comparação qualitativa de resultados quando houver bibliografia/experimento de referência com método compatível; uma comparação é hipótese, não laudo de identificação.

### Cálculos no módulo Calcular

- **Planar:** \`Rf = d_mancha/d_frente\`.
- **Coluna:** \`k=(V_R - V_M)/V_M\`, com \`V_R ≥ V_M > 0\`.
- **Seletividade:** \`α=k_2/k_1\`, somente para \`k_1 > 0\`, em sistema comum.
- **Resolução de picos:** \`Rs = 2(V_R2 - V_R1)/(w_b1+w_b2)\`, larguras no mesmo sistema e volume.
- **Platos/eficiência:** \`N ≈ 16(V_R/w_b)²\`; \`H=L/N\`, sob hipótese de pico aproximadamente gaussiano e medidas adequadas.
- **Recuperação:** \`100 × massa_recolhida/massa_introduzida\`; rastrear descarte e material ainda na coluna.

A partir da mesma coleta F_i, o painel **Tubo em foco** mostra o resultado efetivamente recolhido; **Amostra em foco** mostra P_i, com Rf condicionado ao desenvolvimento e revelação; **Coluna em foco** exibe o sistema e seus dados de retenção. A Visão geral alterna entre os dez tubos e os dez papéis. Este estado de UI está isolado em \`feat/siac-experiencia-didatica\`, não conectado ainda à bancada principal.

**Fontes:** IUPAC Recommendations 2017 (https://doi.org/10.1515/pac-2017-0111); Merck TLC Evaluation (https://www.merckmillipore.com/MY/en/analytics-sample-preparation/learning-center-thin-layer-chromatography/tlc-process/TLC-Evaluation/4tab.qB.RXkAAAFVN.VDx07e%2Cnav). Estas fórmulas são válidas somente com seus pressupostos e dimensões explícitos.
