-- Allow a single first-run admin claim, restricted to the portfolio contact email.
-- Auth users can be created through email OTP, but only the configured contact can
-- receive the admin role, and only while no admin exists.
CREATE OR REPLACE FUNCTION public.claim_first_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  requester_id uuid := auth.uid();
  requester_email text := lower(btrim(coalesce(auth.jwt() ->> 'email', '')));
  allowed_email text;
BEGIN
  IF requester_id IS NULL OR requester_email = '' THEN
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
