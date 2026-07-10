
import React from 'react';
import { Button } from '../ui/button';

interface MobileNavigationProps {
  isMenuOpen: boolean;
  onNavigate: (path: string) => void;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({ isMenuOpen, onNavigate }) => {
  if (!isMenuOpen) return null;

  return (
    <div className="md:hidden bg-white py-4 px-4 shadow-md">
      <div className="flex flex-col space-y-4">
        <Button 
          variant="ghost" 
          onClick={() => onNavigate('/')}
          className="justify-start text-gray-700 hover:text-primary font-medium"
          aria-label="Navigate to Home page"
        >
          Home
        </Button>
        <Button 
          variant="ghost" 
          onClick={() => onNavigate('/courses')}
          className="justify-start text-gray-700 hover:text-primary font-medium"
          aria-label="Browse SEE preparation and other courses"
        >
          Courses
        </Button>
        <Button 
          variant="ghost" 
          onClick={() => onNavigate('/programs')}
          className="justify-start text-gray-700 hover:text-primary font-medium"
          aria-label="View our programs and events"
        >
          Programs
        </Button>
        <Button 
          variant="ghost" 
          onClick={() => onNavigate('/tutors')}
          className="justify-start text-gray-700 hover:text-primary font-medium"
          aria-label="Meet our expert tutors"
        >
          Tutors
        </Button>
        <Button 
          variant="ghost" 
          onClick={() => onNavigate('/career')}
          className="justify-start text-gray-700 hover:text-primary font-medium"
          aria-label="Explore career guidance"
        >
          Career
        </Button>
        <Button 
          variant="ghost" 
          onClick={() => onNavigate('/about')}
          className="justify-start text-gray-700 hover:text-primary font-medium"
          aria-label="Learn about EduWarn Nepal"
        >
          About Us
        </Button>
        <Button 
          variant="ghost" 
          onClick={() => onNavigate('/blog')}
          className="justify-start text-gray-700 hover:text-primary font-medium"
          aria-label="Read our educational blog posts"
        >
          Blog
        </Button>
        <Button 
          variant="ghost" 
          onClick={() => onNavigate('/contact')}
          className="justify-start text-gray-700 hover:text-primary font-medium"
          aria-label="Contact EduWarn Nepal"
        >
          Contact
        </Button>
      </div>
    </div>
  );
};

export default MobileNavigation;
