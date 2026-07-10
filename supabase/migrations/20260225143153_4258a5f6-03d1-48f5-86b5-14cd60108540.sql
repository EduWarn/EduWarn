
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
