"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs");
const base=require("node:path").resolve(__dirname,"..");
for(const file of ["assets/siac-icone.svg","assets/siac-icone-app.svg"]){
 const src=fs.readFileSync(require("node:path").join(base,file),"utf8");
 assert(src.includes('id="siac-fundo-transparente"'),file+": filtro de alfa ausente");
 assert(src.includes('filter="url(#siac-fundo-transparente)"'),file+": imagem não filtrada");
 assert(src.includes('data:image/webp;base64,'),file+": ilustração de origem mudou");
}
const app=fs.readFileSync(base+"/assets/siac-icone-app.svg","utf8");
assert(!app.includes('<rect width="160" height="160" rx="28" fill="#002e40"/>'),"placa sólida indevida no ícone SVG");
const sw=fs.readFileSync(base+"/sw.js","utf8");
assert(sw.includes("siac-identidade-alfa-20261123"),"cache não renovado");
assert(sw.includes("./assets/siac-icone.svg"),"ícone fora do precache");
console.log("SIAC: recursos SVG preservados, filtro aplicado e cache invalidado.");
