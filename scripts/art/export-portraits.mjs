import { createRequire } from 'node:module';
import { readFileSync, mkdirSync } from 'node:fs';
const require=createRequire(import.meta.url);
const sharp=require(require.resolve('sharp',{paths:[process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES]}));
const entries=JSON.parse(readFileSync(process.argv[2],'utf8'));
const out=process.argv[3];mkdirSync(out,{recursive:true});
for(const {id,path,crop} of entries){
 const {width,height}=await sharp(path).metadata();
 const side=Math.round(width*(crop?.side??0.40));
 const left=Math.max(0,Math.min(width-side,Math.round(width*(crop?.x??0.30))));
 const top=Math.max(0,Math.min(height-side,Math.round(height*(crop?.y??0.035))));
 await sharp(path).resize({width:768,height:1152,fit:'inside',withoutEnlargement:true}).webp({quality:86,alphaQuality:100}).toFile(out+'/'+id+'-full.webp');
 await sharp(path).extract({left,top,width:side,height:side}).resize(384,384).webp({quality:90,alphaQuality:100}).toFile(out+'/'+id+'.webp');
 console.log(JSON.stringify({id,width,height,crop:{left,top,side}}));
}
