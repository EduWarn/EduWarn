
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { BlogPost } from '@/types/database';

export const useAdminBlogs = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();

  const fetchBlogs = async (): Promise<BlogPost[]> => {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load blog posts');
      throw error;
    }

    return data || [];
  };

  const createBlog = async (blogData: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>) => {
    setIsCreating(true);
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .insert([blogData])
        .select()
        .single();

      if (error) {
        toast.error('Failed to create blog post');
        throw error;
      }

      toast.success('Blog post created successfully');
      await queryClient.invalidateQueries({ queryKey: ['admin-blogs'] });
      await queryClient.invalidateQueries({ queryKey: ['blogs-count'] });
      return data;
    } finally {
      setIsCreating(false);
    }
  };

  const updateBlog = async (id: string, blogData: Partial<Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>>) => {
    setIsUpdating(true);
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .update(blogData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        toast.error('Failed to update blog post');
        throw error;
      }

      toast.success('Blog post updated successfully');
      await queryClient.invalidateQueries({ queryKey: ['admin-blogs'] });
      await queryClient.invalidateQueries({ queryKey: ['blogs-count'] });
      return data;
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteBlog = async (id: string) => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) {
        toast.error('Failed to delete blog post');
        throw error;
      }

      toast.success('Blog post deleted successfully');
      await queryClient.invalidateQueries({ queryKey: ['admin-blogs'] });
      await queryClient.invalidateQueries({ queryKey: ['blogs-count'] });
      return true;
    } finally {
      setIsDeleting(false);
    }
  };

  const blogsQuery = useQuery({
    queryKey: ['admin-blogs'],
    queryFn: fetchBlogs,
  });

  return {
    blogsQuery,
    blogs: blogsQuery.data || [],
    isLoading: blogsQuery.isLoading,
    isError: blogsQuery.isError,
    error: blogsQuery.error,
    isCreating,
    isUpdating, 
    isDeleting,
    createBlog,
    updateBlog,
    deleteBlog,
  };
};
