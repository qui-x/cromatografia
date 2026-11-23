# SIAC — Homologação científica de 40–55 substâncias
**Decisão do responsável em 23/11/2026:** catálogo candidato de 76 substâncias; selecionar **40 como mínimo**, **55 como meta ampliada**, e exigir **pelo menos dois métodos cromatográficos documentados e pelo menos dois solventes diferentes, com sistemas eluentes contrastantes**, por substância.

## O que significa uma substância completa
1. Identidade química individual conferida (sal/forma de ionização, isomeria, pureza, CID/CAS/InChIKey conforme aplicável). Misturas comerciais precisam de composição especificada, não CID de uma molécula parecida.
2. **Método A**: amostra específica, técnica, suporte/fase estacionária descrito, solvente(s) com proporções, temperatura/pH quando pertinentes, forma de detecção demonstrada, Rf individual ou grandeza de retenção própria da técnica, fonte e condição de validade.
3. **Método B**: **um segundo método real e identificável**, não repetição de uma medição, troca de detector ou duplicação do registro A. Deve incluir os mesmos dados de qualidade e **outro sistema de solventes**, com pelo menos um componente químico de solvente distinto entre A e B.
4. Uma **única mistura ternária** com 1-butanol, água e ácido acético **não conta como três métodos**, nem basta para cumprir o requisito de dois métodos. Uma mudança **somente da proporção** de uma mesma lista de solventes, sem alteração dos componentes, é insuficiente para esta regra restritiva.
5. Os dois ensaios devem apresentar dados de retenção **para o composto identificado**. Sinais de mistura genérica ou duas bandas coletivas não são ensaios de composto puro.
6. Classe de evidência: **medido e revisado** ou valor bibliográfico comparado ao artigo primário, com condições experimentais suficientes. Estimativa por regressão/ML pode ser exibida como *predição*, mas **não substitui os dois métodos experimentais homologados**.
7. Validar distinção de detecção: cor/UV 254/UV 366/ninhidrina dependem da amostra e da fase; cor comercial não comprova espectro. Diferenciar solventes dos aditivos (por exemplo NaCl não é um segundo solvente).
8. O fato de cumprir a cobertura da substância não autoriza automaticamente qualquer técnica. Cada técnica recebe disponibilidade com base nos parâmetros experimentais **da própria técnica**. Rf planar não pode fornecer k, `V_R`, resolução, N, H, massas ou tempo em coluna por conversão direta.

## Interpretação em Montagem, Ver e Dados
- **Montagem:** mostra 76 candidatos separados por grupo; só permite selecionar sistemas com vínculo conhecido. Não habilita corridas quantitativas reais ainda incompletas.
- **Ver / Observar:** revela suporte, método, cromaticidade e detector sob condições; hipóteses didáticas identificadas.
- **Ver / Medir:** régua, frente e manchas com origem comum, resolução e variabilidade; ou coluna com vazão e volume medidos.
- **Ver / Calcular:** Rf por distâncias observadas, comparação de padrões somente sob condições compatíveis; para coluna, k e métricas somente com dados de retenção e largura/volume apropriados.
- **Dados:** por composto, exibir **Método 1 / Método 2**, solventes com composição, origem e grau de confirmação, técnica, detector, retenção e limitações.

## Situação da base local na data da política
- 76 compostos candidatos.
- 11 compostos com pelo menos um valor de Rf registrado no catálogo local, em um método cada.
- Zero compostos com **dois métodos específicos** registrados no catálogo local, mesmo antes de verificar solventes contrastantes.
- Portanto, **zero habilitados para a homologação dupla estrita** nesta base. Resultados adicionais localizados em pesquisa não devem ser tratados como dados validados sem incorporação das fontes, confrontos individuais e condições.
- Projeções geométricas e banco de solubilidade não completam lacunas de retenção.

## Auditoria executável
- Motor: `js/simulation/siac-homologacao.js`.
- Testes: `tests/siac-homologacao.test.cjs` (inclusive casos de contraste real, mesma mistura em proporções diferentes, aditivo NaCl, predição de Rf, detector e identidade não homologados).
- `node scripts/siac-auditar-homologacao.cjs --write --check` gera relatório para os 76 em `docs/evidencias/siac-ciencia/matriz-homologacao-76.json`.
- Manter somente `main`, `feat/siac-experiencia-didatica` e `feat/siac-motor-cromatografico`. A `main` recebe somente implementações validadas em CI.

## Roteiro de ampliação
1. Buscar ensaios por identidade molecular, não só pelo nome comercial; investigar primeira e segunda condição de eluente para cada composto.
2. Selecionar métodos reproduzíveis e representar **duas fichas completas e independentes** por composto.
3. Converter resultados para formato estruturado **com proveniência, fonte original e condições**, nunca inventar Rf.
4. Auditar a matriz de cobertura e elevar o número `completamenteHomologados` progressivamente em direção a 40 e, em seguida, 55.
5. Validar individualmente o que está disponível por técnica e testar regressões de Montagem/Ver/Dados e módulos do laboratório.

**Regra operacional:** dois métodos completos + duas fases móveis com solventes quimicamente diferentes, identidade e dados conferidos. Menos que isso permanece “em pesquisa”, ainda que o composto apareça no catálogo.
