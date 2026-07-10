import React, { useEffect, useRef, useState } from 'react';
import { Award, BookOpen, TrendingUp, Users, CheckCircle, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { useSectionContent } from '@/hooks/useSectionContent';

const iconMap: Record<string, React.ReactNode> = {
  Award: <Award className="w-10 h-10 text-primary" />,
  BookOpen: <BookOpen className="w-10 h-10 text-primary" />,
  TrendingUp: <TrendingUp className="w-10 h-10 text-primary" />,
  Users: <Users className="w-10 h-10 text-primary" />,
  CheckCircle: <CheckCircle className="w-10 h-10 text-primary" />,
  Calendar: <Calendar className="w-10 h-10 text-primary" />,
};

const defaultFeatures = [
  { icon: 'Award', title: 'Expert Teachers', description: 'Learn from experienced educators with proven track records of student success' },
  { icon: 'BookOpen', title: 'Comprehensive Material', description: 'Access complete study materials, notes, question banks and practice tests' },
  { icon: 'TrendingUp', title: 'Performance Tracking', description: 'Monitor your progress with detailed analytics and improvement metrics' },
  { icon: 'Users', title: 'Small Batch Size', description: 'Personalized attention with limited students per class for better learning' },
  { icon: 'CheckCircle', title: 'Guaranteed Results', description: 'Our structured approach ensures excellent academic performance' },
  { icon: 'Calendar', title: 'Flexible Schedule', description: 'Choose from multiple batches to fit your convenience and learning pace' },
];

const FeatureCard = ({ feature, index }: { feature: { icon: string; title: string; description: string }; index: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`bg-background rounded-lg p-6 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: isVisible ? `${index * 100}ms` : '0ms' }}
    >
      <div className="mb-4">{iconMap[feature.icon] || <Award className="w-10 h-10 text-primary" />}</div>
      <h3 className="text-xl font-semibold mb-3 text-primary">{feature.title}</h3>
      <p className="text-muted-foreground">{feature.description}</p>
    </div>
  );
};

const FeatureSection = () => {
  const { data: content } = useSectionContent('features_content');
  const c = content?.content as {
    subtitle?: string;
    features?: { icon: string; title: string; description: string }[];
    guarantee_title?: string;
    guarantee_description?: string;
  } | undefined;

  const features = c?.features || defaultFeatures;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="py-16 bg-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            {content?.title || 'Why Choose EduWarn Nepal?'}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {c?.subtitle || 'We combine quality education with innovative teaching methods to deliver exceptional results'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </div>

        <div className="mt-16 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-8 shadow-inner text-center">
          <h3 className="text-2xl font-bold text-primary mb-4">
            {c?.guarantee_title || 'SEE 75%+ Marks Guarantee'}
          </h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            {c?.guarantee_description || "We're so confident in our teaching methodology that we guarantee a minimum of 75% marks in your SEE exams or get your money back."}
          </p>
          <Button variant="accent" className="inline-flex items-center px-6 py-3 rounded-lg font-bold cursor-pointer" onClick={scrollToTop}>
            <span>Start Your Success Journey Today!</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FeatureSection;
