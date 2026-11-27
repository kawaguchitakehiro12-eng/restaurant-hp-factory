-- Apply to a staging database first. No existing customer/site rows are modified.
BEGIN;

ALTER FUNCTION public.is_demo_site_publicly_visible(TEXT,TEXT) SET search_path = '';

-- Public pages use the whitelisted server API, not unrestricted table SELECT.
DROP POLICY IF EXISTS "public_read_visible_demo_sites" ON public.demo_sites;
DROP POLICY IF EXISTS "public_read_visible_store_content" ON public.store_content;
DROP POLICY IF EXISTS "public_read_visible_photos" ON public.photos;
REVOKE ALL ON public.demo_sites, public.store_content, public.photos, public.customers, public.demo_shares FROM anon, authenticated;

-- Customer writes go through a validated, atomic server endpoint.
DROP POLICY IF EXISTS "customers_update_own_store_content" ON public.store_content;
DROP POLICY IF EXISTS "customers_update_own_photos" ON public.photos;
DROP POLICY IF EXISTS "authenticated_upload_site_photos" ON storage.objects;
-- Uploads in the portal use bounded image data; an unrelated signed-in user must
-- not gain write access to all folders of the shared storage bucket.

CREATE UNIQUE INDEX IF NOT EXISTS customers_auth_user_unique
  ON public.customers(auth_user_id) WHERE auth_user_id IS NOT NULL;

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
    RAISE EXCEPTION 'Concurrent update' USING ERRCODE = '40001';
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
COMMIT;
