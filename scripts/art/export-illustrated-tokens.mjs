// Technical sprite export: resize existing approved paintings, no new artwork.
import {createRequire} from 'node:module';
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
const require=createRequire(import.meta.url),sharp=require(require.resolve('sharp',{paths:[process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES]}));
const manifest=JSON.parse(readFileSync('web/assets/manifest.json','utf8'));
mkdirSync('web/assets/tokens/illustrated',{recursive:true});
for(const id of manifest.fullBodyIllustrations){
 await sharp('web/assets/portraits/'+id+'-full.webp').resize({width:96,height:128,fit:'inside',withoutEnlargement:true}).webp({quality:90,alphaQuality:100}).toFile('web/assets/tokens/illustrated/'+id+'.webp');
}
for(const id of manifest.tokens){
 if(['liu-bei','cao-cao','sun-quan'].includes(id))continue;
 manifest.tokenOverrides[id]='tokens/illustrated/'+(manifest.sharedPortraits?.[id]??id)+'.webp';
}
writeFileSync('web/assets/manifest.json',JSON.stringify(manifest,null,2)+'\n');
