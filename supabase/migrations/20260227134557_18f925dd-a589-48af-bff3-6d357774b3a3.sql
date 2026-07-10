
-- Drop the redundant site_content table (all data moved to per-section tables)
DROP TABLE IF EXISTS public.site_content;

-- Create social_links_content table
CREATE TABLE public.social_links_content (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  title text,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid
);

ALTER TABLE public.social_links_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view social links" ON public.social_links_content
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage social links" ON public.social_links_content
  FOR ALL USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

-- Seed with default social links
INSERT INTO public.social_links_content (title, content) VALUES (
  'Social Media Links',
  '{
    "facebook": "https://facebook.com/sajilotuition",
    "twitter": "https://twitter.com/sajilotuition",
    "instagram": "https://instagram.com/sajilotuition",
    "youtube": "https://youtube.com/@sajilotuition",
    "tiktok": "",
    "linkedin": ""
  }'::jsonb
);
