-- ============================================================
-- Base: create admins table (must exist before policies below)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.admins (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT ON public.admins TO authenticated;
GRANT ALL ON public.admins TO service_role;

-- ============================================================
-- Base tables referenced by later migrations (create first)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  image_url TEXT,
  duration TEXT,
  level TEXT,
  instructor TEXT,
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.courses TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.courses TO authenticated;
GRANT ALL ON public.courses TO service_role;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image TEXT,
  author_id UUID NOT NULL,
  published BOOLEAN NOT NULL DEFAULT false,
  tags TEXT[] DEFAULT '{}'::text[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.blog_posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_posts TO authenticated;
GRANT ALL ON public.blog_posts TO service_role;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  whatsapp_opted_in BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.contacts TO anon, authenticated;
GRANT ALL ON public.contacts TO service_role;

CREATE TABLE IF NOT EXISTS public.registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  grade TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.registrations TO anon, authenticated;
GRANT SELECT ON public.registrations TO authenticated;
GRANT ALL ON public.registrations TO service_role;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.course_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  course_id TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  purchased_at TIMESTAMPTZ DEFAULT now()
);
GRANT SELECT ON public.course_purchases TO authenticated;
GRANT ALL ON public.course_purchases TO service_role;
ALTER TABLE public.course_purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own purchases" ON public.course_purchases
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.payment_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  course_id TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  transaction_id TEXT NOT NULL,
  screenshot_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.payment_verifications TO authenticated;
GRANT ALL ON public.payment_verifications TO service_role;
ALTER TABLE public.payment_verifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own verifications" ON public.payment_verifications
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- get_user_role helper referenced by later REVOKE/GRANT
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$ SELECT role FROM public.admins WHERE id = user_id LIMIT 1; $$;

-- Fix infinite recursion in admin RLS policies by dropping problematic policies
-- and creating simpler, non-recursive ones

-- Drop all existing admin policies that cause recursion
DROP POLICY IF EXISTS "Admins can manage admin users" ON public.admins;
DROP POLICY IF EXISTS "Super admins can manage all admin records" ON public.admins;
DROP POLICY IF EXISTS "Super admins can view all admin records" ON public.admins;
DROP POLICY IF EXISTS "Users can insert their own admin record" ON public.admins;
DROP POLICY IF EXISTS "Users can update their own admin record" ON public.admins;
DROP POLICY IF EXISTS "Users can view their own admin record" ON public.admins;

-- Create new security definer function that doesn't cause recursion
CREATE OR REPLACE FUNCTION public.is_super_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  -- Check if user is in predefined super admin list
  SELECT user_id IN (
    SELECT auth.uid() 
    WHERE auth.jwt() ->> 'email' IN ('admin@sajilotuition.com', 'sabinbd7@gmail.com')
  );
$$;

-- Create simple RLS policies without recursion
CREATE POLICY "Allow super admins full access" ON public.admins
  FOR ALL 
  USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Users can insert their own admin record" ON public.admins
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view their own admin record" ON public.admins
  FOR SELECT 
  USING (auth.uid() = id OR public.is_super_admin(auth.uid()));

-- Enable RLS
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
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

-- Fix: Restrict registration data to admins only
DROP POLICY IF EXISTS "Only authenticated users can view registrations" ON public.registrations;

CREATE POLICY "Only admins can view registrations"
  ON public.registrations FOR SELECT
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

-- Create team_members table
CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  image_url TEXT,
  education TEXT,
  about TEXT,
  email TEXT,
  phone TEXT,
  whatsapp TEXT,
  website TEXT,
  rating NUMERIC DEFAULT 5.0,
  review_count INTEGER DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Public can view published members
CREATE POLICY "Anyone can view published team members"
  ON public.team_members FOR SELECT
  USING (published = true);

-- Admins can manage
CREATE POLICY "Admins can manage team members"
  ON public.team_members FOR ALL
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

-- Seed existing team data
INSERT INTO public.team_members (name, role, image_url, education, about, email, phone, whatsapp, website, rating, review_count, display_order) VALUES
('PS Tolange', 'Chief Learning Strategist (CLS)', '/team-members/5c2af59c-ea32-4878-98db-7db772585035.png', 'Bachelor''s Degree', 'PS leads innovative curriculum design and learning strategies, ensuring teaching methods are tailored to student needs and aligned with the latest educational research.', 'ps@sajilotuition.com', '+977-9816254775', '9816254775', 'https://sajilotuition.com', 4.9, 47, 1),
('Sabin Budhathoki', 'Chief Academic Officer', '/team-members/a6c618f3-c497-4279-8185-a6a47884ca96.png', 'Bachelor''s Degree', 'Sabin mentors students, tracks their progress, and creates customized learning plans—ensuring academic success and building strong communication with parents.', 'sabin@sajilotuition.com', '+977-9840034153', '9840034153', 'https://sajilotuition.com', 4.8, 38, 2),
('Ashbin Adhikari', 'Digital Engagement Maestro (DEM)', '/team-members/7c24ece9-8463-4674-934d-1a1d5b54cbd8.png', 'Bachelor''s Degree', 'Ashbin handles our online presence, creating content that connects. From study reels to social posts, he makes EduWarn Nepal''s voice heard and loved.', 'ashbin@sajilotuition.com', '+977-9816254775', '9816254775', 'https://sajilotuition.com', 5.0, 52, 3),
('Milan Khanal', 'Operations & Logistics Commander (OLC)', NULL, 'Bachelor''s Degree', 'Milan keeps everything running smoothly—from scheduling and payments to class coordination—ensuring a seamless learning experience for all.', 'milan@sajilotuition.com', '+977-9816254775', '9816254775', 'https://sajilotuition.com', 4.7, 29, 4),
('Rojan Tamang', 'Community Outreach Ambassador (COA)', NULL, 'Bachelor''s Degree', 'Rojan connects EduWarn Nepal with communities through partnerships, events, and local outreach that strengthen our mission and brand.', 'rojan@sajilotuition.com', '+977-9816254775', '9816254775', 'https://sajilotuition.com', 4.9, 34, 5),
('Prashan Pariyar', 'Creative Content Architect (CCA)', NULL, 'Bachelor''s Degree', 'Prashan turns ideas into engaging study materials—designing worksheets, flashcards, and creative tools that make learning easy and fun.', 'prashan@sajilotuition.com', '+977-9816254775', '9816254775', 'https://sajilotuition.com', 4.8, 31, 6),
('Rupesh Regmi', 'Growth & Innovation Leader (GIL)', '/team-members/9c6eb845-bcef-4899-a49c-5f12e81003f4.png', 'Bachelor''s Degree', 'Rupesh explores new trends in education, plans expansion strategies, and ensures EduWarn Nepal stays ahead in the evolving learning landscape.', 'rupesh@sajilotuition.com', '+977-9816254775', '9816254775', 'https://sajilotuition.com', 4.9, 44, 7);

-- Seed sample courses matching the original hardcoded data
INSERT INTO public.courses (title, description, price, discount_price, rating, students_count, level, subject, duration, seats_left, published, image_url, instructor) VALUES
('SEE Mathematics Complete Course', 'Master all math concepts required for SEE examination with practical examples and problem-solving techniques.', 8000, 6000, 4.8, 235, 'SEE', 'Mathematics', '3 months', 5, true, 'https://placehold.co/600x400/1E2A78/FFFFFF?text=Mathematics', 'Ramesh Sharma'),
('SEE Science Full Preparation', 'Comprehensive science course covering physics, chemistry and biology with lab experiments and exam strategies.', 9000, 7500, 4.7, 198, 'SEE', 'Science', '4 months', 3, true, 'https://placehold.co/600x400/1E2A78/FFFFFF?text=Science', 'Bikash Thapa'),
('Grade 11 Physics Foundation', 'Build a strong foundation in physics concepts with practical applications and problem-solving approach.', 7500, 6500, 4.9, 142, '11', 'Physics', '4 months', 8, true, 'https://placehold.co/600x400/1E2A78/FFFFFF?text=Physics', 'Arun Paudel'),
('Grade 12 Chemistry Advanced', 'Advanced chemistry concepts for NEB Grade 12 students with organic, inorganic and physical chemistry coverage.', 8500, 7000, 4.6, 167, '12', 'Chemistry', '5 months', 10, true, 'https://placehold.co/600x400/1E2A78/FFFFFF?text=Chemistry', 'Sita Adhikari'),
('SEE English Language Mastery', 'Improve your English reading, writing, and comprehension skills for the SEE examination.', 6000, 4500, 4.5, 312, 'SEE', 'English', '3 months', 15, true, 'https://placehold.co/600x400/1E2A78/FFFFFF?text=English', 'Asmita Karki'),
('Grade 11 Mathematics', 'Complete Grade 11 mathematics course covering sets, functions, trigonometry, coordinate geometry and more.', 7000, 5500, 4.7, 189, '11', 'Mathematics', '4 months', 12, true, 'https://placehold.co/600x400/1E2A78/FFFFFF?text=Math+11', 'Ramesh Sharma');

-- Create images bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Ensure payment-screenshots bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-screenshots', 'payment-screenshots', false)
ON CONFLICT (id) DO NOTHING;

-- Images bucket: public read
CREATE POLICY "Public can view images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'images');

-- Images bucket: authenticated upload with file type restriction
CREATE POLICY "Authenticated users can upload images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'images' AND
    (storage.extension(name)) IN ('jpg', 'jpeg', 'png', 'gif', 'webp', 'svg')
  );

-- Images bucket: authenticated update
CREATE POLICY "Authenticated users can update images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'images');

-- Payment screenshots: users see their own + admins see all
CREATE POLICY "Users can view own payment screenshots"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'payment-screenshots' AND
    (auth.uid()::text = (storage.foldername(name))[1] OR
     EXISTS (SELECT 1 FROM public.admins WHERE admins.id = auth.uid()))
  );

-- Payment screenshots: users upload their own
CREATE POLICY "Users can upload own payment screenshots"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'payment-screenshots' AND
    auth.uid()::text = (storage.foldername(name))[1] AND
    (storage.extension(name)) IN ('jpg', 'jpeg', 'png', 'pdf')
  );

-- Add length and format constraints to registrations table
ALTER TABLE public.registrations
  ADD CONSTRAINT check_full_name_length CHECK (length(full_name) BETWEEN 1 AND 100),
  ADD CONSTRAINT check_email_length CHECK (length(email) BETWEEN 5 AND 254),
  ADD CONSTRAINT check_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  ADD CONSTRAINT check_phone_length CHECK (length(phone) BETWEEN 5 AND 20),
  ADD CONSTRAINT check_grade_length CHECK (length(grade) BETWEEN 1 AND 50);

-- Also add constraints to contacts table for defense in depth
ALTER TABLE public.contacts
  ADD CONSTRAINT check_contact_name_length CHECK (length(full_name) BETWEEN 1 AND 100),
  ADD CONSTRAINT check_contact_email_length CHECK (length(email) BETWEEN 5 AND 254),
  ADD CONSTRAINT check_contact_phone_length CHECK (length(phone) BETWEEN 5 AND 20),
  ADD CONSTRAINT check_contact_subject_length CHECK (length(subject) BETWEEN 1 AND 200),
  ADD CONSTRAINT check_contact_message_length CHECK (length(message) BETWEEN 1 AND 5000);

-- Fix insert_contact function to have proper search_path (fixes SUPA_function_search_path_mutable)
CREATE OR REPLACE FUNCTION public.insert_contact(p_full_name text, p_email text, p_phone text, p_subject text, p_message text, p_whatsapp_opted_in boolean DEFAULT false)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO public.contacts (
    full_name, email, phone, subject, message, whatsapp_opted_in
  ) VALUES (
    p_full_name, p_email, p_phone, p_subject, p_message, p_whatsapp_opted_in
  )
  RETURNING id INTO v_id;
  
  RETURN json_build_object('id', v_id);
END;
$function$;

-- Fix is_admin function search_path
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE
 SECURITY DEFINER
 SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admins 
    WHERE id = user_id
  );
$$;

-- CRITICAL: Remove the dangerous policy that allows ANY user to insert themselves as admin
DROP POLICY IF EXISTS "Users can insert their own admin record" ON public.admins;

-- Create a site_content table for dynamic page content
CREATE TABLE public.site_content (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_key text NOT NULL UNIQUE,
  title text,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view site content"
  ON public.site_content FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage site content"
  ON public.site_content FOR ALL
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

-- Insert current site content data
INSERT INTO public.site_content (section_key, title, content) VALUES
('contact_info', 'Contact Information', '{
  "address": "Putalisadak, Kathmandu, Nepal",
  "address_detail": "Near Kumari Bank, 2nd Floor",
  "phone": "+977 9816254775",
  "whatsapp": "9779816254775",
  "email": "info@sajilotuition.com",
  "support_email": "support@sajilotuition.com",
  "office_hours_weekday": "Sunday to Friday: 8:00 AM - 6:00 PM",
  "office_hours_weekend": "Saturday: 9:00 AM - 2:00 PM",
  "map_embed_url": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3532.2715204568484!2d85.31415931506156!3d27.70496698279232!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb19009f2d769f%3A0xc5670a9173e161d0!2sPutalisadak%2C%20Kathmandu%2044600!5e0!3m2!1sen!2snp!4v1634720778548!5m2!1sen!2snp"
}'::jsonb),
('about_story', 'Our Story', '{
  "paragraphs": [
    "Founded in 2024, EduWarn Nepal began with a simple mission: to make quality education accessible to all Nepali students, regardless of their background or location. What started as a small tutoring center in Kathmandu has grown into Nepal''s premier education platform.",
    "Our journey has been driven by a commitment to excellence and a deep belief in the transformative power of education. Over the years, we''ve helped thousands of students achieve their academic goals and build a strong foundation for their future careers.",
    "Today, EduWarn Nepal stands as a testament to innovation in education, combining traditional teaching wisdom with modern technology to deliver results-oriented learning experiences."
  ]
}'::jsonb),
('about_partner', 'Our Partner', '{
  "name": "EduWarn Nepal",
  "description": "We''re proud to partner with EduWarn Nepal, a leading educational organization dedicated to empowering students through innovative learning solutions.",
  "logo_url": "/team-members/235124e9-bd6a-4b9c-94cb-01a562ef1798.png",
  "website_url": "https://sabinbudhathoki.com.np"
}'::jsonb),
('about_values', 'Our Values', '{
  "values": [
    {"title": "Excellence", "description": "We strive for excellence in every aspect of our educational services."},
    {"title": "Accessibility", "description": "Quality education should be accessible to all students."},
    {"title": "Innovation", "description": "We continuously innovate and leverage technology to enhance learning."}
  ]
}'::jsonb),
('features', 'Why Choose EduWarn Nepal?', '{
  "subtitle": "We combine quality education with innovative teaching methods to deliver exceptional results",
  "features": [
    {"icon": "Award", "title": "Expert Teachers", "description": "Learn from experienced educators with proven track records of student success"},
    {"icon": "BookOpen", "title": "Comprehensive Material", "description": "Access complete study materials, notes, question banks and practice tests"},
    {"icon": "TrendingUp", "title": "Performance Tracking", "description": "Monitor your progress with detailed analytics and improvement metrics"},
    {"icon": "Users", "title": "Small Batch Size", "description": "Personalized attention with limited students per class for better learning"},
    {"icon": "CheckCircle", "title": "Guaranteed Results", "description": "Our structured approach ensures excellent academic performance"},
    {"icon": "Calendar", "title": "Flexible Schedule", "description": "Choose from multiple batches to fit your convenience and learning pace"}
  ],
  "guarantee_title": "SEE 75%+ Marks Guarantee",
  "guarantee_description": "We''re so confident in our teaching methodology that we guarantee a minimum of 75% marks in your SEE exams or get your money back."
}'::jsonb),
('cta', 'Call to Action', '{
  "title": "Ready to Transform Your Academic Performance?",
  "description": "Join EduWarn Nepal today and experience the difference in your grades and confidence",
  "benefits": ["No registration fee", "Flexible payment options", "Money-back guarantee"]
}'::jsonb),
('partner_section', 'Partner Section', '{
  "name": "EduWarn Nepal",
  "description": "We''re proud to partner with EduWarn Nepal, a leading educational organization dedicated to empowering students through innovative learning solutions. Together, we''re shaping the future of education in Nepal.",
  "logo_url": "/team-members/235124e9-bd6a-4b9c-94cb-01a562ef1798.png",
  "website_url": "https://sabinbudhathoki.com.np"
}'::jsonb);

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

-- Fix 1: Ensure dangerous INSERT policy on admins is dropped and proper policies exist
DROP POLICY IF EXISTS "Users can insert their own admin record" ON public.admins;
DROP POLICY IF EXISTS "Allow super admins full access" ON public.admins;
DROP POLICY IF EXISTS "Users can view their own admin record" ON public.admins;

-- Recreate proper policies: super admins get full access, users can only view own record
CREATE POLICY "Super admins full access"
  ON public.admins FOR ALL
  USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Users can view own admin record"
  ON public.admins FOR SELECT
  USING (auth.uid() = id);

-- Fix 2: Restrict images storage bucket updates to admins only
DROP POLICY IF EXISTS "Authenticated users can update images" ON storage.objects;

CREATE POLICY "Only admins can update images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'images' AND
    EXISTS (SELECT 1 FROM public.admins WHERE admins.id = auth.uid())
  );

-- Fix 3: Add server-side validation to insert_contact function
CREATE OR REPLACE FUNCTION public.insert_contact(
  p_full_name text, p_email text, p_phone text, 
  p_subject text, p_message text, p_whatsapp_opted_in boolean DEFAULT false
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_id UUID;
BEGIN
  -- Validate inputs server-side
  IF length(trim(p_full_name)) < 1 OR length(p_full_name) > 100 THEN
    RAISE EXCEPTION 'Invalid name';
  END IF;
  
  IF p_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email';
  END IF;
  
  IF length(trim(p_phone)) < 1 OR length(p_phone) > 20 THEN
    RAISE EXCEPTION 'Invalid phone';
  END IF;
  
  IF length(trim(p_subject)) < 1 OR length(p_subject) > 200 THEN
    RAISE EXCEPTION 'Invalid subject';
  END IF;
  
  IF length(trim(p_message)) < 1 OR length(p_message) > 5000 THEN
    RAISE EXCEPTION 'Invalid message';
  END IF;

  INSERT INTO public.contacts (
    full_name, email, phone, subject, message, whatsapp_opted_in
  ) VALUES (
    trim(p_full_name), trim(p_email), trim(p_phone), trim(p_subject), trim(p_message), p_whatsapp_opted_in
  )
  RETURNING id INTO v_id;
  
  RETURN json_build_object('id', v_id);
END;
$function$;

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
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;DROP POLICY IF EXISTS "Users can update their own purchases" ON public.course_purchases;

CREATE POLICY "Admins can manage course purchases"
ON public.course_purchases
FOR ALL
USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));-- Fix 1: Update is_super_admin to use admins table instead of hardcoded emails
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
  );CREATE TABLE public.programs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL DEFAULT 'Event',
  description TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  date TEXT,
  location TEXT,
  featured BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.programs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.programs TO authenticated;
GRANT ALL ON public.programs TO service_role;

ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active programs"
  ON public.programs FOR SELECT
  USING (is_active = true OR public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert programs"
  ON public.programs FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update programs"
  ON public.programs FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete programs"
  ON public.programs FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE OR REPLACE FUNCTION public.update_programs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_programs_updated_at
  BEFORE UPDATE ON public.programs
  FOR EACH ROW EXECUTE FUNCTION public.update_programs_updated_at();

CREATE INDEX programs_active_sort_idx ON public.programs (is_active, sort_order, created_at DESC);
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
