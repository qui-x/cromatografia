# SIAC — Plano de transição da experiência do SIAB

**Branch:** `feat/siac-experiencia-didatica`  
**Produto:** SIAC — Simulador Interativo de Análise Cromatográfica  
**Identidade:** A Identidade das Cores Ocultas  
**Princípio:** substituir cada superfície científica sem perder a estrutura de experiência, acessibilidade, aprendizagem ou persistência do SIAB.

## Estrutura de navegação preservada

```text
Início
├── Laboratório
│   ├── Montagem (técnica, amostra, fase móvel, suporte, aplicação)
│   ├── Ver (frente do solvente, manchas/bandas, revelação, lupa)
│   └── Dados (medições, cálculos, histórico, cromatograma, relatório)
│   ├── Explorar
│   ├── Medir
│   └── Calcular
├── Aprender / Temas
├── Missões
├── Roteiros Experimentais
├── Montagens Prontas
├── Manual
├── Caderno e Relatórios
└── Professor e Compartilhamento
```

Conservar o mesmo padrão de docas, atalhos, histórico e controle contextual. O laboratório livre sempre deve continuar possível.

## Fluxo prioritário do laboratório

1. Escolher técnica: papel, camada delgada ou coluna (coluna pode começar indisponível, claramente sinalizada, até ter motor).
2. Selecionar amostra e composição conhecida ou desconhecida.
3. Selecionar fase estacionária e fase móvel com restrições de compatibilidade e segurança didática.
4. Aplicar amostra diretamente no suporte, com controle por mouse, toque ou teclado.
5. Iniciar desenvolvimento e observar evolução contínua, com possibilidade de pausar/retomar.
6. Revelar manchas não coloridas quando a técnica exigir; respeitar limites do detector.
7. Marcar origem, frente do solvente e manchas, medir e calcular.
8. Comparar resultados, interpretar evidências, concluir e gerar relatório.

**Evitar etapas redundantes:** selecionar uma técnica deve preparar sua estrutura de bancada; não pedir de novo que o estudante “adicione” a estrutura já definida.

## Substituições de superfície (sem deletar interfaces antes de seus sucessores)

| Interação SIAB | Adaptação SIAC |
|---|---|
| Tubos e reações em solução | Papel, placa, câmara ou coluna, conforme técnica |
| Indicadores e gotejamento | Aplicador capilar, micropipeta e volume da gota aplicada |
| Prateleira de reagentes | Catálogo de amostras, solventes, suportes e reveladores |
| Tira de pH / pHmetro | Régua e marcadores para origem, frente e manchas |
| Condutivímetro | Modos de detecção visual/UV e leituras pertinentes |
| Distribuição de espécies químicas | Manchas, bandas, componentes e distribuição espacial |
| Equação de pH | Rf em cromatografia planar e métricas próprias de coluna |
| Gráfico de titulação | Evolução do cromatograma, distâncias e separação |
| Histórico de gotas | Linha do tempo de aplicação, desenvolvimento, detecção e medições |
| Relatório ácido-base | Condições cromatográficas, valores/medidas, interpretação e ressalvas |

## Regras de interação

- **Montagem:** apenas configurar amostra, técnica, solventes, suporte e procedimento.
- **Ver:** só visualização, lupa, camadas, detecção e comparação visual; nunca duplicar controle de preparo.
- **Dados:** leituras, gráficos, cálculos, relatório e histórico; evitar valores ornamentais sem origem.
- **Explorar:** experimentar condições e observar mudanças.
- **Medir:** habilitar instrumentos reais de leitura de manchas e deslocamentos.
- **Calcular:** aplicar Rf e análises permitidas pelos dados, mostrar unidades e hipóteses.
- As ações de selecionar, arrastar, posicionar e focar devem funcionar com mouse, toque e teclado. Evitar múltiplas barras desnecessárias sobre a cena.

## Conteúdo a transportar com equivalência

- Temas: fases móvel/estacionária, mecanismos de retenção, polaridade e adsorção (quando aplicáveis), interpretação de bandas, Rf e limitações.
- Roteiros: canetas/tintas, corantes alimentícios, pigmentos vegetais e amostras desconhecidas com controles.
- Missões: separar, comparar, propor solventes e argumentar sobre identificações; não validar “identidade” só por coincidência de cor ou Rf.
- Manual: equipamentos próprios, animações, segurança, limites dos modelos, glossário e referências.
- Professor: criar atividades com amostras e condições replicáveis, links, respostas de referência e exportação.
- Relatórios: condições de ensaio, representação, valores e unidades, cálculos, incerteza, observações, análise e conclusão.
- Caderno: sessões salvas, histórico local, exportação, continuação e impressão.

## Identidade visual e acessibilidade

O título “A Identidade das Cores Ocultas” pode explorar bandas cromatográficas e revelação de misturas. **Cor nunca pode ser a única codificação de componentes:** rótulos, padrões e formas também devem identificá-los. A apresentação de amostras incolores e de reveladores amplia o tema para além de pigmentos.

Conservar barra de acessibilidade, modos claro/escuro e daltonismo, leitura por teclado e rótulos de leitor de tela. Não reusar ícones específicos de pH para conceitos de cromatografia.

## Responsividade e inspeção

Verificar, no mínimo: 320, 360, 375, 414, 768, 1024 e 1440 px; paisagem em alturas baixas; toque; teclado; mouse; Chromium, Firefox e WebKit. A bancada precisa ocupar a maior área disponível; painéis nunca devem encobrir o desenvolvimento cromatográfico de maneira permanente.

## Integração controlada com o ramo científico

Não inventar valores cromatográficos no front-end. A experiência consome apenas a API definida no ramo `feat/siac-motor-cromatografico`, que produzirá os eventos, as observações, as medições e os cálculos. Enquanto essa interface não estiver estável, manter o SIAB histórico funcional neste ramo e restringir mudanças a documentação/maquetes desacopladas.

**Gate de aceite:** nenhum menu sem ação, nenhuma tela vazia, nenhuma rota perdida, nenhuma regressão de sessão/histórico, e nenhuma referência ácido-base em funcionalidades exibidas como “SIAC homologado”.
