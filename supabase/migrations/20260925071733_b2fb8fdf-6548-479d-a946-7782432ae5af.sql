CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_headline text NOT NULL DEFAULT '',
  hero_supporting text NOT NULL DEFAULT '',
  capability_tags text[] NOT NULL DEFAULT '{}',
  contact_email text NOT NULL DEFAULT '',
  linkedin_url text NOT NULL DEFAULT '',
  github_url text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT '',
  cta_primary_label text NOT NULL DEFAULT 'Selected Work',
  cta_primary_href text NOT NULL DEFAULT '#selected-work',
  cta_secondary_label text NOT NULL DEFAULT 'Resume',
  cta_secondary_href text NOT NULL DEFAULT '',
  seo_title text NOT NULL DEFAULT '',
  seo_description text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.about (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  intro text NOT NULL DEFAULT '',
  transition_copy text NOT NULL DEFAULT '',
  portrait_path text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.resume (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_path text,
  file_name text,
  uploaded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.selected_work (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  category text NOT NULL DEFAULT '',
  short_description text NOT NULL DEFAULT '',
  challenge text NOT NULL DEFAULT '',
  contribution text NOT NULL DEFAULT '',
  workflow text[] NOT NULL DEFAULT '{}',
  outcome text NOT NULL DEFAULT '',
  tags text[] NOT NULL DEFAULT '{}',
  featured boolean NOT NULL DEFAULT false,
  display_order int NOT NULL DEFAULT 0,
  image_path text,
  evidence_type text NOT NULL DEFAULT 'Representative Visual',
  visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.independent_work (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  status text NOT NULL DEFAULT 'In Development',
  description text NOT NULL DEFAULT '',
  capabilities text[] NOT NULL DEFAULT '{}',
  image_path text,
  live_url text,
  repo_url text,
  size_variant text NOT NULL DEFAULT 'standard',
  visible boolean NOT NULL DEFAULT true,
  featured boolean NOT NULL DEFAULT false,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.healthcare_study (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  summary text NOT NULL DEFAULT '',
  bullets text[] NOT NULL DEFAULT '{}',
  image_path text,
  visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.visual_work (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL DEFAULT '',
  short_description text NOT NULL DEFAULT '',
  image_path text,
  url text,
  display_order int NOT NULL DEFAULT 0,
  visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['site_settings','about','resume','selected_work','independent_work','healthcare_study','visual_work'] LOOP
    EXECUTE format('GRANT SELECT ON public.%I TO anon', t);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE POLICY "admin manage %1$s" ON public.%1$I FOR ALL TO authenticated USING (public.has_role(auth.uid(), ''admin'')) WITH CHECK (public.has_role(auth.uid(), ''admin''))', t);
    EXECUTE format('CREATE TRIGGER set_updated_at_%1$s BEFORE UPDATE ON public.%1$I FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column()', t);
  END LOOP;
END $$;

CREATE POLICY "public read site_settings" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public read about" ON public.about FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public read resume" ON public.resume FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public read selected_work" ON public.selected_work FOR SELECT TO anon, authenticated USING (visible);
CREATE POLICY "public read independent_work" ON public.independent_work FOR SELECT TO anon, authenticated USING (visible);
CREATE POLICY "public read healthcare_study" ON public.healthcare_study FOR SELECT TO anon, authenticated USING (visible);
CREATE POLICY "public read visual_work" ON public.visual_work FOR SELECT TO anon, authenticated USING (visible);

CREATE POLICY "public read media" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'media');
CREATE POLICY "admin insert media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'media' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin update media" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'media' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin delete media" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'media' AND public.has_role(auth.uid(),'admin'));