import React from 'react';
import { Globe } from 'lucide-react';
import { useSectionContent } from '@/hooks/useSectionContent';

const PartnerSection = () => {
  const { data: content } = useSectionContent('partner_section_content');
  const c = content?.content as {
    name?: string;
    description?: string;
    logo_url?: string;
    website_url?: string;
  } | undefined;

  return (
    <div className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-primary mb-6 text-center">Our Partner</h2>
        <div className="bg-card p-8 rounded-xl shadow-md flex flex-col items-center max-w-4xl mx-auto border">
          <a href={c?.website_url || 'https://www.eduwarnnepal.com'} target="_blank" rel="noopener noreferrer" className="inline-block transition-transform hover:scale-105">
            <img src={c?.logo_url || '/team-members/sajilo-tuition-logo.jpeg'} alt={c?.name || 'Sajilo Tuition'} className="max-w-full h-auto max-h-48 mb-4" />
          </a>
          <h3 className="text-xl font-bold text-primary mb-2">{c?.name || 'EduWarn Nepal'}</h3>
          <p className="text-muted-foreground text-center max-w-2xl mb-4">
            {c?.description || "We're proud to partner with EduWarn Nepal, a leading educational organization dedicated to empowering students through innovative learning solutions."}
          </p>
          <a href={c?.website_url || 'https://www.eduwarnnepal.com'} target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline font-medium flex items-center gap-2">
            <Globe size={16} />
            Visit {c?.name || 'Sajilo Tuition'}
          </a>
        </div>
      </div>
    </div>
  );
};

export default PartnerSection;
