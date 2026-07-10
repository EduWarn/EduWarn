
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { X, ArrowLeft } from 'lucide-react';
import PaymentMethodSelector from './PaymentMethodSelector';
import PaymentInstructions from './PaymentInstructions';
import PaymentVerification from './PaymentVerification';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface LocalPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: {
    id: string | number;
    title: string;
    discount_price?: number;
    discountPrice?: number;
    price?: number;
  } | null;
  onPaymentSubmit: (data: {
    courseId: string | number;
    paymentMethod: string;
    transactionId: string;
    screenshot: File;
  }) => void;
}

const LocalPaymentModal = ({ isOpen, onClose, course, onPaymentSubmit }: LocalPaymentModalProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  // Don't render if course is null
  if (!course) {
    return null;
  }

  const handleMethodSelect = (method: string) => {
    setSelectedMethod(method);
    setCurrentStep(2);
  };

  const handleVerificationSubmit = async (data: { transactionId: string; screenshot: File | null }) => {
    if (!data.screenshot || !user) return;
    
    setIsSubmitting(true);
    try {
      // Upload screenshot to Supabase storage
      const fileExt = data.screenshot.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('payment-screenshots')
        .upload(fileName, data.screenshot);

      if (uploadError) {
        throw new Error('Failed to upload screenshot');
      }

      // Save payment verification to database
      const { error: insertError } = await supabase
        .from('payment_verifications')
        .insert({
          user_id: user.id,
          course_id: course.id.toString(),
          payment_method: selectedMethod,
          transaction_id: data.transactionId,
          screenshot_url: uploadData.path,
          status: 'pending'
        });

      if (insertError) {
        throw new Error('Failed to save payment verification');
      }
      
      toast.success('Payment verification submitted successfully!');
      onClose();
      setCurrentStep(1);
      setSelectedMethod('');
    } catch (error) {
      console.error('Payment submission error:', error);
      toast.error('Failed to submit payment verification');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    onClose();
    setCurrentStep(1);
    setSelectedMethod('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {currentStep > 1 && (
                <Button variant="ghost" size="sm" onClick={handleBack}>
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              )}
              <DialogTitle>
                {currentStep === 1 && 'Choose Payment Method'}
                {currentStep === 2 && 'Payment Instructions'}
                {currentStep === 3 && 'Verify Payment'}
              </DialogTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted p-3 rounded-lg">
            <h3 className="font-semibold">{course.title}</h3>
            <p className="text-lg font-bold text-primary">Rs. {course.discount_price || course.discountPrice || course.price}</p>
          </div>

          {currentStep === 1 && (
            <PaymentMethodSelector
              onMethodSelect={handleMethodSelect}
              selectedMethod={selectedMethod}
            />
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <PaymentInstructions 
                method={selectedMethod} 
                amount={course.discount_price || course.discountPrice || course.price || 0} 
              />
              <Button 
                onClick={() => setCurrentStep(3)} 
                className="w-full"
              >
                I've Made the Payment
              </Button>
            </div>
          )}

          {currentStep === 3 && (
            <PaymentVerification
              onSubmit={handleVerificationSubmit}
              isSubmitting={isSubmitting}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LocalPaymentModal;
