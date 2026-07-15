import React from 'react';
import { Star } from 'lucide-react';
import { Button } from './ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from './ui/skeleton';

const TestimonialSection = () => {
  const { data: testimonials = [], isLoading } = useQuery({
    queryKey: ['testimonials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(6);
      if (error) throw error;
      return data;
    },
  });

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            Learning stories from our community
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Hear from students who found practical, engaging support through our free learning resources.
          </p>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card rounded-xl p-6 shadow-lg border">
                <div className="flex items-center mb-4">
                  <Skeleton className="w-14 h-14 rounded-full mr-4" />
                  <div>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-3 w-full mb-2" />
                <Skeleton className="h-3 w-full mb-2" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            ))}
          </div>
        ) : testimonials.length === 0 ? (
          <p className="text-center text-muted-foreground">No success stories yet. Check back soon!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-card rounded-xl p-6 shadow-lg border">
                <div className="flex items-center mb-4">
                  <img 
                    src={testimonial.image_url || `https://placehold.co/100/1E2A78/FFFFFF?text=${testimonial.name.split(' ').map(n => n[0]).join('')}`} 
                    alt={testimonial.name} 
                    className="w-14 h-14 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
                
                <div className="flex text-accent mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={16} 
                      fill={i < testimonial.rating ? "#FFC107" : "none"} 
                      stroke="#FFC107"
                    />
                  ))}
                </div>
                
                <p className="text-muted-foreground italic">"{testimonial.text}"</p>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-12 text-center">
          <p className="text-lg text-primary mb-6">Join students who are learning with more clarity, more confidence, and more freedom.</p>
          <Button 
            className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
            onClick={scrollToTop}
          >
            Explore Free Courses
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TestimonialSection;
