import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
export async function middleware(request){
  let response=NextResponse.next({request});
  const supabase=createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,{cookies:{getAll(){return request.cookies.getAll()},setAll(cookies){cookies.forEach(({name,value,options})=>response.cookies.set(name,value,options))}}});
  const path=request.nextUrl.pathname;
  const {data:{user}}=await supabase.auth.getUser();
  if(path.startsWith('/admin')){
    if(path!='/admin/login' && !user){const u=request.nextUrl.clone();u.pathname='/admin/login';u.searchParams.set('next',path);return NextResponse.redirect(u)}
    if(path==='/admin/login' && user){const u=request.nextUrl.clone();u.pathname='/admin';return NextResponse.redirect(u)}
    return response;
  }
  if(path.startsWith('/_next')||path.startsWith('/api')||path==='/favicon.ico')return response;
  const [{data:redir},{data:page}]=await Promise.all([
    supabase.from('redirects').select('destination_url,status_code').eq('source_path',path).eq('enabled',true).maybeSingle(),
    supabase.from('pages').select('enabled').eq('path',path).maybeSingle()
  ]);
  if(redir?.destination_url){const target=redir.destination_url.startsWith('http')?new URL(redir.destination_url):new URL(redir.destination_url,request.url);return NextResponse.redirect(target,redir.status_code||301)}
  if(page && page.enabled===false)return new NextResponse('Not Found',{status:404});
  return response;
}
export const config={matcher:['/((?!_next/static|_next/image).*)']};
