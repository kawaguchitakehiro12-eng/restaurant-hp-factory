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
    AND ds.site_contract_status = 'contracted' AND ds.publish_status <> 'suspended'
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

CREATE OR REPLACE FUNCTION public.complete_site_contract(
 p_operation_id UUID,p_operator_id UUID,p_customer JSONB,p_contract JSONB
) RETURNS VOID LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE op public.contract_operations; ds public.demo_sites;
BEGIN
 SELECT * INTO op FROM public.contract_operations WHERE id=p_operation_id FOR UPDATE;
 IF NOT FOUND OR op.operator_id<>p_operator_id THEN RAISE EXCEPTION 'Not allowed' USING ERRCODE='42501'; END IF;
 IF op.state='complete' THEN RETURN; END IF;
 IF op.state<>'auth_created' OR op.auth_user_id IS NULL THEN RAISE EXCEPTION 'Operation not ready' USING ERRCODE='22023'; END IF;
 SELECT * INTO ds FROM public.demo_sites WHERE id=op.site_id FOR UPDATE;
 IF NOT FOUND OR ds.site_contract_status<>'demo' OR ds.customer_id IS NOT NULL THEN RAISE EXCEPTION 'Site state changed' USING ERRCODE='PT409'; END IF;
 INSERT INTO public.customers(id,name,contact_email,contact_phone,contact_person_name,auth_user_id,created_at)
 VALUES(p_customer->>'id',p_customer->>'name',p_customer->>'contactEmail',coalesce(p_customer->>'contactPhone',''),p_customer->>'contactPersonName',op.auth_user_id,(now() AT TIME ZONE 'Asia/Tokyo')::date);
 UPDATE public.demo_sites SET
  customer_id=p_customer->>'id',store_slug=p_contract->>'storeSlug',
  site_contract_status='contracted',sales_status='contracted',publish_status='published',
  contract_start_date=(p_contract->>'contractStartDate')::date,
  minimum_term_end_date=(p_contract->>'minimumTermEndDate')::date,
  monthly_fee=(p_contract->>'monthlyFee')::integer,domain_status=p_contract->>'domainStatus',
  login_email=p_customer->>'contactEmail',initial_password=NULL,
  next_billing_date=(p_contract->>'nextBillingDate')::date,billing_status='pending',
  plan_name='スタンダード',payment_method='invoice',
  published_at=(now() AT TIME ZONE 'Asia/Tokyo')::date,
  last_updated_at=(now() AT TIME ZONE 'Asia/Tokyo')::date,is_newly_created=FALSE
 WHERE id=ds.id;
 UPDATE public.contract_operations SET state='complete' WHERE id=op.id;
END;
$$;
REVOKE ALL ON FUNCTION public.complete_site_contract(UUID,UUID,JSONB,JSONB) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.complete_site_contract(UUID,UUID,JSONB,JSONB) TO service_role;

NOTIFY pgrst, 'reload schema';
