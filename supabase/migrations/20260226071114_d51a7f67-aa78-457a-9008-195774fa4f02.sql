
-- Create separate content tables for each section

-- Hero content
CREATE TABLE public.hero_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  title text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);
ALTER TABLE public.hero_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view hero content" ON public.hero_content FOR SELECT USING (true);
CREATE POLICY "Admins can manage hero content" ON public.hero_content FOR ALL USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

-- Features content
CREATE TABLE public.features_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  title text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);
ALTER TABLE public.features_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view features content" ON public.features_content FOR SELECT USING (true);
CREATE POLICY "Admins can manage features content" ON public.features_content FOR ALL USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

-- CTA content
CREATE TABLE public.cta_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  title text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);
ALTER TABLE public.cta_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view cta content" ON public.cta_content FOR SELECT USING (true);
CREATE POLICY "Admins can manage cta content" ON public.cta_content FOR ALL USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

-- About story content
CREATE TABLE public.about_story_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  title text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);
ALTER TABLE public.about_story_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view about story" ON public.about_story_content FOR SELECT USING (true);
CREATE POLICY "Admins can manage about story" ON public.about_story_content FOR ALL USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

-- About values content
CREATE TABLE public.about_values_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  title text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);
ALTER TABLE public.about_values_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view about values" ON public.about_values_content FOR SELECT USING (true);
CREATE POLICY "Admins can manage about values" ON public.about_values_content FOR ALL USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

-- About partner content
CREATE TABLE public.about_partner_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  title text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);
ALTER TABLE public.about_partner_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view about partner" ON public.about_partner_content FOR SELECT USING (true);
CREATE POLICY "Admins can manage about partner" ON public.about_partner_content FOR ALL USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

-- Contact info content
CREATE TABLE public.contact_info_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  title text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);
ALTER TABLE public.contact_info_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view contact info" ON public.contact_info_content FOR SELECT USING (true);
CREATE POLICY "Admins can manage contact info" ON public.contact_info_content FOR ALL USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

-- Partner section content
CREATE TABLE public.partner_section_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  title text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);
ALTER TABLE public.partner_section_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view partner section" ON public.partner_section_content FOR SELECT USING (true);
CREATE POLICY "Admins can manage partner section" ON public.partner_section_content FOR ALL USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

-- Migrate data from site_content to new tables
INSERT INTO hero_content (content, title)
SELECT content, title FROM site_content WHERE section_key = 'hero';

INSERT INTO features_content (content, title)
SELECT content, title FROM site_content WHERE section_key = 'features';

INSERT INTO cta_content (content, title)
SELECT content, title FROM site_content WHERE section_key = 'cta';

INSERT INTO about_story_content (content, title)
SELECT content, title FROM site_content WHERE section_key = 'about_story';

INSERT INTO about_values_content (content, title)
SELECT content, title FROM site_content WHERE section_key = 'about_values';

INSERT INTO about_partner_content (content, title)
SELECT content, title FROM site_content WHERE section_key = 'about_partner';

INSERT INTO contact_info_content (content, title)
SELECT content, title FROM site_content WHERE section_key = 'contact_info';

INSERT INTO partner_section_content (content, title)
SELECT content, title FROM site_content WHERE section_key = 'partner_section';

-- Update blog_posts content column to support HTML (it's already text, just documenting)
-- Add a content_format column to track format type
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS content_format text NOT NULL DEFAULT 'html';
