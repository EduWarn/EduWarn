
import React from 'react';
import { User, LogOut } from 'lucide-react';
import { Button } from '../ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import AdminLink from '../admin/AdminLink';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface UserMenuProps {
  user: SupabaseUser;
  onNavigate: (path: string) => void;
  onLogout: () => void;
  mobile?: boolean;
}

const UserMenu: React.FC<UserMenuProps> = ({ user, onNavigate, onLogout, mobile = false }) => {
  if (mobile) {
    return (
      <>
        <AdminLink variant="outline" mobile />
        <Button
          variant="outline"
          className="w-full flex items-center justify-center gap-2"
          onClick={() => onNavigate('/profile')}
        >
          <Avatar className="h-5 w-5 mr-1">
            {user.user_metadata?.avatar_url ? (
              <AvatarImage src={user.user_metadata.avatar_url} alt={user.user_metadata?.full_name || user.email} />
            ) : (
              <AvatarFallback>
                <User size={14} />
              </AvatarFallback>
            )}
          </Avatar>
          {user.user_metadata?.full_name || user.email?.split('@')[0]}
        </Button>
        <Button
          variant="outline"
          className="w-full text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
          onClick={onLogout}
        >
          <LogOut size={18} className="mr-1" />
          Logout
        </Button>
      </>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <AdminLink variant="outline" className="mr-2" />
      <Button
        variant="outline"
        className="flex items-center gap-2"
        onClick={() => onNavigate('/profile')}
      >
        <Avatar className="h-6 w-6 mr-1">
          {user.user_metadata?.avatar_url ? (
            <AvatarImage src={user.user_metadata.avatar_url} alt={user.user_metadata?.full_name || user.email} />
          ) : (
            <AvatarFallback>
              <User size={16} />
            </AvatarFallback>
          )}
        </Avatar>
        {user.user_metadata?.full_name || user.email?.split('@')[0]}
      </Button>
      <Button
        variant="outline"
        className="text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
        onClick={onLogout}
      >
        <LogOut size={18} className="mr-1" />
        Logout
      </Button>
    </div>
  );
};

export default UserMenu;
