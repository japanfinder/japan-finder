const allowed=['amazon.co.jp','mercari.com','paypayfleamarket.yahoo.co.jp'];
const json=(obj,status=200)=>new Response(JSON.stringify(obj),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
const hash=async(s)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))).map(x=>x.toString(16).padStart(2,'0')).join('');
export async function onRequestPost({request,env}){
if(!env.DB)return json({error:'Database is not configured'},503);
let body;try{body=await request.json()}catch{return json({error:'Invalid JSON'},400)}
if(!Array.isArray(body.items)||body.items.length<1||body.items.length>20)return json({error:'Choose 1–20 items'},400);
const items=[];for(const i of body.items){let u;try{u=new URL(i.url)}catch{return json({error:'Invalid product URL'},400)}
if(u.protocol!=='https:'||!allowed.some(h=>u.hostname===h||u.hostname.endsWith('.'+h)))return json({error:'Unsupported product URL'},400);
if(typeof i.name!=='string'||!i.name.trim()||i.name.length>140||typeof i.clientId!=='string'||i.clientId.length>100)return json({error:'Invalid item details'},400);
if(i.price!==null&&(!Number.isSafeInteger(i.price)||i.price<0||i.price>100000000))return json({error:'Invalid price'},400);
items.push({...i,url:u.href})}
const id=crypto.randomUUID(),token=crypto.randomUUID()+crypto.randomUUID();
const stmts=[env.DB.prepare('INSERT INTO requests (id,token_hash) VALUES (?,?)').bind(id,await hash(token))];
for(const i of items)stmts.push(env.DB.prepare('INSERT INTO request_items (id,request_id,client_id,url,name,listed_price) VALUES (?,?,?,?,?,?)').bind(crypto.randomUUID(),id,i.clientId,i.url,i.name.trim(),i.price));
try{await env.DB.batch(stmts);return json({id,token},201)}catch{return json({error:'Could not create request'},500)}
}
