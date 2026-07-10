
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
