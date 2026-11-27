-- Local development proposal; requires commerce-v2.sql. No production execution.
BEGIN;
CREATE TABLE public.commerce_offers(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),site_id text NOT NULL REFERENCES public.demo_sites(id),share_id text NOT NULL UNIQUE REFERENCES public.demo_shares(id),issued_by uuid NOT NULL,claimed_at timestamptz,recipient_hash text NOT NULL CHECK(recipient_hash~'^[0-9a-f]{64}$'),expires_at timestamptz NOT NULL,claimed_by uuid,created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX commerce_offers_site ON public.commerce_offers(site_id);
ALTER TABLE public.commerce_offers ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.commerce_offers FROM PUBLIC,anon,authenticated,service_role;
GRANT SELECT,INSERT,UPDATE ON public.commerce_offers TO service_role;
CREATE FUNCTION public.commerce_offer_issue_v3(p_admin boolean,p_site text,p_share text,p_recipient text,p_issuer uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE sh public.demo_shares; old public.commerce_offers; expiry timestamptz;
BEGIN
 IF p_admin IS DISTINCT FROM true OR p_issuer IS NULL OR p_recipient!~'^[0-9a-f]{64}$' THEN RAISE SQLSTATE '42501';END IF;
 PERFORM 1 FROM public.demo_sites WHERE id=p_site AND customer_id IS NULL AND site_contract_status='demo' FOR UPDATE;
 IF NOT FOUND THEN RAISE SQLSTATE 'PT409';END IF;
 SELECT * INTO sh FROM public.demo_shares WHERE id=p_share AND demo_site_id=p_site AND is_active;
 expiry:=least(coalesce(sh.expires_at,sh.created_at+interval '7 days'),sh.created_at+interval '7 days');
 IF sh.id IS NULL OR expiry<=clock_timestamp() THEN RAISE SQLSTATE 'PT409';END IF;
 SELECT * INTO old FROM public.commerce_offers WHERE share_id=p_share;
 IF FOUND THEN IF old.recipient_hash<>p_recipient THEN RAISE SQLSTATE 'PT409';END IF;RETURN jsonb_build_object('ready',true,'expiresAt',old.expires_at);END IF;
 INSERT INTO public.commerce_offers(site_id,share_id,recipient_hash,expires_at,issued_by) VALUES(p_site,p_share,p_recipient,expiry,p_issuer);
 RETURN jsonb_build_object('ready',true,'expiresAt',expiry);
END;$$;
CREATE FUNCTION public.commerce_offer_claim_v3(p_actor uuid,p_email_hash text,p_share_hash text,p_template jsonb) RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE offer public.commerce_offers; sh public.demo_shares; site public.demo_sites; owner uuid; doc jsonb;
BEGIN
 IF p_actor IS NULL OR p_email_hash!~'^[0-9a-f]{64}$' OR p_share_hash!~'^[0-9a-f]{64}$' OR jsonb_array_length(p_template->'contracts') IS DISTINCT FROM 0 OR p_template->'card' IS DISTINCT FROM 'null'::jsonb THEN RAISE SQLSTATE '42501';END IF;
 SELECT * INTO sh FROM public.demo_shares WHERE encode(sha256(convert_to(share_token,'UTF8')),'hex')=p_share_hash;
 SELECT * INTO offer FROM public.commerce_offers WHERE share_id=sh.id FOR UPDATE;
 IF offer.id IS NULL OR offer.recipient_hash IS DISTINCT FROM p_email_hash OR offer.expires_at<=clock_timestamp() OR NOT sh.is_active OR least(coalesce(sh.expires_at,sh.created_at+interval '7 days'),sh.created_at+interval '7 days')<=clock_timestamp() THEN RAISE SQLSTATE '42501';END IF;
 SELECT * INTO site FROM public.demo_sites WHERE id=offer.site_id FOR UPDATE;
 SELECT user_id INTO owner FROM public.commerce_access WHERE site_id=site.id AND role='owner';
 IF owner IS NOT NULL AND owner<>p_actor THEN RAISE SQLSTATE '42501';END IF;
 IF offer.claimed_by IS NOT NULL AND offer.claimed_by<>p_actor THEN RAISE SQLSTATE '42501';END IF;
 IF site.customer_id IS NOT NULL OR site.site_contract_status<>'demo' THEN
  IF offer.claimed_by=p_actor AND owner=p_actor THEN RETURN jsonb_build_object('siteId',site.id,'replayed',true);END IF;
  RAISE SQLSTATE 'PT409';
 END IF;
 IF owner IS NULL THEN
  doc:=jsonb_set(jsonb_set(p_template,'{siteId}',to_jsonb(site.id)),'{title}',to_jsonb(site.store_name));
  INSERT INTO public.commerce_sites(site_id,document) VALUES(site.id,doc);
  INSERT INTO public.commerce_access VALUES(site.id,p_actor,'owner');
 END IF;
 UPDATE public.commerce_offers SET claimed_by=p_actor,claimed_at=coalesce(claimed_at,clock_timestamp()) WHERE id=offer.id;
 RETURN jsonb_build_object('siteId',site.id,'replayed',owner=p_actor);
END;$$;
CREATE FUNCTION public.commerce_guard_first_contract_v3() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE offer public.commerce_offers; sh public.demo_shares; owner uuid;
BEGIN
 IF jsonb_array_length(OLD.document->'contracts')=0 AND jsonb_array_length(NEW.document->'contracts')>0 THEN
  SELECT * INTO offer FROM public.commerce_offers WHERE site_id=NEW.site_id AND claimed_by IS NOT NULL ORDER BY created_at DESC LIMIT 1;
  IF FOUND THEN
   SELECT * INTO sh FROM public.demo_shares WHERE id=offer.share_id;
   SELECT user_id INTO owner FROM public.commerce_access WHERE site_id=NEW.site_id AND role='owner';
   IF owner IS DISTINCT FROM offer.claimed_by OR NOT sh.is_active OR offer.expires_at<=clock_timestamp() OR least(coalesce(sh.expires_at,sh.created_at+interval '7 days'),sh.created_at+interval '7 days')<=clock_timestamp() THEN RAISE SQLSTATE 'PT409';END IF;
  END IF;
 END IF;
 RETURN NEW;
END;$$;
CREATE TRIGGER commerce_guard_first_contract_v3 BEFORE UPDATE OF document ON public.commerce_sites FOR EACH ROW EXECUTE FUNCTION public.commerce_guard_first_contract_v3();
REVOKE ALL ON FUNCTION public.commerce_offer_issue_v3(boolean,text,text,text,uuid),public.commerce_offer_claim_v3(uuid,text,text,jsonb),public.commerce_guard_first_contract_v3() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.commerce_offer_issue_v3(boolean,text,text,text,uuid),public.commerce_offer_claim_v3(uuid,text,text,jsonb),public.commerce_guard_first_contract_v3() TO service_role;
COMMIT;
