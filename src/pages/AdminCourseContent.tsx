import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import {
  useCourseContent, useSaveModule, useDeleteModule, useSaveLesson, useDeleteLesson, CourseLesson,
} from '@/hooks/useCourseContent';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Plus, Pencil, Trash2 } from 'lucide-react';

const AdminCourseContent = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { data: course } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const { data } = await supabase.from('courses').select('id,title').eq('id', courseId!).single();
      return data;
    },
    enabled: !!courseId,
  });
  const { data: modules, isLoading } = useCourseContent(courseId);
  const saveModule = useSaveModule();
  const deleteModule = useDeleteModule();
  const saveLesson = useSaveLesson();
  const deleteLesson = useDeleteLesson();

  const [moduleForm, setModuleForm] = useState<{ id?: string; title: string; description: string } | null>(null);
  const [lessonForm, setLessonForm] = useState<(Partial<CourseLesson> & { module_id: string }) | null>(null);

  // Load full lesson content (video/notes/attachment) when editing an existing lesson
  useEffect(() => {
    let cancelled = false;
    const loadContent = async () => {
      if (!lessonForm?.id) return;
      if (lessonForm.video_url !== undefined || lessonForm.content !== undefined || lessonForm.attachment_url !== undefined) return;
      const { data } = await supabase
        .from('course_lesson_content')
        .select('video_url, content, attachment_url')
        .eq('lesson_id', lessonForm.id)
        .maybeSingle();
      if (cancelled || !data) return;
      setLessonForm((prev) => prev && prev.id === lessonForm.id ? { ...prev, ...data } : prev);
    };
    loadContent();
    return () => { cancelled = true; };
  }, [lessonForm?.id]);

  if (!courseId) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/admin/courses"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" /> Courses</Button></Link>
        <div>
          <h1 className="text-2xl font-bold text-primary">{course?.title || 'Course'} — Curriculum</h1>
          <p className="text-muted-foreground text-sm">Add modules and lessons students will access after purchase.</p>
        </div>
      </div>

      <Button onClick={() => setModuleForm({ title: '', description: '' })}><Plus className="w-4 h-4 mr-1" /> Add Module</Button>

      {isLoading && [1, 2].map((i) => <Skeleton key={i} className="h-40 w-full" />)}

      {modules?.map((m) => (
        <Card key={m.id}>
          <CardHeader className="flex-row items-start justify-between gap-4">
            <div>
              <CardTitle className="text-lg">{m.title}</CardTitle>
              {m.description && <p className="text-sm text-muted-foreground mt-1">{m.description}</p>}
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setModuleForm({ id: m.id, title: m.title, description: m.description || '' })}>
                <Pencil className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="destructive" onClick={() => {
                if (confirm('Delete this module and all its lessons?')) deleteModule.mutate({ id: m.id, course_id: courseId });
              }}><Trash2 className="w-4 h-4" /></Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-3">
              {m.lessons.map((l) => (
                <div key={l.id} className="flex items-center justify-between p-3 rounded-md border bg-card">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{l.title} {l.is_free_preview && <span className="text-xs text-primary">(Free preview)</span>}</div>
                    <div className="text-xs text-muted-foreground truncate">{l.duration_minutes ? `${l.duration_minutes} min` : 'No duration set'}</div>
                  </div>
                  <div className="flex gap-1 ml-3">
                    <Button size="sm" variant="ghost" onClick={() => setLessonForm({ ...l, module_id: m.id })}><Pencil className="w-4 h-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => {
                      if (confirm('Delete this lesson?')) deleteLesson.mutate({ id: l.id, course_id: courseId });
                    }}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
              ))}
              {!m.lessons.length && <p className="text-sm text-muted-foreground italic">No lessons yet.</p>}
            </div>
            <Button size="sm" variant="outline" onClick={() => setLessonForm({ module_id: m.id, title: '', video_url: '', content: '', is_free_preview: false, sort_order: m.lessons.length })}>
              <Plus className="w-4 h-4 mr-1" /> Add Lesson
            </Button>
          </CardContent>
        </Card>
      ))}

      {!isLoading && !modules?.length && (
        <Card><CardContent className="py-10 text-center text-muted-foreground">No modules yet. Add your first module above.</CardContent></Card>
      )}

      {/* Module dialog */}
      <Dialog open={!!moduleForm} onOpenChange={() => setModuleForm(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{moduleForm?.id ? 'Edit' : 'Add'} Module</DialogTitle></DialogHeader>
          {moduleForm && (
            <div className="space-y-3">
              <div>
                <Label>Title *</Label>
                <Input value={moduleForm.title} onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })} />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={moduleForm.description} onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setModuleForm(null)}>Cancel</Button>
            <Button
              disabled={!moduleForm?.title || saveModule.isPending}
              onClick={() => {
                if (!moduleForm) return;
                saveModule.mutate(
                  { id: moduleForm.id, course_id: courseId, title: moduleForm.title, description: moduleForm.description, sort_order: (modules?.length ?? 0) },
                  { onSuccess: () => setModuleForm(null) }
                );
              }}
            >Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lesson dialog */}
      <Dialog open={!!lessonForm} onOpenChange={() => setLessonForm(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{lessonForm?.id ? 'Edit' : 'Add'} Lesson</DialogTitle></DialogHeader>
          {lessonForm && (
            <div className="space-y-3">
              <div>
                <Label>Title *</Label>
                <Input value={lessonForm.title || ''} onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })} />
              </div>
              <div>
                <Label>Video URL (YouTube, Vimeo, or direct MP4)</Label>
                <Input placeholder="https://youtube.com/watch?v=..." value={lessonForm.video_url || ''} onChange={(e) => setLessonForm({ ...lessonForm, video_url: e.target.value })} />
              </div>
              <div>
                <Label>Lesson notes / content</Label>
                <Textarea rows={5} value={lessonForm.content || ''} onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Attachment URL</Label>
                  <Input placeholder="PDF or resource link" value={lessonForm.attachment_url || ''} onChange={(e) => setLessonForm({ ...lessonForm, attachment_url: e.target.value })} />
                </div>
                <div>
                  <Label>Duration (min)</Label>
                  <Input type="number" value={lessonForm.duration_minutes ?? ''} onChange={(e) => setLessonForm({ ...lessonForm, duration_minutes: e.target.value ? Number(e.target.value) : null })} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={!!lessonForm.is_free_preview} onCheckedChange={(v) => setLessonForm({ ...lessonForm, is_free_preview: v })} />
                <Label>Free preview (visible without purchase)</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setLessonForm(null)}>Cancel</Button>
            <Button
              disabled={!lessonForm?.title || saveLesson.isPending}
              onClick={() => {
                if (!lessonForm) return;
                saveLesson.mutate(
                  { ...lessonForm, course_id: courseId, title: lessonForm.title!, module_id: lessonForm.module_id! },
                  { onSuccess: () => setLessonForm(null) }
                );
              }}
            >Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCourseContent;
