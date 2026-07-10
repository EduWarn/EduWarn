import React, { useEffect, useState } from 'react';
import { Play, Youtube, Radio, TrendingUp, Clock, LucideIcon } from 'lucide-react';
import { Button } from './ui/button';
import { supabase } from '@/integrations/supabase/client';

const CHANNEL_URL = 'https://www.youtube.com/@EduWarn-Nepal';

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
  url: string;
  label: 'live' | 'popular' | 'latest';
  isLive?: boolean;
}

interface Payload {
  channelTitle?: string;
  channelUrl: string;
  live?: Video | null;
  popular?: Video | null;
  latest?: Video[];
  error?: string;
}

const FALLBACK: Video[] = [
  { id: 'Vs25u0ZnF-E', title: 'Featured from EduWarn Nepal', publishedAt: '', url: `${CHANNEL_URL}`, thumbnail: 'https://i.ytimg.com/vi/Vs25u0ZnF-E/hqdefault.jpg', label: 'popular' },
  { id: '1BqkLyVg84A', title: 'Learning Tips & Guidance', publishedAt: '', url: `${CHANNEL_URL}`, thumbnail: 'https://i.ytimg.com/vi/1BqkLyVg84A/hqdefault.jpg', label: 'latest' },
  { id: 'Y8YAxcLUdZM', title: 'Student Success Stories', publishedAt: '', url: `${CHANNEL_URL}`, thumbnail: 'https://i.ytimg.com/vi/Y8YAxcLUdZM/hqdefault.jpg', label: 'latest' },
];

const badgeStyles: Record<Video['label'], { text: string; className: string; Icon: LucideIcon }> = {
  live: { text: 'LIVE NOW', className: 'bg-red-600 text-white animate-pulse', Icon: Radio },
  popular: { text: 'Most Popular', className: 'bg-secondary text-secondary-foreground', Icon: TrendingUp },
  latest: { text: 'Latest', className: 'bg-primary text-primary-foreground', Icon: Clock },
};

const VideoCard: React.FC<{ v: Video }> = ({ v }) => {
  const b = badgeStyles[v.label];
  return (
    <a
      href={v.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Watch ${v.title} on EduWarn Nepal`}
      className="group relative block rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-card"
    >
      <div className="relative aspect-video overflow-hidden">
        <img
          src={v.thumbnail}
          alt={v.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <span className={`absolute top-3 left-3 inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full ${b.className}`}>
          <b.Icon size={12} /> {b.text}
        </span>
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Play className="w-7 h-7 text-white fill-white ml-1" />
          </div>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-primary line-clamp-2">{v.title}</h3>
        <p className="text-sm text-muted-foreground mt-1">EduWarn Nepal</p>
      </div>
    </a>
  );
};

const YouTubeShowcase: React.FC = () => {
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke('youtube-videos');
        if (!cancelled) {
          if (error) throw error;
          setData(data as Payload);
        }
      } catch (e) {
        console.warn('youtube-videos fetch failed, using fallback', e);
        if (!cancelled) setData({ channelUrl: CHANNEL_URL });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const videos: Video[] = (() => {
    if (!data) return [];
    const list: Video[] = [];
    if (data.live) list.push(data.live);
    if (data.popular) list.push(data.popular);
    if (data.latest) list.push(...data.latest);
    // If live exists we already have live+popular+2 latest = 4; trim to 3
    return list.slice(0, 3);
  })();

  const showFallback = !loading && videos.length === 0;
  const displayed = showFallback ? FALLBACK : videos;

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 text-red-600 font-semibold mb-2">
            <Youtube size={22} /> EduWarn Nepal on YouTube
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-3">
            {data?.live ? 'We\'re Live Right Now!' : 'Watch & Learn With Us'}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {data?.live
              ? 'Join our ongoing livestream and catch our most popular and latest videos from EduWarn Nepal.'
              : 'Fresh lessons, study tips and success stories — automatically updated from our YouTube channel.'}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[0, 1, 2].map((i) => (
              <div key={i} className="aspect-video bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {displayed.map((v) => <VideoCard key={v.id + v.label} v={v} />)}
          </div>
        )}

        <div className="text-center mt-10">
          <Button asChild variant="default" size="lg">
            <a href={CHANNEL_URL} target="_blank" rel="noopener noreferrer">
              <Youtube className="mr-2" /> Visit Our YouTube Channel
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default YouTubeShowcase;
