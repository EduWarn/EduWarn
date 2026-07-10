
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAdminCheck = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      try {
        // Check admin status from the database only
        const { data, error } = await supabase
          .from('admins')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();
        
        if (error) {
          setIsAdmin(false);
        } else {
          setIsAdmin(!!data);
        }
        
        setIsLoading(false);
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Admin check error:', error);
        }
        setIsAdmin(false);
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, [user, toast]);

  return { isAdmin, isLoading };
};
