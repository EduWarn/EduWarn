-- Fix 1: Update is_super_admin to use admins table instead of hardcoded emails
CREATE OR REPLACE FUNCTION public.is_super_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admins
    WHERE id = user_id AND role = 'super_admin'
  );
$$;

-- Fix 2: Restrict image uploads to admins only
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
CREATE POLICY "Only admins can upload images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'images' AND
    (storage.extension(name)) IN ('jpg', 'jpeg', 'png', 'gif', 'webp') AND
    EXISTS (SELECT 1 FROM public.admins WHERE admins.id = auth.uid())
  );