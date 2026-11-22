"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(root,p),"utf8");
const html = read("index.html");
const svg = read("assets/siac-icone.svg");
const app = read("assets/siac-icone-app.svg");
const css = read("css/siac-identidade.css");
const js = read("js/ui/abertura.js");
const router = read("js/core/roteador.js");
const manifest = JSON.parse(read("manifest.webmanifest"));
const sw = read("sw.js");
const standalone = read("build_standalone.py");
// Uma marca, duas aplicações: transparência nas telas e fundo sólido no app.
assert.match(svg, /<svg[\s>]/);
assert.match(svg, /cromatogr/i);
assert.doesNotMatch(svg, /<linearGradient|<radialGradient|opacity=/i);
assert.doesNotMatch(svg, /<rect width="192" height="192" fill="#0B5472"/i);
assert.match(app, /<rect width="192" height="192" fill="#0B5472"/i);
assert.match(html, /SIAC — A Identidade das Cores Ocultas/);
assert.match(html, /assets\/siac-icone\.svg/);
assert.match(html, /css\/siac-identidade\.css/);
assert.match(html, /siac_abertura/);
assert.match(css, /--brand:\s*#0B5472/i);
assert.match(css, /--bg:\s*#F4E9D8/i);
assert.match(css, /--mod-grad:\s*#2E9B8F/i);
assert.match(css, /siac-ab-capilar-mover/);
assert.match(css, /siac-ab-pigmento-nuvem/);
assert.match(css, /\.siac-ab-desenvolvendo \.siac-ab-umidade/);
assert.match(css, /\.siac-ab-revelada \.siac-ab-anotacoes/);
assert.doesNotMatch(js, /SIAB\.chem|pKw|pH\s|TUBOS\s*=/);
for (const term of ["aplicar:","pontos:","imergir:","desenvolver:","revelar:","marca:","sair:"]) {
  assert(js.includes(term), "ato ausente: "+term);
}
assert.match(js, /prefers-reduced-motion/);
assert.match(js, /pointerdown/);
assert.match(js, /keydown/);
assert.match(js, /siac_abertura/);
assert.match(router, /document\.title\s*=\s*`[^`]*· SIAC`/);
assert.doesNotMatch(router, /document\.title\s*=\s*`[^`]*· SIAB`/);
assert.match(js, /siac-ab-trilha-/);
assert.match(js, /amostras\.map/);
assert.equal(manifest.short_name,"SIAC");
assert(manifest.icons.some(i=>i.src==="assets/siac-icone-app.svg"));
assert.match(sw, /siac@/);
assert.match(sw, /siac-icone-app\.svg/);
assert.match(sw, /siac-identidade\.css/);
assert.match(standalone, /'assets\/siac-icone\.svg'/);
const pngs={"icone-192.png":192,"icone-512.png":512,"icone-maskable-512.png":512,"apple-touch-icon.png":180};
for(const [name,side] of Object.entries(pngs)){
  const buf=fs.readFileSync(path.join(root,"assets","icones",name));
  assert.equal(buf.subarray(0,8).toString("hex"),"89504e470d0a1a0a",name+" PNG");
  assert.equal(buf.readUInt32BE(16),side,name+" largura");
  assert.equal(buf.readUInt32BE(20),side,name+" altura");
}
console.log("SIAC: marca transparente, ícone instalável, paleta, vinheta em cinco atos e PWA validados.");
