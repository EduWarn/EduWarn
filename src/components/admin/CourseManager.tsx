
import React, { useState } from 'react';
import { useAdminCourses } from '@/hooks/useAdminCourses';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Course } from '@/types/database';
import { Check, Edit, Loader2, Plus, Search, Trash2, X } from 'lucide-react';
import ImageUploader from '@/components/ImageUploader';

const CourseManager = () => {
  const { courses, isLoading, createCourse, updateCourse, deleteCourse } = useAdminCourses();
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState<Partial<Course>>({
    title: '',
    description: '',
    duration: '',
    level: '',
    instructor: '',
    image_url: '',
    published: false
  });
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageUploaded = (imageUrl: string) => {
    setFormData(prev => ({ ...prev, image_url: imageUrl }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      duration: '',
      level: '',
      instructor: '',
      image_url: '',
      published: false
    });
    setEditingCourse(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!formData.title) {
        toast.error('Course title is required');
        return;
      }
      
      if (!formData.description) {
        toast.error('Course description is required');
        return;
      }
      
      // Create a complete course object for submission
      const courseData: Omit<Course, 'id' | 'created_at' | 'updated_at'> = {
        title: formData.title!,
        description: formData.description!,
        image_url: formData.image_url,
        duration: formData.duration,
        level: formData.level,
        instructor: formData.instructor,
        published: formData.published || false
      };
      
      if (editingCourse) {
        await updateCourse(editingCourse.id, courseData);
        toast.success('Course updated successfully');
      } else {
        await createCourse(courseData);
        toast.success('Course created successfully');
      }
      
      resetForm();
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    }
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData(course);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await deleteCourse(id);
        toast.success('Course deleted successfully');
      } catch (error: any) {
        toast.error(`Error: ${error.message}`);
      }
    }
  };

  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Course Management</h2>
      </div>
      
      <Tabs defaultValue="list">
        <TabsList className="mb-4">
          <TabsTrigger value="list">Course List</TabsTrigger>
          <TabsTrigger value="form">
            {editingCourse ? 'Edit Course' : 'New Course'}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="list">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>All Courses</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search courses..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button size="sm" onClick={() => resetForm()}>
                  <Plus className="h-4 w-4 mr-1" /> Add Course
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredCourses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchQuery ? 'No courses match your search' : 'No courses created yet'}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCourses.map((course) => (
                        <TableRow key={course.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{course.title}</p>
                              <p className="text-sm text-gray-500 truncate max-w-xs">
                                {course.duration && `${course.duration} • `}
                                {course.level || 'No level specified'}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            Rs. {course.price.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            {course.published ? (
                              <span className="flex items-center text-green-600">
                                <Check className="h-4 w-4 mr-1" /> Published
                              </span>
                            ) : (
                              <span className="flex items-center text-amber-600">
                                <X className="h-4 w-4 mr-1" /> Draft
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              className="mr-2"
                              onClick={() => handleEdit(course)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-500 hover:text-red-600"
                              onClick={() => handleDelete(course.id)}
                            >
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
        </TabsContent>
        
        <TabsContent value="form">
          <Card>
            <CardHeader>
              <CardTitle>
                {editingCourse ? `Edit Course: ${editingCourse.title}` : 'Create New Course'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Course Title*</label>
                    <Input
                      name="title"
                      value={formData.title || ''}
                      onChange={handleInputChange}
                      placeholder="e.g. Complete SEE Mathematics"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Duration</label>
                    <Input
                      name="duration"
                      value={formData.duration || ''}
                      onChange={handleInputChange}
                      placeholder="e.g. 6 weeks"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Difficulty Level</label>
                    <Input
                      name="level"
                      value={formData.level || ''}
                      onChange={handleInputChange}
                      placeholder="e.g. Intermediate"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Instructor</label>
                    <Input
                      name="instructor"
                      value={formData.instructor || ''}
                      onChange={handleInputChange}
                      placeholder="e.g. John Smith"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description*</label>
                  <Textarea
                    name="description"
                    value={formData.description || ''}
                    onChange={handleInputChange}
                    rows={6}
                    placeholder="Detailed description of the course"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Course Image</label>
                  <ImageUploader 
                    onImageUploaded={handleImageUploaded} 
                    currentImage={formData.image_url}
                    type="course"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="published"
                    name="published"
                    checked={formData.published || false}
                    onChange={handleInputChange}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <label htmlFor="published" className="text-sm text-gray-700">
                    Publish this course (make it visible to students)
                  </label>
                </div>
                
                <div className="flex space-x-2 pt-4">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {editingCourse ? 'Update Course' : 'Create Course'}
                  </Button>
                  {editingCourse && (
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CourseManager;
