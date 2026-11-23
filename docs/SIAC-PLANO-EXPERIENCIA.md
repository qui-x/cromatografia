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

## Coluna cromatográfica na área Montagem — coleta em dez tubos

**Decisão de interface:** reutilizar a área **Montagem** do SIAB/SIAC, mantendo suas docas, hierarquia, controles de teclado e fluxo de laboratório. **Não criar menu contextual, painel paralelo ou comandos flutuantes para frações.** A coluna é montada na própria área Montagem; sua animação ocupa a cena central.

### Preparação pela área Montagem

1. Escolher **Técnica: Coluna cromatográfica**.
2. Selecionar a **amostra ou mistura** no catálogo e o **solvente/fase móvel**. A fase estacionária, sua compatibilidade e condições de fluxo devem constar da montagem, com padrões iniciais válidos e opção de ajuste quando o motor permitir.
3. A coluna aparece montada diretamente no palco central. **Preparar/Iniciar eluição** são comandos da própria Montagem, não controles redundantes sobre a cena.
4. Acompanhar as bandas e a evolução da eluição no palco. A coleta acontece **na saída da coluna, durante a eluição**, por volume ou intervalo de tempo definido pelo modelo.
5. A Montagem exibe **dez recipientes disponíveis F1–F10**, cada um com **janela própria de coleta** definida pelo estudante. Nenhum tubo é preenchido automaticamente só porque é o próximo: a saída da coluna é encaminhada ao tubo ativo apenas enquanto o volume acumulado estiver no intervalo escolhido. Fora dessas janelas, o fluxo segue para descarte/recuperação conforme a configuração. A seleção visual das amostras colhidas fica disponível ao final.
6. Escolher um tubo na própria Montagem coloca a **fração coletada** em investigação. Exibir a identificação F1–F10, o volume e intervalo de coleta e apenas os sinais realmente detectáveis; um tubo pode conter vários componentes, um único componente ou nenhum analito detectável.
7. Para análise planar, usar o **capilar móvel para retirar uma alíquota do tubo selecionado**, não perfurar a fase estacionária da coluna. Ao levar o capilar até a região do papel/CCD, a cena transita suavemente para o suporte de aplicação sem mudar de módulo nem abrir modal.
8. Aplicar a alíquota na linha de origem, desenvolver a placa e, se adequado, usar detecção UV/revelação. Marcar o início e o fim do percurso e enviar o cromatograma visual ao relatório.

### Comportamento dos dez tubos e controles

- **Montagem:** contém seleção de amostra, solvente, suporte, preparo, comando de eluição, conjunto de tubos F1–F10 e seleção da fração. Não criar uma segunda doca para isso.
- **Palco central:** exibe primeiro a coluna e depois, por transição espacial, a bancada de tubos e o papel/placa; o capilar é manipulado por mouse, toque ou teclado.
- **Ver:** mostra somente observações, detecção e enquadramentos da cena; não duplica seletor de fração ou comandos de preparo.
- **Dados:** recebe as medidas, curvas, Rf planar e registros do processo; a mudança de tubo selecionado não recalcula nem reinicia a eluição.
- **Coleta:** dez recipientes são a capacidade visual da bancada, **não dez frações necessariamente consecutivas, obrigatórias ou associadas a substâncias**. Cada tubo recebe uma janela individual de volume acumulado, inteiramente escolhida pelo usuário dentro da escala da coluna atual. O motor registra a eluição contínua, os intervalos efetivamente coletados e o volume descartado entre janelas; nenhum fluido pode saltar a ordem de saída.
- **Seleção:** destacar o tubo escolhido diretamente na grade de Montagem, mantendo contexto visual de sua posição e conteúdo. Não afirmar pureza pela cor do tubo nem pela escolha de uma única banda.
- **Análise:** a fração escolhida gera uma **amostra derivada**, com composição, origem (coluna, intervalo e tubo), detector, condições e proveniência preservadas. Só então é aplicada no papel ou CCD.
- **Relatório gráfico:** registrar imagem/diagrama da coluna com intervalos de coleta, sequência F1–F10, fração selecionada, trajetória da aplicação, origem, frente móvel, manchas antes/depois de UV e medidas; textos são legendas breves, não substitutos das evidências visuais.

### Controle individual da janela de coleta (F1–F10)

**Fluxo dentro da própria Montagem:** a régua/representação da eluição ocupa a cena central; na doca Montagem fica uma grade compacta com F1–F10. Ao selecionar um frasco, o estudante pode **arrastar início e fim sobre o perfil** ou editar dois campos numéricos dedicados ao frasco ativo, sem abrir menu contextual e sem exibir vinte controles permanentes.

- **Escala operacional variável:** cada montagem informa seu volume máximo de eluição dentro da faixa didática inicial de **0,1 a 10,0 mL**; a régua se adapta à coluna utilizada, em vez de mostrar 10 mL como limite fixo. A resolução padrão de 0,1 mL é ajustável no modelo, sujeita à precisão que puder ser justificada.
- **Cada frasco tem intervalo próprio**, `inicioMl` e `fimMl`, com `fimMl > inicioMl`; um frasco pode permanecer inativo. O valor é o instante volumétrico em que o coletor começa/termina de encaminhar o eluato àquele tubo, **não** o volume pré-existente dentro do tubo.
- **Nenhum preset obrigatório:** os valores citados anteriormente para F1 e F2 foram apenas ilustrações da mecânica e **não devem ser cadastrados como padrão**. Os dez frascos começam sem janelas definidas; o aluno pode escolher o início e o fim de cada um, inclusive deixar frascos vazios. O intervalo não selecionado segue para descarte/recuperação, mostrado na animação e no balanço de material.
- **Janelas não sobrepostas** para uma única saída; a coleta respeita a ordem de eluição. A numeração dos frascos deve permanecer estável e a apresentação visual ordenada por início de coleta.
- **Interação por faixa na coluna:** o aluno pode indicar uma zona da coluna como referência visual; a previsão de sua saída dependerá da cinética de retenção e vazão, com incerteza. O volume de eluato não é a altura interna da coluna. Se houver uma sugestão automática de janela, ela será **dinâmica, calculada para a corrida atual**, nunca um mapeamento rígido de volume para substância.
- **Modo manual:** o aluno também pode marcar abertura/fechamento da coleta durante a eluição; o simulador guarda o volume no momento da ação. Ajustes retrospectivos só são permitidos ao reproduzir uma corrida virtual gravada, nunca apresentados como intervenções reais retroativas.
- **Registro gráfico:** a curva de eluição recebe regiões destacadas correspondentes às janelas F1–F10, áreas de descarte e bandas detectadas; o relatório apresenta a quantidade efetivamente coletada, inclusive tubos vazios ou com mistura/coeluição, e o volume descartado.
- **Acessibilidade:** usar arrasto com teclado/toque/mouse e oferecer entrada numérica de início/fim para precisão; em mobile mostrar somente o tubo ativo e sua janela, preservando a cena central.

**Dependência:** o coletor por janelas é uma mecânica de fluxo; os perfis químicos/retentivos precisarão vir de um motor próprio de coluna validado. **Nenhuma substância fica cadastrada em uma posição volumétrica fixa.** A escolha do intervalo altera o que é *interceptado* da eluição; não altera o comportamento químico nem cria ou move os compostos.

### Primeira prévia funcional e contrato de integração

Na branch **`feat/siac-motor-cromatografico`** estão implementados `js/simulation/siac-coluna.js`, `tests/siac-coluna.test.cjs` e a página `previews/coluna-laboratorio.html`. **Essa é uma prévia técnica isolada** para verificar a concepção do usuário; o `index.html` principal ainda contém elementos legados do SIAB.

**Organização a transportar do protótipo para o aplicativo principal:**

1. A doca esquerda **Montagem** oferece escolha da amostra, solvente, fase estacionária e comando **Montar coluna**. Os parâmetros geométricos ficam em uma seção condensada; não inserir nova doca contextual.
2. A **coluna ocupa a área central** de observação, com suporte, zonas de migração e saída; as bandas visíveis são derivadas da distribuição calculada por pratos teóricos. Um componente incolor não deve tornar-se visível só para ajudar a interface.
3. A mesma Montagem oferece **grade F1–F10**. O aluno escolhe um frasco e define seu intervalo em mL, na escala **configurável de cada corrida**. A ausência de janela significa que o tubo não é usado. Não existe preset de fração ou associação a substância.
4. A curva de saída mostra as concentrações do **modelo**, as janelas programadas e o progresso atual. Separar graficamente **valores preditos** de informações efetivamente observadas/detectadas para não revelar a composição de modo indevido.
5. A evolução da eluição determina quando cada fração passa a receber líquido e quanto de cada componente é recuperado; o restante vai para descarte/recuperação, sem violar conservação de massa.
6. O **registro gráfico SVG** deve incluir a coluna, o perfil de eluição e a coleta efetivamente realizada **até o momento da exportação**, distinguindo janelas futuras e realizadas. A implementação integral em Caderno/Relatórios ainda está pendente.
7. A cena deverá seguir para **capilar no frasco → aplicação em papel/CCD → desenvolvimento → revelação UV** quando o adaptador entre motor de coluna e planar estiver validado. Não adicionar botões inertes enquanto essas etapas não existirem.

**Validações disponíveis no ramo científico:** modelo de coluna, conservação de massa, integração com coletor F1–F10, confirmação de janelas dinâmicas e teste de navegador da prévia em 320, 360, 768, 1024 e 1440 px. CI e capturas de tela devem aprovar antes de portar a prévia à bancada ativa.

### Aceite e limites

- O SIAB já oferece uma área Montagem e uma base de trabalho com tubos; isso é **infraestrutura a reaproveitar**, não a afirmação de que a coluna já funciona.
- Não é fisicamente apropriado representar a coleta rotineira como uma perfuração da banda dentro de uma coluna empacotada; coletar **eluato pela saída da coluna** e usar o capilar na alíquota coletada preserva a lógica laboratorial.
- O motor de **coluna** será independente do modelo de Rf planar e fornecerá os conteúdos de cada uma das dez frações.
- **Estado:** especificação de experiência, ainda não implementada/homologada em bancada. A lógica legado do SIAB deve permanecer isolada até haver motor e testes próprios.


## Alternância de foco e visão geral — contrato de bancada v0.2

**Decisão de UX (22/11/2026):** preservar os dois controles de visualização existentes na bancada do SIAB: \`#focus-tab\` (Tubo em foco) e \`#overview-tab\` (Visão geral). A primeira ativação de um controle inativo abre sua família; um **segundo clique no controle já ativo avança dentro daquela família**. Não criar terceira doca, botão flutuante, modal de seleção de técnica nem menu contextual de montagem.

### Estados da bancada

| Família de visualização | Estados na ordem | Conteúdo e restrições |
|---|---|---|
| **Foco** | \`coluna\` → \`tubo\` → \`amostra\` → \`coluna\` | coluna completa e janelas do coletor; frasco F_i selecionado; papel/CCD P_i selecionado |
| **Visão geral** | \`frascos\` ↔ \`papeis\` | grades de F1–F10 e P1–P10 com a mesma numeração |
| **Seleção comum** | \`F1\` a \`F10\` | frasco e papel sempre compartilham a mesma identidade de origem, mas têm estado experimental independente |
| **Módulos** | \`explorar\`, \`medir\`, \`calcular\` | controlam as famílias de funções **dentro de Ver** sem mudar o estado do experimento |

O texto do próprio botão Foco apresenta \`Coluna em foco\`, \`Tubo em foco\` ou \`Amostra em foco\`, e um texto acessível pode indicar "clique novamente para próxima visualização". No botão Visão geral, a interface mostra \`Visão geral · Frascos\` ou \`Visão geral · Papéis\`. **Clique na aba inativa retoma seu último estado**, em vez de alternar imediatamente. Alternar ou selecionar F_i não reinicia eluição nem cria medições.

### Fluxo do papel P_i

- Cada frasco F_i possui seu próprio suporte P_i, criado **vazio** (sem cor, marcas, manchas ou dados sintéticos) mesmo que a coluna esteja montada.
- A alíquota só existe depois de haver coleta efetiva no tubo; selecionar o capilar retira uma parcela identificável daquela fração, com volume/proveniência quando o motor suportar.
- A interação de depositar capilar no **ponto de origem** gera \`aplicacao\` com posição, instante e vínculo F_i→P_i. A amostra aparece colorida apenas se houver cor visível cientificamente declarada; caso contrário, o local pode mostrar uma marca de umidade transitória ou um guia de aplicação, sem fabricar pigmento.
- A sequência é **aplicar → desenvolver por tempo/volume de frente calculados → marcar frente do solvente → revelar com detector apropriado**. \`Ligar luz UV\` deve ter modos 254/365 nm, restrições de suporte/detector, e jamais revelar automaticamente toda espécie incolor.
- A prévia de foco da amostra é independente da visão geral; P_i não preenchido permanece com indicação \`aguardando aplicação\` e nunca herda uma mancha porque F_i está preenchido.
- Amostras com resultado de detector têm marcações visuais ou figura para relatório. O registro indica condição antes/depois, origem, frente, centro das manchas, incerteza e detector usado. Não atribuir identidade química apenas por cor, UV ou Rf.

### Ver organizado por módulo

**Importante:** "menus contextuais dentro de Ver" refere-se às opções **da seção Ver vinculadas ao módulo ativo**, não a um novo menu pop-up da coluna. O usuário muda de módulo na estrutura existente; Ver atualiza o seu conteúdo e preserva seleções compatíveis.

| Módulo ativo | Itens propostos em Ver | Critérios científicos |
|---|---|---|
| **Explorar / Observar** | Aparência, luz ambiente/UV, bandas, partículas (modelo), espécies (modelo), trajetórias/migração | camadas microscópicas calculadas não são observações oculares; identificadas como modelo, com proveniência |
| **Medir** | Régua de origem/frente/manchas, largura e deslocamento de bandas, volume/tempo/vazão, detecção e comparação com padrões | mostrar escala, unidade, resolução, erro; comparação de manchas com padrões **propõe candidato**, não identidade confirmada |
| **Calcular** | Rf planar, volume/tempo de retenção da coluna, fator k, seletividade α, eficiência N e H, resolução Rs, balanço de massa/recuperação e incertezas | fórmulas habilitadas **somente quando houver as variáveis e condições válidas**; não aplicar Rf planar na coluna |

### Fórmulas sob condições adequadas

- **Planar:** \`Rf = d_centro / d_frente\` (distâncias desde a origem no mesmo desenvolvimento). Sem frente ou mancha, mostrar "aguardando medida" e não número inventado.
- **Coluna:** \`V_R = Q t_R\` para vazão constante; \`k = (V_R - V_M) / V_M\` quando \`V_M\` for conhecido e houver pico quantificável.
- **Seletividade:** \`α = k_2/k_1\`, com \`k_2 > k_1 > 0\` sob as mesmas condições.
- **Resolução:** \`Rs = 2(t_R2 - t_R1)/(w_b1+w_b2)\` quando houver dois picos e larguras na base medidas na **mesma unidade de tempo**. Não confundir resolução de uma curva prevista com resolução medida.
- **Eficiência de coluna:** \`N ≈ 16(t_R/w_b)^2\` somente com pressupostos de picos aproximadamente gaussianos; \`H=L/N\`.
- **Recuperação e composição:** fração recuperada = massa coletada/massa de referência **medida ou modelada**, com distinção explícita; porcentagem de pureza só quando for defensável quantificar as espécies, nunca só pela cor do frasco.
- **Identificação:** padrões de referência sob mesmas condições e evidências complementares; mesmo Rf/cor não confirma identidade.

### Estados, persistência, testes e acessibilidade

- Estado independente por tubo/papel: \`idFrasco\`, \`idPapel\`, \`estadoAplicacao\`, \`origemMm\`, \`frenteMm\`, \`sinaisDetectados\`, \`detector\`, \`origemDaAmostra\` e histórico. Um novo experimento começa com P1–P10 vazios.
- Modos de foco/visão geral, módulo Ver, seleção da fração e medições devem resistir a re-renderização, exportação e restauração do Caderno.
- Testar clique 1/2/3/4 nos dois botões; alternância intercalada; seleção de F7 refletida em P7; papel vazio; capilar sem fração bloqueado; UV antes do desenvolvimento bloqueado; resultado de detector fornecido apenas pelo motor; mouse, toque, teclado, leitor de tela.
- O palco central continua protagonista, com os mesmos dois controles; nenhuma lista com dez controles de medições fixos; Ver só expõe funções relevantes ao módulo atual.

**Status:** contrato de experiência. A branch visual terá um protótipo desacoplado para testar alternância/estados sem mexer no SIAB publicado. A ligação com \`js/simulation/siac-coluna.js\`, \`siac-fracionamento.js\` e \`siac-cromatografia.js\` depende de integração posterior e validação.
