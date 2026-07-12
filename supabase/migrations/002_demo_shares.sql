-- Sales demo share links (token-based, Supabase-backed)

CREATE TABLE public.demo_shares (
  id TEXT PRIMARY KEY,
  demo_site_id TEXT NOT NULL REFERENCES public.demo_sites (id) ON DELETE CASCADE,
  share_token TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  expires_at TIMESTAMPTZ,
  first_viewed_at TIMESTAMPTZ,
  view_count INTEGER NOT NULL DEFAULT 0,
  last_viewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX demo_shares_demo_site_id_idx ON public.demo_shares (demo_site_id);
CREATE INDEX demo_shares_active_token_idx ON public.demo_shares (share_token)
  WHERE is_active = TRUE;

ALTER TABLE public.demo_shares ENABLE ROW LEVEL SECURITY;

-- All access via server API (service role). No anon/authenticated policies.

CREATE POLICY "operators_manage_demo_shares"
  ON public.demo_shares
  FOR ALL
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'operator')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'operator');
