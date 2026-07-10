
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useAdminStats = (isAdmin: boolean = false) => {
  // Fetch actual course count
  const coursesQuery = useQuery({
    queryKey: ['courses-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    }
  });

  // Fetch actual blog count
  const blogsQuery = useQuery({
    queryKey: ['blogs-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('blog_posts')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    }
  });

  // Fetch contacts count - only for admins
  const contactsQuery = useQuery({
    queryKey: ['contacts-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true });
      if (error) return 0;
      return count || 0;
    },
    enabled: isAdmin,
  });

  // Fetch registrations count - only for admins
  const registrationsQuery = useQuery({
    queryKey: ['registrations-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('registrations')
        .select('*', { count: 'exact', head: true });
      if (error) return 0;
      return count || 0;
    },
    enabled: isAdmin,
  });

  // Fetch total students (sum of students_count from courses)
  const studentsQuery = useQuery({
    queryKey: ['total-students'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('students_count')
        .eq('published', true);
      if (error) return 0;
      return data?.reduce((sum, c) => sum + (c.students_count || 0), 0) || 0;
    },
  });

  // Fetch course enrollment data for pie chart
  const enrollmentQuery = useQuery({
    queryKey: ['course-enrollment-data'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('title, students_count')
        .eq('published', true)
        .order('students_count', { ascending: false })
        .limit(6);
      if (error) return [];
      return data?.map(c => ({
        courseName: c.title,
        students: c.students_count || 0,
      })) || [];
    },
  });

  // Fetch payment/purchase data for revenue
  const purchasesQuery = useQuery({
    queryKey: ['purchase-stats'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('course_purchases')
        .select('*', { count: 'exact', head: true })
        .eq('payment_status', 'completed');
      if (error) return 0;
      return count || 0;
    },
    enabled: isAdmin,
  });

  // Fetch team members count
  const teamQuery = useQuery({
    queryKey: ['team-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('team_members')
        .select('*', { count: 'exact', head: true });
      if (error) return 0;
      return count || 0;
    },
  });

  // Fetch testimonials count
  const testimonialsQuery = useQuery({
    queryKey: ['testimonials-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('testimonials')
        .select('*', { count: 'exact', head: true });
      if (error) return 0;
      return count || 0;
    },
  });

  return {
    coursesQuery,
    blogsQuery,
    contactsQuery,
    registrationsQuery,
    studentsQuery,
    enrollmentQuery,
    purchasesQuery,
    teamQuery,
    testimonialsQuery,
    totalStudents: studentsQuery.data || 0,
    activeCourses: coursesQuery.data || 0,
    totalBlogs: blogsQuery.data || 0,
    totalContacts: contactsQuery.data || 0,
    totalRegistrations: registrationsQuery.data || 0,
    totalPurchases: purchasesQuery.data || 0,
    totalTeamMembers: teamQuery.data || 0,
    totalTestimonials: testimonialsQuery.data || 0,
    courseEnrollmentData: enrollmentQuery.data || [],
    isLoading: coursesQuery.isLoading || blogsQuery.isLoading || contactsQuery.isLoading,
    error: coursesQuery.error || blogsQuery.error || contactsQuery.error
  };
};
