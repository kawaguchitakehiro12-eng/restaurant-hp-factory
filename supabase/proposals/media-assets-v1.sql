-- LOCAL PROPOSAL ONLY. Do not apply before backup, review and separate approval.
BEGIN;
CREATE TABLE public.media_metadata (
 site_id text PRIMARY KEY REFERENCES public.demo_sites(id),
 revision bigint NOT NULL CHECK(revision>0),
 state jsonb NOT NULL CHECK(jsonb_typeof(state)='object'),
 updated_at timestamptz NOT NULL DEFAULT now(),
 CONSTRAINT no_image_body CHECK(state::text NOT LIKE '%data:image/%')
);
ALTER TABLE public.media_metadata ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.media_metadata FROM PUBLIC,anon,authenticated,service_role;
GRANT SELECT,INSERT,UPDATE ON public.media_metadata TO service_role;
CREATE FUNCTION public.media_compare_swap_v1(p_site text,p_expected bigint,p_state jsonb)
RETURNS boolean LANGUAGE plpgsql SECURITY INVOKER SET search_path=pg_catalog,public AS $$
DECLARE total_bytes bigint;
BEGIN
 IF jsonb_typeof(p_state->'assets') IS DISTINCT FROM 'array'
 OR (p_state->>'revision')::bigint<=p_expected THEN RAISE EXCEPTION 'MEDIA_STATE' USING ERRCODE='22023'; END IF;
 IF jsonb_array_length(p_state->'assets')>2000 OR EXISTS(SELECT 1 FROM jsonb_array_elements(p_state->'assets') a WHERE
 jsonb_typeof(a->'bytes') IS DISTINCT FROM 'number' OR (a->>'bytes')::bigint<0 OR (a->>'bytes')::bigint>50000000
 OR a->>'site' IS DISTINCT FROM p_site OR a->>'format' IS DISTINCT FROM 'webp'
 OR coalesce(a->>'state','') NOT IN ('reserved','ready','retired','review')
 OR coalesce(a->>'id','') !~ '^[a-zA-Z0-9_-]{1,100}$'
 OR a->>'key' IS DISTINCT FROM 'sites/'||p_site||'/'||(a->>'id')||'.webp'
 OR coalesce(a->>'hash','') !~ '^[a-f0-9]{64}$') THEN RAISE EXCEPTION 'MEDIA_STATE' USING ERRCODE='22023'; END IF;
 SELECT coalesce(sum((a->>'bytes')::bigint),0) INTO total_bytes FROM jsonb_array_elements(p_state->'assets') a;
 IF total_bytes>50000000 OR (SELECT count(*)<>count(DISTINCT a->>'id') FROM jsonb_array_elements(p_state->'assets') a) THEN RAISE EXCEPTION 'MEDIA_QUOTA' USING ERRCODE='22023'; END IF;
 IF p_expected=0 THEN
 INSERT INTO public.media_metadata(site_id,revision,state) VALUES(p_site,(p_state->>'revision')::bigint,p_state) ON CONFLICT DO NOTHING;
 ELSE
 UPDATE public.media_metadata SET revision=(p_state->>'revision')::bigint,state=p_state,updated_at=now() WHERE site_id=p_site AND revision=p_expected;
 END IF;
 RETURN FOUND;
END $$;
REVOKE ALL ON FUNCTION public.media_compare_swap_v1(text,bigint,jsonb) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public.media_compare_swap_v1(text,bigint,jsonb) TO service_role;
COMMIT;
