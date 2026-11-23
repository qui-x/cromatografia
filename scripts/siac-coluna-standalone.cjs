"use strict";
/* Prévia científica executável em HTML único; sem alterar o standalone estável do SIAB. */
const fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,"..");
let html=fs.readFileSync(path.join(root,"previews/coluna-laboratorio.html"),"utf8");
for(const file of ["js/simulation/siac-coluna.js","js/simulation/siac-fracionamento.js"]){
 const tag='<script src="../'+file+'"></script>';
 if(!html.includes(tag))throw Error("Referência ausente: "+tag);
 const script=fs.readFileSync(path.join(root,file),"utf8");
 html=html.replace(tag,"<script>\n"+script.replace(/<\/script/gi,"<\\/script")+"\n</script>");
}
const icon=fs.readFileSync(path.join(root,"assets/siac-icone.svg"),"utf8");
const uri="data:image/svg+xml,"+encodeURIComponent(icon);
html=html.replace('href="../assets/siac-icone.svg"', 'href="'+uri+'"');
html=html.replace('src="../assets/siac-icone.svg"', 'src="'+uri+'"');
if(html.includes('src="../js/simulation/'))throw Error("Dependência científica externa ainda presente");
fs.mkdirSync(path.join(root,"dist"),{recursive:true});
const target=path.join(root,"dist/siac-coluna-previa-standalone.html");
fs.writeFileSync(target,html);
console.log("Prévia SIAC de coluna executável offline:",target,fs.statSync(target).size,"bytes");
