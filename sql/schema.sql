-- Autonomous Stylish CMS - Supabase/PostgreSQL schema
create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'admin' check (role in ('admin','editor')),
  created_at timestamptz not null default now()
);

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.admin_users a where a.user_id=auth.uid() and a.role='admin');
$$;

create or replace function public.is_editor() returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.admin_users a where a.user_id=auth.uid() and a.role in ('admin','editor'));
$$;

create or replace function public.touch_updated_at() returns trigger language plpgsql as $$ begin new.updated_at=now(); return new; end $$;

create table if not exists public.pages (
 id uuid primary key default gen_random_uuid(), path text unique not null, title text, template text default 'system', enabled boolean not null default true,
 meta_title text, meta_description text, created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists public.content_blocks (
 id uuid primary key default gen_random_uuid(), key text not null, value text, page_path text default '/', enabled boolean not null default true,
 created_at timestamptz default now(), updated_at timestamptz default now(), unique(key,page_path)
);
create table if not exists public.posts (
 id uuid primary key default gen_random_uuid(), title text not null, slug text unique not null, excerpt text, content_html text not null default '', cover_url text,
 tags text[] default '{}', status text not null default 'draft' check(status in ('draft','published')), published_at timestamptz, focus_keyword text,
 meta_title text, meta_description text, og_image text, created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists public.seo_settings (
 id uuid primary key default gen_random_uuid(), key text unique not null, value text, enabled boolean not null default true,
 created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists public.sitemap_rules (
 id uuid primary key default gen_random_uuid(), path text unique not null, include boolean not null default true, priority numeric(2,1) default 0.6,
 changefreq text default 'monthly', lastmod_override timestamptz, created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists public.scripts (
 id uuid primary key default gen_random_uuid(), name text not null, location text not null default 'body_end' check(location in('head','body_start','body_end')),
 code text not null default '', scope text not null default 'global' check(scope in('global','page')), page_path text, enabled boolean not null default true,
 created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists public.ads (
 id uuid primary key default gen_random_uuid(), name text not null, slot text not null default 'inline', code text not null default '', page_path text,
 priority int not null default 0, enabled boolean not null default true, created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists public.redirects (
 id uuid primary key default gen_random_uuid(), source_path text unique not null, destination_url text not null, status_code int not null default 301 check(status_code in(301,302)),
 enabled boolean not null default true, created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists public.faqs (
 id uuid primary key default gen_random_uuid(), page_path text not null default '/', question text not null, answer text not null, sort_order int default 0,
 enabled boolean not null default true, created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists public.popups (
 id uuid primary key default gen_random_uuid(), name text not null, kind text not null default 'modal' check(kind in('banner','modal','affiliate')), title text,
 body_html text, trigger text not null default 'immediate' check(trigger in('immediate','delay','exit_intent')), delay_ms int default 1500, page_path text,
 starts_at timestamptz, ends_at timestamptz, enabled boolean not null default true, created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists public.robots_rules (
 id uuid primary key default gen_random_uuid(), user_agent text not null default '*', directive text not null check(directive in('Allow','Disallow','Crawl-delay')),
 value text, sort_order int default 0, enabled boolean not null default true, created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists public.site_settings (
 id uuid primary key default gen_random_uuid(), key text unique not null, value text, is_public boolean not null default true,
 created_at timestamptz default now(), updated_at timestamptz default now()
);

-- Audit trail for sensitive admin changes.
create table if not exists public.audit_log (
 id bigint generated always as identity primary key, actor uuid references auth.users(id), table_name text, row_id text, action text, changed_at timestamptz default now(), payload jsonb
);

-- Auto updated_at trigger on all CMS tables.
do $$ declare t text; begin
 foreach t in array array['pages','content_blocks','posts','seo_settings','sitemap_rules','scripts','ads','redirects','faqs','popups','robots_rules','site_settings'] loop
  execute format('drop trigger if exists trg_%I_updated on public.%I',t,t);
  execute format('create trigger trg_%I_updated before update on public.%I for each row execute function public.touch_updated_at()',t,t);
 end loop;
end $$;

-- Public-safe views.
create or replace view public.published_posts with (security_invoker=true) as
 select * from public.posts where status='published' and (published_at is null or published_at<=now());
create or replace view public.site_settings_public with (security_invoker=true) as
 select max(value) filter(where key='site_name') as site_name,
        max(value) filter(where key='home_intro') as home_intro,
        max(value) filter(where key='footer_text') as footer_text
 from public.site_settings where is_public=true;

-- Enable RLS.
alter table public.admin_users enable row level security;
do $$ declare t text; begin foreach t in array array['pages','content_blocks','posts','seo_settings','sitemap_rules','scripts','ads','redirects','faqs','popups','robots_rules','site_settings','audit_log'] loop execute format('alter table public.%I enable row level security',t); end loop; end $$;

-- Admin user access.
create policy "admins read admin_users" on public.admin_users for select to authenticated using(public.is_admin());
create policy "admins manage admin_users" on public.admin_users for all to authenticated using(public.is_admin()) with check(public.is_admin());

-- Public can only read data that is safe and active; authenticated editors can manage CMS data.
create policy "public pages read" on public.pages for select to anon,authenticated using(enabled=true or public.is_editor());
create policy "public content read" on public.content_blocks for select to anon,authenticated using(enabled=true or public.is_editor());
create policy "public posts read" on public.posts for select to anon,authenticated using((status='published' and (published_at is null or published_at<=now())) or public.is_editor());
create policy "public seo read" on public.seo_settings for select to anon,authenticated using(enabled=true or public.is_editor());
create policy "public sitemap read" on public.sitemap_rules for select to anon,authenticated using(include=true or public.is_editor());
create policy "public scripts read" on public.scripts for select to anon,authenticated using(enabled=true or public.is_editor());
create policy "public ads read" on public.ads for select to anon,authenticated using(enabled=true or public.is_editor());
create policy "public redirects read" on public.redirects for select to anon,authenticated using(enabled=true or public.is_editor());
create policy "public faq read" on public.faqs for select to anon,authenticated using(enabled=true or public.is_editor());
create policy "public popups read" on public.popups for select to anon,authenticated using(enabled=true or public.is_editor());
create policy "public robots read" on public.robots_rules for select to anon,authenticated using(enabled=true or public.is_editor());
create policy "public settings read" on public.site_settings for select to anon,authenticated using(is_public=true or public.is_editor());

-- Editor write policies.
do $$ declare t text; begin
 foreach t in array array['pages','content_blocks','posts','seo_settings','sitemap_rules','scripts','ads','redirects','faqs','popups','robots_rules','site_settings'] loop
  execute format('create policy "editor insert %1$s" on public.%1$I for insert to authenticated with check(public.is_editor())',t);
  execute format('create policy "editor update %1$s" on public.%1$I for update to authenticated using(public.is_editor()) with check(public.is_editor())',t);
  execute format('create policy "editor delete %1$s" on public.%1$I for delete to authenticated using(public.is_editor())',t);
 end loop;
end $$;
create policy "admins read audit" on public.audit_log for select to authenticated using(public.is_admin());

-- Storage bucket. Public files, editor-only mutation.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('media','media',true,10485760,array['image/jpeg','image/png','image/webp','image/gif','image/svg+xml'])
on conflict(id) do update set public=excluded.public,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

create policy "public media read" on storage.objects for select to anon,authenticated using(bucket_id='media');
create policy "editors upload media" on storage.objects for insert to authenticated with check(bucket_id='media' and public.is_editor());
create policy "editors update media" on storage.objects for update to authenticated using(bucket_id='media' and public.is_editor()) with check(bucket_id='media' and public.is_editor());
create policy "editors delete media" on storage.objects for delete to authenticated using(bucket_id='media' and public.is_editor());

-- Seed a few defaults.
insert into public.site_settings(key,value,is_public) values
 ('site_name','StylishName',true),('home_intro','Type once and get dozens of live, copy-ready styles for games, social profiles, bios and clan names.',true),('footer_text','© StylishName. All rights reserved.',true)
on conflict(key) do nothing;
insert into public.pages(path,title,enabled) values('/', 'Home', true),('/blog','Blog',true),('/privacy-policy','Privacy Policy',true) on conflict(path) do nothing;
insert into public.robots_rules(user_agent,directive,value,sort_order) values('*','Allow','/',10) on conflict do nothing;

-- First-party analytics: no external analytics dashboard required.
create table if not exists public.analytics_events (
 id bigint generated always as identity primary key,
 event_name text not null,
 path text not null,
 session_id text,
 referrer text,
 user_agent text,
 occurred_at timestamptz not null default now()
);
alter table public.analytics_events enable row level security;
create policy "anon analytics insert" on public.analytics_events for insert to anon,authenticated with check(event_name in ('pageview','heartbeat'));
create policy "admins analytics read" on public.analytics_events for select to authenticated using(public.is_admin());
create index if not exists analytics_events_time_idx on public.analytics_events(occurred_at desc);
create index if not exists analytics_events_session_idx on public.analytics_events(session_id, occurred_at desc);
