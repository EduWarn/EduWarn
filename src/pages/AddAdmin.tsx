
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Shield, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { AdminRole } from '@/types/database';

const AddAdmin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isAdmin, isLoading: adminCheckLoading } = useAdminCheck();
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    email: '',
    role: 'content_editor' as AdminRole
  });

  // Only super admins can add other admins
  const canManageAdmins = isAdmin;

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !canManageAdmins) {
      toast.error('You do not have permission to add admins');
      return;
    }

    if (!formData.email) {
      toast.error('Please enter an email address');
      return;
    }
    
    setLoading(true);
    
    try {
      // Use supabase.functions.invoke which handles auth automatically
      
      const { data: userData, error: fnError } = await supabase.functions.invoke('get-user-by-email', {
        body: { email: formData.email },
      });
      
      if (fnError || !userData?.id) {
        throw new Error(userData?.error || 'Failed to find user');
      }
      
      const { error } = await supabase
        .from('admins')
        .insert([{ id: userData.id, role: formData.role }]);
      
      if (error) {
        if (error.code === '23505') {
          toast.error('This user is already an admin');
        } else {
          toast.error(`Failed to add admin: ${error.message}`);
        }
        return;
      }
      
      toast.success(`Successfully added ${formData.email} as ${formData.role}`);
      setFormData({ ...formData, email: '' });
      
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (adminCheckLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="animate-spin h-12 w-12 text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow flex items-center justify-center p-6">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Admin Management</h1>
            <p className="text-gray-600 mt-2">Add admin users to your application</p>
          </div>
          
          {!user && (
            <Alert className="bg-amber-50 border-amber-200">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-800">Login Required</AlertTitle>
              <AlertDescription className="text-amber-700">
                Please log in with an admin account to manage admin users.
              </AlertDescription>
            </Alert>
          )}

          {user && !canManageAdmins && (
            <Alert className="bg-red-50 border-red-200">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-800">Access Denied</AlertTitle>
              <AlertDescription className="text-red-700">
                Only existing administrators can add new admin users. Contact a super admin for access.
              </AlertDescription>
            </Alert>
          )}
          
          {user && canManageAdmins && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Add Admin User
                </CardTitle>
                <CardDescription>
                  Add admin privileges to an existing user by their email address.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddAdmin} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      User Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="user@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                      Admin Role
                    </label>
                    <select
                      id="role"
                      className="w-full px-3 py-2 border rounded-md"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as AdminRole })}
                    >
                      <option value="content_editor">Content Editor</option>
                      <option value="analytics_viewer">Analytics Viewer</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Add Admin User
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
          
          <div className="flex justify-center">
            <Button variant="outline" onClick={() => navigate('/admin')}>
              Go to Admin Dashboard
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AddAdmin;
