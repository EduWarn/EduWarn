import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Fetch content from a dedicated section table (e.g. 'hero_content', 'features_content')
 * Each table has a single row with: id, content (jsonb), title, updated_at, updated_by
 */
export const useSectionContent = (tableName: string) => {
  return useQuery({
    queryKey: ['section-content', tableName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(tableName as any)
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as unknown as { id: string; content: any; title: string | null; updated_at: string; updated_by: string | null } | null;
    },
    staleTime: 10 * 60 * 1000,
  });
};
