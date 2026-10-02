-- Run after creating the first Supabase Auth user.
-- Replace UUID below with auth.users.id of the owner account.
insert into public.admin_users(user_id, role)
values ('00000000-0000-0000-0000-000000000000','admin')
on conflict(user_id) do update set role='admin';
