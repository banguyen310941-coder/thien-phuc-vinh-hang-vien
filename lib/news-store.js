const fs=require('fs');const path=require('path');
function readJson(p,fallback){try{return JSON.parse(fs.readFileSync(p,'utf8'))}catch(e){return fallback}}
function getNews(){
 const legacy=readJson(path.join(process.cwd(),'data','news.json'),{items:[]});
 const dir=path.join(process.cwd(),'data','auto-news');
 let auto=[];
 try{auto=fs.readdirSync(dir).filter(f=>f.endsWith('.json')).map(f=>readJson(path.join(dir,f),null)).filter(Boolean)}catch(e){}
 const map=new Map();[...(legacy.items||[]),...auto].forEach(n=>{if(n&&n.id)map.set(n.id,n)});
 return {updatedAt:legacy.updatedAt||'',items:Array.from(map.values())};
}
module.exports={getNews};
