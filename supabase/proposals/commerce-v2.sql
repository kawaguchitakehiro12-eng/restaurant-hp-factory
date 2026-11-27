-- Development proposal. Local synthetic DB only. Requires SQL001..007.
-- No existing contract/migration is rewritten. No payment/domain provider is enabled.
BEGIN;
CREATE TABLE public.commerce_access(site_id text NOT NULL REFERENCES public.demo_sites(id),user_id uuid NOT NULL,role text NOT NULL CHECK(role IN('owner','agent')),PRIMARY KEY(site_id,user_id));
CREATE UNIQUE INDEX commerce_one_owner ON public.commerce_access(site_id) WHERE role='owner';
CREATE TABLE public.commerce_sites(site_id text PRIMARY KEY REFERENCES public.demo_sites(id),revision integer NOT NULL DEFAULT 1,document jsonb NOT NULL CHECK(jsonb_typeof(document)='object'));
CREATE TABLE public.commerce_requests(id uuid PRIMARY KEY,site_id text NOT NULL REFERENCES public.commerce_sites(site_id),actor_id uuid NOT NULL,hash text NOT NULL CHECK(length(hash)=64),action text NOT NULL,created_at timestamptz NOT NULL DEFAULT now());
ALTER TABLE public.commerce_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commerce_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commerce_requests ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.commerce_access,public.commerce_sites,public.commerce_requests FROM PUBLIC,anon,authenticated,service_role;
GRANT SELECT,INSERT,UPDATE ON public.commerce_access,public.commerce_sites TO service_role;
GRANT SELECT,INSERT ON public.commerce_requests TO service_role;
-- Direct browser reads/writes are denied. Server-only RPCs enforce site/agent ownership.
CREATE FUNCTION public.commerce_create_v2(p_admin boolean,p_site text,p_owner uuid,p_document jsonb) RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
BEGIN
 IF p_admin IS DISTINCT FROM true OR p_owner IS NULL OR p_document->>'siteId' IS DISTINCT FROM p_site OR jsonb_array_length(p_document->'contracts')<>0 THEN RAISE SQLSTATE '42501';END IF;
 PERFORM 1 FROM public.demo_sites WHERE id=p_site AND site_contract_status='demo' AND customer_id IS NULL FOR UPDATE;
 IF NOT FOUND THEN RAISE SQLSTATE 'PT409';END IF;
 INSERT INTO public.commerce_sites(site_id,document) VALUES(p_site,p_document);
 INSERT INTO public.commerce_access VALUES(p_site,p_owner,'owner');
END;$$;
CREATE FUNCTION public.commerce_read_v2(p_actor uuid,p_admin boolean,p_site text,p_request uuid,p_hash text) RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE access_role text; doc public.commerce_sites; req public.commerce_requests;
BEGIN
 IF p_admin IS TRUE THEN access_role:='operator';ELSE SELECT role INTO access_role FROM public.commerce_access WHERE user_id=p_actor AND site_id=p_site;END IF;
 IF access_role IS NULL THEN RAISE SQLSTATE '42501';END IF;
 SELECT * INTO doc FROM public.commerce_sites WHERE site_id=p_site;
 IF NOT FOUND THEN RAISE SQLSTATE 'PT409';END IF;
 SELECT * INTO req FROM public.commerce_requests WHERE id=p_request;
 IF FOUND AND (req.actor_id IS DISTINCT FROM p_actor OR req.site_id IS DISTINCT FROM p_site OR req.hash IS DISTINCT FROM p_hash) THEN RAISE SQLSTATE 'PT409';END IF;
 RETURN jsonb_build_object('state',doc.document,'revision',doc.revision,'role',access_role,'replayed',req.id IS NOT NULL);
END;$$;
CREATE FUNCTION public.commerce_list_v2(p_actor uuid,p_admin boolean) RETURNS jsonb LANGUAGE sql SECURITY INVOKER SET search_path='' AS $$
 SELECT coalesce(jsonb_agg(jsonb_build_object('siteId',s.site_id,'title',s.document->>'title','role',CASE WHEN p_admin IS TRUE THEN 'operator' ELSE a.role END) ORDER BY s.site_id),'[]') FROM public.commerce_sites s LEFT JOIN public.commerce_access a ON a.site_id=s.site_id AND a.user_id=p_actor WHERE p_admin IS TRUE OR a.user_id IS NOT NULL;
$$;
CREATE FUNCTION public.commerce_commit_v2(p_actor uuid,p_admin boolean,p_site text,p_revision integer,p_document jsonb,p_request uuid,p_hash text,p_action text,p_email text) RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
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
CREATE FUNCTION public.commerce_assign_v2(p_admin boolean,p_site text,p_agent uuid) RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
BEGIN
 IF p_admin IS DISTINCT FROM true OR p_agent IS NULL THEN RAISE SQLSTATE '42501';END IF;
 INSERT INTO public.commerce_access VALUES(p_site,p_agent,'agent') ON CONFLICT(site_id,user_id) DO UPDATE SET role='agent' WHERE commerce_access.role='agent';
 IF NOT FOUND THEN RAISE SQLSTATE 'PT409';END IF;
END;$$;
REVOKE ALL ON FUNCTION public.commerce_create_v2(boolean,text,uuid,jsonb),public.commerce_read_v2(uuid,boolean,text,uuid,text),public.commerce_list_v2(uuid,boolean),public.commerce_commit_v2(uuid,boolean,text,integer,jsonb,uuid,text,text,text),public.commerce_assign_v2(boolean,text,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.commerce_create_v2(boolean,text,uuid,jsonb),public.commerce_read_v2(uuid,boolean,text,uuid,text),public.commerce_list_v2(uuid,boolean),public.commerce_commit_v2(uuid,boolean,text,integer,jsonb,uuid,text,text,text),public.commerce_assign_v2(boolean,text,uuid) TO service_role;
COMMIT;
