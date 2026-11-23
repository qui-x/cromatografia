# SIAC — Plano de migração e paridade com o SIAB 1.0.0

**Projeto:** SIAC — Simulador Interativo de Análise Cromatográfica  
**Título pedagógico:** A Identidade das Cores Ocultas  
**Origem imutável de referência:** `qui-x/acidobase@6f2c56bae806e8d57418b5b787aa2fe22f342829` (`acidosebases1.0.0`)  
**Base importada:** `qui-x/cromatografia@6ecf811111206da0e119aacc11173e4b5dd9a8d5` (`main`)  
**Prova de integridade:** 179/179 arquivos com SHA Git idêntico; sete workflows históricos relocalizados para `docs/legado-siab/workflows/` e 1 workflow de importação próprio do SIAC.

## Regra de ouro

**Não se apaga uma função sem substituir, testar e documentar seu equivalente.** A primeira cópia é propositalmente idêntica ao SIAB; tudo que ainda diz “ácido”, “pH”, “reagente” ou “tubo” é legado reconhecido, não uma função cromatográfica homologada. Nunca publicar ou anunciar esse estado como SIAC científico completo.

Cada arquivo legado deve estar em uma destas condições:
1. `preservado`: mesmo caminho e mesmo SHA da origem;
2. `adaptado`: mesmo caminho, mudança intencional mapeada com teste;
3. `substituido`: arquivo original removido somente com arquivo substituto e teste;
4. `arquivado`: relocalizado como referência histórica, sem execução ativa.

Manter `docs/SIAC-SUBSTITUICOES.json` atualizado e executar `node scripts/siac-auditar-paridade.cjs` antes de cada PR/merge.

## Estrutura de branches (limite absoluto: três)

| Branch | Responsabilidade | Política |
|---|---|---|
| `main` | Linha estável da cópia original e depois entregas homologadas | Nunca fazer experimentos diretamente; merge só após CI |
| `feat/siac-motor-cromatografico` | Entidades, dados, modelo físico, medidas, cálculos, testes científicos, contratos | Primeiro PR para main após funcionar isoladamente |
| `feat/siac-experiencia-didatica` | Bancada, montagem/ver/dados, interação, interface, Manual, roteiros, missões, PWA, identidade | Atualizar a partir de main antes do PR final |

Não criar branches temporárias, hotfix ou de release adicionais. Usar commits e PRs nas duas branches existentes.

## Matriz de preservação e substituição

| Superfície/arquivos SIAB | Preservar | Substituição SIAC planejada | Aceite mínimo |
|---|---|---|---|
| `index.html`, `js/init/*`, `js/core/roteador.js` | Navegação, carregamento, fluxos, foco | Marca SIAC e inicialização do novo motor | Rotas e tela inicial funcionais |
| `js/core/{atividade-v2,activity-context,atividades,persistencia,progresso}.js` | Sessões, compartilhamentos, caderno, histórico, retomada | Tipos de experimentos cromatográficos; namespace de armazenamento exclusivo do SIAC | Não misturar dados SIAB e SIAC |
| `js/ui/{workspace,gaveta,layout-bancada,mobile-study,modulos,render}.js` | Organização das docas, responsividade, estado ativo, atalhos | Montagem / Ver / Dados da bancada cromatográfica | Desktop, tablet e smartphone sem sobreposição |
| `js/telas/{bancada,laboratorio}.js` | Laboratório livre e investigação guiada | Papel, CCD e coluna; etapas e recipientes próprios | Preparar → desenvolver → medir → interpretar |
| `js/ui/{tubo,conta-gotas,regua-ph,condutimetro,prateleira,seletores}.js` | Padrão de instrumentos, controle direto, seletores acessíveis | Placa/papel, aplicador de amostra, câmara, régua, marcador e revelação | Sem controles obsoletos de pH |
| `js/simulation/{quimica,condutividade,instrumentos,medicoes}.js` | Contratos e fluxo de observações/medidas | Motor de migração, afinidades, fase estacionária/móvel, distâncias e Rf | Resultados determinísticos, limites físicos e testes |
| `js/data/{reagentes,sais,amostras,funcoes,catalogo}.js` | Modelo de catálogo, metadados, filtros | Amostras, analitos, solventes, suportes, detectores e proveniência | Dados com identidade, segurança e limitações |
| `js/ui/{equacao,grafico,ver-investigacao,lupa}.js` | Gráficos, equações, lupa, investigação | Cromatograma, frente do solvente, Rf, eficiência didática | Gráficos sincronizados com a simulação |
| `js/data/{temas,missoes,montagens,experimentos,manual}.js`, `js/telas/{aprender,missao,roteiros,manual,professor}.js` | Aprender, missões, roteiros, professor, Manual | Conteúdo autoral sobre separação e identificação | Cada atividade abre uma bancada válida |
| `js/telas/{relatorios,caderno}.js`, `js/ui/impressao.js` | Relatórios, caderno, exportação, impressão | Condições, medidas, Rf, incertezas, interpretações, conclusão | Reabrir e imprimir sem perder resultados |
| `a11y.js`, `js/a11y/*`, `css/*` | Temas, foco, teclado, leitura, mobile | Cor como apoio, não única informação; padrões e rótulos | WCAG, contraste, teclado, toque |
| `sw.js`, `manifest.webmanifest`, `build_standalone.py`, `package.json` | Offline, PWA, build standalone, integridade | Identificadores e caches isolados SIAC | Instalar e usar offline sem interferência no SIAB |
| `tests/*`, `docs/*`, `scripts/*`, `LICENSE` | Infraestrutura e rastreabilidade | Testes e documentos cromatográficos adicionais | Nenhuma regressão de infraestrutura |
| `.github/workflows/*` SIAB | Código histórico preservado | Arquivamento em `docs/legado-siab/workflows/` | Nenhum workflow de pH disparado no SIAC |

## Contrato científico de primeira entrega

**Técnicas:** cromatografia em papel, cromatografia em camada delgada (CCD/TLC) e cromatografia em coluna didática, sem equiparar os três modelos matemáticos.

### Entrada
`{ tecnica, amostra, componentes[], faseEstacionaria, faseMovel, geometria, temperatura?, tempo?, aplicacao?, revelacao? }`

### Saída
`{ condicoes, eventos[], observacoes[], bandasOuManchas[], medicoes[], calculos[], alertasModelo[], proveniencia[] }`

### API proposta
`SIAC.chromatography.prepare(config)` → valida e registra o preparo.  
`SIAC.chromatography.advance(state, deltaT)` → evolui o processo sem saltos de estado.  
`SIAC.chromatography.observe(state)` → produz observáveis da bancada.  
`SIAC.chromatography.measure(state, instrumento)` → produz medições com unidade e resolução.  
`SIAC.chromatography.calculate(state, parametros)` → obtém os resultados com hipóteses e ressalvas.

**CCD/papel:** `Rf = distância do centro da mancha desde a origem / distância da frente do solvente desde a origem`; as duas distâncias devem ser não negativas e a frente deve ser positiva. A identidade não pode ser concluída a partir de Rf isolado; permitir amostra de referência, coaplicação e registro de condições. Substâncias incolores exigem recurso de revelação/detecção.

**Coluna:** simular migração e coleta de frações de maneira independente; não impor equação de Rf planar à coluna.

**Fonte de dados:** diferenciar medições de referência, valores didáticos hipotéticos e parâmetros computacionais estimados. Manter condições, limitações e proveniência por conjunto.

## Módulos e distribuição de funções

- **Explorar:** selecionar amostra, solvente e suporte; montar câmara; aplicar amostra; iniciar desenvolvimento; visualizar manchas/bandas; comparar condições.
- **Medir:** acompanhar frente do solvente; marcar origem e centro das manchas; medir distâncias; registrar repetição, resolução e incertezas.
- **Calcular:** obter Rf, comparações entre cromatogramas e indicadores didáticos de separação; interpretar diferenças sem afirmar identificação inequívoca.

Manter funções de laboratório livre, temas, missões, roteiros, relatório, caderno, Manual, professor, responsividade, acessibilidade e PWA. Os três módulos são experiências coordenadas, não sistemas desconectados.

## Etapas e portões de aceitação

**0. Base:** importar 179/179 SHA e impedir workflows antigos (concluído).  
**1. Contratos e dados:** schema de amostras, solventes, suportes, detectores; modelo cromatográfico testado isoladamente; nenhuma UI quebrada.  
**2. Bancada mínima:** papel/CCD com aplicação, solvente, frente, manchas e régua. Ver/Medir/Calcular ligados ao mesmo estado.  
**3. Coluna:** geometria, migração, frações e detecção, sem reutilizar indevidamente Rf.  
**4. Conteúdos:** missões, temas, roteiros, professor, Manual, relatório e Caderno; não deixar rotas vazias.  
**5. Identidade e entrega:** nome, ícones, PWA, serviço offline, standalone, validação Chromium/Firefox/WebKit, smartphone/tablet/desktop, acessibilidade, impressão e relatórios.  

Um estágio só é marcado como concluído após teste funcional em GitHub Actions e inspeção da experiência; presença de arquivo não significa funcionalidade homologada.

## Riscos explícitos

- **Namespace/storage:** o SIAB usa `window.SIAB`, várias chaves `siab_*` e caches próprios; migrar com adaptadores para evitar incompatibilidade e jamais compartilhar dados locais involuntariamente.
- **HTML standalone:** deve ser reconstruído a partir do código modular; não editar o monólito isoladamente.
- **Workflows legados:** mantidos como referência, nunca ativados sem revisão.
- **Semântica:** substituir pH, pOH, titulação, ácido/base e condutivímetro por conceitos cromatográficos reais — não apenas renomear rótulos.
- **Cores:** incluir materiais incolores, além de alternativas a identificação exclusivamente por cor.
