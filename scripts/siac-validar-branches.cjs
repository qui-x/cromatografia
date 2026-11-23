"use strict";
// Governança de branches do SIAC: somente as três referências oficiais.
// Node 22+; nunca cria, exclui ou altera refs, apenas consulta e valida.
const ALLOWED = Object.freeze([
  "main",
  "feat/siac-experiencia-didatica",
  "feat/siac-motor-cromatografico"
]);
const authorized = new Set(ALLOWED);

function validate(names) {
  const found = names.map(x => typeof x === "string" ? x : x.name);
  const extras = found.filter(n => !authorized.has(n));
  const missing = ALLOWED.filter(n => !found.includes(n));
  const duplicates = found.filter((n,i) => found.indexOf(n) !== i);
  return {
    ok: found.length === 3 && extras.length === 0 && missing.length === 0 && duplicates.length === 0,
    found, extras, missing, duplicates, count: found.length
  };
}

async function listBranches(repo) {
  if (!/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(repo))
    throw new Error("Identificador de repositório inválido");
  const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "siac-branch-policy",
    "X-GitHub-Api-Version": "2022-11-28"
  };
  if (token) headers.Authorization = "Bearer " + token;
  const found = [];
  for (let page = 1; page <= 20; page++) {
    const res = await fetch("https://api.github.com/repos/" + repo +
      "/branches?per_page=100&page=" + page, {headers, signal: AbortSignal.timeout(20000)});
    if (!res.ok) throw new Error("Consulta GitHub falhou (" + res.status + "): " +
      (await res.text()).slice(0,250));
    const list = await res.json();
    if (!Array.isArray(list)) throw new Error("Resposta de branches inesperada");
    found.push(...list.map(x=>x.name));
    if (list.length < 100) return found;
  }
  throw new Error("Mais de 2.000 branches: paginação não concluída");
}

if (require.main === module) {
  listBranches(process.env.GITHUB_REPOSITORY || "qui-x/cromatografia")
    .then(names => {
      const report = validate(names);
      console.log("SIAC — branches: " + report.count + " / 3");
      for (const name of report.found) console.log("  - " + name);
      if (!report.ok) {
        console.error("POLÍTICA VIOLADA. Extras: " + JSON.stringify(report.extras) +
          "; ausentes: " + JSON.stringify(report.missing) +
          "; repetidos: " + JSON.stringify(report.duplicates));
        process.exitCode = 1;
      } else console.log("POLÍTICA APROVADA: somente os três branches autorizados.");
    })
    .catch(e => {console.error(e);process.exitCode = 1;});
}
module.exports={ALLOWED,validate};
