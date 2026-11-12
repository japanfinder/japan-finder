import {reply,sha,now,validEmail,originOK,rateLimit} from './_lib.js';
export async function onRequestPost({request,env}){
 if(!originOK(request))return reply({error:'Invalid origin'},403);
 if(!env.DB||!env.AUTH_SECRET||!env.RESEND_API_KEY||!env.AUTH_FROM_EMAIL)return reply({error:'Email login is not configured yet'},503);
 let body;try{body=await request.json()}catch{return reply({error:'Invalid JSON'},400)}
 const email=String(body.email||'').trim().toLowerCase();if(!validEmail(email))return reply({error:'Enter a valid email address'},400);
 const ip=request.headers.get('CF-Connecting-IP')||'unknown';
 if(!await rateLimit(env,'ip:'+await sha(env.AUTH_SECRET+ip),15,3600))return reply({error:'Too many attempts. Try later.'},429);
 if(!await rateLimit(env,'email:'+await sha(env.AUTH_SECRET+email),4,900))return reply({ok:true,message:'If allowed, a code will be sent.'});
 const code=String(crypto.getRandomValues(new Uint32Array(1))[0]%1000000).padStart(6,'0');
 const hash=await sha(env.AUTH_SECRET+':otp:'+email+':'+code);const t=now();
 await env.DB.prepare('INSERT INTO auth_codes(email,code_hash,expires_at,attempts,created_at) VALUES (?,?,?,0,?) ON CONFLICT(email) DO UPDATE SET code_hash=excluded.code_hash,expires_at=excluded.expires_at,attempts=0,created_at=excluded.created_at').bind(email,hash,t+600,t).run();
 const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+env.RESEND_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({from:env.AUTH_FROM_EMAIL,to:[email],subject:'JAPAN FINDER verification code',text:`Your JAPAN FINDER sign-in code is ${code}. It expires in 10 minutes. If you did not request this, ignore this email.`})});
 if(!r.ok)return reply({error:'Could not send email. Check the email provider configuration.'},502);
 return reply({ok:true,message:'Check your email for the 6-digit code.'});
}
