
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Loader2, GraduationCap, BriefcaseIcon, BookOpen, Lightbulb, Target, TrendingUp, ArrowRight, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Helmet } from 'react-helmet-async';

const careerPaths = {
  SEE: {
    science: [
      { title: 'Science Stream (Grade 11-12)', desc: 'Physics, Chemistry, Biology/Math — gateway to medicine, engineering, research', icon: BookOpen, color: 'text-blue-600 bg-blue-50' },
      { title: 'Computer Science', desc: 'Programming, software dev, IT fundamentals — high demand career path', icon: Lightbulb, color: 'text-purple-600 bg-purple-50' },
      { title: 'Technical Education', desc: 'Diploma programs for faster entry into technical job market', icon: BriefcaseIcon, color: 'text-green-600 bg-green-50' },
    ],
    management: [
      { title: 'Management Stream (Grade 11-12)', desc: 'Business Studies, Accounting, Economics — business & finance careers', icon: TrendingUp, color: 'text-amber-600 bg-amber-50' },
      { title: 'Hotel Management', desc: 'Hospitality, customer service — tourism & restaurant industry', icon: BriefcaseIcon, color: 'text-green-600 bg-green-50' },
      { title: 'Media & Communication', desc: 'Journalism, digital media — content creation & PR careers', icon: Lightbulb, color: 'text-purple-600 bg-purple-50' },
    ],
    arts: [
      { title: 'Humanities Stream', desc: 'Language, Social Studies, Psychology — writing, social work, education', icon: BookOpen, color: 'text-blue-600 bg-blue-50' },
      { title: 'Fine Arts', desc: 'Painting, sculpture, digital arts — graphic design, animation', icon: Sparkles, color: 'text-pink-600 bg-pink-50' },
      { title: 'Performing Arts', desc: 'Music, dance, theater, film — performance, teaching, production', icon: Lightbulb, color: 'text-purple-600 bg-purple-50' },
    ],
  },
  '11': {
    science: [
      { title: 'Medical Field', desc: 'Doctor, Dentist, Pharmacist, Nursing — requires dedication to lengthy education', icon: Target, color: 'text-red-600 bg-red-50' },
      { title: 'Engineering', desc: 'Civil, Mechanical, Electrical, Computer — problem-solving & technical skills', icon: Lightbulb, color: 'text-purple-600 bg-purple-50' },
      { title: 'Information Technology', desc: 'Software Dev, Data Science, AI/ML — programming & analytical skills', icon: TrendingUp, color: 'text-amber-600 bg-amber-50' },
    ],
    management: [
      { title: 'Business Administration', desc: 'Management, Marketing, HR — leadership & strategic thinking', icon: BriefcaseIcon, color: 'text-green-600 bg-green-50' },
      { title: 'Finance & Banking', desc: 'Accounting, Investment, Banking — analytical & quantitative skills', icon: TrendingUp, color: 'text-amber-600 bg-amber-50' },
      { title: 'Entrepreneurship', desc: 'Start your own business — innovation & risk management', icon: Sparkles, color: 'text-pink-600 bg-pink-50' },
    ],
    arts: [
      { title: 'Social Sciences', desc: 'Psychology, Sociology, Political Science — research & counseling', icon: BookOpen, color: 'text-blue-600 bg-blue-50' },
      { title: 'Language & Communication', desc: 'Journalism, Content Writing, Translation — build a written portfolio', icon: Lightbulb, color: 'text-purple-600 bg-purple-50' },
      { title: 'Education', desc: 'Teaching, Educational Administration — patience & communication skills', icon: GraduationCap, color: 'text-primary bg-primary/10' },
    ],
  },
  '12': {
    science: [
      { title: 'University Education', desc: "Bachelor's in Science, Medicine, Engineering — scholarship opportunities", icon: GraduationCap, color: 'text-primary bg-primary/10' },
      { title: 'Technical Diploma', desc: 'Faster entry to job market with practical skill development', icon: BriefcaseIcon, color: 'text-green-600 bg-green-50' },
      { title: 'Research Opportunities', desc: 'Lab assistant, research projects — build specialized knowledge', icon: Target, color: 'text-red-600 bg-red-50' },
    ],
    management: [
      { title: 'BBA / BBS Programs', desc: 'Business Administration, Finance, Marketing — build business acumen', icon: TrendingUp, color: 'text-amber-600 bg-amber-50' },
      { title: 'Professional Certifications', desc: 'CA, ACCA, Digital Marketing — industry recognized credentials', icon: Target, color: 'text-red-600 bg-red-50' },
      { title: 'Startup & Business', desc: 'Launch your venture — incubators & online business opportunities', icon: Sparkles, color: 'text-pink-600 bg-pink-50' },
    ],
    arts: [
      { title: 'Liberal Arts Degree', desc: 'Bachelor in Arts, Fine Arts, Social Sciences — interdisciplinary options', icon: BookOpen, color: 'text-blue-600 bg-blue-50' },
      { title: 'Creative Industry', desc: 'Content creation, design, media production — build your portfolio', icon: Sparkles, color: 'text-pink-600 bg-pink-50' },
      { title: 'Public Service', desc: 'Government exams, NGO work, community development', icon: BriefcaseIcon, color: 'text-green-600 bg-green-50' },
    ],
  },
};

const scienceKeywords = ['science', 'math', 'physics', 'chemistry', 'biology', 'engineering', 'medicine', 'doctor', 'technology', 'computer', 'programming'];
const managementKeywords = ['business', 'management', 'accounting', 'finance', 'economics', 'marketing', 'entrepreneur', 'hotel', 'tourism', 'banking'];

function detectCategory(interests: string): 'science' | 'management' | 'arts' {
  const lower = interests.toLowerCase();
  if (scienceKeywords.some(k => lower.includes(k))) return 'science';
  if (managementKeywords.some(k => lower.includes(k))) return 'management';
  return 'arts';
}

const Career = () => {
  const [interests, setInterests] = useState('');
  const [academicLevel, setAcademicLevel] = useState('');
  const [skills, setSkills] = useState('');
  const [results, setResults] = useState<typeof careerPaths['SEE']['science'] | null>(null);
  const [category, setCategory] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!interests || !academicLevel) {
      toast({ title: "Missing information", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    
    setIsLoading(true);
    setTimeout(() => {
      const cat = detectCategory(interests);
      setCategory(cat);
      const level = academicLevel as keyof typeof careerPaths;
      setResults(careerPaths[level]?.[cat] || careerPaths['SEE']['arts']);
      setIsLoading(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Career Guidance Nepal | Free Learning & Future Paths | EduWarn Nepal</title>
        <meta name="description" content="Get personalized career guidance and explore practical learning paths for SEE, Grade 11, and Grade 12 students in Nepal." />
        <link rel="canonical" href="https://eduwarnnepal.com/career" />
      </Helmet>
      <Navbar />
      
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary via-primary/95 to-primary/80 text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE4YzAtOS45NC04LjA2LTE4LTE4LTE4UzAgOC4wNiAwIDE4czguMDYgMTggMTggMTggMTgtOC4wNiAxOC0xOCIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white/15 p-3 rounded-xl backdrop-blur-sm">
              <GraduationCap className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Career Guidance</h1>
              <p className="text-white/80">Explore your future with practical, free learning support</p>
            </div>
          </div>
          <p className="text-lg text-white/90 max-w-2xl mt-2">
            Get personalized career recommendations and learn how free, practical resources can support your growth as a Nepali student.
          </p>
        </div>
      </div>
      
      <div className="flex-grow py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Form - 2 columns */}
            <div className="lg:col-span-2">
              <Card className="sticky top-24 border-2 border-primary/10">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">Career Advisor</CardTitle>
                  </div>
                  <CardDescription>Tell us about yourself</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Current Academic Level *</label>
                    <Select value={academicLevel} onValueChange={setAcademicLevel}>
                      <SelectTrigger><SelectValue placeholder="Select your level" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SEE">SEE / Grade 10</SelectItem>
                        <SelectItem value="11">Grade 11</SelectItem>
                        <SelectItem value="12">Grade 12</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Your Interests *</label>
                    <Textarea
                      placeholder="E.g., Mathematics, programming, writing, arts, business..."
                      rows={3}
                      value={interests}
                      onChange={(e) => setInterests(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Your Skills (optional)</label>
                    <Textarea
                      placeholder="E.g., problem solving, communication, creativity..."
                      rows={2}
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSubmit} className="w-full" disabled={isLoading}>
                    {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing...</> : <>Get Career Advice <ArrowRight className="ml-2 h-4 w-4" /></>}
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            {/* Results - 3 columns */}
            <div className="lg:col-span-3">
              {results ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">Recommended Career Paths</h2>
                      <p className="text-muted-foreground mt-1">
                        Based on your {category === 'science' ? 'science' : category === 'management' ? 'management' : 'arts & humanities'} interests
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => { setResults(null); setInterests(''); setSkills(''); }}>
                      Start Over
                    </Button>
                  </div>

                  <div className="grid gap-4">
                    {results.map((path, idx) => {
                      const Icon = path.icon;
                      return (
                        <Card key={idx} className="group hover:shadow-lg transition-all duration-300 hover:border-primary/30">
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <div className={`p-3 rounded-xl ${path.color} flex-shrink-0`}>
                                <Icon className="h-6 w-6" />
                              </div>
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-foreground mb-1">{path.title}</h3>
                                <p className="text-muted-foreground text-sm">{path.desc}</p>
                              </div>
                              <div className="text-muted-foreground/30 group-hover:text-primary transition-colors">
                                <ArrowRight className="h-5 w-5" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Target className="h-5 w-5 text-primary" /> Next Steps
                      </h3>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"></span>Research these fields further with online resources</li>
                        <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"></span>Speak with teachers or professionals in these areas</li>
                        <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"></span>Consider internship or shadowing opportunities</li>
                        <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"></span>Visit our center for one-on-one career counseling</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center max-w-md p-10">
                    <div className="mx-auto w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                      <GraduationCap className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-3">Find Your Path</h3>
                    <p className="text-muted-foreground mb-8">
                      Fill out the form to receive personalized career guidance designed for Nepali students.
                    </p>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="bg-card border rounded-xl p-4">
                        <BookOpen className="h-6 w-6 text-primary mx-auto mb-2" />
                        <p className="text-xs font-medium text-foreground">Education Paths</p>
                      </div>
                      <div className="bg-card border rounded-xl p-4">
                        <BriefcaseIcon className="h-6 w-6 text-primary mx-auto mb-2" />
                        <p className="text-xs font-medium text-foreground">Career Options</p>
                      </div>
                      <div className="bg-card border rounded-xl p-4">
                        <Target className="h-6 w-6 text-primary mx-auto mb-2" />
                        <p className="text-xs font-medium text-foreground">Action Steps</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* FAQ */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-8 text-center text-foreground">Frequently Asked Questions</h2>
            <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
              {[
                { q: 'How accurate is this career guidance?', a: 'This tool provides general suggestions based on your input. For more personalized advice, schedule a session with our career counselors for in-depth guidance.' },
                { q: "What if I'm unsure about my interests?", a: "It's completely normal! Try exploring different subjects and activities. You can also book a counseling session where we help you discover your strengths." },
                { q: 'Can I change my career path later?', a: 'Absolutely! Many successful professionals change paths multiple times. This guidance is a starting point — your journey can evolve as you grow.' },
                { q: 'How can I get more detailed guidance?', a: 'Visit our center for a one-on-one session with our career counselors who provide detailed assessments based on your specific situation and goals.' },
              ].map((faq, i) => (
                <Card key={i} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2"><CardTitle className="text-base">{faq.q}</CardTitle></CardHeader>
                  <CardContent><p className="text-sm text-muted-foreground">{faq.a}</p></CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Career;
