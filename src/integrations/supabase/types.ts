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
      about: {
        Row: {
          created_at: string
          id: string
          intro: string
          portrait_path: string | null
          transition_copy: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          intro?: string
          portrait_path?: string | null
          transition_copy?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          intro?: string
          portrait_path?: string | null
          transition_copy?: string
          updated_at?: string
        }
        Relationships: []
      }
      healthcare_study: {
        Row: {
          bullets: string[]
          created_at: string
          id: string
          image_path: string | null
          summary: string
          title: string
          updated_at: string
          visible: boolean
        }
        Insert: {
          bullets?: string[]
          created_at?: string
          id?: string
          image_path?: string | null
          summary?: string
          title?: string
          updated_at?: string
          visible?: boolean
        }
        Update: {
          bullets?: string[]
          created_at?: string
          id?: string
          image_path?: string | null
          summary?: string
          title?: string
          updated_at?: string
          visible?: boolean
        }
        Relationships: []
      }
      independent_work: {
        Row: {
          capabilities: string[]
          created_at: string
          description: string
          display_order: number
          featured: boolean
          id: string
          image_path: string | null
          live_url: string | null
          repo_url: string | null
          size_variant: string
          status: string
          title: string
          updated_at: string
          visible: boolean
        }
        Insert: {
          capabilities?: string[]
          created_at?: string
          description?: string
          display_order?: number
          featured?: boolean
          id?: string
          image_path?: string | null
          live_url?: string | null
          repo_url?: string | null
          size_variant?: string
          status?: string
          title: string
          updated_at?: string
          visible?: boolean
        }
        Update: {
          capabilities?: string[]
          created_at?: string
          description?: string
          display_order?: number
          featured?: boolean
          id?: string
          image_path?: string | null
          live_url?: string | null
          repo_url?: string | null
          size_variant?: string
          status?: string
          title?: string
          updated_at?: string
          visible?: boolean
        }
        Relationships: []
      }
      resume: {
        Row: {
          created_at: string
          file_name: string | null
          file_path: string | null
          id: string
          updated_at: string
          uploaded_at: string | null
        }
        Insert: {
          created_at?: string
          file_name?: string | null
          file_path?: string | null
          id?: string
          updated_at?: string
          uploaded_at?: string | null
        }
        Update: {
          created_at?: string
          file_name?: string | null
          file_path?: string | null
          id?: string
          updated_at?: string
          uploaded_at?: string | null
        }
        Relationships: []
      }
      selected_work: {
        Row: {
          category: string
          challenge: string
          contribution: string
          created_at: string
          display_order: number
          evidence_type: string
          featured: boolean
          id: string
          image_path: string | null
          outcome: string
          short_description: string
          slug: string
          tags: string[]
          title: string
          updated_at: string
          visible: boolean
          workflow: string[]
        }
        Insert: {
          category?: string
          challenge?: string
          contribution?: string
          created_at?: string
          display_order?: number
          evidence_type?: string
          featured?: boolean
          id?: string
          image_path?: string | null
          outcome?: string
          short_description?: string
          slug: string
          tags?: string[]
          title: string
          updated_at?: string
          visible?: boolean
          workflow?: string[]
        }
        Update: {
          category?: string
          challenge?: string
          contribution?: string
          created_at?: string
          display_order?: number
          evidence_type?: string
          featured?: boolean
          id?: string
          image_path?: string | null
          outcome?: string
          short_description?: string
          slug?: string
          tags?: string[]
          title?: string
          updated_at?: string
          visible?: boolean
          workflow?: string[]
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          capability_tags: string[]
          contact_email: string
          created_at: string
          cta_primary_href: string
          cta_primary_label: string
          cta_secondary_href: string
          cta_secondary_label: string
          github_url: string
          hero_headline: string
          hero_supporting: string
          id: string
          linkedin_url: string
          location: string
          seo_description: string
          seo_title: string
          updated_at: string
        }
        Insert: {
          capability_tags?: string[]
          contact_email?: string
          created_at?: string
          cta_primary_href?: string
          cta_primary_label?: string
          cta_secondary_href?: string
          cta_secondary_label?: string
          github_url?: string
          hero_headline?: string
          hero_supporting?: string
          id?: string
          linkedin_url?: string
          location?: string
          seo_description?: string
          seo_title?: string
          updated_at?: string
        }
        Update: {
          capability_tags?: string[]
          contact_email?: string
          created_at?: string
          cta_primary_href?: string
          cta_primary_label?: string
          cta_secondary_href?: string
          cta_secondary_label?: string
          github_url?: string
          hero_headline?: string
          hero_supporting?: string
          id?: string
          linkedin_url?: string
          location?: string
          seo_description?: string
          seo_title?: string
          updated_at?: string
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
      visual_work: {
        Row: {
          category: string
          created_at: string
          display_order: number
          id: string
          image_path: string | null
          short_description: string
          title: string
          updated_at: string
          url: string | null
          visible: boolean
        }
        Insert: {
          category?: string
          created_at?: string
          display_order?: number
          id?: string
          image_path?: string | null
          short_description?: string
          title: string
          updated_at?: string
          url?: string | null
          visible?: boolean
        }
        Update: {
          category?: string
          created_at?: string
          display_order?: number
          id?: string
          image_path?: string | null
          short_description?: string
          title?: string
          updated_at?: string
          url?: string | null
          visible?: boolean
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      app_role: "admin"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin"],
    },
  },
} as const