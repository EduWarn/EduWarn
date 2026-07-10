
-- Fix 1: Ensure dangerous INSERT policy on admins is dropped and proper policies exist
DROP POLICY IF EXISTS "Users can insert their own admin record" ON public.admins;
DROP POLICY IF EXISTS "Allow super admins full access" ON public.admins;
DROP POLICY IF EXISTS "Users can view their own admin record" ON public.admins;

-- Recreate proper policies: super admins get full access, users can only view own record
CREATE POLICY "Super admins full access"
  ON public.admins FOR ALL
  USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Users can view own admin record"
  ON public.admins FOR SELECT
  USING (auth.uid() = id);

-- Fix 2: Restrict images storage bucket updates to admins only
DROP POLICY IF EXISTS "Authenticated users can update images" ON storage.objects;

CREATE POLICY "Only admins can update images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'images' AND
    EXISTS (SELECT 1 FROM public.admins WHERE admins.id = auth.uid())
  );

-- Fix 3: Add server-side validation to insert_contact function
CREATE OR REPLACE FUNCTION public.insert_contact(
  p_full_name text, p_email text, p_phone text, 
  p_subject text, p_message text, p_whatsapp_opted_in boolean DEFAULT false
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_id UUID;
BEGIN
  -- Validate inputs server-side
  IF length(trim(p_full_name)) < 1 OR length(p_full_name) > 100 THEN
    RAISE EXCEPTION 'Invalid name';
  END IF;
  
  IF p_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email';
  END IF;
  
  IF length(trim(p_phone)) < 1 OR length(p_phone) > 20 THEN
    RAISE EXCEPTION 'Invalid phone';
  END IF;
  
  IF length(trim(p_subject)) < 1 OR length(p_subject) > 200 THEN
    RAISE EXCEPTION 'Invalid subject';
  END IF;
  
  IF length(trim(p_message)) < 1 OR length(p_message) > 5000 THEN
    RAISE EXCEPTION 'Invalid message';
  END IF;

  INSERT INTO public.contacts (
    full_name, email, phone, subject, message, whatsapp_opted_in
  ) VALUES (
    trim(p_full_name), trim(p_email), trim(p_phone), trim(p_subject), trim(p_message), p_whatsapp_opted_in
  )
  RETURNING id INTO v_id;
  
  RETURN json_build_object('id', v_id);
END;
$function$;
