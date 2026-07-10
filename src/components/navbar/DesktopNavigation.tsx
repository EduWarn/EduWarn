import React from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

interface DesktopNavigationProps {
  onNavigate: (path: string) => void;
}

const links = [
  { path: '/', label: 'Home', aria: 'Navigate to Home page' },
  { path: '/courses', label: 'Courses', aria: 'Browse SEE preparation and other courses' },
  { path: '/programs', label: 'Programs', aria: 'View our programs and events' },
  { path: '/tutors', label: 'Tutors', aria: 'Meet our expert tutors' },
  { path: '/career', label: 'Career', aria: 'Explore career guidance' },
  { path: '/about', label: 'About Us', aria: 'Learn about EduWarn Nepal' },
  { path: '/blog', label: 'Blog', aria: 'Read our educational blog posts' },
  { path: '/contact', label: 'Contact', aria: 'Contact EduWarn Nepal' },
];

const DesktopNavigation: React.FC<DesktopNavigationProps> = ({ onNavigate }) => {
  const { pathname } = useLocation();
  return (
    <div className="hidden md:flex items-center space-x-1">
      {links.map(({ path, label, aria }) => {
        const active = path === '/' ? pathname === '/' : pathname.startsWith(path);
        return (
          <Button
            key={path}
            variant="ghost"
            onClick={() => onNavigate(path)}
            aria-label={aria}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'relative text-gray-700 hover:text-primary font-medium transition-colors',
              "after:content-[''] after:absolute after:left-3 after:right-3 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-secondary after:origin-center after:transition-transform after:duration-300",
              active ? 'text-primary after:scale-x-100' : 'after:scale-x-0 hover:after:scale-x-100'
            )}
          >
            {label}
          </Button>
        );
      })}
    </div>
  );
};

export default DesktopNavigation;
