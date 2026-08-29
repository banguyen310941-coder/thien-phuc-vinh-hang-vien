const news=require('../data/news.json');

const ORIGIN='https://www.thienphucvinhhangvien.net';
const STATIC_PAGES=[
  {path:'/',changefreq:'weekly',priority:'1.0'},
  {path:'/gioi-thieu',changefreq:'monthly',priority:'0.9'},
  {path:'/vi-tri',changefreq:'monthly',priority:'0.9'},
  {path:'/tien-ich',changefreq:'monthly',priority:'0.9'},
  {path:'/san-pham',changefreq:'monthly',priority:'0.9'},
  {path:'/mo-don',changefreq:'monthly',priority:'0.8'},
  {path:'/mo-doi',changefreq:'monthly',priority:'0.8'},
  {path:'/khu-gia-toc',changefreq:'monthly',priority:'0.8'},
  {path:'/phoi-canh',changefreq:'monthly',priority:'0.8'},
  {path:'/tin-tuc',changefreq:'weekly',priority:'0.8'},
  {path:'/lien-he',changefreq:'monthly',priority:'0.7'}
];

function esc(s=''){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]))}
function validDate(v){const s=String(v||'').slice(0,10);return /^\d{4}-\d{2}-\d{2}$/.test(s)?s:null}
function today(){return new Date().toISOString().slice(0,10)}
function row(loc,lastmod,changefreq,priority){return `<url><loc>${esc(loc)}</loc><lastmod>${esc(lastmod)}</lastmod><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`}

module.exports=(req,res)=>{
  const fallback=today();
  const staticRows=STATIC_PAGES.map(p=>row(ORIGIN+p.path,fallback,p.changefreq,p.priority));
  const articleRows=(news.items||[])
    .filter(n=>n&&n.status==='published'&&n.id)
    .map(n=>row(`${ORIGIN}/tin-tuc/${encodeURIComponent(n.id)}`,validDate(n.updatedAt)||validDate(n.publishedAt)||fallback,'monthly','0.7'));
  const xml=`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...staticRows,...articleRows].join('\n')}\n</urlset>\n`;
  res.setHeader('Content-Type','application/xml; charset=utf-8');
  res.setHeader('Cache-Control','public, max-age=0, s-maxage=3600, stale-while-revalidate=86400');
  res.status(200).send(xml);
};
