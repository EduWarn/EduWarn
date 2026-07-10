import React, { useState, useMemo } from 'react';
import { useCourseContent, useLessonDetail, CourseLesson } from '@/hooks/useCourseContent';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Lock, PlayCircle, FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  courseId: string;
  hasAccess: boolean;
  onEnroll: () => void;
}

const getEmbedUrl = (url: string): string => {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtube.com')) {
      const v = u.searchParams.get('v');
      if (v) return `https://www.youtube.com/embed/${v}`;
    }
    if (u.hostname === 'youtu.be') {
      return `https://www.youtube.com/embed${u.pathname}`;
    }
    if (u.hostname.includes('vimeo.com')) {
      const id = u.pathname.split('/').filter(Boolean)[0];
      if (id) return `https://player.vimeo.com/video/${id}`;
    }
  } catch {}
  return url;
};

const CoursePlayer: React.FC<Props> = ({ courseId, hasAccess, onEnroll }) => {
  const { data: modules, isLoading } = useCourseContent(courseId);
  const firstLesson = useMemo(() => {
    for (const m of modules ?? []) for (const l of m.lessons) return l;
    return null;
  }, [modules]);
  const [active, setActive] = useState<CourseLesson | null>(null);

  const current = active ?? firstLesson;
  const canPlay = (l: CourseLesson) => hasAccess || l.is_free_preview;
  const { data: detail, isLoading: detailLoading } = useLessonDetail(current?.id, !!current && canPlay(current));

  if (isLoading) return <Skeleton className="h-72 w-full" />;
  if (!modules?.length) {
    return (
      <div className="rounded-xl border p-6 text-center text-muted-foreground">
        Course content coming soon. The instructor is preparing lessons.
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-4">
        {current ? (
          canPlay(current) ? (
            <>
              {detailLoading ? (
                <Skeleton className="aspect-video w-full rounded-xl" />
              ) : detail?.video_url ? (
                <div className="aspect-video rounded-xl overflow-hidden bg-black">
                  <iframe
                    src={getEmbedUrl(detail.video_url)}
                    title={current.title}
                    className="w-full h-full"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                </div>
              ) : (
                <div className="aspect-video rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
                  <FileText className="w-10 h-10" />
                </div>
              )}
              <div>
                <h3 className="text-xl font-bold text-primary">{current.title}</h3>
                {detail?.content && (
                  <div className="mt-3 text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {detail.content}
                  </div>
                )}
                {detail?.attachment_url && (
                  <a href={detail.attachment_url} target="_blank" rel="noreferrer">
                    <Button variant="outline" size="sm" className="mt-4">
                      <Download className="w-4 h-4 mr-2" /> Download materials
                    </Button>
                  </a>
                )}
              </div>
            </>
          ) : (
            <div className="rounded-xl border p-8 text-center bg-card">
              <Lock className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
              <h3 className="text-lg font-bold mb-2">Unlock this lesson</h3>
              <p className="text-muted-foreground mb-4">Enroll to access the full course content.</p>
              <Button onClick={onEnroll} variant="accent">Enroll Now</Button>
            </div>
          )
        ) : null}
      </div>

      <div className="bg-card rounded-xl border p-4 max-h-[80vh] overflow-y-auto">
        <h4 className="font-bold mb-3">Course Curriculum</h4>
        <Accordion type="multiple" defaultValue={modules.map((m) => m.id)}>
          {modules.map((m) => (
            <AccordionItem key={m.id} value={m.id}>
              <AccordionTrigger className="text-sm">{m.title}</AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-1">
                  {m.lessons.map((l) => (
                    <li key={l.id}>
                      <button
                        onClick={() => setActive(l)}
                        className={`w-full text-left text-sm p-2 rounded-md flex items-center gap-2 hover:bg-muted ${current?.id === l.id ? 'bg-muted' : ''}`}
                      >
                        {canPlay(l) ? <PlayCircle className="w-4 h-4 text-primary shrink-0" /> : <Lock className="w-4 h-4 text-muted-foreground shrink-0" />}
                        <span className="flex-1 truncate">{l.title}</span>
                        {l.is_free_preview && !hasAccess && <Badge variant="secondary" className="text-[10px]">Free</Badge>}
                        {l.duration_minutes ? <span className="text-xs text-muted-foreground">{l.duration_minutes}m</span> : null}
                      </button>
                    </li>
                  ))}
                  {!m.lessons.length && <li className="text-xs text-muted-foreground p-2">No lessons yet</li>}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
};

export default CoursePlayer;
