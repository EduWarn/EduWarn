import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, CalendarDays } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { usePrograms } from '@/hooks/usePrograms';

const Programs: React.FC = () => {
  const { data: programs = [], isLoading } = usePrograms();

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Educational Programs & Workshops in Nepal | SEE & Grade 11-12 Learning Paths</title>
        <meta
          name="description"
          content="Explore structured educational programs and workshops at EduWarn Nepal for SEE, Grade 11-12, IELTS, and LokSewa exam preparation with expert tutors."
        />
        <link rel="canonical" href="https://eduwarnnepal.com/programs" />
      </Helmet>

      <Navbar />

      <main className="flex-1">
        <section className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Programs & Events</h1>
            <p className="max-w-2xl mx-auto text-primary-foreground/90">
              Hands-on bootcamps, free seminars, scholarship tests and community events — designed to help our students grow beyond the classroom.
            </p>
          </div>
        </section>

        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-96 bg-card rounded-xl animate-pulse" />
                ))}
              </div>
            ) : programs.length === 0 ? (
              <div className="max-w-md mx-auto text-center py-20">
                <CalendarDays className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-bold text-primary mb-2">No programs yet</h2>
                <p className="text-muted-foreground mb-6">
                  We're planning new bootcamps and events. Reach out to be the first to know.
                </p>
                <Button asChild>
                  <Link to="/contact">Contact Us</Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {programs.map((p) => (
                  <article
                    key={p.id}
                    className="bg-card rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all border flex flex-col"
                  >
                    <div className="relative aspect-video overflow-hidden bg-muted">
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.title} loading="lazy" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <CalendarDays size={48} />
                        </div>
                      )}
                      <span className="absolute top-3 left-3 bg-secondary text-secondary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                        {p.type}
                      </span>
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <h2 className="text-xl font-bold text-primary mb-2">{p.title}</h2>
                      <p className="text-muted-foreground mb-4 whitespace-pre-line">{p.description}</p>

                      <div className="mt-auto space-y-2 text-sm text-muted-foreground mb-4">
                        {p.date && <div className="flex items-center gap-2"><Calendar size={16} className="text-secondary" /> {p.date}</div>}
                        {p.location && <div className="flex items-center gap-2"><MapPin size={16} className="text-secondary" /> {p.location}</div>}
                      </div>

                      <Button asChild className="w-full">
                        <Link to={`/contact?subject=${encodeURIComponent('Program inquiry: ' + p.title)}`}>
                          Register / Inquire
                        </Link>
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Programs;
