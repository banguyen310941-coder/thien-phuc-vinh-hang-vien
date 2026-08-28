const menu=document.querySelector('#menu'),nav=document.querySelector('nav');menu?.addEventListener('click',()=>nav.classList.toggle('open'));document.querySelectorAll('nav a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));const topBtn=document.querySelector('#topBtn');window.addEventListener('scroll',()=>topBtn.style.display=scrollY>500?'block':'none');topBtn.addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}));document.querySelector('#form').addEventListener('submit',e=>{e.preventDefault();document.querySelector('#note').textContent='Đã ghi nhận trên bản demo. Bước tiếp theo sẽ kết nối form với hotline/email/CRM chính thức.';e.target.reset()});

// Ảnh sản phẩm thực tế do chủ dự án cung cấp
const productCards=[...document.querySelectorAll('#sanpham .cards article')];
const productImages=[
  'assets/products/img-0403.webp',
  'assets/products/img-0406.webp',
  'assets/products/img-0408.webp'
];
productCards.forEach((card,index)=>{
  if(index<3){
    const img=document.createElement('img');
    img.className='product-photo';
    img.src=productImages[index];
    img.alt=card.querySelector('h3')?.textContent||'Sản phẩm Thiên Phúc Vĩnh Hằng Viên';
    img.loading='lazy';
    card.prepend(img);
    card.querySelector('i')?.remove();
  }else{
    card.remove();
  }
});