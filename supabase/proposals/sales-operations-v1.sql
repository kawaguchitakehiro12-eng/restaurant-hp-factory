-- Development proposal only. Requires SQL001..007. No automatic deployment.
-- No price, payment provider, due-day policy, legal text or retention is supplied.
BEGIN;
CREATE TABLE public.sales_contracts(
 site_id text PRIMARY KEY REFERENCES public.demo_sites(id),start_on date NOT NULL,
 monthly_yen integer NOT NULL CHECK(monthly_yen BETWEEN 0 AND 1000000),
 terms_version text NOT NULL CHECK(length(terms_version) BETWEEN 1 AND 100),terms_text text NOT NULL CHECK(length(terms_text) BETWEEN 1 AND 10000),
 accepted_at timestamptz,accepted_by uuid,ended_on date,ended_at timestamptz,
 reminder_on date,reminder_queued_at timestamptz,revision integer NOT NULL DEFAULT 1,
 CHECK(ended_on IS NULL OR ended_on >= (date_trunc('month',start_on)+interval '6 months')::date)
);
CREATE TABLE public.sales_invoices(
 id uuid PRIMARY KEY,site_id text NOT NULL REFERENCES public.sales_contracts(site_id),period date NOT NULL,
 amount_yen integer NOT NULL CHECK(amount_yen BETWEEN 0 AND 1000000),due_on date NOT NULL,
 issued_on date NOT NULL,paid_on date,voided_on date,collection_note text NOT NULL DEFAULT '',revision integer NOT NULL DEFAULT 1,
 UNIQUE(site_id,period),CHECK(period=date_trunc('month',period)::date),CHECK(paid_on IS NULL OR voided_on IS NULL)
);
CREATE TABLE public.sales_costs(id uuid PRIMARY KEY,paid_on date NOT NULL,category text NOT NULL CHECK(category IN('server','domain','sms','email','other')),amount_yen integer NOT NULL CHECK(amount_yen BETWEEN 0 AND 100000000),note text NOT NULL CHECK(length(note)<=1000));
CREATE TABLE public.sales_inquiries(id uuid PRIMARY KEY,site_id text NOT NULL REFERENCES public.demo_sites(id),actor_id uuid NOT NULL,subject text NOT NULL CHECK(length(subject) BETWEEN 1 AND 200),body text NOT NULL CHECK(length(body) BETWEEN 1 AND 4000),reply text NOT NULL DEFAULT '',state text NOT NULL DEFAULT 'open' CHECK(state IN('open','answered','closed')),created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.sales_domains(site_id text PRIMARY KEY REFERENCES public.demo_sites(id),domain text NOT NULL UNIQUE,state text NOT NULL CHECK(state IN('requested','dns_pending','verified','retired')),verified_at timestamptz);
CREATE TABLE public.sales_audit(id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,site_id text,actor_id uuid NOT NULL,action text NOT NULL,object_id text,created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.sales_actions(id uuid PRIMARY KEY,actor_id uuid NOT NULL,payload_hash text NOT NULL,result jsonb NOT NULL);
CREATE TABLE public.sales_mail_outbox(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),site_id text NOT NULL REFERENCES public.demo_sites(id),kind text NOT NULL CHECK(kind='cancellation_reminder'),due_on date NOT NULL,state text NOT NULL DEFAULT 'pending' CHECK(state IN('pending','sent','failed')),UNIQUE(site_id,kind));
ALTER TABLE public.sales_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_mail_outbox ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.sales_contracts,public.sales_invoices,public.sales_costs,public.sales_inquiries,public.sales_domains,public.sales_audit,public.sales_actions,public.sales_mail_outbox FROM PUBLIC,anon,authenticated,service_role;
GRANT SELECT,INSERT,UPDATE ON public.sales_contracts,public.sales_invoices,public.sales_inquiries,public.sales_domains TO service_role;
GRANT SELECT,INSERT ON public.sales_costs,public.sales_audit,public.sales_actions,public.sales_mail_outbox TO service_role;
REVOKE ALL ON SEQUENCE public.sales_audit_id_seq FROM PUBLIC,anon,authenticated,service_role;
GRANT USAGE ON SEQUENCE public.sales_audit_id_seq TO service_role;
-- Only the server-held service_role can execute this function. p_actor and
-- p_operator come from verified getUser/app_metadata, never the request body.
-- Do not grant managed auth.users access or use SECURITY DEFINER to authorize.
CREATE FUNCTION public.sales_operation_v1(p_actor uuid,p_operator boolean,p_action text,p_site text,p_data jsonb,p_request uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE op boolean; today date:=(clock_timestamp() AT TIME ZONE 'Asia/Tokyo')::date; c public.sales_contracts;
 inv public.sales_invoices; old public.sales_actions; result jsonb; h text; object_id text; first_cancel date; ending date; period_start date; period_end date; n integer; site public.demo_sites;
BEGIN
 IF p_actor IS NULL OR p_action IS NULL OR p_data IS NULL OR jsonb_typeof(p_data)<>'object' OR octet_length(p_data::text)>16000 THEN RAISE SQLSTATE '22023'; END IF;
 IF p_operator IS NULL THEN RAISE SQLSTATE '42501'; END IF;op:=p_operator;
 IF p_action IN('metrics','cost') AND NOT op THEN RAISE SQLSTATE '42501'; END IF;
 IF p_action='sites' THEN
  RETURN jsonb_build_object('sites',(SELECT coalesce(jsonb_agg(to_jsonb(s) ORDER BY s.store_name),'[]') FROM (SELECT ds.id,ds.store_name,ds.store_slug,ds.publish_status,ds.site_contract_status,ds.contract_start_date,ds.monthly_fee FROM public.demo_sites ds WHERE op OR EXISTS(SELECT FROM public.customers cu WHERE cu.id=ds.customer_id AND cu.auth_user_id=p_actor) ORDER BY ds.store_name LIMIT 1000)s));
 END IF;
 IF p_action NOT IN('snapshot','metrics','configure','agree','cancel','reminder','issue','pay','void','collection','cost','inquiry','reply','domain','reconcile') THEN RAISE SQLSTATE '22023'; END IF;
 IF p_site IS NOT NULL THEN
  SELECT * INTO site FROM public.demo_sites WHERE id=p_site FOR UPDATE;
  IF NOT FOUND OR (NOT op AND NOT EXISTS(SELECT FROM public.customers WHERE id=site.customer_id AND auth_user_id=p_actor)) THEN RAISE SQLSTATE '42501'; END IF;
 ELSIF p_action NOT IN('metrics','cost') THEN RAISE SQLSTATE '22023'; END IF;
 IF NOT op AND p_action NOT IN('snapshot','agree','cancel','reminder','inquiry') THEN RAISE SQLSTATE '42501'; END IF;
 SELECT * INTO c FROM public.sales_contracts WHERE site_id=p_site FOR UPDATE;
 IF p_action='snapshot' THEN
  RETURN jsonb_build_object('contract',CASE WHEN c.site_id IS NULL THEN NULL ELSE to_jsonb(c)||jsonb_build_object('first_cancellation_on',(date_trunc('month',c.start_on)+interval '6 months')::date) END,
   'invoices',(SELECT coalesce(jsonb_agg(CASE WHEN op THEN to_jsonb(i) ELSE to_jsonb(i)-'collection_note' END ORDER BY i.period DESC),'[]') FROM (SELECT * FROM public.sales_invoices WHERE site_id=p_site ORDER BY period DESC LIMIT 500)i),
   'inquiries',(SELECT coalesce(jsonb_agg(to_jsonb(q) ORDER BY q.created_at DESC),'[]') FROM (SELECT * FROM public.sales_inquiries WHERE site_id=p_site ORDER BY created_at DESC LIMIT 100)q),
   'domain',(SELECT to_jsonb(d) FROM public.sales_domains d WHERE site_id=p_site),
   'audit',CASE WHEN op THEN (SELECT coalesce(jsonb_agg(to_jsonb(a) ORDER BY a.id DESC),'[]') FROM (SELECT * FROM public.sales_audit WHERE site_id=p_site ORDER BY id DESC LIMIT 100)a) ELSE '[]'::jsonb END,
   'reminder_notice','リマインド登録は解約申請・解約予約ではありません。','mail_delivery_enabled',false);
 END IF;
 IF p_action='metrics' THEN
  IF coalesce(p_data->>'month','') !~ '^20[0-9]{2}-(0[1-9]|1[0-2])$' THEN RAISE SQLSTATE '22023'; END IF;
  period_start:=((p_data->>'month')||'-01')::date;period_end:=(period_start+interval '1 month -1 day')::date;
  RETURN jsonb_build_object('month',p_data->>'month','billed_yen',(SELECT coalesce(sum(amount_yen),0) FROM public.sales_invoices WHERE issued_on BETWEEN period_start AND period_end AND (voided_on IS NULL OR voided_on>period_end)),
   'received_yen',(SELECT coalesce(sum(amount_yen),0) FROM public.sales_invoices WHERE paid_on BETWEEN period_start AND period_end),
   'receivables_yen',(SELECT coalesce(sum(amount_yen),0) FROM public.sales_invoices WHERE issued_on<=period_end AND (paid_on IS NULL OR paid_on>period_end) AND (voided_on IS NULL OR voided_on>period_end)),
   'cost_yen',(SELECT coalesce(sum(amount_yen),0) FROM public.sales_costs WHERE paid_on BETWEEN period_start AND period_end),
   'active_stores',(SELECT count(*) FROM public.sales_contracts WHERE accepted_at IS NOT NULL AND accepted_at<((period_end+1)::timestamp AT TIME ZONE 'Asia/Tokyo') AND start_on<=period_end AND (ended_on IS NULL OR ended_on>period_end)),
   'costs',(SELECT coalesce(jsonb_agg(to_jsonb(x) ORDER BY x.paid_on DESC),'[]') FROM (SELECT * FROM public.sales_costs WHERE paid_on BETWEEN period_start AND period_end LIMIT 500)x));
 END IF;
 IF p_request IS NULL THEN RAISE SQLSTATE '22023'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(p_request::text,197));
 h:=encode(sha256(convert_to(jsonb_build_array(p_actor,p_action,p_site,p_data)::text,'UTF8')),'hex');
 SELECT * INTO old FROM public.sales_actions WHERE id=p_request;
 IF FOUND THEN IF old.actor_id<>p_actor OR old.payload_hash<>h THEN RAISE SQLSTATE 'PT409'; END IF;RETURN old.result;END IF;
 IF p_action='configure' THEN
  IF NOT op OR c.site_id IS NOT NULL OR site.site_contract_status<>'contracted' OR site.customer_id IS NULL THEN RAISE SQLSTATE 'PT409';END IF;
  IF coalesce(p_data->>'start_on','') !~ '^20[0-9]{2}-[0-9]{2}-[0-9]{2}$' OR (p_data->>'start_on')::date IS DISTINCT FROM site.contract_start_date OR jsonb_typeof(p_data->'monthly_yen')<>'number' OR (p_data->>'monthly_yen')::integer IS DISTINCT FROM site.monthly_fee OR coalesce(p_data->>'terms_version','')='' OR coalesce(p_data->>'terms_text','')='' THEN RAISE SQLSTATE '22023';END IF;
  INSERT INTO public.sales_contracts(site_id,start_on,monthly_yen,terms_version,terms_text) VALUES(p_site,(p_data->>'start_on')::date,(p_data->>'monthly_yen')::integer,p_data->>'terms_version',p_data->>'terms_text');
 ELSIF p_action='agree' THEN
  IF op OR c.site_id IS NULL OR c.accepted_at IS NOT NULL OR p_data->>'terms_version' IS DISTINCT FROM c.terms_version OR p_data->'accepted' IS DISTINCT FROM 'true'::jsonb THEN RAISE SQLSTATE 'PT409';END IF;
  UPDATE public.sales_contracts SET accepted_at=clock_timestamp(),accepted_by=p_actor,revision=revision+1 WHERE site_id=p_site;
 ELSIF p_action IN('cancel','reminder') THEN
  IF c.site_id IS NULL OR c.accepted_at IS NULL OR c.ended_on IS NOT NULL THEN RAISE SQLSTATE 'PT409';END IF;
  first_cancel:=(date_trunc('month',c.start_on)+interval '6 months')::date;
  IF p_action='cancel' THEN
   IF today<first_cancel THEN RAISE SQLSTATE 'PT409';END IF;
   ending:=(date_trunc('month',today)+interval '1 month -1 day')::date;
   UPDATE public.sales_contracts SET ended_on=ending,revision=revision+1 WHERE site_id=p_site;
  ELSE
   IF today>=first_cancel OR c.reminder_on IS NOT NULL THEN RAISE SQLSTATE 'PT409';END IF;
   UPDATE public.sales_contracts SET reminder_on=first_cancel,revision=revision+1 WHERE site_id=p_site;
  END IF;
 ELSIF p_action='issue' THEN
  IF NOT op OR c.site_id IS NULL OR c.accepted_at IS NULL OR c.ended_at IS NOT NULL OR (c.ended_on IS NOT NULL AND today>c.ended_on) THEN RAISE SQLSTATE 'PT409';END IF;
  IF coalesce(p_data->>'period','') !~ '^20[0-9]{2}-(0[1-9]|1[0-2])$' OR coalesce(p_data->>'due_on','') !~ '^20[0-9]{2}-[0-9]{2}-[0-9]{2}$' THEN RAISE SQLSTATE '22023';END IF;
  period_start:=((p_data->>'period')||'-01')::date;
  IF period_start<date_trunc('month',c.start_on)::date OR (c.ended_on IS NOT NULL AND period_start>c.ended_on) THEN RAISE SQLSTATE 'PT409';END IF;
  INSERT INTO public.sales_invoices(id,site_id,period,amount_yen,due_on,issued_on) VALUES((p_data->>'id')::uuid,p_site,period_start,c.monthly_yen,(p_data->>'due_on')::date,today);
  object_id:=p_data->>'id';
 ELSIF p_action IN('pay','void','collection') THEN
  IF NOT op THEN RAISE SQLSTATE '42501';END IF;
  SELECT * INTO inv FROM public.sales_invoices WHERE id=(p_data->>'id')::uuid AND site_id=p_site FOR UPDATE;
  IF NOT FOUND OR inv.revision IS DISTINCT FROM (p_data->>'revision')::integer THEN RAISE SQLSTATE 'PT409';END IF;
  IF p_action='pay' THEN
   IF inv.paid_on IS NOT NULL OR inv.voided_on IS NOT NULL OR coalesce(p_data->>'paid_on','') !~ '^20[0-9]{2}-[0-9]{2}-[0-9]{2}$' OR (p_data->>'paid_on')::date>today OR (p_data->>'paid_on')::date<inv.issued_on THEN RAISE SQLSTATE '22023';END IF;
   UPDATE public.sales_invoices SET paid_on=(p_data->>'paid_on')::date,revision=revision+1 WHERE id=inv.id;
  ELSIF p_action='void' THEN
   IF inv.paid_on IS NOT NULL OR inv.voided_on IS NOT NULL THEN RAISE SQLSTATE 'PT409';END IF;
   UPDATE public.sales_invoices SET voided_on=today,revision=revision+1 WHERE id=inv.id;
  ELSE
   IF length(coalesce(p_data->>'note',''))>2000 THEN RAISE SQLSTATE '22023';END IF;
   UPDATE public.sales_invoices SET collection_note=coalesce(p_data->>'note',''),revision=revision+1 WHERE id=inv.id;
  END IF;object_id:=inv.id::text;
 ELSIF p_action='cost' THEN
  IF jsonb_typeof(p_data->'amount_yen')<>'number' OR length(coalesce(p_data->>'note',''))>1000 OR (p_data->>'paid_on')::date>today THEN RAISE SQLSTATE '22023';END IF;
  INSERT INTO public.sales_costs VALUES((p_data->>'id')::uuid,(p_data->>'paid_on')::date,p_data->>'category',(p_data->>'amount_yen')::integer,coalesce(p_data->>'note',''));object_id:=p_data->>'id';
 ELSIF p_action='inquiry' THEN
  INSERT INTO public.sales_inquiries(id,site_id,actor_id,subject,body) VALUES((p_data->>'id')::uuid,p_site,p_actor,p_data->>'subject',p_data->>'body');object_id:=p_data->>'id';
 ELSIF p_action='reply' THEN
  IF NOT op OR p_data->>'state' NOT IN('answered','closed') OR length(coalesce(p_data->>'reply','')) NOT BETWEEN 1 AND 4000 THEN RAISE SQLSTATE '22023';END IF;
  UPDATE public.sales_inquiries SET reply=p_data->>'reply',state=p_data->>'state' WHERE id=(p_data->>'id')::uuid AND site_id=p_site;
  IF NOT FOUND THEN RAISE SQLSTATE 'PT409';END IF;object_id:=p_data->>'id';
 ELSIF p_action='domain' THEN
  IF NOT op OR coalesce(p_data->>'domain','') !~ '^[a-z0-9][a-z0-9.-]+\.[a-z0-9-]+$' OR length(p_data->>'domain')>253 OR p_data->>'state' NOT IN('requested','dns_pending','verified','retired') THEN RAISE SQLSTATE '22023';END IF;
  -- Records a human-reviewed state only. Does not provision DNS/Vercel or fetch URLs.
  INSERT INTO public.sales_domains(site_id,domain,state,verified_at) VALUES(p_site,p_data->>'domain',p_data->>'state',CASE WHEN p_data->>'state'='verified' THEN clock_timestamp() END)
  ON CONFLICT(site_id) DO UPDATE SET domain=excluded.domain,state=excluded.state,verified_at=excluded.verified_at;
 ELSIF p_action='reconcile' THEN
  IF NOT op OR c.site_id IS NULL THEN RAISE SQLSTATE '42501';END IF;
  IF c.ended_on IS NOT NULL AND today>c.ended_on AND c.ended_at IS NULL THEN
   UPDATE public.demo_sites SET publish_status='suspended',site_contract_status='suspended',last_updated_at=today WHERE id=p_site;
   UPDATE public.store_content SET updated_at=clock_timestamp() WHERE site_id=p_site;
   UPDATE public.sales_contracts SET ended_at=clock_timestamp(),revision=revision+1 WHERE site_id=p_site;
  END IF;
  IF c.reminder_on IS NOT NULL AND today>=c.reminder_on AND c.reminder_queued_at IS NULL AND c.ended_on IS NULL THEN
   INSERT INTO public.sales_mail_outbox(site_id,kind,due_on) VALUES(p_site,'cancellation_reminder',c.reminder_on) ON CONFLICT DO NOTHING;
   UPDATE public.sales_contracts SET reminder_queued_at=clock_timestamp() WHERE site_id=p_site;
  END IF;
 END IF;
 result:=jsonb_build_object('saved',true,'action',p_action,'request_id',p_request);
 INSERT INTO public.sales_audit(site_id,actor_id,action,object_id) VALUES(p_site,p_actor,p_action,object_id);
 INSERT INTO public.sales_actions(id,actor_id,payload_hash,result) VALUES(p_request,p_actor,h,result);
 RETURN result;
END;$$;
REVOKE ALL ON FUNCTION public.sales_operation_v1(uuid,boolean,text,text,jsonb,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.sales_operation_v1(uuid,boolean,text,text,jsonb,uuid) TO service_role;
COMMIT;
