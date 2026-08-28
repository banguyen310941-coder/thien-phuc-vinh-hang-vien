const btn=document.querySelector('.menu-toggle'),nav=document.querySelector('.main-nav');btn?.addEventListener('click',()=>nav.classList.toggle('open'));document.querySelectorAll('.main-nav a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));

document.querySelector('#form')?.addEventListener('submit',e=>{e.preventDefault();const note=document.querySelector('#note');if(note)note.textContent='Cảm ơn bạn. Thông tin đã được ghi nhận.';e.target.reset();});

const slotMap={
  logo:['.brand img','.footer-brand img'],
  homeHero:['.hero-home .hero-bg','.news-highlight .rounded-media'],
  overview:['body:not(.admin-page) main>.section:first-of-type .rounded-media'],
  location:['.location-visual img'],
  amenitySpiritual:['.amenity-grid article:nth-child(1) img'],
  amenityLake:['.amenity-grid article:nth-child(2) img'],
  amenityOffice:['.amenity-grid article:nth-child(3) img'],
  amenityParking:['.amenity-grid article:nth-child(4) img'],
  amenityGarden:['.amenity-grid article:nth-child(5) img'],
  amenityCare:['.amenity-grid article:nth-child(6) img'],
  productSingle:['.home-products article:nth-child(1) img','.product-row:nth-child(1) img'],
  productDouble:['.home-products article:nth-child(2) img','.product-row:nth-child(2) img'],
  productFamily:['.home-products article:nth-child(3) img','.product-row:nth-child(3) img']
};

function applySlot(slot,src){(slotMap[slot]||[]).forEach(sel=>document.querySelectorAll(sel).forEach(el=>{if(el&&src)el.src=src}));}

function applyPageSpecific(slots){const p=location.pathname.replace(/\/$/,'')||'/';const src=k=>slots[k]?.src;
  if(p.includes('gioi-thieu')){document.querySelector('.page-hero .hero-bg')?.setAttribute('src',src('overview')||'');document.querySelector('.wide-image img')?.setAttribute('src',src('homeHero')||'');}
  if(p.includes('san-pham')){document.querySelector('.page-hero .hero-bg')?.setAttribute('src',src('productSingle')||'');}
  if(p.includes('phoi-canh')){document.querySelector('.page-hero .hero-bg')?.setAttribute('src',src('homeHero')||'');const imgs=document.querySelectorAll('.gallery figure img');const keys=['overview','homeHero','productSingle','productDouble','productFamily','location','amenitySpiritual','amenityLake','amenityOffice','amenityParking','amenityGarden','amenityCare'];imgs.forEach((img,i)=>{if(keys[i]&&src(keys[i]))img.src=src(keys[i]);});}
  if(p.includes('tin-tuc'))document.querySelector('.page-hero .hero-bg')?.setAttribute('src',src('overview')||'');
  if(p.includes('lien-he'))document.querySelector('.page-hero .hero-bg')?.setAttribute('src',src('homeHero')||'');
}

fetch('/data/site-content.json?ts='+Date.now(),{cache:'no-store'}).then(r=>r.ok?r.json():null).then(data=>{if(!data?.slots)return;Object.entries(data.slots).forEach(([k,v])=>applySlot(k,v.src));applyPageSpecific(data.slots)}).catch(()=>{});