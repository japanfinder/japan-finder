import {reply,sha,now,validEmail,originOK,cookie,rateLimit} from './_lib.js';
export async function onRequestPost({request,env}){
 if(!originOK(request))return reply({error:'Invalid origin'},403);
 if(!env.DB||!env.AUTH_SECRET)return reply({error:'Authentication not configured'},503);
 let b;try{b=await request.json()}catch{return reply({error:'Invalid JSON'},400)}
 const email=String(b.email||'').trim().toLowerCase(),code=String(b.code||'');
 if(!validEmail(email)||!/^\d{6}$/.test(code))return reply({error:'Invalid email or code'},400);
 const ip=request.headers.get('CF-Connecting-IP')||'unknown';
 if(!await rateLimit(env,'verify:'+await sha(env.AUTH_SECRET+ip),30,900))return reply({error:'Too many attempts. Try later.'},429);
 const row=await env.DB.prepare('SELECT code_hash,expires_at,attempts FROM auth_codes WHERE email=?').bind(email).first();
 if(!row||row.expires_at<=now()||row.attempts>=5)return reply({error:'Invalid or expired code'},400);
 await env.DB.prepare('UPDATE auth_codes SET attempts=attempts+1 WHERE email=?').bind(email).run();
 if(await sha(env.AUTH_SECRET+':otp:'+email+':'+code)!==row.code_hash)return reply({error:'Invalid or expired code'},400);
 // Consume atomically so a code cannot be reused concurrently.
 const consumed=await env.DB.prepare('DELETE FROM auth_codes WHERE email=? AND code_hash=? AND attempts<=5').bind(email,row.code_hash).run();
 if(!consumed.meta.changes)return reply({error:'Code already used'},400);
 await env.DB.prepare('INSERT OR IGNORE INTO users(id,email) VALUES (?,?)').bind(crypto.randomUUID(),email).run();
 const user=await env.DB.prepare('SELECT id,email FROM users WHERE email=?').bind(email).first();
 const token=crypto.randomUUID()+crypto.randomUUID(),key=await sha(env.AUTH_SECRET+':session:'+token),ttl=60*60*24*30;
 await env.DB.prepare('INSERT INTO auth_sessions(token_hash,user_id,expires_at,created_at) VALUES (?,?,?,?)').bind(key,user.id,now()+ttl,now()).run();
 return reply({ok:true,email:user.email},200,{'Set-Cookie':cookie(token,ttl)});
}
