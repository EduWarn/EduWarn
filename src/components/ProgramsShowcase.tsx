import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, ArrowRight, CalendarDays } from 'lucide-react';
import { Button } from './ui/button';
import { usePrograms } from '@/hooks/usePrograms';

const ProgramsShowcase: React.FC = () => {
  const { data: programs = [], isLoading } = usePrograms({ limit: 3 });

  return (
    <section className="py-16 bg-card">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-10 gap-4">
          <div>
            <p className="text-secondary font-semibold mb-2">Programs & Events</p>
            <h2 className="text-3xl md:text-4xl font-bold text-primary">
              What We Conduct For Our Students
            </h2>
            <p className="text-muted-foreground mt-3 max-w-2xl">
              From SEE bootcamps to career seminars and scholarship tests — explore the programs and events we run throughout the year.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/programs">
              View All Programs <ArrowRight className="ml-1" />
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-72 bg-background rounded-xl animate-pulse" />
            ))}
          </div>
        ) : programs.length === 0 ? (
          <div className="text-center py-16 bg-background rounded-xl border">
            <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-primary mb-1">No programs scheduled yet</h3>
            <p className="text-muted-foreground">Check back soon — new events and bootcamps are added regularly.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {programs.map((p) => (
              <Link
                key={p.id}
                to="/programs"
                className="group bg-background rounded-xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border flex flex-col"
              >
                <div className="relative aspect-video overflow-hidden bg-muted">
                  {p.image_url ? (
                    <img
                      src={p.image_url}
                      alt={p.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <CalendarDays size={40} />
                    </div>
                  )}
                  <span className="absolute top-3 left-3 bg-secondary text-secondary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                    {p.type}
                  </span>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-semibold text-primary text-lg mb-2">{p.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{p.description}</p>
                  <div className="mt-auto space-y-2 text-sm text-muted-foreground">
                    {p.date && <div className="flex items-center gap-2"><Calendar size={16} className="text-secondary" /> {p.date}</div>}
                    {p.location && <div className="flex items-center gap-2"><MapPin size={16} className="text-secondary" /> {p.location}</div>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProgramsShowcase;
