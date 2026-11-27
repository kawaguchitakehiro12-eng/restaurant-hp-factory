-- REVIEW ONLY. Not applied. Do not put into automatic migrations before approval/history repair.
begin;
create function public.save_operator_demo_v1(p_site jsonb,p_content jsonb,p_photos jsonb,p_create boolean,p_expected_updated_at timestamptz default null)
returns void language plpgsql security invoker set search_path='' as $$
declare v public.demo_sites; old public.demo_sites; current_revision timestamptz;
begin
  if p_site is null or jsonb_typeof(p_site)<>'object' or p_create is null or octet_length(p_site::text)>100000 or (p_content is not null and octet_length(p_content::text)>8000000)or(p_photos is not null and octet_length(p_photos::text)>8000000)then raise sqlstate '22023' using message='Invalid or oversized input';end if;
  v:=jsonb_populate_record(null::public.demo_sites,p_site);
  if v.id is null or v.store_slug is null then raise sqlstate '22023' using message='Invalid site'; end if;
  if p_create then
    if v.site_contract_status<>'demo' or v.publish_status<>'draft' or v.customer_id is not null then raise sqlstate '42501' using message='Invalid creation';end if;
    insert into public.demo_sites select (v).*;
  else
    select * into old from public.demo_sites where id=v.id for update;
    if not found then raise sqlstate 'PT409' using message='Site not found';end if;
    select updated_at into current_revision from public.store_content where site_id=v.id for update;
    if current_revision is distinct from p_expected_updated_at then raise sqlstate 'PT409' using message='Concurrent save';end if;
    if (old.customer_id,old.publish_status,old.contract_start_date,old.minimum_term_end_date,old.monthly_fee,old.login_email,old.created_at,old.store_id,old.domain_status,old.next_billing_date,old.billing_status,old.plan_name,old.payment_method,old.published_at)
       is distinct from (v.customer_id,v.publish_status,v.contract_start_date,v.minimum_term_end_date,v.monthly_fee,v.login_email,v.created_at,v.store_id,v.domain_status,v.next_billing_date,v.billing_status,v.plan_name,v.payment_method,v.published_at)
       or (v.site_contract_status is distinct from old.site_contract_status and not(old.site_contract_status='demo' and v.site_contract_status='lost'))
       or (old.site_contract_status in('contracted','suspended') and v.sales_status is distinct from old.sales_status) then raise sqlstate 'PT409' using message='Contract state changed';end if;
    update public.demo_sites set store_id=v.store_id,
    store_name=v.store_name,
    store_slug=v.store_slug,
    business_type=v.business_type,
    source_url=v.source_url,
    address=v.address,
    template_id=v.template_id,
    template_type=v.template_type,
    prospect_name=v.prospect_name,
    contact_person_name=v.contact_person_name,
    phone=v.phone,
    email=v.email,
    sales_status=v.sales_status,
    sales_memo=v.sales_memo,
    site_contract_status=v.site_contract_status,
    publish_status=v.publish_status,
    customer_id=v.customer_id,
    contract_start_date=v.contract_start_date,
    minimum_term_end_date=v.minimum_term_end_date,
    monthly_fee=v.monthly_fee,
    domain_status=v.domain_status,
    login_email=v.login_email,
    initial_password=v.initial_password,
    next_billing_date=v.next_billing_date,
    billing_status=v.billing_status,
    plan_name=v.plan_name,
    payment_method=v.payment_method,
    published_at=v.published_at,
    is_newly_created=v.is_newly_created,
    created_at=v.created_at,
    last_updated_at=v.last_updated_at where id=v.id;
  end if;
  if p_content is not null then
    if jsonb_typeof(p_content) is distinct from 'object' or jsonb_typeof(p_photos) is distinct from 'array' then raise sqlstate '22023' using message='Invalid content';end if;
    if exists(select 1 from jsonb_array_elements(p_photos) x where x->>'site_id' is distinct from v.id)then raise sqlstate '42501' using message='Photo owner mismatch';end if;
    insert into public.store_content(site_id,content,updated_at)values(v.id,p_content,clock_timestamp())
      on conflict(site_id)do update set content=excluded.content,updated_at=excluded.updated_at;
    delete from public.photos where site_id=v.id;
    insert into public.photos(id,site_id,slot,url,storage_path,alt,caption,sort_order,menu_item_id)
      select id,site_id,slot,url,storage_path,alt,caption,sort_order,menu_item_id
      from jsonb_populate_recordset(null::public.photos,p_photos);
  else
    -- Advance the same revision for metadata-only saves as well.
    insert into public.store_content(site_id,content,updated_at)values(v.id,'{}'::jsonb,clock_timestamp())
      on conflict(site_id)do update set updated_at=excluded.updated_at;
  end if;
end;$$;
revoke all on function public.save_operator_demo_v1(jsonb,jsonb,jsonb,boolean,timestamptz)from public,anon,authenticated;
grant execute on function public.save_operator_demo_v1(jsonb,jsonb,jsonb,boolean,timestamptz)to service_role;

-- No foreign key to sites/shares/users: deletions must never reset spending quotas.
create table public.demo_delivery_usage(
 id uuid primary key,request_hash text not null,budget_hash text not null,actor_id uuid not null,
 sms_units integer not null check(sms_units between 0 and 10),created_at timestamptz not null default now()
);
create index demo_delivery_usage_created on public.demo_delivery_usage(created_at);
create index demo_delivery_usage_budget_created on public.demo_delivery_usage(budget_hash,created_at);
alter table public.demo_delivery_usage enable row level security;
-- Supabase default privileges may automatically grant ALL to service_role.
-- Clear those grants before allowing append/read only. RLS bypass does not
-- bypass table privileges. The owner/admin can still perform maintenance.
revoke all on public.demo_delivery_usage from public,anon,authenticated,service_role;
grant select,insert on public.demo_delivery_usage to service_role;
create function public.reserve_demo_delivery_v2(p_id uuid,p_actor uuid,p_share text,p_channel text,p_recipient text,p_mode text,p_hash text,p_daily_limit integer,p_budget_hash text,p_sms_units integer,p_sms_limit integer)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare u public.demo_delivery_usage; d public.demo_deliveries; reservation jsonb; day_start timestamptz;
begin
 perform pg_advisory_xact_lock(193427611,1);
 if p_id is null or p_actor is null or p_share is null or p_hash is null or p_budget_hash is null or p_daily_limit is null or p_sms_limit is null or p_sms_units is null or p_channel is null or p_channel not in('sms','email') or p_recipient is null or length(p_recipient)not between 1 and 254 or p_mode is distinct from 'live' or p_daily_limit not between 1 and 10000 or p_sms_limit not between 1 and 10000 or p_sms_units not between 0 and 10 or (p_channel='email' and p_sms_units<>0)or(p_channel='sms' and p_sms_units<1)then raise sqlstate '22023' using message='Invalid budget';end if;
 select * into u from public.demo_delivery_usage where id=p_id;
 if found then
   if u.request_hash<>p_hash or u.actor_id<>p_actor then raise sqlstate 'PT409' using message='Request conflict';end if;
   select * into d from public.demo_deliveries where id=p_id;
   if not found then raise sqlstate 'PT409' using message='Deleted delivery cannot be replayed';end if;
   return jsonb_build_object('claimed',false,'delivery',to_jsonb(d)-'request_hash'-'provider_id'-'actor_id'-'share_id');
 end if;
 if not exists(select 1 from public.demo_shares s join public.demo_sites ds on ds.id=s.demo_site_id where s.id=p_share and s.is_active and(s.expires_at is null or s.expires_at>now())and ds.site_contract_status in('demo','contracted')and ds.publish_status in('draft','published'))then raise sqlstate 'PT409' using message='Site unavailable';end if;
 day_start:=date_trunc('day',now()at time zone'Asia/Tokyo')at time zone'Asia/Tokyo';
 if (select count(*)from public.demo_delivery_usage where created_at>=day_start)>=p_daily_limit
   or (select coalesce(sum(sms_units),0)from public.demo_delivery_usage where created_at>=day_start)+p_sms_units>p_sms_limit
   or exists(select 1 from public.demo_delivery_usage where budget_hash=p_budget_hash and created_at>now()-interval'60 seconds')
   or (select count(*)from public.demo_delivery_usage where actor_id=p_actor and created_at>now()-interval'1 minute')>=10
 then raise sqlstate 'PT429' using message='Delivery budget exceeded';end if;
 reservation:=public.reserve_demo_delivery(p_id,p_actor,p_share,p_channel,p_recipient,p_mode,p_hash,p_daily_limit);
 if (reservation->>'claimed')::boolean then
   insert into public.demo_delivery_usage(id,request_hash,budget_hash,actor_id,sms_units)values(p_id,p_hash,p_budget_hash,p_actor,p_sms_units);
 end if;
 return reservation;
end;$$;
revoke all on function public.reserve_demo_delivery_v2(uuid,uuid,text,text,text,text,text,integer,text,integer,integer)from public,anon,authenticated;
grant execute on function public.reserve_demo_delivery_v2(uuid,uuid,text,text,text,text,text,integer,text,integer,integer)to service_role;

-- Serialize visibility with operator/customer saves (same site -> content lock order).
create function public.set_site_visibility_v1(p_id text,p_action text,p_expected_publish_status text,p_expected_contract_status text,p_expected_updated_at timestamptz)
returns void language plpgsql security invoker set search_path='' as $$
declare site public.demo_sites; body jsonb; revision timestamptz; target text;
begin
 if p_id is null or length(p_id)not between 1 and 200 or p_action is null or p_action not in('suspend','resume')or p_expected_publish_status is null or p_expected_publish_status not in('draft','published','suspended')or p_expected_contract_status is null or p_expected_contract_status not in('demo','contracted')then raise sqlstate '22023' using message='Invalid visibility input';end if;
 select * into site from public.demo_sites where id=p_id for update;
 if not found or site.publish_status is distinct from p_expected_publish_status or site.site_contract_status is distinct from p_expected_contract_status then raise sqlstate 'PT409' using message='Site state changed';end if;
 select content,updated_at into body,revision from public.store_content where site_id=p_id for update;
 target:=case when p_action='suspend'then 'suspended'when site.site_contract_status='demo'then 'draft'else 'published'end;
 -- Stopping is allowed after a concurrent content edit; stopping must remain safe.
 if p_action='resume'and revision is distinct from p_expected_updated_at then raise sqlstate 'PT409' using message='Content changed before resume';end if;
 if target='published'then
  if site.customer_id is null or jsonb_typeof(body->'basicInfo')is distinct from 'object'or jsonb_typeof(body->'photos')is distinct from 'object'or jsonb_typeof(body->'menus')is distinct from 'array'then raise sqlstate '22023' using message='Incomplete publication';end if;
  if btrim(coalesce(body#>>'{basicInfo,address}',''))=''or btrim(coalesce(body#>>'{basicInfo,phone}',''))=''or(btrim(coalesce(body#>>'{basicInfo,businessHours}',''))=''and btrim(coalesce(body#>>'{basicInfo,weekdayHours}',''))='')or btrim(coalesce(body#>>'{photos,hero}',''))=''or not exists(select 1 from jsonb_array_elements(body->'menus')m where m->'visible'='true'::jsonb and btrim(coalesce(m->>'name',''))<>'')then raise sqlstate '22023' using message='Incomplete publication';end if;
 end if;
 update public.demo_sites set publish_status=target,last_updated_at=(clock_timestamp()at time zone'Asia/Tokyo')::date where id=p_id;
 insert into public.store_content(site_id,content,updated_at)values(p_id,coalesce(body,'{}'::jsonb),clock_timestamp())on conflict(site_id)do update set updated_at=excluded.updated_at;
end;$$;
revoke all on function public.set_site_visibility_v1(text,text,text,text,timestamptz)from public,anon,authenticated;
grant execute on function public.set_site_visibility_v1(text,text,text,text,timestamptz)to service_role;


-- The original contract saga stays intact; guard its final publication under row locks.
create function public.complete_site_contract_v2(p_operation_id uuid,p_operator_id uuid,p_customer jsonb,p_contract jsonb,p_expected_updated_at timestamptz)
returns void language plpgsql security invoker set search_path='' as $$
declare op public.contract_operations; site public.demo_sites; body jsonb; revision timestamptz;
begin
 select * into op from public.contract_operations where id=p_operation_id for update;
 if not found or op.operator_id is distinct from p_operator_id then raise sqlstate '42501' using message='Not allowed';end if;
 if op.state='complete'then return;end if;
 select * into site from public.demo_sites where id=op.site_id for update;
 if not found or site.site_contract_status<>'demo'or site.customer_id is not null or site.publish_status not in('draft','published')then raise sqlstate 'PT409' using message='Site state changed';end if;
 select content,updated_at into body,revision from public.store_content where site_id=site.id for update;
 if revision is distinct from p_expected_updated_at then raise sqlstate 'PT409' using message='Content changed during contract';end if;
 if jsonb_typeof(body->'basicInfo')is distinct from 'object'or jsonb_typeof(body->'photos')is distinct from 'object'or jsonb_typeof(body->'menus')is distinct from 'array'then raise sqlstate '22023' using message='Incomplete publication';end if;
 if btrim(coalesce(body#>>'{basicInfo,address}',''))=''or btrim(coalesce(body#>>'{basicInfo,phone}',''))=''or(btrim(coalesce(body#>>'{basicInfo,businessHours}',''))=''and btrim(coalesce(body#>>'{basicInfo,weekdayHours}',''))='')or btrim(coalesce(body#>>'{photos,hero}',''))=''or not exists(select 1 from jsonb_array_elements(body->'menus')m where m->'visible'='true'::jsonb and btrim(coalesce(m->>'name',''))<>'')then raise sqlstate '22023' using message='Incomplete publication';end if;
 perform public.complete_site_contract(p_operation_id,p_operator_id,p_customer,p_contract);
 update public.store_content set updated_at=clock_timestamp()where site_id=site.id;
end;$$;
revoke all on function public.complete_site_contract_v2(uuid,uuid,jsonb,jsonb,timestamptz)from public,anon,authenticated;
grant execute on function public.complete_site_contract_v2(uuid,uuid,jsonb,jsonb,timestamptz)to service_role;

commit;
