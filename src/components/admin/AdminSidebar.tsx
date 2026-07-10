
import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel
} from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard, BookOpen, FileEdit, BarChart2, MessageSquare, Users, CalendarDays, CreditCard } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { AdminRole } from '@/types/database';

const AdminSidebar = () => {
  const { user } = useAuth();
  const [adminRole, setAdminRole] = useState<AdminRole | null>(null);
  
  useEffect(() => {
    const fetchAdminRole = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('admins')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();
        
        if (error) {
          console.error('Error fetching admin role:', error);
          return;
        }
        
        if (data) {
          setAdminRole(data.role as AdminRole);
        }
      } catch (err) {
        console.error('Failed to fetch admin role:', err);
      }
    };
    
    fetchAdminRole();
  }, [user]);

  // Define navigation items based on admin role
  const getNavigationItems = () => {
    // Base navigation items available to all admin roles
    const baseNavigation = [
      { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, roles: ['super_admin', 'content_editor', 'analytics_viewer'] },
    ];
    
    // Content management items
    const contentItems = [
      { name: 'Courses', href: '/admin/courses', icon: BookOpen, roles: ['super_admin', 'content_editor'] },
      { name: 'Programs', href: '/admin/programs', icon: CalendarDays, roles: ['super_admin', 'content_editor'] },
      { name: 'Blog', href: '/admin/blog', icon: FileEdit, roles: ['super_admin', 'content_editor'] },
    ];
    
    // Analytics items
    const analyticsItems = [
      { name: 'Payments', href: '/admin/payments', icon: CreditCard, roles: ['super_admin', 'content_editor'] },
      { name: 'Insights', href: '/admin/insights', icon: BarChart2, roles: ['super_admin', 'analytics_viewer'] },
      { name: 'Contacts', href: '/admin/contacts', icon: MessageSquare, roles: ['super_admin', 'content_editor'] },
    ];
    
    // Admin management - super_admin only
    const adminItems = [
      { name: 'Admin Users', href: '/admin/users', icon: Users, roles: ['super_admin'] },
    ];
    
    // Combine all navigation items
    return [...baseNavigation, ...contentItems, ...analyticsItems, ...adminItems];
  };
  
  // Filter navigation items based on admin role
  const filteredNavigation = getNavigationItems().filter(item => {
    // If no admin role yet or roles not specified, don't show
    if (!adminRole || !item.roles) return false;
    
    // Show if the current admin role is included in the item's roles
    return item.roles.includes(adminRole);
  });
  
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="px-3 py-4">
          <h2 className="text-2xl font-bold text-primary">Admin Panel</h2>
          <div className="text-sm text-gray-500 mt-1">
            {user?.user_metadata?.full_name || user?.email}
            {adminRole && (
              <span className="ml-2 px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                {adminRole.replace('_', ' ')}
              </span>
            )}
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredNavigation.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.href}
                      className={({ isActive }) =>
                        `group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                          isActive
                            ? 'bg-primary text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`
                      }
                      end={item.href === '/admin'}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AdminSidebar;
