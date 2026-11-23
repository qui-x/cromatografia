# SIAC — Auditoria inicial do legado SIAB (22/11/2026)

**Alcance:** amostra direcionada de arquivos na `main` atual. Esta não é uma varredura exaustiva de todo o repositório. A contagem abaixo utiliza busca ampla por SIAB, ácido, pH, titulação, indicador, gota ou tubo; inclui **identificadores internos, comentários e conteúdo visível**, portanto não representa a quantidade de erros que o usuário enxerga.

| Superfície inspecionada | Linhas que coincidem com termos legados | Evidências verificadas | Prioridade |
|---|---:|---|---|
| `index.html` | 114 | "O SIAB precisa de JavaScript"; "Abrir no aplicativo SIAB"; pesquisa "pHmetro, titulação, relatório"; seleção de tubo/conta-gotas/indicador | **P0: interface** |
| `js/telas/bancada.js` | 384 | gota, pH, tubos e motor `SIAB.chem.solve`; não basta renomear os controles | **P0: bancada e ciência** |
| `js/ui/modulos.js` | 33 | descrições dos módulos ainda falam de pH, diluição e frascos | **P0: orientação** |
| `js/ui/workspace.js` | 22 | prateleiras, instrumentos de pH, persistência `siab_workspace_v1` | **P0: interação e dados** |
| `js/data/temas.js` | 43 | temas "Ácidos e bases", pH/pOH e indicadores | **P1: conteúdo** |
| `js/data/missoes.js` | 187 | concepções erradas e objetivos relativos a neutralização/pH | **P1: missões** |
| `js/telas/manual.js` | 25 | diagramas de pHmetro, tabelas de indicadores e equações ácido-base | **P1: Manual** |
| `js/telas/relatorios.js` | 160 | resultados com `SIAB.chem.solve` e armazenamento `siab_relatorios_v1` | **P0/P1: cálculo e persistência** |
| `js/telas/caderno.js` | 46 | CSV com gotas, volume adicionado, pH e cor | **P1: registros** |
| `js/telas/roteiros.js` | 42 | monta `r.tubos` e seleciona visualização de pH | **P1: roteiro** |
| `js/core/roteador.js` | 23 | aviso exibível "organização atual do SIAB" e namespace legado | **P0: navegação** |
| `js/core/namespace.js` | 1 | `window.SIAB` usado como núcleo de compatibilidade | **Compatibilidade: não renomear isoladamente** |
| `package.json` | — | nome `siab-acidobase` e descrição do SIAB | **P1: metadados** |

**Nota:** as ocorrências `SIAB.telas`, `SIAB.$` e outros nomes JavaScript não são, por si, textos apresentados aos estudantes. Mudança indiscriminada de namespace pode quebrar a aplicação, o cache e dados já persistidos.

## Estratégia de correção segura

1. **Primeiro:** concluir contratos e validação do motor científico. O arquivo `js/simulation/quimica.js` continua funcionando como motor original ácido-base enquanto a nova solução está isolada; não utilizar os resultados desse motor como se fossem cromatográficos.
2. **Interface:** adaptar `index.html`, os instrumentos e a bancada para o fluxo Montagem → aplicação → desenvolvimento → revelação → Medir → Calcular. Fazer cada alteração no ramo de experiência, com substituição funcional e teste.
3. **Conteúdos:** transportar Missões, Temas, Roteiros, Manual, Professor e Relatórios sem criar menus vazios. Substituir dependências de tubos e pH somente quando houver estado cromatográfico válido.
4. **Persistência:** introduzir chaves `siac_*` e adaptadores de dados com política explícita de migração; nunca misturar registros ácido-base com cromatografia.
5. **Auditoria CI:** testar correspondências de texto **visível** e cenários de uso, separando os identificadores internos permitidos dos textos proibidos. Manter registro em `docs/SIAC-SUBSTITUICOES.json`.
6. **Marca:** o novo ícone conceito 1, visualmente aprovado, só deve substituir PWA/favicon/encerramento após existir SVG-mestre verificável e teste de reprodução em pequenas escalas. A aprovação artística não equivale a uma integração já feita.

## Gate de publicação

Não afirmar que o SIAC está cientificamente concluído enquanto a bancada pública executar pH/titulação. A próxima entrega aceitável requer pelo menos um experimento planar completo e auditável, com teste de navegação real, detecção, distância de frente, Rf, condições e proveniência.
