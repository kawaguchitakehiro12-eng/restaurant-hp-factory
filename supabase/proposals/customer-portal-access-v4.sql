-- Development proposal only. Not applied. Preserve ownership, contracted check, locks and conflict handling.
BEGIN;
-- Business conflicts must not use SQLSTATE 40001: PostgREST retries it.

CREATE OR REPLACE FUNCTION public.save_customer_site_content(
  p_user_id UUID,
  p_slug TEXT,
  p_content JSONB,
  p_expected_updated_at TIMESTAMPTZ
) RETURNS TIMESTAMPTZ
LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE
  v_site_id TEXT;
  v_current TIMESTAMPTZ;
  v_old JSONB;
  v_content JSONB;
  v_now TIMESTAMPTZ := clock_timestamp();
BEGIN
  -- Executable only by service_role. The server passes the verified Auth user ID.
  SELECT ds.id INTO v_site_id
  FROM public.demo_sites ds JOIN public.customers c ON c.id = ds.customer_id
  WHERE ds.store_slug = p_slug AND c.auth_user_id = p_user_id
    AND ds.site_contract_status = 'contracted'
    AND NOT EXISTS(SELECT 1 FROM public.commerce_sites cs WHERE cs.site_id=ds.id AND (coalesce((cs.document #>> '{contracts,-1,finished}')::boolean,false) OR clock_timestamp() >= (((cs.document #>> '{contracts,-1,endOn}')::date + interval '1 day 1 hour') AT TIME ZONE 'Asia/Tokyo')))
  FOR UPDATE OF ds;
  IF v_site_id IS NULL THEN RAISE EXCEPTION 'Not found' USING ERRCODE = '42501'; END IF;
  IF jsonb_typeof(p_content) IS DISTINCT FROM 'object'
    OR jsonb_typeof(p_content->'basicInfo') IS DISTINCT FROM 'object'
    OR jsonb_typeof(p_content->'photos') IS DISTINCT FROM 'object'
    OR jsonb_typeof(p_content->'menus') IS DISTINCT FROM 'array'
    OR jsonb_typeof(p_content->'topics') IS DISTINCT FROM 'array'
    OR (p_content - ARRAY['basicInfo','photos','menus','topics']) <> '{}'::jsonb
  THEN RAISE EXCEPTION 'Invalid content' USING ERRCODE = '22023'; END IF;

  SELECT updated_at, content INTO v_current, v_old FROM public.store_content
    WHERE site_id = v_site_id FOR UPDATE;
  IF v_current IS DISTINCT FROM p_expected_updated_at THEN
    RAISE EXCEPTION 'Concurrent update' USING ERRCODE = 'PT409';
  END IF;
  -- Keep internal photo provenance, which the customer API intentionally omits.
  v_content := coalesce(v_old, '{}'::jsonb) || p_content;
  INSERT INTO public.store_content(site_id,content,updated_at)
    VALUES(v_site_id,v_content,v_now)
    ON CONFLICT(site_id) DO UPDATE SET content=EXCLUDED.content,updated_at=EXCLUDED.updated_at;
  UPDATE public.demo_sites SET last_updated_at = (v_now AT TIME ZONE 'Asia/Tokyo')::date WHERE id=v_site_id;

  DELETE FROM public.photos WHERE site_id=v_site_id;
  INSERT INTO public.photos(id,site_id,slot,url,storage_path,alt,caption,sort_order,menu_item_id)
  SELECT v_site_id||'-'||s.slot,v_site_id,s.slot,p_content->'photos'->>s.slot,NULL,'','',0,NULL
    FROM unnest(ARRAY['hero','interior','food','exterior']) AS s(slot)
    WHERE coalesce(p_content->'photos'->>s.slot,'')<>'';
  INSERT INTO public.photos(id,site_id,slot,url,storage_path,alt,caption,sort_order,menu_item_id)
  SELECT v_site_id||'-gallery-'||md5(g->>'id'),v_site_id,'gallery',g->>'url',NULL,
    coalesce(g->>'alt',''),coalesce(g->>'caption',''),(g->>'sortOrder')::integer,NULL
    FROM jsonb_array_elements(p_content->'photos'->'gallery') g WHERE coalesce(g->>'url','')<>'';
  INSERT INTO public.photos(id,site_id,slot,url,storage_path,alt,caption,sort_order,menu_item_id)
  SELECT v_site_id||'-menu-'||md5(m->>'id'),v_site_id,'menu',m->>'imageUrl',NULL,
    m->>'name',coalesce(m->>'description',''),(m->>'sortOrder')::integer,m->>'id'
    FROM jsonb_array_elements(p_content->'menus') m WHERE coalesce(m->>'imageUrl','')<>'';
  RETURN v_now;
END;
$$;
REVOKE ALL ON FUNCTION public.save_customer_site_content(UUID,TEXT,JSONB,TIMESTAMPTZ) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.save_customer_site_content(UUID,TEXT,JSONB,TIMESTAMPTZ) TO service_role;


CREATE OR REPLACE FUNCTION public.commerce_commit_v2(p_actor uuid,p_admin boolean,p_site text,p_revision integer,p_document jsonb,p_request uuid,p_hash text,p_action text,p_email text) RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE previous public.commerce_sites; access_role text; req public.commerce_requests; c jsonb; cust text; today date:=(clock_timestamp() AT TIME ZONE 'Asia/Tokyo')::date;
BEGIN
 IF p_actor IS NULL OR p_request IS NULL OR length(p_hash)<>64 OR octet_length(p_document::text)>2000000 OR p_document->>'siteId' IS DISTINCT FROM p_site THEN RAISE SQLSTATE '22023';END IF;
 IF p_admin IS TRUE THEN access_role:='operator';ELSE SELECT role INTO access_role FROM public.commerce_access WHERE user_id=p_actor AND site_id=p_site;END IF;
 IF access_role IS NULL THEN RAISE SQLSTATE '42501';END IF;
 SELECT * INTO previous FROM public.commerce_sites WHERE site_id=p_site FOR UPDATE;
 IF NOT FOUND THEN RAISE SQLSTATE 'PT409';END IF;
 SELECT * INTO req FROM public.commerce_requests WHERE id=p_request;
 IF FOUND THEN
  IF req.actor_id IS DISTINCT FROM p_actor OR req.hash IS DISTINCT FROM p_hash OR req.site_id IS DISTINCT FROM p_site THEN RAISE SQLSTATE 'PT409';END IF;
  RETURN jsonb_build_object('state',previous.document,'revision',previous.revision,'role',access_role,'replayed',true);
 END IF;
 IF previous.revision IS DISTINCT FROM p_revision THEN RAISE SQLSTATE 'PT409';END IF;
 IF access_role='agent' AND (p_action<>'call' OR (previous.document-'calls'-'audit') IS DISTINCT FROM (p_document-'calls'-'audit')) THEN RAISE SQLSTATE '42501';END IF;
 IF access_role='owner' AND p_action NOT IN('application','card-result','apply','cancel','withdraw','reminder','domain-request','publish','inquiry') THEN RAISE SQLSTATE '42501';END IF;
 IF p_action='card-result' AND (coalesce((previous.document #>> '{contracts,-1,finished}')::boolean,false) OR clock_timestamp() >= (((previous.document #>> '{contracts,-1,endOn}')::date + interval '1 day 1 hour') AT TIME ZONE 'Asia/Tokyo')) AND NOT EXISTS(SELECT 1 FROM jsonb_array_elements(previous.document->'invoices') i WHERE i->>'status'<>'paid' AND (i->'price'->>'gross')::integer>0) THEN RAISE SQLSTATE '42501'; END IF;
 c:=(p_document->'contracts')->-1;
 IF p_action='apply' THEN
  IF access_role<>'owner' OR p_document->'card'->'valid' IS DISTINCT FROM 'true'::jsonb OR c->>'startOn' IS DISTINCT FROM today::text OR p_email IS NULL OR p_email='' THEN RAISE SQLSTATE '42501';END IF;
  SELECT id INTO cust FROM public.customers WHERE auth_user_id=p_actor;
  IF cust IS NULL THEN
   cust:='customer-'||gen_random_uuid()::text;
   INSERT INTO public.customers(id,name,contact_email,contact_phone,contact_person_name,auth_user_id) VALUES(cust,p_document->'application'->>'name',p_email,p_document->'application'->>'phone',p_document->'application'->>'contact',p_actor);
  END IF;
  UPDATE public.demo_sites SET customer_id=cust,site_contract_status='contracted',sales_status='contracted',contract_start_date=(c->>'startOn')::date,minimum_term_end_date=(date_trunc('month',(c->>'startOn')::date)+interval '6 months -1 day')::date,monthly_fee=(c->'price'->>'gross')::integer,payment_method='credit_card',domain_status='planned',publish_status='draft',last_updated_at=today WHERE id=p_site;
 END IF;
 IF c IS NOT NULL THEN
  UPDATE public.demo_sites SET publish_status=CASE WHEN p_document->'operatorStopped'='true'::jsonb OR c->'finished'='true'::jsonb THEN 'suspended' WHEN p_document->'published'='true'::jsonb THEN 'published' ELSE 'draft' END,site_contract_status=CASE WHEN c->'finished'='true'::jsonb THEN 'suspended' ELSE 'contracted' END,last_updated_at=today WHERE id=p_site;
 END IF;
 UPDATE public.commerce_sites SET document=p_document,revision=revision+1 WHERE site_id=p_site;
 INSERT INTO public.commerce_requests(id,site_id,actor_id,hash,action) VALUES(p_request,p_site,p_actor,p_hash,p_action);
 RETURN jsonb_build_object('state',p_document,'revision',previous.revision+1,'role',access_role,'replayed',false);
END;$$;

COMMIT;
