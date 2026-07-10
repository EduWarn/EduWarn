DROP POLICY IF EXISTS "Users can update their own purchases" ON public.course_purchases;

CREATE POLICY "Admins can manage course purchases"
ON public.course_purchases
FOR ALL
USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));