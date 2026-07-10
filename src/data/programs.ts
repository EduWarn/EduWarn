export type Program = {
  slug: string;
  title: string;
  type: 'Workshop' | 'Event' | 'Bootcamp' | 'Seminar';
  date: string;
  location: string;
  description: string;
  highlights: string[];
  image: string;
};

export const programs: Program[] = [
  {
    slug: 'see-success-bootcamp',
    title: 'SEE Success Bootcamp',
    type: 'Bootcamp',
    date: 'Ongoing — Every Saturday',
    location: 'New Baneshwor, Kathmandu',
    description:
      'An intensive weekend bootcamp helping Grade 10 students master core SEE subjects with mock tests, doubt-clearing sessions and personalized feedback.',
    highlights: ['Weekly mock tests', 'Subject-wise revision', 'Doubt solving with expert tutors'],
    image: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1200&q=80',
  },
  {
    slug: 'career-guidance-seminar',
    title: 'Career Guidance Seminar',
    type: 'Seminar',
    date: 'Monthly',
    location: 'Online & Onsite',
    description:
      'Free monthly seminar where students and parents meet career counselors to explore academic and professional pathways after SEE and +2.',
    highlights: ['One-on-one counseling', 'Stream selection guidance', 'Scholarship insights'],
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80',
  },
  {
    slug: 'ielts-prep-workshop',
    title: 'IELTS Preparation Workshop',
    type: 'Workshop',
    date: 'First Sunday of every month',
    location: 'EduWarn Nepal Campus',
    description:
      'Hands-on workshop covering all four IELTS modules with timed practice, speaking simulations and band-improvement strategies.',
    highlights: ['Speaking mock interviews', 'Writing band evaluation', 'Listening & reading drills'],
    image: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=1200&q=80',
  },
  {
    slug: 'parent-teacher-meet',
    title: 'Parent–Teacher Meet',
    type: 'Event',
    date: 'Quarterly',
    location: 'EduWarn Nepal Campus',
    description:
      'A quarterly meet to share student progress, discuss learning plans and align home support with classroom efforts.',
    highlights: ['Progress reports', 'Personalized study plans', 'Q&A with tutors'],
    image: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1200&q=80',
  },
  {
    slug: 'loksewa-crash-course',
    title: 'LokSewa Crash Course',
    type: 'Bootcamp',
    date: 'Next batch starting soon',
    location: 'Kathmandu',
    description:
      'A focused crash course preparing candidates for LokSewa exams with curated notes, daily quizzes and previous-year solutions.',
    highlights: ['Daily MCQ tests', 'Current affairs sessions', 'Previous year analysis'],
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
  },
  {
    slug: 'scholarship-test',
    title: 'Annual Scholarship Test',
    type: 'Event',
    date: 'Announced yearly',
    location: 'EduWarn Nepal Campus',
    description:
      'Our annual scholarship test rewards deserving students with up to 100% fee waivers on selected courses.',
    highlights: ['Up to 100% scholarship', 'Open to all grades', 'Merit-based selection'],
    image: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&w=1200&q=80',
  },
];
