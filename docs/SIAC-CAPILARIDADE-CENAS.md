# SIAC — Capilaridade visual e seleção progressiva de substâncias

## Decisão de desenvolvimento
Primeiro consolidar as mecânicas observáveis, em paralelo à escolha de **poucos sistemas-modelo** de controle; pesquisar e homologar o catálogo completo somente depois da sequência visual e dos contratos de dados estarem estáveis.

**O demonstrador atual não identifica substâncias** e mantém componentes-modelo hipotéticos. Nenhum Rf ou afinidade de uma substância real deve ser inferido de sua cor.

## Sequência cênica (primeira iteração)
1. **Fração coletada no frasco:** o eluato precisa ter sido realmente coletado e possuir volume suficiente.
2. **Contato com o capilar:** ao ativar *Carregar capilar*, a haste de vidro surge dentro do frasco e o menisco da alíquota sobe visualmente; conserva 0,01 mL no balanço.
3. **Transferência:** a cena muda do frasco para o papel P_i, mantendo o vínculo com F_i. O aplicador acompanha o ponteiro e é acessível com toque e teclado.
4. **Deposição:** o contato com a origem aplica uma pequena mancha (ou marca úmida, no caso incolor). O capilar desaparece do suporte após o depósito.
5. **Desenvolvimento:** o papel é inserido na câmara, com o nível do solvente **abaixo da origem**. A região umedecida cresce a partir da base e a frente avança em função idealizada proporcional a √t, até o limite configurado.
6. **Análise:** manchas, distâncias e revelação só podem ser apresentadas segundo composição, suporte e detecção declarados.

A animação do menisco no capilar é **didática**, sem transformar pixels ou altura desenhada em uma previsão física baseada em raio, tensão superficial e ângulo de contato. A frente em √t é uma aproximação visual provisória e deverá consumir o motor planar `SIAC.chromatography` e dados de `faseMovel` / `faseEstacionaria` após integração.

## Materiais piloto para testes científicos futuros
- Solução de corantes alimentícios, **com composição documentada**, para observar manchas visíveis em papel.
- Uma amostra cromatograficamente incolor com detecção UV **validada para a substância e placa**, para distinguir visível de detectável.
- Mistura de controle e padrões em fase móvel/estacionária compatíveis, para avaliar sobreposição e limites da identificação.

Não cadastrar coeficientes, Rf ou massas experimentais sem referência e condições de método.

## Critérios de aprovação
- Coleta de F1–F10 continua vinculada às janelas em mL, sem antecipar resultados.
- Carregar 0,01 mL desconta apenas uma alíquota da fração; origem e massa acompanham o capilar.
- Capilar é visível nas cenas de frasco e papel e não reaparece após a aplicação.
- A frente úmida começa na base; a origem do papel fica acima do solvente.
- O palco não ganha sliders ou novos painéis fora de Montagem / Ver.
- Foco/Visão geral e acesso por teclado, toque, mouse e redução de movimento permanecem funcionais.
- O standalone SIAB permanece imutável como referência de paridade.

## Referências de procedimento
- [Chemistry LibreTexts — Thin-Layer Chromatography, procedimento passo a passo](https://chem.libretexts.org/Bookshelves/Organic_Chemistry/Organic_Chemistry_Lab_Techniques_%28Nichols%29/02%3A_Chromatography/2.03%3A_Thin_Layer_Chromatography_%28TLC%29/2.3E%3A_Step-by-Step_Procedures_for_Thin_Layer_Chromatography)
- [Chemistry LibreTexts — Paper Chromatography](https://chem.libretexts.org/Courses/Los_Medanos_College/Chemistry_6_and_Chemistry_7_Combined_Laboratory_Manual_%28Los_Medanos_College%29/01%3A_Experiments/1.26%3A_Experiment_726_Paper_Chromatography_1_2_1)
- [University of Richmond — Thin Layer Chromatography, aplicação e secagem](https://blog.richmond.edu/chem205l/254-2/)
