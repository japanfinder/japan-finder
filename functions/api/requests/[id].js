const json=(o,s=200)=>new Response(JSON.stringify(o),{status:s,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
const hash=async(s)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))).map(x=>x.toString(16).padStart(2,'0')).join('');
export async function onRequestGet({request,env,params}){
if(!env.DB)return json({error:'Database unavailable'},503);
const token=new URL(request.url).searchParams.get('token');if(!token||token.length>150)return json({error:'Unauthorized'},401);
const record=await env.DB.prepare('SELECT token_hash FROM requests WHERE id=?').bind(params.id).first();
if(!record||(await hash(token))!==record.token_hash)return json({error:'Unauthorized'},401);
const {results}=await env.DB.prepare('SELECT client_id AS clientId,status,reason,approved_price AS approvedPrice FROM request_items WHERE request_id=?').bind(params.id).all();
return json({items:results});
}
