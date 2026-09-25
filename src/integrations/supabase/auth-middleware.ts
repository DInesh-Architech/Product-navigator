import { createMiddleware } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'
function isNewSupabaseApiKey(value:string){return value.startsWith('sb_publishable_')||value.startsWith('sb_secret_')}
function createSupabaseFetch(key:string):typeof fetch{return(input,init)=>{const headers=new Headers(typeof Request!=='undefined'&&input instanceof Request?input.headers:undefined);if(init?.headers)new Headers(init.headers).forEach((v,k)=>headers.set(k,v));if(isNewSupabaseApiKey(key)&&headers.get('Authorization')===`Bearer ${key}`)headers.delete('Authorization');headers.set('apikey',key);return fetch(input,{...init,headers})}}
export const requireSupabaseAuth=createMiddleware({type:'function'}).server(async({next})=>{
 const url=process.env['SUPABASE_URL']; const key=process.env['SUPABASE_PUBLISHABLE_KEY'];
 if(!url||!key) throw new Error('Missing Supabase environment configuration');
 const request=getRequest(); if(!request?.headers) throw new Error('Unauthorized');
 const auth=request.headers.get('authorization'); if(!auth?.startsWith('Bearer ')) throw new Error('Unauthorized');
 const token=auth.slice(7); if(!token||token.split('.').length!==3) throw new Error('Unauthorized');
 const supabase=createClient<Database>(url,key,{global:{fetch:createSupabaseFetch(key),headers:{Authorization:`Bearer ${token}`}},auth:{storage:undefined,persistSession:false,autoRefreshToken:false}});
 const {data,error}=await supabase.auth.getClaims(token); if(error||!data?.claims?.sub) throw new Error('Unauthorized');
 return next({context:{supabase,userId:data.claims.sub,claims:data.claims}});
});