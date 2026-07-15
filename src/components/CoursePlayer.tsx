import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, BookOpen, ExternalLink, FileText, PlayCircle } from 'lucide-react';

type Module = { id: string; title: string; sort_order?: number };
type Lesson = { id: string; module_id: string; title: string; sort_order?: number; duration_minutes?: number | null };
type LessonContent = { lesson_id: string; video_url?: string; content?: string; attachment_url?: string };

const CoursePlayer: React.FC<{ courseId: string; hasAccess?: boolean }> = ({ courseId, hasAccess = true }) => {
  const [modules, setModules] = useState<Module[]>([]);
  const [lessonsByModule, setLessonsByModule] = useState<Record<string, Lesson[]>>({});
  const [contents, setContents] = useState<Record<string, LessonContent>>({});
  const [loading, setLoading] = useState(true);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);

  const allLessons = useMemo(
    () => modules.flatMap((module) => lessonsByModule[module.id] || []),
    [modules, lessonsByModule],
  );

  const activeLesson = useMemo(
    () => allLessons.find((lesson) => lesson.id === activeLessonId) || null,
    [activeLessonId, allLessons],
  );

  useEffect(() => {
    if (!courseId) return;
    let mounted = true;

    const load = async () => {
      setLoading(true);

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
      (lessons || []).forEach((lesson: Lesson) => {
        grouped[lesson.module_id] = grouped[lesson.module_id] || [];
        grouped[lesson.module_id].push(lesson);
      });

      if (!mounted) return;
      setLessonsByModule(grouped);

      const lessonIds = (lessons || []).map((lesson: any) => lesson.id);
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
      (contentsData || []).forEach((content: any) => {
        contentMap[content.lesson_id] = content;
      });

      if (!mounted) return;
      setContents(contentMap);
      setActiveLessonId(lessonIds[0] || null);
      setLoading(false);
    };

    load();

    return () => {
      mounted = false;
    };
  }, [courseId]);

  if (!courseId) return <div className="rounded-2xl border border-border/60 bg-card p-6">Invalid course</div>;
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-6 w-1/2" />
      </div>
    );
  }

  const activeContent = activeLessonId ? contents[activeLessonId] : null;
  const totalLessons = allLessons.length;
  const lessonStatusLabel = hasAccess ? 'Free to explore' : 'Open learning path';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6">
      <section className="space-y-5">
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
              Learning path
            </span>
            <span className="rounded-full bg-muted px-3 py-1 text-[11px] font-medium text-muted-foreground">
              {lessonStatusLabel}
            </span>
          </div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-foreground">
                {activeLesson?.title || 'Choose a lesson'}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Navigate lesson by lesson and open any attached PDF or study resource directly from the content panel.
              </p>
            </div>
            <div className="rounded-xl bg-primary/10 px-3 py-2 text-right">
              <p className="text-[11px] uppercase tracking-[0.2em] text-primary/70">Current lesson</p>
              <p className="text-sm font-semibold text-primary">{totalLessons} available</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
          {activeLessonId && activeContent ? (
            <>
              {activeContent.video_url ? (
                <div className="w-full aspect-video overflow-hidden rounded-2xl border border-border/60 bg-black/5">
                  <iframe
                    title="lesson-video"
                    src={convertToEmbed(activeContent.video_url)}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="h-full w-full"
                  />
                </div>
              ) : (
                <div className="flex h-56 items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/30 px-6 text-center text-muted-foreground">
                  <div>
                    <PlayCircle size={28} className="mx-auto mb-2 text-primary" />
                    <p className="font-medium">No video has been added for this lesson yet.</p>
                  </div>
                </div>
              )}

              <div className="mt-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h4 className="text-lg font-semibold text-foreground">{activeLesson?.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {activeLesson?.duration_minutes ? `${activeLesson.duration_minutes} min lesson` : 'Self-paced lesson'}
                    </p>
                  </div>
                  <div className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                    Lesson notes
                  </div>
                </div>

                <div
                  className="prose prose-sm max-w-none text-sm leading-7 text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: activeContent.content || '<p>No lesson notes were added yet.</p>' }}
                />

                {activeContent.attachment_url && (
                  <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
                    <div className="flex items-center gap-2 text-primary">
                      <FileText size={18} />
                      <span className="font-semibold">Study material</span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Open the PDF or file attached to this lesson directly from Supabase.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <a
                        href={activeContent.attachment_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                      >
                        <ExternalLink size={16} />
                        Open resource
                      </a>
                    </div>
                    {isPdfUrl(activeContent.attachment_url) && (
                      <div className="mt-4 overflow-hidden rounded-xl border border-border/60 bg-background">
                        <iframe
                          title={`${activeLesson?.title} resource preview`}
                          src={activeContent.attachment_url}
                          className="h-[520px] w-full"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex h-56 items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/30 px-6 text-center text-muted-foreground">
              <div>
                <BookOpen size={28} className="mx-auto mb-2 text-primary" />
                <p className="font-medium">Select a lesson from the curriculum to begin learning.</p>
              </div>
            </div>
          )}
        </div>
      </section>

      <aside className="space-y-4">
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Course curriculum</h3>
              <p className="text-sm text-muted-foreground mt-1">{totalLessons} lessons available</p>
            </div>
            <div className="rounded-full bg-primary/10 p-2 text-primary">
              <BookOpen size={18} />
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {modules.map((module) => (
              <div key={module.id} className="rounded-xl border border-border/60 bg-background/70 p-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <BookOpen className="h-4 w-4 text-primary" />
                  {module.title}
                </div>
                <ul className="mt-3 space-y-2">
                  {(lessonsByModule[module.id] || []).map((lesson) => {
                    const isActive = lesson.id === activeLessonId;
                    return (
                      <li key={lesson.id}>
                        <button
                          onClick={() => setActiveLessonId(lesson.id)}
                          className={`w-full rounded-xl border p-3 text-left transition ${
                            isActive
                              ? 'border-primary bg-primary/10 shadow-sm'
                              : 'border-transparent bg-muted/20 hover:border-primary/20 hover:bg-background'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-medium">{lesson.title}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {lesson.duration_minutes ? `${lesson.duration_minutes} min` : 'Lesson'}
                              </p>
                            </div>
                            <div className="mt-0.5 text-primary">
                              {isActive ? <PlayCircle size={16} /> : <ArrowRight size={14} />}
                            </div>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
};

function convertToEmbed(url: string) {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtu.be')) {
      const id = parsed.pathname.slice(1);
      return `https://www.youtube.com/embed/${id}`;
    }
    if (parsed.hostname.includes('youtube.com')) {
      const videoId = parsed.searchParams.get('v');
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
      if (parsed.pathname.includes('/embed/')) return url;
    }
  } catch {
    // fall back to original url
  }
  return url;
}

function isPdfUrl(url?: string) {
  if (!url) return false;
  return url.toLowerCase().endsWith('.pdf');
}

export default CoursePlayer;
