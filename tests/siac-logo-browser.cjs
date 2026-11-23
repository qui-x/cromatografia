"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const {chromium}=require("playwright");
(async()=>{
 const browser=await chromium.launch({headless:true});
 try {
  const page=await browser.newPage();
  for(const asset of ["assets/siac-icone.svg","assets/siac-icone-app.svg"]){
   const file=fs.readFileSync(path.join(__dirname,"..",asset));
   const src="data:image/svg+xml;base64,"+file.toString("base64");
   const scan=await page.evaluate(async uri=>{
    const img=new Image();img.src=uri;await img.decode();
    const canvas=document.createElement("canvas");canvas.width=160;canvas.height=160;
    const ctx=canvas.getContext("2d",{willReadFrequently:true});
    ctx.drawImage(img,0,0,160,160);
    const d=ctx.getImageData(0,0,160,160).data;
    const at=(x,y)=>d[(y*160+x)*4+3];
    let transparent=0,visible=0;
    for(let i=3;i<d.length;i+=4){if(d[i]<16)transparent++;if(d[i]>128)visible++}
    return {corner:at(0,0),lastCorner:at(159,159),transparent,visible};
   },src);
   assert(scan.corner<24&&scan.lastCorner<24,asset+": fundo permanece opaco "+JSON.stringify(scan));
   assert(scan.transparent>1000,asset+": não há área transparente "+JSON.stringify(scan));
   assert(scan.visible>300,asset+": imagem principal desapareceu "+JSON.stringify(scan));
   console.log(asset,scan);
  }
 } finally {await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
