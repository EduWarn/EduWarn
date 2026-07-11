import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { Button } from '../components/ui/button';
import { Star, Clock, Users, ArrowLeft } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import CoursePlayer from '@/components/CoursePlayer';

const CourseDetail: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const { data: course, isLoading } = useQuery({
    queryKey: ['course-detail', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!courseId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="bg-primary py-12">
          <div className="container mx-auto px-4">
            <Skeleton className="h-10 w-2/3 mb-4" />
            <Skeleton className="h-6 w-1/2" />
          </div>
        </div>
        <div className="flex-grow py-12 bg-background">
          <div className="container mx-auto px-4 max-w-4xl space-y-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow py-12 bg-background flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-primary mb-4">Course Not Found</h2>
            <Button onClick={() => navigate('/courses')}>Browse Courses</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title={`${course.title} — EduWarn Nepal`}
        description={(course.description || `Enroll in ${course.title} on EduWarn Nepal.`).slice(0, 155)}
        path={`/course/${course.id}`}
        image={course.image_url || undefined}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Course',
          name: course.title,
          description: course.description,
          provider: {
            '@type': 'EducationalOrganization',
            name: 'EduWarn Nepal',
            sameAs: 'https://wwww.eduwarnnepal.com',
          },
          ...(course.instructor && {
            instructor: { '@type': 'Person', name: course.instructor },
          }),
          ...(course.image_url && { image: course.image_url }),
        }}
      />
      <Navbar />

      {/* Course Header */}
      <div className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <Button
            variant="outline"
            onClick={() => navigate('/courses')}
            className="mb-4 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20"
          >
            <ArrowLeft size={16} className="mr-2" /> Back to Courses
          </Button>

          <h1 className="text-3xl md:text-4xl font-bold mb-4">{course.title}</h1>
          <p className="text-lg max-w-3xl mb-6 opacity-90">{course.description}</p>

          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex items-center bg-primary-foreground/10 rounded-full px-4 py-1.5">
              <Clock size={16} className="mr-2" />
              <span>{course.duration || 'Self-paced'}</span>
            </div>
            <div className="flex items-center bg-primary-foreground/10 rounded-full px-4 py-1.5">
              <Users size={16} className="mr-2" />
              <span>{course.students_count || 0} Students</span>
            </div>
            <div className="flex items-center bg-primary-foreground/10 rounded-full px-4 py-1.5">
              <Star size={16} fill="#FFC107" stroke="#FFC107" className="mr-2" />
              <span>{course.rating || 0} Rating</span>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <main className="flex-grow py-12 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Main info */}
            <div className="md:col-span-2 space-y-8">
              {course.image_url && (
                <img
                  src={course.image_url}
                  alt={course.title}
                  className="w-full h-64 object-cover rounded-xl"
                />
              )}

              <div>
                <h2 className="text-2xl font-bold text-primary mb-4">About This Course</h2>
                <p className="text-muted-foreground leading-relaxed text-lg">{course.description}</p>
              </div>

              {course.instructor && (
                <div>
                  <h3 className="text-xl font-bold text-primary mb-3">Instructor</h3>
                  <div className="flex items-center gap-3 p-4 bg-card rounded-xl border">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                      {course.instructor.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-semibold">{course.instructor}</p>
                      <p className="text-sm text-muted-foreground">Senior Instructor</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Curriculum / Player */}
            <div className="md:col-span-3 mt-6">
              <h2 className="text-2xl font-bold text-primary mb-4">Curriculum</h2>
              {/* All content is free and accessible; pass hasAccess={true} */}
              <CoursePlayer courseId={courseId!} />
            </div>

            {/* Sidebar */}
            <div>
              <div className="bg-card rounded-xl border p-6 sticky top-24 space-y-4">
                <h3 className="text-lg font-bold">Course Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Level</span>
                    <span className="font-medium">
                      {course.level === 'SEE' ? 'SEE/Grade 10' : course.level ? `Grade ${course.level}` : 'All Levels'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subject</span>
                    <span className="font-medium">{course.subject || 'General'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium">{course.duration || 'Self-paced'}</span>
                  </div>
                  {(course.seats_left ?? 10) <= 10 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Seats Left</span>
                      <span className="font-medium text-destructive">{course.seats_left}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CourseDetail;
