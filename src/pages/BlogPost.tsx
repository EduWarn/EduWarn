import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { Calendar, ArrowLeft, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import DOMPurify from 'dompurify';


const BlogPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const { data: post, isLoading, error } = useQuery({
    queryKey: ['blog-post', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow py-12 bg-background">
          <div className="container mx-auto px-4 max-w-3xl">
            <Skeleton className="h-8 w-3/4 mb-4" />
            <Skeleton className="h-4 w-1/2 mb-8" />
            <Skeleton className="h-64 w-full mb-8 rounded-xl" />
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-4 w-full" />)}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow py-12 bg-background flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-primary mb-4">Article Not Found</h2>
            <p className="text-muted-foreground mb-6">The article you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate('/blog')}>Back to Blog</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Check if content is HTML (from TipTap) or plain text
  const isHtml = post.content.includes('<') && post.content.includes('>');

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title={`${post.title} — EduWarn Nepal Blog`}
        description={(post.excerpt || post.content).replace(/<[^>]+>/g, '').slice(0, 155)}
        path={`/blog/${post.slug}`}
        type="article"
        image={post.featured_image || undefined}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: post.title,
          description: post.excerpt || undefined,
          image: post.featured_image || undefined,
          datePublished: post.created_at,
          dateModified: (post as any).updated_at || post.created_at,
          author: { '@type': 'Organization', name: 'EduWarn Nepal' },
          publisher: {
            '@type': 'Organization',
            name: 'EduWarn Nepal',
            logo: {
              '@type': 'ImageObject',
              url: 'https://sajilotuition.lovable.app/team-members/eduwarn_nepal-logo.jpeg',
            },
          },
          mainEntityOfPage: `https://sajilotuition.lovable.app/blog/${post.slug}`,
        }}
      />
      <Navbar />

      {post.featured_image && (
        <div className="w-full h-64 md:h-96 relative overflow-hidden">
          <img src={post.featured_image} alt={post.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
        </div>
      )}

      <main className="flex-grow py-8 md:py-12 bg-background">
        <article className="container mx-auto px-4 max-w-3xl">

          <Button variant="ghost" onClick={() => navigate('/blog')} className="mb-6 -ml-2 text-muted-foreground hover:text-primary">
            <ArrowLeft size={18} className="mr-2" />
            Back to Blog
          </Button>

          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4 leading-tight">{post.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
              <span className="flex items-center">
                <Calendar size={16} className="mr-1.5" />
                {format(new Date(post.created_at), 'MMMM d, yyyy')}
              </span>
            </div>
            {post.excerpt && (
              <p className="text-lg text-muted-foreground border-l-4 border-primary pl-4 italic">{post.excerpt}</p>
            )}
          </header>

          {/* Article Content */}
          {isHtml ? (
            <div
              className="prose prose-lg max-w-none prose-headings:text-primary prose-a:text-secondary prose-img:rounded-xl prose-img:shadow-md prose-blockquote:border-primary prose-strong:text-foreground"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content, {
                ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'code', 'pre', 'mark', 'span', 'div'],
                ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'style', 'target', 'rel']
              }) }}
            />
          ) : (
            <div className="prose prose-lg max-w-none">
              {post.content.split('\n').filter((p: string) => p.trim()).map((paragraph: string, index: number) => (
                <p key={index} className="text-foreground leading-relaxed mb-4 text-base md:text-lg">{paragraph}</p>
              ))}
            </div>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-10 pt-6 border-t">
              <div className="flex items-center flex-wrap gap-2">
                <Tag size={16} className="text-muted-foreground" />
                {post.tags.map((tag: string, index: number) => (
                  <span key={index} className="bg-primary/10 text-primary text-sm px-3 py-1 rounded-full">{tag}</span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-10 pt-6 border-t text-center">
            <Button onClick={() => navigate('/blog')}>Read More Articles</Button>
          </div>
        </article>
      </main>


      <Footer />
    </div>
  );
};

export default BlogPost;
