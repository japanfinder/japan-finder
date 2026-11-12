import {reply,getSession,originOK} from '../auth/_lib.js';
const validURL=v=>{try{const u=new URL(v);return u.protocol==='https:'&&['amazon.co.jp','mercari.com','paypayfleamarket.yahoo.co.jp'].some(h=>u.hostname===h||u.hostname.endsWith('.'+h))}catch{return false}};
export async function onRequestGet({request,env}){
 const u=await getSession(request,env);if(!u)return reply({error:'Sign in first'},401);
 const r=await env.DB.prepare('SELECT items_json FROM user_carts WHERE user_id=?').bind(u.id).first();
 return reply({items:r?JSON.parse(r.items_json):[],exists:!!r});
}
export async function onRequestPut({request,env}){
 if(!originOK(request))return reply({error:'Invalid origin'},403);
 const u=await getSession(request,env);if(!u)return reply({error:'Sign in first'},401);
 let b;try{b=await request.json()}catch{return reply({error:'Invalid JSON'},400)}
 if(!Array.isArray(b.items)||b.items.length>100)return reply({error:'Maximum 100 items'},400);
 const items=[];
 for(const i of b.items){if(!i||typeof i.id!=='string'||i.id.length>100||!validURL(i.url)||typeof i.name!=='string'||i.name.length>140||i.name.length===0||!(i.price===null||Number.isSafeInteger(i.price)&&i.price>=0&&i.price<=100000000))return reply({error:'Invalid cart item'},400);
 // Only synchronize safe, editable draft entries. Server-side quote state remains authoritative in request tables.
 items.push({id:i.id,url:i.url,name:i.name,price:i.price});}
 await env.DB.prepare('INSERT INTO user_carts(user_id,items_json) VALUES (?,?) ON CONFLICT(user_id) DO UPDATE SET items_json=excluded.items_json,updated_at=CURRENT_TIMESTAMP').bind(u.id,JSON.stringify(items)).run();
 return reply({ok:true,count:items.length});
}
