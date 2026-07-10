
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import ImageUploader from '@/components/ImageUploader';
import { Tutor } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface TutorFormProps {
  tutor?: Tutor;
  onSubmit: (data: Partial<Tutor>) => void;
  isLoading?: boolean;
}

const TutorForm: React.FC<TutorFormProps> = ({ 
  tutor, 
  onSubmit, 
  isLoading 
}) => {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<Partial<Tutor>>({
    defaultValues: tutor || {
      name: '',
      role: '',
      education: '',
      experience: '',
      specialization: '',
      rating: 5,
      reviews: 0,
      students: 0,
      about: '',
      image: ''
    }
  });

  const handleImageUploaded = (imageUrl: string) => {
    setValue('image', imageUrl);
  };

  const submitHandler = (data: Partial<Tutor>) => {
    if (!data.image) {
      toast.error('Please upload an image for the tutor');
      return;
    }
    onSubmit(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{tutor ? 'Edit Tutor' : 'Add Tutor'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(submitHandler)} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name*
              </label>
              <Input
                id="name"
                {...register('name', { required: 'Name is required' })}
                placeholder="John Smith"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Role/Position*
              </label>
              <Input
                id="role"
                {...register('role', { required: 'Role is required' })}
                placeholder="Mathematics Teacher"
              />
              {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="education" className="block text-sm font-medium text-gray-700 mb-1">
                  Education*
                </label>
                <Input
                  id="education"
                  {...register('education', { required: 'Education is required' })}
                  placeholder="MSc in Mathematics"
                />
                {errors.education && <p className="mt-1 text-sm text-red-600">{errors.education.message}</p>}
              </div>

              <div>
                <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-1">
                  Specialization*
                </label>
                <Input
                  id="specialization"
                  {...register('specialization', { required: 'Specialization is required' })}
                  placeholder="Calculus"
                />
                {errors.specialization && <p className="mt-1 text-sm text-red-600">{errors.specialization.message}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
                Experience*
              </label>
              <Input
                id="experience"
                {...register('experience', { required: 'Experience is required' })}
                placeholder="10+ years teaching mathematics"
              />
              {errors.experience && <p className="mt-1 text-sm text-red-600">{errors.experience.message}</p>}
            </div>

            <div>
              <label htmlFor="about" className="block text-sm font-medium text-gray-700 mb-1">
                About*
              </label>
              <Textarea
                id="about"
                {...register('about', { required: 'About is required' })}
                placeholder="Write a description about the tutor..."
                rows={4}
              />
              {errors.about && <p className="mt-1 text-sm text-red-600">{errors.about.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">
                  Rating (1-5)
                </label>
                <Input
                  id="rating"
                  type="number"
                  min={1}
                  max={5}
                  step={0.1}
                  {...register('rating', { 
                    valueAsNumber: true,
                    min: { value: 1, message: 'Rating must be at least 1' },
                    max: { value: 5, message: 'Rating cannot exceed 5' }
                  })}
                />
                {errors.rating && <p className="mt-1 text-sm text-red-600">{errors.rating.message}</p>}
              </div>

              <div>
                <label htmlFor="reviews" className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Reviews
                </label>
                <Input
                  id="reviews"
                  type="number"
                  min={0}
                  {...register('reviews', { valueAsNumber: true })}
                />
                {errors.reviews && <p className="mt-1 text-sm text-red-600">{errors.reviews.message}</p>}
              </div>

              <div>
                <label htmlFor="students" className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Students
                </label>
                <Input
                  id="students"
                  type="number"
                  min={0}
                  {...register('students', { valueAsNumber: true })}
                />
                {errors.students && <p className="mt-1 text-sm text-red-600">{errors.students.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tutor Image*
              </label>
              <ImageUploader 
                onImageUploaded={handleImageUploaded} 
                currentImage={tutor?.image}
                type="tutor" 
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : (tutor ? 'Update Tutor' : 'Add Tutor')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default TutorForm;
