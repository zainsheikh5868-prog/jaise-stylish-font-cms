import {cookies} from 'next/headers';
import {createServerClient} from '@supabase/ssr';
import {supabaseAdmin} from './supabase-server';
export async function requireAdmin(){
  const store=await cookies();
  const sb=createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,{cookies:{getAll(){return store.getAll()},setAll(){}}});
  const {data:{user}}=await sb.auth.getUser();
  if(!user)return null;
  const {data}=await supabaseAdmin().from('admin_users').select('role').eq('user_id',user.id).maybeSingle();
  return data?.role==='admin'?user:null;
}
