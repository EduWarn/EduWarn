import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Clock, Users } from 'lucide-react';
import { Button } from './ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from './ui/skeleton';

const CourseSection = () => {
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses-published'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(8);
      if (error) throw error;
      return data;
    },
  });

  const filteredCourses =
    filter === "all"
      ? courses
      : courses.filter(course => course.level === filter || course.subject === filter);

  return (
    <div className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            Our Featured Courses
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Designed by expert educators to help students excel in their academics and competitive exams
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {["all", "SEE", "11", "12"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full ${
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {f === "all" ? "All Courses" : f === "SEE" ? "SEE/Grade 10" : `Grade ${f}`}
            </button>
          ))}
        </div>

        {/* Loading skeleton */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-card rounded-xl overflow-hidden shadow-lg border">
                <Skeleton className="w-full h-48" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredCourses.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No courses available yet. Check back soon!
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCourses.map((course) => (
              <div key={course.id} className="course-card flex flex-col h-full relative">
                <div className="relative">
                  <img
                    src={
                      course.image_url ||
                      `https://placehold.co/600x400/1E2A78/FFFFFF?text=${encodeURIComponent(course.title)}`
                    }
                    alt={course.title}
                    className="w-full h-48 object-cover cursor-pointer"
                    onClick={() => navigate(`/course/${course.id}`)}
                  />
                  {(course.seats_left ?? 10) <= 5 && (
                    <div className="absolute top-3 right-3 bg-red-700 text-white text-xs font-medium px-2 py-1 rounded-full">
                      Only {course.seats_left} seats left!
                    </div>
                  )}
                </div>

                <div className="p-5 flex flex-col flex-grow">
                  <h3
                    className="text-lg font-semibold text-primary mb-2 cursor-pointer hover:underline"
                    onClick={() => navigate(`/course/${course.id}`)}
                  >
                    {course.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {course.description}
                  </p>

                  <div className="flex items-center text-sm text-muted-foreground mb-3">
                    <Clock size={16} className="mr-1" />
                    <span className="mr-3">{course.duration || 'Self-paced'}</span>
                    <Users size={16} className="mr-1" />
                    <span>{course.students_count || 0} students</span>
                  </div>

                  <div className="flex items-center mb-4">
                    <div className="flex text-accent">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          fill={i < Math.floor(course.rating || 0) ? "#FFC107" : "none"}
                          stroke="#FFC107"
                        />
                      ))}
                    </div>
                    <span className="text-sm ml-1">{course.rating || 0}</span>
                  </div>

                  {/* Always free */}
                  <div className="mt-auto">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-primary font-bold text-lg">Free</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="default"
                        className="w-full"
                        onClick={() => navigate(`/course/${course.id}`)}
                      >
                        View Course
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Button variant="secondary" onClick={() => navigate('/courses')}>
            Browse All Courses
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CourseSection;
