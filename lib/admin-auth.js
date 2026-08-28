const crypto=require('crypto');
const ALL=['appearance','media','news','staff'];
function cookie(req,name){const m=(req.headers.cookie||'').match(new RegExp('(?:^|; )'+name+'=([^;]+)'));return m?decodeURIComponent(m[1]):''}
function b64url(input){return Buffer.from(input).toString('base64').replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_')}
function unb64url(input){input=input.replace(/-/g,'+').replace(/_/g,'/');while(input.length%4)input+='=';return Buffer.from(input,'base64').toString('utf8')}
function hmac(data){const s=process.env.ADMIN_SESSION_SECRET;if(!s)throw new Error('Chưa cấu hình ADMIN_SESSION_SECRET');return crypto.createHmac('sha256',s).update(data).digest('hex')}
function signSession(user){const payload={u:user.username,n:user.name||user.username,role:user.role||'editor',permissions:user.permissions||[],env:!!user.env,exp:Date.now()+8*60*60*1000};const body=b64url(JSON.stringify(payload));return body+'.'+hmac(body)}
function verifySession(req){try{const token=cookie(req,'tp_admin');const [body,sig]=token.split('.');if(!body||!sig)return null;const expected=hmac(body);if(sig.length!==expected.length||!crypto.timingSafeEqual(Buffer.from(sig),Buffer.from(expected)))return null;const p=JSON.parse(unb64url(body));if(!p.exp||p.exp<Date.now())return null;return p}catch{return null}}
function can(user,permission){return !!user&&(user.role==='superadmin'||(user.permissions||[]).includes(permission))}
function hashPassword(password,salt){return crypto.scryptSync(String(password),salt,64).toString('hex')}
function verifyPassword(password,salt,hash){try{const a=Buffer.from(hashPassword(password,salt),'hex'),b=Buffer.from(hash,'hex');return a.length===b.length&&crypto.timingSafeEqual(a,b)}catch{return false}}
function newPasswordRecord(password){const salt=crypto.randomBytes(16).toString('hex');return{salt,passwordHash:hashPassword(password,salt)}}
module.exports={ALL,signSession,verifySession,can,verifyPassword,newPasswordRecord};