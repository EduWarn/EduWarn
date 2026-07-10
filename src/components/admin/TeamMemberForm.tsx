
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import ImageUploader from '@/components/ImageUploader';
import { TeamMember } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface TeamMemberFormProps {
  member?: TeamMember;
  onSubmit: (data: Partial<TeamMember>) => void;
  isLoading?: boolean;
}

const TeamMemberForm: React.FC<TeamMemberFormProps> = ({ 
  member, 
  onSubmit, 
  isLoading 
}) => {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<Partial<TeamMember>>({
    defaultValues: member || {
      name: '',
      role: '',
      education: '',
      about: '',
      image: '',
      socialLinks: {
        email: '',
        phone: '',
        website: '',
        linkedin: '',
        twitter: '',
        facebook: ''
      }
    }
  });

  const handleImageUploaded = (imageUrl: string) => {
    setValue('image', imageUrl);
  };

  const handleSocialLinksChange = (field: string, value: string) => {
    setValue(`socialLinks.${field}` as any, value);
  };

  const submitHandler = (data: Partial<TeamMember>) => {
    if (!data.image) {
      toast.error('Please upload an image for the team member');
      return;
    }
    onSubmit(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{member ? 'Edit Team Member' : 'Add Team Member'}</CardTitle>
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
                placeholder="CEO"
              />
              {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>}
            </div>

            <div>
              <label htmlFor="education" className="block text-sm font-medium text-gray-700 mb-1">
                Education*
              </label>
              <Input
                id="education"
                {...register('education', { required: 'Education is required' })}
                placeholder="MSc in Computer Science"
              />
              {errors.education && <p className="mt-1 text-sm text-red-600">{errors.education.message}</p>}
            </div>

            <div>
              <label htmlFor="about" className="block text-sm font-medium text-gray-700 mb-1">
                About*
              </label>
              <Textarea
                id="about"
                {...register('about', { required: 'About is required' })}
                placeholder="Write a description about the team member..."
                rows={4}
              />
              {errors.about && <p className="mt-1 text-sm text-red-600">{errors.about.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Social Links
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="block text-sm text-gray-600 mb-1">Email</label>
                  <Input
                    id="socialLinks.email"
                    {...register('socialLinks.email')}
                    placeholder="john@example.com"
                    onChange={(e) => handleSocialLinksChange('email', e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm text-gray-600 mb-1">Phone</label>
                  <Input
                    id="socialLinks.phone"
                    {...register('socialLinks.phone')}
                    placeholder="+1 123 456 7890"
                    onChange={(e) => handleSocialLinksChange('phone', e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="website" className="block text-sm text-gray-600 mb-1">Website</label>
                  <Input
                    id="socialLinks.website"
                    {...register('socialLinks.website')}
                    placeholder="https://example.com"
                    onChange={(e) => handleSocialLinksChange('website', e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="linkedin" className="block text-sm text-gray-600 mb-1">LinkedIn</label>
                  <Input
                    id="socialLinks.linkedin"
                    {...register('socialLinks.linkedin')}
                    placeholder="https://linkedin.com/in/johnsmith"
                    onChange={(e) => handleSocialLinksChange('linkedin', e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="twitter" className="block text-sm text-gray-600 mb-1">Twitter</label>
                  <Input
                    id="socialLinks.twitter"
                    {...register('socialLinks.twitter')}
                    placeholder="https://twitter.com/johnsmith"
                    onChange={(e) => handleSocialLinksChange('twitter', e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="facebook" className="block text-sm text-gray-600 mb-1">Facebook</label>
                  <Input
                    id="socialLinks.facebook"
                    {...register('socialLinks.facebook')}
                    placeholder="https://facebook.com/johnsmith"
                    onChange={(e) => handleSocialLinksChange('facebook', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Profile Image*
              </label>
              <ImageUploader 
                onImageUploaded={handleImageUploaded} 
                currentImage={member?.image}
                type="team" 
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : (member ? 'Update Member' : 'Add Member')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default TeamMemberForm;
