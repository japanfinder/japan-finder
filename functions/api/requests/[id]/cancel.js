const json=(o,s=200)=>new Response(JSON.stringify(o),{status:s,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
const hash=async(s)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))).map(x=>x.toString(16).padStart(2,'0')).join('');
export async function onRequestPost({request,env,params}){
if(!env.DB)return json({error:'Database unavailable'},503);
let body;try{body=await request.json()}catch{return json({error:'Invalid JSON'},400)}
if(typeof body.token!=='string'||body.token.length>150||typeof body.clientId!=='string'||body.clientId.length>100)return json({error:'Invalid request'},400);
const record=await env.DB.prepare('SELECT token_hash FROM requests WHERE id=?').bind(params.id).first();
if(!record||(await hash(body.token))!==record.token_hash)return json({error:'Unauthorized'},401);
const result=await env.DB.prepare("UPDATE request_items SET status='cancelled',reason='Cancelled by customer before purchase',updated_at=CURRENT_TIMESTAMP WHERE request_id=? AND client_id=? AND status IN ('pending','approved','rejected','more_info')").bind(params.id,body.clientId).run();
if(!result.meta?.changes)return json({error:'Item not found or already cancelled. Contact staff if purchased.'},409);
return json({ok:true});
}
