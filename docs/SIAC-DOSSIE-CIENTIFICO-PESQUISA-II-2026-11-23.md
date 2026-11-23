# SIAC — Dossiê científico, Pesquisa II (23/11/2026)

**Estado:** revisão bibliográfica e arquitetura de ingestão. **Não homologado e não incorporado ao runtime.**
**Repositório/ramo:** qui-x/cromatografia — feat/siac-motor-cromatografico.
**Predecessor:** docs/SIAC-DOSSIE-CIENTIFICO-2026-11-23.md (Pesquisa I).
**Escopo:** densidade, miscibilidade, solubilidade, retenção planar, coluna/fracionamento, molhabilidade e avaliação de motores.

## 1. Leitura prévia e invariantes do SIAC

Revisados antes desta ampliação: Pesquisa I, quatro catálogos JSON da Pesquisa I, docs/SIAC-COLUNA-MODELO-V01.md, SIAC-MOTOR-CROMATOGRAFICO.md, SIAC-PLANO-EXPERIENCIA.md, SIAC-CAPILARIDADE-CENAS.md, AGENTS.md, política de branches, contratos dos motores de coluna, coleta e planar e código da bancada visual. Não se assume que toda funcionalidade relatada nos protótipos esteja integrada na versão publicada.

- Identidade: SIAC — Simulador Interativo de Análise Cromatográfica; A Identidade das Cores Ocultas.
- Três branches permitidos, e somente três: main, feat/siac-experiencia-didatica, feat/siac-motor-cromatografico. Sem novas ramificações.
- Preservar o SIAB 1.0.0 standalone e a hierarquia Montagem / Ver / Dados, com foco em cena, responsividade, mouse/toque/teclado, clareza, tema e acessibilidade.
- Coletor F1–F10 com intervalos livres e escala ajustável de 0,1 a 1000 mL; separação por volume real eluído, sem substâncias ou volumes pré-associados e sem frações obrigatórias.
- Estados de foco coluna → tubo → amostra e visão geral de frascos ↔ papéis; composição e origem da alíquota preservadas ao transitar para papel ou CCD.
- Regra de aplicação: faixa de trabalho útil ampliada abaixo da marca pontilhada; tolerância/área geométrica e critério de estabilidade são internos ao aplicativo e não exibidos como porcentagem, precisão ou alvo secreto ao estudante. Julgamento após ação de deposição (soltar/toque/clique ou parada), nunca enquanto o capilar cruza a região. A estabilidade local exige permanência majoritária superior a 70% dentro de uma região interna, sem transformar isso numa propriedade química.
- Distinguir no visor resultado detectado vs. modelo previsto vs. identidade química; conservar a possibilidade de amostras incolores e UV condicionado a substrato/detector.
- As contagens da Pesquisa I (41 solventes/sistemas, 76 analitos, 18 fases estacionárias, 41 pares de miscibilidade qualitativos e 13 valores Rf de literatura) **não são homologações**.

## 2. Novas fontes de dados, com prioridade de curadoria

| ID | Tipo | Cobertura declarada | Valor e limite | Fonte |
|---|---|---|---|---|
| TLCEXP_2026 | CCD/TLC, tripletas soluto–sistema de solventes–Rf | 22.902 tripletas únicas, 15.701 compostos; sistemas com 1, 2 ou 3 solventes | Identidades e razões volumétricas explícitas; não presume detector, tipo de suporte, incerteza ou licença sem examinar o CSV/metadados | https://doi.org/10.5281/zenodo.18467289 |
| XU_TLC_2022 | TLC robotizada, experimento original | 4.944 medidas Rf, 387 compostos, 3 famílias de eluentes e 17 composições de solventes | Bom benchmark condicionado ao sistema experimental; conferir placas, protocolos, replicatas e splits | https://doi.org/10.1016/j.chempr.2022.08.026 ; https://github.com/woshixuhao/ML-Prediction-for-Rf-values |
| XU_CC_2025 | Relação TLC–coluna, experimento e modelos | 5.984 medições de volume de retenção em coluna para 192 compostos; usa conjunto TLC anterior | Evidência de correlação **dentro do domínio estudado**; não converter Rf em k ou V_R universalmente | https://doi.org/10.1038/s41467-025-56136-x ; https://github.com/woshixuhao/Discovery_of_column_chromatography |
| BIGSOLDB_22 | Solubilidade soluto–solvente puro | 125.752 medições, 1.627 solutos, 221 solventes e 1.842 artigos | Mantém temperatura, solubilidade em fração molar, método, fase sólida e DOI; arquivo auxiliar de densidades com 2.210 linhas | https://doi.org/10.5281/zenodo.22648301 |
| MIXTURESOLDB_2026 | Solubilidade de soluto em mistura binária de solventes | 175.166 medições, 810 solutos, 750 misturas de solventes, 1.115 artigos, T=252–383 K | **Não equivale à miscibilidade entre os dois solventes**; representa capacidade de dissolver um terceiro composto | https://doi.org/10.5281/zenodo.18660057 ; https://doi.org/10.1038/s41597-026-07047-z |
| REPORT | LC analítica / HPLC, tempos de retenção | Diversos métodos com metadados no repositório, sem contagem fixa homologada aqui | Não transformar tempo t_R de gradiente ou C18 em retenção isocrática de coluna em sílica ou em Rf planar | https://github.com/michaelwitting/RepoRT ; https://doi.org/10.1038/s41592-023-02143-z |
| CHROMAGRT_2026 | Benchmark preditivo LC de fase reversa | Conjunto derivado e curado do RepoRT; contagens dependem da edição | Útil para teste da dependência de método, **não dados independentes somáveis ao RepoRT** | https://zenodo.org/records/22305395 |
| THERMOML_NIST | Termodinâmica experimental pura e de misturas | Padrão XML com registros de VLE/LLE/SLE e transporte, conforme arquivo de origem | Extrair pares binários LLE com temperatura/composição e direitos de uso, sem generalizar à análise cromatográfica | https://www.nist.gov/mml/acmd/trc/thermoml ; https://trc.nist.gov/ThermoML/ |
| DDB_LLE | Equilíbrio líquido–líquido | Banco Dortmund com lacunas de miscibilidade e curvas binodais de múltiplos sistemas | Pesquisa bibliográfica e eventual licenciamento; não presumir livre redistribuição | https://www.ddbst.com/SetsAndPoints.html |
| PUBCHEM | Identificadores e anotações | Cobertura variável por substância e fonte | PUG-REST para CID, InChIKey, estrutura e características calculadas; PUG-View para anotações com fonte; não tratar qualquer propriedade como medição | https://pubchem.ncbi.nlm.nih.gov/docs/pug-rest ; https://pubchem.ncbi.nlm.nih.gov/docs/pug-view |

Nota de versão: quando um conjunto tiver múltiplas versões, fixar DOI/arquivo/hash de **uma** versão e não misturar contagens. A versão MixtureSolDB de fevereiro/2026 usa 175.166; versões anteriores apresentam contagens distintas. A descrição de TLCexp no Zenodo não explicita licença de redistribuição no trecho consultado; manter ingestão bloqueada até revisão de direitos, esquema e condições experimentais.

## 3. O que deve ser registrado para cada entidade

### 3.1 Substância e amostra

Registrar identidade (nome, sinônimos, CAS, CID, InChIKey, fórmula, SMILES, forma/estado químico), composição comercial, pureza, lote, cor/detecção, estabilidade e SDS/FISPQ. Cores e nomes comerciais não provam identidade molecular. Para grupos coletivos (carotenos/xantofilas, hexanos, éter de petróleo), não forçar identidade individual.

### 3.2 Propriedade termofísica

Registrar nome da grandeza, valor, unidade original, T, P, fase, composição/pureza, intervalo de validade, fonte original (DOI/URL e tabela), tipo de observação [experimental, compilação, correlação, previsão], método, incerteza, conversões auditáveis e status de revisão. Preservar condições originais, sem impor CNTP. Não misturar densidade a 25 °C com viscosidade a 20 °C como se fossem medidas simultâneas.

### 3.3 Mistura de solventes

Registrar os componentes identificados, composição em base **molar, mássica ou volumétrica** explicitamente indicada, densidade de mistura ρ(x,T), viscosidade η(x,T), atividade γ_i(x,T), fase(s), pressão, temperatura, pH quando aplicável, curvas de LLE/binodal/tie-lines e limites de validade. Não inferir densidade de mistura por soma linear universal nem miscibilidade pela polaridade, nem confundir solubilidade de analito com miscibilidade do par de solventes.

### 3.4 Receita cromatográfica contextual

Chave única de experimento com técnica [papel, CCD, HPTLC, coluna], fase estacionária (fabricante/tipo/ativação/espessura/granulometria), solventes e proporções, temperatura, umidade e saturação da câmara, amostra e carga, geometria, eluição isocrática/gradiente, vazão, pressão, detecção (visível/UV/revelador), posição inicial e frente, resultado Rf ou V_R/t_R, resolução, número de replicatas, desvio/incerteza, fonte e status. Um mesmo analito pode ter muitos resultados incompatíveis entre métodos.

### 3.5 Proveniência e validação

Status permitidos: candidato → identificado → fonte e método conferidos → reproduzido/comparado → homologado para **aquele método**. Dados gerados por ML, UNIFAC, NRTL ou parâmetros estimados são rotulados como previsão e jamais promovidos silenciosamente a medição.

## 4. Estratégia por motor físico-químico

**Papel e capilar (gesto ≠ física).** Manter detecção gestual privada independente do modelo do menisco. Como aproximação inicial para capilar cilíndrico ideal em regime sem gravidade, h² ≈ (r γ cosθ / 2η) t; exige r, tensão superficial γ, viscosidade η e molhabilidade θ. Em papel fibroso real, usar capilaridade efetiva, absorção, evaporação, distribuição de poros e calibração. Separar formação de frente de solvente da migração específica de analitos.

**Planar.** Rf = deslocamento do centro da zona / deslocamento da frente a partir da mesma origem; registrar incerteza de leitura, arraste da mancha e detectabilidade. Não usar fator de retenção de coluna k como Rf: IUPAC distingue retardation factor R_F de retention factor k. O motor v0.1 usa coeficientes de demonstração e Rf fornecido explicitamente; não conhece espécie real a partir do nome.

**Coluna.** Modelo inicial V_R=V_M(1+k) com leito e pratos em série preserva massa; porosidade do modelo é efetiva. Para evolução real: balanço convectivo-dispersivo, dispersão axial, transferência de massa, adsorção/partição e isotermas, viscosidade/vazão e queda de pressão, sobrecarga, perdas de detecção. O hold-up/interstitial volume precisa de definição e método de medida, não um número único universal para todas as colunas. Em 2026 há revisão específica sobre essa ambiguidade: https://doi.org/10.1016/j.chroma.2026.466492 (conferir DOI antes de cadastro formal); fonte de acesso: https://www.sciencedirect.com/science/article/pii/S0021967326001792.

**Misturas.** chemicals fornece correlações de substâncias puras; thermo oferece UNIFAC/NRTL/UNIQUAC quando aplicáveis. Avaliar modelo de atividade contra medidas LLE de ThermoML/DDB e valores de solubilidade experimentais antes de permitir que qualquer predição determine a mistura ou a retenção. CADET-Core é candidato a benchmark mecanístico fora do navegador; examinar licença GPL/AGPL **por arquivo** antes de integrar código. OpenChrom (EPL-2.0) serve de referência para análise de sinais; não é mecanismo de migração.

## 5. Plano objetivo de ingestão e testes

1. Fase zero: congelar esquema comum e política de licenças; catalogar as dez fontes acima com versão, método e riscos de sobreposição. Não importar dados em massa automaticamente.
2. Identidades: conferir os 76 candidatos da Pesquisa I contra CID/InChIKey, por grupos de 10–15, com detecção de sais, misturas comerciais, estereoisômeros e bandas coletivas.
3. Propriedades: priorizar os 23 registros de densidade existentes; recuperar curvas ρ(T), η(T), γ(T) e intervalos/condições de 10–15 solventes, com comparação independente de fontes.
4. Solubilidade: cruzar identidade dos 76 analitos com BigSolDB 2.2; conservar temperatura e forma sólida, distinguindo dado medido de molaridade derivada.
5. Miscibilidade: expandir os 41 pares apenas com matriz de fontes; para seis pares contrastantes [água–etanol, água–acetonitrila, água–hexano, água–acetato de etila, acetonitrila–hexano, hexano–acetato de etila] exigir T, composição e, se houver, LLE/tie-lines.
6. Retenção planar: inspecionar esquema, licença, substrato e qualidade do TLCexp antes de incorporar uma única linha; reproduzir exemplos citados da Pesquisa I e 2–3 famílias de sistemas experimentais com condições completas.
7. Retenção em coluna: usar dados Xu 2025 **para benchmark contextual**; calibrar três casos e validar balanço de massa F1–F10, picos parcialmente sobrepostos, descarte, vazão e escalas 0,1–1000 mL.
8. Controle de qualidade: detectar duplicatas por (identidade, técnica, fase, eluente, composição, T, detector, fonte), valores Rf fora de [0,1], unidades incompatíveis, fonte faltante, situação de licença desconhecida e inferências indevidas por nome/cor.
9. Só então produzir pacote estático, versionado e testado para navegador offline. O motor hipotético deve continuar separado dos valores experimentais, e a interface não deve revelar os analitos no gráfico antes da análise observacional.

## 6. Limitações honestas desta etapa

Foi feita curadoria **de metadados e publicações**, não ingestão nem auditoria de todas as linhas de TLCexp, BigSolDB, MixtureSolDB, RepoRT ou do arquivo original de Quach. Volumes de linhas são os declarados nas páginas/estudos e não quantidades já validadas pelo SIAC. A ausência de permissão clara para redistribuição ou de condições experimentais impede inserir o dataset no runtime. Nenhuma propriedade numérica nova foi inferida ou imputada a qualquer dos 76 analitos.

**Não executar migração para main nem alterar cenas, coleta, UI ou motor a partir desta pesquisa sem homologação posterior.**
