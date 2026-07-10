
-- Add length and format constraints to registrations table
ALTER TABLE public.registrations
  ADD CONSTRAINT check_full_name_length CHECK (length(full_name) BETWEEN 1 AND 100),
  ADD CONSTRAINT check_email_length CHECK (length(email) BETWEEN 5 AND 254),
  ADD CONSTRAINT check_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  ADD CONSTRAINT check_phone_length CHECK (length(phone) BETWEEN 5 AND 20),
  ADD CONSTRAINT check_grade_length CHECK (length(grade) BETWEEN 1 AND 50);

-- Also add constraints to contacts table for defense in depth
ALTER TABLE public.contacts
  ADD CONSTRAINT check_contact_name_length CHECK (length(full_name) BETWEEN 1 AND 100),
  ADD CONSTRAINT check_contact_email_length CHECK (length(email) BETWEEN 5 AND 254),
  ADD CONSTRAINT check_contact_phone_length CHECK (length(phone) BETWEEN 5 AND 20),
  ADD CONSTRAINT check_contact_subject_length CHECK (length(subject) BETWEEN 1 AND 200),
  ADD CONSTRAINT check_contact_message_length CHECK (length(message) BETWEEN 1 AND 5000);

-- Fix insert_contact function to have proper search_path (fixes SUPA_function_search_path_mutable)
CREATE OR REPLACE FUNCTION public.insert_contact(p_full_name text, p_email text, p_phone text, p_subject text, p_message text, p_whatsapp_opted_in boolean DEFAULT false)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO public.contacts (
    full_name, email, phone, subject, message, whatsapp_opted_in
  ) VALUES (
    p_full_name, p_email, p_phone, p_subject, p_message, p_whatsapp_opted_in
  )
  RETURNING id INTO v_id;
  
  RETURN json_build_object('id', v_id);
END;
$function$;

-- Fix is_admin function search_path
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE
 SECURITY DEFINER
 SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admins 
    WHERE id = user_id
  );
$$;
