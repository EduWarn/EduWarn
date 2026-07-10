
-- Undo the intermediate views (SECURITY DEFINER views flagged by linter)
DROP VIEW IF EXISTS public.course_lessons_public;
DROP VIEW IF EXISTS public.public_team_members;

-- ---------------------------------------------------------------------
-- 1. Split sensitive lesson data into its own gated table
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.course_lesson_content (
  lesson_id UUID PRIMARY KEY REFERENCES public.course_lessons(id) ON DELETE CASCADE,
  video_url TEXT,
  content TEXT,
  attachment_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.course_lesson_content TO authenticated;
GRANT ALL ON public.course_lesson_content TO service_role;

ALTER TABLE public.course_lesson_content ENABLE ROW LEVEL SECURITY;

-- Only admins or enrolled students (or free-preview lessons) may read.
CREATE POLICY "Lesson content readable with access"
ON public.course_lesson_content
FOR SELECT
USING (
  public.is_admin(auth.uid())
  OR EXISTS (
    SELECT 1
    FROM public.course_lessons l
    JOIN public.course_modules m ON m.id = l.module_id
    JOIN public.courses c ON c.id = m.course_id
    WHERE l.id = course_lesson_content.lesson_id
      AND c.published = true
      AND (
        l.is_free_preview = true
        OR EXISTS (
          SELECT 1 FROM public.course_purchases cp
          WHERE cp.user_id = auth.uid()
            AND cp.course_id = c.id::text
            AND cp.payment_status = 'completed'
        )
      )
  )
);

CREATE POLICY "Admins manage lesson content"
ON public.course_lesson_content
FOR ALL
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Backfill data
INSERT INTO public.course_lesson_content (lesson_id, video_url, content, attachment_url)
SELECT id, video_url, content, attachment_url
FROM public.course_lessons
ON CONFLICT (lesson_id) DO NOTHING;

-- Drop sensitive columns from course_lessons
ALTER TABLE public.course_lessons
  DROP COLUMN IF EXISTS video_url,
  DROP COLUMN IF EXISTS content,
  DROP COLUMN IF EXISTS attachment_url;

-- Restore broad public SELECT on lesson metadata now that sensitive cols are gone
DROP POLICY IF EXISTS "Lessons visible with access" ON public.course_lessons;
CREATE POLICY "Anyone can view lesson metadata of published courses"
ON public.course_lessons
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.course_modules m
    JOIN public.courses c ON c.id = m.course_id
    WHERE m.id = course_lessons.module_id AND c.published = true
  )
);

-- Trigger to keep updated_at fresh on content
CREATE OR REPLACE FUNCTION public.touch_course_lesson_content()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS course_lesson_content_touch ON public.course_lesson_content;
CREATE TRIGGER course_lesson_content_touch
BEFORE UPDATE ON public.course_lesson_content
FOR EACH ROW EXECUTE FUNCTION public.touch_course_lesson_content();

REVOKE EXECUTE ON FUNCTION public.touch_course_lesson_content() FROM PUBLIC, anon, authenticated;

-- ---------------------------------------------------------------------
-- 2. team_members: split PII (email, phone) into admin-only table
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.team_member_contacts (
  team_member_id UUID PRIMARY KEY REFERENCES public.team_members(id) ON DELETE CASCADE,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.team_member_contacts TO authenticated;
GRANT ALL ON public.team_member_contacts TO service_role;

ALTER TABLE public.team_member_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins manage team contacts"
ON public.team_member_contacts
FOR ALL
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Backfill from existing team_members
INSERT INTO public.team_member_contacts (team_member_id, email, phone)
SELECT id, email, phone FROM public.team_members
ON CONFLICT (team_member_id) DO NOTHING;

-- Drop PII columns from team_members
ALTER TABLE public.team_members
  DROP COLUMN IF EXISTS email,
  DROP COLUMN IF EXISTS phone;

-- Restore original public SELECT policy (whatsapp stays as it's public business contact)
DROP POLICY IF EXISTS "Admins can view all team members" ON public.team_members;
CREATE POLICY "Anyone can view published team members"
ON public.team_members
FOR SELECT
USING (published = true);
