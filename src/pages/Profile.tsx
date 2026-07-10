
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Pencil, Save, User as UserIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { usePurchases } from '@/hooks/usePurchases';
import { Badge } from '@/components/ui/badge';
import ImageUploader from '@/components/ImageUploader';

interface UserProfile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  education: string | null;
  interests: string[] | null;
  created_at: string;
}

const Profile = () => {
  const { user } = useAuth();
  const { data: purchases, isLoading: loadingPurchases } = usePurchases();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    education: '',
    interests: ''
  });
  const [courses, setCourses] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        // For now, we'll use user metadata instead of profiles table
        // since the profiles table doesn't exist in the current database schema
        const profileData: UserProfile = {
          id: user.id,
          full_name: user.user_metadata?.full_name || '',
          avatar_url: user.user_metadata?.avatar_url || null,
          bio: null,
          education: null,
          interests: null,
          created_at: user.created_at || new Date().toISOString()
        };
        
        setProfile(profileData);
        setFormData({
          full_name: profileData.full_name,
          bio: profileData.bio || '',
          education: profileData.education || '',
          interests: profileData.interests ? profileData.interests.join(', ') : ''
        });
      } catch (error) {
        console.error('Profile fetch error:', error);
        toast.error('An error occurred while loading your profile');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [user]);
  
  useEffect(() => {
    const fetchCourses = async () => {
      const completedPurchases = purchases?.filter(p => p.payment_status === 'completed') || [];
      if (completedPurchases.length === 0) {
        setCourses([]);
        return;
      }
      
      try {
        const courseIds = completedPurchases.map(p => p.course_id);
        const { data, error } = await (await import('@/integrations/supabase/client')).supabase
          .from('courses')
          .select('*')
          .in('id', courseIds);
        
        if (error) throw error;
        setCourses(data || []);
      } catch (error) {
        console.error('Error fetching course details:', error);
      }
    };
    
    fetchCourses();
  }, [purchases]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSaveProfile = async () => {
    try {
      // For now, we'll just update the local state since we don't have a profiles table
      const updatedProfile = {
        ...profile!,
        full_name: formData.full_name,
        bio: formData.bio || null,
        education: formData.education || null,
        interests: formData.interests ? formData.interests.split(',').map(i => i.trim()).filter(Boolean) : null
      };
      
      setProfile(updatedProfile);
      toast.success('Profile updated successfully');
      setEditing(false);
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('An error occurred while updating your profile');
    }
  };
  
  const handleAvatarUploaded = async (imageUrl: string) => {
    try {
      if (!user || !profile) return;
      
      const updatedProfile = { ...profile, avatar_url: imageUrl };
      setProfile(updatedProfile);
      toast.success('Profile picture updated successfully');
    } catch (error) {
      console.error('Avatar update error:', error);
      toast.error('An error occurred while updating your profile picture');
    }
  };
  
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container mx-auto px-4 py-12 flex-grow flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Sign in Required</h2>
                <p className="mb-6">Please sign in to view your profile.</p>
                <Button onClick={() => window.location.href = '/login?redirect=/profile'}>
                  Sign In
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Student Profile</h1>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column - Avatar & Basic Info */}
              <div className="md:col-span-1">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Profile Photo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center text-center">
                      <div className="w-32 h-32 mb-4">
                        {!editing ? (
                          <Avatar className="w-32 h-32 border-2 border-gray-100">
                            {profile?.avatar_url || user.user_metadata?.avatar_url ? (
                              <AvatarImage 
                                src={profile?.avatar_url || user.user_metadata?.avatar_url} 
                                alt={profile?.full_name || user.user_metadata?.full_name || "User"}
                              />
                            ) : null}
                            <AvatarFallback className="text-4xl bg-primary text-primary-foreground">
                              <UserIcon className="h-12 w-12" />
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <ImageUploader 
                            onImageUploaded={handleAvatarUploaded}
                            currentImage={profile?.avatar_url || user.user_metadata?.avatar_url}
                            type="tutor"
                          />
                        )}
                      </div>
                      
                      <h2 className="text-xl font-semibold mb-1">
                        {profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0]}
                      </h2>
                      <p className="text-gray-500 text-sm">{user.email}</p>
                      
                      {!editing && (
                        <Button 
                          variant="outline" 
                          className="mt-4"
                          onClick={() => setEditing(true)}
                        >
                          <Pencil className="h-4 w-4 mr-2" /> Edit Profile
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Right Column - Profile Details */}
              <div className="md:col-span-2">
                <Card className="mb-6">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex justify-between">
                      <span>Student Information</span>
                      {editing && (
                        <Button 
                          onClick={handleSaveProfile} 
                          size="sm"
                        >
                          <Save className="h-4 w-4 mr-2" /> Save Changes
                        </Button>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {editing ? (
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="full_name" className="block text-sm font-medium mb-1">Full Name</label>
                          <Input
                            id="full_name"
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleInputChange}
                            placeholder="Your full name"
                          />
                        </div>
                        <div>
                          <label htmlFor="education" className="block text-sm font-medium mb-1">Education</label>
                          <Input
                            id="education"
                            name="education"
                            value={formData.education}
                            onChange={handleInputChange}
                            placeholder="Your education background"
                          />
                        </div>
                        <div>
                          <label htmlFor="bio" className="block text-sm font-medium mb-1">Bio</label>
                          <Textarea
                            id="bio"
                            name="bio"
                            value={formData.bio}
                            onChange={handleInputChange}
                            placeholder="Tell us about yourself"
                            rows={4}
                          />
                        </div>
                        <div>
                          <label htmlFor="interests" className="block text-sm font-medium mb-1">Interests (comma separated)</label>
                          <Input
                            id="interests"
                            name="interests"
                            value={formData.interests}
                            onChange={handleInputChange}
                            placeholder="Science, Mathematics, Literature"
                          />
                        </div>
                        <div className="pt-2 text-right">
                          <Button 
                            variant="outline" 
                            onClick={() => setEditing(false)} 
                            className="mr-2"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {profile?.bio && (
                          <div>
                            <h3 className="font-semibold text-sm text-gray-500">About</h3>
                            <p className="mt-1">{profile.bio}</p>
                          </div>
                        )}
                        
                        {profile?.education && (
                          <div>
                            <h3 className="font-semibold text-sm text-gray-500">Education</h3>
                            <p className="mt-1">{profile.education}</p>
                          </div>
                        )}
                        
                        {profile?.interests && profile.interests.length > 0 && (
                          <div>
                            <h3 className="font-semibold text-sm text-gray-500">Interests</h3>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {profile.interests.map((interest, idx) => (
                                <Badge key={idx} variant="secondary">
                                  {interest}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {(!profile?.bio && !profile?.education && !profile?.interests) && (
                          <div className="text-gray-500 italic">
                            No profile information added yet. Click Edit Profile to add details.
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>My Courses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingPurchases ? (
                      <div className="flex justify-center py-6">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : courses.length > 0 ? (
                      <div className="grid grid-cols-1 gap-4">
                        {courses.map((course) => (
                          <div key={course.id} className="flex border rounded-md p-4">
                            <div className="flex-shrink-0 w-16 h-16 md:w-24 md:h-24 bg-gray-100 rounded-md overflow-hidden">
                              {course.image_url ? (
                                <img 
                                  src={course.image_url} 
                                  alt={course.title} 
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                  <UserIcon className="h-6 w-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4 flex-1">
                              <h3 className="font-medium">{course.title}</h3>
                              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{course.description}</p>
                              <div className="mt-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => window.location.href = `/course/${course.id}`}
                                >
                                  View Course
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-gray-500 mb-4">You haven't enrolled in any courses yet.</p>
                        <Button onClick={() => window.location.href = '/courses'}>
                          Browse Courses
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
