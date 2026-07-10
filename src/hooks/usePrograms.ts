import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Program {
  id: string;
  title: string;
  slug: string;
  type: string;
  description: string;
  image_url: string | null;
  date: string | null;
  location: string | null;
  featured: boolean;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const usePrograms = (options: { featuredOnly?: boolean; limit?: number } = {}) => {
  return useQuery({
    queryKey: ['programs', options],
    queryFn: async (): Promise<Program[]> => {
      let query = supabase
        .from('programs')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });
      if (options.featuredOnly) query = query.eq('featured', true);
      if (options.limit) query = query.limit(options.limit);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as Program[];
    },
  });
};

export const useAllProgramsAdmin = () => {
  return useQuery({
    queryKey: ['programs-admin'],
    queryFn: async (): Promise<Program[]> => {
      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as Program[];
    },
  });
};
