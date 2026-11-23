# Regras permanentes de desenvolvimento — SIAC

Estas instruções aplicam-se ao repositório `qui-x/cromatografia`, inclusive aos agentes que editam código.

## Limite obrigatório: três branches

**É proibido criar branches adicionais, inclusive temporários, de correção ou de pull request.** Somente estes três nomes são permitidos:

- `main`: versão publicada, homologada, com testes aprovados.
- `feat/siac-experiencia-didatica`: vidrarias, coluna, papel, capilar, animações, acessibilidade, responsividade e cenas.
- `feat/siac-motor-cromatografico`: banco de substâncias/solventes, propriedades físico-químicas, validação científica e motores.

**Antes de trabalhar:** consultar a lista de branches; se houver mais de três, não abrir outro, identificar e consolidar o excedente com segurança. Não apagar branches com trabalho ainda exclusivo sem preservar código e histórico.

**Ao desenvolver:** comitar na ramificação já existente da área. Se a mudança for homologada, validar com testes (Playwright, paridade e regressão) e integrá-la na `main`; depois sincronizar o branch da área com a `main`. Nunca sobrescrever um branch experimental com `main` sem conciliar as diferenças.

**Proteções obrigatórias:** não modificar `SIAB-1.0.0-standalone.html` (referência imutável), não tratar identificadores legados como dados cromatográficos e não introduzir regressões na bancada.

**Auditoria:** `.github/workflows/siac-politica-branches.yml` e `scripts/siac-validar-branches.cjs` conferem os nomes e a quantidade em eventos de criação/push e periodicamente. **A auditoria detecta e falha** caso a regra seja violada; o bloqueio da criação no servidor requer regras de proteção configuradas no próprio GitHub.

Documento detalhado e registro da consolidação: `docs/SIAC-CONSOLIDACAO-BRANCHES.md`.
