# SIAC — Simulador Interativo de Análise Cromatográfica

**A Identidade das Cores Ocultas** · Versão `0.2.0-dev.0` (em desenvolvimento).

Aplicativo independente de cromatografia para investigação didática de processos de separação. Reaproveita a organização de bancada, acessibilidade e navegação do SIAB, mas a identidade, a simulação cromatográfica e o versionamento são próprios.

[Abrir o simulador](https://qui-x.github.io/cromatografia/) · [Laboratório](https://qui-x.github.io/cromatografia/#/laboratorio)

## Funcionalidades em evolução

- Montagem didática de coluna: mistura-modelo, suporte, eluente, geometria e vazão.
- Planejamento e coleta seletiva de frações F1–F10, com tempo de eluição e vidraria representada.
- Aplicação com capilar e desenvolvimento do papel dentro do béquer; revelação de sinais hipotéticos por UV.
- Alternância de Foco e Visão geral preservando o layout original da bancada.
- Doca **Ver** contextual por objeto, nos módulos Observar, Medir e Calcular.
- Resultados de exemplos **hipotéticos**; não equivalem a análises laboratoriais ou identificação de substâncias.

Partes dos menus, missões, roteiros e Manual ainda são legados de ácido-base em migração. **Não devem ser interpretados como resultados cromatográficos.**

## Documentação e testes

- [Plano de experiência e migração](docs/SIAC-PLANO-EXPERIENCIA.md)
- [Modelo de cromatografia em coluna](docs/SIAC-COLUNA-MODELO-V01.md)
- [Base científica e limitações](docs/SIAC-MOTOR-CROMATOGRAFICO.md)
- [Referência oficial de paridade SIAB 1.0.0](docs/SIAC-REFERENCIA-STANDALONE.md)
- [Inventário de substituições e paridade](docs/SIAC-SUBSTITUICOES.json)

O arquivo `SIAB-1.0.0-standalone.html` é **uma prova histórica imutável**, não uma versão executável atual do SIAC. Os antigos `FILES.txt`, `SHA256SUMS.txt` e `SHA512SUMS.txt` foram preservados em `docs/legado-siab/distribuicao/` e **não validam os arquivos atuais do SIAC**.

## Execução local

Sirva o diretório por HTTPS ou `python3 -m http.server 8080` e abra `http://localhost:8080/`. Para inspeção da experiência, execute `node tests/siac-laboratorio-integrado-browser.cjs` após instalar as dependências de desenvolvimento com `npm ci` e o Chromium do Playwright.

Código sob GPL-3.0-only. O legado do SIAB mantém sua proveniência e licenças correspondentes.
