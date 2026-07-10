export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      about_partner_content: {
        Row: {
          content: Json
          id: string
          title: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          content?: Json
          id?: string
          title?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          content?: Json
          id?: string
          title?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      about_story_content: {
        Row: {
          content: Json
          id: string
          title: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          content?: Json
          id?: string
          title?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          content?: Json
          id?: string
          title?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      about_values_content: {
        Row: {
          content: Json
          id: string
          title: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          content?: Json
          id?: string
          title?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          content?: Json
          id?: string
          title?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      admins: {
        Row: {
          created_at: string
          id: string
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          role: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_id: string
          content: string
          content_format: string
          created_at: string
          excerpt: string | null
          featured_image: string | null
          id: string
          published: boolean
          slug: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          content_format?: string
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          published?: boolean
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          content_format?: string
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          published?: boolean
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      contact_info_content: {
        Row: {
          content: Json
          id: string
          title: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          content?: Json
          id?: string
          title?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          content?: Json
          id?: string
          title?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      contacts: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          message: string
          phone: string
          subject: string
          whatsapp_opted_in: boolean
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          message: string
          phone: string
          subject: string
          whatsapp_opted_in?: boolean
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          message?: string
          phone?: string
          subject?: string
          whatsapp_opted_in?: boolean
        }
        Relationships: []
      }
      course_lesson_content: {
        Row: {
          attachment_url: string | null
          content: string | null
          created_at: string
          lesson_id: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          attachment_url?: string | null
          content?: string | null
          created_at?: string
          lesson_id: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          attachment_url?: string | null
          content?: string | null
          created_at?: string
          lesson_id?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_lesson_content_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: true
            referencedRelation: "course_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      course_lessons: {
        Row: {
          created_at: string
          duration_minutes: number | null
          id: string
          is_free_preview: boolean
          module_id: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          duration_minutes?: number | null
          id?: string
          is_free_preview?: boolean
          module_id: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          duration_minutes?: number | null
          id?: string
          is_free_preview?: boolean
          module_id?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      course_modules: {
        Row: {
          course_id: string
          created_at: string
          description: string | null
          id: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          description?: string | null
          id?: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          description?: string | null
          id?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_purchases: {
        Row: {
          course_id: string
          id: string
          payment_status: string
          purchased_at: string | null
          user_id: string
        }
        Insert: {
          course_id: string
          id?: string
          payment_status?: string
          purchased_at?: string | null
          user_id: string
        }
        Update: {
          course_id?: string
          id?: string
          payment_status?: string
          purchased_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      courses: {
        Row: {
          created_at: string
          description: string
          discount_price: number | null
          duration: string | null
          id: string
          image_url: string | null
          instructor: string | null
          level: string | null
          price: number
          published: boolean
          rating: number | null
          seats_left: number | null
          students_count: number | null
          subject: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          discount_price?: number | null
          duration?: string | null
          id?: string
          image_url?: string | null
          instructor?: string | null
          level?: string | null
          price?: number
          published?: boolean
          rating?: number | null
          seats_left?: number | null
          students_count?: number | null
          subject?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          discount_price?: number | null
          duration?: string | null
          id?: string
          image_url?: string | null
          instructor?: string | null
          level?: string | null
          price?: number
          published?: boolean
          rating?: number | null
          seats_left?: number | null
          students_count?: number | null
          subject?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      cta_content: {
        Row: {
          content: Json
          id: string
          title: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          content?: Json
          id?: string
          title?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          content?: Json
          id?: string
          title?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      features_content: {
        Row: {
          content: Json
          id: string
          title: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          content?: Json
          id?: string
          title?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          content?: Json
          id?: string
          title?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      hero_content: {
        Row: {
          content: Json
          id: string
          title: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          content?: Json
          id?: string
          title?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          content?: Json
          id?: string
          title?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      partner_section_content: {
        Row: {
          content: Json
          id: string
          title: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          content?: Json
          id?: string
          title?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          content?: Json
          id?: string
          title?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      payment_verifications: {
        Row: {
          course_id: string
          created_at: string
          id: string
          payment_method: string
          rejection_reason: string | null
          screenshot_url: string | null
          status: string
          transaction_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          payment_method: string
          rejection_reason?: string | null
          screenshot_url?: string | null
          status?: string
          transaction_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          payment_method?: string
          rejection_reason?: string | null
          screenshot_url?: string | null
          status?: string
          transaction_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      programs: {
        Row: {
          created_at: string
          date: string | null
          description: string
          featured: boolean
          id: string
          image_url: string | null
          is_active: boolean
          location: string | null
          slug: string
          sort_order: number
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date?: string | null
          description?: string
          featured?: boolean
          id?: string
          image_url?: string | null
          is_active?: boolean
          location?: string | null
          slug: string
          sort_order?: number
          title: string
          type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string | null
          description?: string
          featured?: boolean
          id?: string
          image_url?: string | null
          is_active?: boolean
          location?: string | null
          slug?: string
          sort_order?: number
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      registrations: {
        Row: {
          created_at: string
          email: string
          full_name: string
          grade: string
          id: string
          phone: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          grade: string
          id?: string
          phone: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          grade?: string
          id?: string
          phone?: string
        }
        Relationships: []
      }
      social_links_content: {
        Row: {
          content: Json
          id: string
          title: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          content?: Json
          id?: string
          title?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          content?: Json
          id?: string
          title?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      team_member_contacts: {
        Row: {
          created_at: string
          email: string | null
          phone: string | null
          team_member_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          phone?: string | null
          team_member_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          phone?: string | null
          team_member_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_member_contacts_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: true
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          about: string | null
          created_at: string
          display_order: number | null
          education: string | null
          id: string
          image_url: string | null
          name: string
          published: boolean
          rating: number | null
          review_count: number | null
          role: string
          updated_at: string
          website: string | null
          whatsapp: string | null
        }
        Insert: {
          about?: string | null
          created_at?: string
          display_order?: number | null
          education?: string | null
          id?: string
          image_url?: string | null
          name: string
          published?: boolean
          rating?: number | null
          review_count?: number | null
          role: string
          updated_at?: string
          website?: string | null
          whatsapp?: string | null
        }
        Update: {
          about?: string | null
          created_at?: string
          display_order?: number | null
          education?: string | null
          id?: string
          image_url?: string | null
          name?: string
          published?: boolean
          rating?: number | null
          review_count?: number | null
          role?: string
          updated_at?: string
          website?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          name: string
          published: boolean
          rating: number
          role: string
          text: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          name: string
          published?: boolean
          rating?: number
          role: string
          text: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          name?: string
          published?: boolean
          rating?: number
          role?: string
          text?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_payment: { Args: { p_verification_id: string }; Returns: Json }
      get_user_role: { Args: { user_id: string }; Returns: string }
      insert_contact: {
        Args: {
          p_email: string
          p_full_name: string
          p_message: string
          p_phone: string
          p_subject: string
          p_whatsapp_opted_in?: boolean
        }
        Returns: Json
      }
      is_admin: { Args: { user_id: string }; Returns: boolean }
      is_super_admin: { Args: { user_id: string }; Returns: boolean }
      reject_payment: {
        Args: { p_reason?: string; p_verification_id: string }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
