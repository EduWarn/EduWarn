import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { Calendar, ChevronRight, Search } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';


const Blog = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const { data: blogPosts = [], isLoading } = useQuery({
    queryKey: ['blog-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const categories = [...new Set(blogPosts.flatMap(post => post.tags || []))];

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = searchTerm === '' ||
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (post.excerpt || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (post.tags || []).some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === '' || (post.tags || []).includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    toast.info(`Found ${filteredPosts.length} articles matching "${searchTerm}"`);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category === selectedCategory ? '' : category);
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error("Please enter a valid email address");
      return;
    }
    toast.success("Thank you for subscribing to our newsletter!");
    setEmail('');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Blog & Resources — EduWarn Nepal"
        description="Study guides, exam tips, and educational articles for SEE, Grade 11–12, IELTS, and LokSewa students in Nepal."
        path="/blog"
      />
      <Navbar />
      
      <div className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Blog & Resources</h1>
          <p className="text-lg max-w-2xl">
            Explore our collection of educational articles, study guides, and resources to support your academic journey
          </p>
        </div>
      </div>
      
      <main className="flex-grow py-12 bg-background">

        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-2/3">
              <h2 className="text-2xl font-bold mb-6">Latest Articles</h2>
              
              {isLoading ? (
                <div className="space-y-8">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-card rounded-xl shadow-md overflow-hidden">
                      <div className="md:flex">
                        <Skeleton className="h-48 w-full md:w-1/3" />
                        <div className="p-6 md:w-2/3 space-y-3">
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-6 w-3/4" />
                          <Skeleton className="h-3 w-full" />
                          <Skeleton className="h-3 w-full" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredPosts.length > 0 ? (
                <div className="space-y-8">
                  {filteredPosts.map(post => (
                    <div key={post.id} className="bg-card rounded-xl shadow-md overflow-hidden border">
                      <div className="md:flex">
                        <div className="md:w-1/3">
                          <img 
                            src={post.featured_image || `https://placehold.co/800x450/1E2A78/FFFFFF?text=${encodeURIComponent(post.title.substring(0, 20))}`}
                            alt={post.title} 
                            className="h-48 w-full object-cover md:h-full"
                          />
                        </div>
                        <div className="p-6 md:w-2/3">
                          <div className="flex flex-wrap items-center text-sm text-muted-foreground mb-2">
                            <span className="flex items-center mr-4">
                              <Calendar size={14} className="mr-1" />
                              {format(new Date(post.created_at), 'MMM d, yyyy')}
                            </span>
                          </div>
                          
                          <h3 className="text-xl font-bold text-primary mb-2">{post.title}</h3>
                          <p className="text-muted-foreground mb-4">{post.excerpt || post.content.substring(0, 150) + '...'}</p>
                          
                          <div className="flex flex-wrap gap-2 mb-4">
                            {(post.tags || []).map((tag: string, index: number) => (
                              <span key={index} className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                          
                          <button 
                            className="text-secondary font-medium flex items-center hover:underline"
                            onClick={() => navigate(`/blog/${post.slug}`)}
                          >
                            Read Full Article
                            <ChevronRight size={16} className="ml-1" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-card rounded-xl shadow-md p-8 text-center">
                  <p className="text-muted-foreground mb-4">No articles found matching your search criteria.</p>
                  <Button variant="default" onClick={() => { setSearchTerm(''); setSelectedCategory(''); }}>
                    Reset Filters
                  </Button>
                </div>
              )}
            </div>
            
            <div className="lg:w-1/3">
              <div className="bg-card rounded-xl shadow-md p-6 mb-6 border">
                <h3 className="text-lg font-bold mb-4">Search Articles</h3>
                <form onSubmit={handleSearch}>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search for topics..."
                      className="w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button type="submit" className="absolute right-3 top-2.5" aria-label="Search">
                      <Search className="h-5 w-5 text-muted-foreground" />
                    </button>
                  </div>
                </form>
              </div>
              
              {categories.length > 0 && (
                <div className="bg-card rounded-xl shadow-md p-6 mb-6 border">
                  <h3 className="text-lg font-bold mb-4">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category, index) => (
                      <button
                        key={index}
                        className={`text-sm px-3 py-1 rounded-full transition-colors ${
                          selectedCategory === category
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                        onClick={() => handleCategorySelect(category)}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="bg-card rounded-xl shadow-md p-6 border">
                <h3 className="text-lg font-bold mb-4">Subscribe to Newsletter</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Get the latest educational content delivered to your inbox.
                </p>
                <form onSubmit={handleSubscribe}>
                  <input
                    type="email"
                    placeholder="Your email address"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary mb-3 bg-background"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <Button className="w-full" type="submit">Subscribe Now</Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Blog;


