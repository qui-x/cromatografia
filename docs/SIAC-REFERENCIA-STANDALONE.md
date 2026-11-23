# SIAC — Referência oficial de paridade: standalone do SIAB 1.0.0

## Regra de preservação

O arquivo `SIAB-1.0.0-standalone.html` permanece **intocado e com o mesmo nome** na raiz deste repositório. Não é um arquivo SIAC, não deve sofrer substituições de `SIAB` por `SIAC`, nem entrar nas rotinas que reescrevem textos, estilos ou identificadores de aplicação.

**Proveniência confirmada:** o blob Git `d3c773591843da44a66e537d7cc6362754ad05b0` (1.176.453 bytes) é idêntico no SIAC e no repositório de origem `qui-x/acidobase`, na referência publicada `acidosebases1.0.0`.

[Consultar o standalone de origem](https://github.com/qui-x/acidobase/blob/acidosebases1.0.0/SIAB-1.0.0-standalone.html)

## Contrato de comparação

A arquitetura SIAB é uma **referência comportamental**, não uma obrigação de manter conteúdo ácido-base no simulador cromatográfico. O objetivo é preservar e testar os contratos da navegação enquanto se substituem os modelos científicos.

| Superfície | Invariante de paridade | Alteração permitida no SIAC |
|---|---|---|
| Barra da bancada | Foco à esquerda de Visão geral, posição estável e aparência do workspace | Alternar coluna, tubo e papel |
| Montagem | Mesma doca, ativação, fechamento e acessibilidade | Seleção de amostras, fases e janelas de coleta |
| Ver | Mesma doca e ciclo de vida | Conteúdo contextual Observar / Medir / Calcular |
| Cena | Hierarquia da visualização sem controles redundantes | Coluna, frações, recipientes, papel/CCD |
| Input | Teclado, mouse, toque e foco legíveis | Gestos específicos de cromatografia |
| Layout | Regras responsivas, tema e acessibilidade | Tamanho e geometria dos objetos |

O teste `node tests/siac-referencia-standalone.test.cjs` verifica o tamanho e o hash do arquivo de referência. O workflow `SIAC — Integridade do standalone de referência` executa a verificação em PRs e alterações da `main`.

**Não há equivalência científica direta:** pH, titulação, indicadores ácido-base e seus dados não devem virar cromatografia por renomeação. Também não devem ser renomeadas às cegas chaves antigas de persistência, eventos ou namespaces de API (`window.SIAB`): isso exige migração e testes para evitar regressões ou perda de dados.

O relatório de nomenclatura deve classificar as ocorrências de SIAB **neste arquivo** como `referencia-imutavel`, sem exigir sua eliminação. A passagem futura para SIAC deve se concentrar nos textos efetivamente exibidos, conteúdos próprios e módulos novos. A comparação visual com Playwright fica como prova complementar, pois a igualdade do hash demonstra integridade do arquivo, não por si só a paridade funcional do SIAC.
