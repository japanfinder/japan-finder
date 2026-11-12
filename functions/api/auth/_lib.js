export const reply=(data,status=200,headers={})=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store',...headers}});
export const sha=async(s)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))).map(b=>b.toString(16).padStart(2,'0')).join('');
export const now=()=>Math.floor(Date.now()/1000);
export const validEmail=e=>typeof e==='string'&&e.length<=254&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
export const originOK=req=>{try{return new URL(req.headers.get('Origin')).origin===new URL(req.url).origin}catch{return false}};
export const getSession=async(req,env)=>{
 const raw=(req.headers.get('Cookie')||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('jf_session='))?.slice(11);
 if(!raw||!env.DB||!env.AUTH_SECRET)return null;
 const key=await sha(env.AUTH_SECRET+':session:'+raw);
 const row=await env.DB.prepare('SELECT u.id,u.email FROM auth_sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>?').bind(key,now()).first();
 return row?{...row,tokenHash:key}:null;
};
export const cookie=(token,maxAge)=>`jf_session=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
export async function rateLimit(env,bucket,limit,windowSeconds){
 const t=now();const row=await env.DB.prepare('SELECT count,expires_at FROM auth_rate_limits WHERE bucket=?').bind(bucket).first();
 if(row&&row.expires_at>t&&row.count>=limit)return false;
 await env.DB.prepare('INSERT INTO auth_rate_limits(bucket,count,expires_at) VALUES (?,1,?) ON CONFLICT(bucket) DO UPDATE SET count=CASE WHEN expires_at<=? THEN 1 ELSE count+1 END, expires_at=CASE WHEN expires_at<=? THEN excluded.expires_at ELSE expires_at END').bind(bucket,t+windowSeconds,t,t).run();
 return true;
}
