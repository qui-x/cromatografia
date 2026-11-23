#!/usr/bin/env node
"use strict";
const fs=require("node:fs"),p=require("node:path"),cp=require("node:child_process");
const root=p.resolve(__dirname,"..");
const bin=/\.(png|gif|jpe?g|webp|ico|woff2?|ttf|zip|pdf|mp4|wasm)$/i;
const legacy=/(^SIAB-1\.0\.0-standalone\.html$|^assets\/siab-icone\.svg$|^docs\/legado-siab\/|^docs\/SIAC-INVENTARIO-BASE\.json$|^docs\/SIAC-AUDITORIA-LEGADO\.md$)/;
const paths=cp.execFileSync("git",["ls-files","-z"],{cwd:root,encoding:"utf8"}).split("\0").filter(Boolean);
const report={totalPaths:paths.length,textPaths:0,hitFiles:0,hits:0,groups:{},files:[]};
for(const name of paths){
 if(bin.test(name))continue;
 let text;try{text=fs.readFileSync(p.join(root,name),"utf8")}catch{continue}
 if(text.includes("\0")||text.includes("\uFFFD"))continue;report.textPaths++;
 let hits=[],rows=text.split(/\r?\n/);
 for(let i=0;i<rows.length;i++){
   let found=rows[i].match(/SIAB|siab|Siab|acidobase|acidosebases/gi);
   if(found)hits.push({line:i+1,count:found.length,sample:rows[i].trim().slice(0,150)});
 }
 if(!hits.length)continue;
 let group=legacy.test(name)?"historico":
 /^tests\//.test(name)?"testes":
 /^\.github\/workflows\//.test(name)?"workflows":
 /^docs\//.test(name)||/\.md$/.test(name)?"documentacao":
 /\.(?:js|cjs|py)$/.test(name)?"codigo-runtime":"interface-e-outros";
 let count=hits.reduce((n,v)=>n+v.count,0);
 report.hits+=count;report.hitFiles++;report.groups[group]=(report.groups[group]||0)+1;
 report.files.push({name,group,count,hits});
}
let target=p.join(root,"docs/evidencias/siac-identidade");
fs.mkdirSync(target,{recursive:true});fs.writeFileSync(p.join(target,"referencias.json"),JSON.stringify(report,null,2)+"\n");
console.log("SIAC REFERÊNCIAS",JSON.stringify({totalPaths:report.totalPaths,textPaths:report.textPaths,hitFiles:report.hitFiles,hits:report.hits,groups:report.groups}));
for(const f of report.files)console.log(f.count,f.group,f.name,"linhas",f.hits.slice(0,6).map(x=>x.line).join(","));
if(process.argv.includes("--strict")&&report.files.some(x=>!["historico","codigo-runtime"].includes(x.group)))process.exitCode=1;
