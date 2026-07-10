
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Course } from '@/types/database';

export const useAdminCourses = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();

  const fetchCourses = async (): Promise<Course[]> => {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load courses');
      throw error;
    }

    return data || [];
  };

  const createCourse = async (courseData: Omit<Course, 'id' | 'created_at' | 'updated_at'>) => {
    setIsCreating(true);
    try {
      const { data, error } = await supabase
        .from('courses')
        .insert([courseData])
        .select()
        .single();

      if (error) {
        toast.error('Failed to create course');
        throw error;
      }

      toast.success('Course created successfully');
      await queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      await queryClient.invalidateQueries({ queryKey: ['courses-published'] });
      await queryClient.invalidateQueries({ queryKey: ['courses-count'] });
      return data;
    } finally {
      setIsCreating(false);
    }
  };

  const updateCourse = async (id: string, courseData: Partial<Omit<Course, 'id' | 'created_at' | 'updated_at'>>) => {
    setIsUpdating(true);
    try {
      const { data, error } = await supabase
        .from('courses')
        .update(courseData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        toast.error('Failed to update course');
        throw error;
      }

      toast.success('Course updated successfully');
      await queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      await queryClient.invalidateQueries({ queryKey: ['courses-published'] });
      await queryClient.invalidateQueries({ queryKey: ['courses-count'] });
      return data;
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteCourse = async (id: string) => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', id);

      if (error) {
        toast.error('Failed to delete course');
        throw error;
      }

      toast.success('Course deleted successfully');
      await queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      await queryClient.invalidateQueries({ queryKey: ['courses-published'] });
      await queryClient.invalidateQueries({ queryKey: ['courses-count'] });
      return true;
    } finally {
      setIsDeleting(false);
    }
  };

  const coursesQuery = useQuery({
    queryKey: ['admin-courses'],
    queryFn: fetchCourses,
  });

  return {
    coursesQuery,
    courses: coursesQuery.data || [],
    isLoading: coursesQuery.isLoading,
    isError: coursesQuery.isError,
    error: coursesQuery.error,
    isCreating,
    isUpdating,
    isDeleting,
    createCourse,
    updateCourse,
    deleteCourse,
  };
};
