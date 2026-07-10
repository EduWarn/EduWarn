// Database types for Supabase

export type AdminRole = "super_admin" | "content_editor" | "analytics_viewer";

export interface AdminUser {
  id: string;
  role: AdminRole;
  email?: string; // From auth.users
  full_name?: string; // From user metadata
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  discount_price?: number | null;
  image_url?: string;
  duration?: string;
  level?: string;
  instructor?: string;
  subject?: string | null;
  rating?: number | null;
  students_count?: number | null;
  seats_left?: number | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featured_image?: string;
  author_id: string; // Changed from author to author_id to match Supabase schema
  published: boolean; // Changed from published_at to published
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  whatsapp_opted_in: boolean;
  created_at: string;
}

export interface Registration {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  grade: string;
  created_at: string;
}

export interface CoursePurchase {
  id: string;
  user_id: string;
  course_id: string;
  payment_status: string;
  purchased_at: string;
}

export interface Tutor {
  id: number;
  name: string;
  image: string;
  role: string;
  education: string;
  experience: string;
  specialization: string;
  rating: number;
  reviews: number;
  students: number;
  about: string;
}

export interface TeamMember {
  id: number;
  name: string;
  role: string;
  image: string;
  education: string;
  about: string;
  socialLinks?: {
    email?: string;
    phone?: string;
    whatsapp?: string;
    website?: string;
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
  rating?: number;
  reviewCount?: number;
}
