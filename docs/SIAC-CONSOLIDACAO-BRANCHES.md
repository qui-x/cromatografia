# SIAC — consolidação de branches e preservação de histórico

**Data da conferência:** 23/11/2026  
**Repositório:** `qui-x/cromatografia`  
**Limite operacional:** no máximo **três branches** permanentes.

## Branches que permanecem

| Branch | Função |
|---|---|
| `main` | Código oficial publicado e validado |
| `feat/siac-motor-cromatografico` | Pesquisa e implementação físico-química em evolução; **não apagar nem substituir pela main** |
| `feat/siac-experiencia-didatica` | Trabalho visual e interativo; destino do histórico consolidado |

## Cinco branches temporários redundantes

| Branch antigo | Pull request incorporado à main | Último commit antes da consolidação |
|---|---|---|
| `refactor/siac-identidade-independente` | #10 (merge `2bc00ca576ffd5ad90c4ef43ded47386a2b98461`) | `eac6d46a390fadcb7f1255cbacb96d8979cb5d1b` |
| `feat/siac-capilaridade-visual` | #11 (merge `48ba1f170c19f01b7d09a30341110732689930e6`) | `4683528942852b3a70dbbba7676b4a312c660c51` |
| `feat/siac-grade-responsiva` | #12 (merge `d8f9f7ad2f5d2bef5ab97ac1c4e9318e6c8107df`) | `635713312238341da67a81abb58f3d7b5d0c2b1d` |
| `fix/siac-dados-docas-responsivas` | #13 (merge `680eb4e7b3b94c194d9963207956941c506994ab`) | `01947a3d861ac5c1cd4914d492a561738b2e5b5c` |
| `fix/siac-titulo-identidade-destaque` | #14 (merge `4ccd33465820ef7e2f09d47b39621b1ecedbdc56`) | `2fdf486fc9fb5df89956e847aa3b838a5bf82674` |

## Critérios de segurança já conferidos

1. Todas as PRs #10 a #14 foram **integradas**, sem PRs abertas no momento da conferência.
2. Os cinco branches apresentam **zero caminhos de arquivos ausentes** na `main` atual. Diferenças de conteúdo em arquivos comuns correspondem a revisões posteriores e **não devem ser copiadas sobre a main**.
3. O histórico de commits dos cinco branches deve ficar **alcançável a partir de `feat/siac-experiencia-didatica`** antes de apagar suas referências, por commit de consolidação com múltiplos pais. Isso evita perder o histórico após a limpeza.
4. O standalone `SIAB-1.0.0-standalone.html` continua imutável; a limpeza de branches não altera esse arquivo nem a árvore da aplicação.
5. O branch de motor científico permanece separado, pois há trabalho experimental próprio ainda em andamento.

## Política a partir desta consolidação

- **Não criar um quarto branch** para ajustes das cenas. Reutilizar `feat/siac-experiencia-didatica`.
- Novas alterações físico-químicas seguem em `feat/siac-motor-cromatografico`.
- Correções homologadas entram na `main` somente depois dos testes de navegador, integridade e paridade.
- Após confirmar a ancestralidade dos cinco históricos no branch de experiência, os cinco branches temporários podem ser excluídos no GitHub sem excluir o código integrado.
- PRs fechadas e commits referenciados acima continuam registrados; não reabrir versões antigas como fonte de código ativo.
