import {reply,getSession} from './_lib.js';
export async function onRequestGet({request,env}){const u=await getSession(request,env);return reply({loggedIn:!!u,email:u?.email||null})}
