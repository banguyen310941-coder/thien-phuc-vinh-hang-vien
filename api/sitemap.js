const {getNews}=require('../lib/news-store');
const base='https://www.thienphucvinhhangvien.net';
const pages=['/','/gioi-thieu','/vi-tri','/tien-ich','/san-pham','/mo-don','/mo-doi','/khu-gia-toc','/phoi-canh','/tin-tuc','/lien-he'];
const x=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
module.exports=(req,res)=>{const news=getNews().items.filter(n=>n.status==='published');const urls=pages.map(p=>({loc:base+p,lastmod:'2026-08-30'})).concat(news.map(n=>({loc:`${base}/tin-tuc/${n.id}`,lastmod:(n.updatedAt||n.publishedAt||n.createdAt||'2026-08-30').slice(0,10)})));const xml='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+urls.map(u=>`  <url><loc>${x(u.loc)}</loc><lastmod>${x(u.lastmod)}</lastmod></url>`).join('\n')+'\n</urlset>';res.setHeader('Content-Type','application/xml; charset=utf-8');res.setHeader('Cache-Control','public, max-age=300, s-maxage=600');res.status(200).send(xml)};
