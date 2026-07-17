import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { Mail, PhoneCall, Globe, Award, Star, BookOpen, MessageSquare } from 'lucide-react';
import { initiateWhatsAppChat } from '@/utils/contactHelpers';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';


const Tutors = () => {
  const navigate = useNavigate();
  const { data: tutors = [], isLoading } = useQuery({
    queryKey: ['tutors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('published', true)
        .eq('role', 'tutor')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const handleRequestCall = (tutor: any) => {
    if (tutor.whatsapp) {
      const message = `Hello ${tutor.name}, I would like to request a call regarding EduWarn Nepal services.`;
      initiateWhatsAppChat(tutor.whatsapp, message);
    } else {
      toast.error("WhatsApp contact information not available");
    }
  };

  const handleSendMessage = (tutor: any) => {
    navigate(`/contact?subject=${encodeURIComponent('Inquiry for ' + tutor.name)}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Home Tutors in Nepal | Expert Teachers for SEE, Grade 11-12, IELTS, LokSewa"
        description="Find verified home tutors in Nepal for private tuition. Expert educators for SEE, Grade 11-12, IELTS, LokSewa preparation. Request a tutor or apply to teach."
        path="/tutors"
      />
      <Navbar />
      
      <div className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Our Expert Team</h1>
          <p className="text-lg max-w-2xl">
            Meet our team of experienced and dedicated educators committed to your academic success
          </p>
        </div>
      </div>
      
      <main className="flex-grow py-12 bg-background">
        <div className="container mx-auto px-4">

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-card rounded-xl shadow-lg overflow-hidden p-6">
                  <div className="flex items-center gap-6 mb-6">
                    <Skeleton className="w-32 h-32 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-16 w-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {tutors.map((tutor) => (
                <div key={tutor.id} className="bg-card rounded-xl shadow-lg overflow-hidden border">
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-6">
                      <img 
                        src={tutor.image_url || `https://placehold.co/400/1E2A78/FFFFFF?text=${encodeURIComponent(tutor.name.split(' ').map((n: string) => n[0]).join(''))}`}
                        alt={tutor.name} 
                        className="w-32 h-32 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="text-xl font-bold text-primary">{tutor.name}</h3>
                        <p className="text-secondary font-medium">{tutor.role}</p>
                        <div className="flex items-center mt-2">
                          <div className="flex text-accent">
                            {Array.from({ length: Math.floor(tutor.rating || 5) }).map((_, i) => (
                              <Star key={i} size={16} fill="#FFC107" stroke="#FFC107" />
                            ))}
                          </div>
                          <span className="text-sm ml-1">{Number(tutor.rating || 5).toFixed(1)}</span>
                          <span className="text-sm text-muted-foreground ml-2">({tutor.review_count || 0}+ reviews)</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-4">
                      <div className="flex items-start">
                        <Award size={18} className="text-primary mt-1 mr-2 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Education</p>
                          <p className="text-sm text-muted-foreground">{tutor.education}</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <BookOpen size={18} className="text-primary mt-1 mr-2 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Specialization</p>
                          <p className="text-sm text-muted-foreground">{tutor.role}</p>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground text-sm mb-6">{tutor.about}</p>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button 
                        className="flex-1 btn-primary text-sm py-2 flex items-center justify-center"
                        onClick={() => handleRequestCall(tutor)}
                      >
                        <PhoneCall size={16} className="mr-2" />
                        Request Call
                      </button>
                      <button 
                        className="flex-1 btn-secondary text-sm py-2 flex items-center justify-center"
                        onClick={() => handleSendMessage(tutor)}
                      >
                        <MessageSquare size={16} className="mr-2" />
                        Send Message
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-12 text-center">
            <div className="bg-card p-8 rounded-xl shadow-md max-w-2xl mx-auto border">
              <h3 className="text-2xl font-bold mb-4">Join Our Teaching Team</h3>
              <p className="text-muted-foreground mb-6">
                Are you an experienced educator passionate about helping students succeed? We're always looking for talented tutors to join our team.
              </p>
              <button className="btn-primary" onClick={() => navigate('/contact?subject=Tutor+Application')}>Apply as a Tutor</button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Tutors;

