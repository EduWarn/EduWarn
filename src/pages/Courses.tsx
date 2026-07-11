import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { Button } from '../components/ui/button';
import { Star, Clock, Users, BookOpen, Filter, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePurchases } from '@/hooks/usePurchases';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';


const Courses = () => {
  const [searchParams] = [new URLSearchParams(window.location.search)];
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || "");
  const [showFilters, setShowFilters] = useState(false);
  const [showLocalPayment, setShowLocalPayment] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: purchases = [] } = usePurchases();

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['all-courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const hasPurchased = (courseId: string) => {
    return purchases.some(
      (purchase) => purchase.course_id === courseId && purchase.payment_status === 'completed'
    );
  };

  const handleCourseAccess = (courseId: string) => {
    navigate(`/course/${courseId}`);
  };

  const handleEnrollNow = async (course: any) => {
    if (!user) {
      toast.error("Please log in to purchase this course");
      navigate('/login');
      return;
    }
    setSelectedCourse(course);
    setShowLocalPayment(true);
  };

  const handleLocalPaymentSubmit = async (data: any) => {
    toast.success('Payment verification submitted! We will verify and activate your course within 24 hours.');
  };

  const filteredCourses = courses
    .filter(course => {
      if (filter === "all") return true;
      return course.level === filter || course.subject === filter;
    })
    .filter(course => {
      if (!searchTerm) return true;
      return course.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
             course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
             (course.subject || '').toLowerCase().includes(searchTerm.toLowerCase());
    });

  const subjects = [...new Set(courses.map(course => course.subject).filter(Boolean))];
  const levels = [...new Set(courses.map(course => course.level).filter(Boolean))];

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Courses — SEE, Grade 11–12, IELTS & LokSewa | EduWarn Nepal"
        description="Browse EduWarn Nepal's full course catalog: SEE prep, Grade 11–12 NEB, IELTS, LokSewa, and skill courses taught by expert instructors."
        path="/courses"
      />
      <Navbar />
      
      <div className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Our Courses</h1>
          <p className="text-lg max-w-2xl">
            Discover our comprehensive range of courses designed to help students excel in their academics and competitive exams.
          </p>
        </div>
      </div>
      
      <main className="flex-grow py-12 bg-background">
        <div className="container mx-auto px-4">

          <div className="flex flex-col md:flex-row gap-8">
            <button 
              className="md:hidden flex items-center justify-center gap-2 bg-card p-4 rounded-lg shadow mb-4"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={20} />
              <span>{showFilters ? "Hide Filters" : "Show Filters"}</span>
            </button>
            
            <div className={`md:w-1/4 ${showFilters ? 'block' : 'hidden md:block'}`}>
              <div className="bg-card rounded-xl shadow-md p-6 sticky top-20">
                <div className="mb-6">
                  <h3 className="font-semibold text-lg mb-3">Search Courses</h3>
                  <input
                    type="text"
                    placeholder="Search for courses..."
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="mb-6">
                  <h3 className="font-semibold text-lg mb-3">Filter by Level</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input type="radio" id="all-levels" name="level" checked={filter === "all"} onChange={() => setFilter("all")} className="mr-2" />
                      <label htmlFor="all-levels">All Levels</label>
                    </div>
                    {levels.map(level => (
                      <div key={level} className="flex items-center">
                        <input type="radio" id={`level-${level}`} name="level" checked={filter === level} onChange={() => setFilter(level!)} className="mr-2" />
                        <label htmlFor={`level-${level}`}>{level === "SEE" ? "SEE/Grade 10" : `Grade ${level}`}</label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-3">Filter by Subject</h3>
                  <div className="space-y-2">
                    {subjects.map(subject => (
                      <div key={subject} className="flex items-center">
                        <input type="radio" id={`subject-${subject}`} name="subject" checked={filter === subject} onChange={() => setFilter(subject!)} className="mr-2" />
                        <label htmlFor={`subject-${subject}`}>{subject}</label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {filter !== "all" && (
                  <button onClick={() => setFilter("all")} className="mt-6 w-full py-2 px-4 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors">
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
            
            <div className="md:w-3/4">
              <h2 className="text-2xl font-bold mb-6">
                {isLoading ? 'Loading...' : `${filteredCourses.length} ${filteredCourses.length === 1 ? 'Course' : 'Courses'} Available`}
              </h2>
              
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-card rounded-xl overflow-hidden shadow-md border">
                      <Skeleton className="w-full h-48" />
                      <div className="p-5 space-y-3">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-8 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredCourses.length === 0 ? (
                <div className="bg-card rounded-xl p-8 text-center">
                  <BookOpen size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">No courses found</h3>
                  <p className="text-muted-foreground mb-4">We couldn't find any courses matching your current filters.</p>
                  <Button variant="secondary" onClick={() => {setFilter("all"); setSearchTerm("");}}>Clear All Filters</Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredCourses.map((course) => (
                    <div key={course.id} className="course-card flex flex-col h-full relative">
                      <div className="relative">
                        <img 
                          src={course.image_url || `https://placehold.co/600x400/1E2A78/FFFFFF?text=${encodeURIComponent(course.title)}`}
                          alt={course.title} 
                          className="w-full h-48 object-cover cursor-pointer"
                          onClick={() => handleCourseAccess(course.id)}
                        />
                        {!hasPurchased(course.id) && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Lock className="w-12 h-12 text-white opacity-75" />
                          </div>
                        )}
                        {(course.seats_left ?? 10) <= 5 && (
                          <div className="absolute top-3 right-3 bg-red-700 text-white text-xs font-medium px-2 py-1 rounded-full">
                            Only {course.seats_left} seats left!
                          </div>
                        )}
                      </div>
                      
                      <div className="p-5 flex flex-col flex-grow">
                        <h3 className="text-lg font-semibold text-primary mb-2 cursor-pointer hover:underline" onClick={() => handleCourseAccess(course.id)}>
                          {course.title}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{course.description}</p>
                        
                        <div className="flex items-center text-sm text-muted-foreground mb-3">
                          <Clock size={16} className="mr-1" />
                          <span className="mr-3">{course.duration || 'Self-paced'}</span>
                          <Users size={16} className="mr-1" />
                          <span>{course.students_count || 0} students</span>
                        </div>
                        
                        <div className="flex items-center mb-4">
                          <div className="flex text-accent">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={16} fill={i < Math.floor(course.rating || 0) ? "#FFC107" : "none"} stroke="#FFC107" />
                            ))}
                          </div>
                          <span className="text-sm ml-1">{course.rating || 0}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Courses;
