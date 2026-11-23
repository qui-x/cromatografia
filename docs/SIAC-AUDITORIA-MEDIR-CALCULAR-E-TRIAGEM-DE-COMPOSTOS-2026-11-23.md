# SIAC — Auditoria de compostos e suficiência dos dados para Medir e Calcular
**Data:** 23/11/2026
**Estado:** auditoria inicial confirmada para os 76 candidatos *locais*; base externa apenas em nível de campos publicados, **sem cruzamento integral das linhas dos CSV/XLSX**.
**Ramo:** `feat/siac-motor-cromatografico`. Nenhuma alteração no runtime, na bancada ou na `main`.

## 1. Fontes lidas e regras da comparação

- Arquivos locais auditados: `data/siac/analitos-protocolos.v1.json`, `solventes-propriedades.v1.json`, `fases-estacionarias.v1.json`, `motores-fontes.v1.json`, `js/simulation/siac-metricas.js`, `js/simulation/siac-coluna.js`, `js/simulation/siac-cromatografia.js`.
- Resultado auditável por candidato: `data/siac/triagem-compostos-medicao-calculo.v1.json`.
- Fontes externas: páginas de dados, cabeçalhos e descrições de TLCexp (https://zenodo.org/records/18467289), BigSolDB 2.2 (https://zenodo.org/records/22648301), MixtureSolDB (https://zenodo.org/records/18660057), Xu et al. (https://www.nature.com/articles/s41467-025-56136-x e https://github.com/woshixuhao/Discovery_of_column_chromatography).
- **Não afirmar interseções de entidades entre fontes sem baixar e auditar os CSV/XLSX, canonizar SMILES/InChIKey e confirmar CAS/CID.** Nesta etapa a disponibilidade de base externa para cada um dos 76 foi registrada como `nao_verificado`, sem fabricar presença/ausência.

## 2. Inventário demonstrável do catálogo SIAC

| Grupo | Candidatos | Com Rf contextual do arquivo local | Observações |
|---|---:|---:|---|
| Aminoácidos | 20 | 7 | Alanina 0,24; ácido glutâmico 0,25; glicina 0,20; leucina 0,58; lisina 0,58; tirosina 0,42; valina 0,40. Protocolo Amrita: n-butanol/ácido acético/água 12:3:5, detector ninhidrina; descrição exata da placa ainda incompleta. |
| Pigmentos vegetais | 20 | 4 | Clorofila a 0,44; b 0,32; feofitinas a 0,60 e b 0,49 (estas após tratamento ácido); valores transcritos de Quach 2004 por fonte secundária e **não conferidos no original**. |
| Corantes alimentícios | 11 | 0 | Candidatos no inventário, sem Rf numérico ou método individual validado. |
| Fármacos e orgânicos | 14 | 0 | Densidade, solubilidade, detecção, identificação e Rf ainda não individualizados neste cadastro. |
| Indicadores e traçadores | 11 | 0 | O nome/cor conhecida não valida detector, fluorescência ou migração sob sistema escolhido. |
| **Total** | **76** | **11** | 13 registros de Rf vinculados a métodos, dos quais dois são bandas coletivas de caroteno e xantofila e não composto molecular individual. |

**Zerados no cadastro local dos 76:** identidade CAS/CID individual conferida, cor por condição experimental, detector validado por composto, massa em cada frasco medida, parâmetro k de coluna com ensaio e evidência de todos os insumos para `Medir` e `Calcular`. A contagem de 11 não é homologação nem garante fórmula completa.

## 3. Suficiência de cada conjunto público

| Base | Campos conferidos | Pode responder agora | Não pode responder diretamente |
|---|---|---|---|
| TLCexp v1, 22.902 linhas | SMILES, solventes 1–3, frações 1–3, `Rf_value`, DOI, `label`; **sem campo de nome, placa, detector, frente/mancha em mm, largura de banda, cor, massa** no CSV publicado | Referência bibliográfica **de Rf sob eluente**; triagem de sistemas e famílias | Medição das distâncias na cena, equivalência de placa/detector, identificação por cor, k, Rs/N, recuperação |
| BigSolDB 2.2, 125.752 linhas | SMILES, nome/CAS/CID, T, solvente, fração molar de solubilidade, grandezas convertidas, DOI, forma sólida opcional; arquivos separados de métodos, fases e 2.210 densidades de solventes | Comprovar identidade e solubilidade para planejamento de fase móvel e dissolução **sob condições**, densidades para termofísica | Rf, k, tempo/volume de retenção, forma/cor da mancha, largura do pico, recuperação |
| MixtureSolDB 2026, 175.166 linhas | Identidade soluto, T, par de solventes, frações molares/mássicas, solubilidade e DOI | Solubilidade do **analito numa mistura binária** sob T/composição; contrastes com solvente puro | **Não é tabela de miscibilidade dos próprios dois solventes**; não fornece Rf, k, detector, densidade de mistura, pico ou recuperação |
| Xu TLC, 4.944 linhas | Planilha da publicação, descrita como Rf medido em condições de TLC | Benchmark por pares analito/método depois de ler o XLSX | Aplicar a todos os compostos e condições sem conferência |
| Xu coluna, 5.984 linhas | Volumes de início e fim de eluição por curva de absorbância; 192 compostos e escalas 4 g, 25 g, 4+4 g | Referência de janelas/intervalos de eluição e resposta da coluna nas condições específicas | Não implica V_M, V_R no ápice, largura gaussiana de base, massas coletadas por frasco ou N/Rs automaticamente |
| RepoRT (adicional) | Tempos de retenção e métodos de LC analítica diversos | Referência para técnicas de análise de retenção **quando métodos equivalentes** | Não serve diretamente para a coluna didática de sílica/papel, nem Rf planar |

**Atenção a BigSolDB:** `Solubility(mol/L)` é quantidade por litro de solvente, não necessariamente litro de solução. Fonte: descrição oficial v2.2.
**Atenção a TLCexp:** cabeçalho original tem somente `SMILES,Solvent_1,Solvent_2,Solvent_3,Fraction_1,Fraction_2,Fraction_3,Rf_value,doi,label`. `label` não é campo de espectro/fluorescência ou validação do detector.
**Atenção a Xu:** os autores relatam *60 compostos comuns* aos conjuntos TLC e coluna de **seu próprio estudo**; não extrapolar esse cruzamento a TLCexp/BigSolDB/MixtureSolDB.

## 4. Correspondência exata com `SIAC.metrics`

| API já existente | Variáveis realmente exigidas | Conjuntos com informação parcial | Veredito de homologação |
|---|---|---|---|
| `planarRf` | distância da frente (mm) > 0, distância de cada centro de mancha (mm) no mesmo suporte | TLCexp/Xu TLC fornecem Rf publicado, não distâncias originais; 11 candidatos locais com Rf contextual | Pode usar Rf como **padrão bibliográfico**, mas não afirmar medição da bancada sem desenvolver/manchar/medir |
| `compareStandards` | `planarRf`, fase estacionária ID, fase móvel ID, detector, padrão Rf, tolerância justificada e mesmas condições | TLCexp traz fase móvel e Rf; Amrita traz revelador mas placa é inespecífica; Quach traz suporte mas Rf secundário | **Nenhuma homologação automática**; completar parâmetros e conferir no original |
| `columnMetrics` — k | `volumeMortoMl` V_M e volume de retenção no ápice V_R, comprimento | Xu coluna traz volumes iniciais/finais, não obriga V_M/apice; motor SIAC gera V_M e V_R **de parâmetros declarados**, não medidos | Só calcular k com V_M e V_R comparáveis, com fonte e natureza da medida |
| `columnMetrics` — tempo, α | vazão Q, dois k positivos em mesma coluna, V_R | Xu contém condicionantes parcialmente; motor tem Q e k hipotéticos | Apenas dentro de ensaio completo ou modelo explicitamente rotulado |
| `columnMetrics` — Rs, N, H | picos com V_R e largura na base na mesma unidade; comprimento de leito | Nenhum dos três grandes CSV fornece largura de pico. Xu registra início/fim por absorbância, **não confundir isso com largura na base gaussiana sem método** | **Indisponível experimentalmente** até obter traçado/perfil e método |
| `massRecovery` | massa inicial e massa de cada fração; opcional descarte e massa retida | Nenhum dos cinco bancos cobre por frasco F1–F10; o motor SIAC pode calcular balanço idealizado | Disponível **apenas como simulação** ou mediante medições de frações |

**Distinção:** `Medir` é uma ação instrumentada na cena; ter Rf da literatura não revela onde o aluno depositou a amostra. Os valores bibliográficos servem a calibração, comparação e teste, não a substituir os registros da experiência.

## 5. Primeira turma de experimentos candidatos (não homologação)

1. **Aminoácidos (7):** mesmo protocolo e cromatografia incolor com revelação por ninhidrina; prioridade para completar suporte, padrão e detecção. Leucina e lisina com Rf igual 0,58 exemplificam limitação de identificação.
2. **Clorofilas a/b e feofitinas a/b (4):** demonstrações de componentes detectáveis visivelmente e alteração química por acidificação, mantendo isolamento entre mistura inicial e produtos transformados; confirmar valores primários.
3. **Corantes alimentícios (11):**  prioridade didática por interesse visual, mas **não registrar migração quantitativa antes de protocolo individual validado**.
4. **Moléculas farmacêuticas e orgânicas (14) e indicadores (11):** usar propriedades de solubilidade e padrões dos bancos externos somente após cruzamento por identidade e método. Cor visual ou fluorescência precisam de evidências por meio e detector.
5. **Ampliação TLCexp:** separar *moléculas identificáveis com fonte e técnica*, *Rf com método incompleto*, *Rf não comparável*, e depois priorizar contraste de Rf, segurança, diversidade estrutural e possibilidade de mistura realista, não quantidade de linhas.

## 6. Próximo cruzamento empírico obrigatório dos bancos externos

Arquivos oficiais a inspecionar (sem duplicar nem publicar integralmente antes de revisar licença):
- `rf_dataset_0203_total.csv` (TLCexp; Zenodo 18467289);
- `BigSolDBv2.2.csv`, `BigSolDBv2.2_densities.csv`, `BigSolDBv2.2_methods.csv`, `BigSolDBv2.2_solid_forms.csv` (Zenodo 22648301);
- `MixtureSolDB.csv` (Zenodo 18660057);
- `TLC_dataset.xlsx`, `dataset_1013.xlsx`, `dataset_25g_1218.xlsx`, `dataset_4+4g_1020.xlsx` (repositório Xu 2025).
- `data/siac/triagem-compostos-medicao-calculo.v1.json` como universo inicial de 76 candidatos, não como dicionário universal.

Normalizar CAS/CID/InChIKey/SMILES (considerar sais, tautômeros, protonação, isômeros e misturas), sem juntar moléculas diferentes por sinônimo. Gerar para cada candidato os indicadores **encontrado em TLCexp?**, **BigSolDB 2.2?**, **MixtureSolDB?**, **Xu TLC/CC?**, contagem por método, cobertura de solventes T, Rf suportados, detecção, riscos e qualidade de fonte. Calcular interseção real por identidade **somente com arquivos lidos**. Produzir tabelas estatísticas de preenchimento, sem preencher faltas com ML e sem promover dados auxiliares a medições cromatográficas.

Manter três branches. Não integrar ao aplicativo oficial antes de verificar método, evidência, licença e testes.
