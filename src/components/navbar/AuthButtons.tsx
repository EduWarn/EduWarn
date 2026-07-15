
import React from 'react';
import { Button } from '../ui/button';
import UserMenu from './UserMenu';
import type { User } from '@supabase/supabase-js';

interface AuthButtonsProps {
  user: User | null;
  onNavigate: (path: string) => void;
  onLogout: () => void;
  redirectToZoomPortal: () => void;
  mobile?: boolean;
}

const AuthButtons: React.FC<AuthButtonsProps> = ({ 
  user, 
  onNavigate, 
  onLogout, 
  redirectToZoomPortal, 
  mobile = false 
}) => {
  if (mobile) {
    return (
      <div className="flex flex-col space-y-3 pt-2">
        {user ? (
          <UserMenu user={user} onNavigate={onNavigate} onLogout={onLogout} mobile />
        ) : (
          <>
            <Button 
              variant="outline" 
              onClick={() => onNavigate('/login')}
              className="w-full border-primary text-primary hover:bg-primary hover:text-white"
              aria-label="Login to your account"
            >
              Login
            </Button>
            <Button 
              onClick={() => onNavigate('/signup')}
              className="w-full bg-secondary text-white hover:bg-secondary/90"
              aria-label="Sign up for a new account"
            >
              Sign Up
            </Button>
          </>
        )}
        <Button
          variant="accent"
          onClick={redirectToZoomPortal}
          className="w-full"
          aria-label="Explore free lessons"
        >
          Free Lessons
        </Button>
      </div>
    );
  }

  return (
    <div className="hidden md:flex items-center space-x-3">
      {user ? (
        <UserMenu user={user} onNavigate={onNavigate} onLogout={onLogout} />
      ) : (
        <>
          <Button 
            variant="outline" 
            onClick={() => onNavigate('/login')}
            className="border-primary text-primary hover:bg-primary hover:text-white"
            aria-label="Login to your account"
          >
            Login
          </Button>
          <Button 
            variant="secondary"
            onClick={() => onNavigate('/signup')}
            className="bg-secondary text-white hover:bg-secondary/90"
            aria-label="Sign up for a new account"
          >
            Sign Up
          </Button>
        </>
      )}
      <Button
        variant="accent"
        onClick={redirectToZoomPortal}
        className="animate-pulse-scale"
        aria-label="Explore free lessons"
      >
        Free Lessons
      </Button>
    </div>
  );
};

export default AuthButtons;
