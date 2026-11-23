"use strict";
/* HPTLC: dados estão condicionados à técnica de Alam et al. (2022).
 * Testa explicitamente a separação entre consulta e medição instrumental.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const h=require("../js/ui/siac-hptlc-didatico.js");
const root=path.join(__dirname,"..");
assert.equal(h.source,"https://doi.org/10.3390/molecules27020405");
assert.deepEqual(Object.keys(h.methods).sort(),["np","rp"]);
assert.deepEqual(Object.keys(h.analytes).sort(),["caffeine","paracetamol"]);
assert.deepEqual([h.analytes.caffeine.cid,h.analytes.paracetamol.cid],[2519,1983]);
assert.deepEqual([h.analytes.caffeine.cas,h.analytes.paracetamol.cas],["58-08-2","103-90-2"]);
const n=h.methods.np,r=h.methods.rp;
assert.match(n.solvent,/85:15/);
assert.match(r.solvent,/50:50/);
assert.match(n.stationary,/sílica gel 60 F254S/i);
assert.match(r.stationary,/fase reversa.*60 F254S/i);
assert.match(r.stationary,/C18 não comprovado/i);
assert.deepEqual(n.rangeNg,[50,500]);
assert.deepEqual(r.rangeNg,[25,800]);
assert.deepEqual(
 [n.rows.caffeine.rf,n.rows.caffeine.sd,n.rows.paracetamol.rf,n.rows.paracetamol.sd,
  r.rows.caffeine.rf,r.rows.caffeine.sd,r.rows.paracetamol.rf,r.rows.paracetamol.sd],
 [.40,.01,.59,.02,.43,.01,.57,.02]);
for(const phase of [n,r])for(const row of Object.values(phase.rows)){
 assert.equal(row.n,3);
 assert(row.rf>0&&row.rf<1&&row.sd>0&&row.sd<.1);
}
assert.equal(h.snapshot.phase,"np");
assert.equal(h.snapshot.sample,"both");
assert.equal(h.snapshot.step,0);
assert.match(h.controlsHTML(),/siac-hptlc-phase/);
assert.match(h.controlsHTML(),/siac-hptlc-sample/);
assert.match(h.scene(),/não é uma corrida no SIAC/);
assert.doesNotMatch(h.scene(),/class="siac-hptlc-band"/);
assert.equal(h.next(),true);
assert.equal(h.snapshot.step,1);
assert.match(h.scene(),/class="siac-hptlc-applied"/);
assert.doesNotMatch(h.scene(),/class="siac-hptlc-band"/);
assert.equal(h.next(),true);
assert.equal(h.snapshot.step,2);
assert.equal(h.next(),false,"não inventar nova etapa experimental");
assert.equal((h.scene().match(/data-hptlc-focus=/g)||[]).length,4,
 "as duas bandas e os dois marcadores de posição são fontes bibliográficas");
assert.match(h.scene(),/não representam sinais de absorbância/);
assert.match(h.scene(),/bottom:41\.60%/);
assert.match(h.scene(),/bottom:55\.66%/);
assert.equal(h.focus("caffeine"),true);
assert.equal(h.snapshot.focus,"caffeine");
assert.equal(h.focus("inventado"),false);
assert.equal(h.view("comparar"),true);
assert.match(h.scene(),/A fase estacionária também muda/);
assert.doesNotMatch(h.scene(),/data-hptlc-focus=/);
assert.equal(h.view("placa"),true);
assert.equal(h.setModule("medir"),true);
assert.match(h.renderVer().conteudo,/Rf experimental/);
assert.equal(h.setTool("variabilidade"),true);
assert.match(h.renderVer().conteudo,/desvio-padrão/);
assert.equal(h.setModule("observar"),true);
assert.equal(h.setTool("leitura"),true);
assert.match(h.renderVer().conteudo,/não reproduz um densitômetro/);
assert.match(h.renderDados(),/não implementada fisicamente/);
assert.match(h.renderDados(),/ng\/banda/);
assert.match(h.renderDados(),/0,40 ± 0,01/);
assert.equal(h.change("rp","both"),true);
assert.equal(h.snapshot.step,0,"troca de fase reinicia posição ilustrativa anterior");
assert.equal(h.snapshot.focus,"both");
assert.equal(h.next(),true);
assert.equal(h.next(),true);
assert.match(h.scene(),/bottom:43\.82%/);
assert.match(h.scene(),/bottom:54\.18%/);
assert.match(h.renderDados(),/0,43 ± 0,01/);
assert.equal(h.change("rp","paracetamol"),true);
assert.deepEqual(h.snapshot.selected,["paracetamol"]);
assert.equal(h.snapshot.step,0);
assert.equal(h.change("desconhecido","both"),false);
assert.equal(h.change("rp","desconhecido"),false);
assert.equal(h.snapshot.sample,"paracetamol");
assert.equal(h.restart(),true);
assert.equal(h.snapshot.step,0);
const moduleSource=fs.readFileSync(path.join(root,"js/ui/siac-hptlc-didatico.js"),"utf8");
assert.doesNotMatch(moduleSource,/Math\.random|calculaConcentracao|simularAbsorbancia|intensidadeCalculada|fakePeak/);
const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
assert(html.includes('src="js/ui/siac-hptlc-didatico.js"'));
assert(html.indexOf('src="js/ui/siac-hptlc-didatico.js"')<
 html.indexOf('src="js/ui/siac-laboratorio-integrado.js"'));
assert(html.includes('href="css/siac-hptlc-didatico.css"'));
const sw=fs.readFileSync(path.join(root,"sw.js"),"utf8");
for(const file of ["js/ui/siac-hptlc-didatico.js","css/siac-hptlc-didatico.css"])
 assert(sw.includes(file),"cache offline precisa conter "+file);
console.log("SIAC HPTLC — OK: referência NP/RP, condições, identidade, estados, ausência de intensidade fabricada e cache");
