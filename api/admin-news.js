const {verifySession,can}=require('../lib/admin-auth');
const {getJson,putJson,gh,BRANCH}=require('../lib/github-store');
function slug(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/đ/g,'d').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,80)}
async function loadAuto(){
 let files=[];try{files=await gh('/contents/data/auto-news?ref='+BRANCH)}catch(e){return[]}
 if(!Array.isArray(files))return[];
 const out=[];
 for(const f of files.filter(x=>x.type==='file'&&x.name.endsWith('.json'))){
  try{const row=await getJson('data/auto-news/'+f.name,null);if(row.data&&row.data.id)out.push({...row.data,__source:'auto',__path:'data/auto-news/'+f.name,__sha:row.sha})}catch(e){}
 }
 return out;
}
async function combined(){
 const legacy=await getJson('data/news.json',{updatedAt:null,items:[]});
 const auto=await loadAuto();
 const map=new Map();(legacy.data.items||[]).forEach(x=>x&&x.id&&map.set(x.id,{...x,__source:'legacy'}));auto.forEach(x=>map.set(x.id,x));
 return{legacy,items:[...map.values()]};
}
function publicItem(x){const y={...x};delete y.__source;delete y.__path;delete y.__sha;return y}
module.exports=async(req,res)=>{
 const user=verifySession(req);if(!user)return res.status(401).json({ok:false,message:'Phiên đăng nhập đã hết hạn.'});if(!can(user,'news'))return res.status(403).json({ok:false,message:'Bạn không có quyền quản lý tin tức.'});
 try{
  const store=await combined();
  if(req.method==='GET')return res.status(200).json({ok:true,items:store.items.map(publicItem).sort((a,b)=>String(b.publishedAt||'').localeCompare(String(a.publishedAt||'')))});
  if(req.method==='POST'){
   const b=req.body||{},now=new Date().toISOString();
   const existing=b.id?store.items.find(x=>x.id===b.id):null;
   if(existing&&existing.__source==='auto'){
    const item={...publicItem(existing),title:(b.title||existing.title||'').trim(),excerpt:b.excerpt??existing.excerpt??'',content:b.content??existing.content??'',cover:b.cover??existing.cover??'',keyword:b.keyword??existing.keyword??'',status:b.status||existing.status||'published',publishedAt:b.publishedAt||existing.publishedAt||now.slice(0,10),source:b.source??existing.source??'',updatedAt:now,updatedBy:user.u};
    await putJson(existing.__path,item,'Cập nhật bài viết '+item.title,existing.__sha);return res.status(200).json({ok:true,item});
   }
   if(existing&&existing.__source==='legacy'){
    const item=(store.legacy.data.items||[]).find(x=>x.id===b.id);Object.assign(item,{title:b.title||item.title,excerpt:b.excerpt??item.excerpt,content:b.content??item.content,cover:b.cover??item.cover,keyword:b.keyword??item.keyword??'',status:b.status||item.status,publishedAt:b.publishedAt||item.publishedAt,source:b.source??item.source,updatedAt:now,updatedBy:user.u});store.legacy.data.updatedAt=now;await putJson('data/news.json',store.legacy.data,'Cập nhật bài viết '+item.title,store.legacy.sha);return res.status(200).json({ok:true,item});
   }
   let id=slug(b.title)||('tin-'+Date.now());
   if(store.items.some(x=>x.id===id))id=id+'-'+Date.now();
   const item={id,title:(b.title||'Bài viết mới').trim(),excerpt:(b.excerpt||'').trim(),content:(b.content||'').trim(),cover:(b.cover||'').trim(),keyword:(b.keyword||'').trim(),status:b.status==='draft'?'draft':'published',publishedAt:b.publishedAt||now.slice(0,10),source:(b.source||'').trim(),createdAt:now,createdBy:user.u};
   await putJson('data/auto-news/'+id+'.json',item,'Tạo bài viết '+item.title,null);return res.status(200).json({ok:true,item});
  }
  if(req.method==='DELETE'){
   const {id}=req.body||{},existing=store.items.find(x=>x.id===id);if(!existing)return res.status(404).json({ok:false,message:'Không tìm thấy bài viết.'});
   if(existing.__source==='auto'){await gh('/contents/'+existing.__path,{method:'DELETE',body:JSON.stringify({message:'Xóa bài viết '+(existing.title||id),sha:existing.__sha,branch:BRANCH})});return res.status(200).json({ok:true});}
   store.legacy.data.items=(store.legacy.data.items||[]).filter(x=>x.id!==id);store.legacy.data.updatedAt=new Date().toISOString();await putJson('data/news.json',store.legacy.data,'Xóa bài viết',store.legacy.sha);return res.status(200).json({ok:true});
  }
  return res.status(405).json({ok:false});
 }catch(e){return res.status(500).json({ok:false,message:e.message||'Không thể xử lý tin tức.'})}
};
