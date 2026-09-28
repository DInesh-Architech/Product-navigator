-- Require a verified authenticator (TOTP) session for admin data access.
-- Supabase marks sessions authenticated with a verified second factor as aal2.

CREATE OR REPLACE FUNCTION public.claim_first_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  requester_id uuid := auth.uid();
  requester_email text := lower(btrim(coalesce(auth.jwt() ->> 'email', '')));
  requester_aal text := coalesce(auth.jwt() ->> 'aal', 'aal1');
  allowed_email text;
BEGIN
  IF requester_id IS NULL OR requester_email = '' OR requester_aal <> 'aal2' THEN
    RETURN false;
  END IF;

  SELECT lower(btrim(s.contact_email))
  INTO allowed_email
  FROM public.site_settings AS s
  WHERE nullif(btrim(s.contact_email), '') IS NOT NULL
  ORDER BY s.created_at
  LIMIT 1;

  allowed_email := coalesce(allowed_email, 'odkspav@gmail.com');
  IF requester_email <> allowed_email THEN
    RETURN false;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = requester_id AND role = 'admin'
  ) THEN
    RETURN true;
  END IF;

  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    RETURN false;
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (requester_id, 'admin'::public.app_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = requester_id AND role = 'admin'
  );
END;
$$;

REVOKE ALL ON FUNCTION public.claim_first_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_first_admin() TO authenticated;

DO $$
DECLARE
  table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'site_settings',
    'about',
    'resume',
    'selected_work',
    'independent_work',
    'healthcare_study',
    'visual_work'
  ] LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON public.%I',
      'admin manage ' || table_name,
      table_name
    );
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (public.has_role(auth.uid(), ''admin'') AND coalesce(auth.jwt() ->> ''aal'', ''aal1'') = ''aal2'') WITH CHECK (public.has_role(auth.uid(), ''admin'') AND coalesce(auth.jwt() ->> ''aal'', ''aal1'') = ''aal2'')',
      'admin manage ' || table_name,
      table_name
    );
  END LOOP;
END;
$$;

DROP POLICY IF EXISTS "admin insert media" ON storage.objects;
DROP POLICY IF EXISTS "admin update media" ON storage.objects;
DROP POLICY IF EXISTS "admin delete media" ON storage.objects;

CREATE POLICY "admin insert media" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'media'
  AND public.has_role(auth.uid(), 'admin')
  AND coalesce(auth.jwt() ->> 'aal', 'aal1') = 'aal2'
);

CREATE POLICY "admin update media" ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'media'
  AND public.has_role(auth.uid(), 'admin')
  AND coalesce(auth.jwt() ->> 'aal', 'aal1') = 'aal2'
)
WITH CHECK (
  bucket_id = 'media'
  AND public.has_role(auth.uid(), 'admin')
  AND coalesce(auth.jwt() ->> 'aal', 'aal1') = 'aal2'
);

CREATE POLICY "admin delete media" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'media'
  AND public.has_role(auth.uid(), 'admin')
  AND coalesce(auth.jwt() ->> 'aal', 'aal1') = 'aal2'
);
