
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { CheckCircle, BookOpen, Home } from 'lucide-react';
import { toast } from 'sonner';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('course_id');

  useEffect(() => {
    toast.success("Payment successful! Welcome to your new course.");
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-grow flex items-center justify-center py-12 bg-background">
        <div className="max-w-md w-full mx-auto text-center">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
            
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Payment Successful!
            </h1>
            
            <p className="text-gray-600 mb-6">
              Thank you for your purchase. You now have access to your course content.
            </p>
            
            <div className="space-y-3">
              {courseId && (
                <Button 
                  className="w-full"
                  onClick={() => navigate(`/course/${courseId}`)}
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Go to Course
                </Button>
              )}
              
              <Button 
                variant="outline"
                className="w-full"
                onClick={() => navigate('/courses')}
              >
                Browse More Courses
              </Button>
              
              <Button 
                variant="ghost"
                className="w-full"
                onClick={() => navigate('/')}
              >
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PaymentSuccess;
