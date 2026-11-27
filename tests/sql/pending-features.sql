-- Only through scripts/test-local-db.cjs against a marked synthetic lab.
-- This file has NOT been executed in PostgreSQL in the current environment.
begin;
do $$
declare
 site_id text:='fixture-sql-'||replace(gen_random_uuid()::text,'-','');
 actor uuid:=gen_random_uuid(); request_id uuid:=gen_random_uuid(); share_id text;
 row_data jsonb; content jsonb; pictures jsonb; revision timestamptz; next_revision timestamptz;
 result jsonb; original_name text; bad jsonb;
begin
 if (select value from sakupage_fixture_guard.identity where key='purpose') is distinct from 'synthetic-only-local-lab' then raise exception 'Not a synthetic lab';end if;
 if exists(select 1 from public.demo_delivery_usage)then raise exception 'Usage table must be empty in this dedicated fixture lab';end if;
 if has_function_privilege('anon','public.save_operator_demo_v1(jsonb,jsonb,jsonb,boolean,timestamptz)','execute')or has_function_privilege('authenticated','public.reserve_demo_delivery_v2(uuid,uuid,text,text,text,text,text,integer,text,integer,integer)','execute')then raise exception 'RPC permission leak';end if;
 if has_table_privilege('service_role','public.demo_delivery_usage','UPDATE')or has_table_privilege('service_role','public.demo_delivery_usage','DELETE')or has_table_privilege('service_role','public.demo_delivery_usage','TRUNCATE')then raise exception 'Ledger is mutable by service_role';end if;
 if not has_table_privilege('service_role','public.demo_delivery_usage','SELECT')or not has_table_privilege('service_role','public.demo_delivery_usage','INSERT')then raise exception 'Ledger read/append permissions missing';end if;
 insert into auth.users(id,aud,role,email,raw_app_meta_data,raw_user_meta_data,created_at,updated_at)values(actor,'authenticated','authenticated',site_id||'@example.invalid','{"role":"operator"}','{}',now(),now());
 row_data:=jsonb_build_object('id',site_id,'store_id',site_id,'store_name','SYNTHETIC ORIGINAL','store_slug',site_id,'business_type','cafe','source_url','','template_id','cafe','template_type','cafe','prospect_name','SYNTHETIC','contact_person_name','','phone','','email','','sales_status','not_approached','sales_memo','','site_contract_status','demo','publish_status','draft','is_newly_created',true,'created_at',current_date,'last_updated_at',current_date);
 content:='{"basicInfo":{"address":"SYNTHETIC"},"photos":{"hero":"/fixture.svg","gallery":[]},"menus":[],"topics":[]}'::jsonb;
 pictures:=jsonb_build_array(jsonb_build_object('id',site_id||'-hero','site_id',site_id,'slot','hero','url','/fixture.svg','alt','','caption','','sort_order',0));
 perform public.save_operator_demo_v1(row_data,content,pictures,true,null);
 select sc.updated_at into revision from public.store_content sc where sc.site_id=row_data->>'id';
 if revision is null then raise exception 'Initial revision missing';end if;
 row_data:=jsonb_set(row_data,'{store_name}','"SYNTHETIC UPDATED"');
 perform public.save_operator_demo_v1(row_data,content,pictures,false,revision);
 select sc.updated_at into next_revision from public.store_content sc where sc.site_id=row_data->>'id';
 begin perform public.save_operator_demo_v1(row_data,content,pictures,false,revision);raise exception 'Stale save accepted';exception when sqlstate 'PT409' then null;end;
 original_name:='SYNTHETIC UPDATED';
 bad:=jsonb_set(pictures,'{0,slot}','"INVALID_SLOT"');
 begin perform public.save_operator_demo_v1(jsonb_set(row_data,'{store_name}','"MUST ROLLBACK"'),content,bad,false,next_revision);raise exception 'Bad photo accepted';exception when check_violation then null;end;
 if (select ds.store_name from public.demo_sites ds where ds.id=row_data->>'id')<>original_name or (select sc.updated_at from public.store_content sc where sc.site_id=row_data->>'id')is distinct from next_revision then raise exception 'Partial save leaked';end if;
 begin perform public.save_operator_demo_v1(jsonb_set(row_data,'{id}','"missing-fixture"'),content,pictures,false,null);raise exception 'Missing ID accepted';exception when sqlstate 'PT409' then null;end;
 begin perform public.save_operator_demo_v1(row_data,content,null,false,next_revision);raise exception 'Null photo array accepted';exception when sqlstate '22023' then null;end;
 begin perform public.save_operator_demo_v1(jsonb_set(row_data,'{sales_memo}',to_jsonb(repeat('x',100001))),content,pictures,false,next_revision);raise exception 'Oversized input accepted';exception when sqlstate '22023' then null;end;
 share_id:=site_id||'-share';
 insert into public.demo_shares(id,demo_site_id,share_token,is_active,expires_at)values(share_id,row_data->>'id',site_id||'-token',true,now()+interval'1 day');
 result:=public.reserve_demo_delivery_v2(request_id,actor,share_id,'sms','+819000000000','live',repeat('a',64),1,repeat('b',64),2,2);
 if (result->>'claimed')::boolean is not true then raise exception 'First reservation failed';end if;
 result:=public.reserve_demo_delivery_v2(request_id,actor,share_id,'sms','+819000000000','live',repeat('a',64),1,repeat('b',64),2,2);
 if (result->>'claimed')::boolean is not false then raise exception 'Duplicate reservation claimed twice';end if;
 begin perform public.reserve_demo_delivery_v2(gen_random_uuid(),actor,share_id,'sms','+819000000000','live',repeat('c',64),1,repeat('d',64),1,2);raise exception 'Quota exceeded';exception when sqlstate 'PT429' then null;end;
 delete from public.demo_shares where id=share_id;
 if not exists(select 1 from public.demo_delivery_usage where id=request_id)then raise exception 'Deleting share erased spending ledger';end if;
 begin perform public.reserve_demo_delivery_v2(request_id,actor,share_id,'sms','+819000000000','live',repeat('a',64),1,repeat('b',64),2,2);raise exception 'Deleted delivery replay accepted';exception when sqlstate 'PT409' then null;end;
end;
$$;
rollback;
