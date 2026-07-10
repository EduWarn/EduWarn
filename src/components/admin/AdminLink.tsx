
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ShieldCheck, Settings } from 'lucide-react';

interface AdminLinkProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  className?: string;
  mobile?: boolean;
}

const AdminLink: React.FC<AdminLinkProps> = ({ variant = 'outline', className = '', mobile = false }) => {
  const { isAdmin, isLoading } = useAdminCheck();
  const { user } = useAuth();
  const [hasAdmins, setHasAdmins] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAdminExists = async () => {
      try {
        const { count, error } = await supabase
          .from('admins')
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          console.error('Error checking admin count:', error);
          setHasAdmins(true); // Default to true on error
          return;
        }
        
        setHasAdmins(count !== null && count > 0);
      } catch (err) {
        console.error('Failed to check admin count:', err);
        setHasAdmins(true); // Default to true on error
      }
    };
    
    checkAdminExists();
  }, []);

  // Show admin setup link if logged in and no admins exist
  if (user && hasAdmins === false && !isLoading) {
    if (mobile) {
      return (
        <Button 
          variant="secondary"
          className={`w-full flex items-center gap-2 ${className}`}
          asChild
        >
          <Link to="/admin/setup">
            <Settings size={18} />
            Admin Setup
          </Link>
        </Button>
      );
    }

    return (
      <Button 
        variant="secondary"
        className={`flex items-center gap-2 ${className}`}
        asChild
      >
        <Link to="/admin/setup">
          <Settings size={18} />
          Setup Admin
        </Link>
      </Button>
    );
  }

  if (isLoading || !isAdmin) {
    return null;
  }

  if (mobile) {
    return (
      <Button 
        variant={variant}
        className={`w-full flex items-center gap-2 ${className}`}
        asChild
      >
        <Link to="/admin">
          <ShieldCheck size={18} />
          Admin Dashboard
        </Link>
      </Button>
    );
  }

  return (
    <Button 
      variant={variant}
      className={`flex items-center gap-2 ${className}`}
      asChild
    >
      <Link to="/admin">
        <ShieldCheck size={18} />
        Admin
      </Link>
    </Button>
  );
};

export default AdminLink;
