
-- Create testimonials table for student success stories
CREATE TABLE public.testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  image_url TEXT,
  text TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Public can read published testimonials
CREATE POLICY "Anyone can view published testimonials"
  ON public.testimonials FOR SELECT
  USING (published = true);

-- Admins can manage testimonials
CREATE POLICY "Admins can manage testimonials"
  ON public.testimonials FOR ALL
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

-- Add missing columns to courses table
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS discount_price NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rating NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS students_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS subject TEXT,
  ADD COLUMN IF NOT EXISTS seats_left INTEGER DEFAULT 10;

-- Public can read published courses
CREATE POLICY "Anyone can view published courses"
  ON public.courses FOR SELECT
  USING (published = true);

-- Public can read published blog posts
CREATE POLICY "Anyone can view published blog posts"
  ON public.blog_posts FOR SELECT
  USING (published = true);

-- Insert sample testimonials
INSERT INTO public.testimonials (name, role, text, rating, image_url) VALUES
  ('Aarav Sharma', 'SEE Student, 2023', 'Joining EduWarn Nepal was the best decision I made for my SEE preparation. The teachers explained complex concepts in simple ways, and the practice tests really helped me score 85% in my exams!', 5, 'https://placehold.co/100/1E2A78/FFFFFF?text=AS'),
  ('Srishti Poudel', 'Grade 11 Student', 'The physics course at EduWarn Nepal made a huge difference in my understanding. Concepts that seemed impossible before are now clear to me. Their teaching methodology is excellent!', 5, 'https://placehold.co/100/1E2A78/FFFFFF?text=SP'),
  ('Rohan Thapa', 'SEE Topper, 2022', 'I scored 92% in SEE thanks to EduWarn Nepal''s comprehensive course materials and dedicated teachers. Their doubt-clearing sessions and regular tests were extremely helpful.', 5, 'https://placehold.co/100/1E2A78/FFFFFF?text=RT');
