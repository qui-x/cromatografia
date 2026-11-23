"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const cp=require("node:child_process");
const root=path.resolve(__dirname,"..");
const spec=JSON.parse(fs.readFileSync(path.join(root,"docs/SIAC-REFERENCIA-STANDALONE.json"),"utf8"));
const reference=path.join(root,spec.arquivo);
assert.equal(spec.arquivo,"SIAB-1.0.0-standalone.html");
assert(fs.existsSync(reference),"Standalone SIAB 1.0.0 original ausente: não gerar uma substituição automática");
const bytes=fs.statSync(reference).size;
assert.equal(bytes,spec.tamanho_bytes,"Standalone de referência teve seu tamanho alterado");
const gitSha=cp.execFileSync("git",["hash-object","--",spec.arquivo],{cwd:root,encoding:"utf8"}).trim();
assert.equal(gitSha,spec.git_blob_sha1,"Standalone SIAB foi alterado; restaure exatamente o arquivo original");
const html=fs.readFileSync(reference,"utf8");
for(const marker of ['id="focus-tab"','id="overview-tab"','class="view-tabs"']){
 assert(html.includes(marker),"Standalone não contém o elemento original: "+marker);
}
const live=fs.readFileSync(path.join(root,"index.html"),"utf8");
for(const marker of ['id="focus-tab"','id="overview-tab"']){
 assert(live.includes(marker),"SIAC perdeu controle de navegação herdado: "+marker);
}
console.log("SIAC paridade: standalone SIAB oficial intacto, mesmo blob do acidobase; controles básicos preservados.");
