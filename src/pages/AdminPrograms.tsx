import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Star, StarOff, Eye, EyeOff, CalendarDays } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAllProgramsAdmin, Program } from '@/hooks/usePrograms';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const emptyForm = {
  title: '',
  slug: '',
  type: 'Event',
  description: '',
  image_url: '',
  date: '',
  location: '',
  featured: false,
  sort_order: 0,
  is_active: true,
};

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const AdminPrograms: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: programs = [], isLoading } = useAllProgramsAdmin();
  const [editing, setEditing] = useState<Program | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (p: Program) => {
    setEditing(p);
    setForm({
      title: p.title,
      slug: p.slug,
      type: p.type,
      description: p.description,
      image_url: p.image_url ?? '',
      date: p.date ?? '',
      location: p.location ?? '',
      featured: p.featured,
      sort_order: p.sort_order,
      is_active: p.is_active,
    });
    setOpen(true);
  };

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['programs-admin'] });
    queryClient.invalidateQueries({ queryKey: ['programs'] });
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `programs/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from('images').upload(path, file, { upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from('images').getPublicUrl(path);
      setForm((f) => ({ ...f, image_url: data.publicUrl }));
      toast.success('Image uploaded');
    } catch (e: any) {
      toast.error(e.message ?? 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (!form.title.trim()) return toast.error('Title is required');
    setSaving(true);
    try {
      const slug = form.slug.trim() || slugify(form.title);
      const payload = { ...form, slug };
      if (editing) {
        const { error } = await supabase.from('programs').update(payload).eq('id', editing.id);
        if (error) throw error;
        toast.success('Program updated');
      } else {
        const { error } = await supabase.from('programs').insert(payload);
        if (error) throw error;
        toast.success('Program created');
      }
      setOpen(false);
      refresh();
    } catch (e: any) {
      toast.error(e.message ?? 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (p: Program) => {
    const { error } = await supabase.from('programs').delete().eq('id', p.id);
    if (error) return toast.error(error.message);
    toast.success('Program deleted');
    refresh();
  };

  const toggle = async (p: Program, field: 'featured' | 'is_active') => {
    const { error } = await supabase.from('programs').update({ [field]: !p[field] }).eq('id', p.id);
    if (error) return toast.error(error.message);
    refresh();
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">Programs & Events</h1>
          <p className="text-sm text-muted-foreground">Manage bootcamps, workshops and events shown on the site.</p>
        </div>
        <Button onClick={openNew}><Plus className="mr-2 h-4 w-4" /> New Program</Button>
      </div>

      {isLoading ? (
        <p>Loading…</p>
      ) : programs.length === 0 ? (
        <div className="text-center py-16 border rounded-xl">
          <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No programs yet. Click "New Program" to add your first one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {programs.map((p) => (
            <div key={p.id} className="border rounded-xl overflow-hidden bg-card flex flex-col">
              <div className="aspect-video bg-muted overflow-hidden">
                {p.image_url
                  ? <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
                  : <div className="w-full h-full grid place-items-center text-muted-foreground"><CalendarDays /></div>}
              </div>
              <div className="p-4 flex-1 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-primary">{p.title}</h3>
                    <p className="text-xs text-muted-foreground">{p.type} · order {p.sort_order}</p>
                  </div>
                  <div className="flex gap-1">
                    {p.featured && <span className="text-xs bg-secondary/10 text-secondary px-2 py-0.5 rounded-full">Featured</span>}
                    {!p.is_active && <span className="text-xs bg-muted px-2 py-0.5 rounded-full">Hidden</span>}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{p.description}</p>
                <div className="mt-auto flex flex-wrap gap-2 pt-3">
                  <Button size="sm" variant="outline" onClick={() => openEdit(p)}><Pencil className="h-3 w-3 mr-1" /> Edit</Button>
                  <Button size="sm" variant="outline" onClick={() => toggle(p, 'featured')}>
                    {p.featured ? <StarOff className="h-3 w-3 mr-1" /> : <Star className="h-3 w-3 mr-1" />}
                    {p.featured ? 'Unfeature' : 'Feature'}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => toggle(p, 'is_active')}>
                    {p.is_active ? <EyeOff className="h-3 w-3 mr-1" /> : <Eye className="h-3 w-3 mr-1" />}
                    {p.is_active ? 'Hide' : 'Show'}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="destructive"><Trash2 className="h-3 w-3 mr-1" /> Delete</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete "{p.title}"?</AlertDialogTitle>
                        <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => remove(p)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Program' : 'New Program'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Slug (URL)</Label>
                <Input value={form.slug} placeholder="auto from title" onChange={(e) => setForm({ ...form, slug: e.target.value })} />
              </div>
              <div>
                <Label>Type</Label>
                <Input value={form.type} placeholder="Bootcamp, Workshop, Seminar…" onChange={(e) => setForm({ ...form, type: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Date (display text)</Label>
                <Input value={form.date} placeholder="Jan 15, 2026" onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
              <div>
                <Label>Location</Label>
                <Input value={form.location} placeholder="Kathmandu / Online" onChange={(e) => setForm({ ...form, location: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Image</Label>
              <Input value={form.image_url} placeholder="https://…" onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
              <div className="mt-2 flex items-center gap-3">
                <Input type="file" accept="image/*" disabled={uploading}
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} />
                {uploading && <span className="text-xs text-muted-foreground">Uploading…</span>}
              </div>
              {form.image_url && <img src={form.image_url} alt="preview" className="mt-2 h-32 rounded-md object-cover" />}
            </div>
            <div className="grid grid-cols-3 gap-3 items-center">
              <div>
                <Label>Sort order</Label>
                <Input type="number" value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) || 0 })} />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} />
                <Label>Featured on homepage</Label>
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
                <Label>Active (visible)</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPrograms;
