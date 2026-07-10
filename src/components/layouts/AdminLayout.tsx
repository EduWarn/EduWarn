
import React, { useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { useToast } from '@/hooks/use-toast';
import { SidebarProvider } from '@/components/ui/sidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isLoading } = useAdminCheck();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Only proceed if both auth and admin checks are complete
    if (authLoading || isLoading) {
      return;
    }

    // If authentication check is complete and user is not logged in
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access admin features.",
        variant: "destructive",
      });
      navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`, { replace: true });
      return;
    }
    
    // If user is logged in but not an admin
    if (user && !isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have admin permissions to access this page.",
        variant: "destructive",
      });
      navigate("/unauthorized", { replace: true });
      return;
    }
  }, [user, authLoading, isAdmin, isLoading, navigate, location.pathname, toast]);

  // Show loading state while checking authentication and admin status
  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-primary mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-700">Checking admin permissions...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // Redirect to unauthorized page if not an admin
  if (!isAdmin) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  // User is authenticated and has admin permissions
  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col w-full">
        <Navbar />
        <div className="flex flex-grow">
          <AdminSidebar />
          <main className="flex-grow p-6 bg-gray-50">
            {children}
          </main>
        </div>
        <Footer />
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
