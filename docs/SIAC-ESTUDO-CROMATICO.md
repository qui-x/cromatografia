# SIAC — Estudo cromático científico e refinamento da abertura

**Estado:** proposta visual experimental (v4.2), sem homologação cromatográfica.  
**Título:** A Identidade das Cores Ocultas.

## Regra de composição
Manter a interface sólida do SIAB/SIAC (petróleo `#0B5472`, fundo escuro `#081E26`, creme e grafite). Reservar os degradês para **a região molhada, os pigmentos e seus rastros**. Não usar degradês roxos no fundo, nos cartões ou na barra de navegação.

## Paletas por uso

| Contexto | Superfície | Líquido | Analitos / dados | Desenho |
|---|---|---|---|---|
| CCD contrastante | `#F8FAFC` ou `#E2E8F0` | `#38BDF8` com baixa opacidade na região molhada | `#E69F00`, `#0072B2`, `#009E73` | Base e cotas em `#334155` |
| Pigmentos naturais | `#FAF8F5` | `#BAE6FD` | Clorofila b `#4D7C0F`, clorofila a `#15803D`, xantofilas `#EAB308`, carotenos `#EA580C` | Texto `#1E293B` |
| HPLC e CG | `#FFFFFF` (claro) ou `#0F172A` (escuro) | Não associar diretamente uma tinta de solvente a toda técnica | Curva `#4F46E5`, área de integração `#818CF8` a 30%, marcador contextual `#DB2777` | Linha-base `#64748B` |

## Tradução da paleta na abertura

- **Béquer A — TINTA:** cromatograma contrastante, com trio `#009E73` (banda alta), `#0072B2` (banda intermediária), `#E69F00` (banda baixa).
- **Béquer B — PIGMENTOS:** referência visual didática de cromatografia de pigmentos vegetais com, da posição mais baixa para a mais alta, clorofila b, clorofila a, xantofilas e carotenos. **Somente como cenário exemplificativo de fase normal com condições compatíveis**; a ordem real depende de solvente, suporte, extração, composição e método.
- **Béquer C — CORANTES:** mistura cromática sintética independente, com `#38BDF8`, `#009E73` e `#E69F00` e alturas diferentes de A.

**Não atrelar a cor a uma afinidade universal.** O laranja pode estar mais baixo no cenário A e mais alto no cenário B; não é uma contradição, pois são analitos e matrizes diferentes. Os valores de migração na vinheta são artísticos, sem escala experimental.

## Melhorias de fluidez (v4.2)

1. **Banda:** seis pontos de gradiente radial, sem platô central opaco; centro de cor intensa, transição gradual e borda dissolvida.
2. **Rastro:** substituir linha uniforme por uma fita curva, afinando na origem e usando gradiente longitudinal de cinco pontos; adicionar uma segunda fita borrada de menor opacidade.
3. **Frente móvel:** avançar com trajetória contínua e suave, exibida por um traço discreto; a zona molhada surge com gradiente ciano de baixa opacidade sem uma borda retangular dura.
4. **Temporalidade:** interpolação contínua com `requestAnimationFrame`; aparecimento lento das bandas e rastros em vez de opacidade quase instantânea.
5. **Identidade:** preservar ícone SVG transparente e três câmaras independentes, sem introduzir iluminação neon ou vidro semitransparente na interface.

## Acessibilidade e medição
Os três analitos são diferenciados por posição e identificação, não só por cor. Na bancada didática futura, utilizar também nomes, números, legendas, padrões e valores de distância/Rf. A abertura não apresenta resultados métricos validados.

## Referências de estudo
- IUPAC, Terminology of separation methods (2017): https://www.degruyterbrill.com/document/doi/10.1515/pac-2017-0111/html
- Merck, TLC Glossary: https://www.merckmillipore.com/INTL/en/analytics-sample-preparation/learning-center/thin-layer-chromatography/tlc-glossary/bv.b.qB.DgkAAAFVnkpDx07V%2Cnav
- Science in School, Colour, chlorophyll and chromatography: https://scienceinschool.web.cern.ch/article/2019/colour-chlorophyll-and-chromatography/
- Okabe–Ito e acessibilidade de cores: https://sci-draw.com/figure-accessibility-kit
- SVG gradients (MDN): https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/radialGradient

### Ajuste de revisão visual
As capturas v4.1 mostraram trilhas excessivamente retas. Na v4.2 reduzimos a concentração/opacidade desses rastros e sua largura, suavizando também a textura de fibra no papel. A interpretação física continua a depender do motor científico a desenvolver.

## Encerramento SIAB (v4.3)
- Removidos os três arcos que conectavam visualmente os béqueres ao centro (linhas indesejadas).
- A cena experimental se dissolve após a comparação, deixando somente o símbolo central do SIAC (não duplicar o ícone no cabeçalho da vinheta).
- A assinatura textual aparece sob esse único símbolo, seguida da transição de opacidade de 350 ms, conforme o padrão original do SIAB.
- Os rastro das manchas cromatográficas durante o desenvolvimento permanecem; somente os arcos artificiais do encerramento foram removidos.

## Revisão de rótulos e espectro cromático — v4.4
Cada béquer tem uma única identificação superior: **A — Tinta**, **B — Pigmentos**, **C — Corantes**. As repetições inferiores `AMOSTRA A/B/C` e suas linhas decorativas foram removidas.

O degradê das manchas passou de 6 para **9 pontos tonais** (núcleo profundo, cor original, tons progressivamente mais claros até a borda translúcida) e o rastro de 5 para **7 pontos**. Os tons são derivados do pigmento da própria banda; isso representa concentração e dispersão visual, não uma composição química adicional. O halo também foi ampliado e recebeu transição da própria banda para o papel. Nenhuma modificação na paleta estrutural do SIAB/SIAC.
