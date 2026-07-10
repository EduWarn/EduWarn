import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminBlogs } from '@/hooks/useAdminBlogs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BlogPost } from '@/types/database';
import { toast } from 'sonner';
import { Loader2, Edit, Trash2, Check, X, Search } from 'lucide-react';
import ImageUploader from '@/components/ImageUploader';
import TipTapEditor from '@/components/editor/TipTapEditor';

type BlogFormData = Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>;

const initialFormState: BlogFormData = {
  title: '',
  slug: '',
  content: '',
  excerpt: '',
  featured_image: '',
  author_id: '',
  published: false,
  tags: []
};

const BlogManager = () => {
  const { user } = useAuth();
  const { blogs, isLoading, createBlog, updateBlog, deleteBlog } = useAdminBlogs();
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState<BlogFormData>(initialFormState);
  const [editorContent, setEditorContent] = useState('');

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, '-');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData(prev => ({
      ...prev,
      title,
      ...(editingBlog ? {} : { slug: generateSlug(title) }),
    }));
  };

  const handleFieldChange = (field: keyof BlogFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tagsArray = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean);
    setFormData(prev => ({ ...prev, tags: tagsArray }));
  };

  const handleImageUploaded = (imageUrl: string) => {
    setFormData(prev => ({ ...prev, featured_image: imageUrl }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error('You must be logged in'); return; }
    if (!formData.title || !formData.slug) { toast.error('Title and slug are required'); return; }
    if (!editorContent.trim()) { toast.error('Content is required'); return; }

    try {
      const submitData = {
        ...formData,
        content: editorContent,
        author_id: user.id,
      };

      if (editingBlog) {
        await updateBlog(editingBlog.id, submitData);
      } else {
        await createBlog(submitData);
      }
      resetForm();
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    }
  };

  const resetForm = () => {
    setEditingBlog(null);
    setFormData(initialFormState);
    setEditorContent('');
  };

  const handleEdit = (blog: BlogPost) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title,
      slug: blog.slug,
      content: blog.content,
      excerpt: blog.excerpt || '',
      featured_image: blog.featured_image || '',
      author_id: blog.author_id,
      published: blog.published,
      tags: Array.isArray(blog.tags) ? blog.tags : [],
    });
    setEditorContent(blog.content);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      try {
        await deleteBlog(id);
      } catch (error: any) {
        toast.error(`Error: ${error.message}`);
      }
    }
  };

  const filteredBlogs = blogs.filter(blog =>
    blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (blog.excerpt && blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Blog Management</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{editingBlog ? 'Edit Blog Post' : 'Create New Blog Post'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input value={formData.title} onChange={handleTitleChange} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Slug</label>
                <Input value={formData.slug} onChange={e => handleFieldChange('slug', e.target.value)} required />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Excerpt</label>
              <Textarea
                value={formData.excerpt}
                onChange={e => handleFieldChange('excerpt', e.target.value)}
                placeholder="Brief summary of the blog post"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Content</label>
              <TipTapEditor
                content={editorContent}
                onChange={setEditorContent}
                placeholder="Write your article with headings, images, highlights..."
              />
              <p className="text-xs text-muted-foreground">
                Use the toolbar to add headings, bold, italic, highlights, images, lists and more.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tags (comma separated)</label>
                <Input
                  value={formData.tags.join(', ')}
                  onChange={handleTagsChange}
                  placeholder="e.g. education, tips, news"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium">Published</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="published"
                    checked={formData.published}
                    onChange={e => handleFieldChange('published', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <label htmlFor="published" className="text-sm text-muted-foreground">Make this post public</label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Featured Image</label>
              <ImageUploader
                onImageUploaded={handleImageUploaded}
                currentImage={formData.featured_image || undefined}
                type="blog"
              />
            </div>

            <div className="flex space-x-2 pt-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingBlog ? 'Update Post' : 'Create Post'}
              </Button>
              {editingBlog && (
                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Blog Posts</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search blog posts..." className="pl-8" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : filteredBlogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">{searchQuery ? 'No blog posts match your search' : 'No blog posts yet'}</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBlogs.map((blog) => (
                    <TableRow key={blog.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium truncate max-w-xs">{blog.title}</p>
                          <p className="text-sm text-muted-foreground truncate max-w-xs">{blog.excerpt || 'No excerpt'}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {blog.published ? (
                          <span className="flex items-center text-green-600"><Check className="h-4 w-4 mr-1" /> Published</span>
                        ) : (
                          <span className="flex items-center text-amber-600"><X className="h-4 w-4 mr-1" /> Draft</span>
                        )}
                      </TableCell>
                      <TableCell>{new Date(blog.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" className="mr-2" onClick={() => handleEdit(blog)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(blog.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BlogManager;
