
-- =========================================================
-- COURSE MODULES
-- =========================================================
CREATE TABLE public.course_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.course_modules TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.course_modules TO authenticated;
GRANT ALL ON public.course_modules TO service_role;

ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view modules of published courses"
  ON public.course_modules FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.courses c WHERE c.id = course_id AND c.published = true));

CREATE POLICY "Admins can manage modules"
  ON public.course_modules FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE INDEX idx_course_modules_course ON public.course_modules(course_id, sort_order);

CREATE TRIGGER update_course_modules_updated_at
  BEFORE UPDATE ON public.course_modules
  FOR EACH ROW EXECUTE FUNCTION public.update_programs_updated_at();

-- =========================================================
-- COURSE LESSONS
-- =========================================================
CREATE TABLE public.course_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES public.course_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  video_url TEXT,
  attachment_url TEXT,
  duration_minutes INTEGER,
  is_free_preview BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.course_lessons TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.course_lessons TO authenticated;
GRANT ALL ON public.course_lessons TO service_role;

ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view lessons of published courses"
  ON public.course_lessons FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.course_modules m
    JOIN public.courses c ON c.id = m.course_id
    WHERE m.id = module_id AND c.published = true
  ));

CREATE POLICY "Admins can manage lessons"
  ON public.course_lessons FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE INDEX idx_course_lessons_module ON public.course_lessons(module_id, sort_order);

CREATE TRIGGER update_course_lessons_updated_at
  BEFORE UPDATE ON public.course_lessons
  FOR EACH ROW EXECUTE FUNCTION public.update_programs_updated_at();

-- =========================================================
-- PAYMENT APPROVAL / REJECTION FUNCTIONS
-- =========================================================
CREATE OR REPLACE FUNCTION public.approve_payment(p_verification_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.payment_verifications%ROWTYPE;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only admins can approve payments';
  END IF;

  SELECT * INTO v_row FROM public.payment_verifications WHERE id = p_verification_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment verification not found';
  END IF;

  IF v_row.status = 'approved' THEN
    RETURN json_build_object('ok', true, 'already_approved', true);
  END IF;

  UPDATE public.payment_verifications
    SET status = 'approved'
  WHERE id = p_verification_id;

  INSERT INTO public.course_purchases (user_id, course_id, payment_status, purchased_at)
  VALUES (v_row.user_id, v_row.course_id::uuid, 'completed', now())
  ON CONFLICT DO NOTHING;

  RETURN json_build_object('ok', true, 'user_id', v_row.user_id, 'course_id', v_row.course_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.reject_payment(p_verification_id UUID, p_reason TEXT DEFAULT NULL)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only admins can reject payments';
  END IF;

  UPDATE public.payment_verifications
    SET status = 'rejected',
        rejection_reason = COALESCE(p_reason, rejection_reason)
  WHERE id = p_verification_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment verification not found';
  END IF;

  RETURN json_build_object('ok', true);
END;
$$;

REVOKE ALL ON FUNCTION public.approve_payment(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.reject_payment(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.approve_payment(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_payment(UUID, TEXT) TO authenticated;

-- Ensure the rejection_reason column exists (safe if already there)
ALTER TABLE public.payment_verifications ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
