
-- 1. course_lessons: restrict full row to admins/enrolled/free-preview; expose public metadata via view
DROP POLICY IF EXISTS "Anyone can view lessons of published courses" ON public.course_lessons;

CREATE POLICY "Lessons visible with access"
ON public.course_lessons
FOR SELECT
USING (
  public.is_admin(auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.course_modules m
    JOIN public.courses c ON c.id = m.course_id
    WHERE m.id = course_lessons.module_id
      AND c.published = true
      AND (
        course_lessons.is_free_preview = true
        OR EXISTS (
          SELECT 1 FROM public.course_purchases cp
          WHERE cp.user_id = auth.uid()
            AND cp.course_id = c.id::text
            AND cp.payment_status = 'completed'
        )
      )
  )
);

CREATE OR REPLACE VIEW public.course_lessons_public
WITH (security_invoker = true) AS
SELECT l.id, l.module_id, l.title, l.duration_minutes, l.is_free_preview, l.sort_order
FROM public.course_lessons l
JOIN public.course_modules m ON m.id = l.module_id
JOIN public.courses c ON c.id = m.course_id
WHERE c.published = true;

-- View needs its own permissive SELECT via the base table policy. Add a lightweight metadata policy.
CREATE POLICY "Lesson metadata is public for published courses"
ON public.course_lessons
FOR SELECT
TO anon
USING (false);

-- Actually simplest: allow public SELECT of metadata columns via a SECURITY DEFINER view
DROP VIEW IF EXISTS public.course_lessons_public;
CREATE VIEW public.course_lessons_public
WITH (security_invoker = false) AS
SELECT l.id, l.module_id, l.title, l.duration_minutes, l.is_free_preview, l.sort_order
FROM public.course_lessons l
JOIN public.course_modules m ON m.id = l.module_id
JOIN public.courses c ON c.id = m.course_id
WHERE c.published = true;

DROP POLICY IF EXISTS "Lesson metadata is public for published courses" ON public.course_lessons;

GRANT SELECT ON public.course_lessons_public TO anon, authenticated;

-- 2. course_purchases: harden INSERT
DROP POLICY IF EXISTS "Users can insert their own purchases" ON public.course_purchases;
-- No client insert path; approve_payment (SECURITY DEFINER) creates rows. Keep RLS strict.

-- 3. payment_verifications: force status='pending' on user insert
DROP POLICY IF EXISTS "Users can create their own payment verifications" ON public.payment_verifications;
CREATE POLICY "Users can create their own payment verifications"
ON public.payment_verifications
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- 4. Storage: delete policies for images (admin only) and payment-screenshots (admin only)
CREATE POLICY "Only admins can delete images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'images' AND public.is_admin(auth.uid()));

CREATE POLICY "Only admins can delete payment screenshots"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'payment-screenshots' AND public.is_admin(auth.uid()));

-- 5. Drop duplicate payment-screenshots upload policy (bypasses filetype whitelist)
DROP POLICY IF EXISTS "Users can upload their own payment screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own payment screenshots" ON storage.objects;

-- 6. team_members: restrict PII columns, expose safe public view
DROP POLICY IF EXISTS "Anyone can view published team members" ON public.team_members;

CREATE POLICY "Admins can view all team members"
ON public.team_members
FOR SELECT
USING (public.is_admin(auth.uid()));

CREATE OR REPLACE VIEW public.public_team_members
WITH (security_invoker = false) AS
SELECT id, name, role, image_url, education, about, whatsapp, website,
       rating, review_count, display_order, created_at, updated_at
FROM public.team_members
WHERE published = true;

GRANT SELECT ON public.public_team_members TO anon, authenticated;

-- 7. Tighten registrations INSERT (was WITH CHECK true)
DROP POLICY IF EXISTS "Allow public registration inserts" ON public.registrations;
CREATE POLICY "Allow public registration inserts"
ON public.registrations
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(trim(full_name)) BETWEEN 1 AND 100
  AND length(trim(email)) BETWEEN 5 AND 255
  AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  AND length(trim(phone)) BETWEEN 4 AND 30
  AND length(trim(grade)) BETWEEN 1 AND 50
);

-- 8. Lock down SECURITY DEFINER helper function execution
REVOKE EXECUTE ON FUNCTION public.approve_payment(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.reject_payment(uuid, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_super_admin(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_user_role(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.update_programs_updated_at() FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.approve_payment(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_payment(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role(uuid) TO authenticated;
