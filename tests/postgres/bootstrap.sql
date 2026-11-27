-- Local-only roles corresponding to Supabase API roles.
do $$begin if not exists(select 1 from pg_roles where rolname='anon')then create role anon nologin;create role authenticated nologin;create role service_role nologin bypassrls;end if;end;$$;
-- Synthetic compatibility objects only. No Supabase Auth/Storage service is running.
create schema auth;
create schema storage;
create table auth.users(id uuid primary key,aud text,role text,email text unique,raw_app_meta_data jsonb,raw_user_meta_data jsonb,created_at timestamptz,updated_at timestamptz);
create function auth.uid()returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
create function auth.jwt()returns jsonb language sql stable as $$select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb$$;
create table storage.buckets(id text primary key,name text,public boolean);
create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text);
alter table storage.objects enable row level security;
grant usage on schema public,auth,storage to anon,authenticated,service_role;
alter default privileges in schema public grant all on tables to service_role,anon,authenticated;
grant select on storage.objects to anon,authenticated;
create schema sakupage_fixture_guard;
create table sakupage_fixture_guard.identity(key text primary key,value text not null);
insert into sakupage_fixture_guard.identity values('purpose','synthetic-only-local-lab');
