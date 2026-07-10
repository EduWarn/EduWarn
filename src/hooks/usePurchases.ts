
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Purchase {
  id: string;
  user_id: string;
  course_id: string;
  purchased_at: string | null;
  payment_status: string;
}

export const usePurchases = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["purchases", user?.id],
    queryFn: async (): Promise<Purchase[]> => {
      if (!user) return [];
      
      try {
        const { data, error } = await supabase
          .from("course_purchases")
          .select("*")
          .eq("user_id", user.id);
        
        if (error) {
          console.error("Error fetching purchases:", error);
          toast.error("Failed to load your purchased courses");
          throw error;
        }
        
        return data || [];
      } catch (error) {
        console.error("Error in purchases query:", error);
        return [];
      }
    },
    enabled: !!user,
  });
};

// Utility function to check if a user has purchased a specific course
export const hasUserPurchasedCourse = (purchases: Purchase[] | undefined, courseId: string): boolean => {
  if (!purchases || purchases.length === 0) return false;
  return purchases.some(purchase => 
    purchase.course_id === courseId && 
    purchase.payment_status === 'completed'
  );
};
