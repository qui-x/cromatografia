# SIAC — Referência interativa de HPTLC (fase normal e fase reversa)

**Etapa de desenvolvimento:** 23/11/2026, branch `feat/siac-experiencia-didatica`. Não publicada na `main`.

## 1. Objetivo
Permitir ao estudante comparar dois métodos de **cromatografia planar de alta eficiência (HPTLC)**, usando **cafeína e paracetamol** como padrões químicos. Usar as docas SIAB que já existem no programa: **Montagem → Ver (Observar, Medir, Calcular) → Dados**. A fase estacionária, o eluente e a resposta instrumental devem estar claramente condicionados ao protocolo.

**Limite central:** esta primeira implementação é uma **representação interativa de posições de Rf medidas em literatura**, não uma corrida produzida pelo SIAC. Ainda não existe modelo físico calibrado de HPTLC nem densitômetro funcional. O programa não calcula intensidades de absorbância, áreas de picos, tempos de migração, concentrações, massas recuperadas ou sinais simulados.

## 2. Fonte de dados e identidade
Prawez Alam et al. (2022), *Molecules* 27(2), 405. DOI: [10.3390/molecules27020405](https://doi.org/10.3390/molecules27020405), especialmente Seções 2.1, 2.2, 3.1–3.5 e Tabelas 3 e 4.

| Substância | Identidade | Normal (NP-HPTLC) | Reversa (RP-HPTLC) |
|---|---|---|---|
| Cafeína | CAS 58-08-2, PubChem CID 2519 | Rf **0,40 ± 0,01** | Rf **0,43 ± 0,01** |
| Paracetamol | CAS 103-90-2, PubChem CID 1983 | Rf **0,59 ± 0,02** | Rf **0,57 ± 0,02** |

Os desvios são **desvios-padrão reportados (n=3)** do estudo, **não tolerâncias que o simulador gerou**. Os dados químicos e bibliográficos são estáticos, versionados e só representam duas condições conferidas.

### Condições originais
- **NP:** sílica gel normal 60 F254S em vidro, partícula 5 µm; eluente acetato de etila/etanol **85:15 v/v**.
- **RP:** sílica de fase reversa 60 F254S em vidro, partícula 5 µm; eluente etanol/água **50:50 v/v**. **Não afirmar C18**: a ligação superficial não é especificada na fonte.
- Detector: densitometria em **absorbância a 260 nm** em equipamento CAMAG. Aplicação de bandas de 6 mm, desenvolvimento ascendente em câmara saturada 30 min a 22 °C até frente de 80 mm. Esses parâmetros estão nos dados do estudo, mas o SIAC **não os executa instrumentalmente**.
- Faixas de calibração do artigo: NP **50–500 ng/banda** e RP **25–800 ng/banda**, apenas para consulta, não para cálculo de concentração sem curva instrumental.

## 3. Fluxo de interação
1. Em **Montagem**, abrir **HPTLC · referência**. O catálogo de 76 substâncias e a demonstração hipotética continuam independentes. Se a substância selecionada for cafeína ou paracetamol, a Montagem também apresenta **Consultar métodos HPTLC** para abrir diretamente seu padrão.
2. Escolher **fase normal ou fase reversa**. A composição do eluente depende diretamente dessa escolha; não é permitido selecionar fase e solvente incompatíveis.
3. Escolher os **padrões**: cafeína, paracetamol ou ambos.
4. Clicar em **Aplicar padrões**, seguido de **Desenvolver placa**. A progressão em duas etapas é um gesto didático, **não uma simulação de cinética**. Trocar fase ou padrões reinicia a representação, prevenindo contaminação de estados.
5. No palco principal, observar a placa **esquemática**, com banda posicionada pela proporção Rf e marcadores em um **eixo de posições**. Clicar no marcador evidencia o padrão, sem declarar identificação de amostra.
6. Usar o controle original de **Visão geral** para **comparar fase normal e reversa**, reconhecendo que **a fase estacionária também muda**. **Foco** retorna à placa.
7. Na doca **Ver**, examinar método, natureza das bandas, leitura a 260 nm, Rf e desvio-padrão, além de limitações de cálculo. Na doca **Dados**, encontrar fase estacionária, eluente, detector e tabela de valores com fonte rastreável.

## 4. Proteções científicas
- Nunca produzir cromatograma real a partir de Gaussiana arbitrária nem altura/área de pico inventadas. O eixo horizontal mostra apenas **marcadores de Rf**, declarados como não instrumentais.
- Não copiar os valores para cromatografia em papel, CCD comum ou coluna. Rf planar não determina fator k de retenção em coluna.
- Não tratar a variabilidade reportada como largura de mancha, erro de instrumento do SIAC, limite de identificação ou intensidade óptica.
- Não transformar a banda decorativa em um resultado medido. A identificação de amostras reais exige padrões, detector, incerteza e condições equivalentes.
- Nenhum destes parâmetros habilita o motor de simulação quantitativa; o que foi homologado é a **referência científica do método**.
- A implementação não lê diretamente `data/siac/analitos-protocolos.v1.json` da branch científica em tempo de execução. Mantém uma cópia **restrita e conferida** dos quatro Rf e duas condições, com testes de regressão, até que os módulos sejam integrados de forma controlada.

## 5. Implementação e verificação
- `js/ui/siac-hptlc-didatico.js`: consulta versionada, fase e amostra, máquina de etapas e renderizadores das três docas e do palco.
- `css/siac-hptlc-didatico.css`: cena responsiva, temas SIAB, foco de teclado e redução de movimento.
- `js/ui/siac-laboratorio-integrado.js`: extensão da rota real do laboratório sem criar nova doca e sem alterar a demonstração da coluna.
- `js/data/siac-catalogo-contextual.js`: atalho contextual para os dois analitos conferidos.
- `tests/siac-hptlc-didatico.test.cjs`: valores, fontes, condições, estados, limites de uso e cache.
- `tests/siac-laboratorio-integrado-browser.cjs`: fluxo completo em **360, 768 e 1360 px** via Playwright Chromium.
- `.github/workflows/siac-laboratorio-integrado.yml`: sintaxe, testes científicos da referência, navegador real e evidências de tela.
- `sw.js`: versão de cache atualizada para disponibilizar o novo módulo offline.

**Critério de merge:** ambos os testes de HPTLC, regressões da bancada e navegador passando sem erros. Preservar apenas `main`, `feat/siac-motor-cromatografico` e `feat/siac-experiencia-didatica`.
