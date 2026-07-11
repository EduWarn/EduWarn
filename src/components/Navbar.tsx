
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import DesktopNavigation from './navbar/DesktopNavigation';
import MobileNavigation from './navbar/MobileNavigation';
import AuthButtons from './navbar/AuthButtons';
import WhatsAppButton from './navbar/WhatsAppButton';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNavigation = (path: string) => {
    setIsMenuOpen(false);
    navigate(path);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const redirectToZoomPortal = () => {
    window.open('https://zoom.us/join', '_blank');
    setIsMenuOpen(false);
  };

  useEffect(() => {
    return () => setIsMenuOpen(false);
  }, [navigate]);

  return (
    <nav
      className={`bg-white/95 backdrop-blur-md sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'shadow-md border-b border-border/60' : 'shadow-sm border-b border-transparent'
      }`}
    >
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group" aria-label="EduWarn Nepal Home">
          <img
            src="/team-members/eduwarn_nepal-logo.jpeg"
            alt="EduWarn Nepal Logo"
            className="w-12 h-12 rounded-full ring-1 ring-border/50 shadow-sm transition-transform duration-300 group-hover:scale-105"
          />
          <div className="flex flex-col leading-tight">
            <span className="text-primary text-2xl font-bold tracking-tight">EduWarn Nepal</span>
            <span className="text-muted-foreground text-sm nepali-text">Learn | Grow | Decide</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <DesktopNavigation onNavigate={handleNavigation} />

        {/* Auth Buttons - Desktop */}
        <AuthButtons 
          user={user} 
          onNavigate={handleNavigation} 
          onLogout={handleLogout} 
          redirectToZoomPortal={redirectToZoomPortal} 
        />

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-gray-700" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <MobileNavigation isMenuOpen={isMenuOpen} onNavigate={handleNavigation} />
      
      {/* Mobile Auth Buttons */}
      {isMenuOpen && (
        <div className="md:hidden bg-white py-4 px-4 shadow-md">
          <hr className="border-gray-200" />
          <AuthButtons 
            user={user} 
            onNavigate={handleNavigation} 
            onLogout={handleLogout} 
            redirectToZoomPortal={redirectToZoomPortal} 
            mobile 
          />
        </div>
      )}

      {/* WhatsApp Floating Button */}
      <WhatsAppButton />
    </nav>
  );
};

export default Navbar;
