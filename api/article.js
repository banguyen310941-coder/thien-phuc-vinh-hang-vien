const news=require('../data/news.json');
const site=require('../data/site-content.json');
const origin='https://www.thienphucvinhhangvien.net';
const fallback='/assets/uploads/overview-1787919202977.jpg';
const extra={
 'thien-phuc-vinh-hang-vien-uong-bi-yen-tu':['/assets/uploads/location-1787918305654.jpg','/assets/uploads/amenityGarden-1787918481252.jpg'],
 'kinh-nghiem-lua-chon-cong-vien-nghia-trang':['/assets/uploads/overview-1787919202977.jpg','/assets/uploads/amenityGarden-1787918481252.jpg'],
 'mo-don-mo-doi-khu-gia-toc-khac-nhau-the-nao':['/assets/uploads/productSingle-1787918273700.jpg','/assets/uploads/productFamily-1787918353180.jpg'],
 'y-nghia-canh-quan-xanh-trong-hoa-vien-nghia-trang':['/assets/uploads/overview-1787919202977.jpg','/assets/uploads/amenityLake-1787918458877.jpg'],
 'tham-quan-thien-phuc-vinh-hang-vien-can-tim-hieu-gi':['/assets/uploads/location-1787918305654.jpg','/assets/uploads/overview-1787919202977.jpg'],
 'cham-soc-mo-phan-lau-dai':['/assets/uploads/amenityGarden-1787918481252.jpg','/assets/uploads/overview-1787919202977.jpg']
};
const esc=s=>String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const json=s=>JSON.stringify(s).replace(/</g,'\\u003c');
const abs=s=>/^https?:\/\//i.test(String(s||''))?String(s):origin+(String(s||'').startsWith('/')?'':'/')+String(s||'');
const safeUrl=u=>{try{const x=new URL(String(u||''),origin);return /^https?:$/.test(x.protocol)?x.href:''}catch{return ''}};
const inline=s=>{
 let out=esc(s);
 out=out.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]+)\)/g,(m,t,u)=>'<a class="text-link" href="'+esc(safeUrl(u))+'"'+(/^https?:\/\//.test(u)?' target="_blank" rel="noopener"':'')+'>'+t+'</a>');
 out=out.replace(/(^|\s)(https?:\/\/[^\s<]+)/g,(m,p,u)=>p+'<a class="text-link" href="'+esc(safeUrl(u))+'" target="_blank" rel="noopener">'+esc(u)+'</a>');
 return out;
};
const renderContent=(content,extras,title)=>{
 const blocks=String(content||'').split(/\n+/).map(x=>x.trim()).filter(Boolean);let body='',paragraphs=0;
 blocks.forEach(p=>{
  if(/^###\s+/.test(p)){body+='<h3>'+inline(p.replace(/^###\s+/,''))+'</h3>';return}
  if(/^##\s+/.test(p)){body+='<h2>'+inline(p.replace(/^##\s+/,''))+'</h2>';return}
  if(/^#\s+/.test(p)){body+='<h2>'+inline(p.replace(/^#\s+/,''))+'</h2>';return}
  const legacy=/^(\d+\.|Không gian|Vị trí|Các loại|Hệ thống|Lựa chọn|Mộ đơn|Mộ đôi|Khu gia tộc|Nên lựa chọn)/i.test(p);
  if(legacy){body+='<h2>'+inline(p)+'</h2>';return}
  body+='<p>'+inline(p)+'</p>';paragraphs++;
  if(paragraphs===2&&extras[0])body+='<figure class="wide-image"><img src="'+esc(extras[0])+'" alt="Không gian Thiên Phúc Vĩnh Hằng Viên - '+esc(title)+'" loading="lazy"></figure>';
  if(paragraphs===5&&extras[1])body+='<figure class="wide-image"><img src="'+esc(extras[1])+'" alt="Cảnh quan Thiên Phúc Vĩnh Hằng Viên" loading="lazy"></figure>';
 });
 return body;
};
module.exports=(req,res)=>{
 const id=String(req.query.id||'');const n=(news.items||[]).find(x=>x.id===id&&x.status==='published');
 if(!n){res.statusCode=404;res.setHeader('X-Robots-Tag','noindex, follow');return res.end('<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="robots" content="noindex,follow"><title>Không tìm thấy bài viết</title></head><body><h1>Không tìm thấy bài viết</h1><a href="/tin-tuc.html">Xem tin tức</a></body></html>')}
 const url=origin+'/tin-tuc/'+encodeURIComponent(n.id)+'.html';
 const cover=n.cover||fallback;const image=abs(cover);const desc=String(n.excerpt||n.content||'').replace(/[#*_`]/g,'').replace(/\s+/g,' ').slice(0,160);
 const ex=extra[n.id]||[site.slots?.location?.src||'/assets/uploads/location-1787918305654.jpg',site.slots?.amenityGarden?.src||'/assets/uploads/amenityGarden-1787918481252.jpg'];
 const body=renderContent(n.content,ex,n.title);const logo=site.slots?.logo?.src||'';
 const schema={'@context':'https://schema.org','@graph':[{'@type':'Article',headline:n.title,description:desc,image:[image,...ex.map(abs)],datePublished:n.publishedAt,dateModified:n.updatedAt||n.publishedAt,mainEntityOfPage:url,inLanguage:'vi-VN',author:{'@type':'Organization',name:'Thiên Phúc Vĩnh Hằng Viên'},publisher:{'@type':'Organization',name:'Thiên Phúc Vĩnh Hằng Viên',url:origin+'/'}},{'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Trang chủ',item:origin+'/'},{'@type':'ListItem',position:2,name:'Tin tức',item:origin+'/tin-tuc.html'},{'@type':'ListItem',position:3,name:n.title,item:url}]}]};
 const css='<style>.article-hero{padding:150px 0 58px;background:#153b2b;color:#fff}.article-hero .back{color:#d9b66f;text-decoration:none;font-size:13px}.article-hero h1{max-width:900px;margin:18px 0 12px;color:#fff;font-size:clamp(34px,5vw,58px);line-height:1.12}.article-hero p{opacity:.78}.article{max-width:900px;padding-top:52px;padding-bottom:80px}.article-cover,.wide-image img{display:block;width:100%;height:auto;object-fit:cover}.article-cover{max-height:560px;margin-bottom:32px}.article .lead{font-size:19px;line-height:1.8;color:#4d5b53;border-left:3px solid #b68a45;padding-left:20px;margin:0 0 34px}.article h2{font-size:30px;line-height:1.3;margin:42px 0 16px;color:#153b2b}.article h3{font-size:23px;line-height:1.35;margin:30px 0 12px;color:#214c39}.article>p{font-size:16px;line-height:1.9;margin:0 0 20px}.wide-image{margin:34px 0}.wide-image img{max-height:560px}.source-box{margin:34px 0;padding:18px 20px;background:#f4f0e7;border-left:3px solid #b68a45}.site-footer a{display:block}@media(max-width:700px){.article-hero{padding:115px 0 42px}.article{padding-top:30px}.article h2{font-size:25px}.article h3{font-size:21px}.article .lead{font-size:17px}}</style>';
 const html='<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+esc(n.title)+' | Thiên Phúc Vĩnh Hằng Viên</title><meta name="description" content="'+esc(desc)+'"><meta name="robots" content="index,follow,max-image-preview:large"><meta name="theme-color" content="#153b2b"><link rel="canonical" href="'+url+'"><meta property="og:locale" content="vi_VN"><meta property="og:type" content="article"><meta property="og:site_name" content="Thiên Phúc Vĩnh Hằng Viên"><meta property="og:title" content="'+esc(n.title)+'"><meta property="og:description" content="'+esc(desc)+'"><meta property="og:url" content="'+url+'"><meta property="og:image" content="'+esc(image)+'"><meta name="twitter:card" content="summary_large_image"><script type="application/ld+json">'+json(schema)+'</script><link rel="stylesheet" href="/styles.css">'+css+'</head><body><header class="site-header"><div class="wrap nav"><a class="brand" href="/index.html"><img src="'+esc(logo)+'" alt="Logo Thiên Phúc Vĩnh Hằng Viên"></a><button class="menu-toggle" aria-label="Mở menu">☰</button><nav class="main-nav"><a href="/index.html">Trang chủ</a><a href="/gioi-thieu.html">Giới thiệu</a><a href="/san-pham.html">Sản phẩm</a><a href="/vi-tri.html">Vị trí</a><a href="/tien-ich.html">Tiện ích</a><a href="/phoi-canh.html">Phối cảnh</a><a href="/tin-tuc.html" aria-current="page">Tin tức</a><a href="/lien-he.html">Liên hệ</a></nav><a class="nav-cta" href="/lien-he.html">Đăng ký tham quan</a></div></header><main><section class="article-hero"><div class="wrap"><a class="back" href="/tin-tuc.html">← Tin tức Thiên Phúc</a><h1>'+esc(n.title)+'</h1><p>'+esc(String(n.publishedAt||'').split('-').reverse().join('.'))+'</p></div></section><article class="wrap article"><img class="article-cover" src="'+esc(cover)+'" alt="Ảnh đại diện '+esc(n.title)+'" loading="eager"><p class="lead">'+esc(n.excerpt||'')+'</p>'+body+(n.source?'<div class="source-box"><b>Nguồn:</b> '+esc(n.source)+'</div>':'')+'<p><a class="text-link" href="/gioi-thieu.html">Tìm hiểu Thiên Phúc Vĩnh Hằng Viên</a> · <a class="text-link" href="/lien-he.html">Đăng ký tham quan dự án</a></p></article></main><footer class="site-footer"><div class="wrap footer-grid"><div class="footer-brand"><img src="'+esc(logo)+'" alt="Thiên Phúc Vĩnh Hằng Viên"><p>Hoa viên nghĩa trang sinh thái tại Uông Bí – Yên Tử, Quảng Ninh.</p></div><div><strong>Khám phá</strong><a href="/gioi-thieu.html">Giới thiệu</a><a href="/san-pham.html">Sản phẩm</a><a href="/tien-ich.html">Tiện ích</a></div><div><strong>Thông tin</strong><a href="/tin-tuc.html">Tin tức</a><a href="/lien-he.html">Liên hệ</a></div></div><div class="copyright">© 2026 Thiên Phúc Vĩnh Hằng Viên.</div></footer><script src="/script.js"></script></body></html>';
 res.statusCode=200;res.setHeader('Content-Type','text/html; charset=utf-8');res.setHeader('X-Robots-Tag','index, follow, max-image-preview:large');res.setHeader('Cache-Control','public, s-maxage=300, stale-while-revalidate=86400');res.end(html);
};