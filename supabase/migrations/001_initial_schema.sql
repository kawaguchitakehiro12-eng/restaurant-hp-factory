-- SAKUPAGE: DemoSite / Customer / StoreContent / Photo / PublishStatus
-- PostgreSQL-friendly schema mirroring localStorage structure

-- ---------------------------------------------------------------------------
-- customers
-- ---------------------------------------------------------------------------
CREATE TABLE public.customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL DEFAULT '',
  contact_person_name TEXT,
  auth_user_id UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  created_at DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE UNIQUE INDEX customers_contact_email_idx ON public.customers (LOWER(contact_email));

-- ---------------------------------------------------------------------------
-- demo_sites (DemoSite entity without content JSON)
-- publish_status = AdminPublishStatus: published | draft | suspended
-- ---------------------------------------------------------------------------
CREATE TABLE public.demo_sites (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL,
  store_name TEXT NOT NULL,
  store_slug TEXT NOT NULL,
  business_type TEXT NOT NULL,
  source_url TEXT NOT NULL DEFAULT '',
  address TEXT,
  template_id TEXT NOT NULL,
  template_type TEXT NOT NULL,
  prospect_name TEXT NOT NULL DEFAULT '',
  contact_person_name TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  sales_status TEXT NOT NULL,
  sales_memo TEXT NOT NULL DEFAULT '',
  site_contract_status TEXT NOT NULL DEFAULT 'demo',
  publish_status TEXT NOT NULL DEFAULT 'draft',
  customer_id TEXT REFERENCES public.customers (id) ON DELETE SET NULL,
  contract_start_date DATE,
  minimum_term_end_date DATE,
  monthly_fee INTEGER,
  domain_status TEXT,
  login_email TEXT,
  initial_password TEXT,
  next_billing_date DATE,
  billing_status TEXT,
  plan_name TEXT,
  payment_method TEXT,
  published_at DATE,
  is_newly_created BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATE NOT NULL,
  last_updated_at DATE NOT NULL,
  CONSTRAINT demo_sites_store_slug_unique UNIQUE (store_slug)
);

CREATE INDEX demo_sites_customer_id_idx ON public.demo_sites (customer_id);
CREATE INDEX demo_sites_publish_status_idx ON public.demo_sites (publish_status);
CREATE INDEX demo_sites_site_contract_status_idx ON public.demo_sites (site_contract_status);

-- ---------------------------------------------------------------------------
-- store_content (DemoSiteContent as JSONB — same shape as localStorage)
-- ---------------------------------------------------------------------------
CREATE TABLE public.store_content (
  site_id TEXT PRIMARY KEY REFERENCES public.demo_sites (id) ON DELETE CASCADE,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- photos (normalized metadata; URLs also live in store_content.photos)
-- ---------------------------------------------------------------------------
CREATE TABLE public.photos (
  id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL REFERENCES public.demo_sites (id) ON DELETE CASCADE,
  slot TEXT NOT NULL CHECK (slot IN ('hero', 'interior', 'food', 'exterior', 'gallery', 'menu')),
  url TEXT NOT NULL,
  storage_path TEXT,
  alt TEXT NOT NULL DEFAULT '',
  caption TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  menu_item_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX photos_site_id_idx ON public.photos (site_id);
CREATE INDEX photos_site_slot_idx ON public.photos (site_id, slot);

-- ---------------------------------------------------------------------------
-- Storage bucket for uploaded site photos (optional; base64 URLs work as-is)
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-photos', 'site-photos', TRUE)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

-- Helper: visible demo sites (matches isDemoSitePubliclyVisible)
CREATE OR REPLACE FUNCTION public.is_demo_site_publicly_visible(
  p_site_contract_status TEXT,
  p_publish_status TEXT
) RETURNS BOOLEAN
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT
    p_site_contract_status NOT IN ('lost', 'suspended')
    AND p_publish_status <> 'suspended'
    AND (
      p_site_contract_status = 'demo'
      OR (p_site_contract_status = 'contracted' AND p_publish_status = 'published')
    );
$$;

-- Public read: visible demo sites
CREATE POLICY "public_read_visible_demo_sites"
  ON public.demo_sites
  FOR SELECT
  TO anon, authenticated
  USING (
    public.is_demo_site_publicly_visible(site_contract_status, publish_status)
  );

-- Operators (JWT app_metadata.role = 'operator')
CREATE POLICY "operators_all_demo_sites"
  ON public.demo_sites
  FOR ALL
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'operator')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'operator');

-- Public read store_content for visible sites
CREATE POLICY "public_read_visible_store_content"
  ON public.store_content
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.demo_sites ds
      WHERE ds.id = store_content.site_id
        AND public.is_demo_site_publicly_visible(ds.site_contract_status, ds.publish_status)
    )
  );

-- Operators manage store_content
CREATE POLICY "operators_all_store_content"
  ON public.store_content
  FOR ALL
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'operator')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'operator');

-- Customers read/update own store_content
CREATE POLICY "customers_read_own_store_content"
  ON public.store_content
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.demo_sites ds
      JOIN public.customers c ON c.id = ds.customer_id
      WHERE ds.id = store_content.site_id
        AND c.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "customers_update_own_store_content"
  ON public.store_content
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.demo_sites ds
      JOIN public.customers c ON c.id = ds.customer_id
      WHERE ds.id = store_content.site_id
        AND c.auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.demo_sites ds
      JOIN public.customers c ON c.id = ds.customer_id
      WHERE ds.id = store_content.site_id
        AND c.auth_user_id = auth.uid()
    )
  );

-- Public read photos for visible sites
CREATE POLICY "public_read_visible_photos"
  ON public.photos
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.demo_sites ds
      WHERE ds.id = photos.site_id
        AND public.is_demo_site_publicly_visible(ds.site_contract_status, ds.publish_status)
    )
  );

CREATE POLICY "operators_all_photos"
  ON public.photos
  FOR ALL
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'operator')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'operator');

CREATE POLICY "customers_update_own_photos"
  ON public.photos
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.demo_sites ds
      JOIN public.customers c ON c.id = ds.customer_id
      WHERE ds.id = photos.site_id
        AND c.auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.demo_sites ds
      JOIN public.customers c ON c.id = ds.customer_id
      WHERE ds.id = photos.site_id
        AND c.auth_user_id = auth.uid()
    )
  );

-- Customers: read own record
CREATE POLICY "customers_read_self"
  ON public.customers
  FOR SELECT
  TO authenticated
  USING (auth_user_id = auth.uid());

CREATE POLICY "operators_all_customers"
  ON public.customers
  FOR ALL
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'operator')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'operator');

-- Storage: public read, authenticated upload to own site folder
CREATE POLICY "public_read_site_photos"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'site-photos');

CREATE POLICY "authenticated_upload_site_photos"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'site-photos');
