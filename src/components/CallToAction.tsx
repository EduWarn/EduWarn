import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { useSectionContent } from '@/hooks/useSectionContent';

const CallToAction = () => {
  const navigate = useNavigate();
  const { data: content } = useSectionContent('cta_content');
  const c = content?.content as {
    title?: string;
    description?: string;
    benefits?: string[];
  } | undefined;

  return (
    <div className="py-16 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          {c?.title || 'Ready to Transform Your Academic Performance?'}
        </h2>
        <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
          {c?.description || 'Join EduWarn Nepal today and experience the difference in your grades and confidence'}
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-10">
          <Button variant="accent" className="text-lg animate-pulse-scale" onClick={() => navigate('/courses')}>
            Browse Courses
          </Button>
          <Button variant="outline" className="bg-white text-primary hover:bg-gray-100" onClick={() => navigate('/contact')}>
            Contact an Advisor
          </Button>
        </div>

        <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-10 text-lg">
          {(c?.benefits || ['No registration fee', 'Flexible payment options', 'Money-back guarantee']).map((benefit, i) => (
            <div key={i} className="flex items-center">
              <span className="bg-white text-primary rounded-full w-8 h-8 flex items-center justify-center mr-2 font-bold">✓</span>
              <span>{benefit}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CallToAction;
