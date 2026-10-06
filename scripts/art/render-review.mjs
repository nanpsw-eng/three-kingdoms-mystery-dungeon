import {createRequire} from 'node:module';
import {readdirSync,existsSync} from 'node:fs';
const require=createRequire(import.meta.url),sharp=require(require.resolve('sharp',{paths:[process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES]}));
const root=process.argv[2],out=process.argv[3],files=readdirSync(root+'/web/assets/portraits').filter(x=>x.endsWith('.webp')&&!x.endsWith('-full.webp')).sort();
const cols=8,cw=150,ch=180,rows=Math.ceil(files.length/cols),layers=[];
for(let i=0;i<files.length;i++){
 const id=files[i].replace('.webp',''),x=(i%cols)*cw,y=Math.floor(i/cols)*ch;
 layers.push({input:await sharp(root+'/web/assets/portraits/'+files[i]).resize(104,104).png().toBuffer(),left:x+23,top:y+7});
 if(existsSync(root+'/web/assets/tokens/'+id+'.svg'))layers.push({input:await sharp(root+'/web/assets/tokens/'+id+'.svg').resize(28,28).png().toBuffer(),left:x+90,top:y+115});
 layers.push({input:await sharp(root+'/web/assets/portraits/'+files[i]).resize(40,40).png().toBuffer(),left:x+35,top:y+112});
 const label='<svg width="150" height="25"><text x="75" y="17" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#171513">'+id+'</text></svg>';
 layers.push({input:Buffer.from(label),left:x,top:y+151});
}
await sharp({create:{width:cols*cw,height:rows*ch,channels:4,background:'#e8ddc4'}}).composite(layers).jpeg({quality:88}).toFile(out);
console.log(files.length+' portraits reviewed.');
