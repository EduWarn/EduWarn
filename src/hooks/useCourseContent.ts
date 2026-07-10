import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CourseLesson {
  id: string;
  module_id: string;
  title: string;
  duration_minutes: number | null;
  is_free_preview: boolean;
  sort_order: number;
  // Sensitive fields — only present when caller is entitled (via useLessonDetail)
  content?: string | null;
  video_url?: string | null;
  attachment_url?: string | null;
}

export interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  sort_order: number;
  lessons: CourseLesson[];
}

export const useCourseContent = (courseId?: string) => {
  return useQuery({
    queryKey: ['course-content', courseId],
    enabled: !!courseId,
    queryFn: async (): Promise<CourseModule[]> => {
      const { data: modules, error } = await supabase
        .from('course_modules')
        .select('*')
        .eq('course_id', courseId!)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      if (!modules?.length) return [];
      const moduleIds = modules.map((m: any) => m.id);
      const { data: lessons, error: le } = await supabase
        .from('course_lessons')
        .select('id, module_id, title, duration_minutes, is_free_preview, sort_order')
        .in('module_id', moduleIds)
        .order('sort_order', { ascending: true });
      if (le) throw le;
      return modules.map((m: any) => ({
        ...m,
        lessons: (lessons ?? []).filter((l: any) => l.module_id === m.id),
      }));
    },
  });
};

// Fetch full lesson content — RLS on course_lesson_content enforces entitlement
export const useLessonDetail = (lessonId?: string, enabled = true) => {
  return useQuery({
    queryKey: ['lesson-detail', lessonId],
    enabled: !!lessonId && enabled,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_lesson_content')
        .select('lesson_id, video_url, content, attachment_url')
        .eq('lesson_id', lessonId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
};

export const useSaveModule = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id?: string; course_id: string; title: string; description?: string; sort_order?: number }) => {
      if (input.id) {
        const { error } = await supabase.from('course_modules').update({
          title: input.title, description: input.description, sort_order: input.sort_order,
        }).eq('id', input.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('course_modules').insert(input);
        if (error) throw error;
      }
    },
    onSuccess: (_, v) => {
      toast.success('Module saved');
      qc.invalidateQueries({ queryKey: ['course-content', v.course_id] });
    },
    onError: (e: any) => toast.error(e.message),
  });
};

export const useDeleteModule = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string; course_id: string }) => {
      const { error } = await supabase.from('course_modules').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, v) => {
      toast.success('Module deleted');
      qc.invalidateQueries({ queryKey: ['course-content', v.course_id] });
    },
    onError: (e: any) => toast.error(e.message),
  });
};

export const useSaveLesson = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<CourseLesson> & { course_id: string; module_id: string; title: string }) => {
      const { course_id, content, video_url, attachment_url, ...meta } = input;
      let lessonId = input.id as string | undefined;

      if (lessonId) {
        const { id, ...upd } = meta;
        const { error } = await supabase
          .from('course_lessons')
          .update({
            title: upd.title,
            module_id: upd.module_id,
            duration_minutes: upd.duration_minutes ?? null,
            is_free_preview: upd.is_free_preview ?? false,
            sort_order: upd.sort_order ?? 0,
          })
          .eq('id', lessonId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('course_lessons')
          .insert({
            title: meta.title,
            module_id: meta.module_id,
            duration_minutes: meta.duration_minutes ?? null,
            is_free_preview: meta.is_free_preview ?? false,
            sort_order: meta.sort_order ?? 0,
          })
          .select('id')
          .single();
        if (error) throw error;
        lessonId = data.id;
      }

      // Upsert content row
      const { error: ce } = await supabase
        .from('course_lesson_content')
        .upsert({
          lesson_id: lessonId!,
          content: content ?? null,
          video_url: video_url ?? null,
          attachment_url: attachment_url ?? null,
        }, { onConflict: 'lesson_id' });
      if (ce) throw ce;
    },
    onSuccess: (_, v) => {
      toast.success('Lesson saved');
      qc.invalidateQueries({ queryKey: ['course-content', v.course_id] });
      if (v.id) qc.invalidateQueries({ queryKey: ['lesson-detail', v.id] });
    },
    onError: (e: any) => toast.error(e.message),
  });
};

export const useDeleteLesson = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string; course_id: string }) => {
      const { error } = await supabase.from('course_lessons').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, v) => {
      toast.success('Lesson deleted');
      qc.invalidateQueries({ queryKey: ['course-content', v.course_id] });
    },
    onError: (e: any) => toast.error(e.message),
  });
};
