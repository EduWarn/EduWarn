-- Fix infinite recursion in admin RLS policies by dropping problematic policies
-- and creating simpler, non-recursive ones

-- Drop all existing admin policies that cause recursion
DROP POLICY IF EXISTS "Admins can manage admin users" ON public.admins;
DROP POLICY IF EXISTS "Super admins can manage all admin records" ON public.admins;
DROP POLICY IF EXISTS "Super admins can view all admin records" ON public.admins;
DROP POLICY IF EXISTS "Users can insert their own admin record" ON public.admins;
DROP POLICY IF EXISTS "Users can update their own admin record" ON public.admins;
DROP POLICY IF EXISTS "Users can view their own admin record" ON public.admins;

-- Create new security definer function that doesn't cause recursion
CREATE OR REPLACE FUNCTION public.is_super_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  -- Check if user is in predefined super admin list
  SELECT user_id IN (
    SELECT auth.uid() 
    WHERE auth.jwt() ->> 'email' IN ('admin@sajilotuition.com', 'sabinbd7@gmail.com')
  );
$$;

-- Create simple RLS policies without recursion
CREATE POLICY "Allow super admins full access" ON public.admins
  FOR ALL 
  USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Users can insert their own admin record" ON public.admins
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view their own admin record" ON public.admins
  FOR SELECT 
  USING (auth.uid() = id OR public.is_super_admin(auth.uid()));

-- Enable RLS
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;