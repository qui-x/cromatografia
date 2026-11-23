# SIAC — Ver contextual por módulo (Observar, Medir, Calcular)
**Data:** 23/11/2026 · **Ramo:** `feat/siac-experiencia-didatica` · **Estado:** integração em desenvolvimento, testes de navegador no GitHub Actions.
**Princípio SIAB:** uma única doca **Ver**, sem painel novo ou controles flutuantes sobre a cena. Montagem mantém substância, fase móvel, suporte e coleta; Ver contém inspeção e ferramentas; Dados contém relatório/valores associados à corrida.

## Observar
- **Método** mostra suporte, solvente, sistema detector, evidência e pré-tratamento da referência selecionada.
- **Luz visível** apresenta apenas as condições de observação descritas; manchas coloridas não são inferidas pela categoria do composto.
- **UV 254 nm** é explicitamente dependente de absorção e suporte F254 (extinção de fluorescência). 
- **UV 366 nm** depende de fluorescência efetiva do composto (não é sinônimo de UV 254).
- **Ninhidrina** é revelação química contextual para aminoácidos/amino-compostos, não aplicável automaticamente a todo analito.
- Uma técnica não relatada para o protocolo fica identificada como **guia**, e o clique serve para consultar a física ou química. Nunca cria mancha, cor ou diagnóstico de identidade.

## Medir
- **Régua** exige distância da frente > 0 e distância do centro da mancha entre origem e frente, ambas em mm. Inputs persistem ao alternar módulos, mas são apagados ao mudar composto/método.
- **Condições** descreve suporte, fase móvel, detecção, e ressalvas da fonte.
- Nesta primeira etapa os valores são digitados pelo aluno como **exercício de leitura**, e **não** são apresentados como medição realizada na cena ou como detecção instrumental. Quando o desenvolvimento físico estiver disponível, a régua deverá ler o estado do papel real.

## Calcular
- **Rf** chama `SIAC.metrics.planarRf()` já existente, somente se as duas distâncias manuais satisfizerem validação. Mostra a divisão e valor adimensional.
- **Referência** exibe Rf bibliográfico, Rf do exercício (se existente) e diferença absoluta; se faltar Rf, a comparação fica indisponível. Diferença pequena não confirma identidade; nenhuma tolerância de identificação é inventada.
- **Coluna** ensina que k exige Vₘ e Vᵣ medidos/parametrizados e explica o bloqueio de conversão automática de Rf planar em k de coluna. Não cria dado de retenção para as 76 substâncias.

## Exemplo de uso
Montagem: Glicina → sistema n-butanol/ácido acético/água, protocolo didático Amrita. Ver/Observar: método e ninhidrina como detector descrito; UV mostra somente orientação, pois não consta desse protocolo. Ver/Medir: registrar, por exemplo, 50 mm e 10 mm (valores ilustrativos do aluno). Ver/Calcular: Rf = 0,200 por divisão manual; referência de glicina Rf = 0,20 **nas condições declaradas pela fonte**. Esses valores não significam que houve uma corrida real, nem que o Rf isolado identificou a amostra.

## Limites e fontes
- [IUPAC, retardation factor](https://goldbook.iupac.org/terms/view/R05353/html).
- [Merck, TLC Evaluation](https://www.merckmillipore.com/AT/de/analytics-sample-preparation/learning-center-thin-layer-chromatography/tlc-process/TLC-Evaluation/4tab.qB.RXkAAAFVN.VDx07e%2Cnav).
- [Amrita, amino acids TLC and ninhydrin](https://vlab.amrita.edu/index.php/images/theme/theme/amrita/MEC/?brch=63&cnt=2&sim=154&sub=3).

**Pendente para homologação:** identidade individual de sais/isômeros, calibração com experimentos, suporte, detecção validada, integração com medições da cena, testes de acessibilidade/Chromium/Firefox/WebKit, segurança da prática real. Não integrado à main até validação.
