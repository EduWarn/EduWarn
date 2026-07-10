
-- Drop the restrictive INSERT policy and recreate as PERMISSIVE
DROP POLICY IF EXISTS "Allow public registration inserts" ON public.registrations;

CREATE POLICY "Allow public registration inserts"
ON public.registrations
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Also fix the SELECT policy to be permissive for admins
DROP POLICY IF EXISTS "Only admins can view registrations" ON public.registrations;

CREATE POLICY "Only admins can view registrations"
ON public.registrations
FOR SELECT
TO authenticated
USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));
