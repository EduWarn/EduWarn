
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { AdminUser, AdminRole } from '@/types/database';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Loader2, Shield, Edit, Trash2 } from 'lucide-react';

interface UserViewData {
  id: string;
  email: string;
  full_name: string;
}

const AdminUsers = () => {
  const { user } = useAuth();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<AdminRole>('content_editor');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const fetchAdmins = async () => {
    try {
      setLoading(true);
      
      // Fetch all admins
      const { data: adminsData, error: adminsError } = await supabase
        .from('admins')
        .select('*');
      
      if (adminsError) throw adminsError;
      
      // Get the access token for the edge function
      // Fetch admin user details via edge function
      
      // Call the edge function to get user details
      const { data: adminUsers, error: fnError } = await supabase.functions.invoke('get-admin-users');
      
      if (fnError || !adminUsers) {
        throw new Error('Failed to fetch admin user details');
      }
      
      // Combine admin roles with user details
      const adminsWithDetails = adminsData.map(admin => {
        const userDetails = adminUsers.find(user => user.id === admin.id);
        return {
          ...admin,
          email: userDetails?.email || 'Unknown email',
          full_name: userDetails?.full_name || 'Unknown User'
        } as AdminUser;
      });
      
      setAdmins(adminsWithDetails);
    } catch (error) {
      console.error('Error fetching admins:', error);
      toast.error('Failed to load admin users');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchAdmins();
  }, []);
  
  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail) {
      toast.error('Please enter an email address');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const { data: userData, error: fnError } = await supabase.functions.invoke('get-user-by-email', {
        body: { email: newAdminEmail },
      });
      
      if (fnError || !userData?.id) {
        throw new Error(userData?.error || 'Failed to find user');
      }
      
      // Now add as admin
      const { error } = await supabase
        .from('admins')
        .insert([
          {
            id: userData.id,
            role: newAdminRole,
          }
        ]);
      
      if (error) {
        if (error.code === '23505') {
          toast.error('This user is already an admin');
        } else {
          toast.error(`Failed to add admin: ${error.message}`);
        }
        return;
      }
      
      toast.success(`Successfully added ${newAdminEmail} as ${newAdminRole}`);
      setNewAdminEmail('');
      fetchAdmins();
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleRemoveAdmin = async (adminId: string) => {
    if (window.confirm('Are you sure you want to remove this admin?')) {
      try {
        const { error } = await supabase
          .from('admins')
          .delete()
          .match({ id: adminId });
        
        if (error) throw error;
        
        toast.success('Admin removed successfully');
        fetchAdmins();
      } catch (error: any) {
        toast.error(`Failed to remove admin: ${error.message}`);
      }
    }
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Admin Users</h2>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Add New Admin
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddAdmin} className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Email address"
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              className="flex-1"
            />
            <select
              className="px-3 py-2 border rounded-md"
              value={newAdminRole}
              onChange={(e) => setNewAdminRole(e.target.value as AdminRole)}
            >
              <option value="content_editor">Content Editor</option>
              <option value="analytics_viewer">Analytics Viewer</option>
              <option value="super_admin">Super Admin</option>
            </select>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Admin
            </Button>
          </form>
          <div className="mt-4 text-sm text-gray-500">
            <p>Role permissions:</p>
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li><strong>Super Admin:</strong> Full access to all features</li>
              <li><strong>Content Editor:</strong> Can manage courses and blog posts</li>
              <li><strong>Analytics Viewer:</strong> Can view insights and statistics</li>
            </ul>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Current Admins</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {admins.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                        No admin users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    admins.map((admin) => (
                      <TableRow key={admin.id}>
                        <TableCell>{admin.full_name}</TableCell>
                        <TableCell>{admin.email}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            admin.role === 'super_admin' 
                              ? 'bg-red-100 text-red-800' 
                              : admin.role === 'content_editor'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {admin.role.replace('_', ' ')}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mr-2"
                            onClick={() => toast.info('Edit functionality coming soon')}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-red-500 hover:text-red-600"
                            onClick={() => handleRemoveAdmin(admin.id)}
                            disabled={admin.id === user?.id}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsers;
