import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Mail, PhoneCall, Globe, Award } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { useSectionContent } from '@/hooks/useSectionContent';
import { Helmet } from 'react-helmet-async';

const About = () => {
  const { data: teamMembers = [], isLoading } = useQuery({
    queryKey: ['team-members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('published', true)
        .eq('role', 'team_member')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const { data: storyContent } = useSectionContent('about_story_content');
  const { data: partnerContent } = useSectionContent('about_partner_content');
  const { data: valuesContent } = useSectionContent('about_values_content');

  const story = storyContent?.content as { paragraphs?: string[] } | undefined;
  const partner = partnerContent?.content as { name?: string; description?: string; logo_url?: string; website_url?: string } | undefined;
  const values = valuesContent?.content as { values?: { title: string; description: string }[] } | undefined;

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>About EduWarn Nepal | Free Home Tuition & Online Learning Platform</title>
        <meta name="description" content="Learn about EduWarn Nepal's mission to provide free, practical home tuition and online courses for SEE, Grade 11-12, IELTS, and LokSewa exam preparation in Nepal." />
      </Helmet>
      <Navbar />

      <div className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">About EduWarn Nepal</h1>
          <p className="text-lg max-w-3xl">Learn about our journey, mission, and the dedicated team building a free, practical, and engaging learning experience for Nepal.</p>
        </div>
      </div>

      <div className="flex-grow py-12 bg-background">
        <div className="container mx-auto px-4">
          {/* Our Story */}
          <div className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-6">{storyContent?.title || 'Our Story'}</h2>
            <div className="bg-card p-8 rounded-xl shadow-md border">
              {story?.paragraphs?.map((p, i) => (
                <p key={i} className={`text-muted-foreground ${i < (story.paragraphs?.length ?? 0) - 1 ? 'mb-4' : ''}`}>{p}</p>
              )) || (
                <><Skeleton className="h-4 w-full mb-2" /><Skeleton className="h-4 w-full mb-2" /><Skeleton className="h-4 w-3/4" /></>
              )}
            </div>
          </div>

          {/* Partner */}
          <div className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-6">{partnerContent?.title || 'Our Partner'}</h2>
            <div className="bg-card p-8 rounded-xl shadow-md flex flex-col items-center border">
              <a href={partner?.website_url || '#'} target="_blank" rel="noopener noreferrer" className="inline-block transition-transform hover:scale-105">
                <img src={partner?.logo_url || '/team-members/235124e9-bd6a-4b9c-94cb-01a562ef1798.png'} alt={partner?.name || 'Partner'} className="max-w-full h-auto max-h-48 mb-4" />
              </a>
              <h3 className="text-xl font-bold text-primary mb-2">{partner?.name || 'EduWarn Nepal'}</h3>
              <p className="text-muted-foreground text-center max-w-2xl mb-4">{partner?.description || ''}</p>
              <a href={partner?.website_url || '#'} target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline font-medium flex items-center gap-2">
                <Globe size={16} />Visit {partner?.name || 'Partner'}
              </a>
            </div>
          </div>

          {/* Team */}
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-6">Our Team</h2>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i}><CardContent className="p-6 space-y-3">
                    <div className="flex items-center gap-4"><Skeleton className="h-16 w-16 rounded-full" /><div className="space-y-2"><Skeleton className="h-4 w-28" /><Skeleton className="h-3 w-20" /></div></div>
                    <Skeleton className="h-12 w-full" />
                  </CardContent></Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teamMembers.map((member) => (
                  <Card key={member.id} className="overflow-hidden transition-all hover:shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={member.image_url || undefined} alt={member.name} />
                          <AvatarFallback className="bg-primary text-primary-foreground">{member.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-lg font-bold text-primary">{member.name}</h3>
                          <p className="text-secondary font-medium text-sm">{member.role}</p>
                          <p className="text-muted-foreground text-sm mt-1">{member.education}</p>
                        </div>
                      </div>
                      <p className="text-muted-foreground mb-4 text-sm">{member.about}</p>
                      <div className="space-y-1 text-sm">
                        {member.whatsapp && (<div className="flex items-center"><PhoneCall size={14} className="text-primary mr-2" /><a href={`https://wa.me/${String(member.whatsapp).replace(/[^0-9]/g,'')}`} target="_blank" rel="noreferrer" className="text-secondary hover:underline">WhatsApp</a></div>)}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Values */}
          <div className="mt-16 text-center">
            <div className="inline-flex items-center justify-center bg-primary/10 px-4 py-2 rounded-full text-primary font-medium mb-4">
              <Award size={18} className="mr-2" />{valuesContent?.title || 'Our Values'}
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-6">What Makes EduWarn Nepal Special</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-4xl mx-auto">
              {(values?.values || [
                { title: 'Excellence', description: 'We strive for excellence in every aspect of our educational services.' },
                { title: 'Accessibility', description: 'Quality education should be accessible to all students.' },
                { title: 'Innovation', description: 'We continuously innovate and leverage technology to enhance learning.' },
              ]).map((v, i) => (
                <div key={i} className="bg-card p-6 rounded-lg shadow border">
                  <h3 className="font-bold text-lg mb-2 text-primary">{v.title}</h3>
                  <p className="text-muted-foreground">{v.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default About;
