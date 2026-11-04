const {getNews}=require('../lib/news-store');
const base='https://www.thienphucvinhhangvien.net';
const pages=['/','/gioi-thieu','/vi-tri','/tien-ich','/san-pham','/mo-don','/mo-doi','/khu-gia-toc','/phoi-canh','/tin-tuc','/lien-he'];
const x=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
module.exports=(req,res)=>{
 const news=getNews().items.filter(n=>n&&n.status==='published'&&/^[a-z0-9-]+$/.test(String(n.id||'')));
 const urls=pages.map(p=>({loc:base+p})).concat(news.map(n=>{const raw=(n.updatedAt||n.publishedAt||n.createdAt||'').slice(0,10);return {loc:`${base}/tin-tuc/${n.id}`,lastmod:/^\d{4}-\d{2}-\d{2}$/.test(raw)?raw:''}}));
 const xml='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+urls.map(u=>`  <url><loc>${x(u.loc)}</loc>${u.lastmod?`<lastmod>${x(u.lastmod)}</lastmod>`:''}</url>`).join('\n')+'\n</urlset>';
 res.setHeader('Content-Type','application/xml; charset=utf-8');
 res.setHeader('Cache-Control','public, max-age=300, s-maxage=600, stale-while-revalidate=3600');
 res.setHeader('X-Content-Type-Options','nosniff');
 res.status(200).send(xml);
};