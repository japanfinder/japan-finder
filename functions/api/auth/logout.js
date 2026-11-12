import {reply,getSession,originOK,cookie} from './_lib.js';
export async function onRequestPost({request,env}){
 if(!originOK(request))return reply({error:'Invalid origin'},403);
 const u=await getSession(request,env);if(u)await env.DB.prepare('DELETE FROM auth_sessions WHERE token_hash=?').bind(u.tokenHash).run();
 return reply({ok:true},200,{'Set-Cookie':cookie('',0)});
}
