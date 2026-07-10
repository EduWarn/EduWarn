import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PaymentVerification {
  id: string;
  user_id: string;
  course_id: string;
  payment_method: string;
  transaction_id: string;
  screenshot_url: string;
  status: string;
  rejection_reason?: string | null;
  created_at: string;
}

export const usePaymentVerifications = (status?: string) => {
  return useQuery({
    queryKey: ['payment-verifications', status ?? 'all'],
    queryFn: async () => {
      let q = supabase.from('payment_verifications').select('*').order('created_at', { ascending: false });
      if (status) q = q.eq('status', status);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as PaymentVerification[];
    },
  });
};

export const useApprovePayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase.rpc('approve_payment', { p_verification_id: id });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Payment approved. Student now has course access.');
      qc.invalidateQueries({ queryKey: ['payment-verifications'] });
    },
    onError: (e: any) => toast.error(e.message || 'Failed to approve payment'),
  });
};

export const useRejectPayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const { data, error } = await supabase.rpc('reject_payment', { p_verification_id: id, p_reason: reason });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Payment rejected.');
      qc.invalidateQueries({ queryKey: ['payment-verifications'] });
    },
    onError: (e: any) => toast.error(e.message || 'Failed to reject payment'),
  });
};

export const getScreenshotSignedUrl = async (path: string) => {
  const { data, error } = await supabase.storage
    .from('payment-screenshots')
    .createSignedUrl(path, 300);
  if (error) return null;
  return data.signedUrl;
};
