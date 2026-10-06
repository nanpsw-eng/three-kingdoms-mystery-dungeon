// Compact ink silhouettes for exploration. Existing authored tokens are preserved.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { MVP_CONTENT as content } from '../../dist/content/index.js';
const p = JSON.parse(readFileSync('docs/art/PRODUCTION_ART_PLAN.json', 'utf8'));
const ink = '#171513', paper = '#e8ddc4';
const palettes = { wei: '#77838d', wu: '#668274', shu: '#d5c8ad', yuan: '#b89457', dong: '#756c63', west: '#a64032', bandit: '#756c63', tribal: '#a77d42' };
const characterPalette = { 'sima-yi':'#302a25', 'lu-bu':'#a64032', 'sun-jian':'#668274', 'yuan-shao':'#d5c8ad', 'cao-ren':'#756c63', 'hua-xiong':'#756c63', 'mi-zhu':'#d5c8ad', 'xun-yu':'#e8ddc4', 'ma-chao':'#e8ddc4', 'lu-xun':'#668274', 'zhu-rong':'#a64032', 'meng-huo':'#a77d42', 'xu-huang':'#e8ddc4', 'chen-gong':'#77838d', 'zang-ba':'#756c63', 'gao-shun':'#756c63', 'xu-chu':'#302a25', 'dian-wei':'#a64032', 'yan-liang':'#b89457', 'wen-chou':'#77838d', 'lu-su':'#77838d', 'huang-gai':'#a64032', 'pang-tong':'#756c63', 'cheng-pu':'#77838d', 'wei-yan':'#668274', 'fa-zheng':'#302a25', 'xiahou-yuan':'#77838d', 'lu-meng':'#668274', 'zhou-tai':'#77838d', 'ma-su':'#668274', 'jiang-wei':'#668274', 'zhang-he':'#77838d', 'deng-ai':'#b89457' };
const roleOf = (id) => {
  if (id === 'yuan-shao') return 'staff';
  if (id === 'cao-ren') return 'guard';
  if (['chen-gong','xun-yu','pang-tong','fa-zheng','ma-su'].includes(id)) return 'scroll';
  const c = content.characters.find(c => c.id === id);
  if (c) return ({ strategist:'fan', support:'scroll', archer:'archer', cavalry:'spear', infantry:'sword' })[c.characterClass];
  if (/li-ru|yuan-shu|cai-mao|shaman/.test(id)) return 'scroll';
  if (/meng|wu-tu/.test(id)) return 'guard';
  if (/archer/.test(id)) return 'archer';
  if (/guard/.test(id)) return 'guard';
  if (/spear|ji-ling/.test(id)) return 'spear';
  return 'sword';
};
function svg(id, role, color, faction='') {
  const heavy = role === 'guard' || /xu-chu|dian-wei|meng|wu-tu|dong-zhuo|pang-tong/.test(id);
  const body = heavy ? 'M17 29 47 29 54 51 44 57 20 57 10 51z' : 'M22 29 42 29 49 51 41 56 23 56 15 51z';
  const armor = ['sword','spear','guard','raider','crossbow','marine'].includes(role);
  let prop = '';
  if (role === 'spear' || id === 'lu-bu') prop = '<path d="M53 9v48"/><path fill="'+paper+'" d="m53 3-4 12h8z"/>';
  if (id === 'lu-bu') prop += '<path fill="'+paper+'" d="m54 12 7 5-7 10z"/><path fill="none" stroke="#a64032" d="M29 14Q18 0 10 6M35 14Q45 0 56 5"/>';
  if (role === 'archer') prop = '<path fill="none" d="M53 12q17 20 0 42l-3-21z"/><path d="M47 32h15"/>';
  if (role === 'crossbow') prop = '<path d="M47 33h15M55 26v18"/><path fill="none" d="m47 33 8-6 7 6"/>';
  if (role === 'guard') prop = '<path fill="'+paper+'" d="M44 29h14v25H44z"/><path d="M51 33v16"/>';
  if (role === 'sword' || role === 'raider' || role === 'marine') prop = '<path fill="'+paper+'" d="m49 29 9-14-5 19z"/><path d="m47 35 6 2"/>';
  if (role === 'fan') prop = '<path fill="'+paper+'" d="M40 35q8-15 21-7l-8 15z"/><path d="m43 35 10 8"/>';
  if (role === 'scroll') prop = '<path fill="'+paper+'" d="m42 33 17-4 2 11-17 4z"/><path d="m45 33 2 9"/>';
  if (role === 'staff') prop = '<path d="M54 14v43"/><circle fill="'+paper+'" cx="54" cy="10" r="5"/>';
  if (role === 'shaman') prop = '<path d="M54 14v42"/><path fill="#668274" d="m54 6-6 10 6 6 6-6z"/>';
  if (role === 'fire') prop = '<path fill="#a64032" d="M47 33q-8 17 7 19 12-5 3-20z"/><path fill="#b89457" d="m53 18-5 14 7 3 4-8z"/>';
  if (id === 'xu-huang') prop = '<path d="M54 10v47"/><path fill="'+paper+'" d="M54 11h8v15h-8l-7-7z"/>';
  if (id === 'dian-wei') prop += '<path d="M11 27v23M8 29h8M8 35h8"/>';
  let cap = ['fan','scroll','staff'].includes(role) ? '<path fill="'+ink+'" d="M24 14 27 6h11l3 8z"/>' : '<path fill="'+color+'" d="M22 18q10-18 20 0z"/>';
  if (faction === 'tribal' || /meng|zhu-rong|wu-tu/.test(id)) cap = '<path fill="'+ink+'" d="M23 16q9-13 18 0z"/><path stroke="'+color+'" d="M23 16h18"/>';
  if (role === 'elephant') return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><title>'+id+'</title><g stroke="'+ink+'" stroke-width="3" stroke-linejoin="round"><path fill="#756c63" d="M8 27q17-13 36-2l12 9-3 22h-8l-2-13H20l-2 13h-8z"/><path fill="#77838d" d="M45 27q18-5 15 18l-4 14h-6l5-20-10-4z"/><path fill="'+paper+'" d="m52 41 8 7-9-2z"/><path fill="#a77d42" d="M24 22h18v12H24z"/><circle fill="'+paper+'" cx="33" cy="15" r="6"/><path fill="'+ink+'" d="M26 11h14v5H26z"/></g></svg>\n';
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><title>'+id+'</title><g stroke="'+ink+'" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path fill="'+ink+'" d="M22 48h8l-1 12H17l3-6zm12 0h8l3 6 2 6H35z"/><path fill="'+color+'" d="'+body+'"/>'+(armor?'<path fill="#756c63" d="M23 30h18l-2 14H25z"/>':'<path fill="'+paper+'" d="m26 30 6 12 6-12-6 22z"/>')+'<path stroke="#a64032" d="M21 46h23"/><path fill="'+paper+'" d="M22 35 15 39m27-4 6 4"/><ellipse fill="'+paper+'" cx="32" cy="22" rx="9" ry="10"/>'+cap+'<path fill="none" stroke-width="1.8" d="M27 21h2m7 0h2m-8 7h5"/>'+prop+'</g></svg>\n';
}
let added=0;
for (const id of p.masters) {
  const path='web/assets/tokens/'+id+'.svg'; if (existsSync(path)) continue;
  writeFileSync(path,svg(id,roleOf(id),characterPalette[id]??(id.startsWith('boss-')?'#756c63':'#77838d'))); added++;
}
for (const [,id,role,faction] of p.troops) {
  const path='web/assets/tokens/'+id+'.svg'; if (existsSync(path)) continue;
  writeFileSync(path,svg(id,role,palettes[faction],faction)); added++;
}
console.log('Added '+added+' ink tokens; existing tokens retained.');
