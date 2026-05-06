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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      banners: {
        Row: {
          created_at: string
          id: string
          image_url: string
          is_active: boolean
          link_url: string | null
          sort_order: number
          subtitle: string | null
          title: string | null
          ulb_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          is_active?: boolean
          link_url?: string | null
          sort_order?: number
          subtitle?: string | null
          title?: string | null
          ulb_id: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          is_active?: boolean
          link_url?: string | null
          sort_order?: number
          subtitle?: string | null
          title?: string | null
          ulb_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "banners_ulb_id_fkey"
            columns: ["ulb_id"]
            isOneToOne: false
            referencedRelation: "ulbs"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          created_at: string
          description: string | null
          email: string | null
          head_name: string | null
          id: string
          name: string
          phone: string | null
          ulb_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          email?: string | null
          head_name?: string | null
          id?: string
          name: string
          phone?: string | null
          ulb_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          email?: string | null
          head_name?: string | null
          id?: string
          name?: string
          phone?: string | null
          ulb_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "departments_ulb_id_fkey"
            columns: ["ulb_id"]
            isOneToOne: false
            referencedRelation: "ulbs"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery: {
        Row: {
          caption: string | null
          category: string | null
          created_at: string
          id: string
          image_url: string
          ulb_id: string
        }
        Insert: {
          caption?: string | null
          category?: string | null
          created_at?: string
          id?: string
          image_url: string
          ulb_id: string
        }
        Update: {
          caption?: string | null
          category?: string | null
          created_at?: string
          id?: string
          image_url?: string
          ulb_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gallery_ulb_id_fkey"
            columns: ["ulb_id"]
            isOneToOne: false
            referencedRelation: "ulbs"
            referencedColumns: ["id"]
          },
        ]
      }
      grievances: {
        Row: {
          address: string | null
          admin_notes: string | null
          category: string
          citizen_name: string
          created_at: string
          description: string
          email: string | null
          id: string
          phone: string
          status: string
          ticket_no: string
          ulb_id: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          admin_notes?: string | null
          category: string
          citizen_name: string
          created_at?: string
          description: string
          email?: string | null
          id?: string
          phone: string
          status?: string
          ticket_no?: string
          ulb_id: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          admin_notes?: string | null
          category?: string
          citizen_name?: string
          created_at?: string
          description?: string
          email?: string | null
          id?: string
          phone?: string
          status?: string
          ticket_no?: string
          ulb_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "grievances_ulb_id_fkey"
            columns: ["ulb_id"]
            isOneToOne: false
            referencedRelation: "ulbs"
            referencedColumns: ["id"]
          },
        ]
      }
      leadership: {
        Row: {
          created_at: string
          id: string
          message: string | null
          name: string
          photo_url: string | null
          role: string
          sort_order: number
          ulb_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          name: string
          photo_url?: string | null
          role: string
          sort_order?: number
          ulb_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          name?: string
          photo_url?: string | null
          role?: string
          sort_order?: number
          ulb_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "leadership_ulb_id_fkey"
            columns: ["ulb_id"]
            isOneToOne: false
            referencedRelation: "ulbs"
            referencedColumns: ["id"]
          },
        ]
      }
      news: {
        Row: {
          body: string | null
          created_at: string
          id: string
          image_url: string | null
          is_published: boolean
          published_at: string
          summary: string | null
          title: string
          ulb_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_published?: boolean
          published_at?: string
          summary?: string | null
          title: string
          ulb_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_published?: boolean
          published_at?: string
          summary?: string | null
          title?: string
          ulb_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_ulb_id_fkey"
            columns: ["ulb_id"]
            isOneToOne: false
            referencedRelation: "ulbs"
            referencedColumns: ["id"]
          },
        ]
      }
      notices: {
        Row: {
          category: string | null
          created_at: string
          file_url: string | null
          id: string
          notice_date: string
          title: string
          ulb_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          file_url?: string | null
          id?: string
          notice_date?: string
          title: string
          ulb_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          file_url?: string | null
          id?: string
          notice_date?: string
          title?: string
          ulb_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notices_ulb_id_fkey"
            columns: ["ulb_id"]
            isOneToOne: false
            referencedRelation: "ulbs"
            referencedColumns: ["id"]
          },
        ]
      }
      services_info: {
        Row: {
          content: string | null
          created_at: string
          external_url: string | null
          icon: string | null
          id: string
          short_description: string | null
          slug: string
          sort_order: number
          title: string
          ulb_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          external_url?: string | null
          icon?: string | null
          id?: string
          short_description?: string | null
          slug: string
          sort_order?: number
          title: string
          ulb_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          external_url?: string | null
          icon?: string | null
          id?: string
          short_description?: string | null
          slug?: string
          sort_order?: number
          title?: string
          ulb_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_info_ulb_id_fkey"
            columns: ["ulb_id"]
            isOneToOne: false
            referencedRelation: "ulbs"
            referencedColumns: ["id"]
          },
        ]
      }
      tenders: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          file_url: string | null
          id: string
          last_date: string | null
          published_date: string
          reference_no: string | null
          status: string
          title: string
          ulb_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          file_url?: string | null
          id?: string
          last_date?: string | null
          published_date?: string
          reference_no?: string | null
          status?: string
          title: string
          ulb_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          file_url?: string | null
          id?: string
          last_date?: string | null
          published_date?: string
          reference_no?: string | null
          status?: string
          title?: string
          ulb_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenders_ulb_id_fkey"
            columns: ["ulb_id"]
            isOneToOne: false
            referencedRelation: "ulbs"
            referencedColumns: ["id"]
          },
        ]
      }
      ulbs: {
        Row: {
          about: string | null
          address: string | null
          area_sqkm: number | null
          code: string | null
          created_at: string
          district: string | null
          email: string | null
          established_year: number | null
          hero_image_url: string | null
          id: string
          is_active: boolean
          logo_url: string | null
          mission: string | null
          name: string
          phone: string | null
          population: number | null
          primary_color: string | null
          slug: string
          state: string | null
          type: string | null
          updated_at: string
          vision: string | null
          website: string | null
        }
        Insert: {
          about?: string | null
          address?: string | null
          area_sqkm?: number | null
          code?: string | null
          created_at?: string
          district?: string | null
          email?: string | null
          established_year?: number | null
          hero_image_url?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          mission?: string | null
          name: string
          phone?: string | null
          population?: number | null
          primary_color?: string | null
          slug: string
          state?: string | null
          type?: string | null
          updated_at?: string
          vision?: string | null
          website?: string | null
        }
        Update: {
          about?: string | null
          address?: string | null
          area_sqkm?: number | null
          code?: string | null
          created_at?: string
          district?: string | null
          email?: string | null
          established_year?: number | null
          hero_image_url?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          mission?: string | null
          name?: string
          phone?: string | null
          population?: number | null
          primary_color?: string | null
          slug?: string
          state?: string | null
          type?: string | null
          updated_at?: string
          vision?: string | null
          website?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "super_admin" | "admin"
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
    Enums: {
      app_role: ["super_admin", "admin"],
    },
  },
} as const
