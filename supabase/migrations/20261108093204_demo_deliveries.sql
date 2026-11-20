-- Operator API only. No public or authenticated direct table/RPC access.
create table public.demo_deliveries (
  id uuid primary key,
  actor_id uuid references auth.users(id) on delete set null,
  share_id text not null references public.demo_shares(id) on delete cascade,
  channel text not null check (channel in ('sms','email')),
  recipient text not null check (length(recipient) between 1 and 254),
  mode text not null check (mode in ('test','live')),
  request_hash text not null,
  status text not null default 'processing' check (status in ('processing','tested','accepted','failed','unknown')),
  provider_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index demo_deliveries_share_created_idx on public.demo_deliveries(share_id,created_at desc);
create index demo_deliveries_created_idx on public.demo_deliveries(created_at desc);
create index demo_deliveries_actor_idx on public.demo_deliveries(actor_id);
alter table public.demo_deliveries enable row level security;
revoke all on public.demo_deliveries from public, anon, authenticated;
grant select,insert,update,delete on public.demo_deliveries to service_role;

create function public.reserve_demo_delivery(p_id uuid,p_actor uuid,p_share text,p_channel text,p_recipient text,p_mode text,p_hash text,p_daily_limit integer)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare existing public.demo_deliveries; saved public.demo_deliveries;
begin
  -- Serialize reservations across server instances, including daily quota checks.
  perform pg_advisory_xact_lock(193427611, 1);
  select * into existing from public.demo_deliveries where id=p_id;
  if found then
    if existing.request_hash<>p_hash or existing.actor_id is distinct from p_actor then
      raise sqlstate 'PT409' using message='Request conflict';
    end if;
    return jsonb_build_object('claimed',false,'delivery',to_jsonb(existing)-'request_hash'-'provider_id'-'actor_id'-'share_id');
  end if;
  if p_daily_limit < 1 or p_daily_limit > 10000 or not exists (
    select 1 from public.demo_shares s join public.demo_sites d on d.id=s.demo_site_id
    where s.id=p_share and s.is_active and (s.expires_at is null or s.expires_at>now())
      and d.site_contract_status not in ('suspended','lost')
  ) then raise sqlstate 'PT409' using message='Invalid delivery'; end if;
  if exists(select 1 from public.demo_deliveries where request_hash=p_hash and created_at>now()-interval '60 seconds')
    or (select count(*) from public.demo_deliveries where actor_id=p_actor and created_at>now()-interval '1 minute')>=10
    or (p_mode='live' and (select count(*) from public.demo_deliveries where mode='live' and created_at>=(date_trunc('day',now() at time zone 'Asia/Tokyo') at time zone 'Asia/Tokyo'))>=p_daily_limit)
  then raise sqlstate 'PT429' using message='Delivery limit'; end if;
  insert into public.demo_deliveries(id,actor_id,share_id,channel,recipient,mode,request_hash)
  values(p_id,p_actor,p_share,p_channel,p_recipient,p_mode,p_hash) returning * into saved;
  return jsonb_build_object('claimed',true,'delivery',to_jsonb(saved)-'request_hash'-'provider_id'-'actor_id'-'share_id');
end;
$$;
revoke all on function public.reserve_demo_delivery(uuid,uuid,text,text,text,text,text,integer) from public,anon,authenticated;
grant execute on function public.reserve_demo_delivery(uuid,uuid,text,text,text,text,text,integer) to service_role;
