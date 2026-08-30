const {getNews}=require('../lib/news-store');
module.exports=(req,res)=>{
 try{
  const news=getNews();
  const items=(news.items||[]).filter(n=>n&&n.status==='published').sort((a,b)=>String(b.publishedAt||'').localeCompare(String(a.publishedAt||'')));
  res.setHeader('Content-Type','application/json; charset=utf-8');
  res.setHeader('Cache-Control','public, max-age=0, s-maxage=300, stale-while-revalidate=3600');
  return res.status(200).json({updatedAt:news.updatedAt||'',items});
 }catch(e){return res.status(500).json({error:'Không thể tải danh sách bài viết'});}
};
