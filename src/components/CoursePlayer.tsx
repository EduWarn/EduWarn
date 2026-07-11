import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

type Module = { id: string; title: string; sort_order?: number };
type Lesson = { id: string; module_id: string; title: string; sort_order?: number; is_free_preview?: boolean };
type LessonContent = { lesson_id: string; video_url?: string; content?: string; attachment_url?: string };

const CoursePlayer: React.FC<{ courseId: string; hasAccess?: boolean }> = ({ courseId, hasAccess = true }) => {
  const [modules, setModules] = useState<Module[]>([]);
  const [lessonsByModule, setLessonsByModule] = useState<Record<string, Lesson[]>>({});
  const [contents, setContents] = useState<Record<string, LessonContent>>({});
  const [loading, setLoading] = useState(true);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId) return;
    let mounted = true;

    const load = async () => {
      setLoading(true);

      // 1) fetch modules for course
      const { data: mods, error: modErr } = await supabase
        .from('course_modules')
        .select('*')
        .eq('course_id', courseId)
        .order('sort_order', { ascending: true });

      if (modErr) {
        console.error('modules error', modErr);
        setLoading(false);
        return;
      }

      if (!mounted) return;
      setModules(mods || []);

      // 2) fetch lessons for all modules
      const moduleIds = (mods || []).map((m: any) => m.id);
      if (moduleIds.length === 0) {
        setLessonsByModule({});
        setLoading(false);
        return;
      }

      const { data: lessons, error: lessonsErr } = await supabase
        .from('course_lessons')
        .select('*')
        .in('module_id', moduleIds)
        .order('sort_order', { ascending: true });

      if (lessonsErr) {
        console.error('lessons error', lessonsErr);
        setLoading(false);
        return;
      }

      const grouped: Record<string, Lesson[]> = {};
      (lessons || []).forEach((l: Lesson) => {
        grouped[l.module_id] = grouped[l.module_id] || [];
        grouped[l.module_id].push(l);
      });
      if (!mounted) return;
      setLessonsByModule(grouped);

      // 3) fetch lesson contents for all lessons
      const lessonIds = (lessons || []).map((l: any) => l.id);
      if (lessonIds.length === 0) {
        setContents({});
        setLoading(false);
        return;
      }

      const { data: contentsData, error: contentErr } = await supabase
        .from('course_lesson_content')
        .select('*')
        .in('lesson_id', lessonIds);

      if (contentErr) {
        console.error('lesson content error', contentErr);
        setLoading(false);
        return;
      }

      const contentMap: Record<string, LessonContent> = {};
      (contentsData || []).forEach((c: any) => {
        contentMap[c.lesson_id] = c;
      });

      if (!mounted) return;
      setContents(contentMap);

      // set first lesson as active
      const firstLesson = lessonIds[0] || null;
      setActiveLessonId(firstLesson);
      setLoading(false);
    };

    load();

    return () => {
      mounted = false;
    };
  }, [courseId]);

  if (!courseId) return <div className="p-6 bg-card rounded">Invalid course</div>;
  if (loading) return <div className="space-y-4"><Skeleton className="h-48 w-full" /><Skeleton className="h-6 w-1/2" /></div>;

  // render
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-6">
        {activeLessonId ? (
          <div className="bg-card p-4 rounded">
            {/* Video embed if YouTube short link or full URL */}
            {contents[activeLessonId]?.video_url ? (
              <div className="w-full aspect-video">
                <iframe
                  title="lesson-video"
                  src={convertToEmbed(contents[activeLessonId].video_url || '')}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full rounded"
                />
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">No video available</div>
            )}

            <div className="mt-4">
              <div dangerouslySetInnerHTML={{ __html: contents[activeLessonId]?.content || '<p>No lesson notes.</p>' }} />
              {contents[activeLessonId]?.attachment_url && (
                <a href={contents[activeLessonId].attachment_url} target="_blank" rel="noreferrer" className="text-primary underline mt-3 block">
                  Download attachment
                </a>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-card p-6 rounded">Select a lesson to start</div>
        )}
      </div>

      <aside className="space-y-4">
        {modules.map((m) => (
          <div key={m.id} className="bg-card p-4 rounded">
            <h4 className="font-semibold mb-2">{m.title}</h4>
            <ul className="space-y-2">
              {(lessonsByModule[m.id] || []).map((l) => {
                const isActive = l.id === activeLessonId;
                return (
                  <li key={l.id}>
                    <button
                      onClick={() => setActiveLessonId(l.id)}
                      className={`w-full text-left p-2 rounded ${isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted/50'}`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{l.title}</span>
                        <span className="text-xs text-muted-foreground">{l.is_free_preview ? 'Preview' : ''}</span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </aside>
    </div>
  );
};

// helper: convert youtu.be or youtube watch url to embed url
function convertToEmbed(url: string) {
  if (!url) return '';
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) {
      const id = u.pathname.slice(1);
      return `https://www.youtube.com/embed/${id}`;
    }
    if (u.hostname.includes('youtube.com')) {
      const v = u.searchParams.get('v');
      if (v) return `https://www.youtube.com/embed/${v}`;
      // handle /embed/ or /watch?v=
      if (u.pathname.includes('/embed/')) return url;
    }
  } catch (e) {
    // fallback: return url as-is
  }
  return url;
}

export default CoursePlayer;
