BEGIN;
CREATE TABLE IF NOT EXISTS public.contract_operations (
  id UUID PRIMARY KEY,
  site_id TEXT NOT NULL REFERENCES public.demo_sites(id) ON DELETE RESTRICT,
  operator_id UUID NOT NULL,
  state TEXT NOT NULL CHECK(state IN ('preparing','auth_created','complete','failed','needs_review')),
  auth_user_id UUID,
  request_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.contract_operations ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX IF NOT EXISTS contract_operations_one_active
 ON public.contract_operations(site_id) WHERE state IN ('preparing','auth_created','needs_review');
REVOKE ALL ON public.contract_operations FROM anon,authenticated;
GRANT ALL ON public.contract_operations TO service_role;

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
 IF NOT FOUND OR ds.site_contract_status<>'demo' OR ds.customer_id IS NOT NULL THEN RAISE EXCEPTION 'Site state changed' USING ERRCODE='40001'; END IF;
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
COMMIT;
