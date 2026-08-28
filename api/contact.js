const https=require('https');

function sendJson(res,status,data){res.statusCode=status;res.setHeader('Content-Type','application/json; charset=utf-8');res.end(JSON.stringify(data));}
function esc(v=''){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function postJson(host,path,headers,payload){return new Promise((resolve,reject)=>{const body=JSON.stringify(payload);const req=https.request({hostname:host,path,method:'POST',headers:{'Content-Type':'application/json','Content-Length':Buffer.byteLength(body),...headers}},r=>{let data='';r.on('data',d=>data+=d);r.on('end',()=>resolve({status:r.statusCode,data}));});req.on('error',reject);req.write(body);req.end();});}

module.exports=async function(req,res){
  if(req.method!=='POST')return sendJson(res,405,{ok:false,error:'Method not allowed'});
  const {name,phone,email,message}=req.body||{};
  if(!name||!phone)return sendJson(res,400,{ok:false,error:'Vui lòng nhập họ tên và số điện thoại.'});
  const key=process.env.RESEND_API_KEY;
  if(!key)return sendJson(res,503,{ok:false,error:'Hệ thống email chưa được cấu hình.'});
  const to='banguyen310941@gmail.com';
  const from=process.env.CONTACT_FROM_EMAIL||'Thiên Phúc Vĩnh Hằng Viên <onboarding@resend.dev>';
  const html=`<h2>Khách hàng đăng ký từ website Thiên Phúc Vĩnh Hằng Viên</h2><p><b>Họ và tên:</b> ${esc(name)}</p><p><b>Số điện thoại:</b> ${esc(phone)}</p><p><b>Email:</b> ${esc(email||'Không cung cấp')}</p><p><b>Nội dung:</b><br>${esc(message||'Không có').replace(/\n/g,'<br>')}</p>`;
  try{
    const out=await postJson('api.resend.com','/emails',{'Authorization':`Bearer ${key}`},{from,to:[to],reply_to:email||undefined,subject:`Đăng ký tư vấn Thiên Phúc - ${String(name).slice(0,80)}`,html});
    if(out.status<200||out.status>=300)return sendJson(res,502,{ok:false,error:'Chưa gửi được email. Vui lòng gọi Hotline 0962.496.267.'});
    return sendJson(res,200,{ok:true,message:'Cảm ơn bạn. Thông tin đã được gửi thành công.'});
  }catch(e){return sendJson(res,500,{ok:false,error:'Có lỗi khi gửi thông tin. Vui lòng gọi Hotline 0962.496.267.'});}
};