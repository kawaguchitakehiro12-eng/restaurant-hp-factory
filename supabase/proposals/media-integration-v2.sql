-- Development proposal only. Requires media-assets-v1 and commerce-v2. No hosted apply.
BEGIN;
CREATE SCHEMA saku_media_private;
REVOKE ALL ON SCHEMA saku_media_private FROM PUBLIC,anon,authenticated;
CREATE TABLE public.media_change_clock(singleton boolean PRIMARY KEY CHECK(singleton),generation bigint NOT NULL);
INSERT INTO public.media_change_clock VALUES(true,1);
CREATE TABLE public.media_sync_sites(site_id text PRIMARY KEY);
INSERT INTO public.media_sync_sites SELECT site_id FROM public.media_metadata;
ALTER TABLE public.media_sync_sites ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.media_sync_sites FROM PUBLIC,anon,authenticated,service_role;
GRANT SELECT ON public.media_sync_sites TO service_role;
ALTER TABLE public.media_change_clock ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.media_change_clock FROM PUBLIC,anon,authenticated,service_role;
GRANT SELECT ON public.media_change_clock TO service_role;
ALTER TABLE public.media_metadata ADD COLUMN published_assets text[] NOT NULL DEFAULT '{}';
CREATE FUNCTION saku_media_private.guard_referenced_assets() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path=pg_catalog,public AS $$
BEGIN
 IF EXISTS(SELECT 1 FROM unnest(NEW.published_assets) id WHERE NOT EXISTS(SELECT 1 FROM jsonb_array_elements(NEW.state->'assets') a WHERE a->>'id'=id AND a->>'state'='ready')) THEN RAISE EXCEPTION 'MEDIA_ASSET_REFERENCED' USING ERRCODE='40001'; END IF;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION saku_media_private.guard_referenced_assets() FROM PUBLIC,anon,authenticated,service_role;
CREATE TRIGGER media_guard_references BEFORE UPDATE OF state ON public.media_metadata FOR EACH ROW EXECUTE FUNCTION saku_media_private.guard_referenced_assets();
CREATE FUNCTION saku_media_private.touch_clock() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,public AS $$
BEGIN
 IF TG_TABLE_NAME='media_metadata' AND TG_OP='INSERT' THEN
  INSERT INTO public.media_sync_sites VALUES(NEW.site_id) ON CONFLICT DO NOTHING;
 END IF;
 IF TG_OP='UPDATE' AND TG_TABLE_NAME='demo_sites' THEN
  IF OLD.site_contract_status=NEW.site_contract_status AND OLD.publish_status=NEW.publish_status THEN RETURN NULL; END IF;
 END IF;
 IF TG_OP='UPDATE' AND TG_TABLE_NAME='demo_shares' THEN
  IF ROW(OLD.is_active,OLD.expires_at,OLD.share_token,OLD.created_at) IS NOT DISTINCT FROM ROW(NEW.is_active,NEW.expires_at,NEW.share_token,NEW.created_at) THEN RETURN NULL; END IF;
 END IF;
 IF TG_OP='UPDATE' AND TG_TABLE_NAME='commerce_sites' THEN
  IF (OLD.document - ARRAY['invoices','audit','outbox','events','costs','calls','inquiries','notices','adjustments']) IS NOT DISTINCT FROM (NEW.document - ARRAY['invoices','audit','outbox','events','costs','calls','inquiries','notices','adjustments']) THEN RETURN NULL; END IF;
 END IF;
 IF TG_TABLE_NAME='media_metadata' AND TG_OP='UPDATE' THEN
  IF OLD.state->'assets' IS NOT DISTINCT FROM NEW.state->'assets' AND OLD.published_assets IS NOT DISTINCT FROM NEW.published_assets THEN RETURN NULL; END IF;
 END IF;
 UPDATE public.media_change_clock SET generation=generation+1 WHERE singleton;
 RETURN NULL;
END $$;
REVOKE ALL ON FUNCTION saku_media_private.touch_clock() FROM PUBLIC,anon,authenticated,service_role;
CREATE TRIGGER media_clock_sites AFTER INSERT OR UPDATE OR DELETE ON public.demo_sites FOR EACH ROW EXECUTE FUNCTION saku_media_private.touch_clock();
CREATE TRIGGER media_clock_shares AFTER INSERT OR UPDATE OR DELETE ON public.demo_shares FOR EACH ROW EXECUTE FUNCTION saku_media_private.touch_clock();
CREATE TRIGGER media_clock_contract AFTER INSERT OR UPDATE OR DELETE ON public.commerce_sites FOR EACH ROW EXECUTE FUNCTION saku_media_private.touch_clock();
CREATE TRIGGER media_clock_assets AFTER INSERT OR UPDATE OR DELETE ON public.media_metadata FOR EACH ROW EXECUTE FUNCTION saku_media_private.touch_clock();
CREATE FUNCTION saku_media_private.content_refs() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,public AS $$
DECLARE ids text[];
BEGIN
 SELECT coalesce(array_agg(DISTINCT a->>'id' ORDER BY a->>'id'),'{}') INTO ids
 FROM public.media_metadata m CROSS JOIN LATERAL jsonb_array_elements(m.state->'assets') a
 WHERE m.site_id=NEW.site_id AND a->>'state'='ready'
 AND EXISTS(SELECT 1 FROM jsonb_path_query(NEW.content,'$.** ? (@.type() == "string")') v
 WHERE trim(both '"' FROM v::text) ~ '^https://[^/]+/v1/[^/]+/[^/]+[.]webp$'
 AND right(trim(both '"' FROM v::text),length('/v1/'||NEW.site_id||'/'||(a->>'id')||'.webp'))='/v1/'||NEW.site_id||'/'||(a->>'id')||'.webp');
 UPDATE public.media_metadata SET published_assets=ids WHERE site_id=NEW.site_id;
 UPDATE public.media_change_clock SET generation=generation+1 WHERE singleton;
 RETURN NULL;
END $$;
REVOKE ALL ON FUNCTION saku_media_private.content_refs() FROM PUBLIC,anon,authenticated,service_role;
CREATE TRIGGER media_content_refs AFTER INSERT OR UPDATE OF content ON public.store_content FOR EACH ROW EXECUTE FUNCTION saku_media_private.content_refs();

CREATE TABLE public.media_migration_jobs(
 id text PRIMARY KEY,site_id text NOT NULL REFERENCES public.demo_sites(id),
 source_revision timestamptz NOT NULL,source_sha text NOT NULL CHECK(source_sha ~ '^[a-f0-9]{64}$'),
 revision bigint NOT NULL DEFAULT 0,state text NOT NULL DEFAULT 'planned' CHECK(state IN('planned','prepared','switched','conflict','review')),
 entries jsonb NOT NULL DEFAULT '{}',target jsonb NULL,backup_key text NULL,backup_sha text NULL,
 created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(site_id,source_revision,source_sha),CHECK(target IS NULL OR target::text NOT LIKE '%data:image/%'),CHECK(entries::text NOT LIKE '%data:image/%')
);
ALTER TABLE public.media_migration_jobs ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.media_migration_jobs FROM PUBLIC,anon,authenticated,service_role;
GRANT SELECT,INSERT,UPDATE ON public.media_migration_jobs TO service_role;
CREATE FUNCTION public.media_migration_snapshot_v2(p_site text) RETURNS jsonb LANGUAGE sql SECURITY INVOKER SET search_path=pg_catalog,public AS $$
 SELECT jsonb_build_object('content',content,'revision',updated_at,'sha',encode(sha256(convert_to(content::text,'UTF8')),'hex')) FROM public.store_content WHERE site_id=p_site;
$$;
CREATE FUNCTION public.media_migration_open_v2(p_id text,p_site text,p_revision timestamptz,p_sha text) RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=pg_catalog,public AS $$
DECLARE j public.media_migration_jobs;c public.store_content;
BEGIN
 IF p_id !~ '^[a-f0-9]{64}$' OR p_sha !~ '^[a-f0-9]{64}$' THEN RAISE EXCEPTION 'MEDIA_JOB_INPUT'; END IF;
 SELECT * INTO j FROM public.media_migration_jobs WHERE id=p_id;
 IF FOUND THEN IF j.site_id<>p_site OR j.source_revision<>p_revision OR j.source_sha<>p_sha THEN RAISE EXCEPTION 'MEDIA_JOB_ID'; END IF;RETURN to_jsonb(j); END IF;
 SELECT * INTO c FROM public.store_content WHERE site_id=p_site FOR SHARE;
 IF NOT FOUND OR c.updated_at IS DISTINCT FROM p_revision OR encode(sha256(convert_to(c.content::text,'UTF8')),'hex')<>p_sha THEN RAISE EXCEPTION 'MEDIA_SOURCE_CONFLICT' USING ERRCODE='40001'; END IF;
 INSERT INTO public.media_migration_jobs(id,site_id,source_revision,source_sha) VALUES(p_id,p_site,p_revision,p_sha) ON CONFLICT DO NOTHING;
 SELECT * INTO STRICT j FROM public.media_migration_jobs WHERE id=p_id;
 RETURN to_jsonb(j);
END $$;
CREATE FUNCTION public.media_migration_record_v2(p_job text,p_expected bigint,p_record jsonb) RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=pg_catalog,public AS $$
DECLARE j public.media_migration_jobs;
BEGIN
 SELECT * INTO j FROM public.media_migration_jobs WHERE id=p_job FOR UPDATE;
 IF NOT FOUND OR j.revision<>p_expected OR j.state IN('switched','conflict') OR coalesce(p_record->>'state','') NOT IN('planned','prepared','review') OR jsonb_typeof(p_record->'entries') IS DISTINCT FROM 'object' THEN RAISE EXCEPTION 'MEDIA_JOB_CONFLICT' USING ERRCODE='40001'; END IF;
 IF p_record->>'backup_key' IS DISTINCT FROM 'legacy/'||p_job||'.bin' OR coalesce(p_record->>'backup_sha','') !~ '^[a-f0-9]{64}$' THEN RAISE EXCEPTION 'MEDIA_BACKUP_REQUIRED'; END IF;
 IF j.backup_key IS NOT NULL AND ROW(j.backup_key,j.backup_sha) IS DISTINCT FROM ROW(p_record->>'backup_key',p_record->>'backup_sha') THEN RAISE EXCEPTION 'MEDIA_BACKUP_CHANGED'; END IF;
 UPDATE public.media_migration_jobs SET entries=p_record->'entries',target=nullif(p_record->'target','null'),state=p_record->>'state',backup_key=p_record->>'backup_key',backup_sha=p_record->>'backup_sha',revision=revision+1,updated_at=clock_timestamp() WHERE id=p_job RETURNING * INTO j;
 RETURN to_jsonb(j);
END $$;
CREATE FUNCTION public.media_migration_switch_v2(p_job text,p_expected bigint) RETURNS text LANGUAGE plpgsql SECURITY INVOKER SET search_path=pg_catalog,public AS $$
DECLARE j public.media_migration_jobs;c public.store_content;v_now timestamptz:=clock_timestamp();
BEGIN
 SELECT * INTO j FROM public.media_migration_jobs WHERE id=p_job FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'MEDIA_JOB_MISSING'; END IF;
 IF j.state='switched' THEN RETURN 'switched'; END IF;
 IF j.revision<>p_expected OR j.state<>'prepared' OR j.target IS NULL OR j.backup_key IS NULL OR j.backup_sha IS NULL THEN RAISE EXCEPTION 'MEDIA_JOB_CONFLICT' USING ERRCODE='40001'; END IF;
 SELECT * INTO c FROM public.store_content WHERE site_id=j.site_id FOR UPDATE;
 IF NOT FOUND OR c.updated_at IS DISTINCT FROM j.source_revision OR encode(sha256(convert_to(c.content::text,'UTF8')),'hex')<>j.source_sha THEN
 UPDATE public.media_migration_jobs SET state='conflict',revision=revision+1,updated_at=v_now WHERE id=j.id;RETURN 'conflict'; END IF;
 UPDATE public.store_content SET content=j.target,updated_at=v_now WHERE site_id=j.site_id;
 DELETE FROM public.photos WHERE site_id=j.site_id;
 INSERT INTO public.photos(id,site_id,slot,url,storage_path,alt,caption,sort_order,menu_item_id)
 SELECT j.site_id||'-'||slot,j.site_id,slot,j.target->'photos'->>slot,NULL,'','',0,NULL FROM unnest(ARRAY['hero','interior','food','exterior']) slot WHERE coalesce(j.target->'photos'->>slot,'')<>'';
 INSERT INTO public.photos(id,site_id,slot,url,storage_path,alt,caption,sort_order,menu_item_id)
 SELECT j.site_id||'-gallery-'||md5(g->>'id'),j.site_id,'gallery',g->>'url',NULL,coalesce(g->>'alt',''),coalesce(g->>'caption',''),(g->>'sortOrder')::integer,NULL FROM jsonb_array_elements(coalesce(j.target->'photos'->'gallery','[]')) g WHERE coalesce(g->>'url','')<>'';
 INSERT INTO public.photos(id,site_id,slot,url,storage_path,alt,caption,sort_order,menu_item_id)
 SELECT j.site_id||'-menu-'||md5(m->>'id'),j.site_id,'menu',m->>'imageUrl',NULL,m->>'name',coalesce(m->>'description',''),(m->>'sortOrder')::integer,m->>'id' FROM jsonb_array_elements(coalesce(j.target->'menus','[]')) m WHERE coalesce(m->>'imageUrl','')<>'';
 UPDATE public.media_migration_jobs SET state='switched',revision=revision+1,updated_at=v_now WHERE id=j.id;
 RETURN 'switched';
END $$;
REVOKE ALL ON FUNCTION public.media_migration_snapshot_v2(text),public.media_migration_switch_v2(text,bigint),public.media_migration_open_v2(text,text,timestamptz,text),public.media_migration_record_v2(text,bigint,jsonb) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public.media_migration_snapshot_v2(text),public.media_migration_switch_v2(text,bigint),public.media_migration_open_v2(text,text,timestamptz,text),public.media_migration_record_v2(text,bigint,jsonb) TO service_role;
COMMIT;
