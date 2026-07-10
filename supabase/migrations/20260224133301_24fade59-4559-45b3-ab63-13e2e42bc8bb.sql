
-- Fix: Restrict registration data to admins only
DROP POLICY IF EXISTS "Only authenticated users can view registrations" ON public.registrations;

CREATE POLICY "Only admins can view registrations"
  ON public.registrations FOR SELECT
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));
