# SIAC — Motor cromatográfico planar v0.1 (contrato experimental)

**Situação:** implementação isolada na branch científica. Não está ligada à bancada publicada e **não constitui homologação** de resultados experimentais.

## Modelo científico e limites

- **Técnicas implementadas:** papel e cromatografia em camada delgada (CCD). **Coluna não é suportada** neste modelo; terá módulo próprio de eluição e frações.
- **Sistema de separação:** cada componente precisa apresentar exatamente um `rfReferencia` **informado** ou um `kDistribuicao` em conjunto com `relacaoFases`. No segundo caso, calcula-se uma aproximação de retenção de equilíbrio linear idealizado `Rf = 1/(1 + kDistribuicao × relacaoFases)`. Não se presume um valor universal de K em função de cor, nome, polaridade ou temperatura. **Essa aproximação não é uma calibração universal de TLC**.
- **Frente móvel:** distância didática `x_front(t) = min(L_util, a √t)`. O coeficiente de capilaridade `a` deve ser explicitamente fornecido (mm/√s) e calibrado quando houver referência. A lei escolhida é uma aproximação cinemática idealizada, não uma previsão do eluente a partir de sua identidade.
- **Bandas:** centro esperado `x_i = Rf_i × x_front`, sempre entre origem e frente. Dispersão representada por `σ²(t) = σ²_inicial + 2 D_efetivo × t`, com `D_efetivo` fornecido, e sem assumir automaticamente uma taxa de difusão experimental.
- **Camada probabilística:** `sample(state, {semente, quantidade, detector})` amostra uma distribuição normal de posições ao redor do centro previsto, limitada à região 0…frente. A semente fixa permite reproduzir o mesmo resultado; a amostragem **não deve alterar as afinidades/valores esperados**.
- **Revelação:** o sinal observável depende das propriedades explícitas do analito e do modo `visivel`, `uv254` ou `uv365`. `uv254` com extinção de fluorescência requer `indicadorFluorescente254=true` na fase estacionária. Nenhum analito incolor passa a ser visível apenas porque a placa está sob UV.
- **Incerteza e limitações:** valores fornecidos são rotulados `medicao`, `estimativa` ou `hipotetico`; medições exigem fonte e condições. Sobreposição é sinalizada. Coincidência de Rf não confirma identidade química.

### API disponível

```js
const S = SIAC.chromatography;
const estado0 = S.prepare(config);
const estado1 = S.advance(estado0, 100);
const obs = S.observe(estado1, {detector:"uv254"});
const regua = S.measure(estado1, {detector:"uv254", resolucaoMm:0.1});
const rf = S.calculate(estado1, {medicoes:regua});
const distribuicao = S.sample(estado1, {detector:"uv254", semente:123, quantidade:200});
```

`prepare/advance` não mutam o estado anterior. `observe` retorna apenas sinais detectáveis no modo selecionado. `calculate` exige frente positiva e rejeita distâncias de manchas além da frente.

### Entrada de demonstração (parâmetros hipotéticos)

```js
{
  tecnica:"ccd",
  amostra:{id:"mistura-didatica"},
  faseEstacionaria:{id:"silica-f254",indicadorFluorescente254:true},
  faseMovel:{id:"eluente-exemplo"},
  geometria:{comprimentoMm:100,origemMm:12,margemSuperiorMm:8},
  frente:{coeficienteCapilarMmPorRaizS:4},
  relacaoFases:1,
  componentes:[
    {id:"a",kDistribuicao:1,larguraInicialMm:1,
      dispersaoMm2PorS:0.005,fracaoRelativa:0.5,
      deteccao:{visivel:true,uv254:true},
      proveniencia:{classe:"hipotetico",fonte:"Exemplo de teste"}},
    {id:"b",rfReferencia:0.25,larguraInicialMm:1.2,
      dispersaoMm2PorS:0.01,deteccao:{uv254:true},
      proveniencia:{classe:"hipotetico",fonte:"Exemplo de teste"}}
  ]
}
```

Os valores são **exemplos matemáticos artificiais**. Não têm vinculação com compostos químicos identificados nem constituem recomendação de solvente.

## Pendências antes da integração

1. Catálogos de analitos, suportes e solventes com condições e fontes verificáveis; faixas de pH, polaridade, modificadores e equilíbrios ácido-base somente para casos com dados e modelos adequados.
2. Calibração da dinâmica de solvente e de dispersão por sistemas materiais identificados.
3. Replicatas experimentais e incerteza de medição separadas da largura cromatográfica e da variação entre ensaios.
4. Detector químico por derivatização, UV 254/365 e limitações de segurança em condições específicas.
5. Modelo autônomo de coluna com fluxo, adsorção/dessorção, sinal e coleta de frações; **sem reutilizar Rf planar**.
6. Adaptador para o laboratório, módulos Explorar/Medir/Calcular, caderno e relatórios com isolamento de namespace e persistência.
7. Testes de integração e validação contra dados experimentais. A PR #1 permanecerá draft até esses critérios estarem atendidos.

## Fontes para o contrato e nomenclatura

- IUPAC Gold Book, **retardation factor (R_F) in planar chromatography**: https://goldbook.iupac.org/terms/view/R05353/html
- IUPAC, **Terminology of separation methods (2017)**: https://doi.org/10.1515/pac-2017-0111
- University of Michigan, laboratório de TLC e revelação F254: https://public.websites.umich.edu/~chem211/211H%20F08-TLC.pdf
- University of Delhi, material de técnica e revelação UV: https://chemistry.du.ac.in/wp-content/uploads/2023/01/Thin-Layer-Chromatography-TLC.pdf

As equações de migração e largura acima são escolhas de modelo didático parametrizado, **não afirmações extraídas da IUPAC**.

## Coletor de frações F1–F10 — módulo independente v0.1

**Arquivo:** `js/simulation/siac-fracionamento.js`. Este arquivo **não implementa a química ou a cinética da coluna**: recebe um perfil de saída externo, em concentração (mg/mL) ao longo de volume acumulado (mL), e distribui o eluato em dez tubos ou descarte. Isso permite validar a mecânica de coleta sem inventar dados de retenção.

**Controle individual:** o estudante define para cada tubo F1–F10 uma janela `[inicioMl, fimMl)` do **volume cumulativo de eluato**, com um passo de 0,1 mL por padrão e extensão 0,1–10 mL no experimento didático inicial. Os dez tubos são vagas disponíveis; tubos sem janela permanecem inativos. Janelas não podem se sobrepor para uma saída única.

**Exemplo:** F1 recebe de 0,6 a 0,8 mL; F2 recebe de 3,5 a 3,7 mL. O líquido entre esses intervalos é desviado para descarte/recuperação e contabilizado, mesmo quando contém analitos. O frasco não é preenchido artificialmente no momento do clique: o conteúdo só chega após a eluição atingir a janela configurada.

```js
const F=SIAC.fractionCollector;
const plano=F.prepare({volumeTotalMl:10,resolucaoMl:0.1,janelas:[
  {frasco:"F1",inicioMl:0.6,fimMl:0.8},
  {frasco:"F2",inicioMl:3.5,fimMl:3.7}
]});
const destino=F.routeAt(plano,3.6); // "F2"
const saida=F.integrate(plano,[
  {inicioMl:0,fimMl:10,concentracoesMgPorMl:{A:1,B:0.5}}
]);
// saida.frascos[0], saida.frascos[1], saida.descarte
```

**Premissas da integração:** concentrações constantes em cada trecho de perfil, com unidades explícitas. Cada massa é obtida por concentração × volume coletado no intervalo. O algoritmo preserva volume e massa entre tubos e descarte e não interpreta o conteúdo como puro por uma cor ou pelo instante de coleta.

### Pendente

- **Motor físico-químico da coluna:** resolver bandas, tempos de retenção, fluxo, dispersão e perfil de composição do eluato em função de condições reais e proveniência.
- **Mapeamento visual:** apontar para uma banda **dentro da coluna** deve informar uma estimativa de chegada à saída com incerteza, e não mapear altura diretamente em mL. A coleta efetiva ocorre na saída.
- **Coleta manual ao vivo:** registrar início/fim pelo volume atual (e atrasos de válvula/transporte, se modelados); mudanças após a corrida apenas em modo de reprodução/gravação.
- **Interface:** na doca Montagem exibir dez tubos e dois controles **somente do tubo selecionado**, por arrasto sobre o perfil ou entrada numérica acessível. Registrar o perfil, o descarte e cada intervalo no relatório gráfico.
- **Transição para capilar/papel:** criar uma amostra derivada do tubo realmente coletado e preservá-la com proveniência antes de habilitar análise planar.

**Ensaios automatizados:** `node tests/siac-fracionamento.test.cjs`. Testam os exemplos F1 0,6 mL e F2 3,5 mL, frascos inativos, limites, ausência de janelas sobrepostas, coeluição, descarte, volumes e conservação de massa.

**Base técnica de coletores reais:** Gilson FC 204/FC 203 (coleta por janelas e desvio fora delas), Bio-Rad BioFrac (tempo, volume ou gotas), Thermo Fisher (frações e válvula de desvio). O uso de dez tubos fixos e a resolução de 0,1 mL são decisões didáticas do SIAC, não valores universais de instrumentação.

